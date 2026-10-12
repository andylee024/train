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

**Andy Lee.** Active arc: [`docs/athletes/andy/arc-2026-summer-dunk/`](docs/athletes/andy/arc-2026-summer-dunk/), currently in the **W21–W24 Strength block** (Oct 11 → Nov 7, 2026). Arc week = DNT coach week. The arc closes at W24, and a **new arc starts at W1** on Nov 8: Power (W1–4) → Reactive (W5–8) → Test (W9–12, dunk test Jan 30, 2027).

Goals (priority order):
1. Dunk a volleyball on a 10' rim.
2. Power clean 225 + power clean & jerk 225 with the DNT coach.
3. Strength keeps climbing (405 squat within 12 months).

Key facts:
- **Programming = the skills below.** Don't invent structure; build with `build-workout-plan`.
- **No BJJ.** Shoulder + wrist are healed (monitor; landmine / hang variants if pain ≥3/10).
- Heavy legs ≥48 h before a jump day (Tue, Sat). No heavy pulls the day before Saturday.

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

## Skills (`.claude/skills/`)

| Skill | Use |
|---|---|
| `build-workout-plan` | Build or adjust a session, week or block. Loads the four principles below. |
| `principle-dylan-shannon-strength-wave` | Strength progresses on rotating rep-range waves (8s → 6s → 4s → light), with records per range |
| `principle-thp-trait-blocks` | One trait per 4-week block (Strength → Power → Reactive → Test), plus the current cycle's dates |
| `principle-dnt-olympic-lifts` | Coach's Olympic lifts run as written; where her days land; processing each 2-week drop |
| `principle-training-rhythm` | 1a/2a/3a session structure (~6 exercises), weekly split, 48-hour rule, upper-day reactive/mobility fillers |
| `dnt-overview` | Print the day's coach Olympic lifts in Andy's format |

## Don't

- Don't write executed sets into markdown. Don't write plans into Supabase.
- Don't rebuild the coach marketplace, plan synthesis, nutrition tracking, widget engine, or xlsx export. They were removed on 2026-09-07 on purpose (see git history before that date if you need the code).
