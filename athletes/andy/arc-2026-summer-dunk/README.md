# Arc Bundle — Andy / Summer 2026 / Dunk + Upper + Side Split

Self-contained 18-week training arc package. **This is what the text agent reads to deliver daily prescriptions.** Everything the agent needs is inside this directory tree — no need to navigate to the parent train repo.

---

## What this is

An 18-week hybrid athletic training arc for **Andy Lee** (May 3 → Sep 5, 2026). Three goals in priority order:

1. **Dunk a women's basketball** on a regulation 10' rim
2. **Bench 1RM 260 lb AND weighted pull-up +80 lb × 8 reps**
3. **Side split distance reduced ≥ 8 cm from baseline**

Programmed with **Vertical Jump Bible** (primary, jump methodology) and **Dylan Shannon** (secondary, upper body + 4-pillar lower distribution) as the style guides.

---

## Bundle contents

| Path | What it is | When to read it |
|---|---|---|
| `README.md` | This file. | First contact — orients the agent. |
| `CLAUDE.md` | AI agent operating instructions. | Read on every session start. |
| `arc.md` | Arc-level context: purpose, goals, block sequence, testing schedule, constraints. | When asked "what's the big goal?" or "how does this block fit in?" |
| `profile.md` | Athlete profile snapshot taken at arc start: stats, injuries, preferences, history. | When making any programming or substitution decision. |
| `active/current-week.md` | **HOT PATH** — currently-active week's daily prescriptions. | Every morning. The agent reads this to answer "what's today's workout?" |
| `active/current-block.md` | Currently-active block's full programming + strategy. | When the athlete asks "why this rep scheme?" or "what's the focus this block?" |
| `blocks/*.md` | All 3 blocks for this arc, full week-by-week programming. | When asked about future blocks or to compare. |
| `weeks/2026-Arc-W{01..18}.md` | All 18 weeks pre-rendered. | When asked "what's coming up in 3 weeks?" or "what did I do last Saturday?" |
| `styles/vertical-jump-guide.md` | Vendored copy of the VJ training style guide. | When asked "why depth jumps now?" or "what's the conjugate sequence?" |
| `styles/dylan-shannon-guide.md` | Vendored copy of the Dylan Shannon style guide. | When asked about upper body programming logic or 4-pillar framework. |
| `outputs/hybrid-athletic-plan-v6.xlsx` | Athlete-facing spreadsheet snapshot. | When the athlete asks "send me my plan" or wants the full visual. |

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
git sparse-checkout set athletes/andy/arc-2026-summer-dunk
git checkout rebuild-train-v2  # or the active branch
# Bundle is now at: _train/athletes/andy/arc-2026-summer-dunk/
```

To refresh later:
```bash
cd _train && git pull
```

### Mode 2: Rsync (simplest, manual)

```bash
rsync -av --delete \
  /local/path/to/train/athletes/andy/arc-2026-summer-dunk/ \
  /cloud/agent/path/athlete-bundle/
```

### Mode 3: Git submodule (when bundle becomes its own repo)

When you're ready to extract this as a standalone repo (e.g., for multi-tenant productization), do:

```bash
# In the train repo
git subtree split --prefix athletes/andy/arc-2026-summer-dunk -b extracted-arc
git push <new-arc-repo-url> extracted-arc:main

# Then in the agent repo
git submodule add <new-arc-repo-url> athlete-bundle/
```

---

## Refresh cadence

The bundle is **regenerated** by `.claude/skills/training-plan/build_v6.py` in the train repo. When the plan changes:

1. Edit `build_v6.py` (the data structures — never edit generated files directly)
2. Run `python3 .claude/skills/training-plan/build_v6.py` — overwrites this bundle
3. Commit + push the bundle changes
4. Cloud agent repo pulls (whichever mode above)

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

Bundle generated from train repo commit at: (filled in by build script — TODO).

Plan version: **v6** (Power Conversion + Reactive + Dunk Window + Peak/Realize).

Active arc start: **2026-05-03** (Sunday). End: **2026-09-05** (Saturday).
