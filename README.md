# Train

A training operating system — a single system that manages the full loop of plan → execute → track → adapt, across both training and nutrition, delivered through chat (WhatsApp/Telegram via NanoClaw) and a web dashboard.

The system replaces the four roles an athlete currently does themselves — coach, nutritionist, chief of staff, analyst — so their only job is to show up, do the work, and report what happened.

## Repo structure

The repo has six concepts, each with a single primary reader. The read-mostly docs live under `docs/`. `athletes/`, `app/`, and `prototypes/` sit at the top level so per-athlete runtime data and runnable code stay independent of documentation.

```
train/
├── docs/
│   ├── product/         ← what we're building (architecture, roadmap, schemas)
│   ├── training-styles/ ← what coaches know (training styles, exercises, frameworks)
│   └── team/            ← the AI coaching team (roles, skills, decision logic)
├── athletes/            ← per-athlete data (profile, arc bundles, logs, outputs)
├── prototypes/          ← UI / marketing experiments (marketplace, web)
└── app/                 ← runtime code (CLI, Supabase, scripts)
```

| Directory | Primary reader | What's in it |
|---|---|---|
| [`docs/product/`](docs/product/) | Builders / future contributors | [architecture](docs/product/architecture.md), [roadmap](docs/product/roadmap.md), [plan schema](docs/product/plan-schema.md), [database schema](docs/product/database-schema.md), milestones, diagrams |
| [`docs/training-styles/`](docs/training-styles/) | Planning agents and coaches | [exercises](docs/training-styles/exercises.md), cross-style [concepts](docs/training-styles/concepts/), per-style guides (vertical-jump, dylan-shannon; `_template/` to copy) |
| [`docs/team/`](docs/team/) | Anyone wiring up agents | role definitions for head-coach, specialists, operator |
| [`athletes/`](athletes/) | Athlete + their team | per-athlete profile and self-contained arc bundles (plan + agent instructions, ready to be pulled by a runtime agent) |
| [`prototypes/`](prototypes/) | Designer / PM | [marketplace](prototypes/marketplace/) (TOFU funnel), [web](prototypes/web/) (athlete-facing JSX) |
| [`app/`](app/) | Engineer | [cli](app/cli/), [supabase](app/supabase/), [scripts](app/scripts/) |

## Two key boundaries

1. **Reference vs instance.** `docs/training-styles/` is the methodology library — timeless, multi-athlete. `athletes/<name>/` is the live instance for a specific person. Keep them separate or the library rots.
2. **Concepts vs styles.** Inside `docs/training-styles/`, `concepts/` holds frameworks every style uses (periodization models, session design, assessment). Each `<style-name>/` folder holds one style's specific instantiation of those frameworks. See [`docs/training-styles/README.md`](docs/training-styles/README.md) for the test that decides where new content goes.

## Core architecture

```
Layers (when) × Roles (who) → The Plan (what) → The Athlete (for whom) → Logging (how they report) → Feedback Loop (how it stays alive)
```

**Roles** are AI agents, each with domain expertise and an objective function:
- **Head Coach** (orchestrator) — synthesizes specialist programming into one coherent plan
- **Specialists** (strength, sport, Olympic lifting, mobility, nutrition) — each produces their own programming, negotiates with the head coach
- **Chief of Staff** (operator) — handles logistics so the athlete never thinks about them

**Layers** set the planning cadence: Arc (3–12mo) → Block (3–6wk) → Week (7 days) → Day (right now). Planning cascades down. Data flows up. Exceptions propagate by severity.

Full architecture in [`docs/product/architecture.md`](docs/product/architecture.md). Roadmap in [`docs/product/roadmap.md`](docs/product/roadmap.md). Implementation tracked in [Linear → train project](https://linear.app/a24-personal/project/train-5bf68de4e2d4).

## CLI

```bash
npm install
npx tsx app/cli/cli.ts plan today
npx tsx app/cli/cli.ts history --last 7d
npx tsx app/cli/cli.ts query e1rm "Back Squat"
```

Supabase tables in `app/supabase/migrations/`. Seed exercise library: `bash app/scripts/seed-exercises.sh`.

## Design principles

- **Informed but unburdened.** The athlete can always see the rationale. They never have to make the decision.
- **Numbers to chase.** PRs to beat on every set. Gap-to-goal metrics. Trend lines. Non-negotiable.
- **Propose, don't dictate.** When the plan changes, the system proposes and explains. The athlete approves.
- **Push over pull.** The morning text IS the product. The webapp is for the weekly ritual and on-demand context.
- **Consistency is the product.** Train's job isn't the perfect program — it's making a good program so easy to follow that the athlete never falls off.
