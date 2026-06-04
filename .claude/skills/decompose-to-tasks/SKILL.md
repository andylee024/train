---
name: decompose-to-tasks
description: "Decompose an approved Feature ticket into independent, agent-runnable Task tickets in Linear. Tasks always merge into the feature branch; the feature branch is the human-review surface. Trigger when: user says 'decompose this feature', 'break this into tasks', 'plan the implementation', or invokes `/decompose-to-tasks`."
---

# decompose-to-tasks — Skill Guide

> Take an Approved Feature ticket and produce its child tasks: independently shippable, agent-runnable units that collectively ship the feature.

## The contract this skill enforces

Three rules govern decomposition. Violating any of them is a bug in the decomposition.

1. **Features decompose directly to Tasks. No sub-features, no intermediate level.** A child of a Feature is always a `Task`. If a "task" feels too big to be one PR, it's two tasks — not a sub-feature.
2. **One task = one PR.** Each task ships as one focused PR (≤ 200 LOC, ≤ 5 files, one concern). Task PRs target the **feature branch** (`feat/<feature-slug>`), not main.
3. **The feature PR is the human-review surface.** When all task PRs have merged into the feature branch, the feature branch opens **one** PR against main. The human reviews that. Task PRs are agent / code-reviewer territory.

```
                main
                  ▲
                  │  feature PR (← human reviews this)
                  │
              feat/<slug>                        ← feature branch
                  ▲
        ┌─────────┼─────────┐
        │         │         │
   task PRs (← agent + code-reviewer; small, focused)
   tr-XXX     tr-YYY     tr-ZZZ
```

## Canonical task content format

Every task ticket's description follows this shape exactly:

```markdown
**Depends on:** <task IDs or "none">
**Parallel-safe:** yes / no

## Build
1. <numbered recipe a coder agent can execute without further conversation>
2. ...

## Acceptance criteria
- [ ] <machine-checkable bullet — file exists, tsc clean, curl returns N, log line present, etc.>
- [ ] ...

## Files
- `path/to/file.ext` — (new | modified)
- ...

## Verifiable
<one sentence — how the auto-gate or code-reviewer confirms it works>
```

That's it. No "Why" section (lives on the parent feature). No "Out of scope" (the feature owns scope). No ASCII mockups (those belong on the feature). The task is the recipe.

## What this skill does

1. Reads the approved Feature ticket + PRD + SPEC + relevant codebase
2. Thinks through the technical approach (no separate RFC document — tasks ARE the approach)
3. Proposes a task list to the user for shape-approval (count, ordering, dependencies)
4. Writes each task as a Linear child ticket with `parentId` set to the Feature ticket
5. Transitions the Feature ticket from Approved → In Progress
6. Reports the task summary

## When NOT to use this skill

- Feature is still in Backlog (no spec yet) — run `/spec-feature` first
- Feature is already In Progress (tasks exist) — modify or add tasks individually
- Feature is In Review or Done — feature is past decomposition

## Inputs

`$ARGUMENTS` = the Feature ticket ID (e.g. `TR-337`).

If `$ARGUMENTS` is empty, ask the user which feature to decompose. Show the list of `Approved` features in Linear if they're unsure.

## Process

### Step 1 — Ground yourself

Read:
- The Feature ticket via `mcp__claude_ai_linear__get_issue`
- `/PRD.md` and `/SPEC.md`
- The files most likely to change (inferred from the spec's flow + key screens sections)
- Any existing patterns in those files — you'll either extend them or break them

Spend real time here. The quality of decomposition depends on understanding what's already there.

### Step 2 — Think through the approach

Before drafting tasks, mentally answer:

- **Shape:** What's the simplest implementation that satisfies the feature's definition of done? Reference existing patterns.
- **Sequence:** What must be built first to unblock the rest? What can be parallel?
- **Data + API shape:** Any new types, columns, routes? Write them in your head verbatim before drafting tasks.
- **Risks:** Top 2-3 things that could go wrong. Each task should reduce one or design around it.

This thinking shapes the task list. You don't have to write it down separately — the tasks should embody it.

### Step 3 — Draft the task list

Each task must satisfy the contract above (one PR, child of the Feature, canonical content format). Draft this proposal for the user before writing to Linear:

```
Decomposed <Feature title> into <N> tasks targeting feat/<slug>:

## Task 1: <short imperative title>
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
Phase A (parallel-safe): Task 1, Task 2, Task 3
Phase B (after A): Task 4
Phase C (after B): Task 5
```

### Step 4 — Get shape approval

Show the user the draft. Ask: "Shape OK? Anything to add, drop, or reorder?"

You're asking about **shape**, not about each task's details. The user reviews:
- Number of tasks (too many = scope creep; too few = under-decomposed)
- Ordering (dependencies make sense?)
- Coverage (do they collectively ship the feature's definition of done?)
- Parallel opportunities

If they push back on a specific task's details, adjust just that task and re-show. Don't write to Linear until they approve.

### Step 5 — Write to Linear

For each task, use `mcp__claude_ai_linear__save_issue` with:

- `title`: `Task: <short imperative>` — **always prefix with "Task:"**, never "Feature:" or "Improvement:" or "Bug:". Child tickets are always tasks.
- `team`: `Train`
- `project`: `train`
- `parentId`: the Feature ticket ID — critical, makes it a child
- `state`: `Backlog` — queued, awaiting agent pickup
- `priority`: inherit from Feature ticket
- `description`: the canonical task content format (Depends on / Parallel-safe / Build / Acceptance criteria / Files / Verifiable)

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

Feature branch: feat/<slug>  (tasks will PR into this; feature PR opens to main when all tasks land)
Feature ticket: <URL>        (now In Progress)
Tasks: all created in Backlog, awaiting agent pickup.

Agents reading the queue will pick from Phase A first.
```

## Style notes

- **Always prefix task titles with `Task:`.** Never `Feature:` / `Improvement:` / `Bug:`. The parent already provides the feature framing; children are always tasks.
- **Each task's `Build` section is a recipe an agent executes without thinking.** Numbered, concrete, no ambiguity.
- **Each `Acceptance criteria` bullet must be machine-verifiable.** "File exists at X", "`tsc --noEmit` clean", "`curl /api/Y` returns 200 with shape Z". Avoid subjective bullets ("looks good", "feels right").
- **Use `Parallel-safe: no` only when there's a real serial dependency** (e.g., task 2 reads a function task 1 creates). Don't be over-cautious — parallel tasks ship faster.
- **Don't pre-allocate file paths if you're not sure they're the right ones.** List the directory and let the build agent pick the right file.
- **If you find an open question during decomposition that wasn't in the spec, STOP.** Don't invent an answer — bounce back to the user: "Decomposing surfaced this question: …  Should we update the feature spec?"

## Failure modes to avoid

- **Children typed as `Feature:` instead of `Task:`.** Breaks the feature→task contract. If a task feels too big to be one PR, split into two tasks. Don't introduce sub-features.
- **Tasks that are too big.** If one task touches 10 files or >200 LOC, split it.
- **Tasks that aren't independently testable.** Each task's acceptance criteria must be checkable without the others having merged first (or the dependency must be declared and the criteria adjusted).
- **Skipping shape approval.** Don't dump 8 tickets into Linear without the user nodding on the count + order.
- **Modifying the Feature ticket's spec.** That's frozen at Approved. Tasks live below it.
- **Adding "Why" / "Out of scope" / "Open questions" sections to a task.** Those belong on the parent feature. The task is the recipe, not the spec.
- **Adding labels.** No labels needed. parent/child does the work.
- **Setting tasks to In Progress directly.** They're Backlog. An agent moves them to In Progress when picking up.

## What "done" looks like for this skill

- N child tickets exist in Linear, all titled `Task: <…>`, all in Backlog, all with `parentId` set to the Feature ticket
- Each task's description follows the canonical content format exactly
- The Feature ticket has transitioned from Approved → In Progress
- Dependencies are recorded via `blockedBy` where needed
- The user has explicitly approved the task list shape
