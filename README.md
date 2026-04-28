# Train

A training operating system — a single system that manages the full loop of plan → execute → track → adapt, across both training and nutrition, delivered through chat (WhatsApp/Telegram via NanoClaw) and a web dashboard.

The system replaces the four roles an athlete currently does themselves — coach, nutritionist, chief of staff, analyst — so their only job is to show up, do the work, and report what happened.

## Repo structure

The repo has six top-level concepts. Each one has a single primary reader.

```
train/
├── product/        ← what we're building (architecture, roadmap, schemas)
├── knowledge/      ← what coaches know (training styles, exercises, frameworks)
├── team/           ← the AI coaching team (roles, skills, decision logic)
├── athletes/       ← per-athlete data (profile, plan, logs, generated outputs)
├── prototypes/     ← UI / marketing experiments (marketplace, web)
└── app/            ← runtime code (CLI, Supabase, scripts)
```

| Directory | Primary reader | What's in it |
|---|---|---|
| [`product/`](product/) | Builders / future contributors | [architecture](product/architecture.md), [roadmap](product/roadmap.md), [plan schema](product/plan-schema.md), [database schema](product/database-schema.md), milestones, diagrams |
| [`knowledge/`](knowledge/) | Planning agents and coaches | [exercises](knowledge/exercises.md), cross-style [concepts](knowledge/concepts/), per-style [styles](knowledge/styles/) (vertical-jump first; `_template/` to copy) |
| [`team/`](team/) | Anyone wiring up agents | role definitions, [skills](team/skills/) (generate-plan) |
| [`athletes/`](athletes/) | Athlete + their team | per-athlete profile, arc/block/week plans, reviews, logs, generated outputs |
| [`prototypes/`](prototypes/) | Designer / PM | [marketplace](prototypes/marketplace/) (TOFU funnel), [web](prototypes/web/) (athlete-facing JSX) |
| [`app/`](app/) | Engineer | [cli](app/cli/), [supabase](app/supabase/), [scripts](app/scripts/) |

## Two key boundaries

1. **Reference vs instance.** `knowledge/` is the methodology library — timeless, multi-athlete. `athletes/<name>/` is the live instance for a specific person. Keep them separate or the library rots.
2. **Concepts vs styles.** Inside `knowledge/`, `concepts/` holds frameworks every style uses (periodization models, session design, assessment). `styles/<name>/` holds one style's specific instantiation of those frameworks. See [`knowledge/README.md`](knowledge/README.md) for the test that decides where new content goes.

## Core architecture

```
Layers (when) × Roles (who) → The Plan (what) → The Athlete (for whom) → Logging (how they report) → Feedback Loop (how it stays alive)
```

**Roles** are AI agents, each with domain expertise and an objective function:
- **Head Coach** (orchestrator) — synthesizes specialist programming into one coherent plan
- **Specialists** (strength, sport, Olympic lifting, mobility, nutrition) — each produces their own programming, negotiates with the head coach
- **Chief of Staff** (operator) — handles logistics so the athlete never thinks about them

**Layers** set the planning cadence: Arc (3–12mo) → Block (3–6wk) → Week (7 days) → Day (right now). Planning cascades down. Data flows up. Exceptions propagate by severity.

Full architecture in [`product/architecture.md`](product/architecture.md). Roadmap in [`product/roadmap.md`](product/roadmap.md). Implementation tracked in [Linear → train project](https://linear.app/a24-personal/project/train-5bf68de4e2d4).

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
