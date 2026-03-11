-- Goals and milestone tracking schema

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'goal_target_type'
  ) then
    create type public.goal_target_type as enum ('e1rm', 'weight', 'reps_at_weight');
  end if;
end
$$;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  target_type public.goal_target_type not null,
  target_kg numeric(10,3) not null check (target_kg > 0),
  target_reps int check (target_reps is null or target_reps > 0),
  created_at timestamptz not null default now(),
  achieved_at timestamptz,
  check (
    (target_type = 'reps_at_weight' and target_reps is not null)
    or (target_type in ('e1rm', 'weight') and target_reps is null)
  )
);

create index if not exists goals_exercise_id_idx
  on public.goals (exercise_id, created_at desc);

create index if not exists goals_user_id_idx
  on public.goals (user_id, created_at desc);

create index if not exists goals_active_idx
  on public.goals (achieved_at)
  where achieved_at is null;

alter table public.goals disable row level security;

grant select, insert, update, delete on table public.goals
to anon, authenticated, service_role;
