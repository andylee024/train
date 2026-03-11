# Train Plan Edit Parsing Examples

These examples show conversational inputs and deterministic parser outputs.

## Example 1: Swap days

User:
```text
Swap day 2 and day 4 this week.
```

Output:
```json
{
  "kind": "parse_result",
  "edits": [
    { "type": "swap_days", "day_a": 2, "day_b": 4 }
  ]
}
```

## Example 2: Reduce to 3 days

User:
```text
I can only train 3 days this week.
```

Output:
```json
{
  "kind": "parse_result",
  "edits": [
    { "type": "set_training_days", "days": 3 }
  ]
}
```

## Example 3: Add bench volume

User:
```text
Add bench volume this week. Put a little more chest work on upper days.
```

Output:
```json
{
  "kind": "parse_result",
  "edits": [
    {
      "type": "adjust_muscle_group_volume",
      "muscle_group": "chest",
      "sets_delta": 1,
      "days": [2, 4]
    }
  ]
}
```

## Example 4: Add an exercise

User:
```text
Add close-grip bench on day 2, 3x8 at RPE 7.
```

Output:
```json
{
  "kind": "parse_result",
  "edits": [
    {
      "type": "add_exercise",
      "day": 2,
      "exercise": "Close Grip Bench Press",
      "prescription": "3x8 @ RPE 7"
    }
  ]
}
```

## Example 5: Remove an exercise

User:
```text
Remove dips from day 4.
```

Output:
```json
{
  "kind": "parse_result",
  "edits": [
    {
      "type": "remove_exercise",
      "day": 4,
      "exercise": "Dips"
    }
  ]
}
```

## Example 6: Change weight target

User:
```text
Bump bench targets up 2.5 percent this week.
```

Output:
```json
{
  "kind": "parse_result",
  "edits": [
    {
      "type": "change_weight_target",
      "exercise": "Bench Press",
      "percent_delta": 2.5
    }
  ]
}
```

## Example 7: Conflicting edit request (clarification)

User:
```text
Make this a 3-day week and also add hamstrings on day 5.
```

Output:
```json
{
  "kind": "needs_clarification",
  "question": "Do you want a 3-day week (days 1-3 only), or should I keep day 5 so I can add hamstrings there?",
  "missing_fields": ["conflict_resolution"],
  "context": {
    "requested_days": 3,
    "requested_edit_day": 5
  }
}
```

## Example 8: Do not trigger on logging intent

User:
```text
I benched 225 for 3x5 today.
```

Output:
- Do not parse as plan edit.
- Hand off to `$train-log-parser`.
