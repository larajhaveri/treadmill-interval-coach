-- Feature 5: stars.
-- A junction table: one row means "this user starred this workout".
-- The primary key is the pair (user_id, workout_id), so a workout can be starred only once per user.

create table public.stars (
  user_id uuid not null references public.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  primary key (user_id, workout_id)
);

-- Finding "which stars does this workout have" (and cleaning up on delete) uses workout_id.
create index stars_workout_id_idx on public.stars (workout_id);

-- Row-level security: deny by default, then allow each runner to touch only their own stars.
alter table public.stars enable row level security;

create policy "Runners can read their own stars"
  on public.stars for select
  using ((select auth.uid()) = user_id);

-- A runner can star only their own workouts.
create policy "Runners can star their own workouts"
  on public.stars for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = (select auth.uid())
    )
  );

create policy "Runners can remove their own stars"
  on public.stars for delete
  using ((select auth.uid()) = user_id);
