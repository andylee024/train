---
name: train-plan-editor
description: Parse natural-language weekly plan change requests into strict edit payloads for Train CLI. Use when a user asks to modify this week’s plan (swap days, change number of days, add/remove exercises, adjust muscle-group volume, or change load targets) and map requests to validated JSON for `train plan edit --json`.
---

# Train Plan Editor

Turn conversational plan changes into deterministic edit operations for the current week markdown plan.

## Workflow

1. Detect plan-edit intent.
- Trigger on requests like: `swap day 2 and day 4`, `make this week 3 days`, `add bench volume`, `remove dips on day 4`.
- Do not trigger on workout logging (`I did bench 185x5`) or stats/history requests.

2. Disambiguate before writing.
- If message mixes plan edits with logging/query intent, ask one concise clarification question.
- If the target day/exercise is ambiguous, ask one concise clarification question.

3. Parse to structured edits.
- Emit only supported edit operations listed in [schema.md](references/schema.md).
- Keep edit order exactly as intended by the user.

4. Validate for conflicts.
- Detect contradictory edits in one payload (example: set to 3 training days, then edit day 5).
- Return `needs_clarification` instead of guessing.

5. Hand off to CLI.
- For `parse_result`, run `train plan edit --json` with the payload.
- Use dry-run mode only when user explicitly asks for a preview.

6. Confirm changes.
- Summarize applied edits and affected days concisely.

## Clarification Policy

Return `needs_clarification` with exactly one short question when:

- Day index is missing or invalid.
- Exercise target is not specific enough.
- Requested change conflicts with another requested change.
- User asks for unsupported transformation.
- Message combines plan edit with log/query in a way that could write incorrect data.

## Output Contract

Return exactly one of:

1. `parse_result` with `edits[]` ready for `train plan edit --json`
2. `needs_clarification` with one question and machine-readable context

Use the canonical shape in [schema.md](references/schema.md). Use examples in [examples.md](references/examples.md).

## Guardrails

- Scope edits to the current week unless user specifies an explicit ISO week.
- Preserve exercise wording from the user where possible.
- Do not invent unavailable day/exercise references.
- Prefer precise, minimal edits over broad rewrites.
