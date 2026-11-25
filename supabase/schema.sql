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

-- Admin functions. They run with owner rights but check admin membership
-- first, so normal users get "not authorized".
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

create or replace function public.admin_overview(days integer default 60)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'generated_at', now(),
    'users', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', u.id, 'email', u.email,
        'name', coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
        'provider', u.raw_app_meta_data->>'provider',
        'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at,
        'progress', s.progress, 'quizzes', s.quizzes, 'updated_at', s.updated_at,
        'last_activity', (select max(a.at) from public.activity a where a.user_id = u.id)
      ) order by u.created_at desc), '[]'::jsonb)
      from auth.users u left join public.study_state s on s.user_id = u.id
    ),
    'activity', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', a.user_id, 'type', a.type, 'course_id', a.course_id, 'meta', a.meta, 'at', a.at
      ) order by a.at desc), '[]'::jsonb)
      from (select * from public.activity
            where at > now() - make_interval(days => greatest(1, least(days, 365)))
            order by at desc limit 5000) a
    )
  );
end;
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.admin_overview(integer) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_overview(integer) to authenticated;

-- To make someone an admin:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
