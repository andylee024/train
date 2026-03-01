#!/usr/bin/env python3
"""Import user-scoped CSV bundle into Supabase via REST."""

from __future__ import annotations

import argparse
import csv
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List


def load_env(path: Path) -> Dict[str, str]:
    vals: Dict[str, str] = {}
    if not path.exists():
        return vals
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        vals[k.strip()] = v.strip().strip('"').strip("'")
    return vals


def read_csv(path: Path) -> List[dict]:
    with path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    # Convert empty strings to nulls for DB nullable columns
    cleaned: List[dict] = []
    for row in rows:
        cleaned.append({k: (v if v != "" else None) for k, v in row.items()})
    return cleaned


def request_json(
    method: str, url: str, headers: dict, payload: object | None = None
) -> tuple[int, str, dict]:
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url=url, method=method, headers=headers, data=data)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.getcode(), body, dict(resp.headers.items())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, body, dict(e.headers.items())


def chunked(items: List[dict], size: int) -> List[List[dict]]:
    return [items[i : i + size] for i in range(0, len(items), size)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Import CSV bundle to Supabase via REST")
    parser.add_argument("--dir", required=True, help="Bundle directory with CSV files")
    parser.add_argument("--env", default=".env", help="Path to .env")
    parser.add_argument("--chunk", type=int, default=250, help="Batch size")
    parser.add_argument("--wipe-user", action="store_true", help="Delete existing rows for TRAIN_USER_ID first")
    args = parser.parse_args()

    env = load_env(Path(args.env))
    base_url = env.get("SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = env.get("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY") or env.get("SUPABASE_KEY")
    user_id = env.get("TRAIN_USER_ID") or os.getenv("TRAIN_USER_ID")

    if not base_url or not key:
        raise SystemExit("Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_KEY")
    if not user_id:
        raise SystemExit("Missing TRAIN_USER_ID")

    bundle = Path(args.dir)
    files = {
        "exercises": bundle / "exercises.csv",
        "workouts": bundle / "workouts.csv",
        "workout_exercises": bundle / "workout_exercises.csv",
        "exercise_sets": bundle / "exercise_sets.csv",
    }
    for name, p in files.items():
        if not p.exists():
            raise SystemExit(f"Missing file: {name} -> {p}")

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    if args.wipe_user:
        # Child -> parent delete order
        for table in ["exercise_sets", "workout_exercises", "workouts", "exercises"]:
            url = f"{base_url}/rest/v1/{table}?user_id=eq.{urllib.parse.quote(user_id)}"
            code, body, _ = request_json("DELETE", url, {**headers, "Prefer": "return=minimal"})
            if code not in (200, 204):
                raise SystemExit(f"Delete failed for {table}: HTTP {code} {body}")

    # Parent -> child insert order
    for table in ["exercises", "workouts", "workout_exercises", "exercise_sets"]:
        rows = read_csv(files[table])
        if not rows:
            print(f"{table}: 0 rows (skipped)")
            continue

        for i, batch in enumerate(chunked(rows, args.chunk), start=1):
            url = f"{base_url}/rest/v1/{table}?on_conflict=id"
            code, body, _ = request_json(
                "POST",
                url,
                {
                    **headers,
                    "Prefer": "resolution=merge-duplicates,return=minimal",
                },
                payload=batch,
            )
            if code not in (200, 201, 204):
                raise SystemExit(f"Insert failed table={table} batch={i}: HTTP {code} {body}")
        print(f"{table}: imported {len(rows)}")

    # Verify counts for this user using Content-Range totals
    counts: Dict[str, int] = {}
    for table in ["exercises", "workouts", "workout_exercises", "exercise_sets"]:
        q = urllib.parse.quote(f"eq.{user_id}")
        url = f"{base_url}/rest/v1/{table}?select=id&user_id={q}&limit=1"
        code, body, resp_headers = request_json(
            "GET",
            url,
            {**headers, "Prefer": "count=exact"},
        )
        if code not in (200, 206):
            raise SystemExit(f"Count query failed for {table}: HTTP {code} {body}")
        content_range = resp_headers.get("Content-Range") or resp_headers.get("content-range")
        if not content_range or "/" not in content_range:
            raise SystemExit(f"Missing Content-Range for {table}: {content_range}")
        try:
            counts[table] = int(content_range.split("/")[-1])
        except ValueError as exc:
            raise SystemExit(f"Invalid Content-Range for {table}: {content_range}") from exc

    print(json.dumps({"ok": True, "user_id": user_id, "counts": counts}, indent=2))


if __name__ == "__main__":
    main()
