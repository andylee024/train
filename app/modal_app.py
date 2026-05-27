"""Single Modal app for Train — webhook + agent loop in one container.

Deploy:
    modal deploy app/modal_app.py

One web function:
    web — FastAPI ASGI. Handles /health, /messages/webhook, /admin/approve.
          Calls run_turn in-process. No cross-function indirection.

Volume:
    train-user-state → /workspace/user. Holds pending/ + active/ per-user
    state across container restarts.

Secrets (merged for convenience):
    train-agent-secrets   ANTHROPIC_API_KEY
    train-text-secrets    LINQ_API_KEY, LINQ_FROM_NUMBER, TRAIN_ADMIN_SECRET, TRAIN_ANDY_PHONE
"""

from __future__ import annotations

from pathlib import Path

import modal


APP_NAME = "train"
VOLUME_NAME = "train-user-state"
USER_VOLUME_PATH = "/workspace/user"

_REPO_ROOT = Path(__file__).resolve().parent.parent
_APP_DIR = _REPO_ROOT / "app"

app = modal.App(APP_NAME)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("curl", "ca-certificates", "gnupg")
    .run_commands(
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs",
        "npm install -g @anthropic-ai/claude-code",
    )
    .pip_install(
        "fastapi>=0.111.0",
        "uvicorn[standard]>=0.29.0",
        "pydantic>=2.7.0",
        "httpx>=0.27.0",
        "modal>=1.4.0",
        "python-dotenv>=1.0.0",
        "claude-agent-sdk>=0.1.0",
    )
    .add_local_dir(str(_APP_DIR), remote_path="/root/app")
)

user_state = modal.Volume.from_name(VOLUME_NAME, create_if_missing=True)


@app.function(
    image=image,
    volumes={USER_VOLUME_PATH: user_state},
    secrets=[
        modal.Secret.from_name("train-agent-secrets"),
        modal.Secret.from_name("train-text-secrets"),
    ],
    min_containers=1,
    max_containers=1,
    timeout=300,
)
@modal.asgi_app()
def web():
    """FastAPI ASGI app — all routes."""
    import os
    import sys

    sys.path.insert(0, "/root")
    os.environ.setdefault("TRAIN_AGENT_CWD", USER_VOLUME_PATH)
    os.environ.setdefault("TRAIN_AGENT_PIN_HOME", "1")

    from app.api import app as fastapi_app

    return fastapi_app


# ----- Cron jobs (V1 backend automation) -------------------------------------
#
# All crons share the same image + secrets as `web` so they can read the
# vendored bundle markdown and reach Linq + Supabase + Anthropic.
#
# Times below are in UTC. PT is UTC-7 (PDT) or UTC-8 (PST). For V1 we
# schedule against PDT since the active arc runs May→Sep. A daylight-saving
# correction can come later.


@app.function(
    image=image,
    volumes={USER_VOLUME_PATH: user_state},
    secrets=[
        modal.Secret.from_name("train-agent-secrets"),
        modal.Secret.from_name("train-text-secrets"),
    ],
    schedule=modal.Cron("30 13 * * *"),   # 6:30 AM PT daily (PDT)
    timeout=180,
)
def cron_daily_sender() -> dict:
    import asyncio
    import sys

    sys.path.insert(0, "/root")
    from app.cron.daily_sender import run_daily_send

    return asyncio.run(run_daily_send())


@app.function(
    image=image,
    volumes={USER_VOLUME_PATH: user_state},
    secrets=[
        modal.Secret.from_name("train-agent-secrets"),
        modal.Secret.from_name("train-text-secrets"),
    ],
    schedule=modal.Cron("0 14 * * 0"),    # Sunday 7:00 AM PT (PDT)
    timeout=300,
)
def cron_sunday_digest() -> dict:
    import asyncio
    import sys

    sys.path.insert(0, "/root")
    from app.cron.sunday_digest import run_sunday_digest

    return asyncio.run(run_sunday_digest())


@app.function(
    image=image,
    volumes={USER_VOLUME_PATH: user_state},
    secrets=[
        modal.Secret.from_name("train-agent-secrets"),
        modal.Secret.from_name("train-text-secrets"),
    ],
    schedule=modal.Cron("0 14 * * *"),    # 7:00 AM PT daily (no-op unless EOB)
    timeout=300,
)
def cron_block_retro() -> dict:
    import asyncio
    import sys

    sys.path.insert(0, "/root")
    from app.cron.block_retro import run_block_retro

    return asyncio.run(run_block_retro())


# ----- Smokes ----------------------------------------------------------------


@app.function(
    image=image,
    volumes={USER_VOLUME_PATH: user_state},
    secrets=[modal.Secret.from_name("train-agent-secrets")],
    timeout=180,
)
def _smoke_turn(envelope: dict) -> str:
    import asyncio
    import os
    import sys

    os.environ.setdefault("TRAIN_AGENT_CWD", USER_VOLUME_PATH)
    os.environ["TRAIN_AGENT_PIN_HOME"] = "1"
    sys.path.insert(0, "/root")
    from app.agent import run_turn as _rt

    reply = asyncio.run(_rt(envelope))
    user_state.commit()
    return reply


@app.function(
    image=image,
    volumes={USER_VOLUME_PATH: user_state},
    timeout=30,
)
def read_user_file(user_id: str, relpath: str) -> str | None:
    """Read a file from the user-state volume (smoke helper)."""
    from pathlib import Path as P

    user_state.reload()
    for sub in ("pending", "active"):
        candidate = P(USER_VOLUME_PATH) / sub / user_id / relpath
        if candidate.exists():
            try:
                return candidate.read_text()
            except OSError:
                return None
    return None


@app.local_entrypoint()
def intake_smoke() -> None:
    """End-to-end intake: scripted SMS exchanges, assert intake.md gets written.

    Run:
      modal run app/modal_app.py::intake_smoke
    """
    import time

    user_id = f"intake-smoke-{int(time.time())}"
    print(f"[intake-smoke] user_id={user_id}")

    scripted = [
        "Hey - I want to dunk a basketball by Aug 15, 2026.",
        "I'm 6'1, current vert is 26 inches, standing reach 8'1. Best squat 365.",
        "Been lifting 4 years. Last successful block was strength early this year.",
        "5 sessions a week, full gym, 60 min, evenings.",
        "Limiter is recovery - I sit a lot at work, hips get tight. BW 178.",
        "No knee/ankle/hip injuries. I stick when I see progress; I bail if it feels random.",
        "yeah that recap is right",
        "all good, locked",
    ]

    for i, text in enumerate(scripted, start=1):
        reply = _smoke_turn.remote({
            "trigger": "user_sms",
            "user_id": user_id,
            "payload": {
                "external_message_id": f"{user_id}-{i}",
                "sender_phone": user_id,
                "chat_id": "smoke",
                "text": text,
            },
        })
        print(f"[intake-smoke] turn {i} → {reply!r}")
        intake = read_user_file.remote(user_id, "intake.md")
        if intake:
            print(f"[intake-smoke] intake.md written after turn {i} ({len(intake)} chars)")
            print(intake)
            return

    raise AssertionError(f"intake.md NOT written after {len(scripted)} turns")


__all__ = ["app", "web"]
