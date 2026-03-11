# Train Plan Edit Parse Schema

Use this schema as the contract between model parsing and `train plan edit --json`.

## Parse result object

```json
{
  "kind": "parse_result",
  "target_week": "2026-W11",
  "dry_run": false,
  "edits": [
    {
      "type": "swap_days",
      "day_a": 2,
      "day_b": 4
    }
  ]
}
```

## Clarification object

```json
{
  "kind": "needs_clarification",
  "question": "Do you want to keep 3 training days and drop all day-4/day-5 edits?",
  "missing_fields": ["conflict_resolution"],
  "context": {
    "requested_days": 3,
    "requested_edit_day": 5
  }
}
```

## Top-level rules

- `kind`: must be `parse_result` or `needs_clarification`.
- `target_week`: optional ISO week token `YYYY-Www`; omit for current week.
- `dry_run`: optional boolean.
- `edits`: non-empty for `parse_result`.

## Supported edits

### 1) Swap days

```json
{
  "type": "swap_days",
  "day_a": 2,
  "day_b": 4
}
```

Rules:
- `day_a`, `day_b`: integers in `1..7`.

### 2) Set training days

```json
{
  "type": "set_training_days",
  "days": 3
}
```

Rules:
- `days`: integer in `1..7`.

### 3) Add exercise

```json
{
  "type": "add_exercise",
  "day": 2,
  "exercise": "Close Grip Bench Press",
  "prescription": "3x8 @ RPE 7",
  "position": 5
}
```

Rules:
- `day`: integer in `1..7`.
- `exercise`: non-empty string.
- `prescription`: non-empty string.
- `position`: optional 1-based insert index.

### 4) Remove exercise

```json
{
  "type": "remove_exercise",
  "day": 4,
  "exercise": "Dips"
}
```

Rules:
- `day`: integer in `1..7`.
- `exercise`: exact exercise label from plan context.

### 5) Adjust muscle-group volume

```json
{
  "type": "adjust_muscle_group_volume",
  "muscle_group": "chest",
  "sets_delta": 1,
  "days": [2, 4]
}
```

or

```json
{
  "type": "adjust_muscle_group_volume",
  "muscle_group": "legs",
  "percent": -20
}
```

Rules:
- `muscle_group`: non-empty string.
- include exactly one of:
  - `sets_delta` (integer)
  - `percent` (number)
- `days`: optional day filter, array of integers in `1..7`.

### 6) Change weight targets

```json
{
  "type": "change_weight_target",
  "exercise": "Bench Press",
  "percent_delta": 2.5,
  "days": [2]
}
```

or

```json
{
  "type": "change_weight_target",
  "exercise": "Back Squat",
  "set_percent": 75,
  "days": [1]
}
```

or

```json
{
  "type": "change_weight_target",
  "exercise": "Bench Press",
  "load_delta": 5,
  "unit": "lb",
  "days": [2]
}
```

Rules:
- `exercise`: non-empty string.
- include at least one of: `set_percent`, `percent_delta`, `load_delta`.
- `unit`: optional `lb` or `kg`, only when `load_delta` is used.
- `days`: optional day filter, array of integers in `1..7`.

## Validation expectations

- Reject unresolved ambiguity and return `needs_clarification`.
- Reject contradictory edit stacks and return `needs_clarification`.
- Keep payload deterministic and directly executable by CLI.
