# Train Marketplace — Clickable Prototype

A self-contained HTML prototype for the consumer-facing TOFU experience that funnels people into the Train engine.

## What it is

Three screens, no build step:

1. **Marketplace** — Filterable grid of 12 coaches across 4 categories (Strength & Hypertrophy, Athletic Performance, Aesthetic & Physique, Hybrid & Longevity). Search, category chips, goal/level filters. Cards are click-to-profile or use the checkmark to multi-select.
2. **Coach profile** — Standardized layout: at-a-glance specs, philosophy, core principles, typical week, featured videos, best-for / not-for, pairs-well-with. Same shape for every coach so users can compare apples to apples.
3. **Plan generator** — Form (goal, level, days/week, session length, equipment, free-text notes) → mocked loading sequence → output: 16-week arc with block structure, sample week, and KPIs. Ends with an "Open in Train" handoff CTA.

## Run it

```bash
open index.html        # macOS
# or
python3 -m http.server # then visit http://localhost:8000
```

No npm, no bundler, no framework — just `index.html`, `styles.css`, `data.js`, `app.js`.

## File structure

```
marketplace/
├── index.html      — shell, fonts, root mount
├── styles.css      — all styling (Inter, neutral palette, Stripe-ish)
├── data.js         — COACHES roster + SAMPLE_PLAN (12 coaches, full standardized fields)
└── app.js          — state, routing, render functions
```

## Things that are mocked (and where to wire in real)

| Mocked | Where it lives | What real looks like |
|---|---|---|
| Coach roster | `data.js → COACHES` | Pull from Supabase `coaches` table; same shape |
| YouTube videos | `data.js → coach.videos` | YouTube Data API or scraped channel feed |
| Plan generation | `app.js → runGeneration()` | Replace timeout with `fetch('/api/generate-plan', { coaches, form })` that hits the Head Coach orchestrator |
| Plan output | `data.js → SAMPLE_PLAN` | Returned by the Head Coach — same JSON shape consumed by `renderPlan()` |
| "Open in Train" | `app.js → renderPlan() handoff button` | Push the generated plan into the athlete's `athletes/<name>/active/` and route the user into the morning-text loop |

## Next steps

- **Replace mocked plan with a real LLM call.** The Head Coach prompt should take `selectedCoaches[].philosophy + principles` plus `form` and return JSON in the `SAMPLE_PLAN` shape.
- **Real coach onboarding flow.** Form for coaches to submit their own profile (the standardized fields above). Could be Stripe-Connect-style for monetization.
- **Promote to real React app.** Once the UX is locked, port to Next.js inside `prototypes/web/` so it can share components with the existing Train interface.
- **Connect to Train.** Wire the "Open in Train" CTA — push generated plan into Supabase, route user into existing Train flow.

## Design notes

- Aesthetic deliberately restrained: monochrome with category dot accents (indigo / orange / pink / emerald). Not trying to look like a fitness app — trying to look like infrastructure (Stripe Connect, Vercel, Linear).
- Coach avatars are colored squares with initials by category — placeholder for real photos. Already a recognizable identity system.
- Selection state uses a green outline + a floating action bar at the bottom (Linear-style multi-select pattern).
- Profile pages have **identical structure** for every coach so users can compare in seconds.
