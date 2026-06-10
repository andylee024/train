"""Approve stage — STUB.

Replaced by TR-351 with the real operator-driven approval workflow + coach
signals/avatar refresh from YT canonical channel.
"""

from typing import Any


def run(slug: str, supabase: Any = None, **kwargs: Any) -> dict:
    print("[approve] ok")
    return {"ok": True, "slug": slug, "approved": 0}


if __name__ == "__main__":
    import sys
    s = sys.argv[1] if len(sys.argv) > 1 else "test"
    print(run(s))
