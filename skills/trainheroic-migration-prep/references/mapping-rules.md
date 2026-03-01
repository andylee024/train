# Mapping Rules: TrainHeroic -> Train Schema

Target schema is defined in `docs/database-schema.md`.

## Scope

Map into exactly these tables:

- `train.exercises`
- `train.workouts`
- `train.workout_exercises`
- `train.exercise_sets`

Ignore planning/versioning concerns for v0.

## High-Level Mapping

- One TrainHeroic workout group -> one `workouts` row.
- One parseable TrainHeroic exercise row -> one `workout_exercises` row.
- Parsed set tokens from `ExerciseData` -> one or more `exercise_sets` rows.
- Unique normalized `ExerciseTitle` per user -> `exercises` rows.

## Field Mapping

## `exercises`

- `name` <- normalized `ExerciseTitle`
- Unique by `(user_id, name)`

## `workouts`

- `performed_at` <- `RescheduledDate` if present else `ScheduledDate`
- `notes` <- deduplicated non-empty `WorkoutNotes` within workout group

Use noon UTC when converting date-only fields to timestamp for stability:

```text
YYYY-MM-DDT12:00:00Z
```

## `workout_exercises`

- `workout_id` <- parent workout
- `exercise_id` <- canonical exercise
- `order_index` <- 1-based order within workout, preserving source row order of parseable rows
- `notes` <- optional concat of `ExerciseNotes` and `BlockNotes` when non-empty

## `exercise_sets`

From parsed `ExerciseData`:

- `set_index`: 1..N in parsed order
- `reps`: parsed reps or null
- `duration_seconds`: parsed seconds or null
- `weight_value`: parsed load or null
- `weight_unit`: `lb`, `kg`, or null
- `rpe`: null (not available from source)
- `notes`: optional parse warning (for partial fallbacks)

Do not write `weight_kg` directly (generated in DB).

## Supported `ExerciseData` Shapes

After whitespace normalization (`rep x  pound` -> `rep x pound`), parse these forms:

1. Reps x load

```text
<rep_list> rep x <load_list> pound
<rep_list> rep x <load_list> kilogram
```

2. Reps x seconds

```text
<rep_list> rep x <sec_list> second
```

3. Seconds-only

```text
<sec_list> second x
```

4. Reps-only

```text
<rep_list> rep x
```

5. Seconds x pounds

```text
<sec_list> second x <load_list> pound
```

6. Reversed seconds/reps

```text
<sec_list> second x <rep_list> rep
```

`<rep_list>`, `<sec_list>`, `<load_list>` are comma-separated numeric lists.

## List Alignment Rules

For two-list patterns (e.g., reps + load):

1. If lengths are equal, pair by index.
2. If one list length is `1`, broadcast across the other list.
3. Otherwise, skip row as `list_length_mismatch`.

## Partial Fallback Rules

To maximize usable data while keeping logic simple:

- If a pattern indicates load unit but load list is empty and reps/seconds exist, keep the set with missing load (`weight_*` null).
- If both sides are empty/template (e.g., `rep x pound`, `second x` with no numbers), skip as template.

## Unsupported Patterns (Skip)

Skip rows with reason codes:

- `distance_unsupported`: `yard`, `meter`, `mile`
- `percentage_unsupported`: `percent`/`percentage`
- `template_no_numbers`: no numeric values in `ExerciseData`
- `list_length_mismatch`: unresolvable vector length mismatch
- `unknown_pattern`: any other non-parseable format

## Invariants To Enforce

Before output:

1. `order_index` and `set_index` are positive and gapless per parent.
2. Each set has at least one of `reps` or `duration_seconds`.
3. If `weight_unit` in (`kg`, `lb`), `weight_value` must be present (except explicit fallback rows with warning).
4. Deterministic IDs and ordering must be stable across reruns.
