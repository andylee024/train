# Plan Schema

The information model for arc, block, weekly, and daily plans. Every layer follows the same decomposition pattern: 1 purpose → 2-3 measurable goals → reasoning for each → decompose into children.

Markdown is the format. Obsidian wikilinks (`[[name]]`) connect layers. Files are the source of truth.

---

## Core principle: recursive goal decomposition

Every layer has the same shape:

```
┌─────────────────────────────────────┐
│  1 qualitative purpose              │
│  2-3 quantitative yes/no goals      │
│    each goal has reasoning          │
│    each goal has metric + target    │
│  children serve parent goals        │
└─────────────────────────────────────┘
```

Layers: **Arc → Block → Week → Day**

Arc goals are just out of reach — the athlete has to work hard to get there. Block goals drive adaptations toward arc goals. Weekly goals drive progress toward block goals. Day = execute the workout + nutrition.

---

## Layer relationships

```
Arc (1 active at a time)
├── has 2-3 Goals (measurable, yes/no)
├── has 3-5 Blocks
│   ├── each Block serves 1-2 Arc goals
│   ├── each Block has 2-3 Mini-goals → serving Arc goals
│   ├── each Block has programming philosophy (WHY the rep schemes)
│   ├── each Block has athlete state snapshot
│   ├── each Block has 3-5 Weeks (+ deload every 5th week)
│   │   ├── each Week has 2-3 Mini-goals → serving Block goals
│   │   ├── each Week has 5-7 Days
│   │   │   └── each Day has Exercises + Nutrition
│   │   │       └── each Exercise tagged to which Arc goal it serves
```

Every child links back to its parent. Every goal links to the parent goal it serves. Every exercise links to the arc-level goal it trains.

---

## Arc

The root. One arc is active at a time.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Short memorable name (e.g., "Dunk by end of summer 2026") |
| purpose | string | Qualitative goal, 1-3 sentences. What does success feel like? |
| start_date | date | First day of the arc |
| end_date | date | Last day of the arc |
| duration_weeks | int | Total weeks |
| goals | list[Goal] | 2-3 measurable, yes/no goals (see Goal schema) |
| coaching_team | list[CoachRole] | Specialist coaches picked at arc start |
| budget_total | int | Total training slots available (sessions/week × 2) |
| budget_used | int | Slots consumed by selected goals |
| blocks | list[BlockRef] | Ordered list of blocks with week ranges |
| priority_stack | list[PriorityRow] | Triage order when time/energy/recovery is tight |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| unchosen_goals | list[Goal] | Goals proposed but not selected — carry forward to future arcs |
| athlete_profile | link | Reference to athlete profile file |
| status | enum | planned, active, completed, abandoned |

### Goal

The universal goal unit. Used at arc, block, and weekly layers with the same shape.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Short, memorable (e.g., "Sky reach", "Iron ratio") |
| type | enum | vertical, strength, consistency, olympic, mobility, body_comp |
| metric | string | What's being measured (e.g., "Approach touch", "Back squat at bodyweight") |
| current | string | Where the athlete is now |
| target | string | Where the athlete needs to be (pass/fail) |
| reasoning | string | Why this goal was chosen. Specific to the athlete's profile — which adaptation it drives, how it serves the parent purpose. |

Arc-level goals additionally have:

| Field | Type | Description |
|-------|------|-------------|
| cost | int | Training slots per week required |
| cost_breakdown | string | What sessions/week this costs (e.g., "2 jump + 1 sprint session /wk") |
| recommended_by | string | Which specialist proposed it (e.g., "Sport coach", "Strength coach") |

### CoachRole

| Field | Type | Description |
|-------|------|-------------|
| role | string | e.g., "Head Coach", "Strength Coach", "Sport Coach" |
| responsibility | string | What this coach owns in the plan |

### PriorityRow

| Field | Type | Description |
|-------|------|-------------|
| rank | int | 1 = highest priority |
| domain | string | e.g., "Vertical / Power", "Lower strength", "Cut" |
| rule | string | What to do when this domain is under pressure |

### BlockRef

| Field | Type | Description |
|-------|------|-------------|
| link | wikilink | Reference to block file |
| weeks | string | e.g., "1-3" |
| serves | list[string] | Goal names this block serves |

---

## Block

A 3-5 week training cycle with a specific purpose. The layer where programming decisions live.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| name | string | Descriptive (e.g., "Strength + power build") |
| block_number | int | Position in the arc (1 of 5) |
| weeks | string | Week range (e.g., "4-8") |
| serves | list[link] | Which arc-level goals this block serves |
| parent_arc | link | Reference to arc file |
| purpose | string | Qualitative — what this block is for, 1-2 sentences |
| mini_goals | list[Goal] | 2-3 measurable, yes/no goals serving arc goals |
| athlete_state | AthleteState | Snapshot of where the athlete is at block start |
| programming_philosophy | ProgrammingPhilosophy | WHY the rep schemes are what they are |
| session_types | list[SessionType] | The workout types used in this block |
| weekly_progression | list[WeekProgressionRow] | How variables ramp week to week |
| deload_week | int | Which week is the deload (typically every 5th week) |
| exit_tests | list[ExitTest] | Tests to run at end of block — pass/fail |
| failure_protocols | list[string] | What to do if exit tests aren't met |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| amendments | list[Amendment] | Changes made after initial plan and why |
| status | enum | planned, active, completed |

### AthleteState

Snapshot taken at block start. This is what the athlete wants to beat.

| Field | Type | Description |
|-------|------|-------------|
| date | date | When the snapshot was taken |
| bodyweight | string | Current bodyweight (e.g., "192 lb") |
| body_fat | string | Estimated body fat % |
| working_maxes | list[WorkingMax] | Current working maxes pulled from Supabase |
| jump_metrics | dict | Approach touch, standing vert, etc. |
| injury_status | list[string] | Active injuries and their current state |

### WorkingMax

| Field | Type | Description |
|-------|------|-------------|
| exercise | string | Canonical exercise name (must match Supabase `exercises` table) |
| value | string | Weight (e.g., "168 kg / 370 lb") |
| source | enum | logged (from Supabase), estimated (from profile) |
| date | date | When this was last tested/logged |

### ProgrammingPhilosophy

One section per training domain. Each explains WHY the rep scheme, volume, and intensity are set this way for this block, given the goals, the cut status, and recovery constraints.

The athlete reads this once at block start to understand the system behind every session. Understanding prevents second-guessing in the gym.

| Field | Type | Description |
|-------|------|-------------|
| squat | string | Sets × reps, why this scheme, week-to-week progression logic |
| olympic_lift | string | What lift, why this scheme, speed vs load emphasis |
| jump_training | string | Volume, intensity, max-effort vs submax split, why |
| upper_body | string | Maintenance vs build, why this volume level |
| flexibility | string | Duration, focus areas, how embedded in sessions |
| nutrition | string | Calorie target, protein floor, cut/maintain phase, why |

### SessionType

Defines the workout archetypes used in this block. Session ordering within each type follows: Power → Strength → Accessories → Mobility.

| Field | Type | Description |
|-------|------|-------------|
| name | string | e.g., "Oly + Strength", "Plyo + Strength", "Jump day" |
| focus | string | What this session type trains |
| ordering | list[string] | Exercise category order for this session type |
| typical_duration | string | e.g., "~75 min" |

### Progression rule

**Dylan Shannon style:** Vary rep/set scheme across the block (3×3, 3×8, 3×15, 4×2) but always try to beat the last PR on that scheme. The athlete breaks PRs on a different lift each week. Working maxes are pulled from Supabase training logs.

This isn't a field — it's a structural constraint that shapes how `weekly_progression` and exercise prescriptions are written.

### WeekProgressionRow

| Field | Type | Description |
|-------|------|-------------|
| week | int | Week number within the block |
| squat | string | Prescription (e.g., "4×4 @ 76%") |
| olympic | string | Prescription |
| jumps | string | Volume/intensity note |
| bw_target | string | Bodyweight target |
| type | enum | build, intensify, deload, test |

### ExitTest

Tests run at the end of the block. These are the block's "mini-goals" evaluated as pass/fail.

| Field | Type | Description |
|-------|------|-------------|
| description | string | What's being tested (e.g., "Back squat 4×4 @ 80%") |
| serves | link | Which arc goal this test validates |
| pass_criteria | string | What "pass" looks like |

### Amendment

| Field | Type | Description |
|-------|------|-------------|
| date | date | When the change was made |
| description | string | What changed and why |

---

## Weekly plan

One file per week. The contract: follow this and you hit the block's targets.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| week_number | int | Week number in the arc (1-18) |
| parent_block | link | Reference to block file |
| block_week | int | Week number within the block (e.g., 2 of 5) |
| week_type | enum | build, intensify, deload, test |
| primary_focus | string | One-line focus for the week |
| mini_goals | list[Goal] | 2-3 measurable goals serving block goals |
| nutrition | WeekNutrition | Calorie and macro targets for the week |
| days | list[Day] | 5-7 days with session details |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| strategy | Strategy | Emphasis, what to keep, what to avoid |
| review | WeekReview | End-of-week assessment (filled after the week) |

### WeekNutrition

| Field | Type | Description |
|-------|------|-------------|
| calories | string | Daily target (e.g., "~2,300") |
| protein | string | Daily floor (e.g., "≥200g") |
| cut_status | string | Deficit amount or "maintenance" |
| bw_target | string | 7-day average target |

### Strategy

| Field | Type | Description |
|-------|------|-------------|
| emphasis | string | What the week prioritizes (load, speed, quality, recovery) |
| keep | string | What must stay consistent |
| avoid | string | Fatigue traps or unnecessary variation |

### WeekReview (filled post-week)

| Field | Type | Description |
|-------|------|-------------|
| wins | list[string] | What went well |
| misses | list[string] | What didn't happen |
| metrics_actual | dict | Actual values vs targets |
| adjustments | list[string] | Changes for next week |

---

## Day

A single day within a weekly plan. Not a separate file — it's a section within the weekly plan file.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| day_number | int | Day in the week (1-7) |
| day_of_week | string | Monday, Tuesday, etc. |
| session_type | string | Which SessionType from the block (e.g., "Oly + Strength") |
| focus | string | Session focus (e.g., "Lower power", "Jump + sprint + dunk") |
| exercises | list[Exercise] | Ordered list of exercises |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| session_time | string | Estimated duration (e.g., "~65 min") |
| target_rpe | string | Overall session intensity target |
| is_optional | bool | Whether this session can be skipped |
| is_rest_day | bool | Rest or active recovery day |
| nutrition_note | string | Day-specific nutrition note (e.g., "eat before session") |

---

## Exercise

A single exercise within a day's session.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| order | int | Position in the session (1, 2, 3...) |
| name | string | Exercise name (must match Supabase `exercises` table for PR lookup) |
| prescription | string | Sets × reps @ load/intensity (e.g., "4×4 @ 76%") |
| goal | link or null | Which arc-level goal this exercise serves. Null for prehab/flexibility. |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| rest | string | Rest period (e.g., "2 min", "90s") |
| pr_to_beat | string | Last performance on this exact scheme (e.g., "4×4 @ 75% last Monday"). Pulled from Supabase. |
| coaching_note | string | Technique cue, injury guard, or session cap |
| rpe_target | string | Target RPE for this specific exercise |

---

## Structural rules

These aren't fields — they're constraints that shape how plans are generated.

1. **Deload every 5th week.** Built into the block structure. If a block is 5 weeks, week 5 is deload. If it's 4 weeks, deload is the first week of the next block.

2. **Session ordering: Power → Strength → Accessories → Mobility.** Within each session type, exercises follow this order. The session types themselves vary block to block (oly + strength, plyo + strength, jump days, etc.).

3. **PR-rotation progression (Dylan Shannon style).** Vary rep/set schemes across the block (3×3, 3×8, 3×15, 4×2). Always try to beat the last PR on that specific scheme. Break PRs on a different lift each week. Working maxes pulled periodically from Supabase training logs.

4. **Working maxes from Supabase.** The `exercises` and `exercise_sets` tables in Supabase hold historical performance. When generating plans, query for the athlete's last performance on each exercise to populate `pr_to_beat` fields. If no history exists, estimate from known lifts in the athlete profile.

5. **Exercise swaps via conversation.** When an exercise needs changing (injury, equipment, preference), the athlete discusses with the coach in text. The replacement is applied across all affected plan files. Not automated — it's a coaching conversation.

6. **Coaching team picked at arc start.** The set of specialist agents (head coach, strength, sport, Olympic, mobility, nutritionist) is selected during arc creation and stays fixed for the arc.

---

## Naming conventions

### Files

| Layer | Pattern | Example |
|-------|---------|---------|
| Arc | `arc.md` | `plans/arcs/2026-summer-dunk/arc.md` |
| Goal | `<goal-slug>.md` | `plans/arcs/2026-summer-dunk/goals/sky-reach.md` |
| Block | `block-<NN>-<slug>.md` | `plans/arcs/2026-summer-dunk/blocks/block-02-strength-power.md` |
| Weekly | `week-<NN>.md` | `plans/arcs/2026-summer-dunk/weeks/week-05.md` |

### Exercise names

Exercise names must be consistent across all files and match the Supabase `exercises` table. This is how PR lookup works — the name in the weekly plan file is used to query the database for the last performance.

Use the canonical name from the exercise catalog. Examples: "Back Squat" not "Squat" or "BB Back Squat". "Power Clean" not "Clean" or "PC".

### Wikilinks

- Goal references: `[[sky-reach]]`, `[[iron-ratio]]`
- Block references: `[[block-02-strength-power]]`
- Week references: `[[week-05]]`
- Arc reference: `[[arc]]`

---

## Directory structure

```
plans/
├── athlete-profile.md
├── arcs/
│   └── 2026-summer-dunk/
│       ├── arc.md
│       ├── goals/
│       │   ├── sky-reach.md
│       │   ├── iron-ratio.md
│       │   └── iron-habit.md
│       ├── blocks/
│       │   ├── block-01-reset-base.md
│       │   ├── block-02-strength-power.md
│       │   ├── block-03-power-conversion.md
│       │   ├── block-04-realization.md
│       │   └── block-05-consolidation.md
│       └── weeks/
│           ├── week-01.md
│           ├── week-02.md
│           ├── ...
│           └── week-18.md
├── archive/
│   ├── 2026-original-blocks/
│   └── 2026-original-weekly-plans/
└── templates/
    ├── arc-template.md
    ├── goal-template.md
    ├── block-template.md
    └── weekly-template.md
```
