# Train — System Architecture

Train gives every athlete a world-class training team — powered by AI, coordinated by a head coach, designed for any person at any life stage.

The system is built on six core concepts.

```
Layers (when) × Roles (who) → The Plan (what) → The Athlete (for whom) → Logging (how they report) → Feedback Loop (how it stays alive)
```

---

## 1. Layers

Every decision operates on a time horizon. The layers ensure every question gets answered at the right cadence. Planning flows down. Data flows up. Exceptions propagate by severity.

**Arc (3–12 months)** — "What am I building toward and why?"

The goal and the theory of how to get there. Decomposes a big goal (dunk, compete in Olympic lifting, run a marathon, recover from ACL surgery) into phases, each with a rationale for why it exists and what it must accomplish before the next one begins. The arc is where trust is built — the athlete can trace any workout back to the goal. Changes rarely. Set at start, adjusted only on fundamental shifts.

**Block (3–6 weeks)** — "What does this phase need to accomplish?"

A training cycle with entry conditions and exit conditions. Each specialist produces their contribution and the head coach merges them into one coherent block plan. Injury adaptation lives here — when the body changes, the block adjusts. Reviewed weekly, formally assessed at block end.

**Week (7 days)** — "How does the plan fit my actual life?"

Maps the block's prescription onto reality. Which days are training, rest, social. What meals need to be prepped, ordered, or grabbed. What exceptions need handling. Set once (Sunday), adjusted as life changes. Proactive — rearrange before things go wrong.

**Day (right now)** — "What do I do?"

Zero-decision execution. The athlete receives today's workout (with numbers to beat), today's meals (with logistics), and a one-line status. Everything else in the system exists to make this layer effortless.

### How layers connect

Planning cascades down: arc generates blocks, blocks generate weeks, weeks generate daily prescriptions.

Data rolls up: daily logs validate weekly compliance, weekly compliance validates block progress, block progress validates the arc trajectory.

Exceptions propagate by severity: "ate off-plan" stays at day. "Working late Thursday" adjusts week. "Shoulder pain at 4" adjusts block. "Can't squat heavy for 8 weeks" adjusts arc.

---

## 2. Roles

Train is a team of specialized AI agents, each with their own domain expertise and objective function. They coordinate through a head coach. Three types of role.

### Orchestrator — Head Coach

The integrator. Doesn't specialize — synthesizes. Takes each specialist's programming and merges it into one plan that doesn't conflict, overload, or leave gaps. Resolves tensions between roles. Owns the arc and block structure. Decides which specialist leads each phase. Determines what gets auto-resolved vs. escalated to the athlete.

*Objective: maximize progress toward goal while keeping athlete healthy, consistent, and trusting the plan.*

### Specialists

Each specialist produces programming in their domain. They negotiate with the head coach to get their priorities into the plan. Specialists are composable — the athlete's goals determine which specialists are on the team.

**Strength / Power** — load progression, volume management, peaking. *Obj: maximize force production.*

**Sport (basketball, ballet, etc.)** — sport-specific skill transfer, conditioning. *Obj: sport performance.*

**Olympic Lifting** — clean, jerk, snatch technique and loading. *Obj: Olympic total.*

**Injury / Mobility** — rehab protocols, prehab, range of motion. *Obj: pain-free ROM, injury prevention.*

**Nutritionist** — body composition, fueling, meal architecture. Operates at all four layers: arc-level strategy (cut/bulk/maintain), block-level calorie phases, weekly meal planning and logistics, daily meal delivery. *Obj: hit body comp targets while fueling training intensity.*

Each specialist produces their own programming. The strength trainer writes the squat progression. The sport trainer writes the jump sessions. They negotiate constraints ("I need the athlete fresh for jump day, so no heavy squats the day before"). The head coach arbitrates.

### Operator — Chief of Staff

Fundamentally different from specialists. Doesn't plan — reduces friction between plan and execution. Makes sure whatever the specialists and head coach decided actually happens in the athlete's real life.

*Objective: zero dropped balls, zero logistics friction.*

Owns: scheduling, exception cascading, grocery lists, meal ordering, appointment booking, reminders, calendar coordination.

The operator has access to external services:

- **Meal delivery** — DoorDash, meal prep services. Pre-built orders from the plan.
- **Grocery** — list generated from weekly meals. Instacart, store pickup.
- **Appointments** — physio, doctor via Lobs. Booked from injury protocols.
- **Calendar** — training blocks on calendar, conflict detection.
- **Reminders** — meal prep, gym time, supplements.

---

## 3. The Plan

The plan is the contract. It's the structured output at each layer that the athlete follows. The promise: follow this and you will hit your goals.

**Arc Plan** — goal, phases, theory, target metrics. Generates the block sequence.

**Block Plan** — decomposes into two sub-plans:
- Training plan: sessions × exercises × loads, with entry/exit conditions and active adaptations
- Nutrition plan: calorie targets × meal architecture, with phase adjustments

Generates weekly prescriptions.

**Weekly Plan** — decomposes into:
- Schedule: days × modes (training/rest/social) × sessions
- Meals: what to eat × how to get it (prepped/order/grab-and-go)
- Logistics: grocery list, prep tasks, pre-decided orders, exception handling

Generates daily prescriptions.

**Daily Prescription** — the atomic unit delivered to the athlete:
- Workout with exercises, loads, and PRs to beat
- Meals with logistics
- One-line context (where in plan, how cut/bulk is tracking)

---

## 4. The Athlete

First-class shared state. Every role reads from and writes to the athlete profile. This is what makes the team coherent — all roles see the same person.

**Goals** — dunk by August, squat 405, cut to 183. The north star(s).

**Body** — current metrics (weight, body comp), trends, recovery status.

**Injuries** — active injuries with pain levels, affected movements, trajectory.

**Constraints** — schedule, equipment access, cooking ability, time availability.

**Preferences** — foods, training style, communication preferences.

**History** — every log, every metric, every exception, every adaptation. Perfect memory.

**Current plan position** — which arc, which block, which week, which day.

---

## 5. Logging

The athlete's primary interface back into the system. Without logging, the system goes blind — no adaptation, no progress tracking, no trust. Logging has its own design challenge: it must be so frictionless that the athlete does it consistently.

### What gets logged

**Session logs** — workout completed as prescribed, or deviations. "Did it" is a complete log when nothing was exceptional. Detailed set-by-set data when the athlete wants to provide it.

**Meal confirmations** — ate the planned meals, or deviated. One-tap confirm. Only requires detail on exceptions ("ate off-plan, had pizza").

**Metrics** — bodyweight, pain levels, readiness, sleep. Type a number, tap a button. Eventually auto-captured from wearables.

**Exceptions** — "shoulder hurts," "traveling Thursday," "dinner out Saturday." Deviations from the plan. The athlete reports, the team handles the response.

**Approvals** — yes/no on proposals from the team. The athlete has veto power on their body.

### The friction gradient

Logging has a spectrum from high-effort to zero-effort. The system should always be pushing toward the zero end.

**Detailed** — set-by-set logging with weight, reps, RPE. High effort, high data. Available when the athlete wants it (especially for PRs or troubleshooting).

**Confirm** — "did it." One tap. System fills in the rest from the plan. The default for meals and routine sessions.

**Exception-only** — system assumes the plan was followed. Athlete only speaks up when something was different. The target state for mature users.

**Auto-captured** — wearables, gym check-ins, location, calendar. Zero effort from the athlete. Eliminates manual input entirely for certain metrics.

The system should learn the athlete's logging pattern and converge toward the least friction possible. If the athlete always does the plan, stop asking and start auto-confirming.

---

## 6. The Feedback Loop

The mechanism that keeps the plan alive. Without it, the plan is a static PDF. Powered by logging.

```
Plan delivered → Athlete executes → Athlete logs → Roles process → Plan adapts → cycle repeats
```

Logging is the input. The feedback loop is the process that consumes it.

### How feedback triggers adaptation

Not every input requires the same response. The system uses stakes-based escalation:

**Auto-resolve** — athlete never sees it. Rest day shift ±1 position. Calories ±100. Pre-approved exercise swaps. Warm-up set adjustments.

**Propose → approve** — show reasoning, get yes/no. Exercise swap off the approved list. Block extension. Calorie target ±150+. Skip session. Training day changes.

**Escalate → conversation** — requires dialogue. Arc-level goal change. Phase resequencing. Injury requiring medical referral. Plan fundamentally not working.

---

## What makes this AI-native

This team structure is how elite athletes actually train. The problem is it costs tens of thousands of dollars and is only available to professionals.

Train makes it accessible by recognizing that each role is fundamentally: domain expertise + objective function + access to the athlete's data. AI agents can embody each role.

The AI-native advantages over a human team:

**Always on.** Exception handling is instant. The team doesn't take weekends off.

**Perfect memory.** Every log, metric, and exception is retained. Relevant history surfaces when it matters.

**Zero coordination overhead.** A human coaching staff has communication problems — the nutritionist doesn't know the PT changed the program. AI roles share state instantly through the athlete profile.

**Composable.** Adding a new specialist (ballet, swimming, rock climbing) doesn't require hiring. It requires adding a new agent with domain knowledge.

**Scalable.** The same architecture serves one athlete or one million. World-class coaching at the cost of API calls.

---

## Design constraints

**Prove it on one.** Build for Andy first. His case is the hardest: multi-sport (dunk + Olympic lifting + powerlifting + flexibility), active injuries (shoulder, wrist), in a cut, busy schedule, history of falling off. If it works here, it works for simpler cases.

**The athlete's only job: show up, do the work, report what happened.** If the athlete is doing the coach's job, the nutritionist's job, or the operator's job, the system has failed.

**Informed but unburdened.** The athlete can always see what the team decided and why. But they never have to make the decision. The rationale is available, not required.

**Numbers to chase.** Seeing "275×6 last time" next to today's prescription is what drives effort. PRs, gap-to-goal metrics, and trend lines are non-negotiable.

**Propose, don't dictate.** When the plan changes, the system proposes and explains. The athlete approves. Trust through transparency.

**Consistency is the product.** Train's job isn't to deliver the perfect program. It's to make following a good program so easy that the athlete never falls off.
