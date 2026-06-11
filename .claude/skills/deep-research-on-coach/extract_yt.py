"""YouTube auto-captions extractor.

For every `approved` document with `source_type = 'yt_video'` whose recorded
`schema_version` is older than `_constants.CURRENT_DOCUMENT_SCHEMA` (unless
`--force`), pull auto-captions via yt-dlp, normalize to plain text, and
update the document:
  - content_text  — the cleaned transcript
  - char_count    — len(content_text)
  - language      — detected lang code from yt-dlp
  - status        — 'extracted' on success, 'failed' on permanent error
  - schema_version, extracted_at, last_attempt_at, last_attempt_error
"""

from __future__ import annotations

import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from _constants import CURRENT_DOCUMENT_SCHEMA


VTT_TS_LINE = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->")
VTT_HEADER = re.compile(r"^(WEBVTT|Kind:|Language:|NOTE\b)")


def _vtt_to_text(vtt_path: Path) -> tuple[str, str | None]:
    lines: list[str] = []
    seen: set[str] = set()
    language: str | None = None

    for raw in vtt_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line:
            continue
        if VTT_HEADER.match(line):
            if line.lower().startswith("language:"):
                language = line.split(":", 1)[1].strip() or None
            continue
        if VTT_TS_LINE.match(line):
            continue
        cleaned = re.sub(r"<[^>]+>", "", line).strip()
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        lines.append(cleaned)

    return ("\n".join(lines), language)


def _fetch_captions(yt_url: str) -> tuple[str, str | None] | None:
    with tempfile.TemporaryDirectory() as tmp:
        out_template = os.path.join(tmp, "captions.%(ext)s")
        try:
            subprocess.run(
                [
                    "yt-dlp",
                    "--skip-download",
                    "--write-auto-subs",
                    "--sub-lang",
                    "en",
                    "--sub-format",
                    "vtt",
                    "-o",
                    out_template,
                    yt_url,
                ],
                capture_output=True,
                text=True,
                timeout=90,
                check=False,
            )
        except FileNotFoundError:
            return None
        vtts = list(Path(tmp).glob("*.vtt"))
        if not vtts:
            return None
        return _vtt_to_text(vtts[0])


def run(slug: str, supabase: Any = None, force: bool = False, **_: Any) -> dict:
    if supabase is None:
        print("[extract_yt] no supabase client — skipping (stub mode).")
        return {"ok": True, "slug": slug, "extracted": 0}

    coach_res = supabase.table("coaches").select("id").eq("slug", slug).limit(1).execute()
    if not coach_res.data:
        print(f"[extract_yt] coach {slug!r} not found.")
        return {"ok": False, "slug": slug, "extracted": 0}
    coach_id = coach_res.data[0]["id"]

    query = (
        supabase.table("documents")
        .select("id, url, schema_version, status, title")
        .eq("coach_id", coach_id)
        .eq("source_type", "yt_video")
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

    print(f"[extract_yt] {len(targets)} target docs")

    extracted = 0
    failed = 0
    for d in targets:
        title = (d.get("title") or "")[:60]
        print(f"[extract_yt]   {d['url']}  ({title!r})")
        result = _fetch_captions(d["url"])
        if not result:
            supabase.table("documents").update(
                {
                    "status": "failed",
                    "last_attempt_at": "now()",
                    "last_attempt_error": "no auto-captions available",
                }
            ).eq("id", d["id"]).execute()
            failed += 1
            continue
        text, language = result
        if not text:
            supabase.table("documents").update(
                {
                    "status": "failed",
                    "last_attempt_at": "now()",
                    "last_attempt_error": "empty caption text",
                }
            ).eq("id", d["id"]).execute()
            failed += 1
            continue

        supabase.table("documents").update(
            {
                "content_text": text,
                "char_count": len(text),
                "language": language or "en",
                "status": "extracted",
                "schema_version": CURRENT_DOCUMENT_SCHEMA,
                "extracted_at": "now()",
                "last_attempt_at": "now()",
                "last_attempt_error": None,
            }
        ).eq("id", d["id"]).execute()
        extracted += 1

    print(f"[extract_yt] extracted={extracted} failed={failed}")
    return {"ok": True, "slug": slug, "extracted": extracted, "failed": failed}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
