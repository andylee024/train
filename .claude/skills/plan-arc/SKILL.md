---
name: plan-arc
description: Orchestrator that generates a complete self-contained arc bundle for an athlete — training plan, nutrition plan, vendored style guides, agent operating instructions, and bundle entry point. Composes plan-training-arc + plan-nutrition-arc + manual writes for README/CLAUDE.md. Trigger when starting a new arc from scratch, or when restructuring a major arc that requires regenerating all bundle components.
argument-hint: [athlete-name] [arc-slug]
allowed-tools: Read Write Edit Glob Grep Bash SlashCommand
---

# Plan Arc

Produces a complete `athletes/<name>/<arc-slug>/` bundle — the self-contained directory a cloud agent pulls and operates against.

The output mirrors the worked example at [`athletes/andy/arc-2026-summer-dunk/`](../../../athletes/andy/arc-2026-summer-dunk/).

## When to use

- New arc starting from scratch (athlete + goals + duration agreed)
- Major arc rewrite requiring regenerated training + nutrition + bundle docs
- Onboarding a new athlete (arc number 1)

## When NOT to use

- Mid-arc tweaks (use `plan-training-arc` to regenerate xlsx, or edit individual files directly)
- Adding a new training style to existing arc (vendor it directly into `<bundle>/styles/`)
- Updating the live `current-week.md` (that's an execution skill, not a planning skill)

## Required inputs

If any are missing, ask the user before proceeding. Don't fabricate.

1. **Athlete name + arc slug** (e.g., `andy`, `arc-2026-summer-dunk`)
2. **Athlete profile** at `athletes/<name>/profile.md` — must exist
3. **Arc definition:**
   - Purpose (1–2 sentences)
   - 2–3 goals (binary, testable, with deadline)
   - Start date + duration
   - Block sequence (count + names + emphasis)
4. **Training style choices:**
   - Primary style (e.g., `vertical-jump`)
   - Secondary style (optional, e.g., `dylan-shannon`)
   - Both must exist as `docs/training-styles/<style>/guide.md`
5. **Nutrition style choice:**
   - Default: `renaissance-diet`
   - Must exist as `docs/nutrition-styles/<style>/guide.md`
6. **Cross-arc nutrition OS** at `athletes/<name>/nutrition.md` — must exist (defines menu + supply)
7. **Hard constraints** — injuries, cut/no-cut blocks, equipment limits

## Bundle layout (target)

```
athletes/<name>/<arc-slug>/
├── README.md                    ← bundle entry point + how to pull into agent repo
├── CLAUDE.md                    ← agent operating instructions
├── profile.md                   ← athlete snapshot at arc start
├── training/
│   ├── arc.md                   ← purpose, goals, blocks, testing schedule
│   ├── blocks/<n>-block-<name>.md
│   ├── weeks/<arc>-W<NN>.md     ← all weeks pre-rendered
│   └── active/
│       ├── current-week.md      ← HOT PATH (initialized to Wk 1)
│       └── current-block.md
├── nutrition/
│   └── arc.md                   ← phase per block, bw curve, exception rules
├── styles/
│   ├── <primary-style>-guide.md ← vendored copy
│   └── <secondary-style>-guide.md (if applicable)
└── outputs/
    └── hybrid-athletic-plan-v<n>.xlsx
```

## Workflow

### Phase 1: Validate inputs

Check existence of:
- `athletes/<name>/profile.md`
- `athletes/<name>/nutrition.md` (cross-arc OS)
- `docs/training-styles/<primary-style>/guide.md`
- `docs/training-styles/<secondary-style>/guide.md` (if specified)
- `docs/nutrition-styles/<nutrition-style>/guide.md`

If any missing, ask the user. Don't proceed.

Confirm the user's stated arc parameters back to them: name, slug, purpose, goals, dates, block sequence, styles. Don't fabricate any of these.

**Checkpoint:** "Confirm these arc parameters before I start generating?"

### Phase 2: Create bundle directory + snapshot profile

```bash
mkdir -p athletes/<name>/<arc-slug>/{training/{blocks,weeks,active},nutrition,styles,outputs}
```

Snapshot the athlete profile:
- Copy `athletes/<name>/profile.md` to `athletes/<name>/<arc-slug>/profile.md`
- Update the snapshot's "Last updated" or "Arc start" line to the arc start date
- This is a point-in-time fork — the bundle profile won't track future changes to the cross-arc profile

### Phase 3: Generate training arc

Invoke the `plan-training-arc` skill with the arc inputs. It will produce:
- `athletes/<name>/<arc-slug>/outputs/hybrid-athletic-plan-v<n>.xlsx`
- And/or markdown files at `training/arc.md`, `blocks/`, `weeks/`, `active/`

If `plan-training-arc` only outputs the xlsx, generate the markdown files directly using the same data:
- `training/arc.md` — purpose, goals, block sequence, testing schedule, constraints, style guide pointers
- `training/blocks/<n>-<slug>.md` — one per block (programming strategy, weekly split, daily breakdown)
- `training/weeks/<arc>-W<NN>.md` — pre-render all weeks from the block × week grid
- `training/active/current-week.md` — initialize to Wk 1
- `training/active/current-block.md` — initialize to Block 1

### Phase 4: Generate nutrition arc

Invoke the `plan-nutrition-arc` skill with:
- Athlete: `<name>`
- Arc slug: `<arc-slug>`
- Nutrition style: `<nutrition-style>` (default: `renaissance-diet`)
- It reads training/arc.md (just written in Phase 3), profile, cross-arc OS, style guide
- Produces `athletes/<name>/<arc-slug>/nutrition/arc.md`

### Phase 5: Vendor style guides into the bundle

Copy each style guide:
```bash
cp docs/training-styles/<primary-style>/guide.md athletes/<name>/<arc-slug>/styles/<primary-style>-guide.md
cp docs/training-styles/<secondary-style>/guide.md athletes/<name>/<arc-slug>/styles/<secondary-style>-guide.md  # if applicable
```

The bundle is self-contained — agents read only from within the bundle. Updates to upstream style guides require a re-vendoring (manual or via a refresh skill).

Note: nutrition style guides are NOT vendored in v0 (the `nutrition/arc.md` is opinionated enough that the agent doesn't need to read the full nutrition style guide at runtime). Reconsider if/when nutrition-side substitution logic gets richer.

### Phase 6: Write bundle README.md

Use the structure from `arc-2026-summer-dunk/README.md`:

- Title and metadata (start, end, duration, version)
- "What this is" — 3-line summary of the arc
- "Bundle contents" — table mapping each file/dir to "what it is" and "when to read it"
- "How to pull this bundle into your cloud agent repo" — sparse-checkout, rsync, submodule modes
- "Refresh cadence" — when the bundle gets regenerated, how the agent picks it up
- "Storage boundary" — what's NOT in the bundle (Supabase tables for execution data)
- "Versioning" — plan version, source repo commit (TODO if no build script)

### Phase 7: Write bundle CLAUDE.md

Use the structure from `arc-2026-summer-dunk/CLAUDE.md`:

- "Your role" — execution agent for this arc; does NOT design programs
- "Bundle layout" — diagram of the bundle's tree
- "Hot path" — morning prescription routing
- "When the athlete asks 'why?'" — answer from these files in this order
- "Nutrition reading map" — which question routes to which doc
- "Hard constraints (DO NOT violate)" — pull from `profile.md` injuries + style guide constraints + nutrition arc hard constraints (e.g., "B3 = no cut")
- "When the athlete reports a flare-up" — substitution logic, propose-don't-dictate format
- "Athlete profile cheat sheet" — 5–8 facts to remember
- "Logging behavior" — Supabase write rules
- "Nutrition behavior" — silent in-week, two touches (post-workout `bw?`, Saturday Costco)
- "When to escalate / propose plan changes" — escalation triggers
- "What's NOT in this bundle" — Supabase, other arcs

This file is hand-tailored per athlete and per arc. It's the most opinionated file in the bundle.

### Phase 8: Sanity check

After all files are written:

1. **Cross-reference check:** every link in CLAUDE.md and README.md resolves to an actual file in the bundle (use `Glob` / `Read` to verify).
2. **Hard-constraint propagation:** any constraint in `profile.md` is reflected in CLAUDE.md's "Hard constraints" section AND in the relevant style guide's substitution map.
3. **Phase coherence:** the cut/maintenance pattern in `nutrition/arc.md` matches the peaking pattern in `training/arc.md` (e.g., training Wk 13–18 = peak; nutrition Wk 13–18 = maintenance).
4. **Self-containment:** the bundle has no broken references to files outside `athletes/<name>/<arc-slug>/` — except the explicit cross-arc OS pointer in nutrition/arc.md (`../../nutrition.md`).

### Phase 9: Report

Summarize:
- Bundle path and total file count
- Plan version (e.g., v6)
- Arc dates and total weeks
- Block sequence (just names)
- Phase pattern (which blocks cut, maintain, etc.)
- Hard constraints inherited
- TODOs (e.g., "build script for versioning not yet wired")
- Next-action: how to pull this bundle into the agent repo (link to the README's "How to pull" section)

## Constraints

- **Never overwrite an existing bundle without explicit confirmation.** If `athletes/<name>/<arc-slug>/` already exists, ask before regenerating.
- **Never fabricate athlete data.** If profile or arc parameters are unclear, ask. Bundles are durable — wrong data here propagates.
- **Always vendor training style guides.** Self-containment is the bundle's contract. Don't link to upstream docs from within the bundle.
- **Always honor `B3 = no cut` style hard constraints** from training arc. Encode in nutrition/arc.md AND in CLAUDE.md.
- **Don't bake build-script versioning into v0.** Leave a TODO in README.md's versioning section if no build script exists yet.
- **Coordinate with `plan-training-arc` and `plan-nutrition-arc`** rather than duplicating their logic. This skill is an orchestrator, not a re-implementation.

## Outputs

A complete bundle at `athletes/<name>/<arc-slug>/`:
- 1 README.md, 1 CLAUDE.md, 1 profile.md (snapshot)
- 1 training/arc.md, N block files, N week files, 1 current-week.md, 1 current-block.md
- 1 nutrition/arc.md
- 1–2 vendored style guides
- 1 .xlsx output

Total file count for an 18-week, 3-block arc: ~28 files.
