alter table public.centers
  add column if not exists business_id text,
  add column if not exists contact_person text,
  add column if not exists country_code text;
