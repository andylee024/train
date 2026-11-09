# Train

Andy's training plan + log. Two parts, one loop:

| Part | Where | Source of truth for |
|---|---|---|
| **Plan** | `<arc>/training/` | What's prescribed: `arc.md` (strategy) + one block file per 4-week block (§1 fixed week, §2 per-week deltas) |
| **Log** | Supabase (`workouts`, `workout_exercises`, `exercise_sets`, `daily_metrics`, `measurements`) | What was done and measured. Written from Telegram (grokbot) and the Supabase MCP connector |

## Repo layout

```
train/
├── CLAUDE.md, README.md, HANDOFF.md   ← agent entry · this file · Telegram-agent spec
├── profile.md                         ← living athlete profile (numbers, injuries, how he trains)
├── arc-2026-winter-jump/              ← ACTIVE arc: training/arc.md + training/blocks/ · coach-programs/ · reviews/
├── arc-2026-summer-dunk/              ← closed arc (May–Nov 2026), kept as history
├── archive/                           ← superseded docs
├── library/                           ← reference guides the skills cite (THP/VJ, Dylan Shannon, Matt Smith, Catalyst)
├── dashboard/                         ← Next.js analyst dashboard over the Supabase log (owned by the Grok agent)
└── .claude/skills/                    ← the rules: build-workout-plan + 4 principle-* skills + dnt-overview
```

## Rules

- Plan markdown is the plan. Edit it directly. Never write executed sets into it.
- Executed sets go to Supabase only; non-set measurements (ball ladder, hand depth, flexibility tests) to `measurements`, bodyweight to `daily_metrics`.
- Exercise names in the plan must match `exercises.name` in Supabase or PR lookups miss.
- Durable facts about the athlete → `profile.md`. Rules about how he trains → skills. Anything tied to a date range → an arc.
- Week number = `(today − arc start) ÷ 7 + 1` = DNT coach week. Today's session = the block file for that week: §1 day table + §2 week row.
