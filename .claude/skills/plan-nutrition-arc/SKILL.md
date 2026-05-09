---
name: plan-nutrition-arc
description: Generate the per-arc nutrition cascade — arc.md (strategy + cross-block) plus blocks/*.md (one per training block). Operationalizes a chosen nutrition methodology against a specific athlete and training arc. Section headers aligned to the training cascade so an athlete can read either side and know what to expect from the other. Trigger when starting a new arc, when the training plan has changed materially, or when the athlete asks "what's the nutrition plan for this arc?"
argument-hint: [athlete-name] [arc-slug]
allowed-tools: Read Write Edit Glob Grep Bash
---

# Generate Nutrition Arc

Produces the **per-arc nutrition cascade** for an athlete:

| File | Cadence | Hand-written or generated |
|---|---|---|
| `athletes/<name>/<arc-slug>/nutrition/arc.md` | once per arc | this skill writes it (you review + edit) |
| `athletes/<name>/<arc-slug>/nutrition/blocks/{N}-{block-name}.md` × 3 | once per arc | this skill writes them (you review + edit) |
| `athletes/<name>/<arc-slug>/nutrition/weeks/2026-Nut-W{NN}.md` | weekly | NOT this skill — `plan-weekly-meals` writes these |
| `athletes/<name>/<arc-slug>/nutrition/active/*.md` | weekly rollover | NOT this skill — copies refreshed by `plan-weekly-meals` |

The output mirrors the worked example at [`athletes/andy/arc-2026-summer-dunk/nutrition/`](../../../athletes/andy/arc-2026-summer-dunk/nutrition/).

## When to use

- New arc starting — generate the full nutrition cascade alongside the training cascade
- Training arc was rewritten — nutrition needs to follow
- Mid-arc nutrition strategy is being revised (e.g., kcal target recalibrated, cooking pattern shifted)

## Required inputs

Resolve from the athlete bundle. If any are missing, ask the user.

1. **Athlete profile** — `athletes/<name>/<arc-slug>/profile.md` (preferred, arc-snapshot) OR `athletes/<name>/profile.md`. Need: bodyweight, body fat, training pattern, failure modes, cooking ability.
2. **Training arc** — `athletes/<name>/<arc-slug>/training/arc.md`. Need: blocks, durations, peak block, hard constraints (e.g., "no cut in B3").
3. **Cross-arc nutrition OS** — `athletes/<name>/nutrition.md`. Need: Layer 1 supplement floor, fallback menu, prep ritual.
4. **Cross-arc menu** — `athletes/<name>/menu.md`. Need: meal vocabulary + cook tier definitions to choose the cooking pattern from.
5. **Nutrition style guide** — `docs/nutrition-styles/<style>/guide.md`. Default: renaissance-diet (RD). Need: phase model, protein floor recommendation range, refeed cadence, adjustment rules.

## Workflow

### Phase 1: Ingest & align

Read all 5 inputs. State back to the user:

- Arc duration (start → end, weeks, blocks × weeks)
- Goals nutrition serves (which arc goals require nutrition support; which don't)
- Style methodology + protein floor recommendation
- Bodyweight delta (start → end, total lbs to lose / hold / gain)
- Hard constraints from training arc (e.g., "B3 = no cut, maintenance during peak")
- Athlete failure mode (cooking comfort, cadence reliability, history of falling off)

**Checkpoint:** "Inputs look correct? Anything I'm missing before I draft the cascade?"

### Phase 2: Choose phase strategy

Decide the phase per block. Key rules:

| Training intent | Default phase |
|---|---|
| Strength / hypertrophy / volume build | Cut OR maintenance |
| Power / speed conversion | Maintenance preferred |
| **Peaking / realization / testing** | **Maintenance — never cut during peak** |
| Recovery / deload | Maintenance |
| Off-season build | Maintenance or small surplus |

Honor hard constraints. Match phase boundaries to block boundaries. Insert refeed weeks per style guide (RD: 1 refeed week every 8 weeks of cumulative cutting).

### Phase 3: Set the bodyweight curve

Linear interpolation, anchored at block boundaries:
- Cut blocks: 0.5–1.0% bw/wk
- Maintenance: ±1.25% range, no directional change
- Build: 0.25–0.5% bw/wk

### Phase 4: Set the protein floor

Compute from athlete bw × style range. RD default: 1.0 g/lb during cuts. Round to a clean number. State macro split at cut target.

### Phase 5: Set the cooking pattern per block

Pick a positive description (not a "ceiling") of what cooking actually happens this block:

| Athlete cooking comfort | Block 1 | Block 2 | Block 3 |
|---|---|---|---|
| Doesn't cook routinely | **1 batch/week** (Sunday only) | **2 batches/week** (Sun + Wed) | **3-4 cook sessions/week** + occasional plated |
| Cooks but inconsistently | **2 batches/week** | **3 batches/week** | Daily light cook + 2 plated |
| Cooks regularly | Daily light cook + 2 plated | Daily light cook + 3 plated | Open menu |

Cooking pattern is a 1-line description; full elaboration goes in the block file's Strategy section.

### Phase 6: Define exception rules

Pull from the training arc's failure-mode guardrails. Common rules:
- Lift drop trigger
- Bw stall trigger
- Pain flare trigger
- Sleep degradation trigger

These go in arc.md under **Constraints** + **Failure Mode Guardrails** (mirrors training arc structure).

### Phase 7: Write `arc.md`

Generate `athletes/<name>/<arc-slug>/nutrition/arc.md` using **aligned headers** (matches training arc.md):

```markdown
# Nutrition Plan — {Athlete}, {Arc Name}

**Window:** {start} → {end} ({N} weeks, {M} blocks × {W} weeks)
**Companion to:** `training/arc.md`
**OS reference:** `athletes/<name>/nutrition.md` (cross-arc menu, prep template, supply doctrine)

## Purpose
{1-2 sentence mission — what nutrition is solving for this arc}

## Goals
- Bw curve: {Wk 0} → {Wk 6} → {Wk 12} → {Wk 18}
- Kcal target: {phase per block}
- Protein floor: ≥{N}g/day ({g/lb})
- Adherence: {target}%

## Strategy
{narrative — why these targets, why the cooking ramp, why the protein floor logic; the WHY behind the numbers}

## Block Sequence (Phase by Block)
| Block | Weeks | Kcal phase | Daily target | Cooking Pattern |
|---|---|---|---|---|
| B1 ... | ... | ... | ... | ... |

## Weekly Structure (Operating Model)
{Saturday Costco surface + post-workout bw — the two recurring touchpoints}

## Testing / Calibration
{Wk 2 + Wk 8 (or whatever) calibration moments — links to §4.1a-style table for adjusting target based on bw response}

## Constraints
{non-negotiable rules — protein floor, no cut in B3, exception thresholds}

## Failure Mode Guardrails
{what to do when bw drifts, supply gaps, behavior gaps, kcal slips}

## References
- `athletes/<name>/nutrition.md` — cross-arc OS doc
- `athletes/<name>/menu.md` — meal vocabulary
- `<arc>/profile.md` — athlete snapshot
- `<arc>/training/arc.md` — training plan this serves
- Style guide §s
- Supabase `daily_metrics` — bw history
```

**Do NOT include an "Athlete Snapshot" section.** Identity + body composition + training pattern are already in `profile.md`. Reference profile.md instead.

### Phase 8: Write each `blocks/{N}-{block-name}.md` file

For each training block, generate `athletes/<name>/<arc-slug>/nutrition/blocks/{date}-block-{NN}-{slug}.md`. Match the training block file's date + slug naming.

Use **aligned headers** (matches training block file shape through `Weekly Structure`, then nutrition-specific):

```markdown
# Block {N} — {Block Name} (Nutrition)

## Header
- Block: B{N} of {total} — {Block Name}
- Weeks: W{a}–W{b} ({date range})
- Pairs with: `training/blocks/{matching training block file}`
- Kcal phase: {−300 deficit | maintenance | +200 surplus}

## Purpose
{1-2 sentences on what this block's nutrition is solving for}

## Goals
- Bw at end of block: ~{X} lb (per arc.md curve)
- Kcal target: {N} kcal/day
- Protein floor: ≥{N}g/day
- Adherence target: {%}% on-plan

## Strategy
{1-paragraph narrative — why this block's targets, why the cooking pattern fits the training intensity, what's emphasized}

## Weekly Structure
**Cooking pattern:** {1 batch/week | 2 batches/week | 3-4 cook sessions/week}

{1-paragraph practical description: when cooking happens this block, how meals fill the rest of the week}

[After Weekly Structure, the headers diverge from training. Nutrition-specific:]

## Standing Recipes (most-likely picks this block)
{3-5 menu items the orchestrator tends to pick given the cooking pattern + cook ramp tier — from `menu.md`}

## Heavy/Light Day Fueling
- Heavy days ({list}): {what to do — heavier carb dinner; banana + whey post-training}
- Light days ({list}): {leftovers, lighter assembly}
- Post-training: {block-specific guidance}

## Calibration Moments
{when calibration checks fire within this block — Wk N test for what}

## Transition (B2, B3 only — what changes from previous block)
{1-2 sentences on what shifts}

## See also
- `nutrition/arc.md` for cross-block strategy
- `athletes/<name>/menu.md` for meal vocabulary
- `training/blocks/{matching training file}` for the training side
```

### Phase 9: Verify the bundle reference

Read the bundle's `CLAUDE.md`. Confirm the nutrition reading map points to the new files (arc.md + block files). If the CLAUDE.md references sections that don't exist in the new files, surface this as a TODO.

## Constraints

- **Use aligned section headers** through `Weekly Structure` so training and nutrition cascades feel like siblings.
- **Don't include Athlete Snapshot in nutrition arc.md.** That's `profile.md`'s job.
- **Cooking Pattern, not Cook Ceiling.** Positive framing — describe what cooking happens, not what's forbidden.
- **Never override hard constraints from training arc.** "B3 = no cut" means B3 = no cut.
- **Never invent macro recommendations.** Pull from the style guide. If silent, surface as a question.
- **Calibration paragraph is mandatory.** Maintenance kcal estimates overshoot most athletes by ~200–300 kcal.
- **Don't redefine the menu or supply system.** Those live in the cross-arc OS doc; arc.md only references.
- **Match the training arc's vocabulary** (B1/B2/B3, block names).

## Output

Files written:
- `athletes/<name>/<arc-slug>/nutrition/arc.md` (~100-150 lines)
- `athletes/<name>/<arc-slug>/nutrition/blocks/{NN}-{slug}.md` × 3 (~50-80 lines each)

After writing, summarize:
- Phase pattern decided (e.g., "B1 cut, B2 cut + refeed Wk 8, B3 maintenance")
- Total bodyweight delta + final target
- Cooking pattern per block
- Any hard constraints inherited from the training arc that shaped the plan
- Open TODOs (CLAUDE.md inconsistencies, missing inputs, etc.)
