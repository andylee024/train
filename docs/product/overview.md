# Athlete OS — product overview

**What this doc is:** the durable, slow-changing description of the product. Read this to understand *what* the OS is and *how* its parts fit together. For *what we're shipping next*, see [`docs/specs/`](../specs/).

**Updated:** 2026-05-25
**Status:** v0.1 — pre-V1

---

## What the OS does

**Job-to-be-done:** When I'm working a training arc, I want my plan to drive my day automatically, so all my mental energy goes into training, not managing the plan.

The OS removes operational overhead from three places:

1. **Remembering what to do today** — replaced by daily SMS prescription
2. **Logging what I did** — replaced by text-message log + auto-parsing
3. **Knowing if I'm improving** — replaced by metrics dashboard with PR/decline detection

What it does NOT do (and won't): tell you *how* to train, write your plan for you, or replace a coach. It's the substrate that makes your plan executable.

---

## The four operational modules

```
   ┌─ PLAN ────────┐  ┌─ EXECUTE ─────┐  ┌─ TRACK ──────┐  ┌─ REVIEW ─────┐
   │ research      │  │ daily SMS     │  │ dashboard    │  │ weekly       │
   │ style pick    │  │ log parser    │  │ /strength    │  │ digest       │
   │ generate plan │  │ confirmation  │  │ /nutrition   │  │ block retro  │
   │ bundle        │  │ BW logging    │  │ /plan        │  │ coach voice  │
   └───────────────┘  └───────────────┘  └──────────────┘  └──────────────┘
       cadence:           cadence:           cadence:           cadence:
       per arc            per day            per session +      weekly /
       (~quarterly)                          weekly             block / arc
```

Each module corresponds to a different temporal cadence. Each has its own surface (CLI / SMS / web / SMS). Each owns its slice of the user experience without leaking into the others.

### 1. PLAN

**Question it answers:** "What should I do across this arc?"

Generates the **arc bundle** — a self-contained directory at `athletes/{name}/{arc}/` with `arc.md`, `blocks/`, `weeks/`, `nutrition/`, vendored `styles/`, an athlete-facing `.xlsx`, and agent operating instructions.

**Components:**
- `plan-training-arc` — Python skill that generates training cascade
- `plan-nutrition-arc` — generates nutrition cascade
- `plan-arc` — orchestrator that composes both
- `docs/training-styles/` — library of methodology guides (VJ, Catalyst, etc.)
- `docs/nutrition-styles/` — library of nutrition guides

**Surface:** CLI today; web trigger eventually.

### 2. EXECUTE

**Question it answers:** "What do I do right now?"

Drives the daily activation loop. Sends the morning prescription via SMS, accepts free-text logs in reply, parses them into structured data, posts to Supabase, replies with a confirmation.

**Components:**
- Daily SMS sender (cron-driven; reads `current-week.md`)
- Inbound SMS receiver (Twilio webhook)
- Log parser (Claude API + tool use → `exercise_sets`)
- Confirmation reply
- BW logging (single-number SMS → `daily_metrics`)
- Failure / review path (unparseable SMS doesn't get dropped)

**Surface:** SMS only.

### 3. TRACK

**Question it answers:** "Am I getting better?"

Surfaces the executed work as metrics. Three views (`/strength` with Upper/Lower/Power/Flexibility, `/nutrition`, `/plan`) each composed of widgets via a per-tab declarative config. Users can edit their own dashboard layouts.

**Components:**
- Next.js dashboard (`web/dashboard/`)
- Widget engine — 4 layers (chrome / viz / domain widgets / dashboard config)
- Widget kinds: `kpi`, `lift-trajectory`, `pr-log`, `lift-change`, `bw-trend`
- Per-user dashboard config persistence (localStorage v1 → Supabase v2)

**Surface:** Web app.

### 4. REVIEW

**Question it answers:** "What worked, what didn't, what should I change?"

Synthesizes the data into qualitative summaries at three cadences:

- **Weekly digest** (Sunday morning) — PR count, compliance, what to watch
- **Block retro** (every 6 weeks at block boundary) — did this block earn its keep?
- **Arc retrospective** (Wk 18) — what worked across the whole arc?

**Components:**
- Sunday digest generator (cron-driven SMS or email)
- Block retro generator (boundary-triggered)
- Coach voice (qualitative prose; separate from the metrics-only dashboard)

**Surface:** SMS + email; possibly a web log of past digests.

---

## Two cross-cutting layers

### Data layer

| Where | What lives there |
|---|---|
| **Supabase** | `workouts`, `workout_exercises`, `exercise_sets`, `daily_metrics`, `exercises` |
| **Filesystem** | `athletes/{name}/{arc}/` — bundles (source of truth for plans) |
| **Filesystem** | `docs/training-styles/`, `docs/nutrition-styles/` — methodology library |

See [`docs/product/database-schema.md`](database-schema.md) for the formal storage boundary: planned work in markdown, executed work in Supabase, athlete-facing views as derived xlsx artifacts.

### Agent layer

| Where | What |
|---|---|
| **Per-arc bundle** | `CLAUDE.md` inside each `athletes/{name}/{arc}/` — operating instructions for the cloud agent that handles that athlete's daily execution |
| **Skills** | `.claude/skills/` — reusable AI workflows (`plan-training-arc`, `plan-weekly-meals`, `progress-review`, etc.) |
| **CLI** | `app/cli/` — direct queries, manual workflow triggers |

---

## How modules connect

```
                   ┌─────────────┐
                   │    PLAN     │  ──── generates ────►   arc bundle
                   │  (CLI/web)  │                          (filesystem)
                   └─────────────┘                              │
                                                                ▼
                   ┌─────────────┐                       ┌─────────────┐
                   │   EXECUTE   │ ◄──── reads from ──── │   bundle    │
                   │    (SMS)    │                       │  (per day)  │
                   └─────────────┘                       └─────────────┘
                          │
                          │ writes
                          ▼
                   ┌─────────────┐                       ┌─────────────┐
                   │  Supabase   │ ◄──── queried by ──── │    TRACK    │
                   │exercise_sets│                       │  (web app)  │
                   │daily_metrics│                       └─────────────┘
                   └─────────────┘                              ▲
                          │                                     │
                          │ aggregated by                       │ surfaces to
                          ▼                                     │
                   ┌─────────────┐                              │
                   │   REVIEW    │ ──── generates ──────────────┤
                   │ (SMS/email) │      weekly digest +         │
                   └─────────────┘      block retro             │
                                                                │
                                        (athlete reads          │
                                         both the digest        │
                                         AND the dashboard)
```

Each module has a clean input/output contract. Plan produces bundles. Execute consumes bundles + writes Supabase. Track consumes Supabase. Review consumes both.

---

## What's built vs missing (as of 2026-05-25)

| Module | Built | Missing |
|---|---|---|
| **PLAN** | `plan-training-arc`, `plan-nutrition-arc`, `plan-arc`, style library, bundle format | Web trigger; per-arc bundle distribution to cloud agent; nutrition cascade automation |
| **EXECUTE** | F&F SMS infra (Twilio + Modal), CLI logging | Daily sender wired to Andy's bundle; log parser; confirmation reply; BW SMS; failure path |
| **TRACK** | Dashboard with widget engine, `/strength` (4 views) + `/nutrition` + `/plan`, edit mode + localStorage persistence | Multi-user scoping (V2); BW chart polish; mobile responsive sweep |
| **REVIEW** | `progress-review` skill exists for manual weekly/block retros | Auto Sunday digest; block-boundary trigger; coach voice channel |
| **Data layer** | Supabase schema, bundle format | exercise_name dedup is mostly done (manual 2026-05-25) |
| **Agent layer** | Per-bundle CLAUDE.md, CLI agents | Cloud agent that runs against a remote bundle |

---

## Aesthetic and design principles

See [`~/.claude/projects/-Users-andylee-Projects-train/memory/project_athlete_os_design.md`](file path) — captured product principles:

- **No composite indices.** Every metric is traceable to events.
- **Discrete > continuous.** Bars and tables over smooth curves.
- **Declines surface with equal weight to growth.**
- **Athlete-agnostic backward-looking core.** Arc-scoped at the edges only.
- **Density without crowding.** Tight rhythm, breathable spacing.
- **No coach voice in the data surface.** Voice lives in the REVIEW module (SMS/email).
- **Stratus→North dark theme.** Cool slate bg, electric blue accent, single accent restraint.
- **Fixed visualization vocabulary** in the widget engine. New widgets are new TypeScript kinds, not new chart libraries.
