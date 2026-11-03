-- Feature 2: the workouts table (the main item).
-- One row per saved interval workout, owned by one user.

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  warmup_min numeric check (warmup_min is null or warmup_min >= 0),
  warmup_speed_kmh numeric check (warmup_speed_kmh is null or warmup_speed_kmh > 0),
  reps integer not null check (reps > 0),
  rep_distance_m integer not null check (rep_distance_m > 0),
  rep_speed_kmh numeric not null check (rep_speed_kmh > 0),
  walk_sec integer not null check (walk_sec >= 0),
  walk_speed_kmh numeric check (walk_speed_kmh is null or walk_speed_kmh > 0),
  cooldown_min numeric check (cooldown_min is null or cooldown_min >= 0),
  cooldown_speed_kmh numeric check (cooldown_speed_kmh is null or cooldown_speed_kmh > 0),
  notes text,
  created_at timestamptz not null default now()
);

create index workouts_user_id_idx on public.workouts (user_id);

-- Row-level security: each runner can only see and change their own workouts.
alter table public.workouts enable row level security;

create policy "Users can read their own workouts"
  on public.workouts for select
  to authenticated
  using (true);

create policy "Users can add their own workouts"
  on public.workouts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own workouts"
  on public.workouts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  to authenticated
  using ((select auth.uid()) = user_id);
