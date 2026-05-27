"""Block retro cron — A24-305.

Runs daily at 7:00 AM PT. No-op unless today is the last day of an
active block. When triggered:

  1. Pull the block markdown (goals, purpose, prescribed work)
  2. Pull all sessions + BW entries in [block_start, block_end] from Supabase
  3. Render goal-by-goal verdicts via Claude (digest_renderer.render_block_retro)
  4. Send SMS short summary + persist full retro to block_retros
  5. (Email delivery: TODO — same Modal-mailer gap as Sunday digest)

Status: the block markdown does NOT currently include explicit start/end
dates in a parseable header, so block_ending_today() in bundle_reader.py
returns None until that's added. The function is fully implemented for
when those dates land; meanwhile this cron is a no-op.

# TODO: extend the plan-training-arc generator to write a 'Date Range:' line
# into each block file (e.g. '## Block Header\\nDate Range: May 3 – Jun 14, 2026').
"""

from __future__ import annotations

import asyncio
import datetime as _dt
import logging
import zoneinfo
from typing import Any

from app.bundle_reader import ACTIVE_ARC_SLUG, block_ending_today
from app.digest_renderer import render_block_retro
from app.sms_session import andy_phone, send_athlete_sms
from app.supabase_client import insert as supabase_insert
from app.supabase_client import select as supabase_select

log = logging.getLogger(__name__)


def _today_pt() -> _dt.date:
    return _dt.datetime.now(zoneinfo.ZoneInfo("America/Los_Angeles")).date()


async def _pull_block_metrics(start: _dt.date, end: _dt.date) -> dict[str, Any]:
    """Pull workouts + bw across the block window."""
    metrics: dict[str, Any] = {
        "block_start": start.isoformat(),
        "block_end": end.isoformat(),
    }
    try:
        workouts = await supabase_select(
            "workouts",
            columns="id,performed_at,notes",
            gte={"performed_at": start.isoformat()},
            lte={"performed_at": end.isoformat()},
            order="performed_at.asc",
            limit=200,
        )
        metrics["workouts_count"] = len(workouts)
        metrics["workouts"] = workouts
    except RuntimeError as exc:
        log.warning("retro: workouts pull failed: %s", exc)

    try:
        bw = await supabase_select(
            "daily_metrics",
            columns="date,bodyweight_lb,notes",
            gte={"date": start.isoformat()},
            lte={"date": end.isoformat()},
            order="date.asc",
            limit=200,
        )
        metrics["bw_entries"] = bw
        bw_vals = [r["bodyweight_lb"] for r in bw if r.get("bodyweight_lb") is not None]
        if bw_vals:
            metrics["bw_start"] = bw_vals[0]
            metrics["bw_end"] = bw_vals[-1]
            metrics["bw_delta"] = round(bw_vals[-1] - bw_vals[0], 2)
    except RuntimeError as exc:
        log.warning("retro: bw pull failed: %s", exc)

    return metrics


async def run_block_retro(*, override_today: _dt.date | None = None) -> dict[str, Any]:
    """Detect end-of-block; if so, render + send retro."""
    today = override_today or _today_pt()
    block = block_ending_today(today)
    if block is None:
        return {"ok": True, "skipped": "no_block_ending_today", "date": today.isoformat()}

    # Idempotency: don't double-process a block.
    try:
        existing = await supabase_select(
            "block_retros",
            columns="id",
            eq={"block_slug": block.slug},
            limit=1,
        )
        if existing:
            return {"ok": True, "skipped": "already_generated", "block_slug": block.slug}
    except RuntimeError as exc:
        log.warning("retro: existence check failed: %s", exc)

    if not block.start_date or not block.end_date:
        log.warning("retro: block %s has no start/end dates; aborting", block.slug)
        return {"ok": False, "error": "block_missing_dates", "block_slug": block.slug}

    metrics = await _pull_block_metrics(block.start_date, block.end_date)
    block_payload = {
        "slug": block.slug,
        "title": block.title,
        "goals": block.goals,
        "purpose": block.purpose,
        "start_date": block.start_date.isoformat(),
        "end_date": block.end_date.isoformat(),
    }
    # TODO: build "comparisons" — prescribed work vs actuals. Requires
    # parsing each week file's exercises and joining with exercise_sets.
    # For V1 we pass an empty dict; the renderer still produces a useful
    # retro from goals + metrics + observations.
    comparisons: dict[str, Any] = {"note": "prescribed-vs-actual diff TODO"}

    try:
        rendered = await render_block_retro(
            block=block_payload, metrics=metrics, comparisons=comparisons
        )
    except RuntimeError as exc:
        log.error("retro: render failed: %s", exc)
        return {"ok": False, "error": str(exc)}

    try:
        await supabase_insert(
            "block_retros",
            {
                "block_slug": block.slug,
                "athlete_slug": "andy",
                "arc_slug": ACTIVE_ARC_SLUG,
                "block_start": block.start_date.isoformat(),
                "block_end": block.end_date.isoformat(),
                "goal_verdicts": rendered.get("goal_verdicts"),
                "observations": rendered.get("observations"),
                "next_block_adjustments": rendered.get("next_block_adjustments"),
                "sms_summary": rendered.get("sms_summary"),
                "email_body": rendered.get("email_body"),
            },
            returning=False,
        )
    except RuntimeError as exc:
        log.warning("retro: persist failed: %s", exc)

    to_phone = andy_phone()
    if to_phone and rendered.get("sms_summary"):
        await send_athlete_sms(
            to_phone=to_phone,
            body=rendered["sms_summary"],
            kind="block_retro",
            dedup_key=block.slug,
        )

    return {"ok": True, "block_slug": block.slug, "end": block.end_date.isoformat()}


def main() -> None:
    asyncio.run(run_block_retro())


__all__ = ["main", "run_block_retro"]
