# Train

| | Where |
|---|---|
| Plan | `arcs/<arc>/training/arc.md` + `arcs/<arc>/training/blocks/` (§1 fixed week · §2 per-week deltas) |
| Log | Supabase `workouts` · `workout_exercises` · `exercise_sets` · `daily_metrics` · `measurements` |
| Rules | `.claude/skills/` |

```
train/
├── CLAUDE.md · README.md · AGENT.md
├── profile.md
├── arcs/
│   ├── arc1-2026/     closed
│   └── arc2-2026/     active — training/{arc.md,blocks/} · coach-programs/ · reviews/
├── archive/
├── library/
├── dashboard/
└── .claude/skills/
```

Arc folders: `arcN-YYYY` — arc number, start year. Dates live in the arc's `training/arc.md`. Week = `(today − arc start) ÷ 7 + 1` = DNT week.
