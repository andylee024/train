# Train — Product Requirements Document (Reduced V0)

## Goal

Ship the smallest working chat-first workout tracker via NanoClaw.

V0 should do three things reliably:

1. Return today's workout from a Markdown plan file.
2. Log completed workouts from chat into SQLite at set-level detail.
3. Answer basic history/progression questions from SQLite.

## V0 Success Criteria

V0 is live when all of these are true:

1. In NanoClaw chat, `what's today's workout?` returns the workout from `plans/<week>.md`.
2. In NanoClaw chat, messages like `logged squat 102.5kg 5x5 rpe 8` are stored as set rows.
3. Reprocessing the same message ID does not create duplicate logs.
4. In NanoClaw chat, `show bench history` and `show bench trend` return database-backed answers.
5. Core CLI commands return stable `--json` output.

## Scope (V0)

### In scope

- NanoClaw chat interface
- `train-log-parser` skill for workout-log parsing
- Thin CLI kernel for validation, persistence, and queries
- Markdown plan files (`plans/*.md`) as plan source of truth
- SQLite logging database (`data/train.db`)

### Out of scope

- Auto plan parsing from WhatsApp/PDF/spreadsheets
- Exercise alias/fuzzy matching
- Plan vs actual comparisons
- Advanced analytics and recommendations
- Web UI/charts
- Multi-user support

## Simplest Architecture

```text
User in chat
   -> NanoClaw
      -> train-log-parser skill (only for logging intent)
         -> train log import --json
            -> SQLite (workouts, sets)

User in chat
   -> NanoClaw
      -> train plan today --json
         -> plans/*.md

User in chat
   -> NanoClaw
      -> train history --json / train stats <exercise> --json
         -> SQLite
```

## Responsibilities: Skill vs Code

### Skill (`train-log-parser`)

- Detect logging intent from natural language.
- Parse freeform log text to structured set-level payload.
- Ask one concise clarification question when ambiguous.

### Code (CLI)

- Validate payload schema before writes.
- Normalize units (`lb|kg|bw`) and compute `weight_kg`.
- Enforce idempotency using `source_message_id`.
- Persist/query SQLite.
- Return deterministic JSON responses.

## Data Model (Minimal)

Use only two tables in V0.

```sql
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date TEXT NOT NULL,                 -- ISO date, local context
  source_message_id TEXT NOT NULL UNIQUE,     -- idempotency key from chat layer
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL REFERENCES workouts(id),
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_value REAL,
  weight_unit TEXT NOT NULL,                  -- lb | kg | bw
  weight_kg REAL,
  duration_seconds INTEGER,
  rpe REAL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sets_exercise_name ON sets(exercise_name);
CREATE INDEX idx_workouts_session_date ON workouts(session_date);
```

## Plan Files (Markdown)

Plans are manually maintained Markdown files in `plans/`.

Example:

```markdown
# Week 2026-W09

## Monday
- Bench Press: 4x5 @ 185 lb
- OHP: 3x8 @ 115 lb

## Wednesday
- Deadlift: 3x3 @ 365 lb

## Friday
- Squat: 5x5 @ 225 lb
```

`train plan today --json` resolves current weekday section and returns items.

## CLI Surface (Minimal)

```bash
train plan today --json
train log import --json           # payload from skill (stdin or arg)
train history --last 7d --json
train stats <exercise> --json
```

### `train log import --json` contract

Input: parser output (`parse_result`) from `train-log-parser`.

Behavior:

1. Validate schema.
2. Reject with structured error if invalid.
3. Upsert/ignore by `source_message_id` for idempotency.
4. Write one workout row + N set rows transactionally.
5. Return summary JSON (exercise count, set count, total volume).

## Query Requirements (V0)

```sql
-- history: last 7 days
SELECT w.session_date, s.exercise_name, s.set_number, s.reps,
       s.weight_value, s.weight_unit, s.rpe
FROM sets s
JOIN workouts w ON w.id = s.workout_id
WHERE w.session_date >= date('now', '-7 days')
ORDER BY w.session_date, s.exercise_name, s.set_number;

-- progression: per-day top set for one exercise
SELECT w.session_date, MAX(s.weight_kg) AS top_weight_kg, SUM(s.reps) AS total_reps
FROM sets s
JOIN workouts w ON w.id = s.workout_id
WHERE lower(s.exercise_name) = lower(?)
GROUP BY w.session_date
ORDER BY w.session_date;
```

## NanoClaw Integration (V0)

Agent behavior:

1. For `what's today's workout?` -> run `train plan today --json`.
2. For workout logging intent -> invoke `train-log-parser`, then run `train log import --json`.
3. For history queries -> run `train history --json`.
4. For progression queries -> run `train stats <exercise> --json`.
5. Always use `--json` in tool calls; format concise chat responses for the user.

## V0 Implementation Plan

1. **Kernel setup**: TypeScript CLI, SQLite init/migration, JSON response envelope.
2. **Logging path**: implement `train log import --json` + transaction + dedupe.
3. **Plan path**: implement `train plan today --json` Markdown reader.
4. **Query path**: implement `train history` and `train stats <exercise>`.
5. **NanoClaw wiring**: route log messages through `train-log-parser` skill.
6. **Acceptance run**: execute end-to-end chat scenarios and confirm success criteria.

## Acceptance Test Scenarios

1. `@Andy what's today's workout?` returns entries from current day in plan Markdown.
2. `@Andy logged squat 102.5kg 5x5 rpe 8` writes 1 workout + 5 set rows.
3. Replay same message ID: no new rows written.
4. `@Andy show bench history` returns recent bench sets.
5. `@Andy show bench trend` returns per-day top set trend.

## Post-V0 (Next)

- Plan import from coach messages/files
- Exercise normalization/aliases
- Richer stats and PR timelines
- Visualization layer
