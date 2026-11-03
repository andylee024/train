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

[`arc-2026-summer-dunk/`](arc-2026-summer-dunk/): May 3 → Nov 7, 2026 (arc week = DNT week). **This week is W24** (Sun Nov 1 – Sat Nov 7), the last week of the **W21–W24 Strength block**. The arc closes Nov 7. A new arc starts at **W1** on Nov 8: Power (W1–4) → Reactive (W5–8) → Test (W9–12, dunk test Jan 30, 2027). W1 is not written yet.

Goals, in order: dunk a volleyball on a 10' rim; power clean and power clean & jerk 225 with the DNT coach; strength keeps climbing, with a 405 squat within 12 months. No BJJ. The side split is not tracked.

Programming is built with the repo skills in `.claude/skills/`: `build-workout-plan` + four `principle-*` skills.

The bundle is **self-contained**. Open the bundle's [`README.md`](arc-2026-summer-dunk/README.md) for the file map and how to pull it. Default branch is `main`.

## Source of truth (storage boundary)

- **Planned work:** markdown inside the active arc bundle.
- **Executed work:** Supabase (`workouts`, `workout_exercises`, `exercise_sets`).
- **Logging / queries:** the Supabase MCP connector writes sets and reads history and e1RM.

## When this arc ends

When W24 completes (Nov 7, 2026):

1. This bundle stays as the record of the summer arc.
2. A new arc bundle is created for the Power → Reactive → Test run.
3. That bundle gets its own profile snapshot, arc.md, blocks, and weeks.
4. The agent's pull target switches to the new bundle.

Athlete-level material that persists across arcs stays at this level. An earlier note in this file pointed at a Sep 5, 2026 ending and a follow-on MMA arc. Both were dropped: the summer arc was extended through W24, and BJJ is not on the plan.
