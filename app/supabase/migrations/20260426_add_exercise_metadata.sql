-- Add exercise metadata columns for sports performance categorization.
-- Two-axis model: training_quality (force-velocity position) × muscle_group (what it works).
-- Plus movement_pattern, intensity_tier, bilateral, equipment, notes, source.

-- ===== Enums =====

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'training_quality') THEN
    CREATE TYPE public.training_quality AS ENUM (
      'max_strength',       -- heavy load, low velocity (squats, deadlifts)
      'strength_speed',     -- moderate load, moderate velocity (olympic lifts, speed squats)
      'speed_strength',     -- low load, high velocity (weighted jumps, med ball)
      'reactive',           -- bodyweight, max velocity (plyos, depth jumps, bounds)
      'skill'               -- technique practice (approach jumps, kicks, mobility)
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'muscle_group') THEN
    CREATE TYPE public.muscle_group AS ENUM (
      'quads',
      'hamstrings',
      'glutes',
      'calves',
      'hips',
      'chest',
      'back',
      'shoulders',
      'arms',
      'core',
      'full_body'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_pattern') THEN
    CREATE TYPE public.movement_pattern AS ENUM (
      'squat',
      'hinge',
      'lunge',
      'push',
      'pull',
      'olympic',
      'plyometric',
      'mobility'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intensity_tier') THEN
    CREATE TYPE public.intensity_tier AS ENUM (
      'low',     -- ankle hops, jump rope, stretches
      'medium',  -- bounds, tuck jumps, accessory lifts
      'high',    -- depth jumps, heavy compounds, olympic lifts
      'max'      -- altitude drops, 1RM attempts, single-leg depth jumps
    );
  END IF;
END $$;

-- ===== Add columns to exercises table =====

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS training_quality public.training_quality,
  ADD COLUMN IF NOT EXISTS muscle_group     public.muscle_group,
  ADD COLUMN IF NOT EXISTS movement_pattern public.movement_pattern,
  ADD COLUMN IF NOT EXISTS intensity_tier   public.intensity_tier,
  ADD COLUMN IF NOT EXISTS bilateral        boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS equipment        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes            text,
  ADD COLUMN IF NOT EXISTS source           text;

-- ===== Indexes for common queries =====
-- "Give me all reactive ankle exercises" or "all max_strength quad exercises"

CREATE INDEX IF NOT EXISTS exercises_quality_idx
  ON public.exercises (training_quality);

CREATE INDEX IF NOT EXISTS exercises_muscle_group_idx
  ON public.exercises (muscle_group);

CREATE INDEX IF NOT EXISTS exercises_quality_muscle_idx
  ON public.exercises (training_quality, muscle_group);
