#!/usr/bin/env bash
# TR-344 — First production run: Catalyst Athletics end-to-end.
# Requires ANTHROPIC_API_KEY in env or .env.
#
# Runs all 6 pipeline stages on Catalyst Athletics, defaults to 30 most-recent
# videos. Review gate prints to stdout between synth and land — you must
# manually invoke `land.py --approve` after reviewing.
#
# Cost estimate (claude-opus-4-7, 30 videos):
#   - Extract: ~30 calls × ~$0.20-0.30/video  ≈  $6-9
#   - Synth:   2 calls × ~$1/call             ≈  $2
#   - Total:   ~$10-12 per full run
#
# Usage:
#   bash .claude/skills/ingest-coach/run_catalyst.sh           # full pipeline through review
#   COACH_SLUG=catalyst-athletics-v2 bash .../run_catalyst.sh  # land alongside the existing hand-written one
#   LIMIT=10 bash .../run_catalyst.sh                          # smaller budget, just for testing
set -euo pipefail

COACH_SLUG="${COACH_SLUG:-catalyst-athletics-v2}"
CHANNEL_URL="${CHANNEL_URL:-https://www.youtube.com/@catalystathletics/videos}"
LIMIT="${LIMIT:-30}"

cd "$(git rev-parse --show-toplevel)"

echo "==> Stage 1: discover"
python3 .claude/skills/ingest-coach/discover.py \
    --coach "$COACH_SLUG" \
    --channel "$CHANNEL_URL" \
    --limit "$LIMIT"
echo

echo "==> Stage 2: fetch"
python3 .claude/skills/ingest-coach/fetch.py --coach "$COACH_SLUG" --limit "$LIMIT"
echo

echo "==> Stage 3: extract  (this is where the API spend happens)"
python3 .claude/skills/ingest-coach/extract.py --coach "$COACH_SLUG"
echo

echo "==> Stage 4: synthesize  (two Claude calls — guide.md + exercise-selection.md)"
python3 .claude/skills/ingest-coach/synthesize.py --coach "$COACH_SLUG"
echo

echo "==> Stage 5: review  (read the diff carefully)"
python3 .claude/skills/ingest-coach/review.py --coach "$COACH_SLUG" --citations
echo
echo "==> Pipeline halted at the review gate."
echo "    If the draft looks good, run:"
echo "      python3 .claude/skills/ingest-coach/land.py --coach $COACH_SLUG --approve"
echo "    If the draft needs work, edit prompts/synthesize_*.md and re-run:"
echo "      python3 .claude/skills/ingest-coach/synthesize.py --coach $COACH_SLUG"
echo "      python3 .claude/skills/ingest-coach/review.py --coach $COACH_SLUG"
