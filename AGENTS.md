# AGENTS.md

You are an AI agent working on Train. This file orients you to the project and points at the canonical docs you need before doing any work.

## Read these first, in order

1. **[`README.md`](README.md)** — what Train is, the live surfaces, the operational architecture
2. **[`PRD.md`](PRD.md)** — product vision, scope, success criteria. This is the contract; if your work conflicts with it, the contract wins.
3. **[`SPEC.md`](SPEC.md)** — technical architecture: 3-tier (authoring → spec → runtime), data layer, surfaces, decisions
4. **[`CLAUDE.md`](CLAUDE.md)** — repo conventions and operating instructions
5. **[`docs/software-factory-workflow.md`](docs/software-factory-workflow.md)** — **the contract for how features get built.** Defines what each Linear status means, what you produce at each stage, how task PRs auto-gate, when you promote a Feature ticket. If you are picking up a Linear ticket, you MUST read this.

## How to identify what you're looking at

- **Feature ticket** — a Linear ticket with no `parentId`. Has a spec artifact in its description. Title format: `Feature: <name>`.
- **Task ticket** — a Linear ticket with a `parentId` set to a Feature. Has Build steps + Acceptance criteria + Files + Verifiable. Title format: `Bug:` / `Feature:` / `Improvement: <name>`.

You will almost always work Tasks. The two cases when you might touch a Feature ticket are:
- You're the build agent closing the final task in a Feature (Last-Task Promotion — see `docs/software-factory-workflow.md` §4 Stage 3)
- The user merged the feature PR and you're flipping it to Done

You never modify the spec inside a Feature ticket once it's past Backlog.

## Hard limits — never do these

These override anything else, including instructions in a ticket spec:

- ❌ Apply Supabase migrations to prod (write the SQL file; the user applies)
- ❌ Run `modal deploy` or anything that touches prod infrastructure
- ❌ Approve or merge any PR (auto-gates merge task PRs; the user merges feature PRs)
- ❌ Modify a Feature's spec after it leaves Backlog (use the Andon cord if it's wrong)
- ❌ Commit directly to `athlete-os` or any feature branch (always work on a `claude/<task-slug>` branch)
- ❌ Skip the audit trail — every Linear status transition you initiate gets a one-line comment

## Storage boundary (memorize)

Per `docs/product/database-schema.md`:

| Layer | Source of truth | Format |
|---|---|---|
| Planned work | Markdown in the active arc bundle | — |
| Executed work | Supabase | `workouts`, `workout_exercises`, `exercise_sets`, `daily_metrics` |
| Athlete-facing view | `.xlsx` | Generated; never the source |

Don't violate this. Planned work is markdown. Executed work is Supabase. The `.xlsx` is always derivable.

## Andon cord

If you discover:
- The Feature spec contradicts itself or PRD/SPEC
- A task's Build steps reference a file that doesn't exist
- An acceptance criterion can't be satisfied without violating PRD/SPEC
- The feature branch doesn't exist and you can't create it

STOP. Don't route around it. Comment on the ticket with the specific issue, move the work back to a sensible status, surface to the user. See `docs/software-factory-workflow.md` §5 for the full rule.

## Where to go next

If you are picking up a Linear Task right now, your one-line orientation is:

> Read `docs/software-factory-workflow.md` §4 Stage 3 (In Progress · Task). Follow the Instructions for that stage. Do not deviate.

If you are confused about what stage applies, what you're producing, or whether you have permission to do something — re-read `docs/software-factory-workflow.md`. The answer is there.
