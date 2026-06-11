# Coach Profiles — How to Run It + What's Inside

> A walkthrough for anyone landing on the train coach-profile work and wanting to see all 4 coaches up close.

## Run it locally

```bash
git clone https://github.com/andylee024/train.git
cd train
git checkout feat-coach-profile-redesign      # or main if already merged
cd web/dashboard
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## The 4 coaches — direct URLs

| Coach | Style | Profile URL |
|---|---|---|
| **Catalyst Athletics (Greg Everett)** | Olympic weightlifting · technique-first | http://localhost:3000/plan/coaches/catalyst-athletics |
| **Dylan Shannon (POWERJACKED)** | 6-day hybrid · power + physique | http://localhost:3000/plan/coaches/dylan-shannon |
| **Jeff Nippard** | Science-based hypertrophy + strength | http://localhost:3000/plan/coaches/nippard |
| **Mike Israetel (Renaissance Periodization)** | RP hypertrophy · mesocycle programming | http://localhost:3000/plan/coaches/israetel |

## Who's who — one-line per coach

### 1. Catalyst Athletics — Greg Everett
- **Channel:** [@CatalystAthletics](https://www.youtube.com/@CatalystAthletics) · 153K subs
- **In one line:** *"The competition lifts are the program."*
- **What's on the profile:** real Catalyst logo · 5 LLM-picked foundational videos (Year Plan, Training Week Schedule, RPE vs Percentages, Program Design, Prilepin's Table) · Program FAQs explain *Explosive Strength Deficit* and *Prilepin's Table* · Sources show Greg Everett's 1,267-page Olympic Weightlifting book

### 2. Dylan Shannon — POWERJACKED
- **Channel:** [@dylan_shannon](https://www.youtube.com/@dylan_shannon) · 78.6K subs
- **In one line:** *"Look like a bodybuilder, perform like an athlete."*
- **What's on the profile:** real Dylan Shannon headshot · hand-curated coach (Sources show "Hand-curated from published articles" instead of a videos list, plus 3 article titles) · Program FAQs explain the *four lower-body pillars*, *density work*, and *velocity-first session ordering*

### 3. Jeff Nippard
- **Channel:** [@JeffNippard](https://www.youtube.com/@JeffNippard) · 8.4M subs (the biggest in the marketplace)
- **In one line:** *"Every set should answer a literature question."*
- **What's on the profile:** real Jeff Nippard headshot · 5 LLM-picked foundational videos (Smartest PPL Routine, How To Build Muscle in 5 Levels, Smartest Way To Get Lean, Training Hard Enough w/ RIR, Best/Worst Back Exercises — all multi-million views) · Program FAQs explain *MEV/MAV/MRV volume landmarks*, *RIR-based progression*, *lengthened-position bias*

### 4. Mike Israetel — Renaissance Periodization
- **Channel:** [@RenaissancePeriodization](https://www.youtube.com/@RenaissancePeriodization) · 3.86M subs
- **In one line:** *"Volume landmarks, mesocycles, deloads — repeat."*
- **What's on the profile:** RP brand logo · 5 LLM-picked foundational videos — and notably, **zero "Exercise Scientist Critiques X Celebrity" reaction videos** despite those being his most-viewed content. The classifier picked the actual methodology: Beginner-to-Advanced Training (44 min), 11 Signs Workouts Aren't Hard Enough (RIR), Not Growing (volume landmarks), Low Reps Aren't Worth It · Program FAQs explain *mesocycles*, *deload weeks*, *junk volume*

## What to interact with on each profile

The page has 10 sections, top to bottom. Most are clickable.

| # | Section | Try this |
|---|---|---|
| 1 | **Hero** | Click YouTube + Instagram icons next to the credentials line |
| 2 | **Overview** | 3-sentence read · chip strip below for days/time/level |
| 3 | **Equipment** | Single row, scrolls horizontally on mobile |
| 4 | **Sample Week** | Click each day Mon–Sun to see the full session inline |
| 5 | **Highlights** | 5 LLM-picked foundational videos · click any tile to open on YouTube |
| 6 | **Your 18 weeks** | Click each phase row (Block 1 → Block 2 → Block 3 → Test) to expand inline with **Goal · Sample session · Rationale** — only one phase open at a time |
| 7 | **Is this for you?** | 4 universal questions (same on every coach) — click to expand each |
| 8 | **Program FAQs** | 2–3 signature-concept explainers — click to expand |
| 9 | **Pairs Well With** | Other coaches that complement this style |
| 10 | **Sources** | Click video titles to open them on YouTube; "Referenced offline" tag on books |

## Marketplace flow (compare all 4 in context)

To see how the coaches fit into the onboarding flow:

http://localhost:3000/plan/new

1. Pick any goal (e.g. *Build muscle* or *Get stronger*) + a day-count
2. Click **Find my team**
3. Marketplace renders all 4 coaches with the goal-matched ones surfaced in a "Recommended for you" band

The intake also has a **Show me everything** link to skip to the full marketplace without filtering.

## Where the data lives

| What | File |
|---|---|
| Core coach records (id, name, tagline, FAQs, arcPhases, sources, …) | `web/dashboard/lib/coaches.ts` |
| Sample weeks + foundational video lists | `web/dashboard/lib/coach-profiles.ts` |
| Universal FAQ questions (locked across all coaches) | `web/dashboard/lib/coach-faq-questions.ts` |
| Headshot images | `web/dashboard/public/coaches/` |
| Profile page UI | `web/dashboard/app/plan/coaches/[id]/page.tsx` |
| Marketplace UI | `web/dashboard/app/plan/new/page.tsx` |

## Design + research artifacts

| Doc | What |
|---|---|
| `docs/design/coach-profile.md` | The design contract — section order, content shape, naming |
| `docs/product/features/foundational-videos-research.md` | TR-360 research on how to pick foundational videos |
| `docs/research/tr-360/<slug>-picks.json` | LLM classifier output with rationale per pick |
| `docs/screenshots/4-coaches/` · `tr-347/` · `tr-360/` · `tr-361-364/` · `tr-363/` · `final/` | Screenshots across the redesign milestones |
| `.claude/skills/deep-research-on-coach/foundational_picks.py` | The LLM classifier itself |

## What the work covered

- **TR-347** — original coach profile redesign (5-section structure → 10 sections after follow-ups)
- **TR-360** — foundational videos via LLM classifier (research + implementation)
- **TR-363** — arc timeline click-to-expand block detail
- **TR-361** — FAQ split into "Is this for you?" + "Program FAQs"
- **TR-364** — Sources section unified (videos + documents)

All under [TR-324 Athlete Onboarding](https://linear.app/a24-personal/issue/TR-324) on the `feat-coach-profile-redesign` branch.
