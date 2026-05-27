# Design decisions log

Append-only log of consequential design calls. Each entry should let future-you (or anyone new) understand *why* the system is shaped this way without rerunning the conversation that produced the decision.

Newest entries on top.

---

## 2026-05-26 · 5-phase plan-creation flow

**Decided:** The plan-creation experience runs through five distinct phases (intake → marketplace → review → synthesis → preview → activate), with the review step inserted between marketplace and synthesis so the athlete confirms their picks before triggering AI generation.

**Why:** The original flow (marketplace → click Build → immediate synthesis) gave no moment for the athlete to verify their selections were coherent. Inserting a lightweight "Here's your blend" step shows the day-by-day shape with their picked coaches and lets them tweak days/wk or add notes before committing.

**Alternatives considered:**
- Skip the review step (rejected — black-box AI moment scared users)
- Wrap synthesis into the cart preview itself (rejected — synthesis takes 30-60s; users want time to verify before that wait)

**Implementation:** `app/plan/new/page.tsx` `Phase` enum + `components/plan/review-blend.tsx`. State persists via the `useSelection` hook (cart) and `useIntake` hook (goals/days/constraints).

---

## 2026-05-26 · Plan preview = structured visual, not markdown tree

**Decided:** The preview screen (after synthesis loading) renders the synthesized arc as a structured visual: arc timeline (block bars), block breakdown cards (intent + source coach), sample week (7-column grid with TrainHeroic-style exercise tables), KPI cards.

**Why:** The earlier preview was an ASCII tree in a `<pre>` block. It didn't communicate that real work had been done, and didn't let the athlete quickly verify alignment ("is this what I want?"). A visual structured doc reads like a real deliverable.

**Alternatives considered:**
- Markdown tree (initial implementation — rejected, felt like raw notes)
- Vertical day stack with full tables (built then rejected — too much scroll; lost the "whole week at once" overview)

**Implementation:** `components/plan/plan-preview.tsx` renders against `lib/sample-plan.ts`. Sample-week grid uses 7 column cells, dense exercise lines (`name` line + `sets×reps load` mono line). v2 replaces sample data with real AI synthesis output.

---

## 2026-05-26 · Coach marketplace as plan-creation surface

**Decided:** The plan-creation experience is shaped as a *coach marketplace* — 12 recognizable named coaches across 4 categories (Strength · Athletic · Aesthetic · Hybrid), with avatars, taglines, social-proof stats, and a cart metaphor.

**Why:** People shop for people, not abstract methodologies. "Catalyst Athletics" is an institution; "Jeff Nippard" is someone you can imagine following. Identity transfer (`I want to gain HIS attributes`) is the unit of decision-making. The card design borrows familiar visual vocabulary (Instagram/X profile cards) so users learn it instantly. The cart metaphor turns "synthesize multiple training methodologies" into the universally-familiar e-commerce act.

**Alternatives considered:**
- Abstract style cards (Vertical Jump Bible, Catalyst Athletics) — built first, rejected as too academic
- Generic methodology categories (Olympic, Hypertrophy, Mobility) — rejected, no identity to attach to
- Chat-driven AI intake — rejected for v1, too slow and unfamiliar

**Implementation:** `lib/coaches.ts` (12 coach roster ported from `prototypes/marketplace/` on the `ff-onboarding` branch), `lib/coach-profiles.ts` (principles + week structure + sample videos), `components/plan/coach-card.tsx`, `components/plan/filter-bar.tsx`, `components/plan/selection-bar.tsx`. Profile route at `app/plan/coaches/[id]/page.tsx`.

---

## 2026-05-26 · Two-step intake (goal + days + constraints)

**Decided:** The plan-creation flow opens with a single-screen intake of three chip groups: goals (multi-select, required), days/week (single-select, required), constraints (multi-select, optional). "Find my team →" is gated on having at least one goal + days picked.

**Why:** Onboarding needs to extract enough signal to personalize the marketplace without becoming a survey. Three chip groups feel fast (~15-30s); they map cleanly to AI matching. Constraints are optional because they're refining signal, not blocking signal. Free-text "anything else?" is deferred to the review-blend step where the AI uses it for synthesis.

**Alternatives considered:**
- Multi-screen wizard (rejected — too slow, drop-off risk)
- Conversational chatbot (rejected for v1 — slower, harder to discover)
- Pure free-text narrative (rejected — too much typing)
- Skipping intake entirely (rejected — recommendations need at least one signal)

**Implementation:** `lib/use-intake.ts` (localStorage-backed state), `components/plan/goal-intake.tsx`. Intake state shared with the marketplace via the same hook so `[edit]` re-opens it with current values.

---

## 2026-05-26 · Selection persists across routes via localStorage

**Decided:** The shopping cart (selected coach IDs) is persisted to `localStorage` and read by both the marketplace and individual coach profile pages, with cross-tab sync via the `storage` event.

**Why:** Users naturally browse to a coach's profile to read more, then expect to add them from there. If state lived only in the marketplace component, navigating to a profile would lose the cart. Storage gives us the same continuity Spotify or Amazon provides for shopping carts.

**Alternatives considered:**
- URL search params (rejected — fragile, breaks on page refresh, ugly URLs)
- React Context provider at root (rejected — over-engineered for single-user prototype)
- Zustand/Redux (rejected — no cross-widget state need)

**Implementation:** `lib/use-selection.ts` and `lib/use-intake.ts` follow the same pattern. Storage keys: `plan.selection.v1`, `plan.intake.v1`. Cross-tab sync via `window.storage` event.

---

## 2026-05-25 · Widget engine (4-layer architecture for dashboards)

**Decided:** Dashboard surfaces (`/strength`, `/nutrition`) compose declaratively from a fixed visualization vocabulary, organized in four layers:
- **L1** Widget primitive (chrome only)
- **L2** Viz primitives (data → pixels, no chrome)
- **L3** Domain widgets (bind viz + data + drill behavior)
- **L4** Dashboard composition (typed config arrays, rendered by `DashboardRenderer`)

**Why:** Hand-coded ad-hoc dashboard sections didn't compose. Adding a 5th widget meant writing chrome + viz + data from scratch. With the engine, new widgets are: viz file + domain wrapper + variant added to `WidgetSpec` union + case in the renderer switch. Plus the user can edit their dashboard layout in localStorage.

**Alternatives considered:**
- Single page-per-pillar with hand-coded layouts (built first, rejected for the V2 add-widget UX)
- External libraries (react-grid-layout, etc.) — rejected, overkill
- A registry pattern with `Record<kind, Component>` — rejected, loses type narrowing on `spec.props`

**Implementation:** `components/widgets/`, `components/viz/`, `lib/widgets/types.ts`. Five widget kinds today: `kpi`, `lift-trajectory`, `pr-log`, `lift-change`, `bw-trend`.

---

## 2026-05-25 · North theme (cool slate, electric blue)

**Decided:** Adopt the "North" color palette: cool slate near-black background (`#0a0d12`), warm-white ink (`#eef1f5`), electric blue accent (`#5b9eff`).

**Why:** Stratus (warm gold on cool dark) read as "vintage finance / Bloomberg Terminal." Athlete-OS is meant to feel like a modern dev tool / Linear / Datadog — sharper, more digital. Electric blue is the right register.

**Alternatives considered:**
- Stratus (gold) — earlier choice, rejected
- Periodical (paper-tone) — earlier choice, rejected for "Kindle for athletes" — felt too literary
- Mint (athletic green) — felt too "Whoop / Strava clone"
- Mono (no chromatic accent) — felt too austere for the data viz

**Implementation:** `app/globals.css` CSS vars. Status colors muted to fit dark base (`#5ec99c` good, `#e07a7a` bad).

---

## 2026-05-25 · No composite indices

**Decided:** Every metric on the dashboard is traceable to a concrete event or observation. No derived single-number "Athlete Index" or composite scores.

**Why:** Composite indices feel fake until trusted. Athletes don't trust them. We can show the components (PRs, e1RM trends, body weight) and let the athlete make their own synthesis. The dashboard's job is data fidelity, not data summarization.

**Alternatives considered:**
- Per-theme composite indices (built once, rejected — same trust problem)
- Single overall Athlete Index (rejected outright)

**Implementation:** Dashboards show counts (`3 PRs in last 30 days`), deltas (diverging bars), and trajectories (sparkbars) — never indices. Headlines per pillar are concrete numbers, not derived scores.

---

## 2026-05-24 · OS structure: 3 pillars + 1 plan surface

**Decided:** Athlete OS has four operational surfaces:
- `/plan` — forward-looking arc (current week, blocks, goals)
- `/strength` — backward-looking review (lifts, PRs, performance)
- `/nutrition` — backward-looking review (body weight, target curves)
- `/movement` — placeholder (deferred until ROM tests are wired)

The three review pillars all answer the meta-question "am I getting better?" along different axes. They are athlete-agnostic — they survive arcs.

**Why:** Splitting forward (plan) from backward (review) by surface keeps the cognitive load distinct. Within review, splitting by dimension (strength / nutrition / movement) keeps each pillar focused on one question.

**Implementation:** `/app/plan/page.tsx`, `/app/strength/page.tsx` (URL retained; page titled "Performance"), `/app/nutrition/page.tsx`. Movement deferred.

---

## (older decisions — to backfill if useful)
