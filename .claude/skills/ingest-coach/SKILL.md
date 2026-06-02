---
name: ingest-coach
description: "Turn a coach's YouTube channel into a draft style guide in docs/content/training-styles/<coach>/. Six-stage pipeline (discover → fetch → extract → synthesize → review → land) with a human review gate before landing. Trigger when: ingesting a new coach into the curated style library, or refreshing an existing coach with new videos."
---

# ingest-coach — Skill Guide

> Curated-library coach ingestion. Builder-operated. See [`docs/product/features/coach-ingestion.md`](../../../docs/product/features/coach-ingestion.md) for the architecture plan.

## What this skill does

Turns `youtube.com/@coach/videos` into a draft `docs/content/training-styles/<coach>/` directory of the same shape as the hand-written guides (matches `_template/`). The athlete-facing planner never knows whether a guide was hand-written or auto-drafted.

This is **NOT** the user-facing "Custom coach" path (which is ephemeral per-athlete — see [`docs/product/decisions.md` 2026-05-27](../../../docs/product/decisions.md)). This skill feeds the global curated library.

## Pipeline

```
discover → fetch → extract → synthesize → review → land
   |          |        |          |          |       |
yt-dlp     yt-dlp   Claude     Claude     stdout    cp + commit
 (list)   (subs)   (per-vid)  (across)    diff
```

Each stage is a separate script under this directory. The state pin (`manifest.json`) lets every stage decide what to skip on re-run.

## Cadence

**On-demand, by builder.** Re-run when:
- A new coach is being added to the library (full pipeline)
- An existing coach has new videos (incremental: discover finds new ids, fetch/extract only process them, synth re-runs, review surfaces the diff)
- The extraction or synthesis schema bumps version (full re-extraction triggered automatically)

## Storage

Two zones:

```
LOCAL CACHE (.ingestion-cache/, gitignored)        COMMITTED (docs/content/...)
└── <coach>/                                       training-styles/<coach>/
    ├── manifest.json                              ├── README.md       ← guide entry
    ├── transcripts/<id>.json                      ├── guide.md
    ├── extractions/<id>.json                      ├── exercise-selection.md
    └── draft/                                     ├── sources/
        ├── guide.md                               └── ingested.json   ← state pin
        ├── exercise-selection.md
        └── sources.json
```

The cache is heavy and never committed. The committed directory is the product.

## Stage 1: discover

```bash
python3 .claude/skills/ingest-coach/discover.py \
    --coach catalyst-athletics \
    --channel https://www.youtube.com/@catalystathletics/videos \
    [--limit 80]
```

Lists channel videos via `yt-dlp --flat-playlist` (no downloads). Diffs against `manifest.json#seen_video_ids` and reports new ones. No mutation of fetch/extract state — discovery is always re-runnable.

## Stage 2: fetch

```bash
python3 .claude/skills/ingest-coach/fetch.py \
    --coach catalyst-athletics \
    [--limit 20] [--video-ids ID1 ID2 ...]
```

Per [TR-339 experiment](../../../docs/product/features/coach-ingestion-experiment.md): YouTube auto-captions are the default source. For each new video:
- Pull auto-captions via `yt-dlp --write-auto-subs`
- Parse VTT: strip per-word `<...>` tags, dedupe scroll-animation duplicates, strip `[bracketed]` noise
- Record `chars_per_minute` density signal for downstream low-quality flagging
- Write `transcripts/<id>.json` and mark id as seen in manifest

**Idempotent.** Videos whose `transcripts/<id>.json` already exists are skipped (no network call).

**Fallback (not yet wired):** if `chars_per_minute` drops below a floor (suggesting auto-captions dropped speech segments in noisy environments — V4 of the experiment), the writeup recommends a re-fetch via OpenAI's `whisper-1` API. To be added when extraction quality flags need it.

## Stage 3: extract

```bash
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics \
    [--video-ids ID1 ID2 ...] [--force]

# Re-validate cached extractions without API calls:
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics --validate-only
```

Calls Claude (model: `claude-opus-4-7`) once per transcript with the
extraction prompt at `prompts/extract.md`. Output is structured JSON matching
`schema.json` (v1): `philosophy`, `exercises`, `programming_rules`,
`sample_sessions`, each item carrying a `{ts, quote}` citation.

**Validation:** every `citation.quote` must be a verbatim substring of the
source transcript text. Failed quotes are recorded under `_meta.validation_errors`
but don't block — the synth stage decides what to do.

**Idempotency:** skip if `extractions/<id>.json` exists with current
`schema_version`. Bump `CURRENT_EXTRACT_SCHEMA` to force re-extract everything.

**Density bypass:** transcripts under 200 chars/min (meet footage, low-signal
videos) emit an empty extraction with `_meta.skipped_reason` recorded.

## Stage 4: synthesize

```bash
python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics

# Iterate on prompts without re-running extract:
# (edit prompts/synthesize_*.md, then re-run the above)

# Skip Claude calls; rebuild sources.json only:
python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics --from-cache
```

Two Claude calls per run: one builds `draft/guide.md` from all extractions,
one builds `draft/exercise-selection.md` from just the exercise items.
Citations appear inline as `[^vid-VIDEOID]` markers. A procedural step then
walks both markdown docs for those markers and builds `draft/sources.json`
with the full citation map (video metadata + supporting quotes from each
cited extraction).

This is the iteration-heavy stage. Prompts at `prompts/synthesize_guide.md`
and `prompts/synthesize_exercises.md`. Tune them and re-run cheaply.

## Stage 5: review

```bash
python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics

# Just summary:
python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics --summary

# Per-video citation density (which videos contributed most):
python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics --citations
```

Side-by-side unified diff between `draft/` and `docs/content/training-styles/<coach>/`
(or full-as-additions on first ingestion). Color-coded if stdout is a tty.
Includes file-size summary table and (with `--citations`) per-video markers
across guide.md + exercise-selection.md.

Reviewer reads the diff, then approves via `land.py --approve` or rejects
by editing prompts and re-running `synthesize.py`.

## Stage 6: land

```bash
# Dry-run (default — prints what would change):
python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics

# Actually commit:
python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics --approve
```

On `--approve`:
1. Copies `draft/guide.md` → `docs/content/training-styles/<coach>/guide.md`
2. Copies `draft/exercise-selection.md` → same dir
3. Copies `draft/sources.json` → `docs/content/training-styles/<coach>/sources/sources.json`
4. Auto-generates a `README.md` stub at the coach's dir
5. Writes `ingested.json` (state pin: list of video_ids represented in the committed guide)
6. Syncs `manifest.json#seen_video_ids` to match `ingested.json`

Manifest sync is the contract that makes incremental re-runs work: after
land, only videos posted AFTER the most recent landed-on date appear as
"new" in a future discover run.

## Full one-coach pipeline

```bash
# First ingestion (~5-15 min with API calls):
python3 .claude/skills/ingest-coach/discover.py --coach catalyst-athletics \
    --channel https://www.youtube.com/@catalystathletics/videos --limit 30
python3 .claude/skills/ingest-coach/fetch.py --coach catalyst-athletics
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics
python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics
python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics
python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics --approve

# Later refresh (a few new videos posted):
python3 .claude/skills/ingest-coach/discover.py --coach catalyst-athletics --channel <URL>  # reports N new
python3 .claude/skills/ingest-coach/fetch.py --coach catalyst-athletics                     # fetches just those
python3 .claude/skills/ingest-coach/extract.py --coach catalyst-athletics                   # extracts just those
python3 .claude/skills/ingest-coach/synthesize.py --coach catalyst-athletics                # re-synths everything
python3 .claude/skills/ingest-coach/review.py --coach catalyst-athletics                    # diff shows just the new content
python3 .claude/skills/ingest-coach/land.py --coach catalyst-athletics --approve
```

## Manifest schema

```json
{
  "coach_slug": "catalyst-athletics",
  "channel_url": "https://www.youtube.com/@catalystathletics/videos",
  "last_run": "2026-06-01T15:23:00+00:00",
  "seen_video_ids": ["XpN5dGyHKqY", "mzzmZAWxOn4", ...],
  "schema_version": 1
}
```

## Transcript schema

```json
{
  "video_id": "XpN5dGyHKqY",
  "title": "Exercise Selection & Order — Programs Pt. 6",
  "duration_seconds": 780,
  "upload_date": "20260301",
  "fetched_at": "2026-06-01T15:23:00+00:00",
  "source": "youtube-auto",
  "char_count": 14438,
  "chars_per_minute": 1110.6,
  "text": "Welcome back to the program design series...",
  "segments": [{"ts": 0.0, "line": "Welcome back to the program design"}, ...]
}
```

## Idempotency contract

| Stage | Re-run does work when |
|---|---|
| discover | always (cheap; emits new-id diff) |
| fetch | only new video ids |
| extract | only new transcripts, OR all if `schema_version` bumped |
| synthesize | always (cheap relative to extract) |
| review | only if synth diff vs committed is non-trivial |
| land | only on explicit `--approve` flag |

Running discover + fetch twice in a row on a stable channel produces zero network work on the second run.

## Failure modes to watch for

- **Meet-floor / performance videos** (e.g. "Laura Alexander — 103/134kg @ Nationals") produce ~1.5K char transcripts of coach calls with no programming content. Stage 2 records `chars_per_minute`; downstream can heuristically skip these (rule of thumb: < 500 chars/min = probably not instructional).
- **Noisy gym audio** drops content silently in auto-captions (V4 of the experiment lost an "RDL with a pull finish" passage entirely). The `chars_per_minute` signal will be lower than a studio video of the same length — useful flag for the Whisper fallback.
- **yt-dlp rate limits** (HTTP 429) occasionally on consecutive fetches. Re-running picks up where it left off.
