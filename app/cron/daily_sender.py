"""Daily SMS sender — A24-299.

Cron: 6:30 AM PT every day. Modal cron uses UTC, so we register it for
13:30 UTC during PDT (UTC-7). During PST (UTC-8) it fires at 5:30 AM
local — acceptable drift for V1; revisit when we add a tz-aware scheduler.

Pseudocode:
    today = today in PT
    section = find_today_session(today)  # reads current-week.md
    if section:
        body = format_session_sms(section)
        kind = "daily_session"
    else:
        body = format_rest_day_sms(today)
        kind = "daily_session"   # still dedup'd; we don't double-send rest pings
    send_athlete_sms(..., dedup_key=today.isoformat())

Idempotency: dedup_key=date guarantees re-running on the same day is a no-op.
"""

from __future__ import annotations

import asyncio
import datetime as _dt
import logging
import zoneinfo
from typing import Any

from app.bundle_reader import find_today_session
from app.sms_session import andy_phone, format_rest_day_sms, format_session_sms, send_athlete_sms

log = logging.getLogger(__name__)


def _today_pt() -> _dt.date:
    return _dt.datetime.now(zoneinfo.ZoneInfo("America/Los_Angeles")).date()


async def run_daily_send() -> dict[str, Any]:
    today = _today_pt()
    section = find_today_session(today)
    if section is not None:
        body = format_session_sms(section)
        kind_label = "session"
    else:
        body = format_rest_day_sms(today)
        kind_label = "rest"

    to_phone = andy_phone()
    if not to_phone:
        log.warning("daily_sender: TRAIN_ANDY_PHONE not set; skipping")
        return {"ok": False, "reason": "no_recipient"}

    result = await send_athlete_sms(
        to_phone=to_phone,
        body=body,
        kind="daily_session",
        dedup_key=today.isoformat(),
    )
    log.info("daily_sender result=%s label=%s date=%s", result, kind_label, today)
    return {"ok": True, "kind": kind_label, "result": result, "date": today.isoformat()}


def main() -> None:
    """Entrypoint for `modal run app/cron/daily_sender.py::main`."""
    asyncio.run(run_daily_send())


__all__ = ["main", "run_daily_send"]
