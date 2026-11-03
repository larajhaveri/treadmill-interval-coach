-- Feature 1: the users table.
-- Supabase keeps login details in its own auth.users table. This table is our own
-- "users" table: one row per account, created automatically on first sign-in.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

-- Row-level security: a signed-in user can only see and change their own row.
alter table public.users enable row level security;

create policy "Users can read their own row"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own row"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- When someone signs up (first Google sign-in), add their row to public.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: add rows for any accounts that already exist.
insert into public.users (id, email, display_name)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
