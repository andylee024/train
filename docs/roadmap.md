# Train V1 Plan

## Objective

Move from a local V0 to a reliable always-on system with better workout planning workflows and a clear product roadmap.

## V1 Outcomes

1. Train is available 24/7 without depending on your Mac being online.
2. You can plan future workouts with a structured process (still simple, chat-first).
3. Product roadmap is explicit: what ships first vs later.

## Scope For V1

## In scope

- Always-on cloud deployment for NanoClaw + Train command runtime.
- Reliability hardening for message handling and response delivery.
- Planning workflow MVP (plan creation + updates in markdown).
- Basic product roadmap and milestone plan.

## Out of scope

- Multi-user productization.
- Full autonomous coaching engine.
- Advanced mobile/web app UI.

## A) Always-On Cloud Architecture

## Current constraint

NanoClaw currently runs as a long-lived process and executes agent work in containers. Running only on your laptop creates uptime and reliability risk.

## Requirements

- Persistent process runtime (24/7).
- Docker/container runtime available for agent execution.
- Persistent disk for NanoClaw state.
- Secure env vars for Supabase/API keys.
- Restart/resume behavior after crashes/redeploys.

## NanoClaw + Train cloud shape (v1 target)

```text
Telegram/WhatsApp
   -> NanoClaw service (cloud VM)
      -> agent container runtime (Docker)
         -> mounted /workspace/extra/train
            -> train CLI (log/query/plan)
               -> Supabase (system of record)

Persistent storage on VM:
- nanoclaw/store/
- nanoclaw/data/sessions/
- nanoclaw/groups/
```

## Deployment options

1. Single VM + Docker + process supervisor (recommended first)
- Example: Hetzner/DO/AWS VM.
- Pros: simple, predictable, closest to current architecture.
- Cons: you own VM ops.

2. Managed container platform
- Pros: less server maintenance.
- Cons: can be tricky for persistent local state and long-lived messaging sockets.

3. Split control-plane/worker architecture (later)
- Pros: scalable and cleaner separation.
- Cons: higher complexity, not needed for v1.

## Recommendation

Start with **Option 1 (single VM)** for v1. It is the smallest delta from what already works.

## Minimum reliability checklist

1. Auto-restart NanoClaw process on failure.
2. Health check + alert on no outbound responses for N minutes.
3. Daily backup of NanoClaw local state folders.
4. Supabase remains primary training data store.

## B) Workout Planning In V1

## Planning philosophy

Keep plan source of truth in markdown, but standardize how plans are generated and adjusted.

## Inputs required for planning

1. Goal block (strength, hypertrophy, jump, cut, etc.).
2. Weekly training days available.
3. Main lift priorities.
4. Equipment constraints.
5. Fatigue/recovery constraints.

## V1 planning workflow

1. User asks NanoClaw to create a week plan.
2. NanoClaw fills a standard markdown template for that week.
3. User logs workouts as usual.
4. At week end, NanoClaw summarizes performance and suggests next-week adjustments.

## Planning artifacts

- `plans/YYYY-Www.md` (weekly plan)
- Optional `plans/templates/*.md` (plan skeletons by goal)

## C) Feature Roadmap

## V1.0: Always-On Foundation (first)

1. Cloud-host NanoClaw with persistent state.
2. Keep current train CLI query/log flow intact.
3. Add operational runbook (deploy/restart/backup/recovery).

## V1.1: Planning MVP

1. Standard weekly plan template generation.
2. Chat commands for create/update plan.
3. End-of-week summary from logged sets.

## V1.2: Progression Assistance

1. Suggest load/rep progression on main lifts.
2. Use recent performance + target intensity heuristics.
3. Add guardrails for fatigue flags.

## V1.3: Product Quality

1. Improve response consistency and reduce duplicate replies.
2. Add basic auth/RLS hardening plan for future multi-user support.
3. Add testing/monitoring around top chat intents.

## Prioritization (Must / Should / Could)

## Must

- Cloud always-on runtime.
- Reliable log/query behavior in chat.
- Weekly plan generation workflow.

## Should

- Weekly review + plan adjustment suggestions.
- Better intent routing for training/planning prompts.

## Could

- Exercise media/form cues.
- Lightweight dashboard for history/progression.

## Open Decisions

1. Cloud provider preference for v1.0 (VM host).
2. Channel priority: Telegram first only, or WhatsApp too.
3. SLO target (e.g., response within 15-30s).
4. Backup policy (daily vs more frequent).
5. Planning style preference: strict template vs flexible coach-style.

## Proposed Next Step

Create v1 implementation tickets in 2 tracks:

1. Platform track: deploy NanoClaw + Train on cloud VM with runbook.
2. Product track: weekly planning template + chat workflow + week-end review.
