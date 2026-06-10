# Foundational Videos for Highlights — Research

> Question: which videos should we surface in the **Highlights** section of a coach profile to help a new visitor *understand the coach's approach* — not just the most-popular content.
>
> Status: research-only, no approach committed yet. See Linear TR-XXX for follow-up implementation work.

## Method

Scraped top 80–95 most-recent videos from each of the 4 coaches' YouTube channels via `yt-dlp`. Sorted by view count, took top 25. Analyzed titles + durations + views as a researcher would. Source CSVs: `/tmp/coach-research/<slug>-top25.csv`.

## Headline finding

**The most-viewed videos are not the most foundational videos.** For some coaches they overlap (Nippard); for others they don't (RP, Catalyst). A single heuristic that works for all 4 coaches must read *title semantics*, not just view counts.

## Observations

### 1. View-count distributions vary by 1000× across coaches

| Coach | Median (top 100) | Peak | Multiplier |
|---|---:|---:|---:|
| Catalyst Athletics | 2,291 | 10,934 | 1× (baseline) |
| Dylan Shannon | 2,781 | 13,567 | ~1.2× |
| Mike Israetel (RP) | 213,875 | 1,846,004 | ~170× |
| Jeff Nippard | 3,164,243 | 13,951,409 | ~1,380× |

An absolute view-count threshold cannot work uniformly. Any view-based signal must be channel-relative (percentile-within-channel).

### 2. Content style varies by coach — same signal means different things

| Coach | Dominant top-25 format | Foundational? |
|---|---|---|
| Catalyst | 1–3 min snatch/clean coaching cues | Short clips ARE useful but don't introduce the *system*. The longer (5–6 min) videos like "RPE or Percentages" and "Efficiency & Foot Movement" are the real foundational ones. |
| Dylan | 20–30 min workout vlogs (Push/Pull/Leg sessions) | The vlogs ARE the introduction to Dylan's style — the workouts are his identity. Foundational = high-view workout vlogs. |
| Nippard | 13–22 min "Explained in N Levels" / "Smartest X" / "Best & Worst" | Title format directly signals foundational vs entertainment. "How To Build Muscle (Explained In 5 Levels)" is ideal; "What Every Body Fat % Looks Like" is entertainment. |
| RP / Israetel | "Exercise Scientist Critiques X Celebrity" reaction format dominates | 13 of 25 top videos are entertainment reactions. The foundational mesocycle / MEV / MRV explainers are *older + lower-view* and may not even be in the top-25 by recent views. |

### 3. The RP problem: foundational content can live OUTSIDE the top 25

For RP specifically, the most-foundational videos (mesocycle structure, volume landmarks, deload theory) are typically:
- 2–4 years old
- 100K–300K views (1/4 to 1/2 of recent reaction videos)
- Filed under "Hypertrophy" or "Programming" categories

A "top-25 by views" sample misses them entirely. Solution: don't ONLY sample by views.

### 4. Title-keyword signals are remarkably consistent across coaches

**Foundational title patterns (positive signal):**
- `"Explained"`, `"Fully Explained"`, `"In N Levels"`
- `"How To [verb] [outcome]"` — *"How To Build Muscle"*, *"How To Get Lean"*
- `"The Smartest"`, `"The Best"`, `"The Science"`, `"Principles"`, `"Fundamentals"`
- `"Routine"`, `"Program"`, `"Template"`, `"System"`
- `"What every X needs to know"`

**Entertainment / reaction (negative signal):**
- Other coaches' names — `"Sam Sulek's Training"`, `"Magnus Midtbø"`
- `"Critiques"`, `"Reacts to"`, `"vs"` (head-to-head)
- Drama / clickbait — `"OVERRATED"`, `"Worst Advice Ever"`, body-fat reveals
- `"My Full Day of Eating"`, `"Inside The Lab"` — lifestyle vlogs
- Dates / episodes / podcast markers

### 5. Duration correlates with foundational signal

| Duration | Typical content | Foundational fit |
|---|---|---|
| <5 min | Coaching cues, clips, shorts | Sometimes (Catalyst); usually no |
| 5–10 min | Exercise tutorials, short tips | Mixed |
| 10–25 min | **Explainers, programming videos** | ✓ sweet spot |
| 25–45 min | Long-form, full sessions | Sometimes (Dylan's vlogs) |
| >45 min | Podcasts, live streams | Almost never |

## Three possible approaches

### Approach A — Pure heuristic
Score each video by: `(view_percentile × 0.3) + (title_keyword_score × 0.5) + (duration_fit × 0.2)`. Take top 5.

- **Pros**: deterministic, free, runs locally, no API calls
- **Cons**: requires per-style tuning. Catalyst's 1-min cues would always score badly even though they're his identity. Dylan's vlogs would score badly because they're not "Explained" videos. Needs category-aware tweaks.
- **Cost**: $0
- **Maintenance**: high — keyword lists need to evolve

### Approach B — LLM classifier on full top-100 metadata
Send the top-100 video titles + durations + view counts to Claude per coach. Prompt: *"Pick 5 videos that would best introduce a new viewer to this coach's methodology and approach. Foundational = teaches the coach's philosophy/system, not entertainment or one-off content."*

- **Pros**: handles content-style variance per coach automatically; reads *"Explained In 5 Levels"* semantically; correctly rejects *"Critiques X Celebrity"*; zero per-coach tuning
- **Cons**: requires an API call per coach (~$0.01, ~5s)
- **Cost**: ~$0.04 total for all 4 coaches per refresh; ~$0.50 for a 50-coach future library
- **Maintenance**: low — handles new content styles natively

### Approach C — Hybrid
Heuristic narrows top-100 → top-15 candidates → LLM picks final 5 from candidates.

- **Pros**: cheaper LLM call (15 candidates not 100)
- **Cons**: heuristic might filter the right videos out before LLM sees them
- **Cost**: ~$0.005/coach
- **Maintenance**: medium

## Implications for the broader library

For RP/Israetel specifically (and probably many future coaches with strong entertainment content), the top-25-by-views sample misses foundational older content. Two ways to address:

1. **Sample more deeply** — pull top 200 by views, not 25. Increases search-space for foundational candidates.
2. **Use a foundational seed list per coach** — operator hand-picks 3–5 cornerstone video URLs per coach during ingestion; the algorithm extends from there. (Closer to how marketplace curation actually works.)

## Strongest recommendation (not committing to)

**Approach B (LLM classifier).** Cost is trivial, it handles all 4 content styles uniformly without per-coach tuning, and it scales to 50+ coaches without maintenance overhead.

**Caveat:** for coaches whose foundational content lives outside the top-25 by views (RP being the canonical example), expand the sample to top 100–200 *before* asking the LLM to pick. Otherwise the LLM picks the best of a bad sample.

## Open questions

- For coaches where view counts skew toward entertainment (RP), should the operator manually flag a few foundational seed videos during coach onboarding? This is a *curation policy* question, not just an algorithm question.
- Should foundational videos include some that aren't from the coach themselves — e.g. high-quality interviews where the coach explains their approach? (Catalyst's 4M-view Joe Rogan appearance, if it exists, would be far more foundational than any short clip from their own channel.)
- How often do we re-run? Foundational videos shouldn't change weekly; quarterly seems plausible.
