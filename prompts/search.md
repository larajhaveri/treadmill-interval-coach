# Prompts for Feature 6: Find things (search, filter, sort)

Branch: `feature/search`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to search workouts by name and filter and sort them (newest, longest rep, fastest speed), so that I can find a session quickly.

2. Decision made earlier that shapes this feature: the sort choices are the three in the story (newest, longest rep, fastest speed). The agent added "oldest first" because it costs nothing.

## What the agent built

- `lib/find-workouts.ts`: the sort choices, a check that only known sort names are accepted, and a safe way to turn what the runner typed into a "name contains this" search.
- `app/page.tsx`: a search box and a sort menu above the workout list, an "Apply" button and a "Clear" link, a count of how many workouts match, and a message when nothing matches.
- The search and sort are done by the database, not in the browser.
- The filter is the "★ Starred" tab from feature 5. It keeps the current search and sort when you switch tabs.
- `app/globals.css`: styles for the search form and sort menu.

## Notes

- The search is a plain form that changes the page address (for example `/?q=600&sort=fastest`), so it works without extra code, and a search can be bookmarked.
- If someone edits the address to an unknown sort name, the page falls back to "newest first" instead of breaking.
- Typing `%` or `_` searches for those characters literally instead of acting as database wildcards.
- This branch is built on top of the stars branch, because the Starred tab is part of the filter.
