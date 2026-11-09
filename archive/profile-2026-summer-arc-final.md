# Athlete Profile — Andy Lee

**As of Mon Nov 2, 2026.** Arc week W24 (Sun Nov 1 – Sat Nov 7), last week of B1 Strength. Arc closes Nov 7. Next arc starts W1 on Nov 8.
**Numbers below are the 2026-10-11 update.** Nothing newer has been written into this file.
**Arc start snapshot (2026-05-03):** [`archive/profile-snapshot-2026-05-03.md`](archive/profile-snapshot-2026-05-03.md).

---

## Identity

I want to be athletic and durable for a long, long time. I invest in nutrition, training, mobility, and sports to fulfill a long-term goal of becoming the best athlete I can — basketball, martial arts, everything. I do this by setting athletic goals and chasing them with structure.

---

## Goals

In priority order. When recovery runs short, the lowest yields first.

1. **Dunk a volleyball** on a 10' rim (+3–5" approach touch). Dunk test is the next arc, W12 Sat, Jan 30, 2027.
2. **Power clean 225 and power clean & jerk 225** with the DNT coach. She programs the Olympic lifts.
3. **Strength keeps climbing.** 405 squat within 12 months.

No BJJ. The side split is not a tracked goal. Mobility lives in the warm-ups and the fillers. Pickup basketball sometimes, Saturday after the dunk work.

---

## Current numbers (2026-10-11)

- Back squat 295 × 8 (Oct 11, e1RM ~374)
- 355 single (Sep 21)
- Front squat 265 × 4
- Power clean 215 single
- Power clean & jerk 205
- Bench 220 × 4
- Bodyweight last logged 189 (Jul 30)

Jump status on file is the Oct 10 review: a tennis ball on the 10' rim, reported, not a logged reach test. W24's Saturday is the approach-touch retest. Do not invent a touch height.

---

## Athletic diagnosis

**Strength-dominant, reactivity-deficient** (VJ guide §3).

The limiter for the dunk is rate of force development, reactive work, and approach practice. The Oct 10 review found the vertical flat because jumping had not been trained, and because leg strength had mostly returned to where it was in the winter. He is around the squat-to-bodyweight range where more max squat stops helping the jump.

**What that means now:** W21–W24 is the strength block already in progress, and W24 is the light test week. The next arc (Nov 8) is jump-first: Power, then Reactive, then Test. The squat wave stays, at maintenance volume, during those blocks. 405 is the 12-month strength goal, not the next block's focus. Don't add squat volume in order to chase the dunk.

---

## Injury history (cleared 2026-06-14)

Both prior injuries are healed. Overhead pressing, jerks, and front-rack catches are allowed. If pain comes back at 3/10 or more, revert that movement.

### Right shoulder — healed, monitor

- Cleared 2026-06-14. Barbell overhead press, push press, jerk, and full-ROM bench are permitted.
- If shoulder pain returns at ≥3/10, revert to landmine or DB-neutral press.

### Left wrist (De Quervain's) — healed, monitor

- Cleared 2026-06-14. Front rack, full cleans, and grip-heavy pulling are permitted.
- If wrist pain returns at ≥3/10, revert to hang variants, hook grip, or straps.

The June re-introduction window (2–3 weeks of ramp) is over. The rule that remains is the pain guard above.

---

## Schedule

Six training days. Wednesday is recovery. About 6 exercises a session.

| Day | Workout |
|---|---|
| Sun | L1 · Heavy Legs |
| Mon | U1 · Upper Strength + Speed |
| Tue | S1 · Speed & Reactive |
| Wed | R · Recovery |
| Thu | L2 · Olympic + Squat Variation (short day) |
| Fri | U2 · Upper Strength + Mobility |
| Sat | J1 · Jump & Dunk |

- Heavy legs at least 48 hours before Tue and Sat.
- No heavy pulls on Friday. No deep loaded stretching on Friday.
- Coach Olympic lifts in the 1a slots (Sun, Mon, Thu, Fri). Her back squat is skipped.
- Equipment: full commercial gym and a sprint surface. Location: LA.
- Busy week: drop U2 first, then shorten S1. Keep L1, L2, and J1.

---

## Preferences

- Fixed exercise menu for a block. Progress the load, not the exercise list.
- One focus per session.
- RPE 6–8 on most work. No grinders except test weeks. Wave rule: every rep at RPE ≤8.5 means +5 lb the next time that rep range comes up.
- Propose a change. Don't apply it silently. Especially for pain.
- PR tracking is the motivation lever. Show the last load on that rep range.
- Logging is Supabase (`workouts`, `workout_exercises`, `exercise_sets`, `daily_metrics`), through the Supabase MCP connector. Exercise names have to match `exercises.name`.
- Morning prescription comes from `training/active/current-week.md`.

---

## History and patterns

### What has worked

- **Train Heroic:** seeing the last PR and trying to beat it.
- **Simple programs, one focus a day.** Consistency went up when complexity went down.
- **Tracking.** Progress comes from a logged target, not gut feel.

### What has not worked

- Complex, long programs. The early coach plan (upper and lower in the same day, high volume, new exercises) fell off.
- No tracking tool, or tools that die and take the history with them.
- Neglecting nutrition.
- Fitting in goals that are off the main path, as dedicated sessions.
- Going too light, or never questioning a plan.
- **Falling off for 2–3 weeks when things get complicated.** That is the biggest risk.

### What he says success takes

- Time at the gym, consistently.
- Daily mobility, consistently. (That is the warm-up, not a separate split goal.)
- Metrics and workouts that push adaptation.
- Nutrition and sleep.
- Changing the workout when the situation changes.

---

## Training history

- About 1.5+ years toward the dunk, as of arc start.
- Coach James: first program was too complex, then simplified.
- Train Heroic for PR tracking (access later lost).
- Nanobot for Q&A (went down; history lost).
- Prior arcs: LA Winter (Dec–Mar, Olympic + basketball), LA Summer + Fall (Jul–Nov, Olympic + strength).
- Fell off for about 3 weeks in April 2026. This arc started 2026-05-03.
- 2026-10-11: goals cut to the three above. BJJ stopped. Side split no longer tracked. W21–W24 Strength block written.
- 2026-11-02: in W24, the last week of that block.

---

## What the agent does with this profile

1. Read it before changing a prescription. Check the pain guard before overhead or front-rack work.
2. Watch for the fall-off pattern. Two missed sessions in a row gets flagged.
3. On a primary lift, show the last load for that rep range.
4. Don't add exercises to get under a feeling of "more work." Six is the cap. Complexity is the documented failure mode.
5. Don't put BJJ or a side-split session back on the week. Those are in the archive, not the plan.
