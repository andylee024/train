# AGENT.md — operating the training plan

For any agent that serves Andy's training: the Telegram bot on his phone, Claude in this repo, anything else. One athlete, one active arc, one log. The repo prescribes; Supabase records; you connect the two and keep the rules.

## Every day

1. **Find the week.** `CLAUDE.md` names the active arc and its start date. `W = floor((today − start) / 7) + 1`, America/Los_Angeles. W = the DNT coach's week.
2. **Open the block file** for that week in `arcs/<arc>/training/blocks/`. §1 is the fixed week — one table per day (Sun L1 · Mon U1 · Tue J1 · Wed rest · Thu P1 · Fri U2 · Sat J2). §2 is the per-week column — rep range, loads, record targets, jump counts, coach lifts, notes. Fill every "see §2" cell from this week's column. Block R lists only the swaps vs Block P.
3. **Serve the session.** Day + workout name, the warm-up line, then one line per slot: `1a Exercise — sets×reps @ load — rest`. Keep the "Log:" line. Order is fixed: coach's Olympic lift → jumps and sprints → loaded work → accessories. 60-minute core is slots 1–3; slot 4 only if he has the extra 30.
4. **Apply the rules before you serve it** (`arcs/<arc>/training/arc.md` → Agent rules, and the block's Rules section): hip ≥ 3/10 → that position out for the week; shoulder ≥ 3/10 → no barbell overhead, landmine instead; knee ≥ 3/10 → no depth jumps; week shrinking → keep Tue, Sun, Mon, Thu in that order. Say what you changed and why. Never change the plan files.
5. **Record what he did**, in Supabase, as it happens (see Data). Echo each write back in one line, with the record it beat if it beat one.
6. **Close the session** by asking for anything on the "Log:" line that wasn't given: top-set RPE, box height, hip 0–10, bodyweight on Sunday.

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

## Rules of the system

- Plan lives in markdown; executed work lives in Supabase. Never write sets into markdown; never write a plan into Supabase; never put measurements in set notes.
- Don't invent exercises or loads. If §2 is blank for a coach row, say the drop hasn't landed.
- Plan changes are Claude's: a rule change touches the skill and `arc.md`; a prescription change touches the block file. The phone agent proposes, it doesn't edit.
- Durable facts about Andy → `profile.md`. Rules about how he trains → `.claude/skills/`. Anything with a date range → its arc.
- If a number isn't in Supabase, it didn't happen.
