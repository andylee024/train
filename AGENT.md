# AGENT.md — operating the training plan

For any agent that serves Andy's training: the Telegram bot on his phone, Claude in this repo, anything else. One athlete, one active arc, one log. Linear serves the plan (one issue per session, generated from the repo's block files); Supabase records what happened; you connect the two and keep the rules.

## Every day

1. **Find today's session in Linear.** Team **Train**, project **arc2-2026 · Winter Jump** (P-TR-16): the issue whose due date is today (America/Los_Angeles). The week is the current cycle (named `W02`…`W12`); W01 has no cycle. A day can have more than one issue (a session + a one-off like a retest) — serve the session first.
2. **Serve the issue as written.** Its description is the prescription: context line, warm-up, the table (Slot · Exercise · Sets × reps · e1RM · % · Working), rules, Log line. Order is fixed: coach's Olympic lift → jumps and sprints → loaded work → accessories. Slots 1–3 are the 60-minute core; slot 4 only if he has the extra 30. Coach rows that say "per DNT" mean her next drop hasn't landed: say so, don't invent loads.
3. **No issue for today** (rest day, or the week moved): check the nearest open issue in the current cycle and ask whether he's doing it today. Only if Linear is unreachable, fall back to the block file in `arcs/<arc>/training/blocks/` (§1 the fixed week, §2 this week's column; `W = floor((today − arc start) / 7) + 1`).
4. **Apply the rules before you serve it** (`arcs/<arc>/training/arc.md` → Agent rules, and the block's Rules section): hip ≥ 3/10 → that position out for the week; shoulder ≥ 3/10 → no barbell overhead, landmine instead; knee ≥ 3/10 → no depth jumps; week shrinking → keep Tue, Sun, Mon, Thu in that order. Say what you changed and why. Never change the plan files.
5. **When he finishes, run the close-out loop below** — every session, in that order.

## After the workout: close-out loop

When Andy says he's done (or sends what he did), work through these five steps in order. Don't skip ahead; each step uses the one before it.

1. **Log the sets** to Supabase (see Data): one `workouts` row (`notes` starts with the Linear issue id, e.g. `TR-381 · W02 J1`), then `workout_exercises` and `exercise_sets` — weight with its unit, reps, RPE where given. Exercise names must match `exercises.name`. If anything is ambiguous (a weight without a unit, sets he didn't mention), ask before writing. Echo back one line per exercise, and the record it beat if it beat one. Measurements (ladder rung, hand depth, tests) → `measurements`; Sunday bodyweight → `daily_metrics`.
2. **Post the session update** as a comment on today's Linear issue: the `workouts.id`, then a table **Slot · Exercise · Planned · Done**, and one line for anything dropped, added or moved.
3. **Prepare the DNT overview** with the `dnt-overview` skill, from the coach lifts he actually did (logged weights, kg and lb), ready for him to paste to Coach Zhou. Send it to him as its own message. No coach lift today → say so in one line.
4. **Ask two questions and for notes**, in one message:
   - *How did it go, 1–10, and what was the RPE of your hardest set?*
   - *Any pain? Hip, knee or groin, 0–10.*
   - *Anything else for the notes?*
5. **Record and close.** Post his answers as a second comment on the issue (`Check-in: 7/10 · hardest set RPE 8.5 · hip 2 · knee 0 · groin 0 — <notes>`), add the same line to the `workouts.notes`, then move the issue to **Done**. Any pain ≥ 3 → apply the rule for the rest of the week (hip → that position out; knee → no depth jumps) and say so.

Skipped session → no loop: comment one word why and move the issue to **Canceled**. Never Done without a `workouts` row.

## Every week

- **Tuesday is the priority session.** If it hasn't happened by Thursday, say so plainly.
- **Ball ladder once, at a rim** (Tue if it has one, else Sat): six attempts at the current rung, 2' rest; record rung, clean-of-6, hand depth. Two clean of six → next session try the next rung.
- **Bodyweight Sunday** → `daily_metrics`.
- **Coach drop (~every 2 weeks):** when a new DNT PDF arrives, it goes to `arcs/<arc>/coach-programs/` with a README row, and her lifts fill the "Coach — Sun/Tue/Thu/Fri" rows of §2 for those weeks by type: heavy clean day → Sun 1a · clean + pull → Thu 1a/1b · snatch / light → Tue 1a · jerk / overhead → Fri 1a · her back squat skipped · her heavy front squat = that week's squat, to a box. Her sets and percentages as written. (Claude does this edit; the phone agent reports the drop and serves "per DNT" placeholders until it's in.)

## Every block (W4, W8, W12)

- **Retest week:** ladder + hand depth · seated hip IR L/R · Taylor's pose · supine overhead · heel-elevated squat · 40 kg OHS · standing vertical if the app is there. All → `measurements`.
- **Review** from `arcs/<arc>/reviews/REVIEW-TEMPLATE.md`: adherence (core days done), the jump, Olympic lifts, flexibility, strength held, recovery canaries, keep/change/drop. Written from Supabase, not memory.
- **Escalate to Andy** when: two core sessions missed in a row · ladder flat 3 weeks · squat top set −5% two weeks running · pain ≥ 3/10 for 5+ days.

## Data (Supabase project `vtruwlvekfnmfgaundhp`)

**Sets:** `workouts (performed_at, notes)` → `workout_exercises (workout_id, exercise_id, order_index)` → `exercise_sets (set_index, reps, weight_value, weight_unit, weight_kg, rpe, notes)`. One workout per session (`notes` = `W1 U1`), exercises in the order done, one row per set. `exercise_id` must match an existing `exercises.name` — resolve case-insensitively, ask before creating a new name. `weight_kg` = lb ÷ 2.20462. Bodyweight-only sets: weight 0. e1RM = Epley, `load × (1 + reps/30)`.

**Bodyweight:** `daily_metrics (date, bodyweight_lb, notes)`.

**Everything that isn't a set:** `measurements (date, metric, value, value_text, unit, side, notes)`.

| metric | value | value_text | unit | side |
|---|---|---|---|---|
| `ladder_rung` | 0–6 | rim grab / tennis ball / softball / mini basketball / volleyball / women's ball / men's ball | rung | |
| `ladder_clean_of_6` | 0–6 | | count | |
| `hand_depth` | | fingertips / palm / wrist / forearm | | |
| `touch_in` · `standing_reach_in` · `standing_vert_in` · `depth_jump_in` | inches | | in | |
| `seated_hip_ir_deg` | degrees | | deg | L / R |
| `taylors_pose_cm` | cm | | cm | |
| `ohs_kg` | kg | | kg | |
| `sleep_h` · `readiness_1_10` | | | h / score | |

Free-text shortcuts the phone agent should accept: `bench 205x8 @8` · `pull-ups +55 x 8,7,6` · `ladder softball 4/6 palm` · `bw 188.4`.

## Linear (weekly view)

Linear is the calendar for the plan, not a second log. Team **Train**, project **arc2-2026 · Winter Jump** (P-TR-16). Everything in it is generated from the block file; the block file stays the source.

- **One issue per planned session.** Title `W02 · Tue 11/17 · J1 Max Jump + Reactive`. Labels `Workout` + `core` or `bonus`; Tue = High priority; due date = the session date. Description = one context line, the warm-up line, a table with columns **Slot · Exercise · Sets × reps · e1RM · % · Working**, the day's rules, the `Log:` line. e1RM is Epley from Supabase (`load × (1 + reps/30)`), the all-time best for that exercise name; `—` if there is none. No guesses, no "record to beat".
- **Working weight = % × e1RM**, rounded to the plate (5 lb / 2.5 kg). Coach rows use her percentages of her stated max.
- **Close-out:** the five-step loop in *After the workout* (log → session comment → DNT overview → two questions + notes → check-in comment + Done).
- **Regenerate, don't edit.** When §2 changes (coach drop, rule change) the week's issues are rewritten from the block file. Hand edits in Linear don't flow back.
- **Milestones = blocks** (Block P · R · T); every issue sits on its block's milestone. **Cycles = weeks** (1-week, Sunday start).
- **Two saved views** on the project: **This week** (list, current cycle, by due date) and **Block P** (board, milestone = Block P, a column per cycle). At each block change (W5, W9) add the next block's board the same way. Cycles are named `W02`…`W12` to match the arc week; W01 predates the cycles and shows as "No cycle".
- **The project page is the training plan** (goals, approach, assessment, blocks, the week, loads, measurement, principles). It mirrors `arcs/<arc>/training/arc.md`: when `arc.md` changes, Claude updates the page in the same change.
- **Dated one-offs** live in the same project: coach drops, retests + reviews, physio, coach max day, squat single, dunk test.
- Claude creates and regenerates issues; the phone agent reads them, posts close-out comments and moves state.

## Rules of the system

- Plan lives in markdown; executed work lives in Supabase. Never write sets into markdown; never write a plan into Supabase; never put measurements in set notes.
- Don't invent exercises or loads. If §2 is blank for a coach row, say the drop hasn't landed.
- Plan changes are Claude's: a rule change touches the skill and `arc.md`; a prescription change touches the block file. The phone agent proposes, it doesn't edit.
- Durable facts about Andy → `profile.md`. Rules about how he trains → `.claude/skills/`. Anything with a date range → its arc.
- If a number isn't in Supabase, it didn't happen.
