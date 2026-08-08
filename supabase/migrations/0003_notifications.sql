-- ============================================================
-- Panda · notifications
--
--   notifications -> one row per event a user cares about
--
-- `reference` is a stable dedupe key (e.g. "achievement:first-lesson").
-- The unique (user_id, reference) constraint guarantees a given event
-- can never be notified twice, even across devices.
-- ============================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null check (type in ('achievement', 'lesson', 'module', 'streak', 'system')),
  title      text not null,
  message    text not null default '',
  reference  text not null,
  read       boolean not null default false,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, reference)
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications: select own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications: insert own"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "notifications: update own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications: delete own"
  on public.notifications for delete
  using (auth.uid() = user_id);
