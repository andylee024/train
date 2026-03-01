# Supabase CLI Workflow (CSV Import)

This workflow assumes:

- Tables already exist in Supabase and match `docs/database-schema.md`.
- TrainHeroic data has been transformed into import-ready CSV files.

## Inputs

Expected directory contents:

- `exercises.csv`
- `workouts.csv`
- `workout_exercises.csv`
- `exercise_sets.csv`

## Command

Use one command for nanobot orchestration:

```bash
SUPABASE_DB_URL='<postgres-connection-string>' \
npm run train -- supabase import-csv \
  --dir data/migrations/trainheroic/<run_id> \
  --truncate \
  --json

npm run train -- supabase verify --json
```

Notes:

- `--truncate` clears Train tables before import.
- Omit `--truncate` to append into existing data.
- `--db-url <url>` can be used instead of `SUPABASE_DB_URL`.

## Execution Order

The importer loads files in FK-safe order:

1. `train.exercises`
2. `train.workouts`
3. `train.workout_exercises`
4. `train.exercise_sets`

## Output

The command returns JSON with:

- resolved import directory
- file paths used
- whether truncate mode was enabled
- post-import row counts for all four tables
- invariant violation counts (`order_index`, `set_index`, reps/duration, weight rule)
