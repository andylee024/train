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
│   ├── 2026-05-summer-dunk/     closed
│   └── 2026-11-winter-jump/     active — training/{arc.md,blocks/} · coach-programs/ · reviews/
├── archive/
├── library/
├── dashboard/
└── .claude/skills/
```

Arc folders: `YYYY-MM-<slug>` (start month + goal). Week = `(today − arc start) ÷ 7 + 1` = DNT week.
