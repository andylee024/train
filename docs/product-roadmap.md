# Train — Product Roadmap

Seven milestones from foundation to full operator services. Each milestone produces something usable — no milestone is pure infrastructure.

**Guiding principle:** Prove it on Andy first. His case is the hardest (multi-sport, active injuries, cutting, busy schedule). If it works here, it works for simpler cases.

---

## M0 — Foundation

**Goal:** Clean repo, canonical docs, real training data in markdown.

**Scope:**
- System architecture doc finalized (done)
- Product roadmap doc (this file)
- Repo cleaned of stale prototypes, superseded docs, unused migrations
- Block plans and weekly plans validated and current
- Athlete profile in markdown (goals, body, injuries, constraints, preferences, history pointers)
- Schema doc updated to reflect current thinking

**Exit condition:** Someone new could clone the repo, read 2-3 docs, and understand exactly what Train is and where it's headed.

---

## M1 — Multi-Agent Discussion

**Goal:** Demonstrate the team architecture with real AI agents producing a real plan.

**Scope:**
- Each specialist role as an LLM agent (system prompt = domain expertise + objective function)
- Real athlete data (Andy's profile, injury status, goals) as shared context
- Head Coach agent that synthesizes specialist outputs into one coherent plan
- Observable discussion: see each specialist's reasoning and the negotiation between them
- Output: a block plan that Andy would actually follow

**Exit condition:** Run the agent team against Andy's current state. The plan it produces is at least as good as what Andy would write himself, and the discussion is transparent enough to build trust.

---

## M2 — Dashboard

**Goal:** Display the plan in a clean webapp that makes the system legible.

**Scope:**
- Arc view: goal, phases, theory, progress toward dunk
- Block view: current training + nutrition block with entry/exit conditions
- Week view: schedule, meals, logistics for the current week
- Daily view: today's workout with numbers to chase (PRs to beat), today's meals
- Numbers to chase everywhere: last performance, gap to goal, trend lines

**Exit condition:** Andy can open the dashboard Sunday night, understand where he is in the arc, what this week looks like, and feel confident in the plan. Daily view replaces any need to think about what to do.

---

## M3 — Daily Text (Push Interface)

**Goal:** Morning text message that IS the product for daily execution.

**Scope:**
- Daily prescription delivered via text (WhatsApp or SMS)
- Workout with exercises, loads, and PRs to beat
- Meals with logistics (what to eat, how to get it)
- One-line context (where in plan, how cut is tracking)
- Reply-based interaction for exceptions ("shoulder hurts", "traveling Thursday")

**Exit condition:** Andy wakes up, reads one message, knows exactly what to do today. No app required for daily execution.

---

## M4 — Logging & Feedback Loop

**Goal:** Athlete reports back, system adapts.

**Scope:**
- Session logging: "did it" (one tap) or detailed set-by-set
- Meal confirmations: one-tap confirm, detail only on exceptions
- Metrics: bodyweight, pain levels, readiness
- Exception reporting: deviations from plan
- Feedback loop: logs flow up through layers, trigger appropriate adaptation
- Stakes-based escalation: auto-resolve (low stakes) → propose/approve (medium) → escalate/conversation (high)
- NanoClaw integration for logging interface

**Exit condition:** Andy logs a session and a meal deviation. The system processes both — auto-adjusts what it can, proposes changes for what needs approval, and the next day's prescription reflects the new information.

---

## M5 — Exception Engine

**Goal:** Handle the things that knock athletes off plan.

**Scope:**
- Exception taxonomy: body (injury, soreness, fatigue), schedule (travel, late work, social), nutrition (off-plan meal, missed prep), equipment (gym closed, no kitchen)
- Severity routing: which layer each exception affects (day → week → block → arc)
- Auto-resolve rules: pre-approved swaps, minor calorie adjustments, rest day shifts
- Propose/approve flow: exercise substitutions, block extensions, calorie target changes
- Escalation triggers: when to surface a conversation instead of a proposal

**Exit condition:** Andy reports "shoulder pain at 4" → system proposes specific exercise swaps with reasoning → Andy approves → next workout reflects the change. Andy reports "dinner out Saturday" → system auto-adjusts calorie budget for the day and adjusts surrounding days.

---

## M6 — Operator Services

**Goal:** Chief of Staff handles logistics so the athlete doesn't.

**Scope:**
- Grocery lists generated from weekly meal plan (Instacart integration)
- Meal ordering: pre-built DoorDash/meal prep service orders from the plan
- Appointment booking via Lobs (physio, doctor) from injury protocols
- Calendar integration: training blocks on calendar, conflict detection
- Reminders: meal prep, gym time, supplements
- Social event meal budgeting: pre-decide restaurant orders

**Exit condition:** Andy's Sunday weekly plan includes a grocery list that's one tap from ordered, pre-built meal delivery orders for busy days, and a physio appointment auto-suggested from his injury protocol. Zero logistics friction.

---

## What's deliberately deferred

- **Supabase / database**: Stay in markdown until data needs to be queried across time. The schema doc exists for when we're ready.
- **Multi-athlete support**: Architecture is designed for it (composable specialists, athlete profile as shared state), but we build for Andy first.
- **Wearable integration**: Auto-capture logging is in the friction gradient design but comes after manual logging works.
- **Mobile app**: Text + webapp covers the interface needs. Native app is a scale concern.
