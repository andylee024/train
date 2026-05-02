-- Training core schema (Supabase/Postgres) in public schema
-- No auth / no RLS solo v0 mode.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ===== Enums =====
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'load_unit'
  ) then
    create type public.load_unit as enum ('kg', 'lb', 'bw');
  end if;
end
$$;

-- ===== Utility trigger =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== Exercise catalog =====
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists exercises_set_updated_at on public.exercises;
create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

-- ===== Workout sessions =====
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  performed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_performed_at_idx
  on public.workouts (performed_at desc);

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

-- ===== Exercises performed inside a workout =====
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index int not null check (order_index > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_id, order_index)
);

create index if not exists workout_exercises_workout_idx
  on public.workout_exercises (workout_id, order_index);

create index if not exists workout_exercises_exercise_idx
  on public.workout_exercises (exercise_id);

drop trigger if exists workout_exercises_set_updated_at on public.workout_exercises;
create trigger workout_exercises_set_updated_at
before update on public.workout_exercises
for each row execute function public.set_updated_at();

-- ===== Atomic set logging =====
create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_index int not null check (set_index > 0),
  reps int check (reps is null or reps > 0),
  duration_seconds int check (duration_seconds is null or duration_seconds > 0),
  weight_value numeric(10,3) check (weight_value is null or weight_value >= 0),
  weight_unit public.load_unit,
  weight_kg numeric(10,3)
    generated always as (
      case
        when weight_unit = 'kg' and weight_value is not null then weight_value
        when weight_unit = 'lb' and weight_value is not null then round(weight_value * 0.45359237, 3)
        else null
      end
    ) stored,
  rpe numeric(3,1) check (rpe is null or rpe between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_exercise_id, set_index),
  check (
    reps is not null
    or duration_seconds is not null
  ),
  check (
    (weight_unit in ('kg', 'lb') and weight_value is not null)
    or (weight_unit = 'bw' and weight_value is null)
    or (weight_unit is null and weight_value is null)
  )
);

create index if not exists exercise_sets_workout_exercise_idx
  on public.exercise_sets (workout_exercise_id, set_index);

create index if not exists exercise_sets_weight_kg_idx
  on public.exercise_sets (weight_kg desc)
  where weight_kg is not null;

drop trigger if exists exercise_sets_set_updated_at on public.exercise_sets;
create trigger exercise_sets_set_updated_at
before update on public.exercise_sets
for each row execute function public.set_updated_at();

-- ===== No RLS in solo v0 mode =====
alter table public.exercises disable row level security;
alter table public.workouts disable row level security;
alter table public.workout_exercises disable row level security;
alter table public.exercise_sets disable row level security;

-- ===== Grants =====
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table
  public.exercises,
  public.workouts,
  public.workout_exercises,
  public.exercise_sets
to anon, authenticated, service_role;
