---
name: progress-review
description: Run a structured progress review at one of three scopes — weekly (Sunday cadence), block (end of 6-week block), or arc (end of arc). Aggregates training data + nutrition data + bundle plan vs actual outcomes, produces a structured review document with decisions / lessons / recommendations. Trigger when the user says "weekly review", "progress review", "review last week", "block review", "review block 1", "review the arc", or "arc retrospective". Also fires naturally on Sunday morning, block boundary, or arc end.
argument-hint: [scope: weekly | block | arc] [athlete-name] [arc-slug] [optional: week-number | block-number]
allowed-tools: Read Write Edit Glob Grep Bash
---

# Progress Review

Produces a structured review document at one of three scopes. Single skill with branching by scope — the signal computation differs per scope, but the framework is shared: aggregate plan + actual data, compute signals, produce decisions / lessons / recommendations, write to a durable review file, surface key outputs in chat.

## When to use

| Scope | Trigger |
|---|---|
| **weekly** | Sunday morning; "weekly review"; "review last week"; checking adherence after a rough week |
| **block** | End of a 6-week block; "review block 1"; "block review"; just before generating the next block's plan |
| **arc** | End of arc (Wk 18 in the worked example); "arc retrospective"; "review the arc"; before generating the next arc |

## Required inputs

### Always required

1. **Scope** — `weekly` | `block` | `arc` (from `$ARGUMENTS`; if missing, ask the user)
2. **Athlete name + arc slug** — locates the bundle at `athletes/<name>/<arc-slug>/`
3. **Bundle files** — must exist:
   - `<bundle>/training/arc.md`
   - `<bundle>/training/blocks/*.md`
   - `<bundle>/training/weeks/*.md`
   - `<bundle>/nutrition/arc.md`
   - `<bundle>/profile.md`

### Scope-specific

| Scope | Additional input |
|---|---|
| weekly | Week number (default: current week from `<bundle>/training/active/current-week.md`) |
| block | Block number (default: most recently completed block) |
| arc | Nothing — the whole arc is the window |

### Data sources

- **Plan side:** the bundle's training + nutrition arc files (the prescription)
- **Execution side:** Supabase tables (`exercise_sets`, `daily_metrics`) — the actual
- **Previous reviews:** `<bundle>/reviews/` — chained context (weekly review N reads N−1 to spot trends; block review reads weekly reviews; arc review reads block reviews)
- **Logs:** `athletes/<name>/logs/*.csv` (if present) — exercise libraries, mobility, supplements

## Workflow

### Phase 1: Resolve scope + locate inputs

Parse `$ARGUMENTS`. Confirm scope, athlete, arc-slug. If scope is `weekly` and no week number given, read `<bundle>/training/active/current-week.md` and use that week. If scope is `block` and no block number, infer the most-recently-completed block from the current week.

State back what you'll review:
- Scope: weekly | block | arc
- Window: dates / weeks covered
- Source files that will be read
- Source data tables that will be queried

**Checkpoint:** "Reviewing [scope] for [athlete] / [arc] / [window]. Proceed?"

### Phase 2: Aggregate plan + actual data

Pull the data window:

| Scope | Plan window | Actual window |
|---|---|---|
| weekly | The week file (`weeks/<arc>-W<NN>.md`) | Supabase: `exercise_sets` and `daily_metrics` for the 7 days |
| block | The block file (`blocks/<n>-<slug>.md`) + all 6 week files in that block | Supabase: 6 weeks of `exercise_sets` and `daily_metrics` |
| arc | `training/arc.md` + `nutrition/arc.md` + all blocks + all weeks | Supabase: full arc of execution data |

Read prior review files if present:
- weekly: read the previous 1–2 weekly reviews for trend context
- block: read every weekly review within this block
- arc: read every block review

If Supabase isn't accessible (no creds, sandbox), fall back to athlete self-report. State explicitly that data is self-reported, not source-of-truth.

### Phase 3: Compute signals (scope-specific)

#### Weekly signals (5 signals → 1 decision)

| Signal | Source | What good looks like |
|---|---|---|
| **Lift trend** (the canary) | `exercise_sets` for primary lifts | Same load × reps held or improved across week |
| **Bodyweight 7-day rolling avg** | `daily_metrics.bodyweight_lb` | On the curve from `nutrition/arc.md` §4.2 |
| **Sleep** | Self-report or `daily_metrics.sleep_hours` if logged | 7+ hrs avg, no rough patches |
| **Recovery** | Self-report (pain levels, fatigue) + `profile.md` injury list | No flares, RPE at prescribed loads |
| **Adherence** | Count of fallback days, missed sessions | ≤1 fallback day, 0 missed sessions |

→ **One decision:**

| Pattern | Decision |
|---|---|
| All 5 green | **Hold** — repeat the next week's plan |
| Lifts dropping OR sleep degrading OR recovery flaring | **Ease** — +200 kcal/day this week (mostly carbs); skip optional accessories if needed |
| Bodyweight stalled 2+ weeks AND lifts holding | **Tighten** — −150 kcal/day; consider adding a conditioning session |
| Pain ≥3 for 5+ days OR 2+ missed sessions in a row OR squat top set drops >5% | **Pause** — eat at maintenance, swap to recovery-mode programming, surface for athlete decision |

#### Block signals (actual vs target)

For each metric in the block's testing schedule, compute actual vs target:
- Was the target hit, missed, or exceeded?
- For each lift: max load achieved, RPE at load, adherence to programmed sets
- For body comp: bodyweight delta (start → end of block), curve adherence
- For session adherence: completed sessions / planned sessions

Synthesize:
- **What worked** — patterns that produced wins
- **What didn't** — patterns that produced misses
- **Carry-forward decisions** — what to keep, change, drop in the next block
- **Hard signals to flag for next block planning** — e.g., "patellar pain emerged in Wk 5; B2 needs depth jump volume reduced" or "cut bit harder than expected; B2 may need maintenance instead of continued deficit"

#### Arc signals (goal hit/miss + lessons)

For each arc goal (G1, G2, G3), compute outcome:
- Goal: stated test
- Result: pass / partial / miss
- Final metric: actual number vs target

Synthesize:
- **Goals achieved** — what hit and the path that got there
- **Goals missed** — what didn't and the most plausible reason
- **Methodology assessment** — did the chosen training + nutrition styles serve this arc? Style guides got which calls right and which wrong?
- **Lessons for next arc** — what to keep, change, throw out
- **Pre-arc setup for the next arc** — what's the next dominant problem, which styles, what duration

### Phase 4: Write the review document

Path:

| Scope | Path | Length target |
|---|---|---|
| weekly | `<bundle>/reviews/weekly/<arc>-W<NN>-review.md` | 30–60 lines |
| block | `<bundle>/reviews/blocks/block-<n>-review.md` | 150–250 lines |
| arc | `<bundle>/reviews/arc-retrospective.md` | 300–500 lines |

Create the `reviews/` directory and scope subdirectory if needed (`mkdir -p`).

Document structure:

#### Weekly review

```
1. Window — dates, week number, block context
2. Signals — table of the 5 signals, source, value, status (green / yellow / red)
3. Decision — hold | ease | tighten | pause
4. Rationale — 2–4 sentences explaining the decision from the signals
5. What changes for next week — concrete adjustments (calories ±X, swap exercise Y, etc.)
6. Open flags — anything trending wrong but not yet a decision (e.g., "sleep started slipping mid-week — watch")
```

#### Block review

```
1. Block context — name, weeks, training emphasis, nutrition phase
2. Testing schedule outcomes — table: metric / baseline / target / actual / status
3. Adherence summary — sessions completed / planned, fallback day count, prep cadence holding
4. What worked — patterns that produced wins, with cites to specific weeks/sessions
5. What didn't — patterns that produced misses
6. Carry-forward decisions — keep / change / drop list for next block
7. Recommendations for the next block plan — concrete inputs the planner needs
8. Hard signals to surface — anything that needs structural plan attention
```

#### Arc review

```
1. Arc summary — purpose, dates, goals, styles used
2. Goal-by-goal outcome — for each G1/G2/G3: stated test, final result, narrative of the path
3. Block-by-block highlights — pull from the 3 block reviews; surface major shifts
4. Methodology assessment — did the training + nutrition styles serve this arc? What did the style guides get right / wrong?
5. Lessons learned — top 5–8 takeaways
6. What I'd do differently — counterfactual: if running this arc again
7. Pre-arc setup for the next arc — next dominant problem, recommended styles, recommended duration
8. Source of truth pointers — where the raw data lives (Supabase tables, logs)
```

### Phase 5: Surface key outputs in chat

Don't dump the full review file in chat. Surface:

- **Weekly:** the decision (hold/ease/tighten/pause) + 1–3 sentence rationale + the concrete changes for next week. Link to the full file.
- **Block:** target hit/miss summary table + top 3 carry-forward decisions + the hard signals. Link to the full file.
- **Arc:** the goal outcomes + top 3 lessons + the recommended setup for the next arc. Link to the full file.

Example weekly chat output:

```
Week 04 review — DECISION: HOLD
- Lifts: bench +5 lb, pull-up volume up 12% → green
- BW: 189.4 lb (curve target 190.0) → green
- Sleep avg 7.2 hr → green
- Adherence: 0 fallback days, 0 misses → green

Recommended for Wk 05: repeat plan as written. No changes.

Full review: athletes/andy/arc-2026-summer-dunk/reviews/weekly/2026-Arc-W04-review.md
```

### Phase 6: Optional — propose plan changes

If the review surfaces a structural issue (not just a single-week adjustment), don't apply the change silently. Surface it as a proposal:

- For weekly: if the decision is `pause`, recommend invoking other skills (e.g., "consider running `block` review now to assess if this is a one-off or a trend").
- For block: if the testing outcomes are far off, recommend a `plan-nutrition-arc` re-run for the next block, or a partial `plan-training-arc` regen.
- For arc: lessons feed into the *next* arc's `plan-arc` call as inputs.

Don't write to `proposals` table or modify the bundle structurally. The review is the proposal; the user (or a separate skill) acts on it.

## Constraints

- **Never modify the bundle's plan files.** Reviews are read-only with respect to `arc.md`, `blocks/`, `weeks/`. Write only to `reviews/`.
- **Never invent metric values.** If Supabase isn't accessible, mark values as "self-reported" or "missing — request from athlete."
- **Always link the prior review** in the new review's header (chains for trend visibility).
- **Always honor the bundle's framing.** Use the same vocabulary as the training and nutrition arc files (B1/B2/B3, the same style guide names, the same metric labels).
- **Surface drift to the athlete, not just to disk.** Phase 5's chat output is the touchpoint that drives action — don't skip it.
- **Don't conflate scopes.** A weekly review is not a mini-block review. Block-level questions ("did this style serve me?") wait for the block review. Weekly is "execute or adjust this week."

## Output

A single review file at the path specified in Phase 4 + a chat summary (Phase 5).

After writing, the review file becomes durable input to:
- The next-scope review (weekly → block → arc chains up)
- The next planning cycle (block reviews feed into generating the next block; arc retrospective feeds into the next arc bundle)
- Trend analysis (multiple weekly reviews show drift over time)
