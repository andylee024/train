#!/usr/bin/env python3
"""Stage 6 — Land: commit the drafted style guide to docs/content/training-styles/.

Default mode is dry-run (prints what would change). Use `--approve` to actually
write to the committed location, write ingested.json (state pin), and bump
manifest.json#seen_video_ids to match.

Run:
    # Dry-run:
    python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics

    # Land for real:
    python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics --approve

The landed directory matches the _template/ shape:
    docs/content/training-styles/<coach>/
        guide.md
        exercise-selection.md
        README.md           ← auto-written stub
        sources/sources.json
        ingested.json       ← state pin
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from manifest import (
    Manifest,
    draft_dir,
    extractions_dir,
    now_iso,
)

COMMITTED_ROOT = Path("docs/content/training-styles")


def committed_dir(coach_slug: str) -> Path:
    return COMMITTED_ROOT / coach_slug


def collect_ingested_video_ids(coach_slug: str) -> list[str]:
    """List of video ids whose extractions exist (= what this draft was built from)."""
    edir = extractions_dir(coach_slug)
    if not edir.exists():
        return []
    return sorted([p.stem for p in edir.glob("*.json")])


def render_readme(coach_slug: str, n_videos: int, when: str) -> str:
    return f"""# {coach_slug}

Auto-drafted style guide produced by `.claude/skills/ingest-coach/` on {when}, from {n_videos} YouTube videos.

- [`guide.md`](guide.md) — methodology, mechanism, session structure, programming principles, sample sessions
- [`exercise-selection.md`](exercise-selection.md) — catalogued exercises grouped by category
- [`sources/sources.json`](sources/sources.json) — citation map: every `[^vid-XXX]` marker in the guide resolves here to a video + supporting quotes
- [`ingested.json`](ingested.json) — state pin: which videos contributed, schema version, last refresh

Re-run the skill to refresh after new videos drop.
"""


def plan_changes(coach_slug: str) -> dict:
    """Return a description of what land would do (without doing it)."""
    ddir = draft_dir(coach_slug)
    cdir = committed_dir(coach_slug)
    if not ddir.exists():
        raise FileNotFoundError(f"No draft at {ddir}")

    changes = {
        "draft_dir": str(ddir),
        "target_dir": str(cdir),
        "target_exists": cdir.exists(),
        "files_to_write": [],
    }

    file_map = [
        (ddir / "guide.md", cdir / "guide.md"),
        (ddir / "exercise-selection.md", cdir / "exercise-selection.md"),
        (ddir / "sources.json", cdir / "sources" / "sources.json"),
    ]
    for src, dst in file_map:
        if not src.exists():
            continue
        changes["files_to_write"].append({
            "from": str(src),
            "to": str(dst),
            "size": src.stat().st_size,
            "overwrite": dst.exists(),
        })

    # Auto-generated files
    changes["files_to_write"].append({
        "to": str(cdir / "README.md"),
        "size": 0,
        "overwrite": (cdir / "README.md").exists(),
        "synthesized": True,
    })
    changes["files_to_write"].append({
        "to": str(cdir / "ingested.json"),
        "size": 0,
        "overwrite": (cdir / "ingested.json").exists(),
        "synthesized": True,
    })

    return changes


def apply_changes(coach_slug: str) -> dict:
    """Actually perform the writes. Returns a summary of what landed."""
    ddir = draft_dir(coach_slug)
    cdir = committed_dir(coach_slug)
    cdir.mkdir(parents=True, exist_ok=True)
    (cdir / "sources").mkdir(parents=True, exist_ok=True)

    # Copy the two markdown files
    shutil.copy2(ddir / "guide.md", cdir / "guide.md")
    shutil.copy2(ddir / "exercise-selection.md", cdir / "exercise-selection.md")
    shutil.copy2(ddir / "sources.json", cdir / "sources" / "sources.json")

    # Build ingested.json (state pin)
    ingested_ids = collect_ingested_video_ids(coach_slug)
    landed_at = now_iso()
    ingested = {
        "schema_version": 1,
        "coach_slug": coach_slug,
        "landed_at": landed_at,
        "n_videos": len(ingested_ids),
        "video_ids": ingested_ids,
    }
    (cdir / "ingested.json").write_text(json.dumps(ingested, indent=2))

    # Write README stub
    (cdir / "README.md").write_text(render_readme(coach_slug, len(ingested_ids), landed_at[:10]))

    # Sync manifest.json#seen_video_ids — ingested.json is the authoritative
    # list of videos represented in the committed guide.
    manifest = Manifest.load(coach_slug)
    for vid in ingested_ids:
        manifest.mark_seen(vid)
    manifest.last_run = landed_at
    manifest.save()

    return {
        "landed_at": landed_at,
        "target_dir": str(cdir),
        "n_videos": len(ingested_ids),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coach", required=True)
    ap.add_argument("--approve", action="store_true", help="Actually write (default: dry-run)")
    args = ap.parse_args()

    try:
        plan = plan_changes(args.coach)
    except FileNotFoundError as e:
        print(e, file=sys.stderr)
        return 2

    print(f"\nLand plan for {args.coach}:")
    print(f"  from: {plan['draft_dir']}")
    print(f"  to:   {plan['target_dir']}  {'(exists — will overwrite)' if plan['target_exists'] else '(NEW)'}")
    print()
    print(f"  Files to write:")
    for f in plan["files_to_write"]:
        verb = "overwrite" if f.get("overwrite") else "create"
        synth = " [synthesized]" if f.get("synthesized") else ""
        size = f"({f['size']:>6d} bytes)" if f.get("size") else ""
        print(f"    {verb:<10s}  {f['to']}  {size}{synth}")

    if not args.approve:
        print("\n(dry-run — pass --approve to land for real)")
        return 0

    result = apply_changes(args.coach)
    print(f"\n✓ Landed {result['n_videos']} videos to {result['target_dir']} at {result['landed_at']}")
    print(f"  manifest.json#seen_video_ids synced to match ingested.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
