---
name: plan-training-arc
description: "Generate the training plan files for an athlete's arc — primary output is a structured .xlsx spreadsheet (the strategic planning document the athlete actually looks at), with derived markdown files (blocks/, weeks/, active/) for the daily-execution agent to consume. Currently configured for Andy Lee's v6 dunk arc (data hardcoded in build_training_arc.py). Runs ONCE per arc at creation; re-run when arc data changes (load adjustments, exercise swaps, new block design). Trigger when: building a training plan, creating a workout program, generating an arc, or regenerating the training cascade after changes."
---

# plan-training-arc — Skill Guide

> Generates the full training cascade for an athlete's arc. **Primary output: the .xlsx spreadsheet** (`outputs/hybrid-athletic-plan-v6.xlsx`) — the visual planning document the athlete reviews. **Derived outputs: 3 block + 18 week + 2 active markdown files**, consumed by the daily-execution agent. Both views render from the same data structures, so they never drift apart.

## What this skill does

Runs `build_training_arc.py` (the implementation). One invocation produces 24 files:

| Output | Count | Location | Purpose |
|---|---|---|---|
| **`.xlsx` spreadsheet** | 1 | `<arc>/outputs/hybrid-athletic-plan-v6.xlsx` | **Primary asset.** Strategic planning document the athlete uses to see the whole arc. |
| Block markdown files | 3 | `<arc>/training/blocks/` | Per-block detail (purpose, goals, strategy, daily breakdowns × 6 weeks) |
| Week markdown files | 18 | `<arc>/training/weeks/` | Per-week detail (header, daily prescriptions for the agent's hot path) |
| Active snapshots | 2 | `<arc>/training/active/` | Copies of currently-active block + week (refreshed as arc progresses) |

## Cadence

**Once per arc, at arc creation.** Re-run only when arc data changes:

| Change | Re-run? |
|---|---|
| Adjusting a block's exercise loads | Yes |
| Swapping an exercise within a block | Yes |
| Adjusting weekly progression model | Yes |
| Adding a new block | Yes |
| Daily/weekly logging of executed work | **No** — that's runtime, not plan |
| Athlete bw changes | **No** — bw doesn't affect this plan |

## Scope (single-athlete v0)

**Currently hardcoded to Andy's v6 dunk arc.** The data structures (`BLOCK_SPECS`, `WEEK_META`, `SQUAT_1RM`, `BENCH_1RM`, `CLEAN_1RM`) live inline in `build_training_arc.py`.

**When athlete #2 onboards:** split data → athlete bundle (e.g., `docs/athletes/{name}/arc-{slug}/training/arc-data.py`), keep `build_training_arc.py` as the generic renderer. ~3-hour refactor when needed.

For now: edit the data structures inside `build_training_arc.py` directly when Andy's plan changes.

## How to invoke

```bash
python3 .claude/skills/plan-training-arc/build_training_arc.py
```

Writes to: `docs/athletes/andy/arc-2026-summer-dunk/{outputs,training/blocks,training/weeks,training/active}/`

## When to Use

- User asks to create a training plan, workout program, or periodized program
- User asks to generate an arc, block, or training spreadsheet
- User edited `build_training_arc.py` data structures and needs to regenerate the cascade
- User wants to formalize goals into a structured training document
- Any request that produces the .xlsx + markdown cascade for a training arc

## Required Inputs

Before generating, you need:

1. **Athlete profile** — name, stats, injuries, schedule, preferences
2. **Arc definition** — purpose, 2-3 yes/no measurable goals, timeline
3. **Block structure** — how many blocks, what each block emphasizes
4. **Training style(s)** — which training-styles/ guides to consult for exercise selection
5. **Known maxes** — for percentage-based load prescription

If any of these are missing, check `docs/athletes/{name}/profile.md` and `docs/athletes/{name}/arc.md` first. If those don't exist, ask the user.

## Spreadsheet Structure

### Tab 1: Athlete Profile

| Section | Contents |
|---------|----------|
| IDENTITY | Name, location, training age, identity statement |
| CURRENT STATS | Table: Metric / Current / Target / Notes — all key lifts, body comp, sport metrics |
| ACTIVE INJURIES | Each injury with status, restrictions, and allowed substitutions (orange fill) |
| SCHEDULE + CONSTRAINTS | Training days, session length, equipment, nutrition approach |
| TRAINING PREFERENCES | Fixed exercise menu, superset preference, RPE approach, etc. |

### Tab 2: Arc

| Section | Contents |
|---------|----------|
| PURPOSE | 1-2 sentence statement of the arc's intent |
| GOALS | G1, G2, G3 — each must be yes/no measurable with a test method and deadline |
| BLOCK SEQUENCE | Table: Block / Name / Weeks / Purpose / Serves (which arc goals) |
| TESTING SCHEDULE | Table: Metric / Baseline / checkpoint per block / Method / Serves |
| CONSTRAINTS | Injuries, schedule, nutrition constraints (orange fill) |

### Tab 3+: Block Tabs (one per block)

| Section | Contents |
|---------|----------|
| PURPOSE | What this block exists to accomplish |
| GOALS | G1, G2, G3 for the block — each with "Serves: Arc G_" notation |
| WEEKLY SPLIT | Table: Day / Workout name (descriptive) |
| PROGRESSION MODEL | How loads/volume progress week-to-week, RPE targets, deload protocol |
| DAILY BREAKDOWN | Exercise × Week grids for each training day |

### Daily Breakdown Grid Format

```
# | Exercise | Sets × Reps | Wk 1 | Wk 2 | ... | Wk N
```

- **# column**: Exercise numbering with superset notation
  - `1a`, `2a`, `3a` = separate standalone exercises
  - `3a`, `3b` = superset pair (same number, different letter)
  - `4a`, `4b`, `4c` = tri-set (same number, three letters)
- **Loads**: Show `%` + actual weight where maxes are known (e.g., "78% (290 lb)")
- **Qualitative loads**: "Moderate", "Heavy", "BW", etc. for exercises without tested maxes
- **Wave-loaded exercises**: Show the actual weight (e.g., "185 lb" → "225 lb" across weeks)

## Goal Cascade Model

Every layer follows: **1 purpose → 2-3 yes/no goals**

```
Arc: 1 purpose → G1, G2, G3 (yes/no, test method, deadline)
  └─ Block: 1 purpose → G1, G2, G3 (each with "Serves: Arc G_")
       └─ Week: delivered by text agent
            └─ Day: delivered by text agent
```

Goals must be:
- **Binary** — yes or no, not "improve" or "increase"
- **Testable** — has a specific test method
- **Traceable** — each block goal explicitly states which arc goal it serves

## Exercise Ordering Rules

Within each day, exercises must follow neural demand order:

1. **Speed / Plyometrics** — when present, always first (max intent required)
2. **Power / Olympic lifts** — requires coordination and bar speed
3. **Strength / Heavy compounds** — the primary lift
4. **Secondary compounds** — moderate load
5. **Accessories** — superset pairs for efficiency
6. **Kick / Sport-specific** — technique or power expression
7. **Flexibility / Mobility** — end of session

Power and Olympic work is NEVER superset. Everything else should be superset where possible.

## Color Coding

| Fill | Hex | Use |
|------|-----|-----|
| Dark header | 1A1A2E | Day headers, table headers |
| Section header | F0F4FF | Section titles (PURPOSE, GOALS, etc.) |
| Goal row | E6F4EA | Goal entries (green tint) |
| Warning/injury | FFF3E0 | Constraints, injuries (orange tint) |
| Block 1 | DBEAFE | Blue tint |
| Block 2 | FDE68A | Yellow tint |
| Block 3 | FECACA | Red tint |
| Flexibility | F3E8FF | Purple tint — any flex/mobility exercise |
| Kick/Sport | ECFDF5 | Green tint — any kick or sport-specific exercise |
| Superset partner | F1F5F9 | Light gray — the "b" row in a superset pair |
| Profile | EFF6FF | Athlete Profile tab header |

## Style Integration

When building a plan, consult the relevant style guide(s) in `docs/content/training-styles/`:

- Read the guide's **exercise selection**, **session structure**, **periodization** sections
- Pull exercises from the style's exercise catalog, not generic choices
- Follow the style's ordering rules (e.g., Dylan Shannon: velocity → strength → volume)
- Respect the style's volume and intensity recommendations
- Note exercise substitutions for the athlete's specific injuries

## Implementation Notes

- Use `openpyxl` for spreadsheet generation
- Font: Arial throughout (FT=16pt bold title, FH2=13pt bold section, FB=10pt body)
- Column widths: # col = 6, Exercise = 30, Sets = 15, Week cols = 17
- `pct_wt(pct, max)` helper: converts percentage to "78% (290 lb)" format, rounds to nearest 5 lb
- Wave-loaded exercises (e.g., 4×5,5,4,3): show actual weight, increase ~10 lb/week
- Deload weeks: reduce volume 60%, intensity to ~75%, maintain all exercises

## What This Spreadsheet Is NOT

- Not a daily workout log — the text agent handles that
- Not an exercise library — that lives in `docs/content/training-styles/exercises.md`
- Not a nutrition plan — that's a separate document
- Not a weekly planner — weeks and days are delivered conversationally

The spreadsheet answers: **Where am I, what are my goals, and what's the plan to get there?**
