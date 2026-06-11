# Design decisions log

Append-only log of consequential design calls. Each entry should let future-you (or anyone new) understand *why* the system is shaped this way without rerunning the conversation that produced the decision.

Newest entries on top.

---

## 2026-06-09 — Coach research moved from local file pipeline to Supabase

**Decision.** Coach source material (YouTube auto-captions, Scribd PDFs, web articles, Substack posts) is discovered, approved, and extracted by `.claude/skills/deep-research-on-coach/` into the Supabase `documents` table + `coach-content` Storage bucket. The legacy `.claude/skills/ingest-coach/` skill (which wrote synthesized markdown directly to `docs/content/training-styles/<coach>/`) is superseded.

**Rationale.**

- **Separation of concerns.** Source extraction and guide synthesis were entangled in the old skill — re-running the synth step required re-running the extraction. Splitting them lets the synth consumer iterate against frozen extractions.
- **Idempotency at row-level.** A `(coach_id, url)` unique constraint + `schema_version`-aware skip logic means re-runs do zero work unless the schema bumps. Old skill's file-based manifest was coarser.
- **Multi-source from day one.** YT-only sourcing forced the synth step to fabricate detail beyond what the captions said. Adding Scribd PDFs (e.g. Israetel's volume-heavy programming docs) + web articles + Substack closes the gap.
- **Operator-in-the-loop approval.** Pending-approval rows surface every candidate before extraction (and before the source's content lands in the synth guide). Hand-waving canonical-channel filtering catches most cross-channel collab false positives.

**Alternatives considered.**

- *Keep ingest-coach and add multi-source there.* Rejected — the file-based manifest doesn't model approval gates well, and the skill's contract was "produces a guide" not "produces source material," so a redesign was cleaner than retrofit.
- *Skip Supabase, use SQLite locally.* Rejected — coaches table needs to be shared with the Next.js marketplace (which already uses Supabase), so a second DB doubles the integration surface.
- *No human approval gate.* Rejected — discover surfaces cross-channel collabs and unrelated coaches sharing names; without an approval pass, the extracted corpus would be too noisy to synthesize from.

**Impact.**

- New: `app/supabase/migrations/20260609000000_coach_content.sql` (coaches + documents + storage bucket)
- New: `.claude/skills/deep-research-on-coach/` (run.py + 5 stage modules + SKILL.md + _constants.py)
- Updated: `CLAUDE.md` storage boundary table — adds "Researched coach content"
- Superseded (to delete after dogfood validates): `.claude/skills/ingest-coach/`
- Open: synth step that reads from `documents.content_text` and writes to `docs/content/training-styles/<coach>/guide.md` — separate ticket, not part of this feature.

---

## 2026-05-27 · Custom style ingestion = ephemeral for V1

**Decided:** When a user adds a "Custom" coach via URL / description / upload, the entry is **ephemeral** to that athlete's session — stored against `athlete_id` in a `custom_coaches` table, not promoted to the global library. No moderation, no popularity promotion.

**Why:** Train V1 is a single-athlete product (Andy) so the question is hypothetical for now. When we open to F&F users, the global library is curated trust: 12 named coaches whose programs we vetted. Letting any user-added coach into the global pool turns the marketplace into Reddit. Better to keep custom coaches as personal extensions of one athlete's library; if 50 athletes add the same coach, that's a curation signal we can act on later.

**Alternatives considered:**
- Persist + auto-promote at N=10 users → premature; we don't know what "good" looks like yet
- Persist + manual review queue → real moderation cost before there's revenue
- Block custom entirely → cuts off a valid power-user path

**Implementation sketch:**
- `custom_coaches` table: `id, athlete_id, name, source_url?, description, principles, created_at`
- Visible only to creator (filter by `athlete_id`)
- Surface in marketplace with a `user-added` badge so visual hierarchy still pushes curated coaches forward

**Resolves:** A24-317 (closed as decided)

---

## 2026-05-27 · Synthesis transparency = terse default with expand-on-demand

**Decided:** Plan preview defaults to a **terse** presentation (block name / weeks / focus / source coach). Each block has a small "show reasoning ▾" disclosure that reveals 1-2 sentences of AI rationale when clicked. The rationale is generated as part of synthesis, stored in the `SamplePlan` shape (`block.rationale?: string`), and surfaced only if the athlete asks.

**Why:** Two failure modes to avoid: (a) wall of AI-generated text that buries the actual plan (bad onboarding), (b) trust-me-bro black-box (bad credibility). The hybrid moves the explanation off the critical visual path while keeping it one tap away. Athletes who want to interrogate the plan can; athletes who just want to start training don't have to read prose.

**Alternatives considered:**
- Always verbose → wall of text, cognitive load up front
- Always terse → trust gap; athlete can't disagree with reasoning they can't see
- Per-block popover → too small for full rationale; mobile-hostile

**Implementation:**
- `SamplePlan.blocks[].rationale?: string` — populated by synthesis prompt (asks Claude to add 1-2 sentences per block)
- `<BlockCard>` renders rationale behind a `<details><summary>` element so no JS state needed
- Synthesis prompt instructs: "For each block, include `rationale` explaining why this phase fits *these* coaches and *this* athlete's goals/constraints in 1-2 sentences."

**Resolves:** A24-318 (closed as decided)

---

## 2026-05-27 · Lifecycle edge cases — mid-week start + post-arc steady state

**Decided:** Two related lifecycle decisions:

1. **"Skip the first session" on activation** = **shift the start date forward** to the next session's natural day. Activating on Wednesday with a Mon/Wed/Fri plan → day 1 lands on Friday. Activating on Saturday with a Mon-Sat plan → day 1 lands on Monday (next session). The bundle isn't rewritten; we just stamp `arc.start_date` to the chosen first-session date, and dashboards/cron read from there.

2. **Returning user with a completed arc** on `/plan` = **hybrid retro + CTA**. When the active arc's `end_date < today`, `/plan` shows: (a) retro summary card (compliance %, top PRs, KPI gap to target, 1-bullet AI verdict), (b) primary CTA "Plan your next arc →", (c) collapsible "Past arcs" history list below.

**Why:**
- Skip-the-first-session: rebuilding the bundle on the fly is fragile; shifting `start_date` is a one-field write. Going to "next Monday" feels wasteful when an athlete is ready *now*; picking up at the next scheduled session preserves the rhythm.
- Post-arc state: athletes don't want to lose their accomplishment. A retro acknowledges the work; the CTA prevents the dashboard from feeling abandoned. Past arcs hidden by default so the surface stays focused on the present.

**Alternatives considered:**
- (Skip) Delete day 1 from bundle → mutates content, breaks `weeks/W01.md` numbering
- (Skip) Re-do day 1 next Monday → wasteful; loses momentum
- (Post-arc) Auto-prompt next arc on day 0 → presumptuous; user may want to rest
- (Post-arc) Pure history view → no forward CTA, feels like the product is over

**Implementation:**
- Add `arc.start_date` to bundle `arc.md` frontmatter; activation route sets it based on intake "skip" choice
- `/plan/page.tsx` branches on `arc.end_date < today`: render `<ArcRetroCard>` + `<PrimaryCTA>` + `<PastArcsList>`
- Retro data computed server-side from Supabase aggregates over the arc's date range

**Resolves:** A24-320 (closed as decided)

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
