# Prompts for Feature 3: View, edit and delete workouts

Branch: `feature/workout-detail-edit-delete`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want a list of my workouts, a detail page for each, and the ability to edit it or delete it after an "Are you sure?" confirmation, so that I can keep my workouts accurate.

2. Decisions that shape this feature:
   - Workouts are the main item (feature 2). Each runner sees only their own.
   - The brief requires: view the list, open one item's detail page, edit it, and delete it with an "are you sure?" confirmation.

## What the agent built

- `/workouts/[id]`: a detail page showing every field of one workout, with Edit, Delete and Back buttons.
- `/workouts/[id]/edit`: the same form as "new workout", pre-filled, that saves changes.
- `/workouts/[id]/delete`: a confirmation page ("Are you sure?") with "Yes, delete it" and "No, keep it".
- Each workout on the home page now links to its detail page.
- A shared form component so "new" and "edit" use one form instead of two copies.
- `lib/get-workout.ts`: loads one workout, and shows "not found" if it doesn't exist or belongs to someone else (row-level security hides other runners' rows).

## Notes

- The confirmation is a separate page instead of a pop-up, so it works on every phone browser without extra code.
- Friendly validation messages are still feature 4.
