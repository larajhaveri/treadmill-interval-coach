# Prompts for Feature 7: Log a session and post-run survey

Branch: `feature/log-session`. Agent: Claude Code (Claude Sonnet 5.5). This is one of my 3 own features.

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to log a finished session with its date, reps completed, a 1–5 effort rating and what was hard (breathing, legs, mental, stitch or stomach, pace too fast, nothing), so that I can look back at how each workout felt.

2. Decisions I made earlier that shape this feature:
   - `sessions` is the second table linked to workouts (one workout, many sessions), as in section 3 of PLAN.md.
   - The "what was hard" list is the six choices I wrote in the plan.
   - Effort is empty in the database for my imported history that I never rated, but the new form asks for it every time.
   - Notes stay numbers-only. I removed health notes from my real data on purpose.

## What the agent built

- `supabase/migrations/0004_sessions.sql`: the `sessions` table (date, reps completed, effort 1 to 5, what was hardest, notes), database rules, and row-level security so each runner can read, add, edit and delete only their own sessions, and log sessions only against their own workouts.
- `app/workouts/[id]/log/`: a "Log a session" page and form with a date picker (starts on today), reps finished (starts at the planned number), a 1 to 5 effort row, a "what was hardest" menu, and notes.
- `lib/validate-session.ts`: friendly messages for each field (date required and real, not in the future; reps 1 to 50; effort and hardest part required).
- `app/workouts/session-actions.ts`: saves the session for the signed-in runner.
- The workout detail page now has a "Sessions" list (newest first) and a "Log a session" button.
- The delete confirmation now says that deleting a workout also deletes its sessions.

## Notes

- The migration has to be run in the Supabase SQL Editor before the live site can save sessions.
- The date starts on today in my own time zone, filled in by my phone, because the server runs on a different clock.
- The date check allows one day ahead so an evening run in California is never rejected by the server clock.
- Deleting a workout deletes its sessions (`on delete cascade`). That is a trade-off I accepted: the dashboard needs the workout's rep distance to count meters, so a session without its workout would be meaningless.
