# TrainHeroic Input Format

This document defines how TrainHeroic export data is represented for migration into Train's simplified schema.

## Required File

`training_data.csv` is required.

Observed header (current export):

```text
WorkoutTitle,ScheduledDate,RescheduledDate,WorkoutNotes,BlockValue,BlockUnits,BlockInstructions,BlockNotes,ExerciseTitle,ExerciseData,ExerciseNotes
```

## Column Meaning

- `WorkoutTitle`: workout/session name from TrainHeroic.
- `ScheduledDate`: original scheduled date (`YYYY-MM-DD`).
- `RescheduledDate`: rescheduled/performed date when present (`YYYY-MM-DD`), may be empty.
- `WorkoutNotes`: note for the workout (may repeat across rows).
- `BlockValue`: block metadata, typically `0.00` in observed export.
- `BlockUnits`: often empty in observed export.
- `BlockInstructions`: long instruction text for blocks; optional for migration.
- `BlockNotes`: optional block-level notes.
- `ExerciseTitle`: movement name per row.
- `ExerciseData`: compact set prescription/result string (key parsing field).
- `ExerciseNotes`: optional row-level notes.

## Optional Files

The following files may exist but are optional for v0 migration:

- `exercise_library.csv`
- `user_info.csv`
- `readiness_survey_data.csv`
- `nutrition_data.csv`
- `sent_messages.csv`
- `teams.csv`

Use `exercise_library.csv` only as optional exercise-name enrichment.

## Data Reality (Observed in Current Export)

From `data/trainheroic-data-export-2026-02-22/training_data.csv`:

- 2,740 rows
- 346 workout groups by `(WorkoutTitle, ScheduledDate, RescheduledDate)`
- frequent `ExerciseData` templates without numbers (`rep x pound`, `second x`, `rep x`)
- mixed supportable and unsupported unit patterns (distance in `yard`, occasional `percent`)

This means migration must be tolerant of partial parse coverage and always report skipped rows.

## Input Normalization Rules

Before mapping:

1. Trim whitespace on all string fields.
2. Collapse repeated spaces in `ExerciseData` (e.g., `rep x  pound` -> `rep x pound`).
3. Treat empty strings as null.
4. Keep source row order stable for deterministic `order_index`.

## Workout Key And Effective Date

Canonical workout grouping key:

```text
(WorkoutTitle, ScheduledDate, RescheduledDate)
```

Effective performed date:

1. Use `RescheduledDate` when present.
2. Else use `ScheduledDate`.

If neither date is present, skip row as `missing_workout_date`.
