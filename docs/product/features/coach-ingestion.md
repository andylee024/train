# Feature plan: Coach ingestion pipeline

> Status: **draft** (architecture locked, not yet decomposed to tasks)
> Owner: Andy
> Related: [`docs/content/training-styles/_template/`](../../content/training-styles/_template/), [decisions log entry 2026-05-27](../decisions.md) (custom-coach ephemerality)

## Why

The curated style library at `docs/content/training-styles/` is currently hand-written. Each guide takes hours of reading + watching + structuring. To scale the library beyond the 4 styles that exist today (catalyst-athletics, dylan-shannon, matt-smith-flexibility, vertical-jump), we need a pipeline that turns a coach's public content into a draft style guide that a human reviews and lands.

The output of this pipeline is **the same artifact a human would write by hand** — populated `guide.md`, `exercise-selection.md`, and `sources/` inside `docs/content/training-styles/<coach>/`. The planner doesn't care whether the guide was hand-written or auto-drafted; it only sees the committed result.

This pipeline is **not** the user-facing "Custom coach" feature (see decisions.md 2026-05-27 — that path is ephemeral per-athlete). This is the global-library curation path: builder-operated, gated by human review.

## Scope

**In:**
- Single-coach ingestion: YouTube channel URL → drafted `docs/content/training-styles/<coach>/` directory
- Transcript-only signal (no video frames, no podcast audio yet)
- Per-video extraction → cross-video synthesis → human review gate
- Incremental re-runs (only new videos re-fetched/re-extracted)
- An experiment to choose auto-captions vs Whisper as the default transcript source

**Out:**
- Multi-coach blending into an arc (separate pipeline, downstream of this one)
- Video frame extraction (form demos, on-screen charts)
- Coach blog / podcast / IG scraping (could plug in later as additional Stage 2 sources)
- Affiliate link wiring (business work, not build work)
- Auto-publishing without review

## Decisions locked

| # | Decision | Notes |
|---|---|---|
| 1 | **Transcript source: TBD, gated on experiment** | Default candidate is YouTube auto-captions (free, fast). Whisper is the fallback if accuracy on coaching jargon is unacceptable. See §5 for the experiment. |
| 2 | **One coach per ingestion run** | No batch mode. The review gate is load-bearing; batching tempts skim-reviewing. |
| 3 | **Schema versioning: minimal** | Each `extractions/*.json` carries `schema_version`. Bumping the schema forces re-extract on next run. No migration logic — re-extraction is cheap relative to fetching. |

## Pipeline

```
                YT channel URL + coach slug  ──┐
                                                │
                                                ▼
┌──────────────────────┐         ┌────────────────────────────┐
│ 1. DISCOVER          │         │ manifest.json              │
│   yt-dlp --flat      │ ◄─────► │  { last_run, seen: [...id] │  (state pin)
│   list ids, titles,  │         └────────────────────────────┘
│   dates              │
│   diff vs seen[]     │
└─────────┬────────────┘
          │ new video ids only
          ▼
┌──────────────────────┐         ┌────────────────────────────┐
│ 2. FETCH             │ ──────► │ transcripts/<id>.json      │
│   auto-captions or   │         │  { text, segments[ts,line] │  (raw cache)
│   Whisper fallback   │         └────────────────────────────┘
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐         ┌────────────────────────────┐
│ 3. EXTRACT           │ ──────► │ extractions/<id>.json      │
│   per-video Claude   │         │  { schema_version,         │
│   pass → schema      │         │    philosophy[],           │  (structured,
│   (citations: each   │         │    exercises[],            │   per video)
│   claim links to     │         │    programming_rules[],    │
│   a transcript ts)   │         │    sample_sessions[],      │
│                      │         │    citations: [{ts,quote}] │
└─────────┬────────────┘         └────────────────────────────┘
          │
          ▼
┌──────────────────────┐         ┌────────────────────────────┐
│ 4. SYNTHESIZE        │ ──────► │ draft/<coach>/             │
│   aggregate across   │         │   guide.md                 │
│   all extractions:   │         │   exercise-selection.md    │  (proposed
│   dedup, resolve     │         │   sources.json             │   output)
│   contradictions,    │         └────────────────────────────┘
│   weight recency     │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ 5. REVIEW (you)      │   diff draft vs current style guide
│   side-by-side gate  │   approve / reject / edit
│   spot-check         │   verify cited timestamps actually say it
│   citations          │
└─────────┬────────────┘
          │ approved
          ▼
┌──────────────────────┐         ┌────────────────────────────┐
│ 6. LAND              │ ──────► │ docs/content/              │
│   write final guide  │         │   training-styles/<coach>/ │
│   + bump manifest    │         │     README.md              │  (committed
│                      │         │     guide.md               │   product —
│                      │         │     exercise-selection.md  │   matches
│                      │         │     sources/               │   _template
│                      │         │     ingested.json          │   shape)
└──────────────────────┘         └────────────────────────────┘
```

## Storage layout

```
LOCAL CACHE                              COMMITTED
.ingestion-cache/  (gitignored)          docs/content/training-styles/
└── <coach>/                             └── <coach>/
    ├── manifest.json                        ├── README.md
    ├── transcripts/<id>.json                ├── guide.md
    └── extractions/<id>.json                ├── exercise-selection.md
                                             ├── sources/            ← raw refs
                                             └── ingested.json       ← state pin
```

The cache holds heavy raw data; the committed directory holds the product. `ingested.json` lets the next run know which videos are already represented in the current guide so the synth step can compute a meaningful diff.

## Re-run behavior

| Stage | Re-runs when |
|---|---|
| 1. Discover | every run (cheap) |
| 2. Fetch | only new video ids |
| 3. Extract | only new transcripts, OR all if `schema_version` bumped |
| 4. Synthesize | every run |
| 5. Review | only if synth diff vs committed guide is non-trivial |
| 6. Land | only on approval |

"Coach posted 3 new videos" → 3 fetches, 3 extractions, 1 synth, 1 review. Not a full re-ingest.

## Per-video extraction schema (sketch, v1)

```json
{
  "schema_version": 1,
  "video": { "id": "...", "title": "...", "url": "...", "published_at": "..." },
  "philosophy": [
    { "claim": "...", "citation": { "ts": 124.5, "quote": "..." } }
  ],
  "exercises": [
    { "name": "...", "category": "...", "loading_note": "...",
      "citation": { "ts": ..., "quote": "..." } }
  ],
  "programming_rules": [
    { "rule": "...", "scope": "block | week | session",
      "citation": { "ts": ..., "quote": "..." } }
  ],
  "sample_sessions": [
    { "context": "...", "exercises": [...], "citation": { "ts": ..., "quote": "..." } }
  ]
}
```

Every claim must carry a `citation` so Stage 5 review can spot-check (jump to the timestamp, verify the coach actually said it). Uncited claims are a synthesis bug.

## §5 — The transcript-source experiment

Goal: decide if YouTube auto-captions are good enough to default to, or if Whisper is required.

**Setup**
- One coach. Suggest **Catalyst Athletics** (Greg Everett): large channel, technical jargon, hand-written reference exists, clean studio audio likely → strong baseline. If auto-captions fail here, they'll fail everywhere.
- Sample N = 5 videos: 2 modern studio clips, 2 older / lower-quality clips, 1 podcast-format / interview clip (mixed audio).
- For each: fetch auto-captions; fetch Whisper transcript (large-v3 or equivalent).

**Comparison axes** (Whisper as ground truth, auto-captions as candidate)
- **Jargon fidelity:** does the candidate spell "snatch high pull," "hang power clean," "tempo eccentric" etc. correctly? Or does it say "snap high pole," "hang power lean"?
- **Numbers:** sets, reps, percentages, weights — are they captured accurately enough that the extraction step gets them right?
- **Segmentation:** are timestamps fine-grained enough for citation spot-checks?

**Decision rule**
- Auto-captions wins if it passes jargon fidelity on ≥ 4/5 clips AND numbers on ≥ 4/5 clips. → default Stage 2 to auto-captions; reserve Whisper for explicit fallback when extraction confidence is low.
- Else Whisper is the default. Accept the cost.

**Output of experiment**
- A short markdown writeup in `docs/product/features/coach-ingestion-experiment.md` with the 5-video comparison table and the call. Lands before any other build work on this feature.

## Open items

- **Conflict resolution heuristic.** If two videos say opposite things ("low-bar squat preferred" vs "high-bar squat preferred"), default: weight by `published_at` recency, keep both in `sources.json`, surface the conflict in the review-gate diff.
- **Where the pipeline runs.** Local CLI under `.claude/skills/ingest-coach/` is the obvious shape — matches `plan-training-arc/` precedent. Confirm in decomposition.

**Decided:**
- Coach #1 for full pipeline run = **Catalyst Athletics** (same as the experiment coach — the experiment doubles as a real ingestion).
- Synthesis prompt design is its own task in decomposition (Stage 4 owns its iteration loop; see task #4 below).

## Suggested decomposition (hint for `/decompose-to-tasks`)

Rough task shape if this becomes a Linear Feature:

1. **Transcript-source experiment** — pick coach, fetch 5 video pairs, write comparison report. Blocking gate for everything else.
2. **Pipeline skeleton** — `.claude/skills/ingest-coach/` skill, Stages 1–2 only (discover + fetch), wrote to `.ingestion-cache/`. No extraction yet.
3. **Extraction stage** — Stage 3, schema v1, citations required, run against the cached transcripts from step 2.
4. **Synthesis stage** — Stage 4, produce draft markdown matching `_template/` shape, sources.json with claim provenance.
5. **Review + land flow** — Stage 5–6, side-by-side diff, approval prompt, commit to `docs/content/training-styles/<coach>/`.
6. **Incremental re-run** — manifest-driven skip logic across all stages, verified by re-running on the same coach with no new videos (expect: no work done) and with one new video (expect: just that video reprocessed).

Each task is independently shippable and verifiable. Step 1 is the appetite-defining gate.

## Appetite

1–2 weeks for end-to-end coach #1 landed in the committed library, assuming the experiment doesn't surface a surprise (e.g., extraction quality on transcripts being worse than expected, which would push the appetite).
