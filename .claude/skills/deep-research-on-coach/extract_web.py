"""Web + Substack readable-text extractor — STUB.

Replaced by TR-354 with the real HTTP fetch + readability/trafilatura clean
extraction + content_text persistence.
"""

from typing import Any


def run(slug: str, supabase: Any = None, **kwargs: Any) -> dict:
    print("[extract_web] ok")
    return {"ok": True, "slug": slug, "extracted": 0}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
