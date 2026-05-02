# `_template/` — Canonical training-style scaffold

This directory is the **canonical structure** every new training style must follow. The directory is the spec — copy it as-is for any new style and fill in the placeholders.

## How to add a new training style

```bash
cd training-styles/
cp -r _template/ <your-style-slug>/
```

Then:

1. Open `<your-style-slug>/guide.md` and fill in every `{{placeholder}}`. Delete sections marked OPTIONAL that don't apply to your style.
2. Open `<your-style-slug>/exercise-selection.md` and replace the example rows with the subset of `training-styles/exercises.md` that's relevant to this style.
3. Drop source PDFs / transcripts into `<your-style-slug>/sources/`. Delete `.gitkeep`.
4. Add SVG / PNG diagrams to `<your-style-slug>/diagrams/`. Delete `.gitkeep`.
5. Delete this `README.md` from your copy — it only belongs in `_template/`.

## Files in this scaffold

| File | Purpose |
|---|---|
| `guide.md` | The 15-section canonical training-style guide. The single most important file in any style folder. |
| `exercise-selection.md` | The style's filtered subset of the master exercise library, with style-specific annotations. |
| `diagrams/` | SVGs / PNGs referenced by `guide.md`. Force-velocity curves, session structures, decision trees, etc. |
| `sources/` | Raw source materials: PDFs, transcripts, research papers, coach interviews. The depth that `guide.md` synthesizes. |

## Worked example

For a fully filled-in style guide that follows this scaffold, see [`../vertical-jump/`](../vertical-jump/).

## Why a directory, not just a file

The earlier version of this template was a single `_TEMPLATE.md` at the root of `training-styles/`. That worked for the guide but left every other expected file (exercise-selection, diagrams, sources) implicit. New contributors had to read the README to figure out the convention. A directory makes the convention literal: `cp -r _template/ <new-style>/` and you have the right shape.
