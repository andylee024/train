# Train Database Schema

This document is the source of truth for Train's workout logging schema.

## Purpose

Track real training execution only:

1. Workouts (sessions)
2. Exercises performed within workouts
3. Atomic sets (reps, load, duration)

Workout planning stays in Markdown files under `plans/` and is not represented in this schema.

## Entity Model (ASCII)

```text
+----------------------+
|      auth.users      |
|----------------------|
| id (PK)              |
+----------+-----------+
           |
           | 1 : N
           |
+----------v-----------+
|   train.exercises    |
|----------------------|
| id (PK)              |
| user_id (FK)         |
| name                 |
| created_at           |
| updated_at           |
| UNIQUE(user_id,name) |
+----------------------+


+----------------------+
|    train.workouts    |
|----------------------|
| id (PK)              |
| user_id (FK)         |
| performed_at         |
| notes                |
| created_at           |
| updated_at           |
+----------+-----------+
           |
           | 1 : N
           |
+----------v------------------+
|  train.workout_exercises    |
|-----------------------------|
| id (PK)                     |
| user_id (FK)                |
| workout_id (FK)             |
| exercise_id (FK)            |
| order_index                 |
| notes                       |
| created_at                  |
| updated_at                  |
| UNIQUE(workout_id,order)    |
+-------------+---------------+
              |
              | 1 : N
              |
+-------------v----------------+
|     train.exercise_sets      |
|------------------------------|
| id (PK)                      |
| user_id (FK)                 |
| workout_exercise_id (FK)     |
| set_index                    |
| reps (nullable)              |
| duration_seconds (nullable)  |
| weight_value (nullable)      |
| weight_unit (kg/lb/bw/null)  |
| weight_kg (generated)        |
| rpe (nullable)               |
| notes                        |
| created_at                   |
| updated_at                   |
| UNIQUE(workout_exercise_id,  |
|   set_index)                 |
+------------------------------+
```

```text
+----------------------+
|      train.goals     |
|----------------------|
| id (PK)              |
| user_id (FK)         |
| exercise_id (FK)     |
| target_type          |
| target_kg            |
| target_reps (nullable) |
| created_at           |
| achieved_at (nullable) |
+----------+-----------+
           ^
           |
           | N : 1
           |
+----------+-----------+
|   train.exercises    |
+----------------------+
```

## Table Details

## `train.exercises`

Canonical exercise catalog per user.

- `id`: UUID primary key.
- `user_id`: owner.
- `name`: canonical movement name (e.g., `Bench Press`).
- `UNIQUE(user_id, name)`: prevents duplicate exercise names per user.

## `train.workouts`

One performed session.

- `id`: UUID primary key.
- `user_id`: owner.
- `performed_at`: session timestamp.
- `notes`: optional session note.

No scheduling fields in DB for v0; plans live in Markdown.

## `train.workout_exercises`

Exercises performed in one workout, in order.

- `workout_id`: parent session.
- `exercise_id`: canonical exercise reference.
- `order_index`: exercise order in session.
- `UNIQUE(workout_id, order_index)`: avoids duplicate position numbers.

## `train.exercise_sets`

Atomic training record. Every set is one row.

- `workout_exercise_id`: parent exercise-in-workout.
- `set_index`: set order within that exercise.
- `reps`: rep count (nullable for timed-only sets).
- `duration_seconds`: timed component (nullable).
- `weight_value` + `weight_unit`: entered load (`kg`, `lb`, `bw`).
- `weight_kg`: generated normalized load for analytics.
- `rpe`: optional effort score.
- `UNIQUE(workout_exercise_id, set_index)`: no duplicate set number.

## `train.goals`

Milestone targets per exercise.

- `id`: UUID primary key.
- `user_id`: owner.
- `exercise_id`: exercise reference.
- `target_type`: `e1rm`, `weight`, or `reps_at_weight`.
- `target_kg`: normalized kg target value.
- `target_reps`: required reps for `reps_at_weight`; null for other goal types.
- `created_at`: goal creation timestamp.
- `achieved_at`: nullable timestamp set once goal is achieved.

Multiple goals per exercise are allowed. Achieved goals are preserved for history.

## Required Invariants

These are mandatory behavior constraints for code and agents:

1. At least one of `reps` or `duration_seconds` must be present.
2. If `weight_unit` is `kg` or `lb`, `weight_value` must be present.
3. If `weight_unit` is `bw`, `weight_value` must be null.
4. `order_index` and `set_index` are positive integers.
5. In goals, `target_kg` must be positive.
6. In goals, `target_reps` is required only when `target_type = reps_at_weight`.

## Why This Schema

1. Minimal model for logging and progression.
2. Supports both load-based and timed sets (`sets x seconds`).
3. Keeps plan complexity out of DB (Markdown-driven plans).
4. Keeps analytics straightforward (`top load`, `volume`, trend by exercise).

## Out of Scope (v0)

1. Plan/program tables in DB.
2. Raw TrainHeroic fidelity tables.
3. Distance or percentage set modeling.

## Change Policy

Before changing schema:

1. Update this file first.
2. Ensure changes preserve set-level progression queries.
3. Confirm whether new fields are truly required for v0 logging.
