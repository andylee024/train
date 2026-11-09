# Train

| | Where |
|---|---|
| Plan | `arcs/<arc>/training/arc.md` + `arcs/<arc>/training/blocks/` (§1 fixed week · §2 per-week deltas) |
| Log | Supabase `workouts` · `workout_exercises` · `exercise_sets` · `daily_metrics` · `measurements` |
| Rules | `.claude/skills/` |

```
train/
├── CLAUDE.md · README.md · HANDOFF.md
├── profile.md
├── arcs/
│   ├── 2026-arc-1-may-to-nov/     closed
│   └── 2026-arc-2-nov-to-jan/     active — training/{arc.md,blocks/} · coach-programs/ · reviews/
├── archive/
├── library/
├── dashboard/
└── .claude/skills/
```

Arc folders: `YYYY-arc-N-mon-to-mon` — start year, arc number, start month, end month. Week = `(today − arc start) ÷ 7 + 1` = DNT week.
