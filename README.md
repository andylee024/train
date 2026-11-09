# Train

Andy's training plan + log. Two parts, one loop:

| Part | Where | Source of truth for |
|---|---|---|
| **Plan** | `docs/athletes/andy/<arc>/training/` | What's prescribed: hand-edited markdown, one file per week |
| **Log** | Supabase (`workouts`, `workout_exercises`, `exercise_sets`, `daily_metrics`, `measurements`) | What was actually done and measured. Read and written through the Supabase MCP connector |

## Repo layout

```
train/
├── docs/
│   ├── athletes/andy/         ← profile.md + daily-warmup.md (athlete-level) · arc bundles (plan, coach PDFs, reviews) · archive/
│   └── library/               ← training-styles: reference guides the skills cite
└── .claude/skills/            ← build-workout-plan, 4 principle-* skills, dnt-overview
```

## Rules

- Plan markdown is the plan. Edit it directly. Never write executed sets into it.
- Executed sets go to Supabase only.
- Exercise names in the plan must match `exercises.name` in Supabase or PR lookups miss.
- Non-set measurements (jump ladder, hand depth, flexibility tests, touch) go to `measurements`, bodyweight to `daily_metrics`.
- The plan exists in three places — skills (rules), week files (prescription), the Claude Docs plan (readable mirror). A plan change touches all three in one commit.
