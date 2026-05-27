"""SMS formatting helpers + reusable Linq send wrapper.

Two things live here:

  1. format_session_sms(day) — turn a DaySection from bundle_reader into
     an SMS body. Strips markdown (** bold), keeps numbered exercise lines,
     trims to a reasonable length.

  2. send_athlete_sms(...) — wraps app.linq.send_sms, logs to sms_sent
     (idempotent on (kind, dedup_key)), and surfaces config errors as
     dict returns rather than exceptions.

Used by:
  - app/cron/daily_sender.py     (kind='daily_session')
  - app/sms_parser.py            (kind='confirmation' | 'bw_ack' | 'reject')
  - app/cron/sunday_digest.py    (kind='sunday_digest')
  - app/cron/block_retro.py      (kind='block_retro')
"""

from __future__ import annotations

import logging
import os
import re
from typing import Any

from app.bundle_reader import DaySection
from app.config import CONFIG
from app.linq import send_sms
from app.supabase_client import insert as supabase_insert

log = logging.getLogger(__name__)


_MAX_SMS_CHARS = 1400  # ~9 segments; Linq splits automatically.


# ---------------------------------------------------------------------------
# Formatting
# ---------------------------------------------------------------------------


def _strip_md(text: str) -> str:
    """Strip the markdown patterns that appear in current-week.md.

    Carrier rendering for ** bold ** and [link](url) is inconsistent; flatten
    to plain text so the athlete sees the same thing on every device.
    """
    # **bold** → bold
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    # *italic* / _italic_ → plain
    text = re.sub(r"(?<!\*)\*(?!\*)([^*]+)\*(?!\*)", r"\1", text)
    text = re.sub(r"(?<!_)_([^_]+)_(?!_)", r"\1", text)
    # [text](url) → text (url)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    # Backticks
    text = text.replace("`", "")
    return text


def _exercise_lines(body: str) -> list[str]:
    """Pull out the numbered exercise lines (top-level enumerations).

    A current-week.md day body looks like:

        1. **[DNT]** Muscle Snatch: 6×2 @ 80% (≈115 lb …)
        2. **[ARC]** Bench Press: 4×6 → 4×5 @ 77% (175 lb)
        ...
        ### Cool-down (4 min)
        6. Internal Rotation in 90-Sit: 2×10/side …

    We want main lifts only — stop at the first '###' subsection header.
    """
    lines: list[str] = []
    for raw in body.splitlines():
        if raw.startswith("### "):
            break
        m = re.match(r"^(\d+)\.\s+(.+)$", raw.strip())
        if m:
            lines.append(f"{m.group(1)}. {_strip_md(m.group(2))}")
    return lines


def format_session_sms(day: DaySection) -> str:
    """Format today's session as a plain-SMS body.

    Example output:

        Today — Mon May 26 · Upper Horizontal + DNT accessories

        1. Bench Press: 4×6 → 4×5 @ 77% (175 lb)
        2. Barbell Row: 4×6 @ 170 lb
        3. DB Incline Bench (neutral): 3×6-8 @ 55 lb
        4. T-Bar Chest-Supported Row: 3×6-8 @ Mod-Hvy
        5. Triceps Extension: 4×10 @ Mod
        6. Side Bends: 4×10 @ 25 lb DB

        Log when done — text the sets back.
    """
    date_str = day.date.strftime("%a %b %-d") if hasattr(day.date, "strftime") else str(day.date)
    title = _strip_md(day.title).strip()
    header = f"Today — {date_str} · {title}"
    lines = _exercise_lines(day.body)
    body = "\n".join(lines) if lines else "(no exercises detected — see bundle)"
    footer = "Log when done — text the sets back."
    sms = f"{header}\n\n{body}\n\n{footer}"
    if len(sms) > _MAX_SMS_CHARS:
        sms = sms[: _MAX_SMS_CHARS - 3] + "..."
    return sms


def format_rest_day_sms(date: Any) -> str:
    date_str = date.strftime("%a %b %-d") if hasattr(date, "strftime") else str(date)
    return f"{date_str} — rest day. Nothing scheduled. (If you train, text the sets and I'll log them.)"


# ---------------------------------------------------------------------------
# Send wrapper
# ---------------------------------------------------------------------------


async def send_athlete_sms(
    *,
    to_phone: str,
    body: str,
    kind: str,
    dedup_key: str | None = None,
    persist: bool = True,
) -> dict[str, Any]:
    """Send + log to sms_sent.

    dedup_key: when set, a unique-violation on (kind, dedup_key) means we
    already sent this — we swallow the error and return {"sent": False,
    "reason": "duplicate"}. Used by daily-session cron (key=date) and
    digest cron (key=week_start).
    """
    body = (body or "").strip()
    if not body:
        return {"sent": False, "reason": "empty"}
    if not to_phone:
        return {"sent": False, "reason": "no_recipient"}

    if not CONFIG.linq_api_key or not CONFIG.linq_from_number:
        log.warning("send_athlete_sms: linq not configured (kind=%s)", kind)
        return {"sent": False, "reason": "linq_not_configured"}

    result = await send_sms(
        api_base_url=CONFIG.linq_api_base_url,
        api_key=CONFIG.linq_api_key,
        from_number=CONFIG.linq_from_number,
        to_phone=to_phone,
        text=body,
    )

    if persist:
        row = {
            "to_number": to_phone,
            "body": body,
            "kind": kind,
            "dedup_key": dedup_key,
            "linq_message_id": result.get("message_id"),
            "linq_status": result.get("status"),
            "linq_error": result.get("error") or result.get("reason"),
        }
        try:
            await supabase_insert("sms_sent", row, returning=False)
        except RuntimeError as exc:
            # Unique-violation = we already sent this kind+dedup_key today.
            msg = str(exc).lower()
            if "23505" in msg or "duplicate" in msg or "unique" in msg:
                log.info(
                    "send_athlete_sms: dedup hit kind=%s dedup_key=%s — skipping",
                    kind, dedup_key,
                )
                return {"sent": False, "reason": "duplicate"}
            log.warning("send_athlete_sms: log to sms_sent failed: %s", exc)

    return result


def andy_phone() -> str:
    return os.getenv("TRAIN_ANDY_PHONE", "") or CONFIG.andy_phone


__all__ = [
    "andy_phone",
    "format_rest_day_sms",
    "format_session_sms",
    "send_athlete_sms",
]
