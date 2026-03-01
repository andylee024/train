#!/usr/bin/env python3
"""Generate Supabase import CSVs from TrainHeroic training_data.csv."""

from __future__ import annotations

import argparse
import csv
import json
import re
import uuid
from collections import Counter, OrderedDict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

NAMESPACE_UUID = uuid.UUID("f6d4a6a0-4ee0-4b3c-8f63-5c6d79f2d6f9")
NUM_RE = r"-?\d+(?:\.\d+)?"
LIST_RE = rf"{NUM_RE}(?:\s*,\s*{NUM_RE})*"
OPT_LIST_RE = rf"(?:{LIST_RE})?"

PATTERNS = {
    "reps_x_load": re.compile(
        rf"^(?P<reps>{OPT_LIST_RE})\s*rep\s*x\s*(?P<load>{OPT_LIST_RE})\s*(?P<unit>pound|kilogram)$"
    ),
    "reps_x_seconds": re.compile(
        rf"^(?P<reps>{OPT_LIST_RE})\s*rep\s*x\s*(?P<seconds>{OPT_LIST_RE})\s*second$"
    ),
    "seconds_x_load": re.compile(
        rf"^(?P<seconds>{OPT_LIST_RE})\s*second\s*x\s*(?P<load>{OPT_LIST_RE})\s*pound$"
    ),
    "seconds_x_reps": re.compile(
        rf"^(?P<seconds>{OPT_LIST_RE})\s*second\s*x\s*(?P<reps>{OPT_LIST_RE})\s*rep$"
    ),
    "seconds_only": re.compile(rf"^(?P<seconds>{LIST_RE})\s*second\s*x$"),
    "reps_only": re.compile(rf"^(?P<reps>{LIST_RE})\s*rep\s*x$"),
}


@dataclass
class ParsedSet:
    reps: Optional[int]
    duration_seconds: Optional[int]
    weight_value: Optional[float]
    weight_unit: Optional[str]
    notes: Optional[str]


@dataclass
class ParsedRow:
    sets: Optional[List[ParsedSet]]
    reason: Optional[str]
    detail: Optional[str]


def normalize_space(value: str) -> str:
    return " ".join(value.strip().split()) if value else ""


def normalize_exercise_name(value: str) -> str:
    return normalize_space(value)


def parse_number_list(value: str) -> List[float]:
    if not value or not value.strip():
        return []
    matches = re.findall(NUM_RE, value)
    return [float(m) for m in matches]


def float_list_to_positive_ints(values: List[float], field_name: str) -> Tuple[Optional[List[int]], Optional[str]]:
    result: List[int] = []
    for value in values:
        if abs(value - round(value)) > 1e-6:
            return None, f"non_integer_{field_name}"
        int_value = int(round(value))
        if int_value <= 0:
            return None, f"non_positive_{field_name}"
        result.append(int_value)
    return result, None


def validate_weight_values(values: List[float]) -> Optional[str]:
    for value in values:
        if value < 0:
            return "negative_weight"
    return None


def align_lists(a: List[float], b: List[float]) -> Optional[List[Tuple[float, float]]]:
    if len(a) == len(b):
        return list(zip(a, b))
    if len(a) == 1 and len(b) > 1:
        return [(a[0], x) for x in b]
    if len(b) == 1 and len(a) > 1:
        return [(x, b[0]) for x in a]
    return None


def parse_exercise_data(raw_value: str) -> ParsedRow:
    normalized = normalize_space(raw_value).lower()

    if not normalized:
        return ParsedRow(None, "template_no_numbers", "empty ExerciseData")

    if "yard" in normalized or "meter" in normalized or "mile" in normalized:
        return ParsedRow(None, "distance_unsupported", normalized)

    if "percent" in normalized or "percentage" in normalized:
        return ParsedRow(None, "percentage_unsupported", normalized)

    if not re.search(NUM_RE, normalized):
        return ParsedRow(None, "template_no_numbers", normalized)

    # reps x load (pound/kilogram)
    match = PATTERNS["reps_x_load"].fullmatch(normalized)
    if match:
        reps = parse_number_list(match.group("reps") or "")
        loads = parse_number_list(match.group("load") or "")
        unit = "lb" if match.group("unit") == "pound" else "kg"

        if reps and loads:
            aligned = align_lists(reps, loads)
            if aligned is None:
                return ParsedRow(None, "list_length_mismatch", normalized)
            reps_i, err = float_list_to_positive_ints([p for p, _ in aligned], "reps")
            if err:
                return ParsedRow(None, "invalid_value", err)
            weight_err = validate_weight_values([w for _, w in aligned])
            if weight_err:
                return ParsedRow(None, "invalid_value", weight_err)
            sets = [
                ParsedSet(reps=reps_i[i], duration_seconds=None, weight_value=w, weight_unit=unit, notes=None)
                for i, (_, w) in enumerate(aligned)
            ]
            return ParsedRow(sets, None, None)

        if reps and not loads:
            reps_i, err = float_list_to_positive_ints(reps, "reps")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=r, duration_seconds=None, weight_value=None, weight_unit=None, notes="missing_load_in_source")
                for r in reps_i
            ]
            return ParsedRow(sets, None, None)

        return ParsedRow(None, "template_no_numbers", normalized)

    # reps x seconds
    match = PATTERNS["reps_x_seconds"].fullmatch(normalized)
    if match:
        reps = parse_number_list(match.group("reps") or "")
        seconds = parse_number_list(match.group("seconds") or "")

        if reps and seconds:
            aligned = align_lists(reps, seconds)
            if aligned is None:
                return ParsedRow(None, "list_length_mismatch", normalized)
            reps_i, err = float_list_to_positive_ints([p for p, _ in aligned], "reps")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sec_i, err = float_list_to_positive_ints([s for _, s in aligned], "duration_seconds")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=reps_i[i], duration_seconds=sec_i[i], weight_value=None, weight_unit=None, notes=None)
                for i in range(len(aligned))
            ]
            return ParsedRow(sets, None, None)

        if reps and not seconds:
            reps_i, err = float_list_to_positive_ints(reps, "reps")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=r, duration_seconds=None, weight_value=None, weight_unit=None, notes="missing_duration_in_source")
                for r in reps_i
            ]
            return ParsedRow(sets, None, None)

        if seconds and not reps:
            sec_i, err = float_list_to_positive_ints(seconds, "duration_seconds")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=None, duration_seconds=s, weight_value=None, weight_unit=None, notes="missing_reps_in_source")
                for s in sec_i
            ]
            return ParsedRow(sets, None, None)

        return ParsedRow(None, "template_no_numbers", normalized)

    # seconds x load (pounds)
    match = PATTERNS["seconds_x_load"].fullmatch(normalized)
    if match:
        seconds = parse_number_list(match.group("seconds") or "")
        loads = parse_number_list(match.group("load") or "")

        if seconds and loads:
            aligned = align_lists(seconds, loads)
            if aligned is None:
                return ParsedRow(None, "list_length_mismatch", normalized)
            sec_i, err = float_list_to_positive_ints([s for s, _ in aligned], "duration_seconds")
            if err:
                return ParsedRow(None, "invalid_value", err)
            weight_err = validate_weight_values([w for _, w in aligned])
            if weight_err:
                return ParsedRow(None, "invalid_value", weight_err)
            sets = [
                ParsedSet(reps=None, duration_seconds=sec_i[i], weight_value=w, weight_unit="lb", notes=None)
                for i, (_, w) in enumerate(aligned)
            ]
            return ParsedRow(sets, None, None)

        if seconds and not loads:
            sec_i, err = float_list_to_positive_ints(seconds, "duration_seconds")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=None, duration_seconds=s, weight_value=None, weight_unit=None, notes="missing_load_in_source")
                for s in sec_i
            ]
            return ParsedRow(sets, None, None)

        return ParsedRow(None, "template_no_numbers", normalized)

    # seconds x reps (reversed)
    match = PATTERNS["seconds_x_reps"].fullmatch(normalized)
    if match:
        seconds = parse_number_list(match.group("seconds") or "")
        reps = parse_number_list(match.group("reps") or "")

        if seconds and reps:
            aligned = align_lists(seconds, reps)
            if aligned is None:
                return ParsedRow(None, "list_length_mismatch", normalized)
            sec_i, err = float_list_to_positive_ints([s for s, _ in aligned], "duration_seconds")
            if err:
                return ParsedRow(None, "invalid_value", err)
            reps_i, err = float_list_to_positive_ints([r for _, r in aligned], "reps")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=reps_i[i], duration_seconds=sec_i[i], weight_value=None, weight_unit=None, notes=None)
                for i in range(len(aligned))
            ]
            return ParsedRow(sets, None, None)

        if seconds and not reps:
            sec_i, err = float_list_to_positive_ints(seconds, "duration_seconds")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=None, duration_seconds=s, weight_value=None, weight_unit=None, notes="missing_reps_in_source")
                for s in sec_i
            ]
            return ParsedRow(sets, None, None)

        if reps and not seconds:
            reps_i, err = float_list_to_positive_ints(reps, "reps")
            if err:
                return ParsedRow(None, "invalid_value", err)
            sets = [
                ParsedSet(reps=r, duration_seconds=None, weight_value=None, weight_unit=None, notes="missing_duration_in_source")
                for r in reps_i
            ]
            return ParsedRow(sets, None, None)

        return ParsedRow(None, "template_no_numbers", normalized)

    # seconds only
    match = PATTERNS["seconds_only"].fullmatch(normalized)
    if match:
        seconds = parse_number_list(match.group("seconds"))
        sec_i, err = float_list_to_positive_ints(seconds, "duration_seconds")
        if err:
            return ParsedRow(None, "invalid_value", err)
        sets = [ParsedSet(reps=None, duration_seconds=s, weight_value=None, weight_unit=None, notes=None) for s in sec_i]
        return ParsedRow(sets, None, None)

    # reps only
    match = PATTERNS["reps_only"].fullmatch(normalized)
    if match:
        reps = parse_number_list(match.group("reps"))
        reps_i, err = float_list_to_positive_ints(reps, "reps")
        if err:
            return ParsedRow(None, "invalid_value", err)
        sets = [ParsedSet(reps=r, duration_seconds=None, weight_value=None, weight_unit=None, notes=None) for r in reps_i]
        return ParsedRow(sets, None, None)

    return ParsedRow(None, "unknown_pattern", normalized)


def deterministic_id(kind: str, *parts: str) -> str:
    key = "|".join([kind, *parts])
    return str(uuid.uuid5(NAMESPACE_UUID, key))


def non_empty_join(values: Iterable[str]) -> str:
    deduped = []
    seen = set()
    for value in values:
        if not value:
            continue
        if value not in seen:
            deduped.append(value)
            seen.add(value)
    return " | ".join(deduped)


def format_value(value):
    if value is None:
        return ""
    if isinstance(value, float):
        text = f"{value:.3f}".rstrip("0").rstrip(".")
        return text if text else "0"
    return str(value)


def write_csv(path: Path, fieldnames: List[str], rows: List[Dict[str, object]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: format_value(row.get(field)) for field in fieldnames})


def generate(args: argparse.Namespace) -> Path:
    source_csv = args.input

    run_id = args.run_id or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
    output_dir = args.output_root / run_id
    output_dir.mkdir(parents=True, exist_ok=True)

    with source_csv.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        source_rows = list(reader)

    workouts = OrderedDict()
    unmapped_rows: List[Dict[str, object]] = []
    skip_reasons = Counter()

    for index, row in enumerate(source_rows, start=1):
        workout_title = normalize_space(row.get("WorkoutTitle", ""))
        scheduled_date = normalize_space(row.get("ScheduledDate", ""))
        rescheduled_date = normalize_space(row.get("RescheduledDate", ""))
        workout_notes = normalize_space(row.get("WorkoutNotes", ""))
        block_notes = normalize_space(row.get("BlockNotes", ""))
        exercise_name = normalize_exercise_name(row.get("ExerciseTitle", ""))
        exercise_data = row.get("ExerciseData", "") or ""
        exercise_notes = normalize_space(row.get("ExerciseNotes", ""))

        if not scheduled_date and not rescheduled_date:
            reason = "missing_workout_date"
            unmapped_rows.append(
                {
                    "source_row_index": index,
                    "workout_title": workout_title,
                    "scheduled_date": scheduled_date,
                    "rescheduled_date": rescheduled_date,
                    "exercise_title": exercise_name,
                    "exercise_data": exercise_data,
                    "reason": reason,
                    "detail": "Both ScheduledDate and RescheduledDate are empty",
                }
            )
            skip_reasons[reason] += 1
            continue

        if not exercise_name:
            reason = "missing_exercise_title"
            unmapped_rows.append(
                {
                    "source_row_index": index,
                    "workout_title": workout_title,
                    "scheduled_date": scheduled_date,
                    "rescheduled_date": rescheduled_date,
                    "exercise_title": exercise_name,
                    "exercise_data": exercise_data,
                    "reason": reason,
                    "detail": "ExerciseTitle is empty",
                }
            )
            skip_reasons[reason] += 1
            continue

        parsed = parse_exercise_data(exercise_data)
        if not parsed.sets:
            reason = parsed.reason or "unknown_pattern"
            detail = parsed.detail or ""
            unmapped_rows.append(
                {
                    "source_row_index": index,
                    "workout_title": workout_title,
                    "scheduled_date": scheduled_date,
                    "rescheduled_date": rescheduled_date,
                    "exercise_title": exercise_name,
                    "exercise_data": exercise_data,
                    "reason": reason,
                    "detail": detail,
                }
            )
            skip_reasons[reason] += 1
            continue

        workout_key = (workout_title, scheduled_date, rescheduled_date)
        if workout_key not in workouts:
            workouts[workout_key] = {
                "workout_title": workout_title,
                "scheduled_date": scheduled_date,
                "rescheduled_date": rescheduled_date,
                "notes": [],
                "rows": [],
            }
        if workout_notes:
            workouts[workout_key]["notes"].append(workout_notes)

        workouts[workout_key]["rows"].append(
            {
                "source_row_index": index,
                "exercise_name": exercise_name,
                "exercise_notes": exercise_notes,
                "block_notes": block_notes,
                "parsed_sets": parsed.sets,
            }
        )

    # Drop workout groups that ended with no parseable rows (defensive, expected already filtered).
    parseable_workouts = OrderedDict((k, v) for k, v in workouts.items() if v["rows"])

    # Build exercises.
    exercise_names = sorted(
        {
            row["exercise_name"]
            for workout in parseable_workouts.values()
            for row in workout["rows"]
        },
        key=lambda x: x.lower(),
    )

    exercises_rows: List[Dict[str, object]] = []
    exercise_id_by_name: Dict[str, str] = {}
    for name in exercise_names:
        exercise_id = deterministic_id("exercise", name)
        exercise_id_by_name[name] = exercise_id
        exercises_rows.append({"id": exercise_id, "name": name})

    workouts_rows: List[Dict[str, object]] = []
    workout_id_by_key: Dict[Tuple[str, str, str], str] = {}

    for workout_key, workout in parseable_workouts.items():
        workout_title, scheduled_date, rescheduled_date = workout_key
        effective_date = rescheduled_date or scheduled_date
        try:
            date_obj = datetime.strptime(effective_date, "%Y-%m-%d")
        except ValueError:
            for row in workout["rows"]:
                unmapped_rows.append(
                    {
                        "source_row_index": row["source_row_index"],
                        "workout_title": workout_title,
                        "scheduled_date": scheduled_date,
                        "rescheduled_date": rescheduled_date,
                        "exercise_title": row["exercise_name"],
                        "exercise_data": "",
                        "reason": "invalid_workout_date",
                        "detail": effective_date,
                    }
                )
                skip_reasons["invalid_workout_date"] += 1
            continue

        performed_at = f"{date_obj.strftime('%Y-%m-%d')}T12:00:00Z"
        workout_id = deterministic_id(
            "workout",
            workout_title,
            scheduled_date,
            rescheduled_date,
        )
        workout_id_by_key[workout_key] = workout_id
        workouts_rows.append(
            {
                "id": workout_id,
                "performed_at": performed_at,
                "notes": non_empty_join(workout["notes"]),
            }
        )

    workout_exercises_rows: List[Dict[str, object]] = []
    exercise_sets_rows: List[Dict[str, object]] = []

    for workout_key, workout in parseable_workouts.items():
        workout_id = workout_id_by_key.get(workout_key)
        if not workout_id:
            continue

        order_index = 1
        for row in workout["rows"]:
            exercise_name = row["exercise_name"]
            exercise_id = exercise_id_by_name[exercise_name]
            exercise_notes = non_empty_join([row["exercise_notes"], row["block_notes"]])

            workout_exercise_id = deterministic_id(
                "workout_exercise",
                workout_key[0],
                workout_key[1],
                workout_key[2],
                str(order_index),
                exercise_name,
            )

            workout_exercises_rows.append(
                {
                    "id": workout_exercise_id,
                    "workout_id": workout_id,
                    "exercise_id": exercise_id,
                    "order_index": order_index,
                    "notes": exercise_notes,
                }
            )

            for set_index, parsed_set in enumerate(row["parsed_sets"], start=1):
                # Invariant: at least reps or duration.
                if parsed_set.reps is None and parsed_set.duration_seconds is None:
                    unmapped_rows.append(
                        {
                            "source_row_index": row["source_row_index"],
                            "workout_title": workout_key[0],
                            "scheduled_date": workout_key[1],
                            "rescheduled_date": workout_key[2],
                            "exercise_title": exercise_name,
                            "exercise_data": "",
                            "reason": "invalid_set_missing_reps_and_duration",
                            "detail": "Set violates schema invariant",
                        }
                    )
                    skip_reasons["invalid_set_missing_reps_and_duration"] += 1
                    continue

                set_id = deterministic_id(
                    "exercise_set",
                    workout_exercise_id,
                    str(set_index),
                )
                exercise_sets_rows.append(
                    {
                        "id": set_id,
                        "workout_exercise_id": workout_exercise_id,
                        "set_index": set_index,
                        "reps": parsed_set.reps,
                        "duration_seconds": parsed_set.duration_seconds,
                        "weight_value": parsed_set.weight_value,
                        "weight_unit": parsed_set.weight_unit,
                        "rpe": None,
                        "notes": parsed_set.notes,
                    }
                )

            order_index += 1

    # Write files.
    write_csv(
        output_dir / "exercises.csv",
        ["id", "name"],
        exercises_rows,
    )
    write_csv(
        output_dir / "workouts.csv",
        ["id", "performed_at", "notes"],
        workouts_rows,
    )
    write_csv(
        output_dir / "workout_exercises.csv",
        ["id", "workout_id", "exercise_id", "order_index", "notes"],
        workout_exercises_rows,
    )
    write_csv(
        output_dir / "exercise_sets.csv",
        [
            "id",
            "workout_exercise_id",
            "set_index",
            "reps",
            "duration_seconds",
            "weight_value",
            "weight_unit",
            "rpe",
            "notes",
        ],
        exercise_sets_rows,
    )
    write_csv(
        output_dir / "unmapped_rows.csv",
        [
            "source_row_index",
            "workout_title",
            "scheduled_date",
            "rescheduled_date",
            "exercise_title",
            "exercise_data",
            "reason",
            "detail",
        ],
        unmapped_rows,
    )

    source_workout_groups = len(
        {
            (
                normalize_space(row.get("WorkoutTitle", "")),
                normalize_space(row.get("ScheduledDate", "")),
                normalize_space(row.get("RescheduledDate", "")),
            )
            for row in source_rows
        }
    )

    retained_workout_groups = len(workouts_rows)
    dropped_workout_groups = source_workout_groups - retained_workout_groups

    warnings: List[str] = []
    if dropped_workout_groups > 0:
        warnings.append(
            f"Dropped {dropped_workout_groups} workout groups with zero parseable exercise rows"
        )

    report = {
        "input": str(source_csv),
        "output_dir": str(output_dir),
        "counts": {
            "source_rows": len(source_rows),
            "source_workout_groups": source_workout_groups,
            "exercises": len(exercises_rows),
            "workouts": len(workouts_rows),
            "workout_exercises": len(workout_exercises_rows),
            "exercise_sets": len(exercise_sets_rows),
            "unmapped_rows": len(unmapped_rows),
        },
        "parse_coverage": {
            "mapped_row_rate": round(
                (len(source_rows) - len(unmapped_rows)) / len(source_rows), 4
            )
            if source_rows
            else 0,
            "mapped_rows": len(source_rows) - len(unmapped_rows),
            "skipped_rows": len(unmapped_rows),
            "retained_workout_groups": retained_workout_groups,
            "dropped_workout_groups": dropped_workout_groups,
        },
        "skip_reasons": dict(skip_reasons),
        "warnings": warnings,
    }

    with (output_dir / "run-report.json").open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
        handle.write("\n")

    return output_dir


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate TrainHeroic migration CSVs")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/trainheroic-data-export-2026-02-22/training_data.csv"),
        help="Path to training_data.csv",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("data/migrations/trainheroic"),
        help="Base output directory",
    )
    parser.add_argument(
        "--run-id",
        type=str,
        default=None,
        help="Optional run id (default: current UTC timestamp)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not args.input.exists():
        raise SystemExit(f"Input file not found: {args.input}")
    output_dir = generate(args)
    print(output_dir)


if __name__ == "__main__":
    main()
