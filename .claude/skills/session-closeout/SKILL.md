---
name: session-closeout
description: Close out Andy's training session after he finishes: log sets to Supabase, post the session update on the Linear issue, prepare the DNT overview, ask two questions, record the check-in and mark the issue Done. Trigger when he says he's done, finished, "log my workout", "close it out", or sends the sets he did.
allowed-tools: Read Bash Grep
---

# Session close-out

Run these five steps in order, every session. Each step uses the one before it.

**Where things are:** today's session = the Linear issue in team **Train**, project **arc2-2026 · Winter Jump** (P-TR-16), due date = today (America/Los_Angeles). Log = Supabase project `vtruwlvekfnmfgaundhp`. Weights convert with `weight_kg` (lb × 0.453592); e1RM = Epley `load × (1 + reps/30)`.

## 1. Log the sets
- One `workouts` row; `notes` starts with the issue id and session, e.g. `TR-381 · W02 J1`.
- `workout_exercises` (names must match `exercises.name`) → `exercise_sets`: weight with its unit, reps, RPE where given.
- Ladder rung, hand depth, tests → `measurements`. Sunday bodyweight → `daily_metrics`.
- Anything unclear (no unit, a set he didn't mention) → ask before writing.
- Echo back one line per exercise, plus the record it beat if it beat one.

## 2. Post the session update
Comment on today's issue: the `workouts.id`, a table **Slot · Exercise · Planned · Done**, and one line for anything dropped, added or moved.

## 3. Prepare the DNT overview
Use the `dnt-overview` format on the coach lifts he actually did (logged weights, kg and lb). Send it as its own message, ready to paste to Coach Zhou. No coach lift today → one line saying so.

## 4. Ask two questions
One message, nothing else:
1. *Top-set RPE, and did it feel fast, normal or slow?*
2. *Any pain? Hip, knee or groin, 0–10.*

He can add notes; don't ask for them.

## 5. Record and close
- Second comment on the issue: `Check-in: RPE 8.5 · normal · hip 2 · knee 0 · groin 0 — <notes if any>`.
- Add the same line to `workouts.notes`.
- Move the issue to **Done**.
- Two "slow" sessions in a row → trim the next session to its core slots, and say so.
- Pain ≥ 3 → apply the rule for the rest of the week (hip → that position out; knee → no depth jumps), and say so.

**Skipped session:** no loop. Comment one word why, move the issue to **Canceled**. Never Done without a `workouts` row.
