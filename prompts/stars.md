# Prompts for Feature 5: Stars

Branch: `feature/stars`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to star my favorite workouts and see a "Starred" view, so that my go-to sessions are one tap away.

2. Decision made earlier that shapes this feature: stars are a separate `stars` table that links a user to a workout (a junction table), with the pair (user_id, workout_id) as the primary key so a workout can be starred only once. This is in section 3 of PLAN.md.

## What the agent built

- `supabase/migrations/0003_stars.sql`: the `stars` table, an index, and row-level security. A runner can read and remove only their own stars, and can star only their own workouts.
- `app/workouts/star-actions.ts`: one action that adds or removes a star for the signed-in runner.
- `app/workouts/star-button.tsx`: the ☆ / ★ button.
- `app/workouts/workout-list.tsx`: the list of workouts, now with a star button on each row. The home page and the future search feature share it.
- `app/page.tsx`: "All" and "★ Starred" tabs with counts. The Starred tab shows only starred workouts.
- `app/workouts/[id]/page.tsx`: a Star / Starred button on the detail page.

## Notes

- The migration has to be run in the Supabase SQL Editor before the live site can save stars.
- The `stars` table has exactly the columns in the plan (no extras).
- Deleting a workout also deletes its stars (`on delete cascade`), so no orphan stars are left behind.
