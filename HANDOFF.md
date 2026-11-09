# HANDOFF — Telegram training agent (grokbot)

What the phone-side agent needs to serve today's workout and record what Andy did. Built so that one agent replaces grokbot + nanobot on the DigitalOcean VM. Everything it reads is in this repo on GitHub; everything it writes goes to Supabase. No other state.

## 1. Reading the plan

1. **Active arc:** `CLAUDE.md` names it (now `arc-2026-winter-jump/`, start **2026-11-08**).
2. **Week number:** `W = floor((today − arc_start) / 7) + 1` in America/Los_Angeles. W1–W4 → `training/blocks/2026-11-block-P-power-approach.md`, W5–W8 → `2026-12-block-R-reactive.md`, W9–W12 → the Test block file (written at W8).
3. **Today's session:** block file **§1** has one table per day (Sun L1 · Mon U1 · Tue J1 · Wed rest · Thu P1 · Fri U2 · Sat J2) with the warm-up line, slots 1a…4, sets × reps, rest. **§2** is a table with one column per week; replace "see §2" cells with that column (rep range, squat load, record targets, jump counts, coach lifts, notes). Block R §1 lists only the swaps vs Block P.
4. **Coach lifts:** the "Coach — Sun/Tue/Thu/Fri" rows in §2. The raw PDFs are in `coach-programs/`. If a row says "per DNT wkN" the drop hasn't landed; show the placeholder and say so.
5. **Rules that override the table:** `training/arc.md` → "Agent rules" (hip/shoulder/knee thresholds, priority order when a week shrinks, escalations). `profile.md` has current numbers and injuries.

Render for the phone: day name + workout name, then one line per slot `1a Exercise — sets×reps @ load — rest`. Keep the warm-up line and the "Log:" line.

## 2. Writing the log (Supabase project `vtruwlvekfnmfgaundhp`)

Tables: `workouts (id, performed_at, notes)` → `workout_exercises (id, workout_id, exercise_id, order_index, notes)` → `exercise_sets (id, workout_exercise_id, set_index, reps, weight_value, weight_unit, weight_kg, rpe, notes)`. Lookup: `exercises (id, name)`.

- One `workouts` row per session; `performed_at` = session timestamp; `notes` = e.g. `W1 U1`.
- One `workout_exercises` row per exercise in the order done; `exercise_id` **must** match an existing `exercises.name` (case-insensitive match, then confirm with the user before creating a new exercise). PR lookups and the dashboard break on name drift.
- One `exercise_sets` row per set: `reps`, `weight_value` + `weight_unit` as given (`lb`/`kg`), `weight_kg` computed (lb ÷ 2.20462), `rpe` when stated. Bodyweight-only sets: weight 0.
- **Bodyweight →** `daily_metrics (date, bodyweight_lb, notes)`, one row per day.
- **Anything that isn't a set → `measurements (date, metric, value, value_text, unit, side, notes)`.** Metrics in use:

| metric | value | value_text | unit | side |
|---|---|---|---|---|
| `ladder_rung` | 0–6 | rim grab / tennis ball / softball / mini basketball / volleyball / women's ball / men's ball | rung | |
| `ladder_clean_of_6` | 0–6 | | count | |
| `hand_depth` | | fingertips / palm / wrist / forearm | | |
| `touch_in`, `standing_reach_in`, `standing_vert_in`, `depth_jump_in` | inches | | in | |
| `seated_hip_ir_deg` | degrees | | deg | L / R |
| `taylors_pose_cm` | cm | | cm | |
| `ohs_kg` | kg | | kg | |
| `sleep_h`, `readiness_1_10` (optional canaries) | | | h / score | |

Never write to markdown. Never write a plan into Supabase.

## 3. Conversation shape (Telegram)

- "workout" / "today" → render today's session (step 1). "tomorrow" / "Thu" → that day.
- "DNT" / "coach lifts" → only the coach rows for the day (format: exercise / sets×reps / kg and lb).
- Set logging in free text (`bench 205x8 @8`, `pull-ups +55 x 8, 7, 6`) → resolve exercise name, write sets, echo what was written with the record it beat if any (compare against best set at that rep count).
- `ladder softball 4/6 palm` → three `measurements` rows. `bw 188.4` → `daily_metrics`.
- End of session: ask for anything in the day's "Log:" line that wasn't given (RPE on the top set, box height, hip 0–10).
- Pain ≥ 3/10 reported → apply the arc rules (movement out for the week) and say so; do not change the plan files.

## 4. Don'ts
- Don't invent exercises or loads not in the block file; if §2 is blank, say the drop hasn't landed.
- Don't edit the repo. Plan changes go through Claude (skills + arc.md + block file in one commit).
- Don't store measurements in set notes.
