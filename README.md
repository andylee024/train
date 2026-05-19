# Train

A training operating system — a single system that manages the full loop of plan → execute → track → adapt, across both training and nutrition, delivered through SMS and (later) a web dashboard.

The system replaces the four roles an athlete currently does themselves — coach, nutritionist, chief of staff, analyst — so their only job is to show up, do the work, and report what happened.

## Live product

| Surface | URL / location |
|---|---|
| Landing page | <https://train-landing-pi.vercel.app> (source: `web/landing/`) |
| Modal app (SMS + admin) | `https://andylee024--train-web.modal.run` (source: `app/`) |
| Inbound SMS webhook | `https://andylee024--train-web.modal.run/messages/webhook` |
| Admin CLI | `bin/train` |

The Modal app is a single FastAPI ASGI function that receives Linq SMS webhooks, runs the Claude Agent SDK loop in-process, persists per-user state on a Modal Volume, and exposes `/admin/approve` for the Wizard-of-Oz approval step. See [`app/modal_app.py`](app/modal_app.py) for the deploy unit and [`app/api.py`](app/api.py) for the routes.

## Quick start (dogfood loop)

End-to-end for a new athlete:

```bash
# 1. Athlete texts the Linq number → agent runs intake, writes intake.md.
#    (Driven by their phone — nothing for you to run.)

# 2. See who's in the queue
bin/train list

# 3. Pull their intake to local for review
bin/train pull +18005551234

# 4. Build / edit their arc bundle locally (uses existing skills)
#    For Andy's own dogfood: copy his current bundle as the template.
bin/train init +18005551234        # scaffold from template, opens $EDITOR

# 5. Upload the bundle to the volume
bin/train push-bundle +18005551234 athletes/_pending/18005551234/bundle

# 6. (Optional, until M7 ships) generate the athlete's xlsx for hand-delivery
bin/train build-sheet +18005551234

# 7. Activate — agent reads bundle, sends welcome SMS + tomorrow's session
bin/train approve +18005551234
```

The activation SMS looks like:

> *"Your plan is live. Arc: Summer 2026 Dunk, 18 weeks. Tomorrow: DNT Day 5 + Sprint Finisher. Morning push lands at 7am."*

## Repo structure

The repo has six concepts, each with a single primary reader.

```
train/
├── app/                  ← runtime: Modal app, FastAPI, Claude SDK loop
├── bin/                  ← admin CLI (bin/train)
├── web/landing/          ← landing page (Vercel)
├── docs/
│   ├── product/          ← what we're building (architecture, roadmap, schemas)
│   ├── training-styles/  ← what coaches know (styles, exercises, frameworks)
│   └── team/             ← AI coaching team (roles, decision logic)
├── athletes/             ← per-athlete data (profile, arc bundles, logs)
└── prototypes/           ← UI / sheet experiments
```

| Directory | Primary reader | What's in it |
|---|---|---|
| [`app/`](app/) | Builder | One Modal app: webhook → agent → SMS. 7 flat files. |
| [`bin/`](bin/) | Andy (operator) | `train` CLI: list / pull / init / push-bundle / approve / build-sheet |
| [`web/landing/`](web/landing/) | Marketer | Static landing page on Vercel; one tap-to-text CTA |
| [`docs/product/`](docs/product/) | Builders / future contributors | architecture, roadmap, plan schema, db schema |
| [`docs/training-styles/`](docs/training-styles/) | Planning agents | shared concepts + per-style guides (vertical-jump, catalyst-athletics, etc.) |
| [`docs/team/`](docs/team/) | Anyone wiring up agents | role definitions for head-coach, specialists, operator |
| [`athletes/`](athletes/) | Athlete + their team | per-athlete profile + self-contained arc bundles |
| [`prototypes/`](prototypes/) | Designer / PM | Sheet generator + marketplace mockups |

## Two key boundaries

1. **Reference vs instance.** `docs/training-styles/` is the methodology library — timeless, multi-athlete. `athletes/<name>/` is the live instance for a specific person. Keep them separate or the library rots.
2. **Concepts vs styles.** Inside `docs/training-styles/`, `concepts/` holds frameworks every style uses; each `<style-name>/` folder holds one style's specific instantiation. See [`docs/training-styles/README.md`](docs/training-styles/README.md) for the rule.

## Architecture (operational view)

```
                                ┌────────────────────┐
                                │ Linq SMS gateway   │
                                └─────────┬──────────┘
                                          │ webhook
                                          ▼
                            ┌──────────────────────────────┐
                            │  Modal app: train            │
                            │  ┌─────────────────────────┐ │
                            │  │ FastAPI (app/api.py)    │ │
                            │  │  /health                │ │
                            │  │  /messages/webhook      │ │
                            │  │  /admin/approve         │ │
                            │  └──────────┬──────────────┘ │
                            │             │                │
                            │             ▼                │
                            │  ┌─────────────────────────┐ │
                            │  │ run_turn (app/agent.py) │ │
                            │  │  Claude Agent SDK loop  │ │
                            │  │  Session resume         │ │
                            │  │  CLAUDE.md memory       │ │
                            │  └──────────┬──────────────┘ │
                            └─────────────┼────────────────┘
                                          │
                                          ▼ /workspace/user
                            ┌──────────────────────────────┐
                            │  Modal Volume:               │
                            │   train-user-state           │
                            │   pending/{phone}/           │
                            │     CLAUDE.md, .session_id,  │
                            │     intake.md                │
                            │   active/{phone}/            │
                            │     bundle/ + above          │
                            └──────────────────────────────┘
                                          ▲
                                          │ pull/push
                            ┌─────────────────────────────┐
                            │ bin/train (admin CLI)       │
                            └─────────────────────────────┘
```

Conceptual architecture (Roles × Layers, the Plan, the Athlete, Logging, Feedback Loop) lives in [`docs/product/architecture.md`](docs/product/architecture.md). Roadmap in [`docs/product/roadmap.md`](docs/product/roadmap.md).

## Setup

```bash
# Python deps (Modal handles them in the cloud; this is for local dev / CLI)
python3 -m pip install --user fastapi httpx python-dotenv claude-agent-sdk openpyxl

# Modal auth (one-time)
modal token new
modal profile activate andylee024   # your personal workspace

# Secrets (one-time)
cp .env.example .env
# fill in LINQ_*, ANTHROPIC_API_KEY, TRAIN_ADMIN_SECRET, TRAIN_ANDY_PHONE
modal secret create train-agent-secrets ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
modal secret create train-text-secrets \
  LINQ_API_BASE_URL="$LINQ_API_BASE_URL" \
  LINQ_API_KEY="$LINQ_API_KEY" \
  LINQ_FROM_NUMBER="$LINQ_FROM_NUMBER" \
  TRAIN_ADMIN_SECRET="$TRAIN_ADMIN_SECRET" \
  TRAIN_ANDY_PHONE="$TRAIN_ANDY_PHONE"

# Deploy
modal deploy app/modal_app.py
```

## CLI

### `bin/train` — admin operations (SMS product)

```bash
bin/train list                                  # pending + active athletes
bin/train pull <phone>                          # download user dir + print intake.md
bin/train init <phone>                          # scaffold a bundle from template
bin/train push-bundle <phone> <local-dir>       # upload bundle to volume
bin/train build-sheet <phone>                   # generate athlete xlsx locally
bin/train approve <phone>                       # /admin/approve + welcome SMS
bin/train notes <phone>                         # $EDITOR on the pulled intake.md
```

Requires `TRAIN_ADMIN_SECRET` in `.env` (or env) for `approve`.

### `npx tsx app/cli/cli.ts` — legacy Supabase queries

```bash
npx tsx app/cli/cli.ts plan today
npx tsx app/cli/cli.ts history --last 7d
npx tsx app/cli/cli.ts query e1rm "Back Squat"
```

Supabase tables in `app/supabase/migrations/`. Seed exercise library: `bash app/scripts/seed-exercises.sh`.

## Smokes

```bash
modal run app/modal_app.py::intake_smoke   # multi-turn intake → intake.md asserts
```

## Design principles

- **Informed but unburdened.** The athlete can always see the rationale. They never have to make the decision.
- **Numbers to chase.** PRs to beat on every set. Gap-to-goal metrics. Trend lines. Non-negotiable.
- **Propose, don't dictate.** When the plan changes, the system proposes and explains. The athlete approves.
- **Push over pull.** The morning text IS the product. The webapp is for the weekly ritual and on-demand context.
- **Consistency is the product.** Train's job isn't the perfect program — it's making a good program so easy to follow that the athlete never falls off.
