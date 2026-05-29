---
name: create-nutrition-style
description: Synthesize a structured nutrition-style guide from raw source materials (cookbooks, diet books, articles, videos, transcripts) into the canonical 15-section template at docs/content/nutrition-styles/. Use when the user provides source materials about a nutrition methodology and wants a complete style guide built from them, or says things like "build a nutrition style for X from these sources", "synthesize a diet methodology", "create a nutrition style guide", or "translate this cookbook into our nutrition-style format".
argument-hint: [style-slug]
allowed-tools: Read Write Edit Glob Grep Bash WebFetch
---

# Create Nutrition Style

Walk the user through a structured process that turns raw source materials about a nutrition methodology into a complete style folder under `docs/content/nutrition-styles/<slug>/`, conforming to the canonical 15-section nutrition template.

The output mirrors the worked example at [`docs/content/nutrition-styles/renaissance-diet/`](../../../docs/content/nutrition-styles/renaissance-diet/), built from the same 15-section pattern as `docs/content/training-styles/_template/` but adapted for nutrition (see "Section adaptations" below).

The conversation has 5 phases. Each phase ends with a checkpoint where the user confirms before moving on. Never skip a checkpoint. Never invent content not supported by the sources.

## Before you start

Read these to understand the target shape:

1. [`docs/content/nutrition-styles/README.md`](../../../docs/content/nutrition-styles/README.md) — directory conventions
2. [`docs/content/nutrition-styles/renaissance-diet/guide.md`](../../../docs/content/nutrition-styles/renaissance-diet/guide.md) — worked example, fully filled in
3. [`docs/content/training-styles/_template/guide.md`](../../../docs/content/training-styles/_template/guide.md) — the parent 15-section structure (skip §8 Technique; adapt §4, §5, §9 per below)

If the user already mentioned a target slug as an argument (`$ARGUMENTS`), use it. Otherwise propose one in Phase 1.

## Section adaptations (training → nutrition)

The nutrition guide uses the same 15-section spine as the training-styles template, with these section-level adaptations:

| § | Training-style name | Nutrition-style name |
|---|---|---|
| 1 | When to use this style | When to use this style |
| 2 | Mechanism | Mechanism — how this style produces results |
| 3 | Athlete assessment | Athlete assessment (bodyweight, body fat, activity classification) |
| 4 | Session structure | **Daily structure — meal architecture** |
| 5 | Exercise selection | **Food selection** (macros, sources, substitutions) |
| 6 | Periodization | Periodization (phases: cut / maintain / build) |
| 7 | Sample programs | **Sample diet plans** (cut / maintenance / build templates) |
| 8 | Technique | **Tracking & adjustment mechanics** (replaces technique) |
| 9 | Recovery & nutrition | **Hydration & supplements** (since nutrition IS the topic) |
| 10 | Coach's notes | Coach's notes |
| 11 | Programming decision tree | Programming decision tree |
| 12 | Common mistakes | Common mistakes |
| 13 | Style interactions | Style interactions (with training styles + other diet methodologies) |
| 14 | Sources | Sources |
| 15 | Resources in folder | Resources in folder |

---

## Phase 1: Inventory & confirm scope

**Purpose:** Take stock of what the user provided and align on what we're building.

Inputs the user will provide, in any combination:
- **URLs** — articles, blog posts, YouTube videos, podcast episodes, online cookbooks, PDFs
- **Pasted text** — transcripts, book excerpts, full articles
- **File paths** — local PDFs or cookbook files

For each source, capture: a short label, source type (`url` / `pasted-text` / `file`), URL or path, and a one-line summary.

Then confirm:

1. **Style name and slug.** Slug must match `[a-z0-9-]+`. Examples: `renaissance-diet`, `jalal-samfit`, `intuitive-eating`, `keto-athletic`. Keep it short.
2. **Identity sentence.** One sentence: "What does this style optimize for?" (e.g., "An evidence-based nutritional periodization style for athletes pursuing body composition or performance goals, organized around a strict hierarchy of importance.")
3. **Domain hint.** Is it primarily: a periodization framework (RD), a recipe library (Jalal), a food philosophy (whole-food, paleo), or a tracking methodology (IIFYM)? This shapes which sections will be load-bearing.
4. **Source completeness.** Flag obvious gaps. (e.g., user provided macro ranges but no meal-timing guidance.)

**Checkpoint:** Show the source manifest, proposed slug, and identity sentence. Get confirmation before fetching anything.

If a `docs/content/nutrition-styles/<slug>/` folder already exists with sources/, ask whether to overwrite or integrate.

---

## Phase 2: Ingest source content

**Purpose:** Get every source's text into a usable form.

| Source type | Action |
|---|---|
| URL → HTML article | Use WebFetch. |
| URL → YouTube video / podcast | Ask user to paste auto-generated transcript. |
| URL → PDF (small, public) | Try WebFetch. |
| Pasted text | Store under stable label. |
| File path | Read the file. |

Naming convention for `sources/`:
- Raw OCR/transcripts: `<style>-<descriptor>-raw.txt`
- Cleaned/structured material: `<style>-<descriptor>.md`
- Original PDFs: `<style>-<descriptor>.pdf`

Don't write to disk yet — hold content in working memory through Phase 3.

**Checkpoint:** "Here's what I retrieved from each source. Anything missing or wrong before I synthesize?"

---

## Phase 3: Synthesize and map to template sections

**Purpose:** Read everything, identify the operational logic, map content to each of the 15 sections.

For each section, classify the draft as:
- **CONFIDENT** — explicit support in the source material
- **INFERRED** — implied but not stated; flag with `> NOTE: inferred from {{source label}}; verify before publishing.`
- **MISSING** — sources don't cover this; leave a stub with `> TODO: source material did not cover this. Provide additional sources or write directly.`

Section-specific synthesis rules (nutrition adaptations):

| § | Rule |
|---|---|
| 1. When to use | Always required. State the goals this style serves, athlete profile fit (training age, equipment = scale/tracking app, time required for tracking), and contraindications (e.g., eating disorder history, pregnancy). |
| 2. Mechanism | Lead with 1–2 sentence compressed thesis. Describe the methodology's underlying model (hierarchy of importance, calorie balance theory, food philosophy). Subsections only as deep as needed. |
| 3. Athlete assessment | Bodyweight tracking protocol, body fat estimation, daily activity classification, food preference inventory, tracking ability. |
| 4. Daily structure | Meal architecture — number of meals, protein/carb/fat distribution across meals, timing around training. |
| 5. Food selection | Macro hierarchy (protein > carbs > fats), source rankings, substitution map for unavailable/contraindicated foods, disallowed foods with reasoning. |
| 6. Periodization | Phase model (cut, maintenance, surplus), durations, weight rate targets, within-block + between-block progression rules, mandatory refeed cadence. |
| 7. Sample diet plans | Code-block templates with actual macros + meal patterns. At least one tier required (e.g., "Cut", "Maintenance"). |
| 8. Tracking & adjustment | Weigh-in protocol, adjustment cadence (NOT week-to-week), one-knob-per-cycle rule, macro adjustment order. |
| 9. Hydration & supplements | Hydration baseline, high-evidence supplements only (creatine, vit D, omega-3, caffeine). Skip evidence-light supplements. |
| 10. Coach's notes | Tacit knowledge: edge cases, non-obvious tips, athlete demographics, things sources got wrong. |
| 11. Programming decision tree | 5–6 step runbook for designing a block in this style. Inputs → decisions → outputs. |
| 12. Common mistakes | Anti-patterns. The highest-leverage section. Pull every "don't do X" from sources. |
| 13. Style interactions | Compatible/incompatible co-styles; calorie/load conflicts with training styles; meta-style compatibility (IIFYM, keto, fasting, etc.). |
| 14. Sources | Bibliographic list with one-line description and which sections each source informs. Note if source is a summary (vs. original). |
| 15. Resources in folder | Filled in Phase 4 once files are written. |

**Checkpoint:** Show the section-by-section map (CONFIDENT / INFERRED / MISSING). Ask whether to fill MISSING sections from general nutrition knowledge (with NOTE flag) or leave as TODO stubs. Get sign-off before writing.

---

## Phase 4: Generate the style folder

**Purpose:** Materialize the synthesis on disk.

Steps in order:

1. **Create folder structure:**
   ```
   docs/content/nutrition-styles/<slug>/
   ├── guide.md
   └── sources/
   ```
   Use `Bash` `mkdir -p`.

2. **Write `sources/`.** One file per ingested source from Phase 2. Use stable kebab-case filenames.

3. **Write `guide.md`.** Follow the 15-section structure (with adaptations per the table above). Replace every `{{placeholder}}`. Delete the "Template instructions" block at top. Keep the Purpose block.

   For sections marked MISSING (and not filled from general knowledge), leave the TODO stub. For INFERRED sections, add the NOTE line at the top.

4. **Update §15 Resources in folder.** Populate the inventory table with the actual files written, each with a one-line "when to consult."

5. **Sanity check.** Re-read for:
   - No `{{placeholders}}` remaining
   - Every claim traceable to a source in §14
   - Sections in correct order with correct numbering
   - Section names match the nutrition adaptations (§4 = Daily structure, §5 = Food selection, etc.)

---

## Phase 5: Review with the user

Show:

1. The path to the new folder.
2. Stats: file count, lines, sections marked CONFIDENT / INFERRED / MISSING.
3. TODO list (missing sections, primary sources needed if working from a summary, etc.).
4. Any contradictions between sources and how you resolved them.

Ask: "What needs refining? Sections that should go deeper, takes I missed, things that don't sound right?"

Iterate as requested. When the user is satisfied, the skill is done.

---

## Constraints

- **Never invent content not supported by the sources.** Mark MISSING if unclear.
- **Never delete existing source material.** If `docs/content/nutrition-styles/<slug>/sources/` has files, integrate alongside.
- **Never skip checkpoints.** User must approve each phase.
- **Don't write `guide.md` until Phase 4.** Hold synthesis in working memory through Phase 3.
- **Preserve provenance.** Every section's content traceable to a source in §14.
- **Surface summary-vs-original distinctions.** If a source is a third-party summary (like Bookey), note it explicitly in §14 and §15. Don't conflate with the original.
