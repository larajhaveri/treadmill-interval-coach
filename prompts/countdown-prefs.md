# Prompts for Feature 10: Countdown preferences

Branch: `feature/countdown-prefs`. Agent: Claude Code (Claude Sonnet 5.5). This is my third own feature.

## My prompts

1. The user story, pasted into the issue:
   > As a runner, I want to choose a countdown before each change (10, 5 or no seconds before walking; 15, 10, 5 or no seconds before the next rep), so that the cues match how I like to run.

2. Decisions I made before the agent built it:
   - It uses the `settings` table from my plan, one row per runner.
   - The units toggle (km/h and mph) is not part of this feature. I put it in my backlog so that this feature stays small.

## What the agent built

- `supabase/migrations/0005_settings.sql`: the `settings` table with row-level security, so a runner can only read and change their own row.
- A Settings page (`/settings`) with four drop-downs: heads-up time, countdown before a walk, countdown before a rep, and encouragement. A link to it is on the home page.
- `lib/settings.ts`: the allowed choices and the checking, with plain-English messages. The drop-downs make a wrong value unlikely, but the server checks anyway.
- `lib/run-plan.ts`: spoken "5, 4, 3, 2, 1" cues before each walk, the cool-down and each rep. While a countdown speaks, the other cues stay quiet so the numbers are not talked over.
- The run page loads the runner's settings, and uses the defaults when they have none saved.
- Tests: 4 new run-plan tests (countdown off, 5-second rep countdown, 10-second walk countdown, nothing speaking over it) and 1 new isolation test (a second account cannot read or change the first one's settings).

## Notes

- The `voice` column from my plan is left out. A web page cannot choose the phone's voice in a way that works on every device. This goes in my Plan vs. Reality table.
- I still need to test the spoken countdown on my phone. The tests prove when each number is scheduled, not how it sounds.
