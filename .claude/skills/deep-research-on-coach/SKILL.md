---
name: deep-research-on-coach
description: Multi-source content pipeline that discovers, approves, and extracts coach-related content (YouTube auto-captions, Scribd PDFs, web articles, Substack posts) into Supabase tables for downstream synth-style-guide generation. Trigger via `/deep-research-on-coach <slug>`. Do NOT use this skill to write a style guide directly — that's a downstream consumer.
---

# deep-research-on-coach — Skill Guide

> Pipeline for building up a coach's body of source material in Supabase. The
> committed style guides at `docs/content/training-styles/<coach>/` are NOT
> produced by this skill — they're synthesized by a downstream consumer from
> the `documents` table this skill populates.

## Storage boundary

Per `docs/product/database-schema.md`:

| Layer | Source of truth |
|---|---|
| **Researched coach content** | `public.documents` table + `coach-content` Storage bucket |
| **Curated coach signals** | `public.coaches` table |
| **Style guides** (synthesized downstream) | `docs/content/training-styles/<coach>/guide.md` |

This skill writes to the first two. The third is out of scope.

## Trigger

`/deep-research-on-coach <coach-slug>` — slug must match `public.coaches.slug`
(skill creates the row if missing using `slug` as both id and display_name
default; operator edits later).

## Stages

| # | Stage | Idempotent? | Cost lever |
|---|---|---|---|
| 1 | `discover` | yes — `on conflict (coach_id, url) do nothing` | `--max-discovery-cost $X` (default $15) |
| 2 | `approve` | yes — operator-driven | interactive |
| 3 | `extract_yt` | yes — skip if `schema_version` matches | yt-dlp (~free) |
| 4 | `extract_scribd` | yes — skip if `schema_version` matches | Scribd PDF download |
| 5 | `extract_web` | yes — skip if `schema_version` matches | HTTP fetch (~free) |

### Stage contract

```python
def run(slug: str, supabase: Client, force: bool = False, max_discovery_cost: float = 15.0) -> dict:
    """Returns {ok: bool, counts: {discovered, approved, extracted, skipped, failed}}."""
```

### Idempotency rules

- A document is **skipped** at extract time if `status='extracted' AND schema_version=CURRENT_DOCUMENT_SCHEMA`.
- Pass `--force` to ignore the schema check and re-extract everything.
- **Bumping `_constants.CURRENT_DOCUMENT_SCHEMA`** = full re-extract semantics; next run re-extracts every doc whose recorded `schema_version` is older.

## Canonical invocation

```bash
python3 .claude/skills/deep-research-on-coach/run.py --slug catalyst-athletics
python3 .claude/skills/deep-research-on-coach/run.py --slug catalyst-athletics --force
python3 .claude/skills/deep-research-on-coach/run.py --slug catalyst-athletics --max-discovery-cost 5
```

## Storage

The `coach-content` Supabase Storage bucket holds binary artifacts (Scribd
PDFs, podcast audio, etc.). Plain-text extractions live in
`public.documents.content_text`.

To create the bucket via the Supabase MCP (one-time, out-of-band — SQL can't
do it):

```
mcp__claude_ai_Supabase__create_branch — no, wrong tool
Instead: use the Storage REST API or dashboard. The skill assumes the bucket
already exists; it errors out if not.
```

The bucket should be **public read** in v0; no RLS on its objects.

## Cost ceiling

`--max-discovery-cost` (default $15) is a soft cap on the discover stage's
search API spend. The discover stage aborts before exceeding the cap. The
extract stages have no soft cap — they cost what the source costs (yt-dlp is
free, Scribd download is per-doc).

## What "done" looks like for one coach

After a successful run, `select status, count(*) from documents where coach_id = X group by status` returns at minimum:
- ≥ 1 `extracted` row across yt_video, scribd_doc, web_article
- 0 rows stuck in `pending_approval` if all candidates were reviewed
- 0 rows in `failed` for transient errors (rerun if any)

## Failure modes

- **Discover hits the soft cap** → stage exits with `ok: False`, surfaces count of pending hits and the URL of the search-cost log.
- **Approve has nothing pending** → no-op, prints `Nothing to approve.`
- **Extract finds no `approved` rows** → no-op, prints `Nothing to extract.`
- **Schema bump but no `--force`** → next run automatically re-extracts everything older than `CURRENT_DOCUMENT_SCHEMA`.
