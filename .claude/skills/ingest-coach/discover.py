#!/usr/bin/env python3
"""Stage 1 — Discover: list videos on a coach's YouTube channel.

Uses `yt-dlp --flat-playlist` (no video downloads, just metadata) and diffs
against the coach's manifest to emit the list of new (unseen) video ids.

Run:
    python3 .claude/skills/ingest-coach/discover.py \\
        --coach catalyst-athletics \\
        --channel https://www.youtube.com/@catalystathletics/videos \\
        [--limit 80]

Re-runs are cheap and idempotent: no manifest mutation happens here; we only
report what's new. Stage 2 (fetch) is responsible for marking videos as seen.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from typing import Iterator

from manifest import Manifest


def list_channel_videos(channel_url: str, limit: int | None) -> Iterator[dict]:
    """Stream `yt-dlp --flat-playlist -J`-style metadata for a channel.

    We use `--print '%(...)s'` lines instead of `-J` because -J on a large
    channel buffers the entire JSON in memory; the print-line form streams.
    """
    fmt = "%(id)s\t%(title)s\t%(duration)s\t%(upload_date)s"
    cmd = ["yt-dlp", "--flat-playlist", "--print", fmt]
    if limit:
        cmd += ["--playlist-items", f"1:{limit}"]
    cmd += [channel_url]
    p = subprocess.run(cmd, capture_output=True, text=True, check=True)
    for line in p.stdout.splitlines():
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        vid, title, duration, upload_date = parts[:4]
        yield {
            "video_id": vid,
            "title": title,
            "duration_seconds": int(duration) if duration.isdigit() else None,
            "upload_date": upload_date if upload_date != "NA" else None,
        }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coach", required=True, help="Coach slug (e.g. catalyst-athletics)")
    ap.add_argument("--channel", required=True, help="Channel URL (youtube.com/@handle/videos)")
    ap.add_argument("--limit", type=int, default=None, help="Cap on videos to list")
    ap.add_argument("--json", action="store_true", help="Emit JSON instead of human-readable")
    args = ap.parse_args()

    manifest = Manifest.load(args.coach)
    manifest.channel_url = args.channel  # remember channel for later runs

    seen_at_start = set(manifest.seen_video_ids)
    all_videos = list(list_channel_videos(args.channel, args.limit))
    new_videos = [v for v in all_videos if v["video_id"] not in seen_at_start]

    if args.json:
        json.dump(
            {"coach": args.coach, "total_listed": len(all_videos),
             "already_seen": len(seen_at_start), "new": new_videos},
            sys.stdout, indent=2
        )
        print()
    else:
        print(f"Coach:        {args.coach}")
        print(f"Channel:      {args.channel}")
        print(f"Total listed: {len(all_videos)}")
        print(f"Already seen: {len(seen_at_start)}")
        print(f"New videos:   {len(new_videos)}")
        for v in new_videos[:20]:
            dur = f"{v['duration_seconds']//60}:{v['duration_seconds']%60:02d}" if v['duration_seconds'] else "?"
            print(f"  {v['video_id']:12s}  {dur:>6s}  {v['title'][:70]}")
        if len(new_videos) > 20:
            print(f"  ... and {len(new_videos) - 20} more")

    # Persist channel_url even if no new videos (cheap)
    manifest.save()
    return 0


if __name__ == "__main__":
    sys.exit(main())
