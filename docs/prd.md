# Train — V0 PRD (Replanned)

## 1) Product Goal

Ship a usable chat-first training tracker in NanoClaw for one user.

V0 should feel simple and reliable for daily use:

1. Show today's workout from Markdown plans.
2. Log completed sets from chat into Supabase.
3. Answer basic history/progression questions from stored data.

## 2) V0 User Outcomes

A single user can do these in chat without manual database work:

1. `what's today's workout?`
2. `logged squat 102.5kg 5x5 rpe 8`
3. `show bench history`
4. `show bench trend`

If those work consistently, v0 is successful.

## 3) Scope

## In scope

- NanoClaw chat interface
- Markdown workout plans (`plans/*.md`)
- Set-level workout logging
- Supabase persistence (`train` schema)
- Basic history + progression queries
- One-time TrainHeroic migration tooling

## Out of scope

- Multi-user auth and permissions
- RLS and policy hardening
- Plan versioning / planned-vs-actual modeling
- Exercise alias/fuzzy matching
- Advanced analytics/recommendations/charts
- Web app UI

## 4) V0 Operating Decisions

These are intentional v0 simplifications:

1. Single-tenant usage (one operator).
2. No auth enforcement in app flow yet.
3. No RLS for now (speed of iteration > security hardening for v0).
4. `train` schema tables are used directly.
5. Plans remain in Markdown; execution logs are in DB.

## 5) Architecture (Minimal)

```text
User (NanoClaw chat)
   -> Intent routing in AGENTS.md
      -> plan intent: train plan today --json
         -> plans/*.md

      -> log intent: $train-log-parser
         -> train log import --json
            -> Supabase train tables

      -> query intent: train history / train stats --json
         -> Supabase train tables
```

## 6) Skill vs Code Boundary

## AGENTS.md (day-to-day behavior)

- Intent routing for plan/log/history/stats
- Command selection
- Response style rules

## Skills

1. `train-log-parser`
- Parse natural language workout logs into strict JSON payloads
- Ask concise clarification only when required

2. `train-output-templates`
- Optional display formatting for chat responses

3. `trainheroic-migration-prep`
- One-time conversion of TrainHeroic export into import-ready files

## CLI/Application code

- Validate payloads
- Normalize units (`lb`, `kg`, `bw`)
- Write/read DB rows
- Return deterministic JSON envelopes

## 7) Data Model (V0)

Use four tables in `train`:

1. `train.exercises`
2. `train.workouts`
3. `train.workout_exercises`
4. `train.exercise_sets`

Conceptual model:

```text
workouts 1---N workout_exercises 1---N exercise_sets
                \ 
                 N---1 exercises
```

Set-level fields retained for progression:

- `reps`
- `duration_seconds`
- `weight_value`
- `weight_unit`
- generated `weight_kg`
- `rpe` (optional)

## 8) CLI Surface (V0)

Core commands we depend on:

```bash
train plan today --json
train log import --json
train history --last 7d --json
train stats <exercise> --json
train query e1rm <exercise> --json
train query best-set <exercise> --reps <n> --json
```

Migration/ops commands:

```bash
train supabase import-csv --dir <path> --db-url <url> --truncate --json
train supabase verify --db-url <url> --json
```

Note: keep command output JSON-only for stable agent behavior.

## 9) V0 Success Criteria (Acceptance)

V0 is done when all are true:

1. `what's today's workout?` returns plan entries from Markdown.
2. Typical log message writes expected set rows to Supabase.
3. `history` query returns recent rows by exercise/date.
4. `stats <exercise>` returns usable trend/PR summary.
5. Historical TrainHeroic data is imported and queryable.

## 10) Implementation Sequence

1. Confirm DB schema exists in Supabase (`train` tables).
2. Finalize CLI DB adapter paths (no mixed SQLite/Supabase behavior for v0 runtime path).
3. Keep `train-log-parser` as primary parser for logging intents.
4. Wire NanoClaw routing in AGENTS.md to the four core commands.
5. Import historical CSV bundle.
6. Verify counts + spot-check query results.
7. Run 5 end-to-end chat acceptance scenarios.

## 11) Risks and Mitigations (V0)

1. Duplicate logs
- Mitigation: accept for v0; operationally clean if needed.

2. Parser ambiguity
- Mitigation: one clarification question max, then log.

3. Schema drift vs CLI expectations
- Mitigation: keep this PRD and migration script aligned; update both together.

4. Security is intentionally relaxed
- Mitigation: plan v1 hardening (RLS/auth) as first post-v0 milestone.

## 12) Post-V0 Hardening

After v0 proves daily usability:

1. Reintroduce auth with user JWTs.
2. Re-enable RLS with `auth.uid()` ownership policies.
3. Add idempotency key strategy for duplicate-message protection.
4. Add backup/restore and basic audit trail.
