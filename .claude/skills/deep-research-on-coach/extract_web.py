"""Web + Substack readable-text extractor.

For every `approved` document with `source_type` in `{web_article,
substack_post}` whose `schema_version` is older than CURRENT_DOCUMENT_SCHEMA,
fetch the HTML and reduce it to clean readable text via trafilatura (if
available) → readability-lxml → fallback regex strip.
"""

from __future__ import annotations

import html
import re
import urllib.request
from typing import Any

from _constants import CURRENT_DOCUMENT_SCHEMA


def _trafilatura_extract(html_text: str, url: str) -> str | None:
    try:
        import trafilatura  # type: ignore
    except ImportError:
        return None
    try:
        return trafilatura.extract(html_text, url=url, include_comments=False, include_tables=True) or None
    except Exception:
        return None


def _readability_extract(html_text: str) -> str | None:
    try:
        from readability import Document  # type: ignore
    except ImportError:
        return None
    try:
        doc = Document(html_text)
        cleaned_html = doc.summary()
        text = re.sub(r"<[^>]+>", " ", cleaned_html)
        text = html.unescape(text)
        text = re.sub(r"\s+", " ", text).strip()
        return text or None
    except Exception:
        return None


def _regex_strip(html_text: str) -> str:
    text = re.sub(r"<script.*?</script>", " ", html_text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _fetch_html(url: str) -> str | None:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (deep-research-on-coach web)",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception:
        return None


def _extract_text(html_text: str, url: str) -> str | None:
    text = _trafilatura_extract(html_text, url) or _readability_extract(html_text)
    if text:
        return text
    return _regex_strip(html_text) or None


def run(slug: str, supabase: Any = None, force: bool = False, **_: Any) -> dict:
    if supabase is None:
        print("[extract_web] no supabase client — skipping (stub mode).")
        return {"ok": True, "slug": slug, "extracted": 0}

    coach_res = supabase.table("coaches").select("id").eq("slug", slug).limit(1).execute()
    if not coach_res.data:
        print(f"[extract_web] coach {slug!r} not found.")
        return {"ok": False, "slug": slug, "extracted": 0}
    coach_id = coach_res.data[0]["id"]

    query = (
        supabase.table("documents")
        .select("id, url, schema_version, status, source_type, title")
        .eq("coach_id", coach_id)
        .in_("source_type", ["web_article", "substack_post"])
        .in_("status", ["approved", "extracted", "failed"] if force else ["approved", "failed"])
    )
    docs = (query.execute().data) or []

    targets = []
    for d in docs:
        if d["status"] == "extracted" and not force:
            if (d.get("schema_version") or 0) >= CURRENT_DOCUMENT_SCHEMA:
                continue
        targets.append(d)

    if not targets:
        print("Nothing to extract.")
        return {"ok": True, "slug": slug, "extracted": 0}

    print(f"[extract_web] {len(targets)} target docs")

    extracted = 0
    failed = 0
    for d in targets:
        print(f"[extract_web]   {d['url']}")
        html_text = _fetch_html(d["url"])
        if not html_text:
            supabase.table("documents").update(
                {
                    "status": "failed",
                    "last_attempt_at": "now()",
                    "last_attempt_error": "HTML fetch failed",
                }
            ).eq("id", d["id"]).execute()
            failed += 1
            continue

        text = _extract_text(html_text, d["url"])
        if not text or len(text) < 200:
            supabase.table("documents").update(
                {
                    "status": "failed",
                    "last_attempt_at": "now()",
                    "last_attempt_error": "Extraction produced <200 chars — likely paywall or JS-rendered",
                }
            ).eq("id", d["id"]).execute()
            failed += 1
            continue

        supabase.table("documents").update(
            {
                "content_text": text,
                "char_count": len(text),
                "language": "en",
                "status": "extracted",
                "schema_version": CURRENT_DOCUMENT_SCHEMA,
                "extracted_at": "now()",
                "last_attempt_at": "now()",
                "last_attempt_error": None,
            }
        ).eq("id", d["id"]).execute()
        extracted += 1

    print(f"[extract_web] extracted={extracted} failed={failed}")
    return {"ok": True, "slug": slug, "extracted": extracted, "failed": failed}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
