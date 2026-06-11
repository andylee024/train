"""Search query construction helpers for the discover stage.

We don't have a vendor-locked search API. The discover stage relies on:
  - yt-dlp's channel/search endpoints for YouTube
  - DuckDuckGo HTML for open-web search (no API key required, low cost)
  - URL-pattern filtering for Scribd / Substack subdomain detection

Each helper returns a list[dict] of candidate hits:
  {source_type, url, title, snippet, confidence, raw}

Confidence rules (per TR-350):
  - Canonical-channel YT video                                 → 0.9
  - Non-canonical-channel YT                                   → 0.4 (flagged low_confidence)
  - Scribd / Substack from a confirmed coach domain            → 0.8
  - Open web from unknown domains                              → 0.5
"""

from __future__ import annotations

import json
import re
import subprocess
import urllib.parse
import urllib.request
from typing import Any


# ── YouTube ──────────────────────────────────────────────────────────────
def youtube_canonical_channel_videos(channel_url: str, limit: int = 30) -> list[dict[str, Any]]:
    """Pull recent videos from a known canonical channel via yt-dlp."""
    try:
        result = subprocess.run(
            [
                "yt-dlp",
                "--flat-playlist",
                "--print",
                "%(id)s|%(title)s|%(view_count)s",
                "--playlist-end",
                str(limit),
                channel_url,
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
    except FileNotFoundError:
        return []

    if result.returncode != 0:
        return []

    hits: list[dict[str, Any]] = []
    for line in result.stdout.strip().splitlines():
        parts = line.split("|", 2)
        if len(parts) < 2:
            continue
        vid_id = parts[0]
        title = parts[1]
        view_count = parts[2] if len(parts) > 2 else "NA"
        url = f"https://www.youtube.com/watch?v={vid_id}"
        hits.append(
            {
                "source_type": "yt_video",
                "url": url,
                "title": title,
                "snippet": "",
                "confidence": 0.9,
                "raw": {"view_count": view_count, "video_id": vid_id, "source": "canonical_channel"},
            }
        )
    return hits


def youtube_text_search(display_name: str, limit: int = 20) -> list[dict[str, Any]]:
    """Text-search YouTube via yt-dlp's ytsearchN: prefix (no API key needed)."""
    try:
        result = subprocess.run(
            [
                "yt-dlp",
                "--flat-playlist",
                "--print",
                "%(id)s|%(title)s|%(channel)s",
                f"ytsearch{limit}:{display_name}",
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
    except FileNotFoundError:
        return []

    if result.returncode != 0:
        return []

    hits: list[dict[str, Any]] = []
    for line in result.stdout.strip().splitlines():
        parts = line.split("|", 2)
        if len(parts) < 2:
            continue
        vid_id = parts[0]
        title = parts[1]
        channel = parts[2] if len(parts) > 2 else ""
        url = f"https://www.youtube.com/watch?v={vid_id}"
        hits.append(
            {
                "source_type": "yt_video",
                "url": url,
                "title": title,
                "snippet": "",
                # Non-canonical channel default — discover.py downgrades if
                # canonical channel is known and this isn't it.
                "confidence": 0.4,
                "raw": {"channel": channel, "video_id": vid_id, "source": "text_search"},
            }
        )
    return hits


# ── Open-web search (DuckDuckGo HTML, no API key) ────────────────────────
def web_search(query: str, limit: int = 20) -> list[dict[str, Any]]:
    """DuckDuckGo HTML endpoint search — no API key, no rate limit reliably published."""
    url = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": query})
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (deep-research-on-coach)"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception:
        return []

    # Parse <a class="result__a" href="...">title</a>  + result__snippet
    hits: list[dict[str, Any]] = []
    pattern_a = re.compile(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)
    matches = pattern_a.findall(html)
    seen_urls: set[str] = set()
    for raw_href, raw_title in matches:
        href = urllib.parse.unquote(raw_href)
        # DuckDuckGo wraps in a redirect — strip it
        if href.startswith("//duckduckgo.com/l/?"):
            parsed = urllib.parse.urlparse(href)
            qs = urllib.parse.parse_qs(parsed.query)
            target = qs.get("uddg", [None])[0]
            if target:
                href = target
        if not href.startswith("http"):
            continue
        if href in seen_urls:
            continue
        seen_urls.add(href)
        title = re.sub(r"<[^>]+>", "", raw_title).strip()
        source_type = classify_url(href)
        hits.append(
            {
                "source_type": source_type,
                "url": href,
                "title": title,
                "snippet": "",
                "confidence": confidence_for(source_type, href),
                "raw": {"source": "ddg"},
            }
        )
        if len(hits) >= limit:
            break
    return hits


def classify_url(url: str) -> str:
    """Map a URL to a source_type per the enum."""
    lower = url.lower()
    if "scribd.com" in lower:
        return "scribd_doc"
    if ".substack.com" in lower:
        return "substack_post"
    if "youtube.com" in lower or "youtu.be" in lower:
        return "yt_video"
    return "web_article"


def confidence_for(source_type: str, url: str) -> float:
    """Default confidence for an open-web result by source_type."""
    if source_type == "scribd_doc" or source_type == "substack_post":
        return 0.8
    if source_type == "yt_video":
        return 0.4
    return 0.5


# ── Cost estimation ──────────────────────────────────────────────────────
COST_PER_SEARCH_USD = 0.02
"""Conservative per-search-call cost estimate. Used by --max-discovery-cost."""


def estimate_cost(num_searches: int) -> float:
    return num_searches * COST_PER_SEARCH_USD
