> **CLOSED (W1–W24, May 3 – Nov 7, 2026).** Active arc: `../arc-2026-winter-jump/`. Everything below is the summer arc as it stood on Nov 2, 2026 (history).

# Arc Bundle — Andy / Summer 2026 Dunk

Self-contained plan for **Andy Lee**. The text agent reads this directory to deliver the day's workout. The plan is hand-edited markdown. Logged sets live in Supabase, not in these files.

---

## Where he is

**Mon Nov 2, 2026 is arc week W24** (Sun Nov 1 – Sat Nov 7), the last week of **B1 Strength** (W21–W24, Oct 11 – Nov 7). The arc closes Sat Nov 7. The next arc starts **W1 on Nov 8**: Power (W1–4) → Reactive (W5–8) → Test (W9–12, dunk test Jan 30, 2027). Arc week = DNT coach week. W1 is not written yet.

**Start:** 2026-05-03. **End:** 2026-11-07. **Plan version:** v10 (2026-10-11).

Goals, in priority order:

1. **Dunk a volleyball** on a 10' rim.
2. **Power clean 225 and power clean & jerk 225** with the DNT coach.
3. **Strength keeps climbing.** 405 squat within 12 months.

No BJJ. The side split is not tracked. Mobility lives in the warm-ups and fillers.

The Oct 10 dunk/vertical review asked for a jump-first block and to park the 405. That is the next arc, not a rewrite of this week. The decision is in `training/arc.md` and at the top of `reviews/dunk-vertical-review-2026-10-10.md`.

Programmed with `build-workout-plan` and the four `principle-*` skills, plus the Vertical Jump / THP and Dylan Shannon guides. The DNT coach's Olympic lifts run as written.

---

## Bundle contents

```
arc-2026-summer-dunk/
├── README.md, CLAUDE.md, profile.md
├── archive/                         ← superseded arc + profile text
├── training/
│   ├── arc.md
│   ├── active/current-week.md       ← HOT PATH (W24)
│   ├── active/current-block.md      ← B1 Strength
│   ├── blocks/                      ← block 4 is current; blocks 1–3 are closed
│   └── weeks/                       ← W01–W24, plus weeks/archive/
├── coach-programs/                  ← DNT PDFs, one per 2-week drop
├── reviews/
└── styles/
```

| Path | What it is | When to read it |
|---|---|---|
| `README.md` | This file. | First contact. |
| `CLAUDE.md` | Agent operating instructions for the bundle. | Every session. |
| `profile.md` | Current profile: goals, Oct 11 numbers, injuries, split. | Any programming or substitution decision. |
| `training/arc.md` | Why the arc exists, the three goals, W24, and the Nov 8 decision. | "What's the goal?" or "how does this block fit?" |
| `training/active/current-week.md` | **Hot path.** W24 daily prescriptions (Sun Nov 1 – Sat Nov 7). | Every morning. |
| `training/active/current-block.md` | B1 Strength: split, loads for W21–W24, tests. | "Why this rep scheme?" |
| `training/blocks/2026-09-block-04-405-strength-push.md` | Same B1 block, filed under `blocks/`. | With the current block. |
| `training/blocks/2026-05-block-01-power-conversion.md`, `2026-06-block-02-reactive-dunk-window.md`, `2026-07-block-03-peak-realize-test.md` | Closed blocks. Each file says it is closed. | History of this arc only. |
| `training/weeks/2026-training-W01.md` … `W24.md` | One file per week. W23 and W24 loads match `current-block.md`. W01–W20 still show the goals and arc length from when they were written. | A past week, or W24 alongside `current-week.md`. |
| `training/weeks/archive/` | Pre-v9 copies of W11 and W12. | Only if that rewrite comes up. |
| `coach-programs/` | Raw DNT PDFs. | A new 2-week drop. |
| `reviews/dunk-vertical-review-2026-10-10.md` | Oct 10 jump review, plus the Nov 2 decision to run it as the next arc. | Why the next arc is jump-first. |
| `reviews/blocks/`, `reviews/progress-analysis-2026-09-3mo.md` | Reviews of blocks that already happened. | History. |
| `styles/vertical-jump-guide.md` | VJ / jump methodology. | Jump, power, reactive questions. |
| `styles/dylan-shannon-guide.md` | Dylan Shannon / strength-wave methodology. | Upper body and wave questions. |
| `styles/daily-warmup.md` | The Daily 7. | Warm-up. |
| `archive/` | Superseded arc text and the May 3 profile snapshot. | When the old five goals come up. |

---

## How to pull this bundle

### Mode 1: Git sparse checkout

```bash
git clone --filter=blob:none --no-checkout https://github.com/andylee024/train.git _train
cd _train
git sparse-checkout init --cone
git sparse-checkout set docs/athletes/andy/arc-2026-summer-dunk
git checkout main
# Bundle is at: _train/docs/athletes/andy/arc-2026-summer-dunk/
```

Refresh later with `cd _train && git pull`.

### Mode 2: Rsync

```bash
rsync -av --delete \
  /local/path/to/train/docs/athletes/andy/arc-2026-summer-dunk/ \
  /cloud/agent/path/athlete-bundle/
```

### Mode 3: Git submodule

When this bundle is extracted into its own repo:

```bash
# In the train repo
git subtree split --prefix docs/athletes/andy/arc-2026-summer-dunk -b extracted-arc
git push <new-arc-repo-url> extracted-arc:main

# Then in the agent repo
git submodule add <new-arc-repo-url> athlete-bundle/
```

---

## Refresh cadence

The files under `training/` are the plan. Edit them directly. There is no generator (`build_training_arc.py` was removed 2026-06-21).

1. Edit the markdown (usually `training/active/current-week.md` and the matching `training/weeks/` file, via `build-workout-plan`).
2. Commit and push.
3. The agent repo pulls.

**DNT cadence:** a new program drops about every 2 weeks. Arc week = DNT week. On each drop, fold her Olympic lifts in with `build-workout-plan` (`principle-dnt-olympic-lifts`). Her back squat is skipped.

Pull at least once a week (Sunday) so `current-week.md` is the week that just started. Pulling daily is fine.

---

## Storage boundary

| Lives elsewhere | Where | Why |
|---|---|---|
| Executed sets | Supabase `exercise_sets` (project `vtruwlvekfnmfgaundhp`) | This bundle is the plan. Logs are queried at runtime. |
| Session notes | Supabase `workouts.notes` | Same. |

Do not write executed sets into the markdown. Do not write the plan into Supabase.

---

## History

Opened as an 18-week arc (May 3 – Sep 5, 2026) with five goals: women's basketball dunk, power clean + jerk 225, side split −8 cm, BJJ 3–4×/week, bench 260 and weighted pull-up +55–60×5. Plan v8 (2026-06-21) brought in the DNT Olympic structure. Plan v9 (2026-07-26) was the Olympic-forward split from W11. The end date moved to W18 (Sep 26), then to W24 (Nov 7).

Plan v10 (2026-10-11) is the current three goals, no BJJ, side split not tracked, W21–W24 Strength. The 2026-11-02 doc pass made the live files match W24 and recorded the next-arc decision. Older wording is in `archive/`.
