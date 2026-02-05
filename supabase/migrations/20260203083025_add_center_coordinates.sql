create table if not exists public.center_coordinates (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null,
  longitude double precision not null,
  source text default 'nominatim',
  created_at timestamptz not null default now()
);

alter table public.center_coordinates enable row level security;

alter table public.centers
  add column if not exists coordinates_id uuid references public.center_coordinates(id) on delete set null;

-- Policies for center_coordinates
-- Admins can manage all
create policy "CenterCoordinates: admin manage all"
on public.center_coordinates
for all
using (public.is_admin())
with check (public.is_admin());

-- Center can read their linked coordinates
create policy "CenterCoordinates: center read linked"
on public.center_coordinates
for select
using (
  exists (
    select 1
    from public.profiles p
    join public.centers c on c.id = p.center_id
    where p.id = auth.uid()
      and p.role = 'center'
      and c.coordinates_id = center_coordinates.id
  )
);
