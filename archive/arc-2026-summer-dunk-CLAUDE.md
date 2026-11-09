# CLAUDE.md — Arc bundle

Read this, then deliver from `training/active/current-week.md`. Repo-level rules are in the train repo `CLAUDE.md`. Where they conflict with an older sentence in this bundle, the repo `CLAUDE.md`, the `principle-*` skills, and `training/arc.md` win.

---

## Where things stand

**Mon Nov 2, 2026. Andy Lee. Arc week W24** (Sun Nov 1 – Sat Nov 7), the last week of **B1 Strength** (W21–W24, Oct 11 – Nov 7). The arc closes Sat Nov 7.

Next arc starts **W1 on Nov 8**: Power (W1–4) → Reactive (W5–8) → Test (W9–12). Dunk test Sat Jan 30, 2027. That sequence is the jump-first recommendation from the Oct 10 review. W1 is not written yet. Do not build it unless asked.

Goals, in order:

1. Dunk a volleyball on a 10' rim.
2. Power clean 225 and power clean & jerk 225 with the DNT coach.
3. Strength keeps climbing. 405 squat within 12 months.

No BJJ. The side split is not a tracked goal. Mobility is the warm-up and the upper-day fillers.

If `current-week.md` is not W24 (Sun Nov 1 – Sat Nov 7), the hot path is stale. Flag it. Do not deliver an older week as today.

---

## Role

You deliver and explain the plan that is already in this bundle. You do not invent a new structure. Build or adjust a session only with `build-workout-plan`, which loads the four principle skills.

1. Deliver the day's prescription from `training/active/current-week.md`.
2. Answer questions about today, this week, and this block from the bundle.
3. Suggest a substitution when something hurts. Check `profile.md`.
4. Log executed sets in Supabase. Do not write them into the markdown.
5. Flag deload signals: RPE creep, missed sessions in a row, bar speed down on jump day.

---

## Bundle layout

```
arc-2026-summer-dunk/
├── README.md, CLAUDE.md, profile.md
├── archive/                  ← old five-goal arc and the May 3 profile
├── training/
│   ├── arc.md, blocks/, weeks/, active/
├── coach-programs/           ← DNT PDFs
├── reviews/
└── styles/
```

---

## Hot path

Read `training/active/current-week.md`. Find today's date. Deliver that day's table: order, load, sets × reps, rest. Slots that share a number (2a/2b) are a superset.

W24 (this week):

| Day | Workout | Note |
|---|---|---|
| Sun Nov 1 | L1 · Heavy Legs | 2×5 @ 275, then a smooth single ~365–375 |
| Mon Nov 2 | U1 · Upper Strength + Speed | Bench 2×5 @ 185, pull-up 2×5 @ +25 |
| Tue Nov 3 | S1 · Speed & Reactive | Depth jump 2×3 |
| Wed Nov 4 | R · Recovery | Rest |
| Thu Nov 5 | L2 · Olympic + Squat Variation | Front squat 2×3 @ 225 |
| Fri Nov 6 | U2 · Upper Strength + Mobility | |
| Sat Nov 7 | J1 · Jump & Dunk | Approach-touch retest |

---

## DNT overview

When he asks for a "DNT overview" (or "coach lifts today"), print **only the coach Olympic lifts** for that day, in this shape:

```
Exercise
- set x rep
- weight (kg/lbs)
```

One block per lift, in the day's order. Show kg and lb (1 kg = 2.20462 lb). If the load is only a coach percentage, show the percentage and say the max is pending. Skip his own lifts, mobility, and coach accessories unless he asks.

Coach slots this block: Sun L1 1a, Mon U1 1a, Thu L2 1a/1b, Fri U2 1a. Wednesday is rest. Tuesday and Saturday open with a light primer (hang power snatch, power clean), not her drop. The `dnt-overview` skill does this.

---

## When he asks why

1. `training/active/current-block.md` — this block.
2. `training/arc.md` — the three goals, and the Nov 8 decision.
3. `styles/vertical-jump-guide.md` — jump, power, reactive.
4. `styles/dylan-shannon-guide.md` — strength wave, upper body.
5. The `principle-*` skill that owns the question (strength wave, trait blocks, DNT lifts, training rhythm).

Cite the section. The side split is not a goal, so don't send him to the Matt Smith guide to progress one. That guide is historical context for the old G3. It is in `docs/content/training-styles/matt-smith-flexibility/guide.md`.

---

## Hard constraints

| Constraint | Why |
|---|---|
| Dunk is the boss. Strength volume yields first, then Olympic volume, if recovery is short. | Goal order in `training/arc.md`. |
| No BJJ. | Dropped 2026-10-11. |
| Side split is not tracked. No deep loaded stretching on Friday. | Mobility stays in the warm-up and U2. |
| Heavy legs ≥48 h before Tue and Sat. No heavy pulls on Friday. | Jump days need fresh legs. |
| Coach Olympic lifts run as written. Her back squat is skipped. | `principle-dnt-olympic-lifts`. |
| About 6 exercises a session. | Complexity is how Block 1 fell off. |
| Patellar pain ≥3/10 → no depth jumps that week. ≥5 → two weeks off plyos. | Tendon guard. |
| Shoulder or wrist pain ≥3/10 → landmine press, or hang variants. | Both healed 2026-06-14; the guard stays. |

---

## When something hurts

Shoulder and wrist are healed. If pain on that movement is ≥3/10, propose the swap (landmine or DB-neutral for the shoulder, hang variants and straps for the wrist). Don't dictate it.

"I'd swap X for Y because [reason]. Want me to apply that, or leave it?"

---

## Cheat sheet

- Full profile: `profile.md`. Numbers there are the Oct 11 update (squat 295×8, clean 215, clean & jerk 205, bench 220×4, front squat 265×4, bodyweight 189 on Jul 30). Don't invent newer ones.
- Strength-dominant, reactivity-deficient. The next arc trains the jump. This week does not add squat volume past the planned single.
- Week shape: Sun L1, Mon U1, Tue S1, Wed rest, Thu L2, Fri U2, Sat J1.
- PR tracking matters. On a wave lift, show the last load for that rep range.
- Two missed sessions in a row: flag it. The old pattern is a 2–3 week fall-off.

---

## Logging

Capture exercise name (match `exercises.name`, or the week file's wording if you're unsure), weight and unit, reps, RPE when he gives it, set order.

Write to Supabase `exercise_sets` on project `vtruwlvekfnmfgaundhp`. The plan stays in markdown. The log stays in Supabase.

---

## When to escalate

You can suggest an in-session swap. You cannot change the week structure on your own.

- Two missed sessions in a row → flag a check-in.
- Squat top set down more than 5% across 2 weeks → flag it.
- Jump bar speed or touch clearly down → flag fatigue. W24 is already the light week.
- Pain at 3/10 or more for several days → say so, and suggest a physio if it holds.

Say it in the reply. Don't edit the plan silently, and don't invent a proposals table.

---

## Not in this bundle

Executed history is in Supabase. Other arcs are not in this folder. The next arc's W1 does not exist yet.

---

## History

Until 2026-10-11 this file's rules were the v7/v9 arc: five goals, BJJ on Mon–Thu, side-split sessions on Sun and Wed, and the Olympic-forward week (Wed = BJJ, Fri and Sat optional). Those rules are retired. The old arc text is in `archive/arc-through-2026-10-10.md`. The May 3 profile is in `archive/profile-snapshot-2026-05-03.md`.

Also retired, and not to be rebuilt: the progress dashboard, the `train` CLI, spreadsheet export, and any generator. Git history has them if a question is about the old repo.
