# Arc Bundle — Andy / Summer 2026 / Dunk + Upper + Side Split

Self-contained 18-week training arc package. **This is what the text agent reads to deliver daily prescriptions.** Everything the agent needs is inside this directory tree — no need to navigate to the parent train repo.

---

## What this is

An 18-week hybrid athletic training arc for **Andy Lee** (May 3 → Sep 5, 2026). Five goals in priority order (triage order — lowest yields first when recovery runs short):

1. **G1 🏀 Dunk** a women's basketball on a regulation 10' rim *(the boss)*
2. **G2 🏋️ Power clean 225 + jerk 225**
3. **G3 🤸 Side split** distance reduced ≥ 8 cm from baseline
4. **G4 🥋 BJJ** — light technique 3–4×/week, level up
5. **G5 💪 Bench 1RM 260 AND weighted pull-up +55–60 × 5**

Programmed with **Vertical Jump Bible** (primary, jump), **Dylan Shannon** (upper/Olympic), **Matt Smith** (side split), and the athlete's **DNT** coach (Olympic-lift engine — see DNT Integration Model in `training/arc.md`).

---

## Bundle contents

| Path | What it is | When to read it |
|---|---|---|
| `README.md` | This file. | First contact — orients the agent. |
| `CLAUDE.md` | AI agent operating instructions. | Read on every session start. |
| `arc.md` | Arc-level context: purpose, goals, block sequence, testing schedule, constraints. | When asked "what's the big goal?" or "how does this block fit in?" |
| `profile.md` | Athlete profile snapshot taken at arc start: stats, injuries, preferences, history. | When making any programming or substitution decision. |
| `nutrition.md` | Per-arc nutrition phase: kcal phase per block, bw curve, exception rules. Inherits cross-arc OS at `docs/athletes/andy/nutrition.md`. | When the athlete asks about cut/maintenance phase, bw target, or "is my squat drop a nutrition signal?" |
| `active/current-week.md` | **HOT PATH** — currently-active week's daily prescriptions. | Every morning. The agent reads this to answer "what's today's workout?" |
| `active/current-block.md` | Currently-active block's full programming + strategy. | When the athlete asks "why this rep scheme?" or "what's the focus this block?" |
| `blocks/*.md` | All 3 blocks for this arc, full week-by-week programming. | When asked about future blocks or to compare. |
| `training/weeks/2026-training-W{01..18}.md` | All 18 weeks pre-rendered. | When asked "what's coming up in 3 weeks?" or "what did I do last Saturday?" |
| `nutrition/weeks/2026-nutrition-W{NN}.md` | Generated weekly by `plan-weekly-meals` skill (just-in-time, not pre-rendered). | Saturday surface — meal plan + grocery list for the upcoming week. |
| `styles/vertical-jump-guide.md` | Vendored copy of the VJ training style guide. | When asked "why depth jumps now?" or "what's the conjugate sequence?" |
| `styles/dylan-shannon-guide.md` | Vendored copy of the Dylan Shannon style guide. | When asked about upper body programming logic or 4-pillar framework. |
| *(no spreadsheet)* | The `.xlsx` view is retired (2026-06-21). The markdown week files are the plan. | — |

---

## How to pull this bundle into your cloud agent repo

Pick the mode that fits your environment:

### Mode 1: Git sparse checkout (recommended for v0)

Pulls only this bundle from the train repo, not the rest. The agent's repo only ever sees plan files.

```bash
# From your agent repo
git clone --filter=blob:none --no-checkout https://github.com/andylee024/train.git _train
cd _train
git sparse-checkout init --cone
git sparse-checkout set docs/athletes/andy/arc-2026-summer-dunk
git checkout rebuild-train-v2  # or the active branch
# Bundle is now at: _train/docs/athletes/andy/arc-2026-summer-dunk/
```

To refresh later:
```bash
cd _train && git pull
```

### Mode 2: Rsync (simplest, manual)

```bash
rsync -av --delete \
  /local/path/to/train/docs/athletes/andy/arc-2026-summer-dunk/ \
  /cloud/agent/path/athlete-bundle/
```

### Mode 3: Git submodule (when bundle becomes its own repo)

When you're ready to extract this as a standalone repo (e.g., for multi-tenant productization), do:

```bash
# In the train repo
git subtree split --prefix docs/athletes/andy/arc-2026-summer-dunk -b extracted-arc
git push <new-arc-repo-url> extracted-arc:main

# Then in the agent repo
git submodule add <new-arc-repo-url> athlete-bundle/
```

---

## Refresh cadence

The plan is **hand-edited markdown** — the files under `training/` (`arc.md`, `blocks/`, `weeks/`, `active/`) are the source of truth. There is no generator (the old `build_training_arc.py` xlsx generator was removed 2026-06-21). When the plan changes:

1. Edit the relevant markdown directly (most often `active/current-week.md` + the matching `weeks/` file).
2. Commit + push the bundle changes.
3. Cloud agent repo pulls (whichever mode above).

**Coach (DNT) cadence:** a new DNT program drops ~every 2 weeks and runs **2 weeks behind the arc**. On each drop, reprocess it into the current week files per the DNT Integration Model in `training/arc.md`.

The agent should pull at minimum once a week (Sunday) to pick up the new `current-week.md` snapshot. Pulling daily is fine — the bundle is small (~50 .md files, total <500KB).

---

## Storage boundary (what's NOT in this bundle)

| Lives elsewhere | Where | Why |
|---|---|---|
| Executed sets (logged workouts) | Supabase (`exercise_sets` table) | This bundle is plan-only. Execution data is queried at runtime, not vendored. |
| Session logs / notes | Supabase (`workouts.notes`) | Same. |
| Daily metrics (bodyweight, sleep, RPE) | Supabase (`daily_metrics`) | Time-series data; bundle is static. |
| Live spreadsheet (prescribed + actual) | Generated artifact | See `docs/product/live-renderer.md` in the train repo. Not yet built; eventually output to this bundle's `outputs/`. |

---

## Versioning

Plan version: **v8** — DNT-driven Oly structure from W08 (2026-06-21). Hand-edited markdown; no generator.

Active arc start: **2026-05-03** (Sunday). End: **2026-09-05** (Saturday).
