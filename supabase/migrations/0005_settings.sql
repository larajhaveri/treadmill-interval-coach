-- Feature 10: settings (one row per runner) for how the run player counts down.
-- No row means "use the defaults", so a new runner needs no setup.
-- The plan also listed a "voice" column. It is left out on purpose: a web page cannot choose
-- the phone's voice in a way that works the same on every device, so there was nothing to save.

create table public.settings (
  user_id uuid primary key references public.users (id) on delete cascade,
  -- Heads-up before each change ("Rep 2 of 5 in 20 seconds").
  lead_sec integer not null default 20 check (lead_sec in (10, 20, 30)),
  -- Spoken "5, 4, 3, 2, 1" before a walk or the cool-down. 0 means off.
  countdown_to_walk_sec integer not null default 0 check (countdown_to_walk_sec in (0, 5, 10)),
  -- Spoken countdown before the next rep. 0 means off.
  countdown_to_rep_sec integer not null default 0 check (countdown_to_rep_sec in (0, 5, 10, 15)),
  encouragement text not null default 'light' check (encouragement in ('off', 'light', 'frequent')),
  updated_at timestamptz not null default now()
);

-- Row-level security: each runner can only see and change their own settings row.
alter table public.settings enable row level security;

create policy "Runners can read their own settings"
  on public.settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Runners can create their own settings"
  on public.settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Runners can change their own settings"
  on public.settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
