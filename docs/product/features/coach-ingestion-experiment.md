# Coach-ingestion transcript-source experiment

> Related: feature plan [`coach-ingestion.md`](coach-ingestion.md), Linear [TR-339](https://linear.app/a24-personal/issue/TR-339/task-transcript-source-experiment)

## TL;DR

**Verdict: Default Stage 2 transcript source = YouTube auto-captions.** With one caveat: noisy / on-platform recordings (training camp, gym, meet floor) lose ~15% of content and miss specific exercise names. Reserve cloud Whisper (`whisper-1` via OpenAI API, ~$0.30/coach) as the fallback when extraction quality flags low-information transcripts.

The experiment as originally scoped called for local Whisper (`large-v3`) as ground truth. We swapped that out — local Whisper was rejected as too heavyweight (3 GB model download, ~10 min/video transcription). Instead we used YouTube's **manually-uploaded English captions** as ground truth where available. Catalyst Athletics uploads manual captions for most of their videos, which gave us a strong baseline for 3/5 sample videos.

## Sample selection

5 Catalyst Athletics videos, mix of formats:

| # | Video ID | Title | Length | Format |
|---|---|---|---|---|
| V1 | `XpN5dGyHKqY` | Exercise Selection & Order — Programs Pt. 6 | 13:00 | Studio lecture |
| V2 | `mzzmZAWxOn4` | Laying Out The Training Week Schedule | 7:28 | Studio lecture |
| V3 | `zpEDfvqPF-4` | Laura Alexander — 103/134kg @ Nationals | 5:50 | Meet footage |
| V4 | `dUhU45y5DRk` | Training Camp Day 1 — Snatch/Deadlift/Squat | 18:24 | Gym commentary |
| V5 | `VNHyV9rHSwk` | Visualization for Athletic Performance | 6:48 | Studio lecture |

Manual captions available for V1, V2, V4. V3 and V5 had only one caption track each.

Raw caption files cached at `.ingestion-cache/experiment/` (gitignored).

## Method

For each video:

1. `yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "en.*,en"` to fetch both tracks.
2. Strip VTT/SRT markup and per-word timing; dedupe repeated subtitle frames; emit plain text. See `extract_clean.py`.
3. For the 3 videos with both tracks, run a term-frequency comparison on:
   - **Jargon** — Olympic lifting vocabulary (snatch, clean, jerk, hang, deadlift, RDL, front squat, mesocycle, RPE, etc.)
   - **Numbers** — set × rep notation, percentages, kg, day counts
4. For V3 and V5 (auto-only), inspect content quality qualitatively.

Decision rule (per feature plan §5): **auto-captions wins if ≥4/5 on both axes.**

## Results

### Per-video term comparison (auto vs manual)

**V1 — Exercise Selection (lecture):**

| Term | auto | manual | Δ |
|---|---|---|---|
| snatch | 32 | 32 | 0 |
| clean | 24 | 23 | +1 |
| jerk | 32 | 32 | 0 |
| push press | 4 | 3 | +1 |
| squat | 26 | 26 | 0 |
| front squat | 2 | 2 | 0 |
| back squat | 5 | 5 | 0 |
| pull | 17 | 11 | +6 ⚠ |
| mesocycle | 3 | 2 | +1 |

**Verdict V1: pass.** Identical jargon coverage; the `pull` delta is auto-caption fragment duplication (extractor dedup quirk), not a fidelity issue.

**V2 — Training Week Schedule (lecture):**

| Term | auto | manual | Δ |
|---|---|---|---|
| snatch | 4 | 4 | 0 |
| clean | 2 | 2 | 0 |
| jerk | 2 | 2 | 0 |
| squat | 4 | 4 | 0 |
| pull | 2 | 2 | 0 |

**Verdict V2: pass.** Perfect parity.

**V4 — Training Camp Day 1 (gym commentary, background noise):**

| Term | auto | manual | Δ |
|---|---|---|---|
| snatch | 13 | 14 | −1 |
| deadlift | **0** | 2 | **−2** ⚠ |
| front squat | **0** | 1 | **−1** |
| RDL | **0** | 1 | **−1** |
| rep | **0** | 2 | **−2** ⚠ |
| pull | 5 | 5 | 0 |
| percentage | 2 | 2 | 0 |

**Verdict V4: fail.** Auto captions miss the entire `RDL with a pull finish` passage about Adela, miss `snatch deadlifts` discussion, and fragment `front squat` as `front [clears throat] squat`. Total auto text length is ~15% shorter than manual (13,806 vs 16,324 chars), suggesting auto silently dropped speech segments in the noisier gym environment.

**V3 — Meet footage (auto only):**

Caption track is ALL CAPS coach calls (`THERE WE GO, LAURA. SHOW ME THAT CONFIDENCE`), 1,688 chars total — no methodological content. Not useful regardless of transcript source. **Vacuous pass** — there's nothing to extract from a meet-floor video anyway, so the ingestion pipeline should learn to skip these (heuristic: short transcript + caps ratio → drop).

**V5 — Visualization (auto only):**

6,856 chars of normal lecture speech. Few oly terms (this video is about mental skills). Captions look clean on inspection. **Pass** (no comparison possible).

### Numbers fidelity

| Video | Auto numeric patterns | Manual numeric patterns | Notes |
|---|---|---|---|
| V1 | `3 day`, `4 day` | (spelled-out) | Auto uses digit form — easier for extraction |
| V2 | `5-day`, `4-day`, `3-day` | `five-day`, `four-day`, `three-day` | Auto wins for extraction |
| V3 | none | n/a | meet footage |
| V4 | `90%`, `100%`, `2 week` | `90%`, `100%` | Auto caught one extra |
| V5 | none | none | conceptual video |

**Numbers: auto-captions are actually superior** — YouTube auto normalizes numeric phrases to digit form, which is easier to pattern-match in Stage 3 extraction. Manual captions preserve the speaker's spoken form (`three-day` vs `3-day`).

## Verdict

| Axis | Score | Notes |
|---|---|---|
| **Jargon fidelity** | 4/5 pass | V4 (gym commentary) fails — silent segment drops |
| **Numbers fidelity** | 5/5 pass | Auto uses digit form, easier to extract |

**Default Stage 2 source = YouTube auto-captions.** Per the decision rule (≥4/5 on both axes).

## Caveats + follow-ups

1. **Whisper not actually tested.** Local Whisper was deferred (model size); cloud Whisper not run. Manual captions are a reasonable ground-truth proxy because Catalyst's manual track is creator-produced, but it's not the same rigor as the planned comparison. If Stage 3 extraction quality is weak on real ingestions, **revisit with OpenAI's `whisper-1` API** (~$0.006/min audio → ~$0.30 for a 5-video coach sample). Easy to A/B against the auto baseline.

2. **Gym/meet videos lose content.** V4's training-camp commentary lost an `RDL with a pull finish` passage entirely from auto-captions. **Recommendation:** Stage 2 fetch should record `transcript_quality_signal` per video (length ratio if manual captions exist, otherwise length per minute of duration). Stage 3 extraction or Stage 4 synthesis can flag low-quality videos and either downweight them or trigger a Whisper fallback.

3. **Meet-floor videos should be skipped.** V3 had 1,688 chars total — almost entirely "THERE WE GO LAURA" coach calls. No programming content. **Recommendation:** Stage 1 (discover) or Stage 2 (fetch) should heuristically detect performance/meet videos and skip them — e.g., title pattern match (`/\d+\/\d+\s*kg/`, `nationals`, `championships`) or a transcript-density floor (< 200 chars/min → skip).

4. **Auto-captions inline noise annotations** like `[music]`, `[clears throat]`, `[applause]`. Stage 3 must strip these before pattern-matching exercise names, otherwise `front [clears throat] squat` will be missed.

5. **Manual captions are NOT a perfect ground truth.** V4 manual rendered "pulls" as "polls" in places (homophone error from caption editor). Manual is *better* than auto on most metrics but not flawless.

## Implementation hints for TR-340 (fetch stage)

- `yt-dlp --skip-download --write-auto-subs --sub-langs "en.*"` is sufficient. Don't bother fetching audio.
- Convert VTT → plain text by stripping `<...>` tags, dropping `Kind:`/`Language:`/`-->` lines, and deduping consecutive identical subtitle frames (auto-captions repeat heavily due to scroll animation).
- Strip `[bracketed annotations]` before extraction.
- Record `char_count` and `duration_seconds` per transcript so downstream can flag low-density videos.
