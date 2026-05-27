"""SMS inbox: persist inbound webhook payloads + intent classification.

A24-300 says "Twilio webhook" — we use Linq (the existing gateway) instead
since that's what's already wired into app/api.py + app/webhook.py.

This module is the bridge between webhook acceptance (api.py) and the
parser (sms_parser.py):

    api.py /messages/webhook
        → parse_inbound (app/webhook.py)        # normalize Linq shape
        → persist_inbound (this module)         # write sms_inbox row
        → classify_intent (this module)         # workout_log | bodyweight | other
        → sms_parser.handle_inbound(row)        # update status + side effects

We persist BEFORE parsing so a parser exception never loses data.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from app.config import CONFIG
from app.supabase_client import insert as supabase_insert
from app.supabase_client import update as supabase_update

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Sender gate
# ---------------------------------------------------------------------------


def _normalize_phone(phone: str) -> str:
    """Strip non-digit chars; keep leading +."""
    if not phone:
        return ""
    cleaned = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    return cleaned


def is_authorized_sender(from_number: str) -> bool:
    """V1: only Andy's number is allowed (single-athlete).

    Compares digit-suffixes to tolerate +1 vs no-prefix.
    """
    expected = _normalize_phone(CONFIG.andy_phone)
    actual = _normalize_phone(from_number)
    if not expected or not actual:
        return False
    return actual.lstrip("+").endswith(expected.lstrip("+")[-10:])


# ---------------------------------------------------------------------------
# Intent classifier (rule-based, fast — pre-parser triage)
# ---------------------------------------------------------------------------


_BW_PURE_RE = re.compile(r"^\s*(?P<n>\d{2,3}(?:\.\d{1,2})?)\s*$")
_BW_KEYWORD_RE = re.compile(
    r"^\s*(?:bw|weight|bodyweight)\s+(?P<n>\d{2,3}(?:\.\d{1,2})?)\b",
    re.IGNORECASE,
)
_HELP_RE = re.compile(r"^\s*(?:help|\?|menu|wtf)\s*$", re.IGNORECASE)

# Workout-log heuristic: contains 'x' or '×' with digits, OR an @ with a number,
# OR a known lift keyword.
_LIFT_HINT_RE = re.compile(
    r"(squat|bench|deadlift|press|row|curl|jerk|snatch|clean|pull[- ]?up|"
    r"dip|lunge|split|rdl|sldl|ohp|push press|jump|sprint|carry|"
    r"\d+\s*[x×]\s*\d+|\d+\s*@\s*\d+|@\s*\d+\s*lb)",
    re.IGNORECASE,
)


def classify_intent(text: str) -> str:
    """Return one of:
        'bodyweight' — single number or 'bw <n>'
        'help'       — help/menu request
        'workout_log' — looks like sets/reps
        'other'      — fallback (still parsed by Claude as workout_log attempt)
    """
    if not text:
        return "other"
    if _BW_PURE_RE.match(text) or _BW_KEYWORD_RE.match(text):
        return "bodyweight"
    if _HELP_RE.match(text):
        return "help"
    if _LIFT_HINT_RE.search(text):
        return "workout_log"
    return "other"


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------


async def persist_inbound(
    *,
    from_number: str,
    body: str,
    intent: str | None = None,
) -> dict[str, Any]:
    """Insert into sms_inbox; return the inserted row.

    Always returns within ms — webhook path must ack Linq within 200ms,
    so we DO NOT trigger the parser from here; the caller does that
    after returning the 200.
    """
    row = {
        "from_number": from_number,
        "body": body,
        "intent": intent or classify_intent(body),
        "status": "received",
    }
    rows = await supabase_insert("sms_inbox", row, returning=True)
    return rows[0] if rows else row


async def mark_status(
    row_id: str,
    *,
    status: str,
    parse_result: dict | None = None,
    parse_error: str | None = None,
) -> None:
    patch: dict[str, Any] = {"status": status}
    if parse_result is not None:
        patch["parse_result"] = parse_result
    if parse_error is not None:
        patch["parse_error"] = parse_error
    try:
        await supabase_update("sms_inbox", patch, eq={"id": row_id})
    except RuntimeError as exc:
        log.warning("mark_status failed id=%s status=%s: %s", row_id, status, exc)


__all__ = [
    "classify_intent",
    "is_authorized_sender",
    "mark_status",
    "persist_inbound",
]
