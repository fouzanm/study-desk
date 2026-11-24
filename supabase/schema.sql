-- Run once in Supabase → SQL Editor.
-- One row per user: progress and quiz attempts for every course.
create table if not exists public.study_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  progress   jsonb not null default '{}'::jsonb,
  quizzes    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_state enable row level security;

-- Each signed-in user can only see and change their own row.
drop policy if exists "read own"   on public.study_state;
drop policy if exists "insert own" on public.study_state;
drop policy if exists "update own" on public.study_state;

create policy "read own"   on public.study_state for select using (auth.uid() = user_id);
create policy "insert own" on public.study_state for insert with check (auth.uid() = user_id);
create policy "update own" on public.study_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
