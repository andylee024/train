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

## Stage 3–6 (not yet implemented in this commit)

See later commits / Linear tasks:
- **TR-341** extract: per-video extraction with citation schema
- **TR-342** synthesize: aggregate extractions into `_template/`-shaped draft
- **TR-343** review + land: side-by-side diff + `--approve`-gated land
- **TR-344** first production run: end-to-end Catalyst Athletics ingestion

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
