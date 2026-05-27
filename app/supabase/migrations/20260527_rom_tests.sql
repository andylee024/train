-- Range-of-motion (ROM) tests — third review pillar (`/movement`).
-- Schema spec: A24-306. Solo v0 mode: no auth/RLS, athlete_id stays nullable
-- (no athletes table yet — will be backfilled when multi-athlete lands).
--
-- Each row in rom_tests is one measurement event for one test type, optionally
-- sided (L/R). Logging path lives in app/sms_parser.py (deferred to A24-301).

-- ===== ROM test catalog =====
create table if not exists public.rom_test_types (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  unit text not null check (unit in ('cm', 'deg')),
  better_direction text not null check (better_direction in ('increase', 'decrease')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists rom_test_types_set_updated_at on public.rom_test_types;
create trigger rom_test_types_set_updated_at
before update on public.rom_test_types
for each row execute function public.set_updated_at();

-- ===== ROM measurements =====
create table if not exists public.rom_tests (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid,
  test_type_id uuid not null references public.rom_test_types(id) on delete restrict,
  measured_at timestamptz not null default now(),
  value numeric(6,2) not null,
  side text check (side is null or side in ('L', 'R')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rom_tests_measured_at_idx
  on public.rom_tests (measured_at desc);

create index if not exists rom_tests_test_type_idx
  on public.rom_tests (test_type_id, measured_at desc);

drop trigger if exists rom_tests_set_updated_at on public.rom_tests;
create trigger rom_tests_set_updated_at
before update on public.rom_tests
for each row execute function public.set_updated_at();

-- ===== No RLS in solo v0 mode =====
alter table public.rom_test_types disable row level security;
alter table public.rom_tests       disable row level security;

-- ===== Grants =====
grant select, insert, update, delete on table
  public.rom_test_types,
  public.rom_tests
to anon, authenticated, service_role;

-- ===== Seed canonical test types =====
-- Side baked into the type name (matches A24-306 spec). The `side` column on
-- rom_tests stays available for future schemas that consolidate.
insert into public.rom_test_types (name, unit, better_direction) values
  ('Side Split Tape',         'cm',  'increase'),
  ('Hip IR L',                'deg', 'increase'),
  ('Hip IR R',                'deg', 'increase'),
  ('Hip ER L',                'deg', 'increase'),
  ('Hip ER R',                'deg', 'increase'),
  ('Ankle DF L',              'deg', 'increase'),
  ('Ankle DF R',              'deg', 'increase'),
  ('T-Spine Rotation L',      'deg', 'increase'),
  ('T-Spine Rotation R',      'deg', 'increase')
on conflict (name) do nothing;
