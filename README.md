# Train

Andy's training plan + log. Two parts, one loop:

| Part | Where | Source of truth for |
|---|---|---|
| **Plan** | `docs/athletes/andy/<arc>/training/` | What's prescribed: hand-edited markdown, one file per week |
| **Log** | Supabase (`workouts`, `workout_exercises`, `exercise_sets`, `daily_metrics`) | What was actually done. Read and written through the Supabase MCP connector |

## Repo layout

```
train/
├── docs/
│   ├── athletes/andy/         ← arc bundles (plan markdown, profile, coach PDFs, reviews)
│   └── content/               ← coach methodology library (style guides + source material)
└── .claude/skills/            ← build-workout-plan, 4 principle-* skills, dnt-overview
```

## Rules

- Plan markdown is the plan. Edit it directly. Never write executed sets into it.
- Executed sets go to Supabase only.
- Exercise names in the plan must match `exercises.name` in Supabase or PR lookups miss.
