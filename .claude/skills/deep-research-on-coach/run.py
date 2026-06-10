"""deep-research-on-coach — orchestrator.

Runs the pipeline stages in order:
    discover → approve → extract_yt → extract_scribd → extract_web

Each stage is loaded as a module; stage modules expose a `run(slug, supabase,
**kwargs) -> dict` function.

CLI:
    python3 run.py --slug catalyst-athletics
    python3 run.py --slug catalyst-athletics --force
    python3 run.py --slug catalyst-athletics --max-discovery-cost 5
"""

from __future__ import annotations

import argparse
import importlib
import sys
from pathlib import Path

# Allow running this file directly (without -m) by adding parent dir to path.
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

from _constants import DEFAULT_MAX_DISCOVERY_COST  # noqa: E402


STAGES = [
    "discover",
    "approve",
    "extract_yt",
    "extract_scribd",
    "extract_web",
]


def get_supabase_client():
    """Returns a Supabase client if SUPABASE_URL + SUPABASE_KEY are set, else
    None. Stages must gracefully handle the None case (stubs do; live stages
    will refuse to write)."""
    import os
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        return None
    try:
        from supabase import create_client  # type: ignore
    except ImportError:
        return None
    return create_client(url, key)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="deep-research-on-coach pipeline")
    parser.add_argument("--slug", required=True, help="coach slug (matches public.coaches.slug)")
    parser.add_argument("--force", action="store_true", help="ignore schema_version check; re-extract everything")
    parser.add_argument("--max-discovery-cost", type=float, default=DEFAULT_MAX_DISCOVERY_COST,
                        help=f"soft cap on discover-stage search API spend in USD (default {DEFAULT_MAX_DISCOVERY_COST})")
    parser.add_argument("--only", nargs="+", choices=STAGES, help="run only the named stages")
    args = parser.parse_args(argv)

    supabase = get_supabase_client()
    if supabase is None:
        print("[run] note: no Supabase client (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set) — stages will run in stub mode.")

    stages_to_run = args.only or STAGES
    results: list[dict] = []
    for stage in stages_to_run:
        module = importlib.import_module(stage)
        result = module.run(
            args.slug,
            supabase=supabase,
            force=args.force,
            max_discovery_cost=args.max_discovery_cost,
        )
        results.append({stage: result})
        if not result.get("ok", True):
            print(f"[run] {stage} reported ok=False — halting pipeline.")
            return 1

    print()
    print(f"[run] done. slug={args.slug} stages={len(results)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
