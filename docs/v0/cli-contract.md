# NanoClaw CLI Contract (V0)

This document defines the minimal command surface NanoClaw should use.

## Architecture (ASCII)

```text
NanoClaw Chat
  -> intent routing (AGENTS.md)
    -> train CLI command
      -> Supabase REST (public tables)
        -> public.workouts
        -> public.workout_exercises
        -> public.exercise_sets
        -> public.exercises
        -> public.goals
```

## Commands

### 1) Log parsed workout

```bash
train log import --json
```

Input: JSON on stdin from `$train-log-parser` (`kind=parse_result`), or legacy flat payload.

Output:

- `workout_id`
- `performed_at`
- `exercise_count`
- `set_count`
- `total_volume_kg`

### 2) Query e1RM

```bash
train query e1rm "<exercise>" --days 365 --json
```

Output:

- `estimated_1rm_kg`
- formula used (`e1rm = weight_kg * (1 + reps/30)`)
- `source_set` context

### 3) Query best set for target reps

```bash
train query best-set "<exercise>" --reps <n> --days 365 --json
```

Output:

- top loaded set for that rep target
- date/context + derived e1RM for that set

### 4) Query history

```bash
train history "<exercise?>" --last 7d --json
```

Output:

- `rows[]` of sets with session date/time, reps, duration, load, and RPE.

### 5) Set a goal

```bash
train goal set "<exercise>" "<target>" --json
```

Examples:

- `train goal set "Back Squat" 140kg --json`
- `train goal set "Bench Press" "5x100kg" --json`

Output:

- created `goal` row with target metadata and current progress.

### 6) List goals

```bash
train goal list --json
```

Output:

- `active_goals[]` with progress.
- `active_count` and `achieved_count`.

### 7) Check goals

```bash
train goal check --json
```

Output:

- `newly_achieved[]` milestone events.
- active goal progress snapshot after evaluation.

## Routing guidance

- Logging intent -> `train log import --json`
- 1RM intent -> `train query e1rm <exercise> --json`
- Best set by reps intent -> `train query best-set <exercise> --reps <n> --json`
- Recent history intent -> `train history --last <period> --json`
- Goal set intent -> `train goal set <exercise> <target> --json`
- Goal progress check intent -> `train goal list --json` / `train goal check --json`

## Notes

- Designed for single-user V0 with minimal command ambiguity.
- Commands return machine-friendly JSON envelopes (`{ ok, data|error }`).
