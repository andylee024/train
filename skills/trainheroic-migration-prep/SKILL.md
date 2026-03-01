---
name: trainheroic-migration-prep
description: Prepare TrainHeroic export data for importing into Train's simplified database schema. Use when given a TrainHeroic export folder (especially training_data.csv) and asked to produce deterministic, import-ready files for workouts, workout_exercises, exercise_sets, and exercises, while safely skipping unsupported patterns.
---

# TrainHeroic Migration Prep

Use this skill to transform TrainHeroic export files into deterministic, import-ready files for the Train schema in `docs/database-schema.md`.

## When To Use

Use this skill when a user asks to:

- migrate TrainHeroic exports into Train/Supabase,
- understand how TrainHeroic `training_data.csv` maps to Train tables,
- generate import files with minimal custom code.

## Workflow

1. Read schema contract first.
- Load `docs/database-schema.md` from the Train repo.
- Confirm target entities are only: `exercises`, `workouts`, `workout_exercises`, `exercise_sets`.

2. Inspect input export structure.
- Load [trainheroic-input.md](references/trainheroic-input.md).
- Require `training_data.csv`; treat other CSVs as optional enrichment.

3. Apply deterministic mapping rules.
- Use [mapping-rules.md](references/mapping-rules.md).
- Parse supported set shapes for v0:
  - reps x load (`rep x pound`, `rep x kilogram`)
  - reps x seconds (`rep x second`)
  - seconds-only (`second x`)
  - reps-only (`rep x`)
  - seconds x pounds (`second x pound`)
- Skip unsupported patterns (distance/percentage/empty templates) without failing the whole run.

4. Build canonical records.
- Create canonical exercises from `ExerciseTitle`.
- Group workouts by `(WorkoutTitle, ScheduledDate, RescheduledDate)`.
- Keep source row order for `order_index` and set expansion order for `set_index`.

5. Emit import-ready files.
- Follow [output-contract.md](references/output-contract.md) exactly.
- Output CSV files matching Train table columns.
- Include deterministic IDs and FK IDs so files can be imported directly into Supabase in order.
- Include `unmapped_rows.csv` and `run-report.json`.

6. Validate consistency before returning.
- Every `workout_exercises.workout_id` exists in `workouts.csv`.
- Every `workout_exercises.exercise_id` exists in `exercises.csv`.
- Every `exercise_sets.workout_exercise_id` exists in `workout_exercises.csv`.
- `order_index` and `set_index` are positive and gapless per parent.
- Report skipped row count and reasons.

## Guardrails

- Preserve source values where possible; do not invent reps/load/seconds.
- Never coerce unsupported units (distance/percentage) into supported units.
- If parsing is ambiguous, skip row and record reason in `unmapped_rows.csv`.
- Prefer explicit `null` (empty CSV value) for unknown optional fields.
- Keep output deterministic across runs given same input and `user_id`.

## Output

Return:

1. File list created.
2. Row counts per output file.
3. Skipped row summary (with reasons).
4. Any schema-risk warnings before import.

Use [output-contract.md](references/output-contract.md) as the authoritative format.
