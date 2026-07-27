---
name: integrate-dnt-workout
description: Process a freshly-dropped DNT coach Olympic-lifting program (a PDF on the Desktop/Downloads) and fold it into the athlete's active arc by re-homing each coach Oly lift onto the matching day of the fixed split, ~2/day, with overflow to the free day and coach accessories as a reference menu. Trigger when the user says "new DNT program dropped", "integrate the coach program", "process the DNT drop", "the olympic program just dropped", "fold in coach's lifts", or adds a `*program*.pdf` and asks to update the current weeks. Fires every ~2 weeks (DNT cadence).
argument-hint: [optional: path to the program PDF] [optional: athlete-name] [optional: arc-slug]
allowed-tools: Read Write Edit Glob Grep Bash
---

# Integrate DNT Workout

Folds a coach's DNT Olympic-lifting program into the athlete's active arc **without changing the athlete's split**. The coach program does NOT become extra training days — its Olympic lifts dissolve *into* the existing days by movement pattern. Bolting the coach's 3 days on top of the week is the **Block-1 failure mode** and is explicitly forbidden.

This skill encodes the methodology that otherwise lives in `<bundle>/training/arc.md` ("DNT Integration Model") and the bundle `CLAUDE.md`. Keep them in sync if the model changes.

## When to use

- A new `*program*.pdf` (coach's DNT block) lands in `~/Downloads` or `~/Desktop`, ~every 2 weeks.
- The user says any trigger phrase above.

## Core rules (DO NOT deviate)

1. **The athlete's split is fixed.** Default shape (read the active week file to confirm): Sun **Lower** · Mon **Upper** · Tue **Lower/Speed** · Wed **flex** · Thu **Free Oly** · Fri **rest** · Sat **Jump**.
2. **Take the top ~2 Olympic lifts per coach day** (the heavy barbell movements, not the accessories).
3. **Re-home each by MOVEMENT PATTERN, not by coach's day number:**

   | Coach lift pattern | Re-homes to |
   |---|---|
   | back/front/overhead squat | **Sun (Lower)** |
   | clean deadlift / clean pull / snatch deadlift / snatch pull / high pull / panda pull | **Sun (Lower)** (or Tue if Sun full) |
   | snatch (power/muscle/full), snatch complexes, explosive pulls | **Tue (Lower/Speed)** |
   | jerk (rack/split), push press, jerk dip, overhead press | **Mon (Upper)** |
   | clean & jerk (combined) | jerk-home = **Mon**; if Mon full → **Thu (Free)** |

4. **~2 Oly lifts per lift day.** Anything beyond that **overflows to Thu (Free Oly)**. Never exceed the budget on a single day.
5. **Duplicate-lift swap:** when a coach lift duplicates the athlete's own (coach back squat vs. athlete back squat; coach snatch vs. athlete hang snatch), the **coach version replaces the athlete's** so the day stays under the cap.
6. **Coach accessories = a reference menu**, listed under `📋 Coach accessories (reference)`, never counted in the 6. The athlete picks coach's accessory or their own each day.
7. **6 exercises/session hard cap.** Coach Oly lifts go in first, then the athlete's own primaries fill the rest. Complexity is the athlete's #1 failure mode — never breach the cap.
8. **No coach lift on Fri/Sat** (rest + jump). **No heavy lower <48h before Sat jump** — the squat/pull homes (Sun/Tue) already respect this; if a re-home would land heavy lower on Thu, keep it light or push earlier.
9. **No-match lifts:** if a coach lift matches no pattern day, send it to the closest day; if still no fit under the cap, drop it to the reference menu and **log that it was dropped** (never silently cram).

## Procedure

### 1. Locate + read the program
- If a path was given in `$ARGUMENTS`, use it. Else find the newest match:
  `ls -t ~/Downloads/*program*.pdf ~/Downloads/*DNT*.pdf ~/Desktop/*program*.pdf ~/Desktop/*DNT*.pdf 2>/dev/null | head`
- Read the PDF. Coach's labeling is often messy (duplicate "Day1" starting week 2; a stray "Day5" meaning week-2 Day3). Normalize into **2 weeks × 3 days**, top ~2 Oly lifts + accessories per day.

### 2. Resolve athlete + active arc
- Default athlete: **andy**; active arc from `CLAUDE.md` (currently `arc-2026-summer-dunk`). Confirm the bundle path `docs/athletes/<name>/<arc-slug>/`.

### 3. Compute the sync (which arc weeks)
- **The DNT program runs 2 weeks behind the arc.** Anchor: DNT wk6 = arc W08. So **DNT wk N = arc W(N+2)**. A wk7–8 drop → arc **W09 + W10**. State the mapping explicitly before writing.

### 4. Re-home (per the Core Rules table)
- Assign each week's top ~2 Oly lifts to Sun/Mon/Tue by pattern; overflow → Thu. Apply duplicate-lift swaps. Keep ≤6/day.

### 5. Convert loads
- Coach loads are **percentages**. If the athlete's maxes are on hand (ask, or read from `profile.md` / Supabase if stored), convert % → lb and show both. If a max is missing, **keep the % and ask for it** — do not invent a number.

### 6. Write into the target week files
- Edit `<bundle>/training/weeks/2026-training-W<NN>.md` for each target week:
  - Fill the `🏋️ Coach Oly lifts (FIXED — re-homed: …)` block on Sun/Mon/Tue (and Thu if overflow).
  - Fill `📋 Coach accessories (reference)`.
  - Apply duplicate swaps in `💪 Your full workout` (drop the now-covered lift, note "covered by coach").
  - Update the `## Source / Sync` block (PDF filename, which DNT week, % vs lb status) and the `## 7-Day Overview` day labels.
  - Update the Wed "Canary" line to reference the actual re-homed Oly top sets.
- **If a target week is the current week**, also sync the hot-path snapshot `<bundle>/training/active/current-week.md` to match.

### 7. Report
- Show the per-week re-homing table, the sync mapping, anything that overflowed or got dropped to the reference menu, and any missing maxes still needed for % → lb. Note the files written. Leave commits to the user unless asked.

## Worked example (DNT wk7–8 → W09–W10, processed 2026-06-28)

`2andy program7--8.pdf`, 2 weeks × 3 days. Week 1 labeled "(deload week)"; week 2 heavier.

- **W09 (DNT wk7, deload):** Sun ← Back Squat 85% 5×3 + Clean DL 80% 5×4 · Mon ← Rack Jerk 75% 6×3 + Power Clean&Jerk 80–85% 5×2 · Tue ← Muscle Snatch 80–85% 5×(1+2) + Snatch High Pull 80% 5×4. Accessories (flyes, sots press, bar dip, pull-up, OHS, wrist, good morning, split squat) → reference menu. No overflow.
- **W10 (DNT wk8, heavy):** Sun ← Front Squat 90% 2×2+95% 2×1 + Snatch DL · Mon ← Rack Push Press + Jerk Dip · Tue ← Power Snatch + Panda Pull · **Thu ← Power Clean & Jerk 85–90% 5×(2–1) (overflow).**
- Duplicate swaps: coach squat replaced athlete back squat (Sun); coach snatch replaced athlete hang snatch (Tue).
- Loads kept as **%** pending athlete maxes (back/front squat, jerk, snatch, clean).

## Failure modes to avoid

- ❌ Adding coach's 3 days as extra sessions (the Block-1 collapse).
- ❌ Re-homing by coach's day number instead of movement pattern.
- ❌ Breaching the 6-exercise cap by stacking coach Oly + accessories + own work.
- ❌ Inventing lb numbers when a max is unknown — keep the % and ask.
- ❌ Silently dropping a lift that didn't fit — always log it.
