# Plans Directory

This directory stores planning artifacts only.

## Structure

- `templates/block-template.md`: 12-week block template.
- `templates/weekly-template.md`: weekly execution template.
- `blocks/`: active/historical 12-week blocks.
- `weekly-plans/`: week-by-week executable plans used by `train plan today`.
- `reviews/`: weekly review notes and plan-adjustment decisions.

## Source of truth

- Planned work: markdown files in this directory.
- Executed work: Supabase tables (`workouts`, `workout_exercises`, `exercise_sets`, `exercises`).

## Hygiene rules

1. Do not edit completed sessions in old weekly plan files.
2. Put plan changes in the current/future weekly file and note why in `reviews/`.
3. Keep exercise names consistent with logged names to avoid duplicates.
