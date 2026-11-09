# Arc — Winter Jump (Nov 8, 2026 – Jan 30, 2027) · arc week = DNT week

**Why this arc exists.** W1–W24 (May–Nov 2026) built strength and Olympic lifting (squat 312 → 374 e1RM, bench 227 → 258, power clean 192 → 225) and did not train the jump (15 jump/sprint entries in 24 weeks, no approach jumps, touch never measured). Adherence was 3.6–3.9 sessions/week in every block regardless of plan, and the Saturday jump day was the first casualty every time. This arc puts the jump on the most reliable day and makes it the main lift.

## Goals (priority = triage order)
| # | Goal | Target | Test |
|---|---|---|---|
| G1 | **Dunk a volleyball** | ladder rung 4 clean (≈10'6"); plan aims at rung 5–6 so rung 4 lands with margin; filmed dunk | Jan 30 · ball ladder weekly |
| G2 | **Olympic lifts** with the DNT coach | power clean 240 · power C&J 235 · power snatch 135 | Jan 14 |
| G3 | **Flexibility as a skill** | right-hip IR = left, pain-free · 40 kg OHS clean → 60 kg | W4 / W8 / W12 |
| G4 | **Strength held** | squat 375–385 single Jan 17 · bench 275 · pull-up +115 · **405 → 2027** | Jan 17 |

## Blocks
| Block | Weeks | Dates | File |
|---|---|---|---|
| P · Power + Approach | W1–W4 | Nov 8 – Dec 5 | `blocks/2026-11-block-P-power-approach.md` |
| R · Reactive | W5–W8 | Dec 6 – Jan 2 | `blocks/2026-12-block-R-reactive.md` |
| T · Test | W9–W12 | Jan 3 – Jan 30 | to be written at W8 (taper → Jan 14 Oly max · Jan 17 squat single · Jan 30 dunk test) |

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

## History
Previous arc: `../arc-2026-summer-dunk/` (W1–W24, reviews in `reviews/`). The W1–W24 review that produced this arc was delivered in chat on Nov 8, 2026.
