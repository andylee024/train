"""Discover stage — fan-out search across YT / Scribd / Web / Substack.

Reads coach config from `public.coaches.canonical_urls`. Writes candidates to
`public.documents` with status='pending_approval'. Idempotent via the
`unique (coach_id, url)` constraint plus `on conflict do nothing`.

Confidence rules (per TR-350):
  - Canonical-channel YT video                                  → 0.9
  - Non-canonical-channel YT (cross-channel collab, guest spot) → 0.4
  - Scribd / Substack from a confirmed coach domain             → 0.8
  - Open web from unknown domains                               → 0.5
"""

from __future__ import annotations

from typing import Any

from _search import (
    estimate_cost,
    web_search,
    youtube_canonical_channel_videos,
    youtube_text_search,
)


def _ensure_coach(supabase: Any, slug: str) -> str:
    """Get or create the coaches row; return its UUID."""
    res = supabase.table("coaches").select("id, canonical_urls").eq("slug", slug).limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    insert = (
        supabase.table("coaches")
        .insert({"slug": slug, "display_name": slug, "canonical_urls": {}, "signals": {}})
        .execute()
    )
    return insert.data[0]["id"]


def _coach_meta(supabase: Any, slug: str) -> dict[str, Any]:
    res = supabase.table("coaches").select("id, display_name, canonical_urls").eq("slug", slug).limit(1).execute()
    if not res.data:
        return {}
    return res.data[0]


def run(
    slug: str,
    supabase: Any = None,
    force: bool = False,
    max_discovery_cost: float = 15.0,
    **_: Any,
) -> dict:
    if supabase is None:
        print("[discover] no supabase client — skipping (stub mode).")
        return {"ok": True, "slug": slug, "discovered": 0}

    coach_id = _ensure_coach(supabase, slug)
    coach = _coach_meta(supabase, slug)
    display_name = coach.get("display_name") or slug
    canonical_urls = coach.get("canonical_urls") or {}

    print(f"[discover] slug={slug} display_name={display_name!r}")

    candidates: list[dict[str, Any]] = []
    search_count = 0

    yt_canonical = canonical_urls.get("youtube")
    canonical_video_ids: set[str] = set()
    if yt_canonical:
        print(f"[discover]   canonical YT channel: {yt_canonical}")
        canonical_hits = youtube_canonical_channel_videos(yt_canonical, limit=30)
        for h in canonical_hits:
            canonical_video_ids.add(h["raw"]["video_id"])
            candidates.append(h)
        search_count += 1
        print(f"[discover]   canonical channel returned {len(canonical_hits)} videos")

    if estimate_cost(search_count + 1) > max_discovery_cost:
        print(f"[discover]   skipping YT text search: would exceed max_discovery_cost ${max_discovery_cost}")
    else:
        yt_search_hits = youtube_text_search(display_name, limit=20)
        for h in yt_search_hits:
            if yt_canonical and h["raw"].get("video_id") not in canonical_video_ids:
                h["confidence"] = 0.4
            candidates.append(h)
        search_count += 1
        print(f"[discover]   YT text search returned {len(yt_search_hits)} candidates")

    web_queries = [
        f'"{display_name}" site:scribd.com',
        f'"{display_name}" training',
        f'"{display_name}" programming',
    ]
    for q in web_queries:
        if estimate_cost(search_count + 1) > max_discovery_cost:
            print(f"[discover]   stopping web search: would exceed max_discovery_cost ${max_discovery_cost}")
            break
        web_hits = web_search(q, limit=15)
        candidates.extend(web_hits)
        search_count += 1
        print(f"[discover]   web search {q!r} → {len(web_hits)} candidates")

    # Deduplicate by URL, keeping highest-confidence entry
    by_url: dict[str, dict[str, Any]] = {}
    for c in candidates:
        existing = by_url.get(c["url"])
        if existing is None or c["confidence"] > existing["confidence"]:
            by_url[c["url"]] = c
    unique_candidates = list(by_url.values())

    inserted = 0
    skipped = 0
    by_type: dict[str, int] = {}
    by_confidence: dict[str, int] = {"high": 0, "med": 0, "low": 0}
    for c in unique_candidates:
        bucket = "high" if c["confidence"] >= 0.8 else "med" if c["confidence"] >= 0.5 else "low"
        by_confidence[bucket] += 1
        by_type[c["source_type"]] = by_type.get(c["source_type"], 0) + 1

        try:
            supabase.table("documents").insert(
                {
                    "coach_id": coach_id,
                    "source_type": c["source_type"],
                    "url": c["url"],
                    "title": c.get("title") or "",
                    "snippet": c.get("snippet") or "",
                    "status": "pending_approval",
                    "raw_metadata": c.get("raw") or {},
                }
            ).execute()
            inserted += 1
        except Exception as e:
            err_msg = str(e).lower()
            if "duplicate" in err_msg or "unique" in err_msg or "23505" in err_msg:
                skipped += 1
            else:
                print(f"[discover]   insert error for {c['url']}: {e}")

    print()
    print(
        f"Discovered {inserted} candidates: "
        f"{{yt: {by_type.get('yt_video', 0)}, "
        f"scribd: {by_type.get('scribd_doc', 0)}, "
        f"web: {by_type.get('web_article', 0)}, "
        f"substack: {by_type.get('substack_post', 0)}}}"
    )
    print(f"  by confidence: high={by_confidence['high']} med={by_confidence['med']} low={by_confidence['low']}")
    print(f"  search calls: {search_count} · est cost: ${estimate_cost(search_count):.2f}")
    if skipped:
        print(f"  skipped {skipped} URLs already in documents (idempotent)")

    return {
        "ok": True,
        "slug": slug,
        "discovered": inserted,
        "skipped": skipped,
        "by_type": by_type,
    }


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
