---
name: plan-weekly-meals
description: "Generate the weekly meal plan + grocery list for an athlete's active arc. Writes a markdown file at `<arc>/nutrition/weeks/2026-nutrition-W{NN}.md` and refreshes `<arc>/nutrition/active/current-week.md`. Section headers aligned to the training week file format. Trigger when: it's Saturday morning, athlete asks 'what should I eat this week?', athlete asks for the weekly meal plan or grocery list, or athlete asks how they're doing on the cut."
---

# plan-weekly-meals — Skill Guide

> One artifact, aligned to the training week file shape. Athlete reads it Saturday, approves or edits in chat, file is written to the bundle.

## When to Use

- Saturday morning (cron-triggered or athlete asks)
- Athlete asks "what should I eat this week?" / "what's on the menu?" / "weekly grocery list"
- Athlete asks how the cut is going / "am I on track?"

**Don't use** for daily questions ("what should I eat right now?" — answer from menu directly), or for ad-hoc menu edits.

## Inputs

| Input | Source |
|---|---|
| Today's date | system clock |
| Active arc bundle | default `athletes/andy/arc-2026-summer-dunk/` |
| Per-arc nutrition plan | `<arc>/nutrition/arc.md` |
| Active block file | `<arc>/nutrition/blocks/{matching block}.md` |
| Training week (upcoming) | `<arc>/training/weeks/2026-training-W{NN}.md` |
| Menu library | `athletes/andy/menu.md` |
| Cross-arc OS doc | `athletes/andy/nutrition.md` |
| Bw 7-day rolling avg | Supabase `daily_metrics` (project `vtruwlvekfnmfgaundhp`) |
| Optional: Recipe of the Week URL | athlete-supplied in chat |

## Output (the artifact — aligned to training week file shape)

Write to: `<arc>/nutrition/weeks/2026-nutrition-W{NN}.md`
Then copy to: `<arc>/nutrition/active/current-week.md`

```markdown
# Week 2026-nutrition-W{NN}

## Week Header
- Block: `nutrition/blocks/{matching block file}`
- Block Display: {block name}
- Arc Week: {N} of {total}
- Block Week: {n} of 6
- Date Range: Sun {date} – Sat {date, year}
- Kcal target: ~{N} kcal/day
- Bw target by Sat: {X} lb (7-day rolling avg)
- Cooking pattern: {from block file}

## Goals
- {arc goal G1}
- {block kcal target}
- {bw target this week}
- {protein floor}

## Review (Last Week)
1. Wins: {what landed — bw on curve, kcal hit, recipes worked}
2. Misses: {what didn't — missed bw logs, off-plan meals, kcal slips}
3. Adjustments: {what to carry into this week — drift response, calibration outcome if Wk 2/Wk 8}

## Weekly Overview

| Day | Training | Breakfast | Lunch | Dinner |
|---|---|---|---|---|
| Sun {date} | {workout} | {meal id} | {meal id} | {meal id} **(BATCH)** |
| Mon {date} | ... | ... | ... | ... |
| ... | | | | |

[After Weekly Overview, headers diverge from training. Nutrition-specific:]

## Recipes Cooked This Week

**Recipe 1: {meal id} — {name}** ({batch day})
- Effort: {Q/M/L} (~{N} min)
- Macros per portion: ~{P}g P / {C}g C / {F}g F / {Kcal} kcal
- Make: {N} portions — covers {slots}
- Why: {fueling rationale for this week's training shape}

(Recipe 2 if needed)

## Daily Snacks + Post-Training
- **Snacks rotation:** S1 biltong + S4 Fairlife + S6 Greek yogurt daily; add S3/S5 on heavier days
- **Post-training (training days only):** 1 banana + 1 scoop whey within 30 min of last set

## Grocery List

### Add this week
| Category | Item | Qty | Why |
|---|---|---|---|
| Protein | ... | ... | ... |
| Carbs | ... | ... | ... |
| Veg | ... | ... | ... |
| Fats | ... | ... | ... |
| Pantry | ... | ... | ... |

### Skip / already stocked
{items not needed this week}

## Notes
{travel days, social meals, treat nights, agent flags from drift section, calendar quirks}

## End-of-Week Review (filled Sun)
1. Wins: {filled by athlete — what landed}
2. Misses: {filled — kcal hit/partial/missed; protein hit/partial/missed; bw delta}
3. Adjustments: {filled — what to change for next week}
```

## Steps

### Step 1 — Read inputs (parallel where possible)

- `<arc>/nutrition/arc.md` → cross-block strategy
- `<arc>/nutrition/blocks/{matching block}.md` → cooking pattern, standing recipes, calibration moments for THIS block
- `<arc>/training/weeks/2026-training-W{NN}.md` → identify training day shapes (heavy power = Thu, jump = Sat, rest = Wed, etc.)
- `athletes/andy/menu.md` → all meals with attributes
- `athletes/andy/nutrition.md` → Layer 1 baseline + always-stocked items
- Calendar via Google Calendar MCP for upcoming Sun–Sat
- Supabase: `select avg(bodyweight_lb) as rolling_avg, count(*) as n from daily_metrics where date >= current_date - interval '7 days' and bodyweight_lb is not null;`

### Step 2 — Week Header

Pull metadata from arc.md + block file: block, arc week, block week, date range, kcal target, bw target (interpolate curve), cooking pattern.

### Step 3 — Goals

Distill arc goal G1 + block kcal target + bw target this week + protein floor. 4 short bullets.

### Step 4 — Review (Last Week)

Compute bw delta (rolling_avg − target). Categorize as Wins / Misses / Adjustments:

- **Wins:** bw on track, kcal floor hit, recipes worked, training fueling matched
- **Misses:** drift status (drifted high / drifted low / flat / insufficient data), off-plan meals, missed bw logs
- **Adjustments:** what to carry into this week — calibration outcome if Wk 2/Wk 8 (compare 14-day loss rate to expected, propose target adjustment per arc.md §4.1a-style table); drift response

If insufficient bw data: note that and remind to log post-workout.

### Step 5 — Weekly Overview (the schedule)

Walk Sun → Sat. For each day:
- **Breakfast:** rotate B1/B5/B6 by training intensity (heavier = B5 with carbs; lighter = B1)
- **Lunch:** prefer L8 (leftover from previous dinner) when applicable; else L1/L6 (rotisserie chicken-based) or L3 (cottage cheese for rest day)
- **Dinner:** the picked recipe(s) + leftovers, respecting the block's cooking pattern. Sun = batch day. Wed = optional second batch in B2+

Subtract slots covered by calendar travel/social events; flag those in the table as "TRAVEL" or "SOCIAL — eat out."

### Step 6 — Recipes Cooked This Week

Pick 1-2 recipes from menu based on block's cooking pattern + this week's training shape:

- **B1 cooking pattern (1 batch/wk):** pick 1 recipe to batch on Sunday (heavy carb if possible). Maybe a second batch Wed evening if motivated.
- **B2 (2 batches/wk):** pick 2 recipes — Sunday + Wednesday batches. Variety expands.
- **B3 (3-4 cook sessions):** pick 3-4 recipes spread across the week.

For each picked recipe: meal id, name, effort, macros per portion, # portions to make (cover dinners + leftover lunches), fueling-fit rationale.

If athlete provided a Recipe of the Week URL: WebFetch + extract ingredients, render as additional "Recipe of the Week" entry, slot into one Sat dinner.

### Step 7 — Daily Snacks + Post-Training

Standard rotation block. Pull from athlete's standard pattern (S1/S4/S6 daily + S3/S5 on heavy days). Post-training: 1 banana + 1 scoop whey on training days.

### Step 8 — Grocery List

For each picked recipe (and Recipe of the Week if any), pull ingredients from menu's per-meal staples + Costco shopping list section. Sum across portions made. Add Layer 1 always-stocked.

Group by category: Protein / Carbs / Veg / Fats / Pantry. Note "skip / already stocked" items.

### Step 9 — Notes

Surface anomalies: travel days, social meals from calendar, treat nights (e.g., recurring Friday In-N-Out), agent flags from drift section.

### Step 10 — End-of-Week Review template

Leave Wins / Misses / Adjustments blank for athlete to fill in Sunday.

### Step 11 — Write the file + refresh active

Write the artifact to `<arc>/nutrition/weeks/2026-nutrition-W{NN}.md`. Then copy the same content to `<arc>/nutrition/active/current-week.md` (the agent's hot path).

If a new block has started this week (e.g., transitioning W6→W7 means B1→B2), also copy the new block file to `<arc>/nutrition/active/current-block.md`.

Render the artifact to chat too so the athlete can approve / edit / place the order.

## Variables / parameters

| Variable | Value (for active arc) |
|---|---|
| `<arc>` path | `athletes/andy/arc-2026-summer-dunk/` |
| Athlete | Andy Lee |
| Supabase project_id | `vtruwlvekfnmfgaundhp` |
| Calendar account | (default Google Calendar via MCP) |

When a second athlete onboards, parameterize by athlete dir + arc dir.

## Edge cases

- **Insufficient bw data:** Review section says so; rest of artifact still renders.
- **Calendar empty:** assume all 7 days home; flag in Notes.
- **Cook pattern allows only 1 recipe but week has heavy + light days:** pick one heavy-carb recipe, supplement Wed with rotisserie chicken assembly + L3.
- **Recipe URL fails to parse:** ask athlete to paste ingredients directly.
- **Treat night (Fri = In-N-Out etc.):** if calendar event flagged, skip dinner allocation for that day, treat as maintenance day kcal-wise.
- **Block boundary week:** if upcoming week starts a new block, refresh `active/current-block.md` too.

## Side effects

- Writes `<arc>/nutrition/weeks/2026-nutrition-W{NN}.md`
- Writes (overwrites) `<arc>/nutrition/active/current-week.md`
- Writes (overwrites) `<arc>/nutrition/active/current-block.md` if block boundary crossed
- No DB writes in v0 (in v1+: write `weekly_orders` Supabase row for history)

## See also

- `<arc>/nutrition/arc.md` — strategy + targets
- `<arc>/nutrition/blocks/{block}.md` — block-specific cooking pattern + recipes
- `athletes/andy/menu.md` — meal vocabulary
- `athletes/andy/nutrition.md` — Layer 1 + standing list
- `<arc>/training/weeks/` — training shape input
