# CLAUDE.md

Read [`README.md`](README.md) first. This file adds what an agent needs to operate here.

## What this repo is

A single-athlete workout tracker. Plan lives in markdown; executed work lives in Supabase, logged and queried through the Supabase MCP connector. Nothing else. Keep it that way — no generators, no spreadsheets, no product-process scaffolding.

## Storage boundary

| Layer | Source of truth |
|---|---|
| Planned work | `<arc>/training/arc.md` (strategy) + `<arc>/training/blocks/` — one file per block: §1 the fixed week, §2 a per-week deltas table. Week = `(today − arc start) ÷ 7 + 1`. |
| Executed work | Supabase `workouts` / `workout_exercises` / `exercise_sets` (project `vtruwlvekfnmfgaundhp`) |
| Measurements (ladder, hand depth, flexibility tests, touch) | Supabase `measurements` (`date, metric, value, value_text, unit, side, notes`) |
| Athlete facts | `profile.md` at the repo root (living) |
| Reference guides | `library/` — cited by the skills, never prescriptive on their own |
| Dashboard | `dashboard/` (Next.js, Vercel) — reads Supabase; owned by the Grok agent |
| Telegram logging | grokbot, spec in `HANDOFF.md` |

## Active athlete + arc

**Andy Lee.** Active arc: [`arcs/2026-arc-2-11-to-01/`](arcs/2026-arc-2-11-to-01/) — **Winter Jump**, W1 = Nov 8, 2026 (arc week = DNT coach week). Blocks: P · Power + Approach (W1–4) → R · Reactive (W5–8) → T · Test (W9–12: Oly max Jan 14, squat single Jan 17, **dunk test Jan 30, 2027**). Previous arc (`arcs/2026-arc-1-05-to-11/`, W1–W24) is closed and kept as history.

Goals (priority order):
1. Dunk a volleyball on a 10' rim (plan aims at +6" touch so +4" lands with margin).
2. Olympic lifts with the DNT coach: power clean 240 · power C&J 235 · power snatch 135.
3. Flexibility as a skill: right-hip IR, overhead position.
4. Strength held: squat 375–385 single in Jan, bench 275, pull-up +115. 405 → 2027.

Key facts:
- **Programming = the skills below.** Don't invent structure; build with `build-workout-plan`.
- **Week = 4 core days (Sun L1 · Mon U1 · Tue J1 max jump · Thu P1) + 2 bonus (Fri U2 · Sat J2).** Tuesday is the priority session; heavy legs ≥48 h before it.
- **Today's workout:** week number → `arcs/2026-arc-2-11-to-01/training/blocks/` → §1 day table + §2 week row. Agent rules for the arc are in its `training/arc.md`.
- **No BJJ.** Right hip: impingement pattern — box depth, ≥3/10 → movement out. Left shoulder: no barbell overhead above 3/10. Knee ≥3/10 → no depth jumps.
- Measurement is part of the plan: best touch every Tue (`touch 10'4"` in the set note), bodyweight every Sun, retests W4 / W8.

## Logging + queries (Supabase MCP)

No code in this repo. Use the Supabase MCP tools against project `vtruwlvekfnmfgaundhp`:
- Tables: `workouts` → `workout_exercises` → `exercise_sets` (plus `exercises`, `daily_metrics` for bodyweight, `measurements` for everything that isn't a set).
- Ladder metrics: `ladder_rung` (value 0–6, value_text = ball), `ladder_clean_of_6`, `hand_depth` (value_text fingertips/palm/wrist/forearm), `touch_in`, `standing_vert_in`, `depth_jump_in`, `seated_hip_ir_deg` (side L/R), `taylors_pose_cm`, `ohs_kg`, `standing_reach_in`.
- Weights are stored with a unit; normalize with `weight_kg` (× 2.20462 for lb). e1RM = Epley `load × (1 + reps/30)`.
- Exercise names must match `exercises.name` or PR lookups miss.

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
- Don't change the plan in one place: a rule change touches the skill and `arc.md`; a prescription change touches the block file. The Claude Doc is retired.
- Don't put measurements in set notes; use `measurements`.
- Don't rebuild the coach marketplace, plan synthesis, nutrition tracking, widget engine, or xlsx export (removed 2026-09-07), Supabase migrations and the `train` CLI (removed 2026-10-12). The dashboard lives in `dashboard/` (added by the Grok agent, #30) — leave it to that agent.
