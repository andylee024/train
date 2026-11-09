# Andy — Athlete Directory

Andy Lee's athlete directory. Contents are scoped per-arc: each arc gets its own self-contained bundle that holds the plan, profile snapshot, and everything the text agent needs.

## Structure

```
andy/
├── README.md                       ← this file
├── arc-2026-winter-jump/           ← ACTIVE arc bundle (Nov 8, 2026 – Jan 30, 2027)
├── arc-2026-summer-dunk/           ← closed arc (May 3 – Nov 7, 2026), kept as history
└── archive/                        ← superseded docs (old coach-integration notes, legacy CSVs)
```

## Active arc

[`arc-2026-winter-jump/`](arc-2026-winter-jump/): Nov 8, 2026 → Jan 30, 2027, arc week = DNT week. Jump-first: P · Power + Approach (W1–4) → R · Reactive (W5–8) → T · Test (W9–12, dunk test Jan 30). Start with its `training/arc.md`.

Closed: [`arc-2026-summer-dunk/`](arc-2026-summer-dunk/) (W1–W24; reviews in `reviews/`). Programming is built with the repo skills in `.claude/skills/`: `build-workout-plan` + four `principle-*` skills.

## Source of truth (storage boundary)

- **Planned work:** markdown inside the active arc bundle.
- **Executed work:** Supabase (`workouts`, `workout_exercises`, `exercise_sets`).
- **Logging / queries:** the Supabase MCP connector writes sets and reads history and e1RM.

## When the active arc ends

When the 2026 summer dunk arc completes (Sep 5, 2026):

1. The bundle stays in place as a historical record (rename if you want, e.g., `arc-2026-summer-dunk-completed/`)
2. A new arc bundle is created (e.g., `arc-2026-fall-mma/`)
3. The new bundle gets its own profile snapshot, arc.md, blocks, weeks, vendored styles
4. The agent's pull target switches to the new bundle

Athlete-level material that persists across arcs stays at this level.
