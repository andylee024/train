# AGENTS.md

## Purpose

This file defines Train-specific runtime behavior.

## Farm-Orchestrated Coding (Required)

All coding tasks for `train` must follow the canonical Farm orchestration policy:

1. Read `/Users/andylee/Projects/farm/AGENTS.md` before starting.
2. Follow the required reading order and workflow defined there.
3. Use repo key `train` when running Farm CLI.
4. Do not create or move coding tasks via Linear MCP tools or ad-hoc scripts.

Recommended defaults:

- `FARM_CONFIG=/Users/andylee/Projects/farm/config.yaml`
- `FARM_REGISTRY=/Users/andylee/Projects/farm/data/registry.json`
- `REPO_KEY=train`

## Non-Coding Requests

This Farm-first rule is for coding task orchestration. Normal Train chat/CLI usage (plan retrieval, logging, stats, history) stays unchanged.

## Canonical Schema Context

Before any DB-related implementation or changes, read:

- `docs/database-schema.md`

That document is the canonical schema contract. If code or migrations conflict with it, align to the document first.

Use this for common interactions:
- Getting today's workout
- Logging completed sets
- Querying recent history
- Querying simple progression

Specialized presentation logic (output style/templates) belongs in dedicated skills, not here.

## Operating model

- Chat is the primary interface.
- CLI is the execution layer.
- Database is the source of truth for logged workouts/exercises/sets.
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

5. If user asks for estimated 1RM:
- Run: `train query e1rm <exercise> --json`
- Return e1RM and source set used for the calculation.

6. If user asks for best set at a target rep count:
- Run: `train query best-set <exercise> --reps <n> --json`
- Return top loaded set plus date/context.

## Guardrails

- Always use CLI commands with `--json`.
- Never write to DB without schema-validated payload.
- Keep DB changes minimal and consistent with `docs/database-schema.md`.
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
- Data import/transformation workflows (e.g., TrainHeroic mapping), after schema review

Do not put specialized formatting procedures in this AGENTS file.
