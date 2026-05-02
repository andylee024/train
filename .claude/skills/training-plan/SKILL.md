---
name: training-plan
description: "Generate a structured training plan spreadsheet (.xlsx) for any athlete and any training style. Creates an Athlete Profile tab, Arc tab (purpose → goals → block sequence → testing schedule), and one Block tab per training block with cascading goals, weekly split, progression model, and daily breakdown grids. Trigger when: building a training plan, creating a workout program, generating an arc or block plan, or producing a periodized program spreadsheet."
---

# Training Plan Spreadsheet — Skill Guide

> This skill generates a structured .xlsx training plan for any athlete, any training style. The spreadsheet is the **strategic planning document** — the map, not turn-by-turn directions. A text agent handles daily/weekly delivery.

## When to Use

- User asks to create a training plan, workout program, or periodized program
- User asks to generate an arc, block, or training spreadsheet
- User wants to formalize goals into a structured training document
- Any request that produces a `.xlsx` with training programming as the output

## Required Inputs

Before generating, you need:

1. **Athlete profile** — name, stats, injuries, schedule, preferences
2. **Arc definition** — purpose, 2-3 yes/no measurable goals, timeline
3. **Block structure** — how many blocks, what each block emphasizes
4. **Training style(s)** — which training-styles/ guides to consult for exercise selection
5. **Known maxes** — for percentage-based load prescription

If any of these are missing, check `athletes/{name}/profile.md` and `athletes/{name}/arc.md` first. If those don't exist, ask the user.

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

When building a plan, consult the relevant style guide(s) in `docs/training-styles/`:

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
- Not an exercise library — that lives in `docs/training-styles/exercises.md`
- Not a nutrition plan — that's a separate document
- Not a weekly planner — weeks and days are delivered conversationally

The spreadsheet answers: **Where am I, what are my goals, and what's the plan to get there?**
