create table if not exists public.center_price_rules (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null,
  enabled boolean not null default true,
  applies_to_all boolean not null default true,
  applies_field_ids uuid[] not null default '{}',
  day_scope text not null default 'Daily',
  time_start time not null default '00:00',
  time_end time not null default '23:59',
  price_per_hour numeric(10,2) not null default 0,
  priority integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint center_price_rules_day_scope_check
    check (day_scope in ('Daily', 'Weekdays', 'Weekend', 'Specific dates'))
);

create table if not exists public.center_weekly_availability (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  day_of_week smallint not null check (day_of_week >= 0 and day_of_week <= 6),
  is_open boolean not null default false,
  slots jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(center_id, day_of_week)
);

create table if not exists public.center_availability_overrides (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  scope text not null default 'center',
  field_id uuid references public.center_fields(id) on delete set null,
  status text not null default 'BLOCK',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint center_availability_overrides_scope_check
    check (scope in ('center', 'field')),
  constraint center_availability_overrides_status_check
    check (status in ('BLOCK', 'OPEN')),
  constraint center_availability_overrides_time_check
    check (ends_at > starts_at)
);

alter table public.center_price_rules enable row level security;
alter table public.center_weekly_availability enable row level security;
alter table public.center_availability_overrides enable row level security;

create policy "Pricing rules: center can manage own"
on public.center_price_rules
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_price_rules.center_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_price_rules.center_id
  )
);

create policy "Weekly availability: center can manage own"
on public.center_weekly_availability
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_weekly_availability.center_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_weekly_availability.center_id
  )
);

create policy "Availability overrides: center can manage own"
on public.center_availability_overrides
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_availability_overrides.center_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'center'
      and p.center_id = center_availability_overrides.center_id
  )
);

