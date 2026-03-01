# Output Contract: Import-Ready Files For Supabase

This skill outputs deterministic CSV files that can be imported directly into Train's Supabase tables.

## Output Folder

Create a run folder:

```text
data/migrations/trainheroic/<run_id>/
```

Example `run_id`: `2026-03-01T153000Z`

## Required Output Files

1. `exercises.csv`
2. `workouts.csv`
3. `workout_exercises.csv`
4. `exercise_sets.csv`
5. `unmapped_rows.csv`
6. `run-report.json`

## ID Strategy (Deterministic)

Generate deterministic UUIDv5 IDs so FK references are fully resolved before import.

Namespace constant:

```text
f6d4a6a0-4ee0-4b3c-8f63-5c6d79f2d6f9
```

Key rules:

- `exercise.id` = uuid5(ns, `exercise|<user_id>|<exercise_name_norm>`)
- `workout.id` = uuid5(ns, `workout|<user_id>|<workout_key>`)
- `workout_exercise.id` = uuid5(ns, `workout_exercise|<user_id>|<workout_key>|<order_index>|<exercise_name_norm>`)
- `exercise_set.id` = uuid5(ns, `exercise_set|<user_id>|<workout_exercise_id>|<set_index>`)

`workout_key` must be exactly:

```text
<WorkoutTitle>|<ScheduledDate>|<RescheduledDate>
```

with empty string allowed for missing dates.

## CSV Schemas

## `exercises.csv`

Columns (in order):

```text
id,user_id,name
```

## `workouts.csv`

Columns:

```text
id,user_id,performed_at,notes
```

- `performed_at` is ISO timestamp (`YYYY-MM-DDT12:00:00Z`).

## `workout_exercises.csv`

Columns:

```text
id,user_id,workout_id,exercise_id,order_index,notes
```

## `exercise_sets.csv`

Columns:

```text
id,user_id,workout_exercise_id,set_index,reps,duration_seconds,weight_value,weight_unit,rpe,notes
```

Notes:

- `weight_unit` allowed values: `lb`, `kg`, empty
- empty field means null
- do not include `weight_kg` (generated column)

## `unmapped_rows.csv`

Tracks skipped/partial source rows for audit.

Columns:

```text
source_row_index,workout_title,scheduled_date,rescheduled_date,exercise_title,exercise_data,reason,detail
```

## `run-report.json`

Must include:

- input file path
- user_id used
- row counts per output file
- parse coverage metrics
- skipped reason counts
- warnings list (if any)

Example shape:

```json
{
  "input": "data/trainheroic-data-export-2026-02-22/training_data.csv",
  "user_id": "<uuid>",
  "counts": {
    "source_rows": 2740,
    "exercises": 206,
    "workouts": 153,
    "workout_exercises": 1247,
    "exercise_sets": 3265,
    "unmapped_rows": 1493
  },
  "skip_reasons": {
    "template_no_numbers": 1143,
    "distance_unsupported": 294,
    "list_length_mismatch": 27
  },
  "warnings": [
    "Some workouts were dropped because they had zero parseable exercise rows"
  ]
}
```

## Import Order (Supabase)

Import in this exact order:

1. `exercises.csv`
2. `workouts.csv`
3. `workout_exercises.csv`
4. `exercise_sets.csv`

This order satisfies all FK dependencies.

## Validation Checklist

Before reporting success:

1. No duplicate IDs in any CSV.
2. All FK IDs resolve within output set.
3. `order_index` gapless within each `workout_id`.
4. `set_index` gapless within each `workout_exercise_id`.
5. Every set has reps or duration.
