---
name: generate-plan
description: Generate a complete training plan spreadsheet through a guided onboarding conversation. Use when the user wants to create a training program, build a plan, start a new arc, set up their coaching team, pick goals, or generate a training spreadsheet. Also trigger when the user says "new plan", "build my program", "set up training", or similar phrases about creating a structured athletic plan from scratch.
---

# Generate Training Plan

Walk the user through a structured conversation that produces a complete training plan as an `.xlsx` spreadsheet. The spreadsheet becomes the source of truth — the user opens it to see everything they need to do.

The conversation has 4 phases. Each phase ends with a checkpoint where the user confirms before moving on. Never skip a checkpoint.

## Before You Start

Read the following reference files to understand the data model and coaching roster:

1. `references/roster.md` — the expert coaches, their personalities, and what goals each can propose
2. `references/goal-catalog.md` — the full catalog of goals with costs, metrics, and reasoning

Also read the user's `athletes/andy/profile.md` if it exists. If it doesn't, Phase 1 creates it.

## Phase 1: Profile

**Purpose:** Establish or confirm the athlete's character sheet.

If `athletes/andy/profile.md` exists, summarize it back to the user and ask: "Does this still look right, or do we need to update anything?" Update as needed.

If it doesn't exist, collect:

- **Identity** — What kind of athlete do they want to be? What's the north star?
- **Goals** — Priority-ranked athletic goals (the big ones, not weekly targets)
- **Current state** — Bodyweight, body fat estimate, key lifts (back squat, front squat, power clean, bench, OH press, weighted chin-up), jump metrics, flexibility
- **Active injuries** — What hurts, what movements are affected, management approach
- **Constraints** — Training days/week, equipment access, session length, location
- **Preferences** — Training style (fixed menu vs variety, RPE vs percentage, session structure)
- **History** — What's worked before, what hasn't, known pitfalls

Write the profile to `athletes/andy/profile.md`.

**Checkpoint:** "Here's your profile. Does this capture who you are and where you're at?"

## Phase 2: Pick Your Team

**Purpose:** The user selects which specialist coaches they want on their team.

Present the roster from `references/roster.md`. The Head Coach is always included — they synthesize everything and own the arc/block structure. The user picks from the specialists:

- Strength Coach
- Sport Coach
- Olympic Lifting Coach
- Mobility Coach
- Nutritionist

Each coach unlocks a domain of goal proposals in Phase 3. Frame it like assembling a party: "Who do you want in your corner for this arc?"

The user should pick based on their priorities. If the dunk is the goal, Sport Coach and Strength Coach are probably non-negotiable. If they don't care about Olympic lifting right now, skip that coach — those goals will wait for a future arc.

Present each coach with a one-liner about their specialty and what they bring. Don't overwhelm — keep it scannable.

**Checkpoint:** "Your team is [list]. Ready to see what goals they propose?"

## Phase 3: Goal Shop

**Purpose:** Each selected coach proposes goals. The user picks 2-3 within a slot budget. This is where the plan's direction gets locked in.

### Budget

Calculate the user's budget:

```
training_days_per_week × 2 = total_slots
```

For a 5-day athlete, that's 10 slots. Each goal has a slot cost representing how many training slots per week it requires. Some goals (consistency, nutrition) cost 0 slots — they're behavioral, not session-time.

### Goal Proposals

Each selected coach proposes 2-3 goals from `references/goal-catalog.md`. Tailor the proposals to the athlete's profile — if they have a shoulder injury, the Strength Coach won't propose heavy overhead work. If they're already strong but can't jump, the Sport Coach leads.

Present each goal as a card:

```
[Goal Name] — proposed by [Coach]
Type: Vertical | Strength | Olympic | Mobility | Body Comp | Consistency
Metric: [current] → [target]
Cost: [N] slots ([what this costs in sessions])
Why: [1-2 sentences — why this goal, for this athlete, right now]
```

Show the budget bar: "You have 10 slots. Here's what's on the table."

### Selection

The user picks 2-3 goals. The budget constraint forces real tradeoffs — they can't take everything. This is a feature, not a limitation. Unchosen goals carry forward to future arcs.

After selection, show the final allocation:

```
Selected goals: [list with costs]
Budget used: X / Y slots
Unchosen (future arcs): [list]
```

**Checkpoint:** "These are your goals for this arc. Once we lock them in, the plan gets built around them. Good?"

## Phase 4: Generate the Spreadsheet

**Purpose:** Build the complete training plan as an `.xlsx` file.

### What to Generate

Using the locked profile, team, and goals, build a spreadsheet with these tabs:

1. **Athlete Profile** — Identity, body stats, key lifts (current vs target), jump metrics, injuries, constraints, preferences
2. **Arc Overview** — Arc name, purpose, timeline, selected goals with color coding, block timeline (3-5 blocks), priority stack, nutrition targets
3. **Block 1 through Block N** — One tab per block. Each block has:
   - Block purpose and mini-goals (serving arc goals)
   - Weekly structure table (week type, squat prescription, Olympic prescription, jump volume, BW target)
   - Full daily workouts: exercise name, sets × reps × weight, rest periods
   - Session ordering: Power → Strength → Accessories → Mobility
   - Deload every 5th week
4. **Workout Log** — Empty log with columns: Date, Exercise, Prescription, Actual (sets/reps/weight), RPE, Notes
5. **Nutrition Log** — Empty log with columns: Date, Calories, Protein, Carbs, BW, Sleep, Notes. Include 7-day average formulas.

### Programming Principles

Apply these when generating exercise prescriptions:

- **Dylan Shannon PR-rotation:** Vary rep/set schemes across the block (3×3, 3×8, 3×15, 4×2). Always try to beat the last PR on that specific scheme. Break PRs on a different lift each week.
- **Session ordering:** Power → Strength → Accessories → Mobility within each session
- **Session types:** Oly + Strength, Plyo + Strength, Jump Day — vary by block
- **Fixed exercise menu per block:** Progress through load, not variation. Same exercises each week, different scheme.
- **RPE-based intensity:** RPE 6-8 for most work, no grinders except test weeks
- **Flexibility embedded:** Non-optional, in every session, not a separate day

### Implementation

Use the `build_plan_xlsx.py` script as the generator. It uses openpyxl to create styled spreadsheets with colored tabs, formatted headers, and nutrition formulas.

The script should be parameterized to accept:
- Athlete profile data
- Selected goals
- Selected coaching team
- Arc timeline (start date, duration in weeks)
- Number of blocks

Run the script and deliver the `.xlsx` file to the user.

**Checkpoint:** "Here's your plan. Open it up — every exercise traces back to a goal, every block has a purpose. Does this feel right?"

## After Generation

Once the spreadsheet is delivered:

1. Remind the user that this spreadsheet is their source of truth
2. Explain the Workout Log and Nutrition Log tabs — these are where they track daily
3. Note that a Nanoclaw chat agent can be set up to read this spreadsheet and orchestrate daily workouts via chat (future feature)
4. Ask if any exercises need swapping (injury, equipment, preference) — handle those as amendments

## Tone

Be direct, opinionated, and knowledgeable — like a coach who knows their stuff. Don't hedge or offer too many options. The user hired experts; the experts should have strong recommendations with clear reasoning. But always let the user override.

Keep responses scannable. Use tables and cards, not walls of text. The user is an athlete, not a reader.
