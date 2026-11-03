# Tests

There are two tests, both written before the shipped fix and both checked by GitHub on every push
(the "Tests" workflow in `.github/workflows/test.yml`). To run them yourself: `npm install`, then `npm test`.

## Test 1: Data isolation (`tests/data-isolation.test.ts`)

**What it checks, in plain English.** One runner must never see another runner's workouts. The test
creates two accounts. Account A saves a workout called "5 × 600 m". Account B has nothing. Then it checks
that B gets an empty list, that B gets "not found" when trying to open A's workout by its exact id, and
(extra checks) that B cannot edit it, delete it, save a workout in A's name, or log a session against it.
It also checks that A *can* see their own workout, so the other checks are not passing just because the
table is empty.

**How it runs.** It takes my real migration files in `supabase/migrations` and runs them in a small
in-memory Postgres database (PGlite), then acts as each user the same way Supabase does. So it tests the
real row-level security rules, not a copy of them. No passwords or keys are involved.

**What would break it.** Anything that lets one runner's rows show up for another:
- changing the "read" rule on `workouts` from "the row's `user_id` is me" to "anyone" (I did exactly this
  on purpose to make the test go red, see the screenshots),
- forgetting to turn row-level security on for a new table,
- writing a database function that skips the rules.

**What it does not check.** It tests the database rules, not the website's pages. The website shows "not
found" when the database returns nothing, which I checked by hand on the live site.

## Test 2: Dashboard total (`tests/dashboard.test.ts`)

**What it checks, in plain English.** The dashboard's "total hard-rep distance" must be right. Given three
logged sessions (5 × 600 m, 4 × 400 m and 5 × 800 m), the total must be 3,000 + 1,600 + 4,000 = **8,600 m**.
The same file also checks the session count, the average rep speed, one bar per session in date order, and
that an empty account shows zeros instead of crashing.

**What would break it.** Any change to how a session's meters are worked out. The rule is reps finished ×
the workout's rep distance. I broke it on purpose by adding instead of multiplying: the test then reported
1,814 m instead of 8,600 m.

## Red then green

For both tests I first pushed a commit with the code deliberately broken, so GitHub showed a red cross, then a
commit that fixed it, so GitHub showed a green tick. The screenshots are in the pull request description.
