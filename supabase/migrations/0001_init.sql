-- ============================================================
-- Panda · initial schema
--
-- Two clean tables, no duplication:
--   profiles          -> identity (who the user is)
--   learning_profiles -> one row per user with all progress/preferences
--
-- Run this once against your Supabase project (SQL editor or `supabase db push`).
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  username   text,
  email      text,
  avatar_url text,
  joined_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- learning_profiles (one row per user)
-- ------------------------------------------------------------
create table if not exists public.learning_profiles (
  user_id            uuid primary key references public.profiles (id) on delete cascade,
  level              int not null default 1,
  xp                 int not null default 0,
  total_xp           int not null default 0,
  completed_lessons  jsonb not null default '[]',
  completed_modules  jsonb not null default '{}',
  streak             int not null default 0,
  last_lesson        text,
  last_opened_lesson text,
  quiz_stats         jsonb not null default '{}',
  badges             jsonb not null default '{}',
  preferences        jsonb not null default '{}',
  updated_at         timestamptz not null default now()
);

alter table public.learning_profiles enable row level security;

create policy "learning_profiles: select own"
  on public.learning_profiles for select
  using (auth.uid() = user_id);

create policy "learning_profiles: update own"
  on public.learning_profiles for update
  using (auth.uid() = user_id);

create policy "learning_profiles: insert own"
  on public.learning_profiles for insert
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Auto-create both rows on signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', null)
  )
  on conflict (id) do nothing;

  insert into public.learning_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
