# Train — Technical Specification

**Companion to:** [`PRD.md`](PRD.md) (the *what* and *why*)
**This doc:** the *how* — architecture, surfaces, data model, decisions.
**Updated:** 2026-05-26

---

## 1. System architecture

```
   ┌─────────────────────────────────────────────────────────────────────┐
   │                       AUTHORING (web app)                            │
   │                                                                       │
   │  /plan         /plan/new       /plan/coaches/[id]    /strength       │
   │  active arc    plan creation   coach profile        performance     │
   │  dossier       5-phase flow                          (4 views)       │
   │                                                                       │
   │                              /nutrition                              │
   │                              body comp dashboard                     │
   └─────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ generates / reads
                                       ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                          SPEC (the xlsx)                             │
   │                                                                       │
   │   athletes/{name}/{arc-slug}/outputs/*.xlsx                          │
   │   + arc.md / blocks/ / weeks/ / current-{week,block}.md              │
   │   + nutrition/ + styles/                                             │
   └─────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ consumed by
                                       ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                     RUNTIME (SMS execution loop)                     │
   │                                                                       │
   │   Modal cron     Twilio inbound      Claude API parser              │
   │   (daily 6:30AM)  (athlete logs)     (free text → sets)             │
   │         │              │                    │                         │
   │         └──────────────┴────────────────────┘                         │
   │                        │                                              │
   │                        ▼                                              │
   │                  Supabase write                                       │
   │                  exercise_sets / daily_metrics                        │
   └─────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ queried by
                                       ▼
                              (back to AUTHORING dashboards)
```

Three tiers — **AUTHORING** (web), **SPEC** (xlsx + bundle), **RUNTIME** (SMS). The xlsx is the contract between authoring and runtime.

---

## 2. Tech stack

| Layer | Tech | Why |
|---|---|---|
| Web app | Next.js 16.2 (Turbopack) + React 19 + TypeScript | The version Andy chose; AGENTS.md reminds: read `node_modules/next/dist/docs/` before writing Next code |
| Styling | Tailwind CSS 4 + CSS vars (North palette) | One accent color, dark cool-slate base; design tokens in `app/globals.css` |
| Charts | Recharts | Already in tree; covers bars/lines for the widget engine |
| Icons | Lucide React | Single icon family, tree-shakeable |
| Database | Supabase (Postgres) | Auth-ready, hosted, SQL editor; project `vtruwlvekfnmfgaundhp` |
| State | localStorage + React hooks | No global store; per-feature hooks (`useSelection`, `useIntake`, `useDashboardConfig`) |
| Bundle filesystem | `athletes/{name}/{arc-slug}/` | Self-contained per-arc directories |
| Plan generator | Python skill: `.claude/skills/plan-training-arc/` | Generates xlsx + markdown cascade |
| SMS infrastructure | Modal cron + Twilio webhook | F&F SMS product already shipped; needs repurposing for training |
| LLM | Anthropic Claude API (Sonnet for parser, Opus for synthesis) | Already used in skills; tool use for structured outputs |

**No new libraries** without a decision logged in [`docs/product/decisions.md`](docs/product/decisions.md).

---

## 3. Surfaces

### `/plan` — active arc dossier
What you're doing right now in your current arc. Existing surface; deepened with future block deep-dive, goal progress, tests strip (see backlog).

**Components:**
- `<ArcTimeline>` — horizontal block bars on a Wk 1→N track
- `<ConsistencyHeatmap>` — GitHub-style cadence grid
- `<GoalsList>` — arc goals from `arc.md`

**Route:** `app/plan/page.tsx`
**Data:** `getArcSummary` (reads bundle markdown), `getDailyActivity` (Supabase workouts)

### `/plan/new` — plan creation flow (5 phases)
The marketplace + intake + AI synthesis path. Documented fully in [`docs/specs/plan-creation-shipped.md`](docs/specs/plan-creation-shipped.md).

```
   intake → marketplace → review → synthesizing → preview → activated
```

**Route:** `app/plan/new/page.tsx` (client component, orchestrates phase state)
**Key components:** `<GoalIntake>`, `<MarketplacePhase>`, `<RecommendedBand>`, `<ReviewBlend>`, `<PlanPreview>`, `<SelectionBar>`
**Hooks:** `useIntake` (`plan.intake.v1` LS), `useSelection` (`plan.selection.v1` LS)
**Coach data:** `lib/coaches.ts` (roster, 12 entries), `lib/coach-profiles.ts` (principles + week + videos)
**Mocked v1 synthesis output:** `lib/sample-plan.ts`

### `/plan/coaches/[id]` — coach profile
Deep-dive on a single coach. Hero, philosophy, principles, sample week, sample videos, fit, pairs-well-with.

**Route:** `app/plan/coaches/[id]/page.tsx`
**Data:** `getCoach(id)` + `getProfile(id)` from `lib/coaches.ts` + `lib/coach-profiles.ts`

### `/strength` — performance dashboard (titled "Performance")
Backward-looking review surface. Composed via widget engine. Four view tabs (Upper / Lower / Power / Flexibility) — Flexibility deferred.

**Route:** `app/strength/page.tsx`
**Composition:** `app/strength/dashboards/{upper,lower,power}.ts` builders → `<DashboardRenderer>` walks the config
**Widgets used:** kpi, lift-trajectory, pr-log, lift-change

### `/nutrition` — body comp dashboard
Same widget engine. BW + curve tracking.

**Route:** `app/nutrition/page.tsx`
**Composition:** `app/nutrition/dashboard.ts` → `<DashboardRenderer>`
**Widgets used:** kpi, bw-trend

### `/progress/[slug]` — per-lift drill page
Detailed history of a single lift. e1RM chart, rep records table, recent sessions.

**Route:** `app/progress/[slug]/page.tsx`

---

## 4. Widget engine (dashboard composition)

Four-layer architecture, single-page-handles-all-views, declarative.

```
   L4  Dashboard config       per-view config: array of {kind, w, props}
   L3  Domain widgets         data-aware, chrome-on, drill-through
   L2  Viz primitives         pure data→pixels, no chrome
   L1  Widget primitive       chrome only, no data
```

**Invariants:**
- L1 knows nothing about data
- L2 knows nothing about chrome
- L3 is the only layer that imports from `@/lib/queries`
- L4 is a dumb dispatch (typed switch on `spec.kind`)

**Files:**
- L1: `components/widgets/widget.tsx`, `widget-skeleton.tsx`
- L2: `components/viz/{big-number, bar-chart-viz, diverging-bar-list, event-table, line-chart-viz}.tsx`
- L3: `components/widgets/{kpi, lift-trajectory, pr-log, lift-change, bw-trend}-widget.tsx`
- L4: `components/widgets/dashboard-renderer.tsx`
- Types: `lib/widgets/types.ts` (`WidgetSpec` discriminated union)

**Adding a new widget kind:** add variant to `WidgetSpec` + case in renderer switch + L2 viz if needed + L3 wrapper.

**Editor:** `components/widgets/edit-context.tsx` + `<DashboardRenderer onAdd={...}>` + `lib/widgets/use-dashboard-config.ts` (localStorage-persisted per-tab overrides).

---

## 5. Data layer

### Supabase (executed work)

```
workouts          id, user_id, performed_at, notes
workout_exercises id, workout_id, exercise_id, order_index, notes
exercise_sets     id, workout_exercise_id, set_index,
                  reps, weight_value, weight_unit, weight_kg, rpe, notes
exercises         id, name, training_quality, muscle_group,
                  movement_pattern, intensity_tier, bilateral, equipment, role
daily_metrics     id, date (unique per user), bodyweight_lb,
                  protein_target_hit, sleep_hours, notes
```

See [`docs/product/database-schema.md`](docs/product/database-schema.md) for the formal storage boundary doc.

### Filesystem (planned work)

```
athletes/{name}/{arc-slug}/
├── README.md            # how the cloud agent pulls this bundle
├── CLAUDE.md            # bundle-scoped agent operating instructions
├── arc.md               # arc context (purpose, goals, blocks, tests)
├── profile.md           # athlete profile snapshot
├── training/
│   ├── active/          # current-week.md, current-block.md (hot path)
│   ├── blocks/          # all blocks for this arc
│   └── weeks/           # all weeks pre-rendered
├── nutrition/
│   ├── arc.md           # nutrition strategy
│   ├── active/          # current-week.md
│   └── weeks/
├── styles/              # vendored style guide references
└── outputs/             # athlete-facing .xlsx (DERIVED, never edited)
```

**Sacred boundary:** planned work in markdown, executed work in Supabase, athlete-facing view as derived xlsx. Documented in [`CLAUDE.md`](CLAUDE.md).

### localStorage (UI state)

| Key | Purpose | Hook |
|---|---|---|
| `plan.intake.v1` | Goals, days/wk, constraints | `useIntake` |
| `plan.selection.v1` | Cart of selected coach IDs | `useSelection` |
| `dashboard.v2.*` | Widget engine per-tab overrides | `useDashboardConfig` |

---

## 6. Plan creation flow — the 5 phases

| Phase | Component | Trigger | Output |
|---|---|---|---|
| `intake` | `<GoalIntake>` | First visit or `[edit]` | Goals + days + optional constraints saved to localStorage |
| `marketplace` | `MarketplacePhase` inline | "Find my team →" | Athlete picks 1-4 coaches into cart |
| `review` | `<ReviewBlend>` | "Build plan →" on cart | Day-by-day blend preview, days/wk + notes adjustments |
| `synthesizing` | `SynthesizingPhase` inline | "Build plan →" on review | Mocked 3s loader (real AI later) |
| `preview` | `<PlanPreview>` | Auto-advance from synthesizing | Structured visual of generated plan (arc + blocks + sample week + KPIs) |
| `activated` | `ActivatedPhase` inline | "Activate this plan →" | Confirmation card + next actions |

**Cross-route handoff:** profile pages also expose `[Build plan]` which navigates to `/plan/new?build=true`, jumping straight to the `review` phase.

Full spec: [`docs/specs/plan-creation-shipped.md`](docs/specs/plan-creation-shipped.md).

---

## 7. Coach marketplace

12 coaches across 4 categories. Each has:
- id, name, handle, category, tagline
- stats (rating, followers, programs)
- tags (goals, levels, equipment, daysPerWeek, sessionLength)
- philosophy (one paragraph)
- bestFor / notFor (3 bullets each)
- pairsWith (IDs of complementary coaches)

Profile extras (in `lib/coach-profiles.ts`):
- principles (4 title+body cards)
- weekStructure (7 day labels)
- videos (3 sample title + duration + views)

**Categories (visual + matching):**

| Category | Color | Coaches |
|---|---|---|
| Strength & Hypertrophy | blue | Jeff Nippard, Dr. Mike Israetel, Athlean-X |
| Athletic Performance | orange | P3 Athletes, Hooper Training, Cam Davidson |
| Aesthetic & Physique | pink | Chris Bumstead, Sam Sulek, Ryan Humiston |
| Hybrid & Longevity | green | Mat Fraser, Nick Bare, Peter Attia |

**Matching:** intake goals → coach tag overlap → score. Top 3 by score = "Recommended for you" band. `lib/matching.ts`.

---

## 8. Design system — North theme

```css
--bg:          #0a0d12       /* cool slate near-black */
--bg-elev-1:   #11151c
--bg-elev-2:   #1a1f29
--bg-elev-3:   #232a37
--ink:         #eef1f5       /* warm-white */
--ink-dim:     #8b91a0
--ink-muted:   #4a5160
--accent:      #5b9eff       /* electric blue */
--good:        #5ec99c       /* muted forest */
--bad:         #e07a7a       /* soft brick */
--line:        #1f2530       /* cool hairline */
--line-soft:   #161b25
```

**Type:** Geist Sans (body, 11-13px), Geist Mono (labels, tabular numerics, 9-10px tracked).
**Section labels:** `.section-label` utility — tracked uppercase 10px mono.
**Divider:** `.hairline` — 1px top border in `--line`.

See [`app/globals.css`](web/dashboard/app/globals.css) for full token set.

---

## 9. Key design decisions

Full log in [`docs/product/decisions.md`](docs/product/decisions.md). Highlights:

| Date | Decision |
|---|---|
| 2026-05-26 | 5-phase plan-creation flow (intake → marketplace → review → synth → preview → activate) |
| 2026-05-26 | Plan preview as structured visual (not markdown tree) |
| 2026-05-26 | Coach marketplace as plan-creation surface |
| 2026-05-26 | Two-step intake (goals + days + optional constraints) |
| 2026-05-26 | Selection persists across routes via localStorage |
| 2026-05-25 | Widget engine: 4-layer architecture for dashboards |
| 2026-05-25 | North theme (cool slate + electric blue) |
| 2026-05-25 | No composite indices |
| 2026-05-24 | OS structure: 3 review pillars + 1 plan surface |

---

## 10. Known gaps

What's still mocked or missing (full list in Linear `train` project + [`docs/specs/backlog.md`](docs/specs/backlog.md)):

| Concern | Current | Target |
|---|---|---|
| AI plan synthesis | 3-second `setTimeout`; static `SAMPLE_PLAN` | Real Claude API call seeded by coaches + intake + notes |
| Plan preview personalization | Hardcoded sample regardless of picks | Reflects the actual synthesized plan |
| xlsx export | Button doesn't do anything | Generate + download real xlsx from synthesized plan |
| Activation | Flips UI state only | Actually writes bundle, fires nutrition cascade, starts SMS subscription |
| SMS daily sender | Doesn't exist | Modal cron reads bundle, sends today's session via Twilio |
| SMS inbound parser | Doesn't exist | Twilio webhook + Claude tool use → `exercise_sets` insert |
| Confirmation reply | Doesn't exist | Auto-respond with what was logged + dashboard link |
| BW logging via SMS | Doesn't exist | Single-number SMS → `daily_metrics` insert |
| Sunday digest | Doesn't exist | Weekly auto-generated brief, SMS or email |
| Block retro automation | Manual via `progress-review` skill | Auto-trigger at week boundaries |
| `/movement` pillar | Placeholder | Needs ROM test data model first |
| Multi-user / auth | Single-user hardcoded | Defer to V2 |

---

## 11. Repo layout

```
train/
├── PRD.md                          # this product's "what" + "why"
├── SPEC.md                         # this file — the "how"
├── CLAUDE.md                       # agent operating instructions
├── README.md
│
├── docs/
│   ├── product/                    # durable architecture + design system
│   │   ├── overview.md
│   │   ├── decisions.md            # append-only design decisions log
│   │   ├── architecture.md
│   │   ├── database-schema.md
│   │   └── ...
│   ├── specs/                      # per-feature design specs
│   │   ├── v1-overview.md
│   │   ├── plan-shopping.md        # design draft
│   │   ├── plan-onboarding.md      # design draft
│   │   └── plan-creation-shipped.md # shipped reference
│   ├── training-styles/            # vendored methodology library
│   └── nutrition-styles/
│
├── athletes/                       # per-athlete arc bundles
│   └── andy/
│       └── arc-2026-summer-dunk/   # active arc bundle
│           ├── README.md
│           ├── CLAUDE.md
│           ├── arc.md
│           ├── training/
│           ├── nutrition/
│           ├── styles/
│           └── outputs/
│
├── app/                            # runtime code (CLI + Modal + Supabase)
│   ├── cli/
│   ├── supabase/
│   ├── modal_app.py
│   ├── webhook.py
│   └── ...
│
├── web/
│   └── dashboard/                  # Next.js 16 web app
│       ├── app/                    # routes (plan, strength, nutrition, progress)
│       ├── components/
│       │   ├── plan/               # marketplace + creation flow
│       │   ├── widgets/            # L1 + L3
│       │   ├── viz/                # L2
│       │   └── ui.tsx              # primitives (Section, PageHeader, Card)
│       ├── lib/                    # data + hooks
│       │   ├── coaches.ts
│       │   ├── coach-profiles.ts
│       │   ├── matching.ts
│       │   ├── sample-plan.ts
│       │   ├── use-intake.ts
│       │   ├── use-selection.ts
│       │   ├── queries.ts          # Supabase + bundle reader
│       │   └── widgets/
│       └── ...
│
├── .claude/
│   └── skills/                     # AI workflows
│       ├── plan-training-arc/
│       ├── plan-nutrition-arc/
│       ├── plan-weekly-meals/
│       ├── progress-review/
│       └── ...
│
├── prototypes/                     # experiments + historical references
└── scripts/
```

---

## 12. How to run

```bash
# Web dashboard (port 3000)
cd web/dashboard && npm run dev

# CLI
npx tsx app/cli/cli.ts plan today
npx tsx app/cli/cli.ts history --last 7d

# Regenerate arc bundle (xlsx + cascade)
python3 .claude/skills/plan-training-arc/build_training_arc.py
```

Authenticate Supabase via `.env.local` in `web/dashboard/`.

---

## 13. Where to find more

| For | Look at |
|---|---|
| What we're building + why | [`PRD.md`](PRD.md) |
| Decision log (append-only) | [`docs/product/decisions.md`](docs/product/decisions.md) |
| What shipped for plan creation | [`docs/specs/plan-creation-shipped.md`](docs/specs/plan-creation-shipped.md) |
| Marketplace design draft | [`docs/specs/plan-shopping.md`](docs/specs/plan-shopping.md) |
| Onboarding flow draft | [`docs/specs/plan-onboarding.md`](docs/specs/plan-onboarding.md) |
| Active arc bundle | [`athletes/andy/arc-2026-summer-dunk/`](athletes/andy/arc-2026-summer-dunk/) |
| Memory (auto-persistent) | `~/.claude/projects/-Users-andylee-Projects-train/memory/` |
| Linear backlog | `train` project on linear.app/a24-personal |
