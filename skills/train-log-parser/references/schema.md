# Train Log Parse Schema

Use this schema as the contract between model parsing and CLI execution.

## Top-level object

```json
{
  "kind": "parse_result",
  "session": {
    "session_date": "2026-02-28",
    "notes": "optional session note",
    "source_message_id": "optional-chat-message-id"
  },
  "entries": [
    {
      "exercise_raw": "squat",
      "exercise_resolved": "back squat",
      "notes": "optional exercise note",
      "sets": [
        {
          "set_number": 1,
          "reps": 5,
          "weight_value": 102.5,
          "weight_unit": "kg",
          "weight_kg": 102.5,
          "duration_seconds": null,
          "rpe": 8.0,
          "set_type": "working",
          "notes": null
        }
      ]
    }
  ]
}
```

## Clarification object

```json
{
  "kind": "needs_clarification",
  "question": "Did you mean 3 sets of 5 for bench at 185 lb?",
  "missing_fields": ["sets", "reps", "weight_unit"],
  "context": {
    "exercise_raw": "bench 185",
    "source_message_id": "optional-chat-message-id"
  }
}
```

## Field rules

- `kind`: Must be `parse_result` or `needs_clarification`.
- `session.session_date`: ISO date in local context if date is implicit.
- `session.source_message_id`: Include when available for idempotency.
- `entries`: Non-empty when `kind=parse_result`.
- `exercise_raw`: Original user wording.
- `exercise_resolved`: Normalized exercise label for DB lookup.
- `sets`: Non-empty for each exercise.
- `set_number`: 1-based sequence per exercise.
- `reps`: Integer for rep-based sets; null for timed-only/cardio entries.
- `weight_value`: Numeric entered load; null for no-load/timed-only entries.
- `weight_unit`: One of `lb`, `kg`, `bw`.
- `weight_kg`: Normalized numeric load for analytics; null when not applicable.
- `duration_seconds`: Integer for timed/cardio sets; null otherwise.
- `rpe`: Float in `[1, 10]` when provided; null otherwise.
- `set_type`: One of `warmup`, `working`, `top`, `backoff`, `drop`, `amrap`, `other`.

## Validation checks

- Reject sets where both `reps` and `duration_seconds` are null.
- Reject sets where `weight_unit=bw` but `weight_value` is non-null.
- Reject sets where `weight_unit` is `lb`/`kg` and `weight_value` is null.
- Reject negative or zero loads.
- Reject non-monotonic `set_number` inside an exercise.
- Reject parse results that contain unresolved ambiguity; return clarification instead.

## CLI mapping

Map each entry to one or more CLI calls:

- Rep/load example:
  - Input sets: `5,5,4` at `84 kg`
  - CLI: `train log bench 84 5,5,4 --unit kg --json`
- Timed example:
  - Input: run for 30m
  - CLI: `train log run --duration 30m --json`
