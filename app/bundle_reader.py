"""Read training bundle markdown — find today's session, parse blocks/goals.

The bundle layout is described in /CLAUDE.md. For V1 (single-athlete) the
active arc is hardcoded:

    athletes/andy/arc-2026-summer-dunk/

This module is intentionally read-only and tolerant of formatting drift:
the markdown is hand-edited and we never want a missing fence to break
the daily SMS.
"""

from __future__ import annotations

import datetime as _dt
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


# TODO: when multi-athlete lands, take athlete_slug + read active arc from a
# manifest. For V1 we hardcode Andy's active arc.
ACTIVE_ATHLETE_SLUG = "andy"
ACTIVE_ARC_SLUG = "arc-2026-summer-dunk"


def repo_root() -> Path:
    """Best-effort repo root.

    On Modal the repo is at /root (via add_local_dir). Locally it's the
    parent of app/. Honor TRAIN_REPO_ROOT for tests.
    """
    override = os.getenv("TRAIN_REPO_ROOT")
    if override:
        return Path(override)
    # /root/app/bundle_reader.py → /root
    here = Path(__file__).resolve()
    parent = here.parent.parent
    if (parent / "athletes").exists():
        return parent
    # Modal lays out /root/app/<module>; in that case /root is the parent.
    if (here.parent.parent / "athletes").exists():
        return here.parent.parent
    return parent


def active_arc_dir() -> Path:
    return repo_root() / "athletes" / ACTIVE_ATHLETE_SLUG / ACTIVE_ARC_SLUG


def current_week_path() -> Path:
    return active_arc_dir() / "training" / "active" / "current-week.md"


def current_block_path() -> Path:
    return active_arc_dir() / "training" / "active" / "current-block.md"


def blocks_dir() -> Path:
    return active_arc_dir() / "training" / "blocks"


def nutrition_arc_path() -> Path:
    return active_arc_dir() / "nutrition" / "arc.md"


# ---------------------------------------------------------------------------
# Day section extraction
# ---------------------------------------------------------------------------

# Matches headers like:
#   ## Sun May 17 (SUNDAY) — DNT Day 1 + Lower Posterior
#   ## Mon May 26 (MONDAY) — Lower Power
_DAY_HEADER_RE = re.compile(
    r"^##\s+(?P<dow>Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+"
    r"(?P<month>[A-Za-z]+)\s+(?P<day>\d{1,2})\s*"
    r"\((?P<dow_full>\w+)\)\s*[—-]\s*(?P<title>.+?)\s*$"
)


@dataclass
class DaySection:
    date: _dt.date
    title: str
    body: str
    """The markdown body between this day header and the next ## header."""


def _iter_day_sections(week_md: str, year: int) -> Iterable[DaySection]:
    """Yield DaySection per ## day header in current-week.md."""
    lines = week_md.splitlines()
    current: dict | None = None
    buf: list[str] = []

    def flush() -> DaySection | None:
        if not current:
            return None
        try:
            month_num = _dt.datetime.strptime(current["month"][:3], "%b").month
            d = _dt.date(year, month_num, int(current["day"]))
        except ValueError:
            return None
        return DaySection(date=d, title=current["title"], body="\n".join(buf).rstrip())

    for line in lines:
        m = _DAY_HEADER_RE.match(line)
        if m:
            done = flush()
            if done:
                yield done
            current = m.groupdict()
            buf = []
        elif line.startswith("## ") and current is not None:
            # New non-day section ends the current day capture.
            done = flush()
            if done:
                yield done
            current = None
            buf = []
        elif current is not None:
            buf.append(line)
    done = flush()
    if done:
        yield done


def find_today_session(today: _dt.date | None = None) -> DaySection | None:
    """Return today's DaySection from current-week.md, or None on miss.

    Misses on:
      - rest day (no day header for today)
      - file missing
      - parse failure
    """
    today = today or _dt.date.today()
    path = current_week_path()
    if not path.exists():
        return None
    md = path.read_text()
    for section in _iter_day_sections(md, year=today.year):
        if section.date == today:
            return section
    return None


# ---------------------------------------------------------------------------
# Block detection (for block-retro cron)
# ---------------------------------------------------------------------------


@dataclass
class BlockInfo:
    slug: str          # filename stem, e.g. 2026-05-block-01-power-conversion
    path: Path
    title: str
    start_date: _dt.date | None
    end_date: _dt.date | None
    goals: list[str]
    purpose: str


_BLOCK_TITLE_RE = re.compile(r"^#\s+(.+?)\s*$")
_DATE_RANGE_RE = re.compile(
    r"(?:Date Range|Window|Block window|Dates?)\s*[:\-]\s*"
    r"(?P<start>\w+\s+\d+,?\s+\d{4}|\w+\s+\d+)\s*[–\-]\s*"
    r"(?P<end>\w+\s+\d+,?\s+\d{4}|\w+\s+\d+,?\s+\d{4}?)",
    re.IGNORECASE,
)


def _parse_date(token: str, fallback_year: int) -> _dt.date | None:
    token = token.strip().replace(",", "")
    for fmt in ("%b %d %Y", "%B %d %Y", "%b %d", "%B %d"):
        try:
            d = _dt.datetime.strptime(token, fmt).date()
            if d.year == 1900:
                d = d.replace(year=fallback_year)
            return d
        except ValueError:
            continue
    return None


def _extract_goals(md: str) -> list[str]:
    """Pull the '## Goals' or '## Block Goals' bullet list."""
    in_goals = False
    goals: list[str] = []
    for line in md.splitlines():
        if re.match(r"^##\s+(Block\s+)?Goals", line, re.IGNORECASE):
            in_goals = True
            continue
        if in_goals and line.startswith("## "):
            break
        if in_goals:
            stripped = line.strip()
            # numbered or bulleted goal
            m = re.match(r"^(?:\d+\.|-|\*)\s+(.+)$", stripped)
            if m:
                goals.append(m.group(1))
    return goals


def _extract_purpose(md: str) -> str:
    in_purpose = False
    buf: list[str] = []
    for line in md.splitlines():
        if re.match(r"^##\s+Purpose", line, re.IGNORECASE):
            in_purpose = True
            continue
        if in_purpose and line.startswith("## "):
            break
        if in_purpose:
            buf.append(line)
    return "\n".join(buf).strip()


def load_block(path: Path) -> BlockInfo:
    md = path.read_text()
    lines = md.splitlines()
    title = ""
    for line in lines[:5]:
        m = _BLOCK_TITLE_RE.match(line)
        if m:
            title = m.group(1)
            break

    # Try to find dates. Block files mostly don't store explicit dates;
    # we infer from the filename and from week sections inside.
    start = end = None
    rng = _DATE_RANGE_RE.search(md)
    if rng:
        year = _dt.date.today().year
        start = _parse_date(rng.group("start"), year)
        end = _parse_date(rng.group("end"), year)

    return BlockInfo(
        slug=path.stem,
        path=path,
        title=title,
        start_date=start,
        end_date=end,
        goals=_extract_goals(md),
        purpose=_extract_purpose(md),
    )


def all_blocks() -> list[BlockInfo]:
    d = blocks_dir()
    if not d.exists():
        return []
    return [load_block(p) for p in sorted(d.glob("*.md"))]


def block_ending_today(today: _dt.date | None = None) -> BlockInfo | None:
    """Return a block whose end_date matches today, else None.

    NOTE: block markdown for the active arc doesn't currently include an
    explicit date range header. Until that's added, this returns None and
    the cron is effectively a no-op. The block_end is computable from
    arc.md (which has block→week mapping) — wiring that up is the next
    step.
    """
    today = today or _dt.date.today()
    for b in all_blocks():
        if b.end_date and b.end_date == today:
            return b
    return None


__all__ = [
    "ACTIVE_ARC_SLUG",
    "ACTIVE_ATHLETE_SLUG",
    "BlockInfo",
    "DaySection",
    "active_arc_dir",
    "all_blocks",
    "block_ending_today",
    "current_block_path",
    "current_week_path",
    "find_today_session",
    "load_block",
    "nutrition_arc_path",
    "repo_root",
]
