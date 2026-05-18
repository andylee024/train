# F&F MVP — AI Coach for Self-Coached Athletes

> Status: direction locked 2026-05-12. Validation cohort: 5 users.

## Premise

Train started as Andy's personal AI coaching system. The F&F MVP is the first step toward a real business: get 5 self-coached athletes onto Train, prove the experience holds beyond Andy, learn what to charge for and what to remove.

## Direction (chosen)

**AI coach for self-coached athletes.** The experienced lifter who programs for themselves but wants a thinking partner — not a human-coach replacement, not a beginner program library. The "Andy persona" is the bullseye.

Distinct from:
- **Caliber / Future** — replace human coach with another human (we replace the spreadsheet)
- **Hevy / Strong** — workout loggers, not programmers
- **MacroFactor** — nutrition only, no training
- **Reddit + spreadsheets** — the current default for this persona

Moat: the cascade methodology (arc → block → week → day with agent operating instructions) + curated style guides from real coaches.

## ICP for the first 5

- 3+ years consistent training
- Real time-bounded goal (powerlifting meet, hybrid event, dunk, body-comp deadline)
- Currently programs for themselves (or has tried and felt limited)
- Comfortable with text-based interaction
- Has Andy's trust enough to give honest feedback

Avoid for v0: total beginners, "lose weight" with no other anchor, athletes who want hand-holding.

## Product surface (v0)

What an F&F athlete experiences:

1. **Signup** — one-page form (name, phone, email, one-line "what you're training for"). Submit → first SMS within 30 sec.
2. **Intake** — Claude conducts a ~30-min text interview. Async; can pause and resume.
3. **Plan review** — Claude drafts the arc + first block. **Andy reviews + edits before activation.** Athlete sees the plan via a hosted xlsx link.
4. **Daily coaching** — morning session push on training days, set logging via reply, post-workout bw check, silent on rest days.
5. **Weekly review** — Sunday check-in on what worked, what to adjust.

**Out of scope for v0:** web dashboard, photo form check, nutrition (until training validates), wearables, payment, self-serve plan editing.

## Andy-in-the-loop quality gate

For 5 users, simplest surface:

- Claude finishes intake → writes draft bundle to `pending/{phone}/` in train repo
- Andy gets SMS with link to markdown summary
- Andy edits via Claude Code in the repo if needed → `/approve {phone}` → bundle moves to `active/`, athlete gets first session

Goal: <15 min per plan review. After 5 plans, common edits become intake-question improvements.

## Technical scope (v0)

- **In-house SMS** in Train repo (decided 2026-05-11). Single Modal app: webhook → Claude Agent SDK loop → Linq SMS-out.
- **Per-user bundles** on Modal Volume at `athletes/{phone}/`.
- **Plan generator** — Claude writes a fresh `build_athlete_arc.py` per athlete; Andy reviews. Templated builder is a v1 concern.
- **Linq Number B** (new, separate from lobs).
- **Database** — extend Supabase `daily_metrics` + `workouts` to multi-tenant (`user_id` already in schema).

## Success criteria after 4 weeks with 5 athletes

- 5/5 completed intake → got a plan they liked
- ≥3/5 actively training in W4 (≥3 logged workouts that week)
- Andy can answer: *what would they pay? what's the wedge that made them stick? what made the dropouts drop?*
- ≥1 unsolicited "can my friend join?" — proves word-of-mouth signal

If 0/5 stick → wedge is wrong. If 5/5 stick → Andy is over-helping (won't scale). The interesting answer is in the middle.

## Open questions (resolve during build)

1. **Intake script** — what Claude asks, in what order. Need a draft before user #1.
2. **Style guide assignment** — Claude picks from a small curated library (3-5 styles), or Andy hand-picks at review?
3. **Plan generator shape** — fresh script per athlete vs. templated input vs. hybrid (Claude writes structured data, generic builder renders).
4. **Andy-review medium** — markdown SMS vs. Modal-hosted web page vs. raw `git diff`.
5. **Pricing** — $20-50/mo subscription? Per-arc fee? (Park until F&F validates.)

## Build sequence

| # | What | Effort |
|---|---|---|
| 1 | Provision Linq Number B | 30 min |
| 2 | Scaffold `train/app/sms/` (single Modal app, echo bot) | 2 hr |
| 3 | Add Claude Agent SDK loop, chat-only | 2 hr |
| 4 | Add Train tools (read/write per-user bundle on Modal Volume) | 4 hr |
| 5 | Intake prompt + plan-generator handoff | 6-8 hr |
| 6 | Andy-review surface (markdown SMS first) | 2 hr |
| 7 | User #1 onboarded end-to-end | — |

Days 1-3 → Train number can hold a conversation. Days 4-6 → real product. ~3-4 days focused work to user #1.

## Pinned next decisions

Before writing code, three things to decide that shape everything downstream:

1. **Who is real user #1?** (Concrete person, real goal, ~3 sentences.)
2. **What style guides exist beyond VJ + Dylan Shannon?** (If user #1 isn't a vertical-jump or strength athlete, we need at least one more style guide before plan-gen works.)
3. **Plan-generator approach** — fresh script vs. templated input vs. hybrid.
