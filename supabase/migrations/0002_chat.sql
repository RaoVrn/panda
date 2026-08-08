-- ============================================================
-- Panda · chat schema
--
--   chat_sessions     -> one row per Panda AI conversation
--   chat_messages     -> messages within a session
--   message_feedback  -> like/dislike ratings on assistant replies
--
-- RLS keeps every row scoped to the signed-in user.
-- ============================================================

-- ------------------------------------------------------------
-- chat_sessions
-- ------------------------------------------------------------
create table if not exists public.chat_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null default 'Untitled chat',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  last_message text,
  pinned       boolean not null default false,
  archived     boolean not null default false,
  metadata     jsonb not null default '{}'::jsonb
);

create index if not exists chat_sessions_user_updated_idx
  on public.chat_sessions (user_id, updated_at desc);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions: select own"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "chat_sessions: insert own"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "chat_sessions: update own"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

create policy "chat_sessions: delete own"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- chat_messages
-- ------------------------------------------------------------
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null default '',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_created_idx
  on public.chat_messages (session_id, created_at);

alter table public.chat_messages enable row level security;

create policy "chat_messages: select own"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "chat_messages: insert own"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "chat_messages: delete own"
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- message_feedback
-- ------------------------------------------------------------
create table if not exists public.message_feedback (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  rating     text not null check (rating in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (message_id, user_id)
);

alter table public.message_feedback enable row level security;

create policy "message_feedback: select own"
  on public.message_feedback for select
  using (auth.uid() = user_id);

create policy "message_feedback: insert own"
  on public.message_feedback for insert
  with check (auth.uid() = user_id);

create policy "message_feedback: update own"
  on public.message_feedback for update
  using (auth.uid() = user_id);

create policy "message_feedback: delete own"
  on public.message_feedback for delete
  using (auth.uid() = user_id);
