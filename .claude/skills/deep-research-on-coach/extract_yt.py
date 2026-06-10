"""YouTube auto-captions extractor — STUB.

Replaced by TR-352 with the real yt-dlp-based auto-caption pull + plain-text
normalization + content_text persistence.
"""

from typing import Any


def run(slug: str, supabase: Any = None, **kwargs: Any) -> dict:
    print("[extract_yt] ok")
    return {"ok": True, "slug": slug, "extracted": 0}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
