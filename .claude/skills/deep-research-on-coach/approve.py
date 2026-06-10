"""Approve stage — surface pending_approval rows + coach signals/avatar refresh.

Lists pending_approval documents for the coach, ordered by (source_type,
confidence desc, created_at). Operator approves/rejects via a simple TTY
interaction OR (when stdin isn't a TTY) auto-approves rows above an
accept-threshold and prints a summary so the operator can review the audit
log afterward.

Also refreshes coach signals (YT subscriber count, avatar URL) from the
canonical YT channel if `coaches.canonical_urls.youtube` is set.
"""

from __future__ import annotations

import json
import subprocess
import sys
from typing import Any


AUTO_APPROVE_CONFIDENCE = 0.9  # canonical-channel-only by default


def _refresh_signals(supabase: Any, slug: str) -> dict[str, Any]:
    """Refresh signals.youtube and avatar_url from the canonical YT channel."""
    res = supabase.table("coaches").select("id, canonical_urls, signals").eq("slug", slug).limit(1).execute()
    if not res.data:
        return {}
    coach = res.data[0]
    canonical = coach.get("canonical_urls") or {}
    yt_channel = canonical.get("youtube")
    if not yt_channel:
        return {}

    try:
        out = subprocess.run(
            ["yt-dlp", "--skip-download", "--playlist-items", "0", "-J", yt_channel],
            capture_output=True,
            text=True,
            timeout=45,
            check=False,
        )
    except FileNotFoundError:
        return {}
    if out.returncode != 0 or not out.stdout.strip():
        return {}

    try:
        data = json.loads(out.stdout)
    except json.JSONDecodeError:
        return {}

    subs = data.get("channel_follower_count")
    # Find highest-res square thumbnail
    avatar_url: str | None = None
    for t in (data.get("thumbnails") or [])[::-1]:
        w = t.get("width")
        h = t.get("height")
        if w and h and w == h:
            avatar_url = t.get("url")
            break

    signals = coach.get("signals") or {}
    signals["youtube"] = {
        "subs": subs,
        "refreshed_at": "now()",  # placeholder; DB trigger updates updated_at
    }

    update_payload: dict[str, Any] = {"signals": signals}
    if avatar_url:
        update_payload["avatar_url"] = avatar_url

    supabase.table("coaches").update(update_payload).eq("id", coach["id"]).execute()
    return {"subs": subs, "avatar_url": avatar_url}


def _interactive_review(rows: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Per-row a/r/s prompt. Returns {approve: [ids], reject: [ids], skip: [ids]}."""
    approve: list[str] = []
    reject: list[str] = []
    skip: list[str] = []
    for row in rows:
        title = (row.get("title") or "")[:70]
        url = row.get("url") or ""
        st = row.get("source_type")
        conf = row.get("raw_metadata", {}) or {}
        print(f"\n[{st}] confidence={row.get('confidence', '?')}  title={title!r}")
        print(f"  {url}")
        ans = input("  (a)pprove / (r)eject / (s)kip / (q)uit: ").strip().lower()
        if ans == "q":
            break
        if ans == "a":
            approve.append(row["id"])
        elif ans == "r":
            reject.append(row["id"])
        else:
            skip.append(row["id"])
    return {"approve": approve, "reject": reject, "skip": skip}


def _auto_review(rows: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Non-TTY mode: auto-approve high-confidence rows; surface mediums + lows for audit."""
    approve: list[str] = []
    skip: list[str] = []
    for row in rows:
        conf = row.get("raw_metadata", {}).get("confidence_at_discover")
        # When confidence isn't recorded in raw_metadata, fall back on source_type heuristic
        confidence = conf if conf is not None else (
            0.9 if (row.get("raw_metadata") or {}).get("source") == "canonical_channel" else 0.5
        )
        if confidence >= AUTO_APPROVE_CONFIDENCE:
            approve.append(row["id"])
        else:
            skip.append(row["id"])
    return {"approve": approve, "reject": [], "skip": skip}


def run(slug: str, supabase: Any = None, **_: Any) -> dict:
    if supabase is None:
        print("[approve] no supabase client — skipping (stub mode).")
        return {"ok": True, "slug": slug, "approved": 0}

    coach_res = supabase.table("coaches").select("id").eq("slug", slug).limit(1).execute()
    if not coach_res.data:
        print(f"[approve] coach {slug!r} not found — run discover first.")
        return {"ok": False, "slug": slug, "approved": 0}
    coach_id = coach_res.data[0]["id"]

    # Refresh signals + avatar from canonical YT channel.
    signals = _refresh_signals(supabase, slug)
    if signals:
        subs = signals.get("subs")
        avatar = signals.get("avatar_url")
        if subs:
            print(f"[approve] refreshed signals: youtube subs={subs:,}")
        if avatar:
            print(f"[approve] refreshed avatar_url")

    pending_res = (
        supabase.table("documents")
        .select("id, source_type, url, title, raw_metadata")
        .eq("coach_id", coach_id)
        .eq("status", "pending_approval")
        .order("source_type")
        .order("created_at")
        .execute()
    )
    rows = pending_res.data or []
    if not rows:
        print("Nothing to approve.")
        return {"ok": True, "slug": slug, "approved": 0}

    print(f"[approve] {len(rows)} pending_approval rows")
    decisions = _interactive_review(rows) if sys.stdin.isatty() else _auto_review(rows)

    if decisions["approve"]:
        supabase.table("documents").update({"status": "approved"}).in_("id", decisions["approve"]).execute()
    if decisions["reject"]:
        supabase.table("documents").update({"status": "rejected"}).in_("id", decisions["reject"]).execute()

    print(
        f"[approve] approved={len(decisions['approve'])} "
        f"rejected={len(decisions['reject'])} "
        f"skipped={len(decisions['skip'])}"
    )
    return {
        "ok": True,
        "slug": slug,
        "approved": len(decisions["approve"]),
        "rejected": len(decisions["reject"]),
        "skipped": len(decisions["skip"]),
    }


if __name__ == "__main__":
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
