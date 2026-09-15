# CLAUDE.md

Read [`README.md`](README.md) first. This file adds what an agent needs to operate here.

## What this repo is

A single-athlete workout tracker. Plan lives in markdown, executed work lives in Supabase, the dashboard visualizes progress. Nothing else. Keep it that way — no generators, no spreadsheets, no product-process scaffolding.

## Storage boundary

| Layer | Source of truth |
|---|---|
| Planned work | Markdown under `docs/athletes/andy/<arc>/training/` |
| Executed work | Supabase `workouts` / `workout_exercises` / `exercise_sets` (project `vtruwlvekfnmfgaundhp`) |
| Progress view | `web/dashboard/` — derived from Supabase, never a source |

## Active athlete + arc

**Andy Lee.** Active arc: [`docs/athletes/andy/arc-2026-summer-dunk/`](docs/athletes/andy/arc-2026-summer-dunk/) (May 3 → Sep 5, 2026). The bundle's `README.md` and `CLAUDE.md` carry the programming context, constraints, and week structure.

Key facts (from the bundle `profile.md`):
- Strength-dominant, reactivity-deficient. Don't default to strength-first blocks.
- Injuries: right shoulder (no barbell OHP — landmine/DB neutral only), left wrist De Quervain's (no front rack — hang variants + hook grip).
- Heavy squat must precede jump day by ≥48h.

## Dashboard (`web/dashboard/`)

Next.js 16 (read `web/dashboard/AGENTS.md` before touching it — the API differs from older Next). Two routes:
- `/strength` — Upper / Lower / Power lenses. KPI row, key-lift e1RM cards, all-lifts change table, recent PRs.
- `/progress/[slug]` and `/progress/[slug]/[date]` — per-lift history and one-session detail.

Where things live:
- `lib/queries.ts` — every Supabase read. Add new queries here.
- `lib/view.ts` — the three views and their key-lift lists. Edit `KEY_LIFTS` to change which lifts get cards.
- `lib/categorize.ts` — name → Strength/Power/Mobility and Upper/Lower rules.
- `components/performance-views.tsx` — the `/strength` layout. Fixed layout, no widget config; edit the JSX.
- `components/panel.tsx` — the one card primitive. `components/viz/` — chart primitives.

## CLI (`app/cli/`)

`cli.ts` (commander) → `train-api.ts` (Supabase REST via fetch). Loads repo-root `.env`. Commands: `log import`, `history`, `stats`, `query e1rm`, `query best-set`.

## Skills

- `dnt-overview` — print the day's coach Olympic lifts in the athlete's format.
- `integrate-dnt-workout` — fold a new DNT coach PDF into the active weeks. Fires every ~2 weeks.

## Don't

- Don't write executed sets into markdown. Don't write plans into Supabase.
- Don't add overhead barbell pressing or front-rack work for Andy without re-checking the injury notes.
- Don't rebuild the coach marketplace, plan synthesis, nutrition tracking, widget engine, or xlsx export. They were removed on 2026-09-07 on purpose (see git history before that date if you need the code).
