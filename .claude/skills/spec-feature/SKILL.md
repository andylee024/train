---
name: spec-feature
description: "Conduct a feature-shaping interview with the user, then create a Feature ticket in Linear with a 5-section PM-spec artifact (Problem, Solution, Scope, Definition of done, Open questions). Use this when the user wants to define a new feature for Train. Trigger when: user says 'spec a feature', 'shape a feature', 'I want to build X', or invokes `/spec-feature`."
---

# spec-feature — Skill Guide

> Pair-shape a new Train feature through a short interview, then write it to Linear as a Feature ticket in the canonical PM-spec format.

## What this skill does

1. Reads PRD.md, SPEC.md, and recent decisions to ground the conversation
2. Conducts a short interview with the user, one question at a time
3. Drafts a 5-section spec artifact and lets the user edit before committing
4. Writes a Feature ticket to Linear (`project: train`, no parent, status Approved)
5. Reports the ticket URL and suggests `/decompose-to-tasks` as the next step

## The spec is the PM's review surface

This skill's output is what a human PM reads when deciding "approve or push back" on a feature. Five sections, each answering one question:

1. **Problem** — *Why are we building this?*
2. **Solution** — *What is it?*
3. **Scope** — *What aren't we doing?*
4. **Definition of done** — *How do we know it shipped?*
5. **Open questions** — *What could trip this up?*

If any section is missing, the PM can't approve confidently. If extra content exists outside those five, it's either fluff or belongs elsewhere (PRD, design file, sub-task). The five sections are the contract.

## When NOT to use this skill

- If the feature is < 1 file of code worth of work — just open a ticket directly
- If we're shipping a bug fix from a known cause — skip the interview, write the ticket
- If a Feature ticket for this idea already exists — reopen the existing one

## Inputs

`$ARGUMENTS` = a short name for the feature (the user provides this when invoking the skill). Examples:
- `/spec-feature ROM SMS logging`
- `/spec-feature compare view for coaches`

If `$ARGUMENTS` is empty, ask the user for the feature name first.

## Process

### Step 1 — Ground yourself

Before asking anything, read:
- `/PRD.md` (vision + scope + success criteria)
- `/SPEC.md` (architecture + tech stack)
- `/docs/product/decisions.md` (prior decisions to respect)

Surface anything from these docs that constrains the feature you're about to shape. Mention constraints inline as you interview.

### Step 2 — Interview

Ask **one question at a time**. Wait for the user's reply before moving on. Don't batch.

Aim for 4–6 questions, drawing from this list (skip any you already know the answer to). Each question maps to a section of the artifact:

1. **Who feels the pain today, and what can't they do?** *(→ §1 Problem)*
   Frames the user's voice and why this matters now. Push for a PRD section to anchor to.

2. **Describe the experience step-by-step — what does the user see and do?** *(→ §2 Solution / The flow)*
   Walk through the screens / surfaces. If they can't describe the flow, the feature is too vague to spec.

3. **What are the 4–6 shape decisions that constrain how this gets built?** *(→ §2 Solution / Key product decisions)*
   E.g. "12 coaches not unlimited", "cart 2–4 not 1–10". Each decision has a one-line *why*.

4. **What's explicitly out of scope?** *(→ §3 Scope)*
   Force a "no" to something. If they can't, the feature is too big.

5. **How will the PM verify it shipped?** *(→ §4 Definition of done)*
   Outcomes the PM can walk and confirm — not tasks the engineer does. "Athlete completes the flow at 414px without console errors" beats "Mobile responsive sweep".

6. **Are there open decisions that block implementation?** *(→ §5 Open questions)*
   Decisions that aren't made yet. Include the recommended default if applicable.

If the user gives a vague answer, probe once. If still vague, write it as an Open Question and move on.

### Step 3 — Draft the artifact

Once the interview is done, draft this artifact and show it to the user before writing to Linear. Use real content from the interview — don't leave placeholders.

```markdown
# Feature: <name>

## 1. Problem

1 short paragraph. Who feels the pain today, what they can't do, why it matters now. Anchor to a PRD section if applicable.

## 2. Solution

### What the user experiences

2–3 sentences in plain English. What shipping looks like for the user. The "press release" line: someone reads this and gets the feature in 10 seconds.

### The flow

ASCII diagram of the user's path through the feature. Use boxes for screens / states, arrows for transitions, branches where they exist. Annotations on the right explain each step.

```
       ┌─────────┐
       │ Step 1  │  one-line annotation
       └────┬────┘
            ▼
       ┌─────────┐
       │ Step 2  │  ...
       └─────────┘
```

### Key screens *(optional but encouraged for UI features)*

For the 2–3 highest-stakes surfaces, an ASCII mockup. Skip mockups for screens that are obvious from the flow. Pick the *commitment moments* (where decisions happen) and the *output moments* (what the user leaves with).

### Key product decisions

Table format. Each row is one shape choice and the *why*.

| Decision | Why |
|---|---|
| Concrete choice | One-line rationale |
| ... | ... |

## 3. Scope

**In:**
- Concrete bullets — the work this feature covers

**Out:**
- **Item** — One-line reason it's deferred (link to ticket/decision if applicable)
- ...

## 4. Definition of done

A PM walking the deployed feature can confirm each of these:

- Outcomes the PM verifies by walking the feature, not tasks the engineer does
- 5–8 items max
- Includes ergonomic / quality gates (e.g. `npx tsc --noEmit` clean) where load-bearing

## 5. Open questions

*None outstanding* if there genuinely are none — that's a good signal. Otherwise: numbered list, each with the recommended default if applicable. **Resolve here, not in PR comments.**
```

Show this draft to the user. Ask: "Edit anything? Otherwise I'll write it to Linear."

If they edit, apply the edit and re-confirm. Loop until they approve.

### Step 4 — Write to Linear

Use `mcp__claude_ai_linear__save_issue` with:

- `title`: `Feature: <name>`
- `team`: `Train`
- `project`: `train`
- `state`: `Approved`  ← important: not Backlog. This signals "spec done, ready to decompose."
- `priority`: ask the user (default 2 = High)
- `description`: the approved artifact

Don't set any labels. Don't set a parent. Don't add any sub-tickets. Don't include appetite, phases, branches, or PR numbers in the description — those are tracking metadata, not spec content.

### Step 5 — Report

Reply to the user with:

```
Feature ticket created: <Linear URL>
Status: Approved (spec drafted)
Next: run /decompose-to-tasks <ticket-id> when ready
```

## Style notes

- **Don't pretend to know what the user wants.** If they're vague, ask.
- **Don't volunteer technical details during the interview.** That's for `/decompose-to-tasks`.
- **Specs are about WHAT, not HOW.** Don't speculate about implementation.
- **Don't suggest scope expansions.** Specs are about what fits, not what would be nice.
- **Use ASCII for visual concreteness.** A flow diagram or screen mockup beats a paragraph. If the PM can't picture the screen, they can't approve the feature.
- **Definition of done = outcomes, not tasks.** "Athlete gets a personalized plan in 30–60s" — not "Implement synthesis endpoint".
- **No project state in the description.** Phases, branch names, PR numbers, appetite estimates — those live on the Linear ticket's metadata fields or sub-tasks, not in the spec body.
- **Length is not capped by word count.** It's capped by *information density*. A 600-word spec with a flow diagram and 2 mockups can be tight; a 200-word spec with no concrete content is sloppy. Cut filler, not signal.

## Failure modes to avoid

- **Burying the interview in pre-written assumptions.** Ask questions, don't propose.
- **Skipping the user-approval step before writing to Linear.** Always show the draft first.
- **Setting state to Backlog or In Progress instead of Approved.** Approved means "we agreed on this; it's ready to decompose."
- **Adding sub-tickets in this skill.** Decomposition is a separate concern — `/decompose-to-tasks` owns that.
- **Writing an AC checklist instead of outcome statements.** "[ ] Build the marketplace page" is project work. "Athlete can pick 2–4 coaches and the picks persist across reload" is what shipping means.
- **Skipping ASCII for visual features.** If a flow has 4+ steps or the UI is non-obvious, the spec needs a diagram or it isn't reviewable.

## What "done" looks like for this skill

A Feature ticket exists in Linear at state Approved, containing a 5-section PM-spec artifact the user explicitly approved. The spec reads as a standalone document that a PM can verify against the deployed feature without reading sub-tasks or PRs.
