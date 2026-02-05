-- Sports master list
create table if not exists public.sports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists sports_name_unique on public.sports (lower(name));
create unique index if not exists sports_slug_unique on public.sports (lower(slug));

alter table public.sports enable row level security;

-- Center ↔ sports link
create table if not exists public.center_sports (
  center_id uuid not null references public.centers(id) on delete cascade,
  sport_id uuid not null references public.sports(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (center_id, sport_id)
);

alter table public.center_sports enable row level security;

-- Sport requests (centers can request new sports)
create table if not exists public.sport_requests (
  id uuid primary key default gen_random_uuid(),
  requested_name text not null,
  requested_slug text not null,
  requested_by uuid references auth.users(id) on delete set null,
  center_id uuid references public.centers(id) on delete set null,
  status text not null default 'pending', -- pending | approved | rejected
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.sport_requests enable row level security;

-- RLS policies
-- sports: public read active
create policy "Sports: public read active"
on public.sports
for select
using (active = true);

-- sports: admin manage
create policy "Sports: admin manage all"
on public.sports
for all
using (public.is_admin())
with check (public.is_admin());

-- center_sports: center can read/write own
create policy "CenterSports: center read own"
on public.center_sports
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_sports.center_id
  )
);

create policy "CenterSports: center manage own"
on public.center_sports
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_sports.center_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_sports.center_id
  )
);

-- sport_requests: center can create and read own
create policy "SportRequests: center create"
on public.sport_requests
for insert
with check (
  requested_by = auth.uid()
);

create policy "SportRequests: center read own"
on public.sport_requests
for select
using (
  requested_by = auth.uid()
);

-- sport_requests: admin manage
create policy "SportRequests: admin manage"
on public.sport_requests
for all
using (public.is_admin())
with check (public.is_admin());
