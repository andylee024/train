# Train Log Parsing Examples

Use these examples to keep parsing behavior consistent.

## Example 1: Compact set notation

Input:
```text
logged squat 102.5kg 5x5 rpe 8
```

Output (shape):
```json
{
  "kind": "parse_result",
  "entries": [
    {
      "exercise_raw": "squat",
      "sets": [
        { "set_number": 1, "reps": 5, "weight_value": 102.5, "weight_unit": "kg", "weight_kg": 102.5, "rpe": 8.0 },
        { "set_number": 2, "reps": 5, "weight_value": 102.5, "weight_unit": "kg", "weight_kg": 102.5, "rpe": 8.0 },
        { "set_number": 3, "reps": 5, "weight_value": 102.5, "weight_unit": "kg", "weight_kg": 102.5, "rpe": 8.0 },
        { "set_number": 4, "reps": 5, "weight_value": 102.5, "weight_unit": "kg", "weight_kg": 102.5, "rpe": 8.0 },
        { "set_number": 5, "reps": 5, "weight_value": 102.5, "weight_unit": "kg", "weight_kg": 102.5, "rpe": 8.0 }
      ]
    }
  ]
}
```

## Example 2: Variable reps by set

Input:
```text
bench 185 5,5,4 felt heavy
```

Output (shape):
```json
{
  "kind": "parse_result",
  "entries": [
    {
      "exercise_raw": "bench",
      "notes": "felt heavy",
      "sets": [
        { "set_number": 1, "reps": 5, "weight_value": 185, "weight_unit": "lb", "weight_kg": 83.9 },
        { "set_number": 2, "reps": 5, "weight_value": 185, "weight_unit": "lb", "weight_kg": 83.9 },
        { "set_number": 3, "reps": 4, "weight_value": 185, "weight_unit": "lb", "weight_kg": 83.9 }
      ]
    }
  ]
}
```

## Example 3: Multiple exercises in one message

Input:
```text
done: squat 225 4x5, rdl 185 3x8, calf raise 4x12 bw
```

Output:
- Emit one entry per exercise.
- Expand all set arrays.
- Preserve order from message.

## Example 4: Cardio/timed work

Input:
```text
ran 30 minutes easy pace
```

Output (shape):
```json
{
  "kind": "parse_result",
  "entries": [
    {
      "exercise_raw": "run",
      "notes": "easy pace",
      "sets": [
        {
          "set_number": 1,
          "reps": null,
          "weight_value": null,
          "weight_unit": "bw",
          "weight_kg": null,
          "duration_seconds": 1800,
          "rpe": null
        }
      ]
    }
  ]
}
```

## Example 5: Needs clarification

Input:
```text
logged bench 185
```

Output:
```json
{
  "kind": "needs_clarification",
  "question": "How many sets and reps did you complete for bench at 185?",
  "missing_fields": ["sets", "reps"]
}
```

## Example 6: Mixed units

Input:
```text
ohp 52.5kg 3x8 then lateral raise 20lb 3x15
```

Output:
- Keep each entry in stated unit.
- Compute `weight_kg` per set for both entries.

## Example 7: Do not trigger

Input:
```text
what is today's workout?
```

Output:
- Do not parse as log.
- Hand off to plan retrieval flow.
