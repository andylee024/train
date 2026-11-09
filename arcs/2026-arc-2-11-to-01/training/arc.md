# Arc — Winter Jump (Nov 8, 2026 – Jan 30, 2027) · arc week = DNT week

**Why this arc exists.** W1–W24 (May–Nov 2026) built strength and Olympic lifting (squat 312 → 374 e1RM, bench 227 → 258, power clean 192 → 225) and did not train the jump (15 jump/sprint entries in 24 weeks, no approach jumps, touch never measured). Adherence was 3.6–3.9 sessions/week in every block regardless of plan, and the Saturday jump day was the first casualty every time. This arc puts the jump on the most reliable day and makes it the main lift.

## Goals (priority = triage order)
| # | Goal | Target | Test |
|---|---|---|---|
| G1 | **Dunk a volleyball** | ladder rung 4 clean (≈10'6"); plan aims at rung 5–6 so rung 4 lands with margin; filmed dunk | Jan 30 · ball ladder weekly |
| G2 | **Olympic lifts** with the DNT coach | power clean 240 · power C&J 235 · power snatch 135 | Jan 14 |
| G3 | **Flexibility as a skill** | right-hip IR = left, pain-free · 40 kg OHS clean → 60 kg | W4 / W8 / W12 |
| G4 | **Strength held** | squat 375–385 single Jan 17 · bench 275 · pull-up +115 · **405 → 2027** | Jan 17 |

## Assessment (what 24 weeks showed, May 24 – Nov 7, 2026)

| Area | Status | Evidence |
|---|---|---|
| Strength | ✅ Strong, held | Squat e1RM 312 → 374 (295×8; back to Feb's 380) · front squat 321 · bench 227 → 258 (215×6, all-time high) |
| Olympic lifts | ✅ Improving | Power clean 192 → **225** single (Nov 4) · power C&J 205 · muscle snatch 123 · power snatch 104 |
| Consistency | ✅ Reliable, fixed-size | 3.6–3.9 sessions/week in every block, whatever was planned; Sun/Mon/Tue/Thu are the days that happen |
| Jump training | ❌ Untrained | 15 jump/sprint entries in 24 weeks; none Jul 6 – Sep 13; approach jumps and dunk attempts: 0 |
| Jump measurement | ❌ None | Touch never measured; ~10'3" is an estimate from a tennis-ball dunk |
| Right hip | ⚠️ Impingement pattern | Pinch in deep flexion + IR since late Oct; capped the 4s squat week (275×4 vs 330 planned) |
| Left shoulder / overhead | ⚠️ Limiting | OHS 115 vs clean 225; shoulder flares; location not yet pinned down |
| Body composition | ⚠️ Unknown | 189 lb last logged Jul 30 |

**Where you need to go (Jan 30):** ball ladder rung 1 (tennis ball, ≈10'2") → **rung 4 volleyball clean (≈10'6")**, plan aims at rung 5–6 · hand depth fingertips/palm → wrist · power clean 225 → 240 · power C&J 205 → 235 · power snatch 104 → 135 · right-hip seated IR = left, pain-free · OHS 40 kg clean → 60 kg · squat held 375–385 · bench 258 → 275 · weighted pull-up +55×6 → +115 · bodyweight 189 → 184.

## The approach (why the plan looks like this)
- **Strength isn't the limiter.** 2× BW squat and a 225 clean at 189 lb is enough force for 10'6". Power clean ÷ squat = 0.60 (< 0.75): force is made slowly. The missing pieces — approach technique (worth 4–6" per THP), reactive stiffness, fresh max-intent jumping, a few pounds — were never trained.
- **A 4-day core you actually keep.** You average 3.6–3.9 sessions/week regardless of plan and the Saturday jump day was the first casualty every block. So the max-jump session is **Tuesday**, 48 h after Sunday legs; Sun/Mon/Tue/Thu carry everything that must happen; Fri/Sat are bonuses allowed to fail.
- **Olympic lifts stay, as power work, and open every session** as the coach writes them: heavy clean day Sun, clean + pull Thu, snatch/light Tue, overhead Fri. Her back squat is skipped; the squat wave runs once a week, two sets to a box.
- **Flexibility is a skill, not recovery.** Two targets (hip IR Mon, overhead Fri), two 20-minute sessions a week, six-plus weeks to see it, re-tested W4/W8. Nothing deep within 48 h of a jump day.
- **The jump is measured like a lift** — ball ladder weekly, into `measurements`. Everything unmeasured in the last arc died within three weeks.

## Principles (the rules live in `.claude/skills/`)
1. **Strength runs on waves** (`principle-dylan-shannon-strength-wave`): 8s → 6s → 4s → light, a record per range; squat at 2 sets to a box this arc; bench/pull-ups make a record attempt every session (+10 at RPE ≤ 8, +5 at 8.5–9).
2. **One trait per block** (`principle-thp-trait-blocks`): Power + Approach → Reactive → Test; beginner plyo volume, one variable at a time; sprints on Tue and Thu inside the budget.
3. **The coach owns the Olympic lifts** (`principle-dnt-olympic-lifts`): her lifts as written, her days placed by type, never stacked on top of the week.
4. **Training rhythm** (`principle-training-rhythm`): 4 core + 2 bonus; Olympic lift → jumps and sprints → loaded work → accessories; 60-min core + optional 30.
5. **Flexibility as a skill** (Matt Smith): max two skills, 1–2 sessions each, loaded and isometric, never into the pinch.
6. **Measure the goal:** ladder weekly, bodyweight Sunday, tests W1/W4/W8 — all in Supabase. If the number isn't in the log, the session didn't count.

## Blocks
| Block | Weeks | Dates | File |
|---|---|---|---|
| P · Power + Approach | W1–W4 | Nov 8 – Dec 5 | `blocks/2026-11-block-P-power-approach.md` |
| R · Reactive | W5–W8 | Dec 6 – Jan 2 | `blocks/2026-12-block-R-reactive.md` |
| T · Test | W9–W12 | Jan 3 – Jan 30 | to be written at W8 (taper → Jan 14 Oly max · Jan 17 squat single · Jan 30 dunk test) |

Each block file = §1 the fixed week (seven session tables) + §2 a per-week deltas table (rep range, loads, jump counts, coach lifts, notes). No separate week files.

## The week (4 core + 2 bonus)
Sun L1 Olympic + Strength (core) · Mon U1 Upper + Hip skill (core) · **Tue J1 Max Jump + Reactive (core, the priority)** · Wed rest + hip routine · Thu P1 Power + Approach (core) · Fri U2 Overhead + Shoulder skill (bonus) · Sat J2 Dunk (bonus). Priority if the week shrinks: Tue → Sun → Mon → Thu. Details: `principle-training-rhythm`.

## Diagnosis
Strength-dominant, explosive- and reactive-deficient (power clean ÷ squat = 0.60 < 0.75), position-limited (right-hip impingement pattern; overhead position, OHS 115 vs clean 225). Plyo training age: beginner → 40–60 contacts/session to start.

## Measurement (the arc lives or dies here)
**Ball ladder**, once a week at a rim, fresh, before the session: 0 rim grab · 1 tennis ball (≈10'2") · 2 softball (10'3") · 3 mini basketball (10'5") · **4 volleyball (10'6")** · 5 women's ball (10'7") · 6 men's ball (10'8"). Six attempts at the current rung, 2' rest; score clean / touched / missed, how many of six, hand depth on the best jump (fingertips / palm / wrist / forearm); two clean of six → next rung. Logged to Supabase `measurements` (`ladder_rung`, `ladder_clean_of_6`, `hand_depth`). W1 baseline: climb from tennis ball until failure · standing reach once · seated hip IR L/R (deg) · Taylor's pose (cm) · supine overhead · heel-elevated squat · 40 kg OHS · optional standing vertical + 18" depth jump. Every Sun: bodyweight → `daily_metrics`. W4, W8, W12: full retest. Reviews: `reviews/W04-review.md`, `W08-review.md`.

## Constraints
- Session order: coach's Olympic lift first, as written → jumps and sprints (Tue 4×10–30 m, Thu 6×20 m, Sat 3×10 m) → loaded work → accessories.
- Heavy legs ≥48 h before Tue. Thu light on the legs. Nothing deep or loaded for flexibility within 48 h of Tue/Sat, never the day after heavy work.
- Right hip: squat to a box above the pinch; pain ≥ 3/10 → movement out. Left shoulder: no barbell overhead above 3/10. Knee ≥ 3/10 → no depth jumps.
- Coach's lifts as written; placement per `principle-dnt-olympic-lifts`; her back squat skipped; never stacked on top of the week.
- Bodyweight 189 → 184 by W8, slow; no aggressive deficit while jumping.
- ≤ 6 working exercises a session; 60-min core + optional 30-min block 4.


## Agent rules (read on every session start)
- **Hot path:** week = `(today − Nov 8) ÷ 7 + 1`; open the block file for that week (`blocks/`), read §1 for the day's table and §2 for the week's row. Core days Sun/Mon/Tue/Thu; Fri/Sat are bonuses. Missed day → resume at the current week; never double up.
- **Tuesday is the priority session.** Coach's light lift first (if any), ball ladder on the rim day, approach drills, max approach jumps, sprints, depth jumps.
- **Coach lifts** (`coach-programs/`): heavy clean day → Sun 1a · clean + pull → Thu 1a/1b · snatch / light → Tue 1a · jerk / overhead → Fri 1a · back squat skipped · heavy front squat = that week's squat, to a box. New PDF → copy here, add a README row, fill the §2 coach rows.
- **Injury rules:** right hip — box above the pinch, no deep Cossacks / loaded 90/90 back-leg, ≥ 3/10 → out for the week. Left shoulder — no barbell overhead above 3/10, landmine / DB neutral. Knee ≥ 3/10 → no depth jumps. Propose swaps, don't dictate.
- **Flex skills:** hip IR (Mon, 20') · overhead (Fri, 20'). Nothing deep within 48 h of Tue/Sat.
- **Logging:** sets → Supabase `exercise_sets`; bodyweight → `daily_metrics` (Sun); ladder / hand depth / flexibility tests → `measurements`. Never executed sets in markdown.
- **Athlete facts:** `../../profile.md` (living). Warm-ups are the first line of each session table in the block file. This file is the strategy; the block files are the prescription; the skills are the rules.
- **Escalate:** two core sessions missed in a row · ladder flat 3 weeks · squat top set −5% two weeks · pain ≥ 3/10 for 5+ days.

## History
Previous arc: `../2026-arc-1-05-to-11/` (W1–W24, reviews in `reviews/`). The W1–W24 review that produced this arc is summarised in §Assessment above; the Claude Doc that held v1–v2 of this plan was retired on Nov 9, 2026 in favour of this file.
