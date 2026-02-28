---
name: train-output-templates
description: Format Train CLI JSON outputs into consistent user-facing chat responses. Use when presenting workout plans, log confirmations, history, or progression summaries, and when the user requests specific display styles or reusable output templates.
---

# Train Output Templates

Use this skill after CLI execution to format user-facing responses consistently.

## Workflow

1. Read the CLI JSON output.
2. Detect response type:
- `plan_today`
- `log_confirmation`
- `history`
- `progression`
3. Apply the matching template from [templates.md](references/templates.md).
4. Keep the response concise by default.
5. Expand only when the user asks for more detail.

## Rules

- Do not alter data values from CLI output.
- Do not invent missing fields.
- Show both kg/lb only when already available or trivially computable.
- Prefer ordered lists for workouts and compact lines for logged sets.
- For progression, prioritize direction + recent datapoints.

## Output modes

- `concise` (default): short and scannable.
- `detailed`: include extra context (more sets, comparisons, notes).

Use [templates.md](references/templates.md) for exact structures and examples.
