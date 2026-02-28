---
name: train-log-parser
description: Parse natural-language workout logging messages into strict set-level payloads for the Train CLI. Use when a user reports completed or attempted workout activity in chat and the agent must convert it into validated JSON/`train log` calls (lb/kg/bodyweight/cardio, reps/sets/RPE/notes), or must ask a concise clarification question when the log is ambiguous.
---

# Train Log Parser

Turn chat workout statements into deterministic logging actions while keeping code thin: use model parsing, then enforce strict schema validation and clarification rules before any write.

## Workflow

1. Detect logging intent.
- Treat as logging intent when the user indicates completed/attempted training work.
- Trigger on examples like: `logged squat 102.5kg 5x5`, `finished push day`, `bench 185 5,5,4`.
- Do not trigger on pure planning/status requests like: `what's today's workout?`, `how am I progressing?`.

2. Parse the message with the model.
- Parse freeform text into a structured candidate payload.
- Avoid regex-first extraction; use schema-driven model parsing.
- Preserve what the user actually said (exercise wording, notes, perceived effort).

3. Expand to full set-level data.
- Convert compact forms (`4x5 @ 185`) into explicit set rows with `set_number`.
- Keep per-set variations (`5,5,4`) exactly.
- Represent cardio/timed work with `duration_seconds` and nullable reps/load fields.

4. Normalize units and compute canonical load.
- Accept `lb`, `lbs`, `kg`, `bw`.
- Store both entered values and canonical `weight_kg` when applicable.
- Keep bodyweight/no-load sets as `weight_unit="bw"` and `weight_kg=null`.

5. Validate against schema before output.
- Load [schema.md](references/schema.md).
- Reject payloads missing required fields or with impossible combinations.
- Return a clarification question instead of guessing.

6. Emit actions for CLI execution.
- Produce action payload(s) that map directly to `train log ... --json`.
- Include `source_message_id` when available to support idempotency.

## Clarification Policy

Ask one short clarification question when any of these apply:

- Exercise is ambiguous (`row` could map to multiple variants).
- Set structure is missing (`did bench 185` without reps/sets).
- Unit is missing and no safe default can be inferred.
- Message mixes plan intent and log intent in a way that changes writes.
- Cardio description lacks duration or distance fields required by schema.

Do not write partial logs unless the user explicitly requests partial logging.

## Output Contract

Return exactly one of:

1. `parse_result` with valid set-level entries ready for CLI mapping.
2. `needs_clarification` with one question and machine-readable missing fields.

Use the canonical shape in [schema.md](references/schema.md). Use examples in [examples.md](references/examples.md).

## Guardrails

- Prefer fidelity over inference. Keep user intent intact.
- Keep each entry atomic and replay-safe.
- Keep chat response concise after parsing; rely on structured payload for execution.
