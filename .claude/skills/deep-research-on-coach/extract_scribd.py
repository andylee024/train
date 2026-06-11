"""Scribd PDF extractor.

For every `approved` document with `source_type = 'scribd_doc'` whose
recorded `schema_version` is older than CURRENT_DOCUMENT_SCHEMA:
  1. Download the PDF (Scribd anti-scraping is best-effort)
  2. Persist binary to coach-content/<slug>/<document_id>.pdf
  3. Extract text via pdfplumber → pypdf fallback
  4. Update document row: content_text, char_count, storage_path, status
"""

from __future__ import annotations

import io
import urllib.request
from typing import Any

from _constants import CURRENT_DOCUMENT_SCHEMA, STORAGE_BUCKET


def _try_pdf_text(pdf_bytes: bytes) -> str | None:
    try:
        import pdfplumber  # type: ignore
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages = []
            for p in pdf.pages:
                t = p.extract_text() or ""
                if t.strip():
                    pages.append(t)
            return "\n\n".join(pages) if pages else None
    except ImportError:
        pass
    except Exception:
        pass

    try:
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for p in reader.pages:
            t = p.extract_text() or ""
            if t.strip():
                pages.append(t)
        return "\n\n".join(pages) if pages else None
    except ImportError:
        return None
    except Exception:
        return None


def _download_pdf(url: str) -> bytes | None:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (deep-research-on-coach scribd)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            ctype = resp.headers.get("Content-Type", "")
            data = resp.read()
            if "pdf" in ctype.lower() or data[:4] == b"%PDF":
                return data
            return None
    except Exception:
        return None


def _upload_to_storage(supabase: Any, slug: str, document_id: str, pdf_bytes: bytes) -> str | None:
    path = f"{slug}/{document_id}.pdf"
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=path,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )
        return path
    except Exception as e:
        print(f"[extract_scribd]   upload failed for {path}: {e}")
        return None


def run(slug: str, supabase: Any = None, force: bool = False, **_: Any) -> dict:
    if supabase is None:
        print("[extract_scribd] no supabase client — skipping (stub mode).")
        return {"ok": True, "slug": slug, "extracted": 0}

    coach_res = supabase.table("coaches").select("id").eq("slug", slug).limit(1).execute()
    if not coach_res.data:
        print(f"[extract_scribd] coach {slug!r} not found.")
        return {"ok": False, "slug": slug, "extracted": 0}
    coach_id = coach_res.data[0]["id"]

    query = (
        supabase.table("documents")
        .select("id, url, schema_version, status, title")
        .eq("coach_id", coach_id)
        .eq("source_type", "scribd_doc")
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

    print(f"[extract_scribd] {len(targets)} target docs")

    extracted = 0
    failed = 0
    for d in targets:
        print(f"[extract_scribd]   {d['url']}")
        pdf_bytes = _download_pdf(d["url"])
        if not pdf_bytes:
            supabase.table("documents").update(
                {
                    "status": "failed",
                    "last_attempt_at": "now()",
                    "last_attempt_error": "PDF download failed or non-PDF response",
                }
            ).eq("id", d["id"]).execute()
            failed += 1
            continue

        storage_path = _upload_to_storage(supabase, slug, d["id"], pdf_bytes)

        text = _try_pdf_text(pdf_bytes)
        if not text:
            supabase.table("documents").update(
                {
                    "storage_path": storage_path,
                    "status": "failed",
                    "last_attempt_at": "now()",
                    "last_attempt_error": "PDF text extraction returned empty (no pdfplumber/pypdf?)",
                }
            ).eq("id", d["id"]).execute()
            failed += 1
            continue

        supabase.table("documents").update(
            {
                "content_text": text,
                "char_count": len(text),
                "storage_path": storage_path,
                "status": "extracted",
                "schema_version": CURRENT_DOCUMENT_SCHEMA,
                "extracted_at": "now()",
                "last_attempt_at": "now()",
                "last_attempt_error": None,
            }
        ).eq("id", d["id"]).execute()
        extracted += 1

    print(f"[extract_scribd] extracted={extracted} failed={failed}")
    return {"ok": True, "slug": slug, "extracted": extracted, "failed": failed}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
