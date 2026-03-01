# Train V0 Plan

## Goal

Ship a usable single-user V0 where Train runs through NanoClaw chat and uses Supabase as the system of record.

## V0 Capabilities

## 1) Migrate TrainHeroic Data to Supabase and Use Supabase Going Forward

### Objective

Import historical TrainHeroic data into Supabase and make Supabase the only persistence target for V0 runtime.

### Scope

- Use canonicalized migration bundle (`.../2026-03-01T084500Z-canonical`)
- Import into `public` tables:
  - `public.exercises`
  - `public.workouts`
  - `public.workout_exercises`
  - `public.exercise_sets`
- Preserve alias canonicalization (e.g., `Back Squats` -> `Back Squat`)

### Deliverables

1. Schema present and verified in Supabase (`public` schema).
2. Historical CSV import complete in FK order.
3. Post-import verification report (row counts + integrity checks).
4. Import runbook documented in repo.

### Acceptance Criteria

1. All 4 target tables exist and are queryable.
2. CSV import succeeds with no FK errors.
3. Expected row counts are present after import.
4. Canonical exercise merges are reflected in `exercises` and downstream queries.

## 2) Chat with NanoClaw to Log Workouts

### Objective

From chat, log workouts reliably into Supabase with minimal friction.

### Scope

- Logging intent handled by `$train-log-parser`.
- Parser emits structured JSON payload.
- CLI persists payload to Supabase (`public` tables).
- V0 allows duplicates (explicit decision).

### Deliverables

1. NanoClaw intent route for workout logging.
2. Logging command path that writes to Supabase (not SQLite).
3. Confirmation response template for logged sets.

### Acceptance Criteria

1. Example message like `logged squat 102.5kg 5x5 rpe 8` writes expected rows.
2. `kg`, `lb`, and timed sets are accepted per schema.
3. Failure responses are actionable when payload is invalid.

## 3) Chat with NanoClaw to Query Performance

### Objective

Support practical training questions in chat, especially 1RM and rep-specific best sets.

### Scope

- Query examples:
  - `what's my 1RM on squat?`
  - `what's my best set for 8 reps for squat?`
- Canonical stat metric: **estimated 1RM (e1RM)**.
- Time window for 1RM: **last 365 days**.
- e1RM computed from best eligible set in window.

### V0 Metric Definitions

1. **Estimated 1RM (Epley)**
   - `e1RM = weight * (1 + reps / 30)`
   - Use best set in last 365 days for the requested lift.
2. **Best Set for N Reps**
   - Filter sets where `reps = N` and exercise matches canonical name.
   - Return max `weight_kg` set (and original unit/value for display).

### Deliverables

1. Query command path from NanoClaw to CLI.
2. Stable JSON response contracts for stats queries.
3. Output formatting for concise chat answers.

### Acceptance Criteria

1. `1RM` query returns a deterministic numeric answer + source set context.
2. `best set for 8 reps` returns top set and date.
3. If no data exists, assistant returns a clear no-data response.

## Architecture (V0)

```text
NanoClaw Chat
  -> AGENTS.md intent routing
    -> Logging: $train-log-parser -> train log import --json -> Supabase public tables
    -> Queries: train query e1rm / train query best-set --json -> Supabase public tables
    -> Plans: train plan today --json -> plans/*.md
```

## Farm-Orchestrated Delivery (Projects/farm)

Use Farm as the execution/orchestration layer for implementation tracking.

## Proposed Workstreams

1. **WS1: Data Migration (Supabase)**
   - finalize schema
   - import canonical CSVs
   - verify counts/integrity

2. **WS2: Logging Runtime Path**
   - switch runtime logging path to Supabase
   - keep parser-driven JSON contract
   - verify end-to-end from chat

3. **WS3: Query Runtime Path**
   - implement e1RM + best-set queries
   - return stable, concise chat responses

4. **WS4: Quality/Acceptance**
   - run acceptance scenarios
   - document operator runbook

## Suggested Milestones

1. **M1: Data Ready**
   - Supabase schema + import complete
2. **M2: Logging Live**
   - chat-to-db logging working
3. **M3: Query Live**
   - 1RM and best-set queries working
4. **M4: V0 Launch**
   - acceptance scenarios pass

## Acceptance Scenarios

1. `what's today's workout?` returns Markdown plan section.
2. `logged squat 102.5kg 5x5 rpe 8` writes set rows in Supabase.
3. `what's my 1RM on squat?` returns e1RM from last 365 days.
4. `what's my best set for 8 reps for squat?` returns top matching set.
5. Empty-data query returns graceful no-data message.

## Explicit V0 Non-Goals

- Multi-user auth and RLS hardening
- Advanced analytics/recommendation engine
- Plan versioning and planned-vs-actual comparison
- Fuzzy exercise matching beyond explicit alias map

## Post-V0 Hardening (Next)

1. Reintroduce auth and RLS.
2. Add dedupe/idempotency policy if duplicates become a problem.
3. Expand canonical alias management tooling.
