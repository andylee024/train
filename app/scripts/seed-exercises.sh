#!/bin/bash
# Seed the Supabase exercises table with the unified exercise library.
# Run from the repo root: ./app/scripts/seed-exercises.sh
#
# Reads app/supabase/seeds/exercises.csv and inserts each row via the
# Supabase REST API. Uses Prefer: resolution=ignore-duplicates so it's
# safe to run multiple times.

set -euo pipefail

SEED_FILE="app/supabase/seeds/exercises.csv"

# Load env
source .env

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ANON_KEY:-}" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env"
  exit 1
fi

API="${SUPABASE_URL}/rest/v1/exercises"
HEADERS=(
  -H "apikey: ${SUPABASE_ANON_KEY}"
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"
  -H "Content-Type: application/json"
  -H "Prefer: resolution=ignore-duplicates"
)

# Read seed file (skip header), build JSON array
EXERCISES=$(tail -n +2 "$SEED_FILE" | while IFS= read -r line; do
  # Remove surrounding quotes if present
  name=$(echo "$line" | sed 's/^"//;s/"$//')
  echo "{\"name\": \"$name\"}"
done | paste -sd ',' -)

BODY="[${EXERCISES}]"

echo "Inserting $(tail -n +2 "$SEED_FILE" | wc -l | tr -d ' ') exercises into Supabase..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API" "${HEADERS[@]}" -d "$BODY")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY_RESPONSE=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Success! Exercises seeded."
else
  echo "❌ Error (HTTP $HTTP_CODE):"
  echo "$BODY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$BODY_RESPONSE"
fi

# Verify count
echo ""
echo "Verifying exercise count..."
curl -s "${API}?select=id" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Prefer: count=exact" \
  -H "Range-Unit: items" \
  -H "Range: 0-0" \
  -w "\n%{http_code}" | head -1 > /dev/null
echo "Exercises in Supabase: check the Range header for total count"
