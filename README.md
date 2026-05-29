# Train

A training operating system — a single system that manages the full loop of plan → execute → track → adapt, across both training and nutrition, delivered through a web dashboard (with SMS execution on the roadmap).

The system replaces the four roles an athlete currently does themselves — coach, nutritionist, chief of staff, analyst — so their only job is to show up, do the work, and report what happened.

For product scope and the V1 plan, see [`PRD.md`](PRD.md). For technical architecture, see [`SPEC.md`](SPEC.md).

## Live product

| Surface | URL / location |
|---|---|
| Dashboard (Athlete OS) | `web/dashboard/` — Next.js (`/plan`, `/strength`, `/nutrition`) |
| CLI (Supabase queries) | `app/cli/cli.ts` — `plan today`, `history`, `query e1rm` |

SMS execution (daily-send, inbound log parsing) is on the roadmap (A24-299/300/301) but not currently wired — Train is web-dashboard-only for now.

## Repo structure

```
train/
├── app/                       ← Supabase migrations + TS CLI + scripts
├── web/dashboard/             ← Next.js dashboard (Athlete OS)
├── prototypes/                ← UI / sheet experiments
└── docs/                      ← all markdown lives here
    ├── product/               ← technical references (schemas, formats, decisions)
    ├── content/               ← cross-athlete library
    │   ├── training-styles/   ← what coaches know
    │   ├── nutrition-styles/  ← nutrition methodologies
    │   └── coaching-team/     ← AI coaches *for the athlete*
    └── athletes/              ← per-athlete data (profile, arc bundles, logs)
```

| Directory | Primary reader | What's in it |
|---|---|---|
| [`app/`](app/) | Builder | Supabase migrations + TS CLI (`app/cli/`) + seed scripts |
| [`web/dashboard/`](web/dashboard/) | Athlete | Next.js Athlete OS: `/plan`, `/strength`, `/nutrition`, plan-creation flow |
| [`docs/product/`](docs/product/) | Builders / future contributors | plan schema, db schema, renderer, decisions log |
| [`docs/content/training-styles/`](docs/content/training-styles/) | Planning agents | shared concepts + per-style guides (vertical-jump, catalyst-athletics, etc.) |
| [`docs/content/coaching-team/`](docs/content/coaching-team/) | Anyone wiring up agents | role definitions for head-coach, specialists, operator |
| [`docs/athletes/`](docs/athletes/) | Athlete + their team | per-athlete profile + self-contained arc bundles |
| [`prototypes/`](prototypes/) | Designer / PM | Sheet generator + marketplace mockups |

## Two key boundaries

1. **Reference vs instance.** `docs/content/training-styles/` is the methodology library — timeless, multi-athlete. `docs/athletes/<name>/` is the live instance for a specific person. Keep them separate or the library rots.
2. **Concepts vs styles.** Inside `docs/content/training-styles/`, `concepts/` holds frameworks every style uses; each `<style-name>/` folder holds one style's specific instantiation. See [`docs/content/training-styles/README.md`](docs/content/training-styles/README.md) for the rule.

## Architecture (operational view)

```
                ┌────────────────────┐
                │ Athlete (web)      │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ web/dashboard/     │
                │  Next.js           │
                │  Athlete OS        │
                └─────────┬──────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  Supabase            │
                │   exercise_sets,     │
                │   workouts,          │
                │   daily_metrics, ... │
                └──────────────────────┘
```

Plans + content live as markdown in `docs/`; executed work lives in Supabase; the dashboard reads both. Daily SMS execution is on the roadmap but not currently wired.

Conceptual architecture lives in [`SPEC.md`](SPEC.md). Roadmap in [`PRD.md`](PRD.md) §8. How features get built end-to-end in [`docs/software-factory-workflow.md`](docs/software-factory-workflow.md).

## Setup

```bash
# Python deps (for the arc-bundle generator skill)
python3 -m pip install --user openpyxl python-dotenv

# Secrets
cp .env.example .env  # fill in ANTHROPIC_API_KEY

# Dashboard
cd web/dashboard && npm install && npm run dev
```

## CLI

```bash
npx tsx app/cli/cli.ts plan today
npx tsx app/cli/cli.ts history --last 7d
npx tsx app/cli/cli.ts query e1rm "Back Squat"
```

Supabase tables in `app/supabase/migrations/`. Seed exercise library: `bash app/scripts/seed-exercises.sh`.

## Design principles

- **Informed but unburdened.** The athlete can always see the rationale. They never have to make the decision.
- **Numbers to chase.** PRs to beat on every set. Gap-to-goal metrics. Trend lines. Non-negotiable.
- **Propose, don't dictate.** When the plan changes, the system proposes and explains. The athlete approves.
- **Consistency is the product.** Train's job isn't the perfect program — it's making a good program so easy to follow that the athlete never falls off.
