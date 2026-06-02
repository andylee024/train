"""Shared manifest read/write helpers for the coach-ingestion pipeline.

The manifest is a single JSON file at .ingestion-cache/<coach>/manifest.json
that tracks the state of an in-flight ingestion. Each pipeline stage reads it
to decide what work it can skip.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

CACHE_ROOT = Path(".ingestion-cache")
CURRENT_SCHEMA_VERSION = 1


@dataclass
class Manifest:
    coach_slug: str
    channel_url: str = ""
    last_run: Optional[str] = None
    seen_video_ids: list[str] = field(default_factory=list)
    schema_version: int = CURRENT_SCHEMA_VERSION

    @classmethod
    def load(cls, coach_slug: str) -> "Manifest":
        path = manifest_path(coach_slug)
        if not path.exists():
            return cls(coach_slug=coach_slug)
        data = json.loads(path.read_text())
        return cls(
            coach_slug=data["coach_slug"],
            channel_url=data.get("channel_url", ""),
            last_run=data.get("last_run"),
            seen_video_ids=data.get("seen_video_ids", []),
            schema_version=data.get("schema_version", CURRENT_SCHEMA_VERSION),
        )

    def save(self) -> None:
        path = manifest_path(self.coach_slug)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(asdict(self), indent=2, sort_keys=True))

    def mark_seen(self, video_id: str) -> None:
        if video_id not in self.seen_video_ids:
            self.seen_video_ids.append(video_id)

    def has_seen(self, video_id: str) -> bool:
        return video_id in self.seen_video_ids


def coach_dir(coach_slug: str) -> Path:
    return CACHE_ROOT / coach_slug


def manifest_path(coach_slug: str) -> Path:
    return coach_dir(coach_slug) / "manifest.json"


def transcripts_dir(coach_slug: str) -> Path:
    return coach_dir(coach_slug) / "transcripts"


def extractions_dir(coach_slug: str) -> Path:
    return coach_dir(coach_slug) / "extractions"


def draft_dir(coach_slug: str) -> Path:
    return coach_dir(coach_slug) / "draft"


def now_iso() -> str:
    """ISO-8601 timestamp. Lives here so callers don't import datetime."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat(timespec="seconds")
