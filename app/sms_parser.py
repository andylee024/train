"""Parse inbound SMS into structured rows.

Three intents, three paths:

  - bodyweight  → parse a single number → upsert daily_metrics → reply
                  with target-curve gap (A24-303)
  - workout_log → Claude API tool-use → insert into workouts +
                  workout_exercises + exercise_sets → confirmation
                  reply with dashboard link (A24-301, A24-302)
  - help / other → static reply with examples

This module is async and intended to be called AFTER the webhook has
already returned 200 to Linq.

Claude API is invoked directly via httpx (not the Agent SDK) so we get
strict tool-use semantics; the Agent SDK in this repo is used for the
intake conversation, not for one-shot extraction.
"""

from __future__ import annotations

import datetime as _dt
import json
import logging
import os
import re
from typing import Any

import httpx

from app.bundle_reader import nutrition_arc_path
from app.config import CONFIG
from app.sms_inbox import mark_status
from app.sms_session import send_athlete_sms
from app.supabase_client import insert as supabase_insert
from app.supabase_client import select as supabase_select
from app.supabase_client import upsert as supabase_upsert

log = logging.getLogger(__name__)


_ANTHROPIC_API = "https://api.anthropic.com/v1/messages"
_ANTHROPIC_MODEL = os.getenv("TRAIN_PARSER_MODEL", "claude-sonnet-4-6")
_DASHBOARD_BASE = os.getenv("TRAIN_DASHBOARD_URL", "https://train.app")


# ---------------------------------------------------------------------------
# Tool schema for Claude (A24-301)
# ---------------------------------------------------------------------------


LOG_SETS_TOOL = {
    "name": "log_sets",
    "description": (
        "Record a workout the athlete just texted in. Call this once with all "
        "sets parsed from the message. If the message is ambiguous or doesn't "
        "describe a workout at all, call `reject_unparseable` instead."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "workout_date": {
                "type": "string",
                "description": "ISO date (YYYY-MM-DD). Default to today.",
            },
            "session_notes": {
                "type": "string",
                "description": "Free-form notes about the session (optional).",
            },
            "sets": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "exercise_name": {
                            "type": "string",
                            "description": (
                                "Canonical exercise name. Prefer existing names "
                                "from the exercises table (e.g. 'Bench Press', "
                                "'Back Squat', 'Hang Power Clean')."
                            ),
                        },
                        "set_index": {
                            "type": "integer",
                            "description": "1-based set number within this exercise.",
                        },
                        "reps": {"type": "integer"},
                        "weight_value": {"type": "number"},
                        "weight_unit": {
                            "type": "string",
                            "enum": ["lb", "kg", "bw"],
                        },
                        "rpe": {
                            "type": "number",
                            "description": "1-10 RPE if mentioned.",
                        },
                        "duration_seconds": {
                            "type": "integer",
                            "description": "For timed work (e.g. carries, holds).",
                        },
                        "notes": {"type": "string"},
                    },
                    "required": ["exercise_name", "set_index"],
                },
            },
        },
        "required": ["sets"],
    },
}

REJECT_TOOL = {
    "name": "reject_unparseable",
    "description": "Call this when the message doesn't contain a parseable workout log.",
    "input_schema": {
        "type": "object",
        "properties": {
            "reason": {
                "type": "string",
                "description": "Short reason (will be surfaced to athlete).",
            },
        },
        "required": ["reason"],
    },
}


PARSER_SYSTEM_PROMPT = """You parse athlete workout SMS into structured sets.

Rules:
- Expand "5x5 @ 215" into 5 sets of 5 reps at 215 lb (assume lb if no unit).
- Expand varied lines: "squat 240x3 250x2 260x1" → three sets, varying weight.
- "4x4 RPE 7.5" → 4 sets of 4 reps at the stated weight, rpe=7.5.
- If the athlete writes "bench", canonicalize to "Bench Press". Common canonicals:
  squat → Back Squat; bench → Bench Press; dl → Deadlift; ohp → Overhead Press;
  pull-up / pullup → Pull-Up; clean → Hang Power Clean (Andy uses hang variants only);
  snatch → Hang Snatch; rdl/sldl → Stiff-Legged Deadlift; row → Barbell Row.
- If the message has NO numbers, NO sets, and NO recognizable lift → reject_unparseable.
- ALWAYS call exactly one tool. Never reply with prose.
- Default weight_unit to 'lb' for Andy (US lifter).
"""


# ---------------------------------------------------------------------------
# Public entry point — dispatch by intent
# ---------------------------------------------------------------------------


async def handle_inbound(row: dict[str, Any]) -> dict[str, Any]:
    """Process one sms_inbox row. Returns a result dict for logging/tests.

    Side effects:
      - mark_status() updates the row status
      - May insert into exercise_sets / daily_metrics
      - Sends one reply SMS via send_athlete_sms
    """
    row_id = row.get("id") or ""
    intent = row.get("intent") or "other"
    body = (row.get("body") or "").strip()
    from_number = row.get("from_number") or ""

    if intent == "bodyweight":
        return await _handle_bodyweight(row_id=row_id, body=body, from_number=from_number)
    if intent == "help":
        return await _handle_help(row_id=row_id, from_number=from_number)
    # workout_log + other → run Claude
    return await _handle_workout_log(row_id=row_id, body=body, from_number=from_number)


# ---------------------------------------------------------------------------
# Bodyweight path (A24-303)
# ---------------------------------------------------------------------------


_BW_PARSE_RE = re.compile(
    r"^\s*(?:bw|weight|bodyweight\s+)?\s*(?P<n>\d{2,3}(?:\.\d{1,2})?)"
    r"(?:\s+(?P<notes>.+))?\s*$",
    re.IGNORECASE,
)


async def _handle_bodyweight(
    *, row_id: str, body: str, from_number: str
) -> dict[str, Any]:
    m = _BW_PARSE_RE.match(body)
    if not m:
        await mark_status(row_id, status="failed", parse_error="bw_regex_miss")
        await send_athlete_sms(
            to_phone=from_number,
            body="Couldn't read that as a bodyweight. Try 171.4 or 'bw 171.4'.",
            kind="reject",
        )
        return {"ok": False, "intent": "bodyweight", "reason": "regex_miss"}

    bw = float(m.group("n"))
    notes = (m.group("notes") or "").strip() or None
    today = _dt.date.today().isoformat()

    row = {
        "date": today,
        "bodyweight_lb": bw,
        "notes": notes,
    }
    try:
        await supabase_upsert("daily_metrics", row, on_conflict="date", returning=False)
    except RuntimeError as exc:
        await mark_status(row_id, status="failed", parse_error=str(exc)[:300])
        await send_athlete_sms(
            to_phone=from_number,
            body=f"Got {bw} but couldn't save — try again in a minute.",
            kind="reject",
        )
        return {"ok": False, "intent": "bodyweight", "error": str(exc)}

    target, gap = _bw_curve_gap(bw, _dt.date.today())
    reply = _format_bw_reply(bw, target, gap)
    await mark_status(
        row_id,
        status="parsed",
        parse_result={"bodyweight_lb": bw, "notes": notes, "target": target, "gap": gap},
    )
    await send_athlete_sms(to_phone=from_number, body=reply, kind="bw_ack")
    return {"ok": True, "intent": "bodyweight", "bw": bw, "target": target, "gap": gap}


def _format_bw_reply(bw: float, target: float | None, gap: float | None) -> str:
    if target is None or gap is None:
        return f"{bw:g} logged."
    sign = "+" if gap >= 0 else ""
    return f"{bw:g} logged · target {target:g} · {sign}{gap:.1f} lb"


def _bw_curve_gap(bw: float, today: _dt.date) -> tuple[float | None, float | None]:
    """Linear-interpolate target bw from arc.md's curve checkpoints.

    The arc.md curve (Andy's summer 2026 dunk arc):
        Wk 0  → 192 lb   (2026-05-03)
        Wk 6  → 188 lb   (2026-06-14)
        Wk 12 → 185 lb   (2026-07-26)
        Wk 18 → 184.5 lb (2026-09-05)
    """
    # TODO: parse these from nutrition/arc.md instead of hardcoding. For V1
    # we hardcode Andy's curve since that's the only active arc.
    checkpoints = [
        (_dt.date(2026, 5, 3), 192.0),
        (_dt.date(2026, 6, 14), 188.0),
        (_dt.date(2026, 7, 26), 185.0),
        (_dt.date(2026, 9, 5), 184.5),
    ]
    if today <= checkpoints[0][0]:
        target = checkpoints[0][1]
    elif today >= checkpoints[-1][0]:
        target = checkpoints[-1][1]
    else:
        target = None
        for (d0, bw0), (d1, bw1) in zip(checkpoints, checkpoints[1:]):
            if d0 <= today <= d1:
                span_days = (d1 - d0).days
                offset = (today - d0).days
                target = bw0 + (bw1 - bw0) * (offset / span_days)
                break
    if target is None:
        return None, None
    return round(target, 1), round(bw - target, 1)


# ---------------------------------------------------------------------------
# Help path
# ---------------------------------------------------------------------------


_HELP_BODY = (
    "Examples:\n"
    "- 5x5 @ 215 bench\n"
    "- squat 240x3 250x2 260x1\n"
    "- 171.4   (just the number for bodyweight)\n"
    "- bw 171.4 felt heavy\n"
    "I'll confirm what landed."
)


async def _handle_help(*, row_id: str, from_number: str) -> dict[str, Any]:
    await mark_status(row_id, status="parsed", parse_result={"kind": "help"})
    await send_athlete_sms(to_phone=from_number, body=_HELP_BODY, kind="confirmation")
    return {"ok": True, "intent": "help"}


# ---------------------------------------------------------------------------
# Workout log path (A24-301, A24-302)
# ---------------------------------------------------------------------------


async def _handle_workout_log(
    *, row_id: str, body: str, from_number: str
) -> dict[str, Any]:
    await mark_status(row_id, status="parsing")
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        await mark_status(row_id, status="failed", parse_error="anthropic_not_configured")
        return {"ok": False, "intent": "workout_log", "error": "no_api_key"}

    try:
        tool_use = await _call_claude_parser(api_key=api_key, sms_body=body)
    except RuntimeError as exc:
        await mark_status(row_id, status="failed", parse_error=str(exc)[:300])
        await send_athlete_sms(
            to_phone=from_number,
            body="Couldn't parse that — text 'help' for examples.",
            kind="reject",
        )
        return {"ok": False, "intent": "workout_log", "error": str(exc)}

    name = tool_use.get("name")
    args = tool_use.get("input") or {}

    if name == "reject_unparseable":
        reason = (args.get("reason") or "").strip() or "unparseable"
        await mark_status(row_id, status="failed", parse_error=reason)
        await send_athlete_sms(
            to_phone=from_number,
            body="Couldn't parse that — text 'help' for examples.",
            kind="reject",
        )
        return {"ok": False, "intent": "workout_log", "reason": reason}

    if name != "log_sets":
        await mark_status(row_id, status="failed", parse_error=f"unknown_tool:{name}")
        return {"ok": False, "intent": "workout_log", "error": f"unknown_tool:{name}"}

    sets = args.get("sets") or []
    if not sets:
        await mark_status(row_id, status="failed", parse_error="no_sets_returned")
        await send_athlete_sms(
            to_phone=from_number,
            body="Couldn't parse any sets from that. Try '5x5 @ 215 bench'.",
            kind="reject",
        )
        return {"ok": False, "intent": "workout_log", "error": "no_sets"}

    workout_date = args.get("workout_date") or _dt.date.today().isoformat()
    notes = args.get("session_notes")

    try:
        inserted = await _persist_workout(
            workout_date=workout_date, session_notes=notes, sets=sets,
        )
    except RuntimeError as exc:
        await mark_status(row_id, status="failed", parse_error=str(exc)[:300])
        await send_athlete_sms(
            to_phone=from_number,
            body="Parsed it, but the save failed. Re-text in a minute?",
            kind="reject",
        )
        return {"ok": False, "intent": "workout_log", "error": str(exc)}

    await mark_status(
        row_id,
        status="parsed",
        parse_result={"sets": sets, "workout_date": workout_date, "inserted": inserted},
    )
    await send_athlete_sms(
        to_phone=from_number,
        body=_format_confirmation(sets),
        kind="confirmation",
    )
    return {"ok": True, "intent": "workout_log", "sets": len(sets)}


async def _call_claude_parser(*, api_key: str, sms_body: str) -> dict[str, Any]:
    """Call Claude messages API with the two tools. Return the first tool_use block."""
    payload = {
        "model": _ANTHROPIC_MODEL,
        "max_tokens": 1024,
        "system": PARSER_SYSTEM_PROMPT,
        "tools": [LOG_SETS_TOOL, REJECT_TOOL],
        "tool_choice": {"type": "any"},
        "messages": [
            {"role": "user", "content": sms_body},
        ],
    }
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(_ANTHROPIC_API, json=payload, headers=headers)
    if resp.status_code >= 400:
        raise RuntimeError(f"anthropic {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    for block in data.get("content", []):
        if block.get("type") == "tool_use":
            return block
    raise RuntimeError("anthropic returned no tool_use block")


# ---------------------------------------------------------------------------
# Persistence — workouts → workout_exercises → exercise_sets
# ---------------------------------------------------------------------------


async def _resolve_exercise(name: str) -> str:
    """Return exercise_id; create if not present (citext unique on name)."""
    name = (name or "").strip()
    if not name:
        raise RuntimeError("empty exercise name")
    rows = await supabase_select("exercises", columns="id,name", eq={"name": name}, limit=1)
    if rows:
        return rows[0]["id"]
    created = await supabase_insert("exercises", {"name": name}, returning=True)
    if not created:
        raise RuntimeError(f"could not create exercise {name!r}")
    return created[0]["id"]


async def _persist_workout(
    *,
    workout_date: str,
    session_notes: str | None,
    sets: list[dict[str, Any]],
) -> dict[str, int]:
    """Create workout + workout_exercises + exercise_sets rows.

    Strategy: one workout per parser call. Exercises are deduplicated within
    this call (multiple sets of the same lift land under one workout_exercise).
    """
    workout_rows = await supabase_insert(
        "workouts",
        {"performed_at": workout_date, "notes": session_notes},
        returning=True,
    )
    workout_id = workout_rows[0]["id"]

    # Group sets by exercise_name, preserving first-seen order for order_index.
    by_exercise: dict[str, list[dict[str, Any]]] = {}
    order: list[str] = []
    for s in sets:
        ex = (s.get("exercise_name") or "").strip()
        if not ex:
            continue
        if ex not in by_exercise:
            by_exercise[ex] = []
            order.append(ex)
        by_exercise[ex].append(s)

    total_sets = 0
    for idx, ex in enumerate(order, start=1):
        exercise_id = await _resolve_exercise(ex)
        we_rows = await supabase_insert(
            "workout_exercises",
            {
                "workout_id": workout_id,
                "exercise_id": exercise_id,
                "order_index": idx,
            },
            returning=True,
        )
        we_id = we_rows[0]["id"]

        # Renumber set_index inside this exercise group.
        for set_no, s in enumerate(by_exercise[ex], start=1):
            row = {
                "workout_exercise_id": we_id,
                "set_index": set_no,
                "reps": s.get("reps"),
                "duration_seconds": s.get("duration_seconds"),
                "weight_value": s.get("weight_value"),
                "weight_unit": s.get("weight_unit") or ("lb" if s.get("weight_value") else None),
                "rpe": s.get("rpe"),
                "notes": s.get("notes"),
            }
            # Drop Nones so PostgREST takes column defaults / nulls.
            row = {k: v for k, v in row.items() if v is not None}
            await supabase_insert("exercise_sets", row, returning=False)
            total_sets += 1

    return {"workout_id_hash": hash(workout_id) & 0xFFFFFFFF, "exercises": len(order), "sets": total_sets}


def _format_confirmation(sets: list[dict[str, Any]]) -> str:
    """Format the 'Got it ✓ logged …' SMS.

    Style:
      - One exercise, uniform sets: "Got it logged 5x5 of Bench Press @ 215 lb"
      - One exercise, varied: "Got it Back Squat: 240x3, 250x2, 260x1"
      - Multi-exercise: "Got it: Bench 5x5 @ 215; Back Squat 240x3 250x2 260x1"
    """
    if not sets:
        return "Got it (no sets)."
    by_ex: dict[str, list[dict[str, Any]]] = {}
    order: list[str] = []
    for s in sets:
        ex = (s.get("exercise_name") or "").strip()
        if ex not in by_ex:
            by_ex[ex] = []
            order.append(ex)
        by_ex[ex].append(s)

    parts: list[str] = []
    for ex in order:
        sl = by_ex[ex]
        weights = {s.get("weight_value") for s in sl}
        reps = {s.get("reps") for s in sl}
        unit = (sl[0].get("weight_unit") or "lb")
        if len(sl) > 1 and len(weights) == 1 and len(reps) == 1:
            w = next(iter(weights))
            r = next(iter(reps))
            w_str = f" @ {w:g} {unit}" if w else ""
            parts.append(f"{ex} {len(sl)}x{r}{w_str}")
        else:
            chunks = []
            for s in sl:
                r = s.get("reps")
                w = s.get("weight_value")
                if w and r:
                    chunks.append(f"{w:g}x{r}")
                elif r:
                    chunks.append(f"x{r}")
                elif w:
                    chunks.append(f"{w:g}")
            parts.append(f"{ex}: " + ", ".join(chunks))

    link = _confirmation_link(order[0]) if order else _DASHBOARD_BASE
    return "Got it " + " · ".join(parts) + f" · view: {link}"


def _confirmation_link(exercise_name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", exercise_name.lower()).strip("-")
    return f"{_DASHBOARD_BASE.rstrip('/')}/progress/{slug}"


__all__ = [
    "LOG_SETS_TOOL",
    "PARSER_SYSTEM_PROMPT",
    "REJECT_TOOL",
    "handle_inbound",
]
