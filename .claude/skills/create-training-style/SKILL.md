---
name: create-training-style
description: Synthesize a structured training-style guide from raw source materials (links, transcripts, articles, pasted text) into the canonical 15-section template at docs/training-styles/. Use when the user provides source materials about a training methodology and wants a complete style guide built from them, or says things like "build a training style for X from these links", "synthesize a methodology from these sources", "translate this into our training-style format", or "create a style guide from this content".
argument-hint: [style-slug]
allowed-tools: Read Write Edit Glob Grep Bash WebFetch
---

# Create Training Style

Walk the user through a structured process that turns raw source materials about a training methodology into a complete style folder under `docs/training-styles/<slug>/`, conforming to the canonical 15-section template.

The output mirrors the worked example at [`docs/training-styles/vertical-jump/`](../../../docs/training-styles/vertical-jump/), built from [`docs/training-styles/_template/`](../../../docs/training-styles/_template/).

The conversation has 5 phases. Each phase ends with a checkpoint where the user confirms before moving on. Never skip a checkpoint. Never invent content not supported by the sources.

## Before you start

Read the canonical scaffold and the worked example so you know exactly what you're producing:

1. [`docs/training-styles/_template/guide.md`](../../../docs/training-styles/_template/guide.md) — the 15-section template with prompts and skeletons
2. [`docs/training-styles/_template/exercise-selection.md`](../../../docs/training-styles/_template/exercise-selection.md) — the exercise catalog template
3. [`docs/training-styles/_template/README.md`](../../../docs/training-styles/_template/README.md) — what files belong in a style folder
4. [`docs/training-styles/vertical-jump/guide.md`](../../../docs/training-styles/vertical-jump/guide.md) — a fully filled-in example
5. [`docs/training-styles/README.md`](../../../docs/training-styles/README.md) — the boundary between `concepts/` (shared frameworks) and `styles/<x>/` (style-specific instantiation)

Also load `references/section-extraction.md` for what to look for in the source material when filling each of the 15 sections.

If the user already mentioned a target slug as an argument (`$ARGUMENTS`), use it. Otherwise propose one in Phase 1.

---

## Phase 1: Inventory & confirm scope

**Purpose:** Take stock of what the user provided and align on what we're building.

Inputs the user will provide, in any combination:
- **URLs** — articles, blog posts, YouTube videos, podcast episodes, PDFs
- **Pasted text** — transcripts, book excerpts, full articles
- **File paths** — local PDFs or markdown the user has dropped in the repo

For each source, capture: a short label (e.g., "VJB-ch3"), source type (`url`, `pasted-text`, `file`), URL or path, and a one-line summary of what it covers.

Then confirm with the user:

1. **Style name and slug.** Slug must match the regex `[a-z0-9-]+`. Examples: `hypertrophy-classical`, `knees-over-toes`, `5x5-strength`. Keep it short and descriptive.
2. **Identity sentence.** One sentence: "What does this style optimize for?" (e.g., "A power and reactivity-focused style for athletes pursuing maximal vertical jump height.")
3. **Domain hint.** Hypertrophy? Strength? Power? Endurance? Mobility? Sport-specific? This shapes which sections will be load-bearing.
4. **Source completeness.** Are there obvious gaps in the source material? (e.g., user provided programming detail but nothing on recovery — flag this.)

**Checkpoint:** Show the user the source manifest, the proposed slug, and the identity sentence. Get confirmation before fetching anything.

If a `docs/training-styles/<slug>/` folder already exists, ask explicitly whether to overwrite or add to it. Adding to it = read existing files, integrate new sources, update.

---

## Phase 2: Ingest source content

**Purpose:** Get the actual text of every source into a usable form.

For each source from Phase 1:

| Source type | What to do |
|---|---|
| URL → HTML article | Use WebFetch to retrieve full content. |
| URL → YouTube video | WebFetch will not get the transcript. Ask the user to paste the auto-generated transcript or full content. |
| URL → PDF | If the PDF is hosted publicly and small, try WebFetch. Otherwise ask the user to paste relevant excerpts. |
| URL → podcast episode | Same as YouTube. Ask the user for a transcript. |
| Pasted text | Already have it; just store under a stable label. |
| File path | Use Read to load the file content. |

For URLs that succeed via WebFetch, summarize the content back to the user briefly so they know what was retrieved.

**Storage:** As content arrives, prepare it for the final `docs/training-styles/<slug>/sources/` directory. One file per source. Use stable, kebab-case filenames derived from the source label or URL slug. Suffix with the format type:
- `vertical-jump-bible-v2-raw.txt` for raw transcripts/text
- `THP-jump-training.md` for cleaned-up source material

Don't write to disk yet — wait until Phase 4. Just hold the content in working memory or note where each piece came from.

**Checkpoint:** "Here's what I retrieved from each source. Anything missing or wrong before I synthesize?"

---

## Phase 3: Synthesize and map to template sections

**Purpose:** Read everything, identify the operational logic, and map content to each of the 15 sections.

Work through the canonical template structure (see [`_template/guide.md`](../../../docs/training-styles/_template/guide.md)) section by section. For each section, consult `references/section-extraction.md` for what cues to look for.

For each section, classify your draft as one of:
- **CONFIDENT** — multiple sources support this; quote-able evidence in the source material
- **INFERRED** — implied by the sources but not stated explicitly; flag with a `> NOTE: inferred from {{source label}}; verify before publishing.`
- **MISSING** — sources don't cover this; leave a stub with `> TODO: source material did not cover this. Provide additional sources or write directly.`

Specific rules for each section:

| Section | Rule |
|---|---|
| 1. When to use | Always required. If sources don't state it explicitly, infer fit criteria from the methodology's stated outcomes and contraindications from any caveats mentioned. |
| 2. Mechanism | Lead with 1–2 sentences (compressed thesis). Add subsections only as deep as the methodology actually requires for an agent to make programming decisions. Don't pad. |
| 3. Athlete assessment | Capture every test, classification scheme, or athlete archetype the sources mention. |
| 4. Session structure | The session ordering rule + rest intervals + typical duration. If sources show sample sessions, extract the structural template. |
| 5. Exercise selection | List every exercise mentioned in sources with the role assigned to it (primary / accessory / disallowed). Add substitutions where sources mention them. |
| 6. Periodization | Which model + phase structure + within-block and between-block progression rules. |
| 7. Sample programs | Extract every concrete sample workout or program in the sources, in code-block form. At least one tier required. |
| 8. Technique | OPTIONAL — keep only if the methodology has technical execution rules that materially affect outcomes (Olympic, jump training, sprinting). Skip for general strength/hypertrophy. |
| 9. Recovery & nutrition | Style-specific demands only. Universal floors live in `concepts/recovery.md` (don't repeat). |
| 10. Coach's notes | Tacit knowledge: tips, edge cases, anti-patterns, lessons. Pull from off-hand remarks in sources, "I usually find that..." style passages, or position changes over time. If genuinely nothing, state so. |
| 11. Programming decision tree | Step-by-step runbook the agent follows. Inputs → outputs at each step. |
| 12. Common mistakes | The most leverage-able section. Pull every "don't do X" or "the common error is..." statement from sources. |
| 13. Style interactions | Required if multi-style. Day-pairing rules, recovery overlap, calorie/equipment conflicts, compatible/incompatible co-styles. |
| 14. Sources | Bibliographic list with one-line description of each source and which sections it informs. |
| 15. Resources in this folder | Will be filled in Phase 4 once we know what files we wrote. |

**Checkpoint:** Show the user the section-by-section map: which sections are CONFIDENT, INFERRED, MISSING. Ask whether to fill MISSING sections from your general knowledge (with a flag) or leave as TODO stubs. Get sign-off before writing.

---

## Phase 4: Generate the style folder

**Purpose:** Materialize the synthesis into the canonical file/folder structure.

Steps in order:

1. **Create the folder structure.** Mirror `_template/`:
   ```
   docs/training-styles/<slug>/
   ├── guide.md
   ├── exercise-selection.md
   ├── diagrams/         (with .gitkeep — only delete if you have actual diagrams to drop in)
   └── sources/
   ```
   Use `Bash` with `mkdir -p` to create the structure. Use `touch` to create `.gitkeep` files.

2. **Write `sources/`.** One file per ingested source from Phase 2. Use the stable filenames decided earlier. For raw transcripts use `.txt`; for cleaned/structured content use `.md`.

3. **Write `guide.md`.** Follow the 15-section template exactly. Replace every `{{placeholder}}` with real content. Delete the "Template instructions" block at the top. Delete sections marked OPTIONAL that don't apply (typically just §8 Technique). Keep the Purpose block at the top.

   For sections marked MISSING in Phase 3 (and not filled from general knowledge), leave the TODO stub:
   ```
   > TODO: source material did not cover this. Provide additional sources or write directly.
   ```

   For sections marked INFERRED, add a `> NOTE: inferred from {{source}}; verify before publishing.` line at the top of the section.

4. **Write `exercise-selection.md`.** Filter the master library at [`docs/training-styles/exercises.md`](../../../docs/training-styles/exercises.md) for exercises this style uses. Use the schema from `_template/exercise-selection.md`. Annotate each exercise with style-specific notes pulled from the sources (typical loading, when to use, when to skip).

   If the master library doesn't contain exercises mentioned in the sources, add them with a `> TODO: add to master library` flag and surface this to the user at the end.

5. **Update §15 Resources in this folder.** After writing all the files, populate the inventory table in §15 of `guide.md` with the actual files in the new folder, each with a one-line "when to consult" description.

6. **Sanity check.** Re-read the generated `guide.md` for:
   - No remaining `{{placeholders}}`
   - Every claim traceable to a source listed in §14
   - Sections in correct order with correct numbering
   - Diagrams referenced in `guide.md` actually exist in `diagrams/` (or are flagged as TODO)

---

## Phase 5: Review with the user

**Purpose:** Hand off the work, get refinement signal, iterate.

Show the user:

1. The path to the new folder.
2. A summary of what was generated, with stats: file count, lines per file, sections marked CONFIDENT / INFERRED / MISSING.
3. A list of TODOs the user needs to address (missing sections, exercises to add to master library, diagrams to create).
4. Any contradictions between sources you encountered and how you resolved them.

Ask: "What needs refining? Sections that should go deeper, hot takes I missed, things that don't sound right?"

Iterate on specific sections as the user requests. When the user is satisfied, the skill is done.

---

## Constraints

- **Never invent content not supported by the sources.** If you don't know, mark it MISSING.
- **Never delete the user's existing source material.** If `docs/training-styles/<slug>/sources/` already has files, integrate alongside them — don't overwrite.
- **Never skip the checkpoint at the end of each phase.** The user needs to see and approve each step.
- **Don't write the final `guide.md` until Phase 4.** Hold the synthesis in working memory through Phase 3 so you can iterate on the section map without churning files.
- **Preserve provenance.** Every section's content should be traceable to a specific source listed in §14.
