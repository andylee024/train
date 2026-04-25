# Train Database Schema

This document is the source of truth for Train's Supabase schema.

See also: [Product Architecture](product-architecture.md) for the full data model rationale. Build sequencing is tracked in [Linear](https://linear.app/a24-personal/project/train-5bf68de4e2d4).

## Storage Boundary

**Supabase = everything that happened.** Execution data, metrics, reviews, and scheduling all live here. Structured, queryable, timestamped.

**Markdown = everything planned.** Block programming, weekly workout prescriptions, nutrition protocols. Files under `plans/`.

The weekly schedule is the bridge: markdown loads into Supabase on Sunday, Supabase is authoritative for the rest of the week, and exceptions mutate Supabase (never markdown).

## Current Schema (public, no RLS)

All tables are in the `public` schema. RLS is disabled for solo v0 mode. Tables have `user_id` support at the API layer (probed on init) for multi-tenant readiness.

### Enums

```sql
load_unit: 'kg' | 'lb' | 'bw'
```

### Existing Tables (deployed)

#### `exercises`
Canonical exercise catalog.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| name | citext | unique |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger |

#### `workouts`
One performed session.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| performed_at | timestamptz | indexed desc |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger |

#### `workout_exercises`
Exercises performed in one workout, in order.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workout_id | uuid FK → workouts | cascade delete |
| exercise_id | uuid FK → exercises | restrict delete |
| order_index | int | > 0, unique per workout |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger |

#### `exercise_sets`
Atomic set logging. Every set is one row.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workout_exercise_id | uuid FK → workout_exercises | cascade delete |
| set_index | int | > 0, unique per workout_exercise |
| reps | int | nullable (required if no duration) |
| duration_seconds | int | nullable (required if no reps) |
| weight_value | numeric(10,3) | nullable |
| weight_unit | load_unit | nullable |
| weight_kg | numeric(10,3) | **generated**: auto-converts lb→kg |
| rpe | numeric(3,1) | nullable, 1–10 |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | trigger |

**Constraints:**
- At least one of `reps` or `duration_seconds` must be present.
- If `weight_unit` is `kg` or `lb`, `weight_value` must be present.
- If `weight_unit` is `bw`, `weight_value` must be null.

## New Tables (to be built)

These tables are defined in the product architecture and will be added via migrations as each vertical slice ships. Grouped by domain.

### Scheduling

#### `weekly_schedule`
Bridge between markdown plans and daily execution. Loaded from markdown on Sunday, mutated by exceptions during the week.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| week_id | text | e.g. "2026-W17" |
| days | jsonb | `[{date, mode: "training"|"rest"|"social", workout_id?, notes}]` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Nutrition

#### `meal_library`
Known meals with macros. Source for meal orchestration and grocery list generation.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| name | text | e.g. "Overnight oats + whey" |
| category | text | breakfast / lunch / dinner / snack |
| calories | numeric | |
| protein_g | numeric | |
| carbs_g | numeric | |
| fat_g | numeric | |
| prep_method | text | prepped / meal_service / quick_cook / restaurant / packaged |
| prep_time_min | int | nullable |
| ingredients | jsonb | for grocery list generation |
| tags | jsonb | e.g. `["high_protein", "under_15_min", "costco"]` |
| source | text | manual / barcode_db / photo_estimate / meal_service |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `daily_nutrition_log`
What was planned vs. eaten for a given day.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| date | date | |
| user_id | uuid | |
| day_mode | text | training / rest / social |
| meals_planned | jsonb | `[{slot, meal_id, planned_cals, planned_protein}]` |
| meals_logged | jsonb | `[{slot, meal_id, actual_cals, actual_protein, log_method}]` |
| total_calories | numeric | |
| total_protein_g | numeric | |
| total_carbs_g | numeric | |
| total_fat_g | numeric | |
| protein_target_hit | boolean | computed |
| calorie_target | numeric | |
| calorie_delta | numeric | over/under |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

`log_method` values: `confirmed` | `photo` | `barcode` | `manual` | `skipped`

#### `weekly_meal_plan`
Full meal plan for a week, including grocery lists and social event handling.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| week_id | text | e.g. "2026-W17" |
| meal_prep_orders | jsonb | what to order from services |
| grocery_list | jsonb | store items needed |
| day_plans | jsonb | `[{date, day_mode, meals: [{slot, meal_id}]}]` |
| social_events | jsonb | `[{date, venue, budget_cals, flagged_options}]` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Body Metrics

#### `daily_metrics`
Daily tracking: bodyweight, sleep, readiness.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| date | date | unique per user |
| user_id | uuid | |
| bodyweight | numeric | lb |
| sleep_hours | numeric | nullable |
| readiness_score | numeric | nullable |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `injury_log`
Pain tracking per injury per day.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| date | date | |
| user_id | uuid | |
| injury_name | text | e.g. "right_shoulder" |
| pain_level | int | 1–10 |
| affected_movements | text | nullable |
| notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Reviews & Rollups

#### `weekly_reviews`
Auto-generated weekly scorecard.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| week_id | text | |
| compliance | jsonb | sessions completed vs planned, nutrition hit rates |
| lift_trends | jsonb | per-exercise e1RM / volume trends |
| weight_trend | jsonb | daily weights → trend line |
| nutrition_summary | jsonb | macro averages, target adherence |
| injury_status | jsonb | per-injury trend |
| recommendations | text | system-generated next-week advice |
| created_at | timestamptz | |

#### `block_reviews`
End-of-block assessment vs. targets.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| block_id | text | references block markdown filename |
| entry_conditions_met | jsonb | checklist with status |
| exit_conditions_met | jsonb | checklist with status |
| lift_progress | jsonb | key lifts: start → end e1RM |
| bodyweight_progress | jsonb | start → end with trend |
| summary | text | |
| next_block_recommendation | text | |
| created_at | timestamptz | |

### Goals

#### `arcs`
The big goal and its block sequence.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| name | text | e.g. "Dunk by August 2026" |
| target_date | date | |
| key_metrics | jsonb | `[{metric, current, target}]` |
| block_sequence | jsonb | ordered list of block IDs with entry/exit conditions |
| status | text | active / completed / paused |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `lift_benchmarks`
PR history and e1RM records.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| exercise_id | uuid FK → exercises | |
| date | date | |
| reps | int | |
| weight_kg | numeric | |
| estimated_1rm_kg | numeric | |
| source | text | logged / test / historical_import |
| created_at | timestamptz | |

#### `test_results`
Performance tests (vertical jump, DEXA, blood work).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| test_date | date | |
| test_type | text | vertical_jump / dexa / blood_panel / force_plate |
| result_value | numeric | primary metric |
| result_unit | text | inches / % / etc. |
| raw_data | jsonb | full test output |
| notes | text | |
| created_at | timestamptz | |

### System State

#### `engagement_status`
Tracks whether the user is active, quiet, or dark (for the going-dark protocol).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| status | text | active / quiet / drifting / dark |
| last_interaction | timestamptz | |
| days_silent | int | |
| escalation_level | int | 0–3 |
| updated_at | timestamptz | |

#### `proposals`
Pending auto-adjustment approvals.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| proposal_type | text | exercise_swap / load_change / block_extension / etc. |
| description | text | human-readable proposal |
| payload | jsonb | structured change to apply |
| status | text | pending / approved / rejected / expired |
| created_at | timestamptz | |
| resolved_at | timestamptz | nullable |

### Progress Media (future)

#### `progress_media`
Photos and video for visual tracking.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| date | date | |
| user_id | uuid | |
| type | text | photo / video |
| url | text | Supabase storage URL |
| tags | jsonb | e.g. `["front", "side"]` or `["dunk_attempt"]` |
| notes | text | |
| created_at | timestamptz | |

## Migration Sequencing

New tables are added as vertical slices ship (tracked in [Linear](https://linear.app/a24-personal/project/train-5bf68de4e2d4)):

1. **Slice 1–2** (daily loop): `daily_metrics`, `weekly_schedule`
2. **Slice 4** (going-dark): `engagement_status`
3. **Slice 5** (nutrition): `meal_library`, `daily_nutrition_log`, `weekly_meal_plan`
4. **Slice 6** (weekly review): `weekly_reviews`
5. **Slice 7** (auto-adjustments): `proposals`
6. **Slice 8** (arc dashboard): `arcs`, `block_reviews`, `lift_benchmarks`, `test_results`
7. **Future**: `progress_media`, `injury_log`

## Change Policy

Before changing schema:

1. Update this file first.
2. Write a numbered migration in `supabase/migrations/`.
3. Ensure changes preserve set-level progression queries.
4. Confirm alignment with the product architecture doc.
