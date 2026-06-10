"""deep-research-on-coach — orchestrator.

Runs the pipeline stages in order:
    discover → approve → extract_yt → extract_scribd → extract_web

Each stage module exposes `run(slug, supabase, **kwargs) -> dict`. After all
stages run, prints a summary table of stage results + final document counts
by status, then exits 0 (all ok) or 1 (any stage reported ok=False).
"""

from __future__ import annotations

import argparse
import importlib
import sys
from pathlib import Path

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


def _print_summary(slug: str, supabase, stage_results: list[dict]) -> None:
    print()
    print("─" * 70)
    print(f"  Run summary · slug={slug}")
    print("─" * 70)
    for entry in stage_results:
        for stage_name, result in entry.items():
            ok = "✓" if result.get("ok") else "✗"
            extras = []
            for key in ("discovered", "approved", "rejected", "extracted", "failed", "skipped"):
                if key in result:
                    extras.append(f"{key}={result[key]}")
            print(f"  {ok} {stage_name:18s}  " + " ".join(extras))

    if supabase is None:
        print()
        print("  (No Supabase client — counts unavailable.)")
        return

    coach_res = supabase.table("coaches").select("id").eq("slug", slug).limit(1).execute()
    if not coach_res.data:
        return
    coach_id = coach_res.data[0]["id"]

    all_rows = (
        supabase.table("documents")
        .select("status")
        .eq("coach_id", coach_id)
        .execute()
        .data
    ) or []
    by_status: dict[str, int] = {}
    for r in all_rows:
        s = r["status"]
        by_status[s] = by_status.get(s, 0) + 1

    print()
    print(f"  documents totals for {slug}:")
    for status in ("pending_approval", "approved", "rejected", "extracted", "failed"):
        if status in by_status:
            print(f"    {status:18s}  {by_status[status]:>4}")
    total = sum(by_status.values())
    print(f"    {'TOTAL':18s}  {total:>4}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="deep-research-on-coach pipeline")
    parser.add_argument("--slug", required=True, help="coach slug (matches public.coaches.slug)")
    parser.add_argument("--force", action="store_true", help="ignore schema_version check; re-extract everything")
    parser.add_argument(
        "--max-discovery-cost",
        type=float,
        default=DEFAULT_MAX_DISCOVERY_COST,
        help=f"soft cap on discover-stage search API spend in USD (default {DEFAULT_MAX_DISCOVERY_COST})",
    )
    parser.add_argument(
        "--only",
        nargs="+",
        choices=STAGES,
        help="run only the named stages (skip the others)",
    )
    args = parser.parse_args(argv)

    supabase = get_supabase_client()
    if supabase is None:
        print(
            "[run] note: no Supabase client (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set) "
            "— stages will run in stub mode."
        )

    stages_to_run = args.only or STAGES
    stage_results: list[dict] = []
    any_failed = False
    for stage in stages_to_run:
        module = importlib.import_module(stage)
        result = module.run(
            args.slug,
            supabase=supabase,
            force=args.force,
            max_discovery_cost=args.max_discovery_cost,
        )
        stage_results.append({stage: result})
        if not result.get("ok", True):
            print(f"[run] {stage} reported ok=False — halting pipeline.")
            any_failed = True
            break

    _print_summary(args.slug, supabase, stage_results)
    print()
    return 1 if any_failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
