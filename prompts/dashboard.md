# Prompts for Feature 8: Dashboard

Branch: `feature/dashboard`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to see my session count, total hard-rep distance, average rep speed, and a bar chart of hard-rep distance for each session over time, so that I can tell whether I'm building up more hard running.

2. Decisions I made earlier that shape this feature:
   - The chart is a bar chart, one bar per session. I said yes to bars instead of a trendline, and the trendline went to my backlog.
   - "Hard-rep distance" means reps finished × the workout's rep distance (for example 5 × 600 m is 3,000 m).
   - The chart is required by the assignment. The library is Recharts, as written in PLAN.md section 5.

## What the agent built

- `lib/dashboard.ts`: the maths on its own, with no database in it: session count, total hard-rep meters, average rep speed, and one chart point per session (oldest first).
- `app/dashboard/page.tsx`: three summary tiles, the bar chart, and a "View as a table" section with the same numbers. It shows a friendly message when there are no sessions yet.
- `app/dashboard/dashboard-chart.tsx`: the Recharts bar chart (red bars, hover or tap for the exact meters).
- A "Dashboard" button on the home page.

## Notes

- The dashboard reads each session together with its workout's rep distance and speed. Row-level security means it only ever sees my own sessions.
- Average rep speed is the plain average of each session's rep speed (not weighted by distance). I chose that because it is the simplest thing I can explain.
- The test for the 8,600 m total comes in its own pull request, so I can show it failing and then passing.
- The chart has a table view so the numbers are readable without seeing colour.
