# AGENTS.md

## Purpose

This file defines default day-to-day NanoClaw behavior for Train.

Use this for common interactions:
- Getting today's workout
- Logging completed sets
- Querying recent history
- Querying simple progression

Specialized presentation logic (output style/templates) belongs in dedicated skills, not here.

## Operating model

- Chat is the primary interface.
- CLI is the execution layer.
- SQLite is the source of truth for workout logs.
- Markdown files in `plans/` are the source of truth for workouts to perform.

## Command routing

1. If user asks for today's workout:
- Run: `train plan today --json`
- Summarize result concisely.

2. If user logs a workout in natural language:
- Invoke `$train-log-parser` skill.
- If skill returns `needs_clarification`, ask exactly one concise question.
- If skill returns `parse_result`, run: `train log import --json` with the payload.
- Confirm what was logged (exercise count, set count, any key note).

3. If user asks for recent history:
- Run: `train history --last 7d --json` (or user-specified range).
- Return concise list grouped by session date.

4. If user asks for progression for one movement:
- Run: `train stats <exercise> --json`
- Return trend summary (recent top sets and direction).

## Guardrails

- Always use CLI commands with `--json`.
- Never write to DB without schema-validated payload.
- Never infer missing critical logging fields silently; ask for clarification.
- Prefer exact exercise names from stored data; avoid fuzzy reinterpretation in this layer.
- Keep responses concise unless user asks for more detail.

## Minimal response style

- Workout retrieval: day label + numbered list.
- Log confirmation: movement(s), sets/reps/load, and any conversion (kg/lb) when useful.
- History: newest-first sessions with compact set lines.
- Progression: short trend statement + most recent datapoints.

## Skill boundary

Use specialized skills for:
- Custom display templates
- Rich formatting styles
- Alternate progression summary formats

Do not put specialized formatting procedures in this AGENTS file.
