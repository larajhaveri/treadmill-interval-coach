# Prompts for Feature 2: Create workouts (data model)

Branch: `feature/create-workouts`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to create a workout with warm-up, number of reps, rep distance, rep speed, walk time and cool-down, so that I can save a session like 5 × 600 m at 10.2 km/h.

2. Decisions I made earlier that shape this feature:
   - The main item is a workout (a saved template), with sessions as the related table (I answered "yes" to that table design).
   - Weekly interval workouts on a treadmill, speeds in km/h, rep distance in meters, walk time in seconds.
   - Supabase (Postgres) for the database, as planned.

## What the agent built

- `supabase/migrations/0002_workouts.sql`: the `workouts` table with the columns from PLAN.md, database rules (for example reps and speeds must be above zero), and row-level security so each runner can only read, add, edit and delete their own workouts.
- `/workouts/new`: a form with warm-up, hard reps, walk break, cool-down and notes.
- `app/workouts/actions.ts`: saves the workout for the signed-in user, then returns to the home page.
- The home page now lists my workouts, for example "5 × 600 m at 10.2 km/h, 90 s walk".
- `lib/workouts.ts`: the workout type and a function that writes the one-line summary.

## Notes

- Friendly validation messages are a separate feature (feature 4). For now, bad numbers are rejected by the database and the form shows a general "could not save" message.
- The migration has to be run in the Supabase SQL Editor before the live site can save workouts.
