create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_user_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_user_id, read_at)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "Notifications: read own" on public.notifications;
create policy "Notifications: read own"
on public.notifications
for select
using (auth.uid() = recipient_user_id);

drop policy if exists "Notifications: update own" on public.notifications;
create policy "Notifications: update own"
on public.notifications
for update
using (auth.uid() = recipient_user_id)
with check (auth.uid() = recipient_user_id);
