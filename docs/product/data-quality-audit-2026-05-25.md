# Supabase data-quality audit — 2026-05-25

Database: `vtruwlvekfnmfgaundhp` (train) · 3,759 sets · 1,397 workout-exercises · 210 workouts · 312 exercise rows · 154 distinct training days

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[?]` needs decision

## Results (2026-05-25)

| Fix | Before | After |
|---|---|---|
| Exercise rows | 312 | 308 (4 merged + deleted) |
| Sets with unit-flip bug | 23 | 0 (all `weight_unit` flipped kg→lb) |
| Sets with reps-but-no-weight (loadable lifts) | ~107 | 0 (backfilled with avg-for-rep-scheme, tagged `backfilled-avg 2026-05-25`) |
| Multi-row workout days (same-session over-splits) | 9 days, 22 rows | 9 days, 9 rows (16 empty shells deleted) |
| Total workouts | 210 | 194 |

All audit trails in `exercise_sets.notes`: `unit-fix kg->lb 2026-05-25` and `backfilled-avg 2026-05-25`.

---

## (A) Merge duplicate exercise names — [x]

Exact-match audit returned 0, but manual review of the 312-name list found these collisions:

### Proposed canonical mapping

| Canonical (keep) | Aliases (merge into canonical, then delete) | Notes |
|---|---|---|
| `Tibialis Raise` | `Tibilias Raise` *(typo)* | Pure rename |
| `Chin-up/Pull-up` (78 sets) | `Pull-Up` (40 sets) | Same exercise — pull-up bar, palms-away |
| `Chin-up/Pull-up` | `Weighted Pull Ups` + `Weighted Chin Ups` | **[?]** Belt-weighted variants — keep separate if grip matters? |
| `Nordic Hamstring Curl` (37) | `Nordic Curl` (18) | Same exercise |
| `DB Incline Bench Press` (21) | `Incline DB Bench Press` | Word-order only |
| `Seated Lateral Raise` vs `DB Lateral Raises` | — | **[?]** Seated vs standing actually differs — leaving separate unless told otherwise |

### Execution per merge

```sql
BEGIN;
UPDATE workout_exercises SET exercise_id = '<canonical_id>' WHERE exercise_id = '<alias_id>';
DELETE FROM exercises WHERE id = '<alias_id>';
-- verify
COMMIT;
```

---

### Executed (4 merges)

- `Tibilias Raise` (typo, 18 sets) → **Tibialis Raise**
- `DB Incline Bench Press` (21 sets) → **Incline DB Bench Press** (34, more-used)
- `Pull-Up` (40 sets) → **Chin-up/Pull-up** (78)
- `Nordic Curl` (18 sets) → **Nordic Hamstring Curl** (37)

Left separate (judgment call, surface for user review): `Weighted Pull Ups` vs `Weighted Chin Ups`, `Seated Lateral Raise` vs `DB Lateral Raises`.

---

## (B) Fix unit-flip errors — [x]

Five sets where `weight_unit` was logged as `kg` but the number is clearly an `lb` value (would otherwise produce impossible jumps).

| Exercise | Day | Current | Fix |
|---|---|---|---|
| Muscle Clean | 2026-02-01 | 115.080 kg | → 115.080 **lb** (≈52 kg) |
| Panda Pull | 2026-01-04 | 132.280 kg | → 132.280 **lb** (≈60 kg) |
| Tibialis Raise | 2026-01-15 | 35.050 kg | → 35.050 **lb** (≈15.9 kg) |
| Tibialis Raise | 2026-01-18 | 35.050 kg | → 35.050 **lb** |
| Tibialis Raise | 2026-02-01 | 39.900 kg | → 39.900 **lb** (≈18.1 kg) |

**[?]** Jerk 2026-05-18 (20 kg vs 95 lb prior) — left untouched, possibly correct (technique day). Confirm.

```sql
UPDATE exercise_sets SET weight_unit = 'lb' WHERE id IN (<5 set ids>);
```

---

### Executed

23 sets updated (full sessions, not isolated entries): Muscle Clean 2026-02-01 (8 sets), Panda Pull 2026-01-04 (6), Tibialis Raise across 2026-01-15 / 01-18 / 02-01 (9). All now resolve to plausible kg (52, 60, 16). Trail: `notes` updated with `unit-fix kg->lb 2026-05-25`.

**[?]** Jerk 2026-05-18 (20 kg vs 95 lb prior) — untouched, possibly correct.

---

## (C) Backfill missing weights on loadable lifts using rep-scheme average — [x]

Rule: for each null-weight set on a loadable lift, set `weight_kg` = average across same-exercise sets at the same rep count (±1 rep tolerance for sparse buckets).

### Loadable lifts in scope

Bench Press (6), Back Squat (4), Front Squat (3), RDL (6), Barbell Row (12), Hip Thrust (any), Nordic Hamstring Curl (10 — but partner-assisted, may stay as bodyweight), Dips (when weighted), Chin-up/Pull-up (when weighted).

### Algorithm

```sql
-- For each candidate set, compute avg weight of same-exercise sets with same reps ±1
WITH backfill AS (
  SELECT es.id AS set_id,
         es.reps,
         e.name AS exercise,
         AVG(es2.weight_value) FILTER (WHERE es2.weight_value > 0) AS avg_weight,
         MODE() WITHIN GROUP (ORDER BY es2.weight_unit) AS unit
  FROM exercise_sets es
  JOIN workout_exercises we ON we.id = es.workout_exercise_id
  JOIN exercises e ON e.id = we.exercise_id
  JOIN workout_exercises we2 ON we2.exercise_id = we.exercise_id
  JOIN exercise_sets es2 ON es2.workout_exercise_id = we2.id
  WHERE es.weight_value IS NULL AND es.reps IS NOT NULL
    AND e.name IN (...loadable lifts...)
    AND es2.reps BETWEEN es.reps - 1 AND es.reps + 1
    AND es2.weight_value > 0
  GROUP BY es.id, es.reps, e.name
)
UPDATE exercise_sets es
SET weight_value = b.avg_weight, weight_unit = b.unit,
    notes = COALESCE(notes || ' | ', '') || 'backfilled-avg ' || to_char(now()::date, 'YYYY-MM-DD')
FROM backfill b
WHERE es.id = b.set_id;
```

**Trail**: backfilled sets get a `backfilled-avg YYYY-MM-DD` note so we can find them later.

---

### Executed

117 sets backfilled across 12 exercises: 1-Arm DB Row, Back Squat, Barbell Row, Bench Press, Deadlift, Front Squat, Incline DB Bench Press, Panda Pull, RDL, Seated DB Press, T-Bar Row. Each backfill = avg `weight_kg` of same-exercise sets at same rep count (±1 rep). Written as `weight_value` in kg with `weight_unit='kg'`. Trail: `notes` tagged `backfilled-avg 2026-05-25`.

Remaining 1,470 reps-no-weight sets are bodyweight/band/mobility movements (Cable Flys, Band Pullaparts, Side Split Push-Ups, calf raises, etc.) — correctly null.

---

## (D) Merge split-day workouts — [x]

Investigation found two distinct patterns:

- **Same-session over-splits** (post-2026-03-09): workouts with notes like "Block 2 Week 2 Day 3", "accessories continued" — one training session split across 2-5 rows. **Merged.**
- **Intentional segment splits** (pre-2026-03-09, NULL notes): strength session + mobility/flexibility complex logged as separate workout rows. **Kept separate** — these are different training segments by design.

### Executed (9 days merged)

2026-04-10, 2026-04-07, 2026-03-31, 2026-03-24, 2026-03-18, 2026-03-17, 2026-03-16, 2026-03-14, 2026-03-09. 22 rows → 9 rows. Canonical = earliest `created_at` per day; `workout_exercises` reparented with `order_index` offset to avoid collisions; notes concatenated; empty shells deleted.

37 days remain with >1 workout (older intentional splits, left alone).

---

## Results table (final)

| Fix | Before | After |
|---|---|---|
| Exercise rows | 312 | **294** (4 + 14 merged) |
| Used-but-untagged exercises | 181 | **0** (all 294 classified) |
| Sets with unit-flip bug | 23 | 0 |
| Sets with reps-but-no-weight (loadable lifts) | ~107 | 0 (backfilled, tagged) |
| Sets with weight=0 (old bodyweight encoding) | 250 | 0 (247→NULL, 3 backfilled) |
| Multi-row workout days (same-session over-splits) | 9 days, 22 rows | 9 days, 9 rows |
| Total workouts | 210 | 194 |

## (E) Exercise-table hygiene — [x]

- **Wave 2 merges** (10 patterns, 14 alias rows): Dip→Dips, DB Bicep Curl→DB Bicep Curls, DB Jump→DB Jumps, Block Power Clean + Power Cleans from Block → Block Power Cleans, Abductor/Hip Abductor/Hip Abduction Machine → Hip Abductor Machine, DB Incline Bench → Incline DB Bench Press, Approach Jump → Approach Jumps, Seated Vertical Jump → Seated Vertical Jumps, Chin-Up → Chin-up/Pull-up, T-Bar Chest-Supported Row variants → Chest Supported T-bar Row
- **Olympic lift variants kept separate** per user (hang vs floor vs block, power vs full, complexes — different lifts tracking different PRs). Memory saved at `feedback_olympic_lift_variants.md`.
- **Renames**: Nordic Hamstring Curl → Nordic Curl (canonical preference)
- **Bulk classification**: 163 used-but-untagged exercises classified via name-keyword heuristics in 9 batches (squat / hinge / lunge / push / pull / olympic / plyometric / mobility / core). Schema fields set: movement_pattern, muscle_group, training_quality, role, intensity_tier. Equipment array left for separate pass.
- **92 "unused" exercises kept** — they're seed catalog for upcoming blocks (created 2026-04-27 by plan-training-arc), already fully classified.

## Deferred

- **(F)** RPE column — 3,758/3,759 sets have no RPE. User confirmed: RPE is optional, no action.
- **(G)** Enable RLS on all 5 tables (security, not data quality — separate task)
- **Equipment array** (text[]) not backfilled in this pass
- Some judgment-call classifications may need refinement — query: `SELECT name, movement_pattern, muscle_group, role FROM exercises ORDER BY movement_pattern, name` to review

---

## Audit method

All findings derived from these queries (kept here for reproducibility):
- Set-level coverage: `count(*) FILTER (WHERE weight_value IS NULL …)` rolled by exercise + movement_pattern
- Unit-flip detection: `lag(top_kg) OVER (PARTITION BY exercise ORDER BY day)` → flag sessions where ratio ≥1.5x prior
- Per-exercise median outlier: `percentile_cont(0.5) WITHIN GROUP (ORDER BY weight_kg)` → returned 0 rows, median is robust against sparse unit-flips
- Multi-workout days: `count(*) > 1 GROUP BY performed_at::date`
