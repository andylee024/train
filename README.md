# Train

Train gives every athlete a world-class training team — powered by AI, coordinated by a head coach, designed for any person at any life stage.

The system replaces the four roles an athlete currently does themselves — coach, nutritionist, chief of staff, analyst — so their only job is to show up, do the work, and report what happened.

## Documentation

- [`docs/system-architecture.md`](docs/system-architecture.md) — the canonical architecture (6 core concepts: Layers, Roles, The Plan, The Athlete, Logging, Feedback Loop)
- [`docs/product-roadmap.md`](docs/product-roadmap.md) — milestones M0–M6, from foundation to operator services
- [`docs/schema.md`](docs/schema.md) — database schema reference (for when we move to Supabase)
- Implementation tracked in [Linear → train project](https://linear.app/a24-personal/project/train-5bf68de4e2d4)

## Core Architecture

```
Layers (when) × Roles (who) → The Plan (what) → The Athlete (for whom) → Logging (how they report) → Feedback Loop (how it stays alive)
```

**Roles** are AI agents, each with domain expertise and an objective function:
- **Head Coach** (orchestrator) — synthesizes specialist programming into one coherent plan
- **Specialists** (strength, sport, Olympic lifting, mobility, nutrition) — each produces their own programming, negotiates with the head coach
- **Chief of Staff** (operator) — handles logistics so the athlete never thinks about them

**Layers** set the planning cadence: Arc (3-12mo) → Block (3-6wk) → Week (7 days) → Day (right now). Planning cascades down. Data flows up. Exceptions propagate by severity.

## Repo Structure

```
docs/                    — architecture, roadmap, schema
plans/
  blocks/*.md            — 12 periodization blocks (Mar 2026 – Feb 2027)
  weekly-plans/*.md      — weekly workout prescriptions
  active/                — current week + block pointers
  templates/*.md         — plan generation templates
src/                     — CLI source (TypeScript)
supabase/                — applied migration (core schema)
```

## Design Principles

- **Informed but unburdened.** The athlete can always see the rationale. They never have to make the decision.
- **Numbers to chase.** PRs to beat on every set. Gap-to-goal metrics. Trend lines. Non-negotiable.
- **Propose, don't dictate.** When the plan changes, the system proposes and explains. The athlete approves.
- **Push over pull.** The morning text IS the product. The webapp is for the weekly ritual and on-demand context.
- **Consistency is the product.** Train's job isn't the perfect program — it's making a good program so easy to follow that the athlete never falls off.
