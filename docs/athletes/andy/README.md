# Andy — Athlete Directory

Andy Lee's athlete directory. Contents are scoped per-arc: each arc gets its own self-contained bundle that holds the plan, profile snapshot, and everything the text agent needs.

## Structure

```
andy/
├── README.md                       ← this file
├── nutrition.md                    ← cross-arc nutrition operating system
├── arc-2026-summer-dunk/           ← ACTIVE arc bundle (start README.md inside)
└── logs/                           ← historical exercise CSVs (cross-arc)
```

## Active arc

[`arc-2026-summer-dunk/`](arc-2026-summer-dunk/) — 18-week dunk + upper + side split arc, May 3 → Sep 5, 2026.

The bundle is **self-contained**. Open the bundle's [`README.md`](arc-2026-summer-dunk/README.md) for pull instructions (how the cloud agent ingests the bundle) and contents map.

## Source of truth (storage boundary)

- **Planned work:** markdown inside the active arc bundle.
- **Executed work:** Supabase (`workouts`, `workout_exercises`, `exercise_sets`).
- **Athlete-facing spreadsheet:** generated artifact at `arc-2026-summer-dunk/outputs/`.

See [`docs/product/database-schema.md`](../../product/database-schema.md) and [`docs/product/live-renderer.md`](../../product/live-renderer.md) for the full data architecture.

## When the active arc ends

When the 2026 summer dunk arc completes (Sep 5, 2026):

1. The bundle stays in place as a historical record (rename if you want, e.g., `arc-2026-summer-dunk-completed/`)
2. A new arc bundle is created (e.g., `arc-2026-fall-mma/`)
3. The new bundle gets its own profile snapshot, arc.md, blocks, weeks, vendored styles
4. The agent's pull target switches to the new bundle

Athlete-level data that persists across arcs (logs, nutrition, identity) stays at this level.
