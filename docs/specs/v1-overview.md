# V1 — Athlete OS, all four modules

**Status:** superseded — canonical V1 scope now lives in [`PRD.md`](../../PRD.md) + [`SPEC.md`](../../SPEC.md). This doc kept as design exploration history.
**Owner:** Andy
**Updated:** 2026-05-25

This is the umbrella spec for V1. For the product architecture, see [`docs/product/overview.md`](../product/overview.md).

V1 polishes / closes the loop across **all four modules** (Plan / Execute / Track / Review), not just Execute. The scope is still Andy-only — no auth, no multi-user, no public surface.

---

## 1. Persona

**Andy** — sole v0 athlete; also the builder. Highly motivated; allergic to operational overhead.

## 2. Job-to-be-done

> *When I'm working an 18-week training arc, I want my plan to drive my day automatically, so all my mental energy goes into training — not into managing the plan.*

## 3. V1 outcomes (success criteria)

By end of V1, Andy can:

1. **Open `current-week.md` zero times per week.** Phone tells me what to do.
2. **Text-log any workout in <30s.** No CLI, no SQL, no markdown.
3. **See logs on the dashboard same-day.** No batch lag.
4. **Get a Sunday morning brief** that tells me what's working / stalling without me opening anything.
5. **Sit through a 6-week block** with a single boundary-check at the end (auto-generated retro).
6. **Trigger a plan regeneration** when adjustments are needed (CLI is fine; manual is OK if it's fast).

**Failure of V1:** anything that makes me open a terminal, write SQL, or hand-edit a markdown file as part of the normal weekly cycle.

## 4. V1 by module

V1 has work in every module. Effort estimates are rough.

### 4.1 PLAN module (~1-2 days)

**Goal:** make sure the existing plan-generation pipeline is rock-solid for Andy's current arc and easy to re-run when adjustments are needed.

| Spec | Covers | Notes |
|---|---|---|
| [`v1.plan.0-bundle-audit.md`](v1.plan.0-bundle-audit.md) | Verify the active arc bundle is complete, consistent, and current | Mostly verification, not new code |
| [`v1.plan.1-regen-active-week.md`](v1.plan.1-regen-active-week.md) | CLI command: refresh just `active/current-week.md` mid-week if I change something | Convenience |

**Cuts:** web UI for plan generation (V2), style-selection UI (V2), automated nutrition cascade re-trigger (V2).

### 4.2 EXECUTE module (~3-4 days)

**Goal:** close the daily SMS loop end-to-end. This is the biggest gap in V1.

| Spec | Covers | Notes |
|---|---|---|
| [`v1.execute.0-daily-sender.md`](v1.execute.0-daily-sender.md) | Send today's session via SMS at 6:30 AM PT | Reads `current-week.md` |
| [`v1.execute.1-inbound-receiver.md`](v1.execute.1-inbound-receiver.md) | Twilio webhook → store raw SMS, ack reply | Failure-safe |
| [`v1.execute.2-log-parser.md`](v1.execute.2-log-parser.md) | Free text → `exercise_sets` via Claude API + tool use | The hard one |
| [`v1.execute.3-confirmation.md`](v1.execute.3-confirmation.md) | After parse + insert → reply with summary + dashboard link | Small |
| [`v1.execute.4-bw-log.md`](v1.execute.4-bw-log.md) | Single-number SMS → `daily_metrics` insert + curve gap reply | Small |
| [`v1.execute.5-failure-path.md`](v1.execute.5-failure-path.md) | Unparseable SMS → flag, never drop, admin can fix | Important for trust |

**Cuts:** SMS-based plan modification ("change tomorrow") V2, voice memo parsing V2.

### 4.3 TRACK module (~1-2 days)

**Goal:** finish polish. Widget engine is solid; small gaps remain.

| Spec | Covers | Notes |
|---|---|---|
| [`v1.track.0-mobile-responsive.md`](v1.track.0-mobile-responsive.md) | Make all dashboards readable on phone (mobile-first scan) | Important — dashboard is mostly used between sets |
| [`v1.track.1-link-from-sms.md`](v1.track.1-link-from-sms.md) | Confirmation SMS includes a magic link to `/strength` filtered to that lift | Glue between Execute and Track |
| [`v1.track.2-nutrition-meal-log.md`](v1.track.2-nutrition-meal-log.md) | (Optional) thin meal log — Costco grocery skill output rendered in `/nutrition` | Defer if tight |

**Cuts:** multi-user scoping (V2), real-time live updates (V2), per-arc historical compare (V2).

### 4.4 REVIEW module (~2-3 days)

**Goal:** automate the cadenced retrospectives that exist as skills today.

| Spec | Covers | Notes |
|---|---|---|
| [`v1.review.0-sunday-digest.md`](v1.review.0-sunday-digest.md) | Sunday 9 AM SMS or email digest — PRs, compliance, what to watch | Triggered by cron |
| [`v1.review.1-block-retro.md`](v1.review.1-block-retro.md) | At block boundary (every 6 weeks): auto-generate retro doc, SMS link | Triggered by week number |
| [`v1.review.2-arc-retro.md`](v1.review.2-arc-retro.md) | Wk 18: full arc retrospective | Manual trigger acceptable |

**Cuts:** real-time coach prompts ("you seem stalled, here's why") V2, comparative analytics across arcs V2.

## 5. Cross-cutting non-functional requirements

| ID | Requirement |
|---|---|
| **N1** | SMS prescription delivery on time (±5 min), 95%+ of training days |
| **N2** | Confirmation reply within 60s of inbound SMS |
| **N3** | All-in cost <$10/month (Twilio + Modal + LLM tokens) |
| **N4** | Data stays in Andy's existing Supabase project |
| **N5** | Failure-safe: every inbound SMS persisted raw before parsing |
| **N6** | Observability: I can see what was sent / received / parsed / inserted for any given day |
| **N7** | Mobile-readable dashboard (no horizontal scroll, primary KPIs above fold) |

## 6. Out of scope for V1 (explicit cuts)

- Auth / multi-user / user model — Andy is hardcoded
- Onboarding flow (UI or SMS)
- Style library / browsing UI
- Plan generation UI (CLI stays)
- Mobile app — web + SMS only
- Payments
- Wearable / Apple Health integration
- Multi-arc per athlete
- Multi-athlete distribution
- SMS-based plan modification by the athlete
- Voice memo logging
- Real-time coach prompts

## 7. Build order

Within V1, the modules are loosely independent — each can be built in parallel. But there is a sensible serial order:

```
  1. PLAN audit             ← unblock everything else; confirm bundle is current
  2. EXECUTE (full module)  ← the biggest gap; takes longest
  3. REVIEW (Sunday digest) ← can land in parallel with later Execute pieces
  4. TRACK polish           ← landed throughout; mobile responsive last
  5. REVIEW (block retro)   ← only matters when first block boundary hits (Wk 7)
```

Effort: ~7-11 days of focused work. Realistic calendar: 2-3 weeks accounting for iteration.

## 8. Open questions (block per-feature specs)

Each needs an answer before the corresponding per-feature spec can be written.

### EXECUTE
- What time of day for the daily prescription? (default 6:30 AM PT?)
- For ambiguous parses: clarify-by-reply, best-guess + edit link, or flag-and-skip?
- Failure mode for missing prescription: alert me, or silent?
- Phone-number-as-auth: my number is the only authorized inbound — confirm?

### REVIEW
- Sunday digest delivery channel: SMS, email, or both?
- Sunday digest send time?
- Block retro: just generate the doc, or also send via SMS?

### TRACK
- Mobile breakpoint: where does the dashboard collapse to single-column? (sm? md?)
- Meal log: in scope for V1 or defer?

### PLAN
- "Regenerate active week" CLI command: just runs the existing build script, or adds delta-only refresh?

## 9. Verification log

Updated as features ship. Empty at draft stage.
