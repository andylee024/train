# Train — Product Roadmap (V1)

Three milestones to a complete V1: a plan the athlete trusts, a feedback loop that keeps it alive, and execution support that removes friction. Each milestone produces something usable.

**Guiding principle:** Prove it on Andy first. His case is the hardest (multi-sport, active injuries, cutting, busy schedule, history of falling off). If it works here, it works for simpler cases.

---

## Milestone 1 — The Plan

**Goal:** A complete training plan that Andy trusts end-to-end — from the big-picture arc down to what to do on any given Tuesday. The plan is produced by a team of AI coaches, delivered clearly, and backed by a working database.

### 1.1 Athlete Profile

Build the honest starting point. Not aspirational — real.

- Goals with explicit priority stack (what's #1, what's supporting, what's maintenance)
- Current body (weight, body fat, key lift numbers, jump metrics)
- Active injuries with pain levels, affected movements, trajectory
- Constraints (schedule, equipment, cooking ability, time)
- Preferences (training style, foods, communication)
- History (what's worked, what hasn't, patterns of falling off)

### 1.2 Coaching Roles

Define each specialist and how they contribute to the plan.

- **Head Coach** — synthesizes all specialist outputs into one coherent plan. Owns the arc and block structure. Resolves conflicts between roles. Decides priorities.
- **Strength / Power** — load progression, volume management, peaking. Programs squat, deadlift, press, and accessory work.
- **Sport (Basketball)** — jump training, sprint work, dunk-specific drills. Programs the sport-specific sessions.
- **Olympic Lifting** — clean, jerk, snatch technique and loading. Programs Olympic lift exposures across the week.
- **Injury / Mobility** — rehab protocols, prehab, flexibility programming. Modifies exercises based on injury status. Programs flexibility work.
- **Nutritionist** — body composition strategy (cut/bulk/maintain), calorie targets, macro splits, meal architecture. Operates at every layer: arc-level phase strategy, block-level calorie phases, weekly meal planning, daily meal prescriptions.

Each role has an objective function and produces domain-specific programming. The Head Coach merges these into a plan that doesn't conflict, overload, or leave gaps.

### 1.3 The Plan (Arc → Blocks → Weeks → Days)

The coaching team produces the full plan cascade:

**Arc** — The complete story from today to the goal. Phases in sequence, each with a rationale for why it exists and what must be true before the next one begins. Priority stack visible at every phase. Realistic timeline based on current state, not wishful thinking. Checkpoints: "if squat is at X by week 8, you're on track."

**Blocks** — Every 4-week training cycle from start to goal. Each block has: goals, quantified metrics targets, strategy, weekly programming (every exercise, every set/rep/load scheme, every rest period), and exit conditions. Fixed exercise menu within each block — progress through load, not variation.

**Weekly Plans** — Every week, fully prescribed. Exercises with loads and rest periods, flexibility work, nutrition targets (sleep, protein, hydration, BW trend), session notes, and logging checklist. The weekly plan is the contract: follow this and you'll hit the block's targets.

**Daily Prescriptions** — Fall out of the weekly plans. Today's workout with PRs to beat (last performance on each exercise from the database). Today's meals. One-line context (where in the arc, how the cut is tracking).

### 1.4 Database

Supabase wired up and running so the plan has data behind it.

- Core workout tables deployed (exercises, workouts, workout_exercises, exercise_sets — already done)
- Historical workout data queryable (for PRs to beat, progression trends)
- Arc, block, and weekly plan metadata stored (which phase, which week, what targets)
- Athlete profile stored (queryable by agents during replanning)

### 1.5 Delivery

The plan is communicated clearly to the athlete.

- Daily text (WhatsApp/SMS) — morning push with today's workout, PRs to beat, meals, one-line status
- Sunday webapp — arc view (where am I, what phase, am I on track), week view (this week's plan at a glance), progress metrics (lift trends, weight trend, gap to goal)

### Exit Condition

Andy receives a daily text with his workout and PRs to beat. On Sunday, he opens the webapp and sees the full arc, this week's plan, and his progress. He can trace any workout back to the goal and explain why it's programmed that way. He trusts the plan.

---

## Milestone 2 — The Feedback Loop

**Goal:** The plan stays alive. The athlete reports what happened, the system processes it, and the plan adapts. Without this, the plan is a static PDF that decays the moment reality diverges.

### 2.1 Logging

The athlete's primary interface back into the system.

- **Session logging** — "did it" (one-tap confirm, system fills from plan) or detailed set-by-set (weight, reps, RPE). Default is confirm; detail is available for PRs or troubleshooting.
- **Exception reporting** — "shoulder hurts," "traveling Thursday," "ate off-plan." Deviations from the plan captured with minimal friction.
- **Metrics** — bodyweight, pain levels, readiness, sleep. Quick numeric input.

Friction gradient: start with confirm/exception-only logging. As trust builds, converge toward auto-capture (wearables, gym check-ins). The system learns the athlete's pattern and pushes toward zero-effort logging.

### 2.2 Review

End-of-week and end-of-block assessment.

- Weekly review: wins, misses, metrics actual vs target, adjustments for next week
- Block review: did the block hit its exit conditions? What progressed, what stalled?
- Progress visualization: lift progression charts, weight trend, gap-to-goal metrics with trend lines
- All reviews stored — the feedback loop's memory

### 2.3 Progress Visibility

Numbers that prove it's working (or flag that it isn't).

- Per-exercise progression (weight over time, e1RM trend)
- Gap-to-goal dashboard (current squat vs target squat, current vertical vs target vertical, current weight vs target weight)
- Block-level checkpoints: are you hitting the exit conditions?
- Arc-level trajectory: on track, ahead, or behind — with honest assessment

### 2.4 Exception Handling

When reality diverges from the plan, the system responds appropriately.

- **Auto-resolve** (athlete never sees it): rest day shift ±1, calories ±100, pre-approved exercise swaps, warm-up adjustments
- **Propose → approve** (show reasoning, get yes/no): exercise substitution off approved list, block extension, calorie target ±150+, skip session
- **Escalate → conversation** (requires dialogue): arc-level goal change, phase resequencing, injury requiring medical referral, plan fundamentally not working

### 2.5 Replanning

The coaches reconvene with new data and update the plan.

- Specialist agents re-run with updated athlete state (new logs, new metrics, new exceptions)
- Head Coach produces updated block/weekly plans incorporating the new information
- Changes are proposed to the athlete with reasoning — never auto-applied
- The plan evolves with the athlete instead of drifting apart from reality

### Exit Condition

Andy logs a workout ("did it"), reports a pain increase ("shoulder at 4"), and misses a session due to travel. The system auto-adjusts the rest day, proposes exercise swaps for the shoulder with reasoning, and the next week's plan reflects all three inputs. Andy reviews his weekly progress and sees metrics vs targets. The plan is alive.

---

## Milestone 3 — Execution Support

**Goal:** The Chief of Staff handles logistics so the athlete never thinks about them. The gap between "I know what to eat" and "I actually ate it" is closed by making execution frictionless.

### 3.1 Meal Orchestration

Nutrition goes from abstract targets to concrete meals in the athlete's hands.

- Weekly meal plan generated from nutritionist's targets (calories, macros, meal timing)
- Each meal has logistics: cook it (recipe + ingredients), order it (pre-built DoorDash/meal prep order), or grab it (restaurant/fast food option with what to order)
- Grocery list generated from the week's cook-at-home meals
- Social event budgeting: "dinner out Saturday" → here's your calorie budget and what to order
- Meal prep scheduling: what to prep Sunday, what to prep Wednesday

### 3.2 Nutrition Logging

Track what actually happened.

- Meal confirmations: one-tap "ate the plan" or note the deviation
- Bodyweight logging (daily, 7-day rolling average computed)
- Body fat logging (periodic, trend tracked)
- Macro tracking (optional — available for those who want it, not required)

### 3.3 Nutrition Progress

Close the loop on body composition.

- Weight trend vs target (cut/bulk/maintain — is the rate correct?)
- Compliance rate (how many meals followed the plan vs deviated)
- Calorie/macro trends (if tracking)
- Phase progress: are you on track for the body comp target by block end?
- Adjustment triggers: if weight isn't moving, flag for nutritionist replanning

### Exit Condition

Andy's Sunday plan includes meals for the week with grocery list and pre-built delivery orders for busy days. He confirms meals with one tap. His weight trend shows the cut is on track at the right rate. When he has dinner out Saturday, the system already adjusted his calorie budget for the day and suggested what to order. Zero nutrition logistics friction.

---

## What V1 Delivers

An athlete goes from "I have goals but everything is scattered" to:

1. A plan they trust, produced by an AI coaching team, with every decision explained
2. A daily text that tells them exactly what to do (workout + meals + PRs to beat)
3. A weekly view that shows the big picture and proves the plan is working
4. A feedback loop that keeps the plan alive as reality changes
5. Execution support that turns nutrition targets into actual meals in their hands

The athlete's only job: show up, do the work, report what happened.

---

## What's Deliberately Post-V1

- **Multi-athlete support** — architecture supports it (composable specialists, athlete profile as shared state), but V1 is built for Andy
- **Wearable integration** — auto-capture logging from Apple Watch, Whoop, etc.
- **Mobile app** — text + webapp covers V1 needs. Native app is a scale concern.
- **Operator services beyond nutrition** — appointment booking (Lobs), calendar integration, supplement reminders. These are valuable but not required for V1's core loop.
- **Onboarding flow** — how a new athlete goes from sign-up to first plan. Requires the system to work for Andy first.
