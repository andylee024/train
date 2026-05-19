"""Train agent — Claude Agent SDK loop with per-user CLAUDE.md memory.

One coroutine: run_turn(envelope) -> reply_text.

Per-user state lives at /workspace/user/{pending,active}/{user_id}/:
  CLAUDE.md   — durable facts (auto-loaded by the SDK from cwd)
  .session_id — SDK resume token; loaded on next turn
  intake.md   — written by the agent during intake phase
  bundle/     — arc materials, dropped by /admin/approve (active phase)

Envelope: {"trigger": "user_sms"|"activation", "user_id": str, "payload": dict}
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import claude_agent_sdk

from app.prompts import build_system_prompt


ALLOWED_TOOLS = ["Read", "Write", "Edit"]
DEFAULT_MODEL = "claude-sonnet-4-6"
SESSION_FILE = ".session_id"
MAX_TURNS = 25

_CLAUDE_MD_STUB = (
    "# Per-user memory — Train agent\n\n"
    "Update this file when you learn something durable about the athlete "
    "(name, goal, injuries, preferences). Keep it tight — no SMS transcripts.\n"
)


def _state_root() -> Path:
    return Path(os.getenv("TRAIN_AGENT_CWD", "/workspace/user"))


def user_workdir(user_id: str) -> tuple[Path, str]:
    """Return (user_dir, phase). Picks active/ if it exists, else pending/.

    Creates pending/{user_id}/ + bootstraps CLAUDE.md if neither exists.
    Phase ∈ {intake, active}.
    """
    root = _state_root()
    active = root / "active" / user_id
    pending = root / "pending" / user_id

    if active.exists():
        user_dir, phase = active, "active"
    elif pending.exists():
        user_dir, phase = pending, "intake"
    else:
        pending.mkdir(parents=True, exist_ok=True)
        user_dir, phase = pending, "intake"

    claude_md = user_dir / "CLAUDE.md"
    if not claude_md.exists():
        claude_md.write_text(_CLAUDE_MD_STUB)
    return user_dir, phase


def _read_resume(user_dir: Path) -> str | None:
    f = user_dir / SESSION_FILE
    if not f.exists():
        return None
    sid = f.read_text().strip()
    return sid or None


def _write_resume(user_dir: Path, sid: str) -> None:
    (user_dir / SESSION_FILE).write_text(sid.strip() + "\n")


def _last_assistant_text(messages: list[Any]) -> str:
    for msg in reversed(messages):
        if not isinstance(msg, claude_agent_sdk.AssistantMessage):
            continue
        text = "".join(
            b.text for b in msg.content
            if isinstance(b, claude_agent_sdk.TextBlock)
        ).strip()
        if text:
            return text
    return ""


def _parse_envelope(envelope: dict[str, Any]) -> tuple[str, str, dict[str, Any]]:
    trigger = (envelope.get("trigger") or "").strip()
    user_id = (envelope.get("user_id") or "").strip()
    payload = envelope.get("payload") or {}
    if trigger not in {"user_sms", "activation"}:
        raise ValueError(f"trigger must be user_sms or activation, got {trigger!r}")
    if not user_id:
        raise ValueError("user_id is required")
    if not isinstance(payload, dict):
        raise ValueError("payload must be a JSON object")
    return trigger, user_id, payload


async def run_turn(envelope: dict[str, Any]) -> str:
    """One agent turn. Returns reply text (may be empty)."""
    trigger, user_id, payload = _parse_envelope(envelope)
    user_dir, phase = user_workdir(user_id)
    if trigger == "activation":
        phase = "activation"
    resume = _read_resume(user_dir)

    debug = os.getenv("TRAIN_AGENT_DEBUG", "").strip() == "1"
    model = os.getenv("TRAIN_AGENT_MODEL", DEFAULT_MODEL)

    user_prompt = json.dumps(
        {"trigger": trigger, "phase": phase, "payload": payload}, indent=2
    )

    # SDK's `env` REPLACES the subprocess env. Pin HOME on Modal so the
    # session JSONL persists to the per-user volume, not /root/.claude.
    sdk_env = dict(os.environ)
    if os.getenv("TRAIN_AGENT_PIN_HOME", "").strip() == "1":
        sdk_env["HOME"] = str(user_dir)

    t0 = time.time()
    inbound = (payload.get("text") or "")[:200] if isinstance(payload, dict) else ""
    print(
        f"[run_turn] START user={user_id!r} trigger={trigger!r} phase={phase!r} "
        f"resume={resume!r} text={inbound!r}",
        file=sys.stderr,
    )

    def make_opts(resume_id: str | None) -> claude_agent_sdk.ClaudeAgentOptions:
        return claude_agent_sdk.ClaudeAgentOptions(
            cwd=str(user_dir),
            model=model,
            permission_mode="acceptEdits",
            allowed_tools=ALLOWED_TOOLS,
            system_prompt={
                "type": "preset",
                "preset": "claude_code",
                "append": build_system_prompt(phase=phase),
            },
            setting_sources=["project"],
            resume=resume_id,
            max_turns=MAX_TURNS,
            env=sdk_env,
            stderr=(lambda line: print(f"[sdk] {line}", file=sys.stderr)) if debug else None,
        )

    async def drive(opts) -> tuple[list[Any], str | None]:
        msgs: list[Any] = []
        sid: str | None = None
        async for msg in claude_agent_sdk.query(prompt=user_prompt, options=opts):
            msgs.append(msg)
            mid = getattr(msg, "session_id", None)
            if isinstance(mid, str) and mid:
                sid = mid
        return msgs, sid

    try:
        collected, final_sid = await drive(make_opts(resume))
    except claude_agent_sdk.ProcessError as exc:
        if not resume:
            raise
        print(
            f"[runtime] resume failed for session={resume!r}: {exc}. Retrying without resume.",
            file=sys.stderr,
        )
        collected, final_sid = await drive(make_opts(None))

    if final_sid:
        _write_resume(user_dir, final_sid)

    reply = _last_assistant_text(collected)
    tools = [
        b.name
        for m in collected
        for b in (getattr(m, "content", None) or [])
        if isinstance(b, claude_agent_sdk.ToolUseBlock)
    ]
    print(
        f"[run_turn] DONE  user={user_id!r} phase={phase!r} "
        f"duration={time.time()-t0:.2f}s tools={tools} session={final_sid!r} "
        f"reply={reply[:200]!r}",
        file=sys.stderr,
    )
    return reply


__all__ = ["run_turn", "user_workdir"]
