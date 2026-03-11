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

## Log Celebration Routing

For `log_confirmation`, choose format in this exact order:

1. `milestone_celebration`: any milestone was achieved in this session.
2. `pr_celebration`: no milestone, but one or more PRs were detected.
3. `standard_log`: no milestone and no PRs.

When multiple PRs exist, lead with the biggest one and mention others on a short follow-up line.

## Rules

- Do not alter data values from CLI output.
- Do not invent missing fields.
- Show both kg/lb only when already available or trivially computable.
- Prefer ordered lists for workouts and compact lines for logged sets.
- For progression, prioritize direction + recent datapoints.
- For milestone/PR logs, lead with the achievement before generic logging details.
- Never add negative PR copy for normal sessions (for example: "no PR today").
- If a card reference is present in input, include it explicitly.
- Keep celebration language earned and coach-like, not gamified or shouty.

## PR Priority (When Multiple PRs)

Use this deterministic order for the lead PR:

1. `weight`
2. `e1rm`
3. `rep`
4. `volume`

Tie-breaker: larger relative improvement (`delta / previous_best`), then latest set.

## Output modes

- `concise` (default): short and scannable.
- `detailed`: include extra context (more sets, comparisons, notes).

Use [templates.md](references/templates.md) for exact structures and examples.
