# Decisions

Append-only log of non-trivial product + architecture decisions. Each entry: date · decision · rationale · alternatives considered.

---

## 2026-06-09 — Coach research moved from local file pipeline to Supabase

**Decision.** Coach source material (YouTube auto-captions, Scribd PDFs, web articles, Substack posts) is discovered, approved, and extracted by `.claude/skills/deep-research-on-coach/` into the Supabase `documents` table + `coach-content` Storage bucket. The legacy `.claude/skills/ingest-coach/` skill (which wrote synthesized markdown directly to `docs/content/training-styles/<coach>/`) is superseded.

**Rationale.**

- **Separation of concerns.** Source extraction and guide synthesis were entangled in the old skill — re-running the synth step required re-running the extraction. Splitting them lets the synth consumer iterate against frozen extractions.
- **Idempotency at row-level.** A `(coach_id, url)` unique constraint + `schema_version`-aware skip logic means re-runs do zero work unless the schema bumps. Old skill's file-based manifest was coarser.
- **Multi-source from day one.** YT-only sourcing forced the synth step to fabricate detail beyond what the captions said. Adding Scribd PDFs (e.g. Israetel's volume-heavy programming docs) + web articles + Substack closes the gap.
- **Operator-in-the-loop approval.** Pending-approval rows surface every candidate before extraction (and before the source's content lands in the synth guide). Hand-waving canonical-channel filtering catches most cross-channel collab false positives.

**Alternatives considered.**

- *Keep ingest-coach and add multi-source there.* Rejected — the file-based manifest doesn't model approval gates well, and the skill's contract was "produces a guide" not "produces source material," so a redesign was cleaner than retrofit.
- *Skip Supabase, use SQLite locally.* Rejected — coaches table needs to be shared with the Next.js marketplace (which already uses Supabase), so a second DB doubles the integration surface.
- *No human approval gate.* Rejected — discover surfaces cross-channel collabs and unrelated coaches sharing names; without an approval pass, the extracted corpus would be too noisy to synthesize from.

**Impact.**

- New: `app/supabase/migrations/20260609000000_coach_content.sql` (coaches + documents + storage bucket)
- New: `.claude/skills/deep-research-on-coach/` (run.py + 5 stage modules + SKILL.md + _constants.py)
- Updated: `CLAUDE.md` storage boundary table — adds "Researched coach content"
- Superseded (to delete after dogfood validates): `.claude/skills/ingest-coach/`
- Open: synth step that reads from `documents.content_text` and writes to `docs/content/training-styles/<coach>/guide.md` — separate ticket, not part of this feature.
