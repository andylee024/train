# Andy — Athlete Directory

Andy Lee's athlete directory. Contents are scoped per-arc: each arc gets its own self-contained bundle that holds the plan, profile snapshot, and everything the text agent needs.

## Structure

```
andy/
├── README.md                       ← this file
├── arc-2026-summer-dunk/           ← ACTIVE arc bundle (start README.md inside)
└── archive/                        ← superseded docs (old coach-integration notes, legacy CSVs)
```

## Active arc

[`arc-2026-summer-dunk/`](arc-2026-summer-dunk/): May 3 → Nov 7, 2026 (extended; arc week = DNT week). Currently in the **W21–W24 Strength block**. It closes at W24, and a new arc starts at **W1** on Nov 8 (Power → Reactive → Test blocks, dunk test Jan 30, 2027).

Programming is built with the repo skills in `.claude/skills/`: `build-workout-plan` + four `principle-*` skills.

The bundle is **self-contained**. Open the bundle's [`README.md`](arc-2026-summer-dunk/README.md) for pull instructions (how the cloud agent ingests the bundle) and contents map.

## Source of truth (storage boundary)

- **Planned work:** markdown inside the active arc bundle.
- **Executed work:** Supabase (`workouts`, `workout_exercises`, `exercise_sets`).
- **Logging / queries:** the `train` CLI (`app/cli/`) writes sets to Supabase and reads history and e1RM.

## When the active arc ends

When the 2026 summer dunk arc completes (Sep 5, 2026):

1. The bundle stays in place as a historical record (rename if you want, e.g., `arc-2026-summer-dunk-completed/`)
2. A new arc bundle is created (e.g., `arc-2026-fall-mma/`)
3. The new bundle gets its own profile snapshot, arc.md, blocks, weeks, vendored styles
4. The agent's pull target switches to the new bundle

Athlete-level material that persists across arcs stays at this level.
