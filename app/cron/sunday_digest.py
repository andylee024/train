"""Sunday digest cron — A24-304.

Cron: Sundays at 7:00 AM PT (14:00 UTC during PDT).

Flow:
    1. metrics = pull_week_metrics(last_7_days)        from Supabase
    2. plan_context = read_next_7_days_from_bundle()   from current-week.md (next wk)
    3. digest = digest_renderer.render_weekly_digest(...)
    4. send SMS short version (idempotent on week_start)
    5. persist to weekly_digests
    6. (email TODO — Modal mail / SendGrid not yet wired)
"""

from __future__ import annotations

import asyncio
import datetime as _dt
import logging
import zoneinfo
from typing import Any

from app.bundle_reader import (
    ACTIVE_ARC_SLUG,
    current_week_path,
    find_today_session,
)
from app.digest_renderer import render_weekly_digest
from app.sms_session import andy_phone, send_athlete_sms
from app.supabase_client import insert as supabase_insert
from app.supabase_client import select as supabase_select

log = logging.getLogger(__name__)


def _today_pt() -> _dt.date:
    return _dt.datetime.now(zoneinfo.ZoneInfo("America/Los_Angeles")).date()


def _week_start(today: _dt.date) -> _dt.date:
    """Sunday of the upcoming week. The digest is delivered Sunday morning
    *for* the week that starts today.
    """
    days_until_sun = (6 - today.weekday()) % 7  # weekday(): Mon=0..Sun=6
    return today + _dt.timedelta(days=days_until_sun)


async def _pull_week_metrics(end: _dt.date) -> dict[str, Any]:
    """Pull last-7-days workout + bw data from Supabase.

    Returns a flat dict the renderer can read. Tolerant of missing tables —
    a partial dict still yields a useful digest.
    """
    start = end - _dt.timedelta(days=7)
    metrics: dict[str, Any] = {
        "window_start": start.isoformat(),
        "window_end": end.isoformat(),
    }
    try:
        workouts = await supabase_select(
            "workouts",
            columns="id,performed_at,notes",
            gte={"performed_at": start.isoformat()},
            lte={"performed_at": end.isoformat()},
            order="performed_at.desc",
            limit=50,
        )
        metrics["workouts_count"] = len(workouts)
        metrics["workouts"] = workouts
    except RuntimeError as exc:
        log.warning("digest: workouts pull failed: %s", exc)
        metrics["workouts_count"] = None

    try:
        bw = await supabase_select(
            "daily_metrics",
            columns="date,bodyweight_lb,notes",
            gte={"date": start.isoformat()},
            lte={"date": end.isoformat()},
            order="date.desc",
            limit=14,
        )
        metrics["bw_entries"] = bw
        if bw:
            vals = [r["bodyweight_lb"] for r in bw if r.get("bodyweight_lb") is not None]
            metrics["bw_avg"] = round(sum(vals) / len(vals), 2) if vals else None
            metrics["bw_latest"] = bw[0].get("bodyweight_lb")
    except RuntimeError as exc:
        log.warning("digest: bw pull failed: %s", exc)

    # TODO: PR detection (highest weight_kg per exercise in window) — add
    # once we agree on a "PR" definition (current heaviest 1RM-equivalent?).
    return metrics


def _read_plan_context() -> dict[str, Any]:
    """Lightweight snapshot of the upcoming week from current-week.md."""
    path = current_week_path()
    if not path.exists():
        return {"upcoming_week_path": str(path), "note": "current-week.md missing"}
    text = path.read_text()
    # First 60 lines is enough for the renderer to see the header + day overview.
    head = "\n".join(text.splitlines()[:60])
    return {"upcoming_week_excerpt": head, "arc_slug": ACTIVE_ARC_SLUG}


async def run_sunday_digest(*, force: bool = False) -> dict[str, Any]:
    today = _today_pt()
    week_start = _week_start(today)

    # Idempotency: check if already generated this week_start.
    if not force:
        try:
            existing = await supabase_select(
                "weekly_digests",
                columns="id",
                eq={"week_start": week_start.isoformat()},
                limit=1,
            )
            if existing:
                log.info("digest: already generated for %s", week_start)
                return {"ok": True, "skipped": "already_generated", "week_start": week_start.isoformat()}
        except RuntimeError as exc:
            log.warning("digest: existence check failed: %s", exc)

    metrics = await _pull_week_metrics(today)
    plan_context = _read_plan_context()

    try:
        rendered = await render_weekly_digest(metrics=metrics, plan_context=plan_context)
    except RuntimeError as exc:
        log.error("digest: render failed: %s", exc)
        return {"ok": False, "error": str(exc)}

    sms_summary = (rendered.get("sms_summary") or "").strip()
    email_body = (rendered.get("email_body") or "").strip()

    # Persist first; if SMS fails, the digest is still recorded for /review.
    try:
        await supabase_insert(
            "weekly_digests",
            {
                "week_start": week_start.isoformat(),
                "athlete_slug": "andy",
                "arc_slug": ACTIVE_ARC_SLUG,
                "sms_summary": sms_summary,
                "email_body": email_body,
                "metrics": metrics,
            },
            returning=False,
        )
    except RuntimeError as exc:
        log.warning("digest: persist failed: %s", exc)

    to_phone = andy_phone()
    if to_phone and sms_summary:
        await send_athlete_sms(
            to_phone=to_phone,
            body=sms_summary,
            kind="sunday_digest",
            dedup_key=week_start.isoformat(),
        )

    # TODO: email delivery. Modal can ship via SendGrid or Resend; pick one
    # and wire it. For V1 the email_body is persisted in weekly_digests so
    # the dashboard /review page can render it server-side.
    return {
        "ok": True,
        "week_start": week_start.isoformat(),
        "sms_chars": len(sms_summary),
        "email_chars": len(email_body),
    }


def main() -> None:
    asyncio.run(run_sunday_digest())


__all__ = ["main", "run_sunday_digest"]
