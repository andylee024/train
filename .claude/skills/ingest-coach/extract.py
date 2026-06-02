#!/usr/bin/env python3
"""Stage 3 — Extract: distill each transcript into structured JSON.

For every cached transcript at `.ingestion-cache/<coach>/transcripts/<id>.json`,
call Claude with the extraction prompt + schema and write the structured
extraction to `.ingestion-cache/<coach>/extractions/<id>.json`.

Run:
    # All cached transcripts:
    python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics

    # Specific videos:
    python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics \\
        --video-ids XpN5dGyHKqY mzzmZAWxOn4

    # Force re-extract (e.g. after prompt tweak):
    python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics \\
        --force

Idempotency:
- Skip if extractions/<id>.json exists AND its schema_version matches current
- Re-extract everything if --force OR if schema_version in CURRENT_SCHEMA_VERSION
  was bumped (each existing extraction's schema_version is checked)

Requires: ANTHROPIC_API_KEY in env or .env. `pip install anthropic` if missing.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from manifest import (
    Manifest,
    transcripts_dir,
    extractions_dir,
    CURRENT_SCHEMA_VERSION,
)

CURRENT_EXTRACT_SCHEMA = 1  # bump this when the schema changes
PROMPT_PATH = Path(__file__).parent / "prompts" / "extract.md"
SCHEMA_PATH = Path(__file__).parent / "schema.json"

# Model: prefer the most-capable Claude. extract is one-pass per video,
# cost ~$0.02-0.05/video for a 10-min lecture transcript.
MODEL = "claude-opus-4-7"
MAX_TOKENS = 8000


def load_dotenv_if_present() -> None:
    """Tiny .env loader. Avoid taking python-dotenv as a hard dep."""
    env_path = Path(".env")
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def render_prompt(transcript: dict) -> str:
    template = PROMPT_PATH.read_text()
    return (
        template
        .replace("{coach_slug}", transcript.get("coach_slug", "<unknown>"))
        .replace("{video_id}", transcript["video_id"])
        .replace("{video_title}", transcript["title"])
        .replace("{duration_seconds}", str(transcript.get("duration_seconds") or "?"))
        .replace("{char_count}", str(transcript["char_count"]))
        .replace("{transcript_text}", transcript["text"])
    )


def call_claude(prompt: str) -> str:
    """Single Claude call. Returns the model's text response."""
    try:
        import anthropic
    except ImportError:
        print("Missing anthropic SDK. Install: pip install anthropic", file=sys.stderr)
        sys.exit(2)

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set. Add it to .env or your shell env.", file=sys.stderr)
        sys.exit(2)

    client = anthropic.Anthropic()
    msg = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


def parse_json_response(text: str) -> dict:
    """Strip markdown fences if Claude added any, then parse."""
    t = text.strip()
    if t.startswith("```"):
        # Drop first fence line and trailing fence
        lines = t.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        t = "\n".join(lines)
    return json.loads(t)


def validate_extraction(extraction: dict, transcript_text: str) -> list[str]:
    """Return a list of validation errors. Empty list = valid."""
    errors: list[str] = []
    if extraction.get("schema_version") != CURRENT_EXTRACT_SCHEMA:
        errors.append(f"schema_version != {CURRENT_EXTRACT_SCHEMA}")

    needle = transcript_text.lower()
    sections = ["philosophy", "exercises", "programming_rules", "sample_sessions"]
    for section in sections:
        if section not in extraction:
            errors.append(f"missing section '{section}'")
            continue
        for i, item in enumerate(extraction[section]):
            citation = item.get("citation")
            if not citation:
                errors.append(f"{section}[{i}]: no citation")
                continue
            quote = (citation.get("quote") or "").strip()
            if len(quote) < 8:
                errors.append(f"{section}[{i}]: citation quote too short ({len(quote)} chars)")
                continue
            if quote.lower() not in needle:
                errors.append(f"{section}[{i}]: citation quote not found in transcript: {quote[:60]!r}")
    return errors


def extract_one(coach_slug: str, transcript_path: Path, force: bool = False) -> dict | None:
    """Extract one video's transcript. Returns the extraction or None if
    skipped (already cached at current schema)."""
    transcript = json.loads(transcript_path.read_text())
    video_id = transcript["video_id"]
    out_path = extractions_dir(coach_slug) / f"{video_id}.json"

    if out_path.exists() and not force:
        existing = json.loads(out_path.read_text())
        if existing.get("schema_version") == CURRENT_EXTRACT_SCHEMA:
            print(f"  - {video_id}  already extracted (schema v{CURRENT_EXTRACT_SCHEMA}), skipping")
            return None

    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Light density filter — meet footage / very short transcripts skip
    cpm = transcript.get("chars_per_minute") or 0
    if cpm and cpm < 200:
        print(f"  ⚠ {video_id}  low density ({cpm:.0f} chars/min) — emitting empty extraction")
        record = {
            "schema_version": CURRENT_EXTRACT_SCHEMA,
            "video": {
                "video_id": video_id,
                "title": transcript["title"],
                "duration_seconds": transcript.get("duration_seconds"),
                "upload_date": transcript.get("upload_date"),
            },
            "philosophy": [],
            "exercises": [],
            "programming_rules": [],
            "sample_sessions": [],
            "_meta": {"skipped_reason": f"low_density_{int(cpm)}_cpm"},
        }
        out_path.write_text(json.dumps(record, indent=2))
        return record

    prompt = render_prompt(transcript)
    print(f"  > {video_id}  calling Claude ({transcript['char_count']:>6d} chars)...", end="", flush=True)
    response_text = call_claude(prompt)

    try:
        extraction = parse_json_response(response_text)
    except json.JSONDecodeError as e:
        print(f"\n  ✗ {video_id}  JSON parse failed: {e}")
        # Dump raw response next to the extraction path for debugging
        (out_path.with_suffix(".raw.txt")).write_text(response_text)
        return None

    # Force-stamp schema_version + video metadata
    extraction["schema_version"] = CURRENT_EXTRACT_SCHEMA
    extraction.setdefault("video", {}).update({
        "video_id": video_id,
        "title": transcript["title"],
        "duration_seconds": transcript.get("duration_seconds"),
        "upload_date": transcript.get("upload_date"),
    })

    errors = validate_extraction(extraction, transcript["text"])
    if errors:
        print(f"\n  ⚠ {video_id}  validation errors ({len(errors)}):")
        for e in errors[:5]:
            print(f"    - {e}")
        if len(errors) > 5:
            print(f"    ... and {len(errors) - 5} more")
        # Save anyway with errors recorded — synth step decides what to do
        extraction.setdefault("_meta", {})["validation_errors"] = errors

    out_path.write_text(json.dumps(extraction, indent=2))
    n_items = sum(len(extraction.get(s, [])) for s in ["philosophy", "exercises", "programming_rules", "sample_sessions"])
    print(f" ✓ {n_items} items")
    return extraction


def validate_only(coach_slug: str) -> int:
    """Re-validate all existing extractions against their transcripts.
    Returns non-zero exit if any fail."""
    fail = 0
    edir = extractions_dir(coach_slug)
    if not edir.exists():
        print(f"No extractions for {coach_slug}.", file=sys.stderr)
        return 1
    for ext_path in sorted(edir.glob("*.json")):
        ext = json.loads(ext_path.read_text())
        vid = ext["video"]["video_id"]
        tp = transcripts_dir(coach_slug) / f"{vid}.json"
        if not tp.exists():
            print(f"  ⚠ {vid}  no source transcript")
            fail += 1
            continue
        transcript_text = json.loads(tp.read_text())["text"]
        errors = validate_extraction(ext, transcript_text)
        if errors:
            print(f"  ✗ {vid}  {len(errors)} errors")
            for e in errors[:3]:
                print(f"    - {e}")
            fail += 1
        else:
            print(f"  ✓ {vid}")
    return 1 if fail else 0


def main() -> int:
    load_dotenv_if_present()
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coach", required=True)
    ap.add_argument("--video-ids", nargs="+", help="Specific transcripts to extract")
    ap.add_argument("--force", action="store_true", help="Re-extract even if cached at current schema")
    ap.add_argument("--validate-only", action="store_true", help="Re-validate cached extractions against their transcripts; no API calls")
    args = ap.parse_args()

    if args.validate_only:
        return validate_only(args.coach)

    tdir = transcripts_dir(args.coach)
    if not tdir.exists():
        print(f"No transcripts cached for {args.coach}; run fetch.py first.", file=sys.stderr)
        return 2

    if args.video_ids:
        paths = [tdir / f"{vid}.json" for vid in args.video_ids]
        for p in paths:
            if not p.exists():
                print(f"Missing transcript: {p}", file=sys.stderr)
                return 2
    else:
        paths = sorted(tdir.glob("*.json"))

    extracted, skipped, failed = 0, 0, 0
    for p in paths:
        try:
            result = extract_one(args.coach, p, force=args.force)
            if result is None:
                skipped += 1
            else:
                extracted += 1
        except Exception as e:
            print(f"  ✗ {p.stem}  {type(e).__name__}: {e}")
            failed += 1

    print()
    print(f"Extracted: {extracted}  Skipped (cached): {skipped}  Failed: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
