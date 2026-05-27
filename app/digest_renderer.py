"""Render the Sunday weekly digest + end-of-block retro via Claude.

Two public entry points:

  render_weekly_digest(metrics, plan_context) -> {sms, email}
  render_block_retro(block, metrics, comparisons) -> {sms, email, goal_verdicts}

Both are TEMPLATE-SHAPED — we ask Claude to fill specific slots so the
output structure is predictable. Used by cron jobs in app/cron/*.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import httpx

log = logging.getLogger(__name__)

_ANTHROPIC_API = "https://api.anthropic.com/v1/messages"
_MODEL = os.getenv("TRAIN_DIGEST_MODEL", "claude-sonnet-4-6")


# ---------------------------------------------------------------------------
# Tool schemas: forcing structured outputs
# ---------------------------------------------------------------------------


_WEEKLY_TOOL = {
    "name": "emit_weekly_digest",
    "description": "Emit the Sunday weekly digest in the required shape.",
    "input_schema": {
        "type": "object",
        "properties": {
            "sms_summary": {
                "type": "string",
                "description": (
                    "SMS body, ≤500 chars. 5-7 bullets max. Plain text, no markdown. "
                    "Cover: completed/planned ratio, top PR if any, any stalled lift, "
                    "BW status vs target, next-week focus."
                ),
            },
            "email_body": {
                "type": "string",
                "description": "Longer markdown version with sections + dashboard links.",
            },
        },
        "required": ["sms_summary", "email_body"],
    },
}


_RETRO_TOOL = {
    "name": "emit_block_retro",
    "description": "Emit the end-of-block retro in the required shape.",
    "input_schema": {
        "type": "object",
        "properties": {
            "goal_verdicts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "goal_id": {"type": "string"},
                        "goal_text": {"type": "string"},
                        "verdict": {"type": "string", "enum": ["hit", "partial", "miss"]},
                        "evidence": {"type": "string"},
                    },
                    "required": ["goal_id", "verdict", "evidence"],
                },
            },
            "observations": {"type": "string"},
            "next_block_adjustments": {
                "type": "string",
                "description": "Concrete suggestions (e.g. 'drop FS volume 10%').",
            },
            "sms_summary": {"type": "string", "description": "≤300 chars."},
            "email_body": {"type": "string", "description": "Full retro in markdown."},
        },
        "required": [
            "goal_verdicts",
            "observations",
            "next_block_adjustments",
            "sms_summary",
            "email_body",
        ],
    },
}


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------


async def render_weekly_digest(
    *, metrics: dict[str, Any], plan_context: dict[str, Any]
) -> dict[str, Any]:
    """Return {sms_summary, email_body}.

    metrics: numbers pulled from Supabase (PRs, sessions completed, bw deltas)
    plan_context: upcoming week pulled from bundle (block phase, key sessions)
    """
    user_payload = json.dumps(
        {"metrics": metrics, "next_week": plan_context}, indent=2, default=str
    )
    system = (
        "You are Train's Sunday-morning coach. Write a tight weekly digest based "
        "on the supplied JSON. Be specific (cite numbers). No fluff, no hedging. "
        "Always call the emit_weekly_digest tool — never reply with prose."
    )
    return await _call_anthropic_tool(
        system=system, user=user_payload, tool=_WEEKLY_TOOL
    )


async def render_block_retro(
    *,
    block: dict[str, Any],
    metrics: dict[str, Any],
    comparisons: dict[str, Any],
) -> dict[str, Any]:
    """Return {goal_verdicts, observations, next_block_adjustments, sms_summary, email_body}."""
    user_payload = json.dumps(
        {"block": block, "metrics": metrics, "comparisons": comparisons},
        indent=2,
        default=str,
    )
    system = (
        "You are Train's end-of-block coach. Verdicts must be ONE of hit/partial/miss "
        "with a 1-sentence numeric evidence string. Next-block adjustments must be "
        "concrete and actionable (e.g. 'drop FS volume 10%, add band complexes'). "
        "Always call emit_block_retro — never reply with prose."
    )
    return await _call_anthropic_tool(
        system=system, user=user_payload, tool=_RETRO_TOOL
    )


# ---------------------------------------------------------------------------
# Anthropic call
# ---------------------------------------------------------------------------


async def _call_anthropic_tool(
    *, system: str, user: str, tool: dict[str, Any]
) -> dict[str, Any]:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")
    payload = {
        "model": _MODEL,
        "max_tokens": 4096,
        "system": system,
        "tools": [tool],
        "tool_choice": {"type": "tool", "name": tool["name"]},
        "messages": [{"role": "user", "content": user}],
    }
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(_ANTHROPIC_API, json=payload, headers=headers)
    if resp.status_code >= 400:
        raise RuntimeError(f"anthropic {resp.status_code}: {resp.text[:500]}")
    data = resp.json()
    for block in data.get("content", []):
        if block.get("type") == "tool_use" and block.get("name") == tool["name"]:
            return block.get("input") or {}
    raise RuntimeError(f"anthropic returned no tool_use for {tool['name']}")


__all__ = ["render_block_retro", "render_weekly_digest"]
