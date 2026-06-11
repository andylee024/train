-- TR-348 — Coach content layer: coaches + documents tables + Storage bucket.
--
-- Replaces the file-based docs/content/training-styles/<coach>/ approach
-- with a Supabase-backed pipeline owned by the deep-research-on-coach skill.
--
-- Storage boundary update: researched coach content (multi-source: YT auto-
-- captions, Scribd PDFs, web articles, Substack posts) lives here. The
-- downstream synth-style-guide consumer reads from these tables; it does
-- NOT discover content itself.
--
-- No RLS in solo v0 mode; matches existing daily_metrics + train_core_schema
-- pattern. Revisit when multi-user lands.

-- ===== Enums =====
do $$ begin
  create type public.source_type as enum (
    'yt_video',
    'scribd_doc',
    'web_article',
    'substack_post',
    'podcast_episode'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_status as enum (
    'pending_approval',
    'approved',
    'rejected',
    'extracted',
    'failed'
  );
exception when duplicate_object then null; end $$;

-- ===== Coaches =====
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  avatar_url text,
  description text,
  -- Canonical URLs by platform — populated when known, used to bias confidence
  -- scoring in the discover stage. Shape: { youtube?: string, instagram?: string,
  -- substack?: string, ... }.
  canonical_urls jsonb not null default '{}'::jsonb,
  -- Signals (subscriber counts, follower counts, last refresh times) — refreshed
  -- in the approve stage. Shape: { youtube?: { subs: int, refreshed_at: iso },
  -- instagram?: { followers: int, refreshed_at: iso }, ... }.
  signals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists coaches_set_updated_at on public.coaches;
create trigger coaches_set_updated_at
before update on public.coaches
for each row execute function public.set_updated_at();

-- ===== Documents =====
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  source_type public.source_type not null,
  url text not null,
  title text,
  snippet text,
  status public.document_status not null default 'pending_approval',
  -- Extracted plain text. Set by the relevant extractor stage; null until
  -- status transitions to 'extracted'.
  content_text text,
  -- Raw search-result metadata for traceability. Shape varies by source.
  raw_metadata jsonb not null default '{}'::jsonb,
  -- Path within the coach-content Storage bucket for binaries (PDFs, audio).
  -- Null for text-native docs.
  storage_path text,
  char_count int,
  language text,
  schema_version smallint not null default 1,
  extracted_at timestamptz,
  last_attempt_at timestamptz,
  last_attempt_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_id, url)
);

create index if not exists documents_coach_status_idx
  on public.documents (coach_id, status);

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- ===== No RLS in solo v0 mode =====
alter table public.coaches disable row level security;
alter table public.documents disable row level security;

-- ===== Grants =====
grant select, insert, update, delete on table
  public.coaches,
  public.documents
to anon, authenticated, service_role;

grant usage on type
  public.source_type,
  public.document_status
to anon, authenticated, service_role;

-- ===== Storage bucket =====
-- The coach-content bucket is created out-of-band via Supabase MCP (the SDK
-- doesn't support bucket creation in plain SQL). See deep-research-on-coach
-- SKILL.md §Storage for the canonical call.
