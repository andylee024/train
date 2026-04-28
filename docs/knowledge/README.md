# Knowledge

The methodology library that powers program generation. Read by planning agents (head coach + specialists) when they need to design a block in a particular style. Lives separately from any specific athlete — these are the *timeless* references that any athlete's plan can draw on.

## Structure

```
knowledge/
├── README.md                  # This file — explains the directory and conventions
├── exercises.md               # Master exercise library (master catalog)
├── diagrams/                  # Cross-style diagrams (e.g., exercise-categorization-model)
│
├── concepts/                  # Cross-style frameworks (the dictionary)
│   ├── arc-decomposition.md   # 1-3-1 goal model for programming
│   ├── periodization.md       # Conjugate, linear, undulating, block
│   ├── session-design.md      # Exercise ordering, volume, deloads
│   ├── assessment.md          # Classify athlete, identify gaps
│   └── plan-templates/        # block-template + weekly-template
│
└── styles/                    # Per-style methodologies (the sentences)
    ├── _template/             # Canonical scaffold to copy for any new style
    └── vertical-jump/         # First worked example
```

The athlete-wide exercise catalog lives at `knowledge/exercises.md`. Per-style `exercise-selection.md` files filter and annotate that catalog for the style's needs.

## Program generation flow

1. **Assess** — `concepts/assessment.md` + the athlete profile classify the athlete.
2. **Load style** — read `styles/<style>/guide.md` + `exercise-selection.md` for the chosen methodology.
3. **Build arc** — `concepts/arc-decomposition.md` + `concepts/periodization.md` shape the block sequence.
4. **Fill days** — `concepts/session-design.md` + `exercises.md` populate sessions.
5. **Deliver** — daily prescription rendered to dashboard or chat.

## Adding a new training style

```bash
cd knowledge/styles/
cp -r _template/ <style-slug>/
```

Then:

1. Drop source PDFs / transcripts into `<style-slug>/sources/` (delete `.gitkeep`).
2. Open `<style-slug>/guide.md` and fill in every `{{placeholder}}`. Delete sections marked OPTIONAL that don't apply.
3. Open `<style-slug>/exercise-selection.md` and replace the example rows with the style-relevant subset of `knowledge/exercises.md`.
4. Add diagrams to `<style-slug>/diagrams/` as the guide references them (delete `.gitkeep`).
5. Delete `<style-slug>/README.md` — that file only belongs in `_template/`.

`_template/guide.md` is the canonical structure every style guide must follow — it has prompts and skeletons for each of the 15 sections, with REQUIRED vs OPTIONAL clearly marked. For a fully filled-in worked example, see [`styles/vertical-jump/`](styles/vertical-jump/).

The `concepts/` layer is style-agnostic. If something would apply to every style, it goes there, not in a style folder.

## What goes in `concepts/` vs `styles/<style>/`

The boundary: **`concepts/` is the vocabulary, frameworks, and slots that every style uses to describe itself. `styles/<style>/` is the specific choices that style makes within those slots.**

A useful test for any piece of content:

> "Would another training style — marathon running, post-ACL rehab, competitive bodybuilding — also need an analogous version of this?"

- If yes → the **slot** is shared, the **content** is style-specific.
- If no → it's purely style-specific (rare).

Or, said as a one-liner: **concepts are the dictionary, styles are the sentences.**

| Lives in `concepts/` | Lives in `styles/<style>/` |
|---|---|
| The 4-layer plan structure (arc / block / week / day) | This style's specific block lengths and phase mix |
| The 4 periodization model definitions | Which model this style picks and its phase parameters |
| The assessment framework (axes that classify any athlete) | The specific tests this style uses for those axes |
| Session design principles (CNS first, fatigue stacking) | This style's specific session ordering |
| The exercise library schema and master catalog | This style's filter, substitution map, and annotations |
| Universal recovery floors (sleep, protein, hydration) | This style's specific recovery demands |
| The interaction taxonomy (day-pairing, recovery overlap, calorie / equipment conflicts) | This style's specific interaction rules with named co-styles |
| The decision-framework template (the steps any agent follows) | This style's specific branches at each step |

If you find yourself writing the same content in two style guides, lift it to `concepts/`. If you find yourself writing universal-sounding content in a style guide, the framework belongs in `concepts/` and the style-specific *choices* stay in the style guide.

## Guide schema (the 15 sections)

Every `styles/<style>/guide.md` follows the same structure so a planning agent reads any style the same way:

| #  | Section | Required? | Group |
|----|---|---|---|
| —  | Identity (title block) | required | Setup |
| 1  | When to use this style | required | Setup |
| 2  | Mechanism (how this style produces results) | required | Setup |
| 3  | Athlete assessment | required | Setup |
| 4  | Session structure | required | Programming |
| 5  | Exercise selection | required | Programming |
| 6  | Periodization | required | Programming |
| 7  | Sample programs | required (≥1 tier) | Programming |
| 8  | Technique | optional | Style-specific |
| 9  | Recovery & nutrition | required | Style-specific |
| 10 | Coach's notes | required | Style-specific |
| 11 | Programming decision tree | required | Operating manual |
| 12 | Common mistakes | required | Operating manual |
| 13 | Style interactions | required if multi-style | Operating manual |
| 14 | Sources | required | Reference |
| 15 | Resources in this folder | required | Reference |

The "front page" is the title + §1 + §2 — a planning agent that reads only those knows whether to recruit this style and what its thesis is. The rest is depth on demand.

§2 (Mechanism) and §8 (Technique) are the only sections whose *content* is fully style-specific by definition. Every other section is the same template across every style; only the values inside change.
