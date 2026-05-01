# Live Renderer — Plan + Actuals → Spreadsheet

The renderer that keeps the user-facing `.xlsx` in sync with what the athlete actually lifted. This is the artifact that makes Train feel like a coached experience — a personalized spreadsheet that updates as workouts happen.

---

## Storage boundary (recap)

Per [database-schema.md](database-schema.md):

- **Markdown = everything planned.** Block files, week files, athlete profile.
- **Supabase = everything that happened.** `workouts`, `workout_exercises`, `exercise_sets`, plus rollups.
- **The `.xlsx` is a rendered VIEW** of plan + actuals. It is never the source of truth — always regenerated.

There are three renderers, one source of truth per data type.

---

## The three renderers

### 1. Plan renderer (build)

**Source code:** `.claude/skills/training-plan/build_v6.py` (per-arc; future arcs get their own script or a generalized version)

**Inputs:** Python data structures (block specs, exercise dictionaries, progression schedules)

**Outputs:**
- `athletes/{name}/outputs/{plan-name}.xlsx` — design-time spreadsheet (prescriptions only)
- `athletes/{name}/blocks/{NN-name}.md` — one per block
- `athletes/{name}/weeks/{week-id}.md` — one per week
- `athletes/{name}/active/current-block.md` + `current-week.md` — snapshots
- (future) Supabase seed of `weekly_schedule` rows for prescribed sessions

**When it runs:** at arc creation, and whenever the plan is edited.

**Idempotency:** rerunning overwrites all generated files. Edits should happen in the build script, not in the generated artifacts.

---

### 2. Logger (capture)

**Source:** NanoClaw / WhatsApp / CLI (`train log` commands), eventually a web UI.

**Inputs:** Conversational logging — "bench 185×6, 185×6, 185×5, 185×5 @ RPE 8."

**Outputs:** Rows in Supabase tables:
- `workouts` (one per session)
- `workout_exercises` (one per exercise in the session, with `order_index`)
- `exercise_sets` (one per set, with reps/weight/RPE/notes)

**When it runs:** every time the athlete reports a set, in real time during/after the session.

---

### 3. Live renderer (sync)

**Source code:** TBD — `app/scripts/render_live_plan.py` (to be built)

**Inputs:**
- The current week's planned exercises (from `weeks/{week-id}.md` or directly from `BLOCK_SPECS`)
- All `exercise_sets` rows in Supabase since the start of the current arc (or week)

**Outputs:**
- `athletes/{name}/outputs/{plan-name}-live.xlsx` — the "live" spreadsheet that shows:
  - Prescribed columns (Wk 1 prescribed: 165 lb 4×6)
  - Actual columns (Wk 1 actual: 165×6, 165×6, 165×5, 165×5 @ RPE 8)
  - PR markers (asterisk if this is a new e1RM)
  - Completion status (✓ if all prescribed sets logged, ⚠ if missed, ✗ if skipped)
  - Trend line on the primary lifts (squat top set across weeks, bench across weeks, etc.)

**When it runs:**
- Triggered after every workout is logged (Supabase webhook → script → re-render)
- Or on a cron (every 30 min during active hours)
- Or on demand via `train spreadsheet refresh`

**Joining logic:**

```
For each prescribed exercise on day D in week W:
  Look up the workout matching (date=D, exercise=name)
  If found: pull all sets, format as actual column
  Compute e1RM (Epley) from heaviest set
  If e1RM > previous best for this exercise: mark as PR
```

**Exercise name matching:** prescribed exercise names (e.g., "Back Squat") must match the canonical name in Supabase `exercises` table. The build script enforces this; if a typo creeps in, the live renderer logs a warning and shows "—" in the actual column.

---

## Data flow diagram

```
                 ┌─────────────────────────┐
                 │  build_v6.py            │
                 │  (plan source)          │
                 └───────────┬─────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  v6.xlsx     │ │  *.md plan   │ │  Supabase    │
    │  (design)    │ │  files       │ │  weekly_     │
    │              │ │  (agent)     │ │  schedule    │
    └──────────────┘ └──────────────┘ └──────┬───────┘
                                             │
                              athlete trains, agent logs
                                             │
                                             ▼
                                     ┌──────────────┐
                                     │  Supabase    │
                                     │  exercise_   │
                                     │  sets        │
                                     └──────┬───────┘
                                             │
                                  render_live_plan.py
                                             │
                                             ▼
                                     ┌──────────────┐
                                     │  v6-live.xlsx│
                                     │  (prescribed │
                                     │   + actual + │
                                     │   PR markers)│
                                     └──────────────┘
```

---

## What's built today (v6)

| Component | Status | Notes |
|---|---|---|
| Plan renderer (xlsx) | ✓ Built | `build_v6.py` writes `hybrid-athletic-plan-v6.xlsx` |
| Plan renderer (md blocks) | ✓ Built | Writes 3 block files |
| Plan renderer (md weeks) | ✓ Built | Writes 18 week files |
| Plan renderer (active snapshots) | ✓ Built | Writes `active/current-block.md` + `current-week.md` |
| Plan renderer (Supabase seed) | ✗ TODO | Need to write `weekly_schedule` rows for the 18 weeks |
| Logger | Partial | Existing `exercise_sets` table works; NanoClaw integration TBD |
| Live renderer | ✗ TODO | The `-live.xlsx` artifact |
| Webhook trigger | ✗ TODO | Re-render after each logged workout |

---

## Build order (recommended)

1. **Now (done):** Plan renderer outputs xlsx + md.
2. **Next:** Wire NanoClaw to log to Supabase `exercise_sets` cleanly with consistent exercise names.
3. **Then:** Build `render_live_plan.py` reading Supabase + plan, writing `-live.xlsx`. Run it manually first.
4. **Then:** Add the Supabase seed step to plan renderer (so prescribed work is queryable, not just markdown).
5. **Then:** Add the webhook / cron trigger.
6. **Future:** Web UI to display the live xlsx in-browser, with edit-in-place for swaps and adjustments.

---

## Key design choices

**Why .xlsx as the user-facing artifact?**
Athletes love seeing a personal spreadsheet that grows with them — it feels like Train Heroic with PRs lighting up. It's also offline-capable and shareable with coaches outside the system.

**Why markdown for the agent?**
Text agents (Claude, GPT, etc.) handle markdown natively. The agent reads `active/current-week.md` to know today's session, reads `current-block.md` for context. No parser needed.

**Why Supabase as execution source of truth?**
Structured queries (e1RM trends, volume per muscle group, compliance %) need a relational store. Markdown logs would force every analytical query to re-parse text.

**Why regenerate the .xlsx instead of mutating it in place?**
Mutation creates state we can't reproduce. Regeneration means the .xlsx is always derivable from (plan source + Supabase). Rerun any time without fear.

---

## Multi-tenant readiness

The current setup is single-athlete (Andy). To productize:

1. The plan renderer takes athlete name as a parameter; outputs go to `athletes/{name}/...`.
2. Supabase queries filter by `user_id` (column already exists; not yet enforced via RLS).
3. The live renderer accepts `(athlete_name, arc_id)` and outputs `{athlete-name}-{arc-id}-live.xlsx`.
4. Each athlete's WhatsApp number maps to a `user_id` via a registration table.
