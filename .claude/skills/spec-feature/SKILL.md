---
name: spec-feature
description: "Conduct a feature-shaping interview with the user, then create a Feature ticket in Linear with the spec artifact. Use this when the user wants to define a new feature for Train. Trigger when: user says 'spec a feature', 'shape a feature', 'I want to build X', or invokes `/spec-feature`."
---

# spec-feature — Skill Guide

> Pair-shape a new Train feature through a short interview, then write it to Linear as a Feature ticket.

## What this skill does

1. Reads PRD.md, SPEC.md, and recent decisions to ground the conversation
2. Conducts a 4-6 question interview with the user, one question at a time
3. Drafts a spec artifact and lets the user edit before committing
4. Writes a Feature ticket to Linear (`project: train`, no parent, status Approved)
5. Reports the ticket URL and suggests `/decompose-to-tasks` as the next step

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

Aim for 4-6 questions, drawing from this list (skip any you already know the answer to):

1. **Who is this for and what are they doing when they need it?**
   (Frames the user's voice and the trigger moment.)

2. **What does done look like? What can the user verify works?**
   (Push for 3-5 concrete acceptance criteria. If they say "make it better," ask what specifically.)

3. **What's explicitly out of scope?**
   (Force a "no" to something. If they can't, the feature is too big.)

4. **Any non-obvious constraints?**
   (Data model changes? External API? Performance? Design system?)

5. **Are there open decisions that block scope?**
   (Decisions they need to make before we can decompose. Note as Open Questions.)

6. **What's the appetite?**
   (1 day / 2-3 days / 1 week. Borrowed from Shape Up. Forces scoping by time-budget instead of estimation.)

If the user gives a vague answer, probe once. If still vague, write it as an Open Question and move on.

### Step 3 — Draft the artifact

Once the interview is done, draft this artifact and show it to the user before writing to Linear. Use real content from the interview — don't leave placeholders.

```markdown
# Feature: <name>

## Why
1 paragraph in the user's voice. The problem this solves and who feels it.
Reference the relevant PRD section if applicable.

## Acceptance criteria
- [ ] verifiable bullet
- [ ] verifiable bullet
- [ ] verifiable bullet

## Out of scope
- explicit item the user said "no" to
- explicit item the user said "no" to

## What the user sees when this ships
3-4 sentences. What does the SMS say? What does the dashboard look like?
What new behavior is visible? Write it like a press release for the athlete,
not for a developer.

## Open questions
1. Numbered. Each blocks part of the technical approach.
   Include the recommended default if the user doesn't decide.
2. ...

## Appetite
<1 day | 2-3 days | 1 week>
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

Don't set any labels. Don't set a parent. Don't add any sub-tickets.

### Step 5 — Report

Reply to the user with:

```
Feature ticket created: <Linear URL>
Status: Approved (spec drafted)
Next: run /decompose-to-tasks <ticket-id> when ready
```

## Style notes

- Don't pretend to know what the user wants. If they're vague, ask.
- Don't volunteer technical details during the interview. That's for `/decompose-to-tasks`.
- Don't speculate about implementation. Specs are about WHAT, not HOW.
- Don't suggest scope expansions. Specs are about what fits the appetite, not what would be nice.
- Don't write more than 300 words in the final artifact. If you can't fit it, the feature is too big — interview again to split it.

## Failure modes to avoid

- **Burying the interview in pre-written assumptions.** Ask questions, don't propose.
- **Skipping the user-approval step before writing to Linear.** Always show the draft first.
- **Setting state to Backlog or In Progress instead of Approved.** Approved means "we agreed on this; it's ready to decompose."
- **Adding sub-tickets in this skill.** Decomposition is a separate concern — `/decompose-to-tasks` owns that.

## What "done" looks like for this skill

A Feature ticket exists in Linear at state Approved, containing a spec artifact the user explicitly approved. Nothing else.
