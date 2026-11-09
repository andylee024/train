---
name: build-workout-plan
description: Build or adjust Andy's training (a session, a week, or a block) for his volleyball-dunk, Olympic-lifting, flexibility and held-strength goals. Loads his principle skills and applies them. Use for "build my week", "what's today's workout", "plan the next block", or when a new DNT program arrives.
---

# Build Workout Plan

The builder. It holds no training rules itself: it loads Andy's principles and applies them.

## Goals (priority order = what gives way first)
1. **Dunk a volleyball** on a 10' rim, Jan 30, 2027. Plan aims at +6" approach touch (~10'3" → ~10'9") so +4" lands with margin.
2. **Olympic lifts** with the DNT coach: power clean 240 · power C&J 235 · power snatch 135 (her max day Jan 14).
3. **Flexibility as a skill:** right-hip IR = left, pain-free · 40 kg OHS clean → 60 kg.
4. **Strength held:** squat 375–385 single Jan 17 · bench 275 · pull-up +115. 405 is a 2027 goal.

**Athlete:** 6'0", ~189 lb → 184. No BJJ; pickup basketball Sat after jumps. Right hip impingement pattern (box depth, no deep Cossack / loaded 90/90 back-leg, ≥3/10 → out). Left shoulder flares (no barbell overhead above 3/10 → landmine / DB neutral). Wrist and right shoulder healed, monitor. Plyo training age: beginner.

## The principles (load each before building)

| Principle | Decides |
|---|---|
| `principle-training-rhythm` | 4 core + 2 bonus split, Tue = max jump, 60-min core + 30, 48-hour rule, fillers |
| `principle-thp-trait-blocks` | The block's trait, exercise choice, contact budgets, the current cycle |
| `principle-dnt-olympic-lifts` | Coach's lifts: what runs, where it lands, what's skipped |
| `principle-dylan-shannon-strength-wave` | Squat wave (2 sets, box), upper record attempts, current records |

When a principle changes a choice, say so in the output, e.g. "her snatch moved to Tue 4a: dnt-olympic-lifts".

## Procedure
1. **Find what's current:** week = `(today − Nov 8) ÷ 7 + 1` (= DNT week) → block file in `arcs/2026-11-winter-jump/training/blocks/` (§1 day table, §2 week row) · the coach's latest PDF in `arcs/2026-11-winter-jump/coach-programs/` · `profile.md` at the root · recent logged sessions in Supabase `vtruwlvekfnmfgaundhp` (`workouts` / `workout_exercises` / `exercise_sets` / `daily_metrics`; weights in kg).
2. **Place her Olympic lifts** (`principle-dnt-olympic-lifts`).
3. **Lay out each day** (`principle-training-rhythm`): coach's lift first as written → jumps + sprints → loaded work → accessories.
4. **Fill** the squat wave and upper records (`strength-wave`), jumps/plyos/contrast by the block's trait (`thp-trait-blocks`), flex skills Mon (hip IR) and Fri (overhead).
5. **Check before delivering:**
   - [ ] Tue: coach's light lift (if any) → approach drills → max approach jumps, touch logged → sprints → depth jumps
   - [ ] heavy legs ≥48 h before Tue; Thu light on the legs; no heavy pulls Fri
   - [ ] ≤6 working exercises; 60-min core + optional block 4
   - [ ] her lifts unchanged and first, back squat skipped; sprints on Tue and Thu
   - [ ] jumps + sprints inside the block's budget
   - [ ] hip and shoulder rules applied; nothing deep within 48 h of Tue/Sat
   - [ ] measurement lines present (ball ladder on the rim day → `measurements`, bodyweight Sun → `daily_metrics`, retests W4/W8)
6. **Deliver** in the format below. If writing into the plan, edit the block file: §1 for structure, §2 for the week's row. No week files, no `active/`. Never write executed sets into markdown.

## Output format
```
TUE Nov 10 - J1 · Max Jump + Reactive (P · Power - W1)
Warm-up: leg swings, hip routine, pogos 2x10 (no static stretching)
1a  Coach muscle snatch (as written) ....... 80% 6x2 ................ rest 2'
2a  3-step approach drills, filmed ........ x6 .................... rest 1'
2b  Max approach jumps, hand depth noted .... 10 ..................... rest 2'
2c  Sprints 10-20 m ........................ x4 ..................... walk back
3a  Depth jump 18" ......................... 3x3 .................... rest 2'
3b  Hurdle hops ............................ 2x5 .................... rest 90"
3c  Single-leg pogos ....................... 2x8/leg
Log: ladder rung / clean-of-6 / hand depth -> measurements; contacts; knee/hip 0-10
```

## Adjusting
- **Missed day:** resume at the current week; don't double up. Lost Sunday → run L1 Mon, push J1 to Wed (keep 48 h).
- **Ladder flat 3 weeks:** Sunday squat to 1 set, +4 approach jumps Thu.
- **Squat top set −5% two weeks:** with touch rising → add a set; with touch flat → halve Tuesday for a week, check sleep and food.
- **Pain:** knee ≥3/10 no depth jumps; hip / shoulder rules above. Propose swaps, don't dictate.
- **Busy week:** keep Tue, Sun, Mon, Thu in that order.
