#!/usr/bin/env python3
"""Stage 2 — Fetch: download YouTube auto-captions for videos.

Per the TR-339 experiment, auto-captions are the default source. We use
yt-dlp's `--write-auto-subs` (no audio, no Whisper, no model downloads),
strip the VTT formatting, dedupe scroll-animation duplicate lines, and
strip [bracketed] noise annotations.

Run:
    # Fetch transcripts for all new videos on this coach
    python3 .claude/skills/ingest-coach/fetch.py --coach catalyst-athletics

    # Or restrict to specific video ids
    python3 .claude/skills/ingest-coach/fetch.py --coach catalyst-athletics \\
        --video-ids XpN5dGyHKqY mzzmZAWxOn4

Re-running is idempotent: videos whose transcripts/<id>.json already exist
are skipped (no yt-dlp call, no manifest mutation).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from manifest import Manifest, transcripts_dir, now_iso


SEGMENT_RE = re.compile(
    r"(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})"
)
TAG_RE = re.compile(r"<[^>]+>")
BRACKETED_RE = re.compile(r"\[[^\]]+\]")  # [music], [clears throat], etc.


def ts_to_seconds(ts: str) -> float:
    h, m, s = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def parse_vtt(vtt_text: str) -> tuple[str, list[dict]]:
    """Parse a YouTube auto-caption VTT.

    Returns (full_text, segments) where segments is a list of
    {ts: seconds, line: text} dicts.

    Auto-captions repeat heavily due to scroll animation — same line shown
    on consecutive frames with new word-timing markup. We dedupe by tracking
    seen clean-text lines.
    """
    segments = []
    seen_lines: set[str] = set()
    current_start: float | None = None

    for raw_line in vtt_text.splitlines():
        m = SEGMENT_RE.search(raw_line)
        if m:
            current_start = ts_to_seconds(m.group(1))
            continue
        if raw_line.startswith(("WEBVTT", "Kind:", "Language:")):
            current_start = None  # reset on headers
            continue
        if not raw_line.strip():
            continue  # blank lines: keep current_start, don't emit

        clean = TAG_RE.sub("", raw_line).strip()
        clean = BRACKETED_RE.sub("", clean).strip()
        clean = re.sub(r"\s+", " ", clean)
        if not clean or clean in seen_lines:
            continue
        seen_lines.add(clean)
        segments.append({"ts": current_start, "line": clean})

    full_text = " ".join(s["line"] for s in segments)
    return full_text, segments


def yt_dlp_subs(video_id: str, out_dir: Path) -> Path | None:
    """Call yt-dlp to fetch auto-subs for one video. Returns path to the .vtt
    file (or None if no auto-subs available)."""
    cmd = [
        "yt-dlp", "--skip-download", "--write-auto-subs",
        "--sub-langs", "en.*", "--sub-format", "vtt",
        "-o", str(out_dir / "%(id)s.%(ext)s"),
        f"https://www.youtube.com/watch?v={video_id}",
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    # yt-dlp may exit non-zero (e.g. HTTP 429 on a secondary locale variant)
    # even when it successfully wrote the primary .vtt. Check for files first;
    # only surface the error if no .vtt landed.
    candidates = list(out_dir.glob(f"{video_id}*.vtt"))
    if not candidates:
        if p.returncode != 0:
            last = p.stderr.strip().splitlines()[-1] if p.stderr else "unknown"
            print(f"  ! yt-dlp failed for {video_id}: {last}", file=sys.stderr)
        return None
    # Prefer the plainest filename when multiple variants landed
    for suffix in (".en.vtt", ".en-US.vtt", ".en-orig.vtt"):
        candidate = out_dir / f"{video_id}{suffix}"
        if candidate.exists():
            return candidate
    return candidates[0]


def yt_dlp_meta(video_id: str) -> dict:
    """Fetch title / duration / upload_date via yt-dlp metadata."""
    fmt = "%(id)s\t%(title)s\t%(duration)s\t%(upload_date)s"
    cmd = ["yt-dlp", "--skip-download", "--no-warnings", "--print", fmt,
           f"https://www.youtube.com/watch?v={video_id}"]
    p = subprocess.run(cmd, capture_output=True, text=True, check=False)
    line = (p.stdout.strip().splitlines() or [""])[-1]
    parts = line.split("\t")
    if len(parts) < 4:
        return {"video_id": video_id, "title": "", "duration_seconds": None, "upload_date": None}
    vid, title, duration, upload_date = parts[:4]
    return {
        "video_id": vid,
        "title": title,
        "duration_seconds": int(duration) if duration.isdigit() else None,
        "upload_date": upload_date if upload_date != "NA" else None,
    }


def fetch_one(coach_slug: str, video_id: str) -> dict | None:
    """Fetch + parse one video's transcript. Returns the transcript dict, or
    None if it was already cached or failed."""
    tdir = transcripts_dir(coach_slug)
    out_path = tdir / f"{video_id}.json"
    if out_path.exists():
        print(f"  - {video_id}  already cached, skipping")
        return None

    tdir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        vtt_path = yt_dlp_subs(video_id, tmp_path)
        if not vtt_path:
            print(f"  ! {video_id}  no auto-captions available")
            return None
        full_text, segments = parse_vtt(vtt_path.read_text())

    meta = yt_dlp_meta(video_id)
    chars_per_minute = (
        len(full_text) * 60 / meta["duration_seconds"]
        if meta["duration_seconds"] else None
    )
    record = {
        **meta,
        "fetched_at": now_iso(),
        "source": "youtube-auto",
        "char_count": len(full_text),
        "chars_per_minute": round(chars_per_minute, 1) if chars_per_minute else None,
        "text": full_text,
        "segments": segments,
    }
    out_path.write_text(json.dumps(record, indent=2))
    dur = f"{meta['duration_seconds']//60}:{meta['duration_seconds']%60:02d}" if meta["duration_seconds"] else "?"
    print(f"  ✓ {video_id}  {dur:>6s}  {len(full_text):>6d} chars  {meta['title'][:60]}")
    return record


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coach", required=True)
    ap.add_argument("--video-ids", nargs="+", help="Specific ids to fetch (otherwise: all new per manifest)")
    ap.add_argument("--limit", type=int, default=None, help="Stop after N new fetches")
    args = ap.parse_args()

    manifest = Manifest.load(args.coach)

    if args.video_ids:
        candidates = args.video_ids
    else:
        # Re-discover from the cached channel_url
        if not manifest.channel_url:
            print(f"No channel_url in manifest for {args.coach}; run discover.py first.", file=sys.stderr)
            return 2
        # Import lazily to avoid yt-dlp call when --video-ids is provided
        from discover import list_channel_videos
        all_vids = list(list_channel_videos(manifest.channel_url, args.limit))
        candidates = [v["video_id"] for v in all_vids if not manifest.has_seen(v["video_id"])]

    fetched = 0
    skipped = 0
    failed = 0
    for vid in candidates:
        if args.limit and fetched >= args.limit:
            break
        out_path = transcripts_dir(args.coach) / f"{vid}.json"
        if out_path.exists():
            skipped += 1
            continue
        record = fetch_one(args.coach, vid)
        if record:
            fetched += 1
            manifest.mark_seen(vid)
        else:
            failed += 1

    manifest.last_run = now_iso()
    manifest.save()

    print()
    print(f"Fetched: {fetched}  Skipped (cached): {skipped}  Failed: {failed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
