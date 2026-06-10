"""Scribd PDF extractor — STUB.

Replaced by TR-353 with the real Scribd PDF download + text extraction
(pdfplumber/pypdf) + storage_path persistence.
"""

from typing import Any


def run(slug: str, supabase: Any = None, **kwargs: Any) -> dict:
    print("[extract_scribd] ok")
    return {"ok": True, "slug": slug, "extracted": 0}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
