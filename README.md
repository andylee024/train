# Train

Andy's workout tracker. Three parts, one loop:

| Part | Where | Source of truth for |
|---|---|---|
| **Plan** | `docs/athletes/andy/<arc>/training/` | What's prescribed — hand-edited markdown, one file per week |
| **Log** | Supabase (`workouts`, `workout_exercises`, `exercise_sets`) | What was actually done |
| **Progress** | `web/dashboard/` | Visualizing the log — e1RM trends, PRs, per-lift history |

`app/cli/` is a thin CLI over the same Supabase tables (log a workout from JSON, query history and e1RM).

## Repo layout

```
train/
├── app/
│   ├── cli/                   ← `train` CLI (cli.ts + train-api.ts)
│   ├── supabase/migrations/   ← schema
│   └── scripts/               ← exercise library seed
├── web/dashboard/             ← Next.js progress dashboard (/strength, /progress/[lift])
├── docs/
│   ├── athletes/andy/         ← arc bundles (plan markdown, profile, coach PDFs, reviews)
│   └── content/               ← coach methodology library (style guides + source material)
└── .claude/skills/            ← dnt-overview, integrate-dnt-workout
```

## Run

```bash
# dashboard
cd web/dashboard && npm install && npm run dev      # http://localhost:3000

# cli (reads repo-root .env)
npx tsx app/cli/cli.ts history --last 7d
npx tsx app/cli/cli.ts query e1rm "Back Squat"
npx tsx app/cli/cli.ts stats "Bench Press"
echo '{...}' | npx tsx app/cli/cli.ts log import
```

Env (repo-root `.env`): `SUPABASE_URL`, `SUPABASE_KEY`, `TRAIN_USER_ID`. See `.env.example`.

## Rules

- Plan markdown is the plan. Edit it directly. Never write executed sets into it.
- Executed sets go to Supabase only. The dashboard and CLI read from there.
- Exercise names in the plan must match `exercises.name` in Supabase or PR lookups miss.
