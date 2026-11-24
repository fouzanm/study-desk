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

create policy "read own"   on public.study_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own" on public.study_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own" on public.study_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------
-- Admin panel + activity log (added later)
-- ---------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;  -- no policies: API can't read it

create table if not exists public.activity (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references auth.users (id) on delete cascade,
  type      text not null check (type in ('visit','join','leave','day_done','day_undone','quiz')),
  course_id text,
  meta      jsonb not null default '{}'::jsonb,
  at        timestamptz not null default now()
);
create index if not exists activity_at_idx on public.activity (at desc);
create index if not exists activity_user_idx on public.activity (user_id);
alter table public.activity enable row level security;
create policy "insert own activity" on public.activity for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- is_admin() and admin_overview(days) are security-definer functions that
-- check admin membership first. See the migration in the Supabase dashboard.
-- To make someone an admin:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
