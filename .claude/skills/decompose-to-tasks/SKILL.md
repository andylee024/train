---
name: decompose-to-tasks
description: "Decompose an approved Feature ticket into independent, agent-runnable Task tickets in Linear. Use this after `/spec-feature` has produced an Approved feature. Trigger when: user says 'decompose this feature', 'break this into tasks', 'plan the implementation', or invokes `/decompose-to-tasks`."
---

# decompose-to-tasks — Skill Guide

> Take an Approved Feature ticket and produce its sub-tasks: independently shippable, well-specified, and ready for autonomous agents to execute.

## What this skill does

1. Reads the approved Feature ticket + PRD + SPEC + relevant codebase
2. Thinks through the technical approach (no separate RFC document — tasks ARE the approach)
3. Proposes a task list to the user for shape-approval (count, ordering, dependencies)
4. Writes each task as a Linear child ticket with `parentId` set to the Feature ticket
5. Transitions the Feature ticket from Approved → In Progress
6. Reports the task summary and what agents will see

## When NOT to use this skill

- Feature is still in Backlog (no spec yet) — run `/spec-feature` first
- Feature is already In Progress (tasks exist) — modify or add tasks individually
- Feature is In Review or Done — feature is past decomposition

## Inputs

`$ARGUMENTS` = the Feature ticket ID (e.g. `A24-330`).

If `$ARGUMENTS` is empty, ask the user which feature to decompose. Show the list of `Approved` features in Linear if they're unsure.

## Process

### Step 1 — Ground yourself

Read:
- The Feature ticket via `mcp__claude_ai_linear__get_issue`
- `/PRD.md` and `/SPEC.md`
- The files most likely to change (inferred from the spec's "What the user sees" section)
- Any existing patterns in those files — you'll either extend them or break them

Spend real time here. The quality of decomposition depends on understanding what's already there.

### Step 2 — Think through the approach

Before drafting tasks, mentally answer:

- **Shape:** What's the simplest implementation that satisfies all acceptance criteria? Reference existing patterns.
- **Sequence:** What must be built first to unblock the rest? What can be parallel?
- **Data + API shape:** Any new types, columns, routes? Write them in your head verbatim before drafting tasks.
- **Risks:** Top 2-3 things that could go wrong. Each task should reduce one or design around it.
- **Rejected alternatives:** Did you consider a "clever" approach you talked yourself out of? Note it.

This thinking shapes the task list. You don't have to write it down separately — the tasks should embody it.

### Step 3 — Draft the task list

Each task should be:
- One focused PR (~3-5 files, < 200 LOC)
- Independently testable
- Numbered in dependency order
- Marked parallel-safe if applicable
- Concrete enough that an agent can execute without further conversation

Draft this proposal for the user before writing to Linear:

```
Decomposed <Feature title> into <N> tasks:

## Task 1: <title>
**Depends on:** none
**Parallel-safe:** yes/no

### Build
1. ...
2. ...

### Acceptance criteria
- [ ] verifiable bullet

### Files
- path/to/file.ext (new | modified)

### Verifiable
One sentence — how the auto-gate confirms it works.

---

## Task 2: ...
(same structure)

---

Sequential phases:
Phase A (parallel): Task 1, Task 2, Task 3
Phase B (after A): Task 4
Phase C (after B): Task 5
```

### Step 4 — Get shape approval

Show the user the draft. Ask: "Shape OK? Anything to add, drop, or reorder?"

You're asking about **shape**, not about each task's details. The user reviews:
- Number of tasks (too many = scope creep; too few = under-decomposed)
- Ordering (dependencies make sense?)
- Coverage (do they collectively satisfy the Feature's acceptance criteria?)
- Parallel opportunities

If they push back on a specific task's details, adjust just that task and re-show.

Don't write to Linear until they approve.

### Step 5 — Write to Linear

For each task, use `mcp__claude_ai_linear__save_issue` with:

- `title`: `<Bug|Feature|Improvement>: <task-title>`
- `team`: `Train`
- `project`: `train`
- `parentId`: the Feature ticket ID  ← critical, makes it a child
- `state`: `Backlog`  ← queued, awaiting agent pickup
- `priority`: inherit from Feature ticket
- `description`: the task content (Depends on / Build / Acceptance criteria / Files / Verifiable / Parallel-safe)

Set dependencies via the `blockedBy` field where applicable.

Don't set labels. Don't set assignees.

### Step 6 — Transition the Feature ticket

Update the Feature ticket via `mcp__claude_ai_linear__save_issue`:
- `id`: the Feature ticket ID
- `state`: `In Progress`

This signals "tasks decomposed; agents may start."

### Step 7 — Report

Reply to the user with:

```
Feature <Feature ID> decomposed into <N> tasks:

Phase A (parallel-safe): <task ids>
Phase B (after A):       <task ids>
Phase C (after B):       <task ids>

Feature ticket: <URL> (now In Progress)
Tasks: all created in Backlog, awaiting agent pickup.

Agents reading the queue will pick from Phase A first.
```

## Style notes

- Each task's `Build` section should read like a recipe an agent can execute without thinking.
- Each `Acceptance criteria` bullet must be machine-verifiable (curl response, file existence, tsc clean, etc.).
- Use `Parallel-safe: no` only when there's a real serial dependency (e.g. task 2 needs a function task 1 creates). Don't be over-cautious — parallel tasks ship faster.
- Don't pre-allocate file paths if you're not sure they're the right ones. List the directory and let the build agent pick the right file.
- If you find an open question during decomposition that wasn't in the spec, STOP. Don't invent an answer — bounce back to the user with: "Decomposing surfaced this question: …  Should we update the spec?"

## Failure modes to avoid

- **Tasks that are too big.** If one task touches 10 files, split it.
- **Tasks that aren't independently testable.** Each task's acceptance criteria must be checkable without the others having merged first.
- **Skipping shape approval.** Don't dump 8 tickets into Linear without the user nodding on the count + order.
- **Modifying the Feature ticket's spec.** That's frozen at Approved. Tasks live below it.
- **Adding labels.** No labels needed. Parent/child does the work.
- **Setting tasks to In Progress directly.** They're Backlog. An agent moves them to In Progress when picking up.

## What "done" looks like for this skill

- N Task tickets exist in Linear, all in Backlog, all with `parentId` set to the Feature ticket
- The Feature ticket has transitioned from Approved → In Progress
- The user has explicitly approved the task list shape
- Dependencies are recorded via `blockedBy` where needed
