"""Discover stage — STUB.

Replaced by TR-350 with the real fan-out search across YT / Scribd / Web /
Substack. Stage contract: `run(slug, supabase, **kwargs) -> dict`.
"""

from typing import Any


def run(slug: str, supabase: Any = None, **kwargs: Any) -> dict:
    print("[discover] ok")
    return {"ok": True, "slug": slug, "discovered": 0}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
