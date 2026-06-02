#!/usr/bin/env python3
"""Stage 4 — Synthesize: aggregate all extractions into a draft style guide.

Reads every `extractions/<id>.json` for a coach and produces draft markdown
at `.ingestion-cache/<coach>/draft/`:
  - guide.md              (matches the _template/guide.md shape)
  - exercise-selection.md (matches _template/exercise-selection.md)
  - sources.json          (citation map: marker → video metadata)

Synthesis is the iteration-heavy stage. You can tune prompts/synthesize_*.md
and re-run this script ALONE — no re-fetch, no re-extract.

Run:
    python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics

    # After editing a prompt, re-run cheaply:
    python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics

The script always re-synthesizes (synth is cheap relative to extract, and the
prompt may have changed). Use `--from-cache` if you want to skip the Claude
calls and just rebuild sources.json from existing draft markdown.

Requires: ANTHROPIC_API_KEY.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

from manifest import extractions_dir, draft_dir
from extract import load_dotenv_if_present, call_claude

PROMPTS_DIR = Path(__file__).parent / "prompts"
CITATION_RE = re.compile(r"\[\^vid-([A-Za-z0-9_-]+)\]")


def render(template: str, **kwargs) -> str:
    out = template
    for k, v in kwargs.items():
        out = out.replace("{" + k + "}", str(v))
    return out


def load_extractions(coach_slug: str) -> list[dict]:
    edir = extractions_dir(coach_slug)
    if not edir.exists():
        return []
    items = []
    for p in sorted(edir.glob("*.json")):
        items.append(json.loads(p.read_text()))
    return items


def make_extractions_block(extractions: list[dict]) -> str:
    """Pack all extractions into a single block of text for the Claude prompt."""
    parts = []
    for ext in extractions:
        v = ext.get("video", {})
        parts.append(f"--- video_id: {v.get('video_id')} | title: {v.get('title')} | upload_date: {v.get('upload_date')} ---")
        # Drop _meta so we don't confuse the model
        ext_for_prompt = {k: v_ for k, v_ in ext.items() if not k.startswith("_")}
        parts.append(json.dumps(ext_for_prompt, indent=2))
        parts.append("")
    return "\n".join(parts)


def make_exercises_block(extractions: list[dict]) -> str:
    """Pack just the exercises from each extraction (slimmer prompt input)."""
    parts = []
    for ext in extractions:
        v = ext.get("video", {})
        vid = v.get("video_id")
        for ex in ext.get("exercises", []):
            parts.append(json.dumps({"video_id": vid, **ex}))
    return "\n".join(parts)


def synthesize_guide(coach_slug: str, extractions: list[dict], today: str) -> str:
    prompt_template = (PROMPTS_DIR / "synthesize_guide.md").read_text()
    block = make_extractions_block(extractions)
    prompt = render(
        prompt_template,
        coach_slug=coach_slug,
        n_videos=len(extractions),
        date=today,
        extractions_block=block,
    )
    print(f"  > calling Claude for guide.md ({len(prompt):,} chars input)...", end="", flush=True)
    response = call_claude(prompt)
    print(f" ✓ ({len(response):,} chars)")
    return response.strip()


def synthesize_exercises(coach_slug: str, extractions: list[dict]) -> str:
    prompt_template = (PROMPTS_DIR / "synthesize_exercises.md").read_text()
    block = make_exercises_block(extractions)
    n_ex = sum(len(e.get("exercises", [])) for e in extractions)
    prompt = render(
        prompt_template,
        coach_slug=coach_slug,
        n_videos=len(extractions),
        n_exercises=n_ex,
        exercises_block=block,
    )
    print(f"  > calling Claude for exercise-selection.md ({len(prompt):,} chars input)...", end="", flush=True)
    response = call_claude(prompt)
    print(f" ✓ ({len(response):,} chars)")
    return response.strip()


def build_sources_json(guide_md: str, exercises_md: str, extractions: list[dict]) -> dict:
    """Walk both markdown docs for `[^vid-...]` markers and produce a map
    from each cited video_id to its metadata + the quotes from the
    corresponding extraction.
    """
    cited_ids = set(CITATION_RE.findall(guide_md)) | set(CITATION_RE.findall(exercises_md))
    by_id: dict[str, dict] = {}
    for ext in extractions:
        v = ext.get("video", {})
        vid = v.get("video_id")
        if vid not in cited_ids:
            continue
        # Pull all the quotes from this video's extraction so the reviewer
        # has the supporting evidence in one place.
        quotes = []
        for section in ("philosophy", "exercises", "programming_rules", "sample_sessions"):
            for item in ext.get(section, []):
                c = item.get("citation") or {}
                if c.get("quote"):
                    quotes.append({
                        "section": section,
                        "ts": c.get("ts"),
                        "quote": c["quote"],
                    })
        by_id[f"vid-{vid}"] = {
            "video_id": vid,
            "title": v.get("title"),
            "url": f"https://www.youtube.com/watch?v={vid}",
            "duration_seconds": v.get("duration_seconds"),
            "upload_date": v.get("upload_date"),
            "supporting_quotes": quotes,
        }
    return {
        "schema_version": 1,
        "n_citations": sum(len(CITATION_RE.findall(d)) for d in (guide_md, exercises_md)),
        "cited_videos": by_id,
    }


def validate_no_uncited(guide_md: str, exercises_md: str) -> list[str]:
    """Crude check: any non-header, non-list-marker paragraph that doesn't
    contain a citation marker is suspicious."""
    errors = []
    for label, doc in [("guide", guide_md), ("exercises", exercises_md)]:
        for i, line in enumerate(doc.splitlines()):
            stripped = line.strip()
            if not stripped or stripped.startswith(("#", ">", "|", "---", "*(", "**")):
                continue
            if stripped.startswith(("-", "*", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
                # List items should have citations if they're factual claims
                if "[^vid-" not in stripped and len(stripped) > 30:
                    errors.append(f"{label}:L{i+1}: list item without citation: {stripped[:80]}")
                continue
            # Paragraph text
            if "[^vid-" not in stripped and len(stripped) > 30:
                errors.append(f"{label}:L{i+1}: paragraph without citation: {stripped[:80]}")
    return errors


def write_draft(coach_slug: str, guide_md: str, exercises_md: str, sources: dict) -> None:
    ddir = draft_dir(coach_slug)
    ddir.mkdir(parents=True, exist_ok=True)
    (ddir / "guide.md").write_text(guide_md.rstrip() + "\n")
    (ddir / "exercise-selection.md").write_text(exercises_md.rstrip() + "\n")
    (ddir / "sources.json").write_text(json.dumps(sources, indent=2))
    print(f"\nDraft written to {ddir}/")
    print(f"  guide.md              ({len(guide_md):,} chars)")
    print(f"  exercise-selection.md ({len(exercises_md):,} chars)")
    print(f"  sources.json          ({sources['n_citations']} citations across {len(sources['cited_videos'])} videos)")


def main() -> int:
    load_dotenv_if_present()
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coach", required=True)
    ap.add_argument("--from-cache", action="store_true",
                    help="Skip Claude calls; rebuild sources.json from existing draft markdown")
    args = ap.parse_args()

    extractions = load_extractions(args.coach)
    if not extractions:
        print(f"No extractions for {args.coach}. Run extract.py first.", file=sys.stderr)
        return 2
    print(f"Loaded {len(extractions)} extractions for {args.coach}.")

    ddir = draft_dir(args.coach)

    if args.from_cache:
        guide_md = (ddir / "guide.md").read_text()
        exercises_md = (ddir / "exercise-selection.md").read_text()
        print("Using cached markdown; rebuilding sources.json only.")
    else:
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        guide_md = synthesize_guide(args.coach, extractions, today)
        exercises_md = synthesize_exercises(args.coach, extractions)

    sources = build_sources_json(guide_md, exercises_md, extractions)

    # Surface uncited-claim warnings; don't block on them (the reviewer decides)
    warnings = validate_no_uncited(guide_md, exercises_md)
    if warnings:
        print(f"\n⚠ {len(warnings)} possibly-uncited claims (sample):")
        for w in warnings[:5]:
            print(f"  - {w}")
        if len(warnings) > 5:
            print(f"  ... and {len(warnings) - 5} more")

    write_draft(args.coach, guide_md, exercises_md, sources)
    return 0


if __name__ == "__main__":
    sys.exit(main())
