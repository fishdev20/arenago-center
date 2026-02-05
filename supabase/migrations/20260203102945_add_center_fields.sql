create table if not exists public.center_fields (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null,
  sport_id uuid not null references public.sports(id) on delete restrict,
  area text not null default 'Outdoor', -- Outdoor | Indoor
  status text not null default 'active', -- active | maintenance
  location_note text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.center_fields enable row level security;

-- RLS: center can CRUD own fields
create policy "CenterFields: center manage own"
on public.center_fields
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_fields.center_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_fields.center_id
  )
);

-- Admin manage
create policy "CenterFields: admin manage all"
on public.center_fields
for all
using (public.is_admin())
with check (public.is_admin());
