-- TR-355 / 356 / 357 / 358 — pre-seed the 4 dogfood coaches.
--
-- Run this once after `app/supabase/migrations/20260609000000_coach_content.sql`
-- has been applied. Each row sets `canonical_urls.youtube` so the discover
-- stage biases toward that channel. Display names + descriptions are
-- placeholders; the operator can edit later.
--
-- Idempotent via the `slug` unique constraint + `on conflict (slug) do nothing`.

insert into public.coaches (slug, display_name, description, canonical_urls)
values
  (
    'catalyst-athletics',
    'Catalyst Athletics',
    'Olympic weightlifting program founded by Greg Everett.',
    '{"youtube":"https://www.youtube.com/@CatalystAthletics","website":"https://www.catalystathletics.com"}'::jsonb
  ),
  (
    'nippard',
    'Jeff Nippard',
    'Science-based hypertrophy + strength training; natural bodybuilder with biochem background.',
    '{"youtube":"https://www.youtube.com/@JeffNippard","website":"https://jeffnippard.com"}'::jsonb
  ),
  (
    'israetel',
    'Mike Israetel',
    'Renaissance Periodization co-founder; hypertrophy volume landmarks (MEV/MAV/MRV).',
    '{"youtube":"https://www.youtube.com/@RenaissancePeriodization","website":"https://rpstrength.com"}'::jsonb
  ),
  (
    'dylan-shannon',
    'Dylan Shannon',
    'POWERJACKED 6-day hybrid system — power, physique, athleticism.',
    '{"youtube":"https://www.youtube.com/@dylan_shannon"}'::jsonb
  )
on conflict (slug) do nothing;
