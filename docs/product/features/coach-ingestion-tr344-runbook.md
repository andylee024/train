# TR-344 — First production run runbook

> Linear: [TR-344](https://linear.app/a24-personal/issue/TR-344/task-first-production-run-catalyst-athletics)
> Feature: [TR-337](https://linear.app/a24-personal/issue/TR-337/feature-coach-ingestion-pipeline)
> Architecture plan: [`coach-ingestion.md`](coach-ingestion.md)

This is the human-driven first end-to-end ingestion. It needs your `ANTHROPIC_API_KEY` and ~$10 of API spend. Builder-only.

## Preconditions

- All previous tasks landed: TR-339 (experiment) ✓, TR-340 (skeleton) ✓, TR-341 (extract) ✓, TR-342 (synthesize) ✓, TR-343 (review + land) ✓
- `pip install anthropic` — the SDK is needed by `extract.py` and `synthesize.py`
- `ANTHROPIC_API_KEY` set in `.env` at the repo root (or in your shell env)
- yt-dlp installed (`brew install yt-dlp` if missing)

## The decision you have to make before running

**Do you want to overwrite the existing hand-written `catalyst-athletics/` style guide, or land alongside as `catalyst-athletics-v2/` for comparison?**

| Choice | What it means | Recommended for |
|---|---|---|
| `catalyst-athletics-v2/` (default) | Auto-drafted guide lands as a *new* directory. The hand-written one stays untouched. | First run — gives you a clean A/B comparison. |
| `catalyst-athletics/` | Auto-drafted guide *replaces* the hand-written one. | Once you've iterated and the auto version is clearly better. |

The default is `-v2/`. To overwrite the hand-written guide, run with `COACH_SLUG=catalyst-athletics` before the script.

## The one-command run (recommended)

```bash
# Just run it (defaults: 30 videos, lands as catalyst-athletics-v2/)
bash .claude/skills/ingest-coach/run_catalyst.sh

# Smaller test ($3-4 instead of $10):
LIMIT=10 bash .claude/skills/ingest-coach/run_catalyst.sh

# Overwrite the hand-written one:
COACH_SLUG=catalyst-athletics bash .claude/skills/ingest-coach/run_catalyst.sh
```

The script halts after Stage 5 (review). You read the diff, then manually run `land.py --approve` (or iterate by editing prompts and re-running synthesize).

## Step-by-step (if you'd rather drive it manually)

```bash
# 1. Discover videos on the channel
python3 .claude/skills/ingest-coach/discover.py \
    --coach catalyst-athletics-v2 \
    --channel https://www.youtube.com/@catalystathletics/videos \
    --limit 30

# 2. Fetch transcripts (yt-dlp, no API spend yet)
python3 .claude/skills/ingest-coach/fetch.py --coach catalyst-athletics-v2 --limit 30

# 3. Extract structured data from each transcript (API spend starts here)
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics-v2

# 4. Validate citations on the extractions (cheap, no API)
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics-v2 --validate-only

# 5. Synthesize the draft guide (2 Claude calls)
python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics-v2

# 6. Review the diff
python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics-v2 --citations

# 7. If draft looks weak: edit prompts and re-run from step 5 (cheap loop)
#    vi .claude/skills/ingest-coach/prompts/synthesize_guide.md
#    python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics-v2

# 8. Land
python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics-v2 --approve
```

## What to look for in the review gate

Per the TR-344 acceptance criteria — your subjective gate. Things to check:

1. **Citations resolve.** Pick 3-5 random `[^vid-XXX]` markers in `guide.md`. Open `sources/sources.json` and read the supporting quote. Open the video at the timestamp. Does the quote say what the claim says?
2. **Coverage feels reasonable.** The `--citations` flag shows which videos contributed most. Are 2-3 videos doing all the work, or is it well-distributed? Concentration suggests the synth prompt is over-relying on a few extractions.
3. **No fabrication.** Re-read the guide looking for claims that sound generic / textbook. If a claim feels "off-style" for Catalyst, it might be invented. Run `extract.py --validate-only` to confirm extraction citations are all verbatim.
4. **Compare against the hand-written one.** `diff -r docs/content/training-styles/catalyst-athletics/ docs/content/training-styles/catalyst-athletics-v2/` — what's missing in the auto version? What's better?
5. **Exercise catalog completeness.** Does `exercise-selection.md` include the headline exercises (snatch, clean, jerk variants)? Missing snatch/clean/jerk = bug.

## Acceptance criteria (from TR-344)

- [ ] `docs/content/training-styles/catalyst-athletics-v2/` (or `catalyst-athletics/`) committed with auto-drafted `guide.md`, `exercise-selection.md`, `sources/`, `ingested.json`
- [ ] Hand inspection: drafted guide is at least as useful as the existing hand-written one (your call)
- [ ] Re-running the full pipeline immediately after produces zero work for stages 1-3
- [ ] Re-running after a new Catalyst video drops processes only that video and re-synthesizes
- [ ] All 6 TR-337 acceptance criteria check ✓

## Verifying the incremental property (after land)

```bash
# Re-run discover — should report 0 new videos
python3 .claude/skills/ingest-coach/discover.py --coach catalyst-athletics-v2 \
    --channel https://www.youtube.com/@catalystathletics/videos --limit 30
# Expect: "Already seen: 30, New videos: 0"

# Re-run fetch — should fetch nothing
python3 .claude/skills/ingest-coach/fetch.py --coach catalyst-athletics-v2 --limit 30
# Expect: "Fetched: 0  Skipped (cached): 30  Failed: 0"

# Re-run extract — should skip all
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics-v2
# Expect: "Extracted: 0  Skipped (cached): 30  Failed: 0"
```

## Troubleshooting

**`ANTHROPIC_API_KEY not set`** — add it to `.env` at the repo root, or `export ANTHROPIC_API_KEY=sk-ant-...` in your shell.

**`Missing anthropic SDK`** — `pip install anthropic`.

**yt-dlp 429 errors during fetch** — wait ~5 minutes and re-run; fetch is idempotent.

**Extract validation errors** (citation quote not found) — Claude paraphrased instead of quoting. Options:
1. Tweak `prompts/extract.md` to emphasize verbatim more
2. Run `extract.py --force --video-ids <id>` on the offenders only
3. Accept the errors; they're flagged but non-blocking

**Synth produces too-short / generic guides** — most likely the extraction stage has too few items per video. Inspect `extractions/<id>.json` files. If they're empty, the videos may all be performance footage (low-density). Try fetching more videos with `LIMIT=50`.

## After land — what changed

```
docs/content/training-styles/catalyst-athletics-v2/        ← NEW
├── README.md                       (auto-stub)
├── guide.md                        (draft → committed)
├── exercise-selection.md           (draft → committed)
├── sources/
│   └── sources.json                (citation map)
└── ingested.json                   (state pin: 30 video_ids)
```

`.ingestion-cache/catalyst-athletics-v2/manifest.json#seen_video_ids` is now in sync with `ingested.json`. Future runs of `discover.py` will only report videos posted AFTER this run.
