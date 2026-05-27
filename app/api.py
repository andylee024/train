"""Train FastAPI app — SMS shim + admin.

Routes:
  GET  /health
  POST /messages/webhook   inbound Linq SMS
  POST /admin/approve      X-Train-Admin-Secret; flips pending → active + welcome SMS

The agent (app.agent.run_turn) is called in-process. No dispatcher
indirection; same Modal container, same image. Modal serializes inbound
work at the function level (max_containers=1).
"""

from __future__ import annotations

import logging
import os
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse

load_dotenv()

from app.agent import run_turn, user_workdir  # noqa: E402
from app.config import CONFIG  # noqa: E402
from app.linq import send_sms  # noqa: E402
from app.sms_inbox import (  # noqa: E402
    classify_intent,
    is_authorized_sender,
    persist_inbound,
)
from app.sms_parser import handle_inbound as parser_handle_inbound  # noqa: E402
from app.webhook import SeenMessageIds, parse_inbound  # noqa: E402

logging.basicConfig(level=CONFIG.log_level)
log = logging.getLogger(__name__)

app = FastAPI(title="Train", version="0.2.0")

_seen = SeenMessageIds(capacity=4096)


async def _commit_volume() -> None:
    """Persist this container's writes so external tools see them."""
    try:
        import modal

        await modal.Volume.from_name(
            "train-user-state", create_if_missing=False
        ).commit.aio()
    except Exception:  # noqa: BLE001
        log.warning("volume commit failed", exc_info=True)


async def _reload_volume() -> None:
    try:
        import modal

        await modal.Volume.from_name(
            "train-user-state", create_if_missing=False
        ).reload.aio()
    except Exception:  # noqa: BLE001
        log.warning("volume reload failed", exc_info=True)


# ----- Phone helpers ----------------------------------------------------------


def normalize_phone(phone: str) -> str:
    """Strip to digits; this becomes the per-user dir name."""
    digits = "".join(ch for ch in (phone or "") if ch.isdigit() or ch == "+")
    return digits.lstrip("+") or "anon"


def _suffix(phone: str) -> str:
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    return digits[-4:] if digits else "unknown"


# ----- Outbound SMS -----------------------------------------------------------


async def reply_sms(*, to_phone: str, text: str, kind: str = "reply") -> dict:
    text = (text or "").strip()
    if not text:
        return {"sent": False, "reason": "empty"}
    if not CONFIG.linq_api_key or not CONFIG.linq_from_number or not to_phone:
        log.warning("linq skip: configured=%s to_suffix=%s",
                    bool(CONFIG.linq_api_key and CONFIG.linq_from_number), _suffix(to_phone))
        return {"sent": False, "reason": "linq_not_configured"}
    t0 = time.perf_counter()
    result = await send_sms(
        api_base_url=CONFIG.linq_api_base_url,
        api_key=CONFIG.linq_api_key,
        from_number=CONFIG.linq_from_number,
        to_phone=to_phone,
        text=text,
    )
    log.info(
        "linq %s sent=%s to_suffix=%s chars=%d seconds=%.2f",
        kind, result.get("sent"), _suffix(to_phone), len(text),
        time.perf_counter() - t0,
    )
    return result


# ----- Andy notification on intake completion ---------------------------------


async def maybe_notify_andy(user_id: str, sender_phone: str) -> None:
    """When intake.md appears, ping Andy once."""
    base = Path(os.getenv("TRAIN_AGENT_CWD", "/workspace/user"))
    for sub in ("pending", "active"):
        d = base / sub / user_id
        if (d / "intake.md").exists():
            user_dir = d
            break
    else:
        return
    flag = user_dir / ".andy_notified"
    if flag.exists():
        return
    if not CONFIG.andy_phone:
        log.info("intake.md ready user=%s but TRAIN_ANDY_PHONE unset", user_id)
        return
    summary = (user_dir / "intake.md").read_text()
    first_lines = "\n".join(summary.splitlines()[:5])
    body = (
        f"[Train] new intake from +{user_id[-4:]} ({_suffix(sender_phone)}).\n\n"
        f"{first_lines}\n\n"
        f"Review: {user_dir.relative_to(base)}/intake.md  Run /approve when ready."
    )
    await reply_sms(to_phone=CONFIG.andy_phone, text=body, kind="notify_andy")
    flag.write_text("1\n")


# ----- Routes -----------------------------------------------------------------


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "linq_configured": bool(CONFIG.linq_api_key and CONFIG.linq_from_number),
    }


@app.post("/messages/webhook")
async def messages_webhook(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": True, "ignored": "invalid_json"})
    if not isinstance(body, dict):
        return JSONResponse({"ok": True, "ignored": "non_object"})

    parsed = parse_inbound(body)
    if parsed["kind"] != "received":
        log.info("webhook ignored reason=%s", parsed.get("event"))
        return JSONResponse({"ok": True, "ignored": parsed.get("event") or "unknown"})

    mid = parsed["external_message_id"]
    if mid in _seen:
        log.info("webhook deduped message_id=%s", mid)
        return JSONResponse({"ok": True, "deduped": True})
    _seen.add(mid)

    sender_phone = parsed["sender_phone"]
    user_id = normalize_phone(sender_phone)
    log.info(
        "webhook accepted message_id=%s user_id=%s suffix=%s chars=%d",
        mid, user_id, _suffix(sender_phone), len(parsed["text"]),
    )

    reply = await run_turn({
        "trigger": "user_sms",
        "user_id": user_id,
        "payload": {
            "external_message_id": mid,
            "sender_phone": sender_phone,
            "chat_id": parsed["chat_id"],
            "text": parsed["text"],
        },
    })
    await reply_sms(to_phone=sender_phone, text=reply)
    await maybe_notify_andy(user_id, sender_phone)
    await _commit_volume()
    return JSONResponse({"ok": True, "accepted": mid})


@app.post("/sms/inbound")
async def sms_inbound(request: Request) -> JSONResponse:
    """V1 athlete SMS log loop — A24-300/301/302/303.

    Distinct from /messages/webhook (intake-agent loop). This route is
    Andy-only: it parses workout logs / bodyweight pings and writes them
    to Supabase (sms_inbox + exercise_sets / daily_metrics).

    We persist to sms_inbox BEFORE running the parser so a parser blow-up
    never loses data.
    """
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": True, "ignored": "invalid_json"})
    if not isinstance(body, dict):
        return JSONResponse({"ok": True, "ignored": "non_object"})

    parsed = parse_inbound(body)
    if parsed["kind"] != "received":
        return JSONResponse({"ok": True, "ignored": parsed.get("event") or "unknown"})

    mid = parsed["external_message_id"]
    if mid in _seen:
        return JSONResponse({"ok": True, "deduped": True})
    _seen.add(mid)

    sender_phone = parsed["sender_phone"]
    text = parsed["text"]

    if not is_authorized_sender(sender_phone):
        log.info("sms_inbound rejected sender suffix=%s", _suffix(sender_phone))
        await reply_sms(
            to_phone=sender_phone,
            text="Sorry, this number is not configured for logging.",
            kind="reject",
        )
        return JSONResponse({"ok": True, "rejected": "unauthorized_sender"})

    intent = classify_intent(text)
    log.info(
        "sms_inbound message_id=%s intent=%s chars=%d",
        mid, intent, len(text),
    )

    # Persist BEFORE parsing so we never lose data.
    inbox_row = await persist_inbound(
        from_number=sender_phone, body=text, intent=intent,
    )

    # Hand off to the parser (it sends the reply internally).
    try:
        await parser_handle_inbound(inbox_row)
    except Exception as exc:  # noqa: BLE001
        log.exception("sms_inbound parser failed: %s", exc)
        # Don't fail the webhook — the row is in sms_inbox for retry.
        return JSONResponse({"ok": True, "accepted": mid, "parser_error": str(exc)[:200]})

    return JSONResponse({"ok": True, "accepted": mid, "intent": intent})


def _admin_ok(provided: str | None) -> bool:
    expected = CONFIG.admin_secret
    if not provided or not expected or len(provided) != len(expected):
        return False
    diff = 0
    for a, b in zip(provided, expected):
        diff |= ord(a) ^ ord(b)
    return diff == 0


@app.post("/admin/approve")
async def admin_approve(
    request: Request,
    x_train_admin_secret: str | None = Header(default=None),
) -> JSONResponse:
    if not _admin_ok(x_train_admin_secret):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "invalid_json"}, status_code=400)
    phone = (body or {}).get("phone_e164") or (body or {}).get("phone")
    if not phone:
        return JSONResponse({"ok": False, "error": "phone_required"}, status_code=400)

    user_id = normalize_phone(phone)
    if user_id == "anon":
        return JSONResponse({"ok": False, "error": "invalid_phone"}, status_code=400)

    await _reload_volume()  # see any bundle the CLI just uploaded
    # Flip pending → active.
    root = Path(os.getenv("TRAIN_AGENT_CWD", "/workspace/user"))
    pending, active = root / "pending" / user_id, root / "active" / user_id
    if active.exists():
        log.info("approve: already active user_id=%s", user_id)
    elif pending.exists():
        active.parent.mkdir(parents=True, exist_ok=True)
        pending.rename(active)
        log.info("approve: pending→active user_id=%s", user_id)
    else:
        active.mkdir(parents=True, exist_ok=True)
        log.warning("approve: no pending dir, created active user_id=%s", user_id)

    reply = await run_turn({
        "trigger": "activation",
        "user_id": user_id,
        "payload": {"sender_phone": phone},
    })
    send_result = await reply_sms(to_phone=phone, text=reply, kind="activation")
    await _commit_volume()
    return JSONResponse({
        "ok": True,
        "user_id": user_id,
        "reply_chars": len(reply or ""),
        "sms_sent": bool(send_result.get("sent")),
    })
