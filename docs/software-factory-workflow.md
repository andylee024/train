# Train — Software Factory Workflow

How features get built on Train. This document is the contract between Andy and the AI agents working on the product.

If you're an AI agent picking up work, the diagram below shows where you fit. Then read the stage contract for your status (§ "Stage contracts"). Don't deviate.

---

## The whole picture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TRAIN SOFTWARE FACTORY                                 │
│                  4 Personas · 6 Linear Statuses · 1 Workflow                    │
└─────────────────────────────────────────────────────────────────────────────────┘


   ANDY                          PERSONAS                       ARTIFACTS
   ────                          ────────                       ─────────


 ┌──────┐
 │ idea │ "I want X" (type into Linear or terminal)
 └──┬───┘
    │
    ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ FEATURE @ Backlog                                                            │
 │   ────────────────                                                           │
 │   title only; no spec yet; nothing agreed                                    │
 │   Andy creates this manually in Linear, or invokes /spec-feature directly    │
 └──┬───────────────────────────────────────────────────────────────────────────┘
    │
    │  /spec-feature <name>
    │  ───────────────────────────────────────
    │                                          ▼
    │                          ┌─────────────────────────────┐
    │  Andy answers            │  🎯 PRODUCT MANAGER         │
    │  4-6 questions   ◄───────┤   interviews, one question  │
    │  one at a time           │   at a time. Reads PRD/SPEC │
    │                          │   first. Writes spec in     │
    │                          │   Andy's voice.             │
    │                          │                             │
    │                          │   Output artifact:          │
    │                          │   - Why (1 paragraph)       │
    │                          │   - Acceptance criteria     │
    │                          │   - Out of scope            │
    │                          │   - What user sees on ship  │
    │                          │   - Open questions          │
    │                          │   - Appetite (1d/2-3d/1w)   │
    │                          └────────────┬────────────────┘
    │                                       │
    ▼                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ FEATURE @ Approved                                                           │
 │   ─────────────────                                                          │
 │   spec drafted, Andy approved, ready to decompose                            │
 │   Frozen here. Nobody touches the spec from this point forward.              │
 └──┬───────────────────────────────────────────────────────────────────────────┘
    │
    │  /decompose-to-tasks <feature-id>
    │  ───────────────────────────────────────
    │                                          ▼
    │                          ┌─────────────────────────────┐
    │                          │  🏗️  TECH LEAD              │
    │                          │   reads the codebase,       │
    │                          │   thinks: shape / sequence  │
    │                          │   / data shape / risks /    │
    │                          │   rejected alternatives,    │
    │                          │   then drafts N tasks.      │
    │                          │                             │
    │                          │   Each task ~3-5 files,     │
    │  Andy approves           │   <200 LOC, independently   │
    │  the SHAPE       ◄───────┤   testable. Parallel-safe   │
    │  (count + order)         │   flagged. Dependencies     │
    │                          │   recorded.                 │
    │                          └────────────┬────────────────┘
    │                                       │
    │                                       │ writes children
    │                                       │ (parentId set)
    │                                       │ promotes Feature
    ▼                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ FEATURE @ In Progress                                                        │
 │   ──────────────────                                                         │
 │   N child Tasks @ Backlog · all parented to this Feature                     │
 │   Feature branch `feat-<slug>` created (Coder will if missing)               │
 │                                                                              │
 │   ┌────────────────────────────────────────────────────────────────────┐     │
 │   │  TASK 1 @ Backlog    TASK 2 @ Backlog    TASK 3 @ Backlog          │     │
 │   │       │                   │                   │                    │     │
 │   │       │ (pull-based pickup by Coders, parallel-safe runs in parallel)    │
 │   │       │                   │                   │                    │     │
 │   │       ▼                   ▼                   ▼                    │     │
 │   │  ┌──────────────────────────────────────────────────────────┐      │     │
 │   │  │ 🔨 CODER (one per task, runs in worktree)                │      │     │
 │   │  │   reads ticket + parent + PRD/SPEC + AGENTS.md           │      │     │
 │   │  │   branches claude/<task-slug> off feat-<slug>            │      │     │
 │   │  │   implements per Build steps                             │      │     │
 │   │  │   commits, tests, screenshots                            │      │     │
 │   │  │   opens draft PR → feat-<slug>                           │      │     │
 │   │  │   Andon cord: STOP if spec is wrong                      │      │     │
 │   │  └──────────────────────────────────────────────────────────┘      │     │
 │   │       │                   │                   │                    │     │
 │   │       ▼                   ▼                   ▼                    │     │
 │   │  TASK 1 @ In Progress    @ In Progress    @ In Progress            │     │
 │   │       │                   │                   │                    │     │
 │   │       │ self-check: AC verified · tsc/build · screenshots          │     │
 │   │       │                   │                   │                    │     │
 │   │       ▼                   ▼                   ▼                    │     │
 │   │  TASK 1 @ In Review     @ In Review       @ In Review              │     │
 │   │       │  (PR opened against feat/ branch; auto-gate spawns)        │     │
 │   │       │                   │                   │                    │     │
 │   │       ▼                   ▼                   ▼                    │     │
 │   │  ┌──────────────────────────────────────────────────────────┐      │     │
 │   │  │ 🛡️  CODE REVIEWER (spawned fresh per task PR)            │      │     │
 │   │  │   gh pr checkout in fresh worktree                       │      │     │
 │   │  │   walks each AC → marks pass/fail w/ evidence            │      │     │
 │   │  │   runs tsc/build as quality scan (NOT a gate)            │      │     │
 │   │  │                                                          │      │     │
 │   │  │   Verdict:                                               │      │     │
 │   │  │    ✅ PASS   → merge to feat/ branch, task → Done        │      │     │
 │   │  │    ⚠️ BOUNCE → comment + task back to In Progress        │      │     │
 │   │  │    🚨 NEEDS HUMAN (after 3 bounces) → escalate to Andy   │      │     │
 │   │  └──────────────────────────────────────────────────────────┘      │     │
 │   │       │                   │                   │                    │     │
 │   │       ▼                   ▼                   ▼                    │     │
 │   │  TASK 1 @ Done         @ Done             @ Done                   │     │
 │   │   (auto-merged to feat-<slug>; task branches deleted)              │     │
 │   └────────────────────────────────────────────────────────────────────┘     │
 │                                                                              │
 │   When the LAST sibling task lands @ Done:                                   │
 │   the Coder who closed it also opens the FEATURE PR.                         │
 └──┬───────────────────────────────────────────────────────────────────────────┘
    │
    │ Last-Task Promotion (same Coder that closed final task):
    │   1. Verify feat/ branch builds clean
    │   2. gh pr create --base main --head feat-<slug>
    │      title: "Feature: <name>"
    │      body: cumulative task PRs (test plans, screenshots, file lists)
    │   3. Move Feature → In Review
    │   4. Comment on Feature: "feature PR opened · awaiting human review"
    │
    ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ FEATURE @ In Review                                                          │
 │   ─────────────────                                                          │
 │   feature PR open against main                                         │
 │   all children Done · all task branches deleted                              │
 │   Andy gets the notification                                                 │
 └──┬───────────────────────────────────────────────────────────────────────────┘
    │
    │  Andy
    │  ┌───────────────────────────────────────────────────────────┐
    │  │ Opens ONE GitHub tab.                                     │
    │  │ Reads test plan (1-2 min)                                 │
    │  │ Local: git checkout feat-<slug> && npm run dev (5-10 min) │
    │  │ Walks golden path                                         │
    │  │ Approves & merges  OR  comments to request changes        │
    │  │                                                           │
    │  │ If change requested:                                      │
    │  │   - new Task ticket auto-created under Feature            │
    │  │   - Feature → In Progress                                 │
    │  │   - a Coder picks it up; cycle repeats                    │
    │  └───────────────────────────────────────────────────────────┘
    │
    │ Andy merges feature PR
    ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ FEATURE @ Done                                                               │
 │   ────────────                                                               │
 │   merged to main · feat-<slug> branch deleted                          │
 │   all task tickets remain @ Done · all task branches deleted                 │
 │   PRD.md success criterion flipped ⬜ → ✅ if applicable                      │
 │                                                                              │
 │   Andy decides when to deploy:                                               │
 │     - Dashboard → push main → Vercel auto-deploys                      │
 │     - Migrations → Supabase MCP apply                                        │
 └──────────────────────────────────────────────────────────────────────────────┘
```

---

## At-a-glance cheat sheet

```
═══════════════════════════════════════════════════════════════════════════════

  STATUS         FEATURE                            TASK
  ──────         ───────                            ─────
  Backlog        idea, untouched                    queued, pull-eligible
  Approved       spec done, awaiting decompose      (skipped — never used)
  In Progress    children executing                 Coder actively building
                 last task → Coder promotes
  In Review      feature PR open · Andy reviews     task PR open · Code
                                                    Reviewer auto-gates
  Done           PR merged                          PR merged into feat/
  Cancelled      killed                             killed; branch abandoned


  PERSONA              TRIGGERED BY              WRITES                FILE
  ───────              ────────────              ──────                ────
  🎯 Product Manager   /spec-feature             Feature@Approved      .claude/agents/product-manager.md
  🏗️  Tech Lead        /decompose-to-tasks       N Tasks@Backlog       .claude/agents/tech-lead.md
                                                 Feature@In Progress
  🔨 Coder             Task pulled by an agent   Task PR draft         .claude/agents/coder.md
                       (or "code task TR-X")     Task@In Review
                                                 Feature@In Review
                                                   (last task only)
  🛡️  Code Reviewer    Task@In Review            Verdict on PR         .claude/agents/code-reviewer.md
                                                 Task@Done OR
                                                 Task@In Progress


  BRANCH                                          PR TARGETS
  ──────                                          ──────────
  main                  (integration trunk)
   └─ feat-<feature-slug>     (feature branch)    ←─ task PRs (auto-merged)
       └─ claude/<task-slug>  (per-task branch)


  HARD LIMITS (NEVER, all personas)
  ────────────────────────────────
  ❌ Apply Supabase migrations to prod
  ❌ Run modal deploy or touch prod infra
  ❌ Approve or merge any PR (Andy merges feature PRs; Code Reviewer
     auto-merges task PRs into feat/ branches)
  ❌ Modify Feature spec after Approved
  ❌ Commit directly to main or feat-<slug>
  ❌ Skip the audit trail — every status change gets a Linear comment


  THE 4 ANDY CHECKPOINTS (sync, blocking)
  ───────────────────────────────────────
  1. CP1 — Spec approval         (~3 min, after Product Manager)
  2. CP2 — Task shape approval   (~5 min, after Tech Lead)
  3. CP3 — Feature PR review     (~10-20 min, after last Coder + Code Reviewer)
  4. CP4 — Deploy decision       (~3 min, after Feature merged)

  Total Andy attention per feature: ~30 min spread across 4 windows.
  Total wall time: variable (~30 min for tiny features, ~hours for medium).


  DOCS
  ────
  /AGENTS.md                              entry point for agents
  /docs/software-factory-workflow.md      the full contract (this file)
  /PRD.md                                 product vision (contract)
  /SPEC.md                                technical architecture (contract)
  /docs/product/decisions.md              append-only decision log
═══════════════════════════════════════════════════════════════════════════════
```

---

## Data model

Two entity types — both Linear tickets in the `train` project, distinguished only by parent/child relationship.

```
Feature (no parentId)
  ├── title: "Feature: <name>"
  ├── description: spec artifact
  ├── status: 6 statuses below
  └── children: Task[]

Task (has parentId)
  ├── title: "Task: <name>"
  ├── description: Depends-on + Parallel-safe + Build + AC + Files + Verifiable
  ├── status: 6 statuses below
  ├── parentId: <Feature ID>
  └── blockedBy: [Task ID, ...]
```

**Disambiguation rule:** has `parentId` → it's a Task. No parent → it's a Feature.

**Labels:** none required by the system. Parent/child does the work.

---

## Stage contracts

For each Linear status: what it means, what's expected, what gets produced, and how the assigned agent acts. Read the section that matches your stage.

### Backlog

#### Feature
- **Meaning:** idea exists, no spec yet, nothing agreed.
- **Expectations:** title set; description may be empty; no children; no PRs; no feature branch.
- **Deliverables:** none.
- **Instructions:**
  - Do not touch. Do not infer a spec from the title.
  - Andy runs `/spec-feature` when ready, which spawns the Product Manager.
  - If a Feature has been in Backlog >7 days, surface as a possible drop candidate in next review. Don't act autonomously.

#### Task
- **Meaning:** fully specified work, queued, awaiting a Coder.
- **Expectations:** title prefixed with `Task:`. Description contains Depends-on, Parallel-safe, Build steps, machine-verifiable Acceptance criteria, Files, Verifiable check. `parentId` set. `blockedBy` set if applicable.
- **Deliverables:** none yet.
- **Instructions (Coder picking up):**
  - Eligible if `blockedBy` is empty AND parent Feature status is `In Progress`.
  - Move ticket to `In Progress`, set yourself as assignee, comment `"picked up by coder"`.
  - If the spec is unclear or files don't exist as named, do NOT guess. Comment with the specific gap; leave in Backlog.

---

### Approved (Feature only)

#### Feature
- **Meaning:** spec drafted, Andy agreed, ready for decomposition.
- **Expectations:** description contains the full spec artifact (Why · Acceptance criteria · Out of scope · What the user sees · Open questions · Appetite). No children yet. No feature branch.
- **Deliverables:** none — waiting state.
- **Instructions:**
  - Do not touch. Do not start any implementation.
  - Andy runs `/decompose-to-tasks` when ready, which spawns the Tech Lead.
  - If a Feature has been in Approved >3 days, surface as "decompose now or drop" candidate. Don't act autonomously.

#### Task
Tasks skip Approved entirely. They go Backlog → In Progress directly when a Coder picks them up.

---

### In Progress

#### Feature
- **Meaning:** tasks decomposed, Coders executing.
- **Expectations:** ≥1 child task exists; NOT all children are Done. A `feat-<feature-slug>` branch exists off `main` (Coder creates if missing).
- **Deliverables:** per-task PRs landing on the feature branch as children complete.
- **Instructions (Coder closing the LAST task):**
  - When you're about to close the final child task (verify: all other siblings already `Done`):
    1. Confirm feature branch builds clean (`tsc --noEmit` + `npm run build` for TS; `py_compile` for Python)
    2. Open feature PR `feat-<slug>` → `main` with title `Feature: <name>`, body auto-composed from all child task PR bodies
    3. Move Feature ticket `In Progress → In Review`
    4. Comment on Feature: `"feature PR opened: <URL> · awaiting human review"`
  - Until the final task fires, leave the Feature ticket alone.
- **Andon cord:** if `feat-<slug>` doesn't exist when branching, create it from `main` HEAD. If you can't, STOP and surface to Andy.

#### Task
- **Meaning:** a Coder picked it up and is actively building.
- **Expectations:** assignee set; `claude/<task-slug>` branch exists off the feature branch; commits land regularly; the owning Coder is responsible until Done or bounce.
- **Deliverables during this stage:** working code per Build steps; tests where the codebase has them; screenshots in `docs/screenshots/<task-slug>/` for any UI change.
- **Deliverables to exit:** draft PR against the feature branch (NOT `main`). PR body contains:
  - `Closes <Task Linear ID>`
  - Test plan — verbatim acceptance criteria as checkboxes
  - Screenshots if UI
  - "Deviations from spec" section if any defaults were chosen (otherwise omit)
- **Instructions:**
  - Implement strictly per Build steps. If silent on a detail, default to simplest implementation; note in Deviations.
  - Self-check before opening PR:
    - Every AC has concrete evidence
    - `tsc --noEmit` + `npm run build` pass (failures become PR notes, NOT blockers — see Code Reviewer)
    - Tests pass if any exist
    - Screenshots committed
  - Commits: short imperative, end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
- **Andon cord:** if the spec is wrong (file doesn't exist; AC contradicts parent), STOP. Move task back to Backlog. Comment with the specific gap. Open a NEW task in Backlog if a follow-up emerges. Do not silently route around.

---

### In Review

#### Feature
- **Meaning:** feature PR open against `main`; all children Done; awaiting Andy.
- **Expectations:** feature PR exists (not draft); description complete; CI green.
- **Deliverables:** already complete (the feature PR itself).
- **Instructions:**
  - **NEVER** approve or merge the feature PR. Andy's call.
  - If Andy requests changes (PR comment or Linear comment):
    - Add a new Task ticket under this Feature with the requested change
    - Move Feature back to `In Progress`
    - A Coder picks up the new task
  - If Andy merges: move Feature → `Done`, delete the feature branch + task branches
  - If Andy closes without merging: move Feature → `Cancelled`, delete branches

#### Task
- **Meaning:** task PR open against the feature branch; Code Reviewer is verifying.
- **Expectations:** draft PR exists; CI passing; every AC claims verifiable evidence in PR body.
- **Deliverables:** a verdict from the Code Reviewer.
- **Code Reviewer instructions:**
  - `gh pr checkout <number>` in a fresh worktree
  - For each AC: verify by documented method (curl, screenshot diff, file existence, log line). Mark pass/fail with evidence.
  - Run `tsc --noEmit` + `npm run build` + `py_compile` as a **quality scan, not a gate**. Failures get posted as a PR comment titled `🔧 Quality notes (non-blocking)`. Gate does not bounce on them.
  - **If ALL AC pass:**
    - `gh pr merge --squash --delete-branch` into the feature branch
    - Move task → `Done`
    - Comment on parent Feature: `"task <id> done · N of M"`
  - **If ANY AC fails:**
    - Post PR comment with failed AC + concrete evidence (log, screenshot, etc.)
    - Move task → `In Progress` (bounce counter +1; track as `Gate bounce 1/3`)
    - After 3 bounces, surface to Andy — do not loop indefinitely

---

### Done

#### Feature
- **Meaning:** feature PR merged to `main`. Feature shipped (modulo deploy).
- **Expectations:** all children Done; feature PR merged; feature branch deleted; task branches deleted.
- **Deliverables:** code on `main`. Optionally a `docs/product/decisions.md` entry if a non-trivial decision was logged.
- **Instructions:**
  - Do not modify the ticket.
  - If a PRD §7 success criterion is tied to this Feature, flip it ⬜ → ✅ in `PRD.md` as part of the feature PR. If missed, open a tiny follow-up task.

#### Task
- **Meaning:** task PR merged into feature branch.
- **Expectations:** PR closed/merged; task branch deleted.
- **Deliverables:** code on the feature branch.
- **Instructions:** do nothing.

---

### Cancelled

#### Feature or Task
- **Meaning:** killed by Andy. Work stops.
- **Instructions:**
  - If you were working a cancelled Task, abandon any open branch (don't push). Delete the local branch.
  - If a parent Feature is cancelled while child tasks are still in flight, stop the child tasks; mark them Cancelled if they haven't merged yet.

---

## Cross-cutting rules

1. **Read access is broad, write access is scoped.** A Coder writes code, not spec text. The Tech Lead writes Tasks, not Feature spec. Roles don't cross.
2. **Comments are the audit trail.** Every state transition you initiate gets a one-line Linear comment explaining what you did and why. E.g. `"moved to In Review — all 5 AC verified"`.
3. **Always work on a branch.** Never commit to a feature branch directly. Never commit to `main` ever.
4. **No partial work in main.** If you can't ship clean, don't ship. Better a stalled task than a half-merged feature.
5. **Screenshots are part of the deliverable for UI changes.** Not optional. Live in `docs/screenshots/<task-slug>/`. Referenced inline in the PR body.
6. **`PRD.md` and `SPEC.md` are the contract.** If your work conflicts with them, the contract wins — STOP, surface the conflict, do not silently work around.
7. **Linear status tracks reality, not ceremony.** Whether work is done by the autonomous pipeline OR by Andy/agent directly, Linear state must match the code:
   - Task's code lands on the feature branch → Task → `Done` (don't leave at Backlog/In Progress)
   - Feature PR opens against `main` → Feature → `In Review`
   - Feature PR merges → Feature → `Done`
   - Work is cut/reverted → Task → `Cancelled`

   The diagram above describes the *autonomous* path (Coder picks up → Code Reviewer merges → state advances). Manual work follows the same status transitions. If you implement a task directly without the full Coder/Reviewer cycle, you still update Linear. A ticket left stale at `Backlog` after the code ships is a worse defect than the code itself — it breaks the team's read of "what's actually shipped."

---

## Hard limits — never do these

Non-negotiable. No autonomy mode overrides them.

- ❌ **Apply Supabase migrations to prod.** Write the SQL file in `app/supabase/migrations/`. Andy applies via Supabase MCP.
- ❌ **Run `modal deploy` or anything against prod infrastructure.**
- ❌ **Modify the parent Feature's spec mid-build.** Frozen at Approved. Use the Andon cord if it's wrong.
- ❌ **Approve or merge any PR.** Code Reviewer merges task PRs into feature branches; Andy merges feature PRs.
- ❌ **Skip the audit trail.** Every transition gets a Linear comment.
- ❌ **Cargo-cult around the Andon cord.** If you find the spec wrong, stop. Do not route around silently.

---

## Personas

The 4 specialized agents that handle each stage. Each lives at `.claude/agents/<name>.md`.

- **`product-manager`** — runs `/spec-feature` interview, drafts spec, creates Feature @ Approved
- **`tech-lead`** — runs `/decompose-to-tasks`, decomposes Feature into Tasks, promotes Feature → In Progress
- **`coder`** — implements one Task end-to-end; also handles Last-Task Promotion when closing the final sibling
- **`code-reviewer`** — verifies AC on task PRs with fresh eyes; merges or bounces (3 strikes → escalate to Andy)

Each persona's full system prompt + tool list lives in its agent file. The diagram at the top shows when each is triggered.

---

## Skills

Two terminal slash commands that initiate Andy's two sync checkpoints with the personas:

- **`/spec-feature <name>`** — spawns Product Manager; interview → Feature @ Approved
- **`/decompose-to-tasks <feature-id>`** — spawns Tech Lead; decompose → N Tasks @ Backlog + Feature @ In Progress

All other transitions happen autonomously per the stage contracts above. The only manual transition for a feature is `In Review → Done` — Andy merging the feature PR.
