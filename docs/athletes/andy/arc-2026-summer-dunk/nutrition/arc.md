# Nutrition Plan — Andy Lee, Summer 2026 Dunk Arc

**Window:** 2026-05-03 → 2026-09-05 (18 weeks, 3 blocks × 6 weeks)
**Companion to:** `training/arc.md` (the training plan this nutrition plan serves)
**OS reference:** [`docs/athletes/andy/nutrition.md`](../../nutrition.md) — cross-arc menu, prep template, supply doctrine
**Athlete snapshot:** see [`profile.md`](../profile.md) for body comp, training pattern, history, failure modes

---

## Purpose

Lose weight to multiply force, without losing the force. The cut is the runway, not the flight — bw drops B1+B2 while reactive gains land; B3 holds the lighter, stronger body through peak.

---

## Goals

| # | Goal | Measure | Deadline |
|---|---|---|---|
| **G1** | Hit the bw curve | 192 → 188 → 185 → 184.5 lb (7-day rolling avg) | Wk 18 |
| **G2** | Don't lose strength | Squat ≥360 lb, bench peaks 260, pull-up +80×8 | Wk 18 |
| **G3** | Hit protein floor daily | ≥190g protein, 5+ days/week | weekly |
| **G4** | Adhere to the cut | 80% of meals from menu/supply, in-budget on kcal | weekly |

---

## Strategy

Three principles. The numbers in **Block Sequence** are downstream of these.

**1. Cut B1+B2, maintain B3.** A −300 kcal/day deficit through Blocks 1 and 2 drops bw while reactive gains land. Block 3 is peak — per VJ §9, cutting during peak compromises force production, so we eat at maintenance for 6 weeks and let the peak realize against a lighter, stronger body. Maintenance is recalibrated to **2700 kcal** based on Andy's felt experience (formula TDEE of 3000 overshoots actual maintenance — common for athletes with low NEAT outside training).

**2. Protein floor protects strength.** **190g/day target. Acceptable range: 170-200g/day.** ~1.0g per lb bodyweight, with ±10% headroom. Lower end of the muscle-preservation research range (1.0-1.2g/lb per Helms et al.). The range gives flexibility — overshooting modestly is fine if kcal target holds; undershooting to 170g on a busy day is still protective. Don't engineer to overshoot 200g (no marginal muscle benefit; eats into carb/fat budget). Layer-1 supplements (Fairlife + Greek yogurt + whey) plus Sunday-prepped protein make hitting the range trivial.

**3. Cooking ramp matches the failure mode.** Andy's documented failure mode is "falling off for 2-3 weeks when things get complicated." So the cooking pattern starts minimal in B1 (one Sunday batch + leftovers) and ramps positively across blocks. The Recipe of the Week lane (athlete-chosen, separate from the standing menu) builds cooking reps without overwhelming the daily default.

---

## Block Sequence (Phase by Block)

| Block | Weeks | Kcal phase | Daily target | Cooking pattern |
|---|---|---|---|---|
| **B1** Power Conversion + Upper Build | 1–6 | −300 deficit | ~2400 kcal | 1 batch/week (Sunday only) |
| **B2** Reactive + Dunk Window | 7–12 | −300 deficit | ~2400 kcal | 2 batches/week (Sun + Wed) |
| **B3** Peak + Realize + Test | 13–18 | Maintenance | ~2700 kcal | 3-4 cook sessions/week |

*Maintenance baseline: 2700 kcal/day (recalibrated). Adjust if 7-day bw rolling avg drifts off the curve below.*

### Bodyweight curve (G1 multiplier)

| Checkpoint | Target bw | Method |
|---|---|---|
| Wk 0 (baseline) | ~192 lb | 7-day morning avg |
| Wk 6 (end B1) | ~188 lb | 7-day morning avg |
| Wk 12 (end B2) | ~185 lb | 7-day morning avg |
| Wk 18 (end B3) | 184–186 lb (held) | 7-day morning avg |

### Macro split at 2400 kcal cut + 190g protein

190g protein (32%) + ~75g fat (28%) + ~240g carbs (40%) — athlete-friendly distribution that protects strength and fuels training. Protein range tolerance: 170-200g/day (±10% of 190g target). Don't engineer to overshoot 200g — protein synthesis caps at ~50g/meal so excess protein doesn't add muscle, and that kcal budget is better spent on carbs to fuel training quality.

---

## Weekly Structure (Operating Model)

The system is **passive in-week, active at supply touchpoints.** Two recurring touches; nothing else.

### Saturday morning — Costco order surface
The `plan-weekly-meals` skill pulls the upcoming week's calendar (home/travel/social meal slots), reads the active block's cooking pattern + Recipe of the Week, computes the order delta, and writes the week file to `nutrition/weeks/2026-nutrition-W{NN}.md`. Athlete approves, edits, or places.

### Post-workout — bodyweight log
Training days only. After the last reported set, agent asks **"bw?"** — captures the number and writes to Supabase `daily_metrics.bodyweight_lb` for today's date. No badgering if missed; log next time. Rest days = silent.

### What the agent does NOT do
- No daily kcal/protein nudges, no meal logging, no gram-counting (use MacroFactor if Andy wants that)
- No mid-week reminders about social/travel events (handled at Saturday order time)
- No prep reminders (Andy owns the Sunday prep ritual)
- No meal prescription day-of (Andy picks from the supply that's in the fridge)

### Adherence model
Design for 80% on-plan, don't measure it. Supply orchestrator sizes the order so on-plan is the default. Bw drift is the only adherence signal we read.

---

## Testing / Calibration

The 2400 kcal cut target is a hypothesis. Validate it twice per arc by running 2 weeks at the cut target and observing 7-day bw rolling avg.

| Bw response over 2 weeks | What it means | Action |
|---|---|---|
| Drops 0.5–0.8 lb/wk | Maintenance ≈ 2700, deficit ≈ 300 — on plan | Hold at 2400 |
| Drops > 1.0 lb/wk | Maintenance lower than 2700, OR under-eating | Raise to 2500–2600 |
| Drops 0.0–0.3 lb/wk | Maintenance lower than 2700 (closer to 2500) | Drop to 2300 |
| Flat or rising | Maintenance well below 2700 | Drop to 2200 + audit intake honesty |

**Calibration moments:**
- **Wk 2 (≈ 2026-05-23):** first calibration check after 2 weeks at 2400 kcal
- **Wk 8 (≈ 2026-07-04):** post-deload check; adaptive thermogenesis can shift true maintenance ~100 kcal lower over a long cut

---

## Constraints

Non-negotiable rules:

| Constraint | Why |
|---|---|
| **Protein floor: 190g/day** | Strength preservation during cut. If protein drops, muscle drops, lifts regress. |
| **No cut in B3** | Per VJ §9 — cutting compromises force production during peak. |
| **Squat top set drops > 5% in a week** | Halve the kcal deficit until lift recovers. |
| **Squat top set drops > 8% in a week** | Pause the cut entirely; eat at maintenance until squat returns. |
| **Patellar pain ≥ 3/10** | NOT a nutrition signal — see training arc.md guardrails. |
| **Bw not moving for 2 weeks during cut** | Increase deficit by 100 kcal **OR** add 1 conditioning session. Never crash diet. |

---

## Failure Mode Guardrails

What to do when reality diverges. The Saturday review surfaces these via diagnostic.

### Bw drifts above curve (cut not working)
Diagnostic: **supply gap, prep gap, or behavior gap?**
- **Supply gap:** Sunday delivery + prep didn't happen → fix this week's order
- **Behavior gap:** more off-plan meals than calendar showed → log calendar more accurately
- **Phase wrong:** deficit too small for current TEF → propose raising deficit per Calibration table

### Bw drifts below curve (cutting too fast)
Check squat top set. If holding → fine, accept faster loss. If dropping >5% → halve deficit per Constraints.

### Bw flat 2+ weeks during cut
Per Constraints: +100 kcal deficit OR +1 conditioning session. Never crash diet.

### Athlete falls off > 3 days
Reset = next Saturday order + next Sunday prep. Single-decision recovery. Don't try to "make up" missed days.

### Saturday review missed
Standing-list defaults to last week's order; the ritual just confirms, it doesn't compose from scratch.

---

## References

- **Cross-arc OS:** [`docs/athletes/andy/nutrition.md`](../../nutrition.md) — menu, Costco standing list, Sunday prep template, fallback restaurants, Recipe of the Week
- **Cross-arc menu:** [`docs/athletes/andy/menu.md`](../../menu.md) — 45-meal vocabulary with macros, caps, Costco staples
- **Athlete profile:** [`profile.md`](../profile.md) — body, lifts, injuries, history, failure modes
- **Training plan this serves:** [`training/arc.md`](../training/arc.md), [`training/blocks/`](../training/blocks/), [`training/active/current-week.md`](../training/active/current-week.md)
- **Block-specific nutrition:** [`blocks/`](blocks/) — per-block kcal target, cooking pattern, standing recipes, calibration moments
- **Source guides:** `styles/vertical-jump-guide.md` §9 (peak ≠ deficit), §13 (cut/strength interaction); Helms et al. (cut protein floor research)
- **Bw history:** Supabase `daily_metrics.bodyweight_lb` — 7-day rolling avg drives drift detection
