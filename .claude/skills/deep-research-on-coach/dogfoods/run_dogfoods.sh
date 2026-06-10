#!/usr/bin/env bash
# TR-355 + TR-356 + TR-357 + TR-358 — run the full pipeline against the
# 4 dogfood coaches end-to-end.
#
# Prereqs:
#   1. Migration `20260609000000_coach_content.sql` applied to Supabase
#      (operator action — see PR description)
#   2. `coach-content` Storage bucket created on Supabase (operator action)
#   3. seed_coaches.sql run to pre-seed the 4 coach rows
#   4. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set in env
#
# Defaults to non-interactive (auto-approve canonical-channel hits only).
# Pass `--interactive` as first arg to opt into per-row a/r/s prompts.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

INTERACTIVE="${1:-}"
RUN="python3 .claude/skills/deep-research-on-coach/run.py"
LIMIT_FLAG=""
[ -n "${MAX_COST:-}" ] && LIMIT_FLAG="--max-discovery-cost ${MAX_COST}"

COACHES=(catalyst-athletics nippard israetel dylan-shannon)

echo "════════════════════════════════════════════════════════════════════"
echo "  deep-research-on-coach — dogfood run"
echo "  coaches: ${COACHES[*]}"
echo "  cost cap: ${MAX_COST:-15} USD per coach"
echo "════════════════════════════════════════════════════════════════════"
echo

if [ -z "${SUPABASE_URL:-}" ] || { [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ] && [ -z "${SUPABASE_KEY:-}" ]; }; then
  echo "❌ SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) must be set."
  echo "   Add them to your shell env or .env and re-run."
  exit 1
fi

for slug in "${COACHES[@]}"; do
  echo
  echo "────────────────────────────────────────────────────────────────────"
  echo "  Coach: $slug"
  echo "────────────────────────────────────────────────────────────────────"
  $RUN --slug "$slug" $LIMIT_FLAG
  echo
done

echo
echo "════════════════════════════════════════════════════════════════════"
echo "  Dogfood complete."
echo "  Verify: query 'select coach.slug, doc.status, count(*)"
echo "          from public.documents doc join public.coaches coach"
echo "          on coach.id = doc.coach_id group by 1, 2 order by 1, 2;'"
echo "════════════════════════════════════════════════════════════════════"
