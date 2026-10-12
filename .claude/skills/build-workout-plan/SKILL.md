---
name: build-workout-plan
description: Build or adjust Andy's training (a session, a week, or a 4-week block) for his dunk, Olympic lifting and strength goals. It loads his four principle skills and applies them. Use for "build my week", "what's today's workout", "plan the next block", or when a new DNT program arrives.
---

# Build Workout Plan

The builder. It doesn't hold training rules itself: it loads Andy's four principles and applies them.

## Goals (priority order: what gives way first when recovery runs short)
1. **Dunk a volleyball** on a 10' rim: +3–5" approach touch. Dunk test W12 Sat, Jan 30, 2027.
2. **Olympic lifts** with his DNT coach: power clean 225, power clean & jerk 225.
3. **Strength keeps climbing:** squat, bench and pull-up steadily up; 405 squat within 12 months.

**Athlete:** ~190 lb. No BJJ. Plays pickup basketball sometimes. Shoulder and wrist healed: if either hurts at 3/10 or more, swap in landmine press or hang variants.

## The principles (load each before building)

| Principle | Decides |
| --- | --- |
| `principle-dylan-shannon-strength-wave` | Strength lifts, rep ranges, loads, records |
| `principle-thp-trait-blocks` | The block's trait, exercise choice, jump volume, test weeks |
| `principle-dnt-olympic-lifts` | Coach's lifts: what runs, where it lands, what's skipped |
| `principle-training-rhythm` | Session blocks (1a–3c), the weekly split, 48-hour rule, upper-day supersets |

When a principle changes a choice, say so in the output, e.g. "her snatch pulls moved to Tue: training-rhythm, 48-hour rule".

## Procedure
1. **Find what's current:**
   - which block and week it is (`principle-thp-trait-blocks`). Week numbers = DNT coach's weeks: W21–W24 in the summer arc, then W1 restarts in a new arc folder;
   - the coach's latest program (`docs/athletes/andy/<arc>/coach-programs/`);
   - the plan doc "Andy — Training Plan" (Claude Docs) is the source of truth for workout names and session layouts;
   - recent logged sessions: Supabase project `vtruwlvekfnmfgaundhp`, tables `workouts` / `workout_exercises` / `exercise_sets` / `daily_metrics`. Weights may be stored in kg.
2. **Place her Olympic lifts** on the split (`principle-dnt-olympic-lifts`).
3. **Lay out each day** with the session structure and split (`principle-training-rhythm`).
4. **Fill** strength with the wave (`principle-dylan-shannon-strength-wave`), and jumps, sprints and exercise choice with the block's trait (`principle-thp-trait-blocks`).
5. **Check before delivering:**
   - [ ] about 6 working exercises a day
   - [ ] heavy legs at least 48 h before Tue and Sat
   - [ ] no heavy pulls on Friday
   - [ ] her lifts unchanged (squat skipped)
   - [ ] jumps lead on jump days
   - [ ] fillers on upper days
   - [ ] the block's trait is clearly the focus
6. **Deliver** in the format below. If writing into the plan, update `docs/athletes/andy/<arc>/training/weeks/` and `active/current-week.md`. Never write executed sets into markdown; logs go to Supabase.

## Output format
```
MON Oct 12 - U1 · Upper Strength + Speed (B1 Strength - W21)
Warm-up: Daily 7
1a  Coach Olympic lift ............. per DNT .............. rest 2-3'
2a  Bench (wave: 6s) ................ 3x6 @ 200 ............ rest 3'
2b  Weighted pull-up (wave) ......... 3x5 @ +45 ............ rest 3'
2c  Sprint 20 m @ 85% ............... x1 each round (during rest)
3a  Dips ............................ 3x8
3b  Row ............................. 3x10
Log: bench top set + RPE, pull-up load
```

## Adjusting
- **Missed day:** resume at the current week; don't double up.
- **Touch flat 3–4 weeks while the squat climbs:** shift volume toward reactive work early.
- **Same loads feel heavier 2 weeks running:** halve Tuesday's volume for a week and check sleep and food.
- **Pain:** follow the knee rules in `principle-thp-trait-blocks`, and the shoulder/wrist swaps above.
