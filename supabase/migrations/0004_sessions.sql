-- Feature 7: sessions (one row per completed run of a workout).
-- A session belongs to one runner and one workout (a one-to-many link from workouts).

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  run_date date not null,
  reps_completed integer not null check (reps_completed > 0),
  -- Effort 1 (easy) to 5 (all out). Empty is allowed for imported history I never rated.
  effort integer check (effort is null or effort between 1 and 5),
  hardest_part text check (
    hardest_part is null
    or hardest_part in ('breathing', 'legs', 'mental', 'stitch or stomach', 'pace too fast', 'nothing')
  ),
  notes text,
  created_at timestamptz not null default now()
);

create index sessions_user_date_idx on public.sessions (user_id, run_date desc);
create index sessions_workout_id_idx on public.sessions (workout_id);

-- Row-level security: each runner can only see and change their own sessions.
alter table public.sessions enable row level security;

create policy "Runners can read their own sessions"
  on public.sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- A runner can log sessions only against their own workouts.
create policy "Runners can log their own sessions"
  on public.sessions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  );

create policy "Runners can edit their own sessions"
  on public.sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Runners can delete their own sessions"
  on public.sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
