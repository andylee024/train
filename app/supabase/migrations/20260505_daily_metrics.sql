-- Daily metrics (bodyweight) for solo v0 mode.
-- Schema lives in docs/product/database-schema.md §Body Metrics.
-- v0 columns: bodyweight only. sleep_hours / readiness_score / injury_log added later.

-- ===== Daily metrics =====
create table if not exists public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  bodyweight_lb numeric(5,2) check (bodyweight_lb is null or bodyweight_lb between 50 and 500),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_metrics_date_idx
  on public.daily_metrics (date desc);

drop trigger if exists daily_metrics_set_updated_at on public.daily_metrics;
create trigger daily_metrics_set_updated_at
before update on public.daily_metrics
for each row execute function public.set_updated_at();

-- ===== No RLS in solo v0 mode =====
alter table public.daily_metrics disable row level security;

-- ===== Grants =====
grant select, insert, update, delete on table
  public.daily_metrics
to anon, authenticated, service_role;
