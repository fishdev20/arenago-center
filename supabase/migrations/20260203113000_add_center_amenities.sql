create table if not exists public.center_amenities (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists center_amenities_center_slug_unique
  on public.center_amenities (center_id, lower(slug));

alter table public.center_amenities enable row level security;

create trigger center_amenities_set_updated_at
before update on public.center_amenities
for each row
execute procedure public.set_updated_at();

create policy "CenterAmenities: center manage own"
on public.center_amenities
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_amenities.center_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_amenities.center_id
  )
);

create policy "CenterAmenities: admin manage all"
on public.center_amenities
for all
using (public.is_admin())
with check (public.is_admin());
