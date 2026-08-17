---
name: dnt-overview
description: Output the day's coach DNT Olympic lifts (coach-sourced Oly lifts only, not own work/mobility/accessories) in the athlete's canonical format — Exercise / set x rep / weight (kg & lbs). Trigger when the athlete says "DNT overview", "give me the DNT overview", "coach lifts today", "the DNT lifts", "olympic overview", or asks what Olympic lifts they have today/this week.
argument-hint: [optional: day e.g. "Thu" or "today"] [optional: week e.g. "W13"]
allowed-tools: Read Bash Grep
---

# DNT Overview

Produce a clean list of the **coach's DNT Olympic lifts** for a given day, in Andy's preferred format. This is a read-and-format skill — no plan edits.

## What "DNT overview" means

The athlete wants **only the coach Olympic lifts** for the day — the rows sourced `coach` in that day's week-file table. **Exclude** own strength work, mobility legs, jump/dunk, and coach *accessories* (flyes, dips, good morning, etc.) unless explicitly asked to include them.

## Output format (exact)

One block per lift, in the day's order:

```
Exercise
- set x rep
- weight (kg/lbs)
```

- **Both kg and lbs** on the weight line (1 kg = 2.20462 lb; round sensibly).
- If the load is a coach **%** with only an lb estimate, show `% + est. lb/kg` and flag that the true max is pending.
- If the day has **no coach Oly** (Sun/Mon own days, Wed BJJ-only, or a deload day with none), say so in one line.

## Procedure

1. **Resolve day + week.** Default to **today** (`date "+%A"` + `date "+%Y-%m-%d"`). Map today's date to the arc week file. The active week is `docs/athletes/<athlete>/<arc>/training/active/current-week.md`; the full set is in `training/weeks/2026-training-W<NN>.md`. Athlete/arc default: `andy` / `arc-2026-summer-dunk` (confirm from repo `CLAUDE.md`).
2. **Read that day's section** from the week file. Find the day's table.
3. **Filter to `coach` source rows** whose lift is an Olympic lift (snatch/clean/jerk/pull families) — not `coach acc` rows.
4. **Format** each into the block above. Convert loads to kg + lbs. Preserve the `%` note when present.
5. **Print** the blocks. If asked for the whole week, repeat per Oly day (Tue/Thu/Fri/Sat).

## Example

Athlete asks "DNT overview" on a W13 Thursday →

```
Hang Power Clean
- 5 x 2
- 68 kg / 150 lb (85%, est.)

Power Clean & Jerk
- 5 x 2
- 68 kg / 150 lb (85%, est.)
```

On a W13 Tuesday (deload, no snatch) → "No coach DNT Olympic lift today — it's a deload week with no snatch. Tuesday is mobility legs only."

## Notes

- Loads for pure Oly lifts are often coach **%** anchored to recent training tops (the athlete trains them submaximally), so they're estimates — flag that and firm up when true 1RMs are provided.
- This skill never edits the plan. To fold a new coach program in, use `integrate-dnt-workout`.
