# Nutrition Styles

The nutrition-side methodology library, parallel to `docs/training-styles/`. Each subdirectory holds one nutrition style — a coherent approach to fueling, meal architecture, and food choices — that planning agents (the nutritionist specialist) can draw on when designing an athlete's nutrition plan.

## Structure

```
nutrition-styles/
├── README.md                   # This file
├── jalal-samfit/               # Jalal Sameja (Jalalsamfit) — high-protein meal-prep recipes
│   └── sources/                # Raw cookbooks and materials
└── renaissance-diet/           # Mike Israetel — Renaissance Periodization, evidence-based
    └── sources/                # RD 2.0 reference summary
```

## Conventions

- **`<style>/sources/`** — raw source material (PDFs, OCR'd text, transcripts). Authoritative reference, not the synthesis.
- **`<style>/guide.md`** — synthesized style summary (TODO for both styles below — sources are in place; the guide is the next deliverable).

The pattern mirrors `docs/training-styles/<style>/`: sources live in their own folder, the `guide.md` is the planner-facing synthesis.

## Current styles

| Style | Author / source | Focus | Status |
|---|---|---|---|
| **jalal-samfit** | Jalal Sameja (Jalalsamfit) | High-protein meal-prep recipes for athletes who don't want to sacrifice flavor | Sources only — no guide yet |
| **renaissance-diet** | Mike Israetel (Renaissance Periodization) | Evidence-based dietary periodization, macro/calorie management | Sources only (Bookey summary, not original book) — no guide yet |

## Notes on source materials

- `jalal-samfit/sources/jalal-cookbook.pdf` (~86MB) — main cookbook with photos
- `jalal-samfit/sources/jalal-meal-prep-cookbook-v1-raw.txt` — V1 of the Meal Prep Cookbook (text)
- `jalal-samfit/sources/jalal-meal-prep-cookbook-v2-raw.txt` — V2 of the Meal Prep Cookbook (text)
- `renaissance-diet/sources/renaissance-diet-2-0-summary-raw.txt` — third-party summary (Bookey), not the original book

## Next step

When ready to use these styles, synthesize a `guide.md` for each — same pattern as `docs/training-styles/_template/guide.md`. The `create-training-style` skill is the closest existing scaffold; a nutrition-style equivalent may be worth building.
