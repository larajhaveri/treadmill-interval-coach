# Prompts for Feature 4: Validation

Branch: `feature/validation`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want a friendly message if I leave a required field blank or enter a rep distance or speed that doesn't make sense, so that I never save a broken workout.

2. Context from earlier features: until now, a bad number was rejected by the database and the form only said "Could not save that workout." I wanted that replaced with a message next to the exact box that is wrong.

## What the agent built

- `lib/validate-workout.ts`: one function that checks a submitted workout and returns a plain-English message for each problem. Rules:
  - Name is required (up to 80 characters).
  - Reps: required, whole number, 1 to 50.
  - Rep distance: required, whole number, 50 to 10,000 meters.
  - Rep speed: required, 1 to 30 km/h.
  - Walk break: required, whole number, 0 to 1,800 seconds.
  - Warm-up, walk and cool-down minutes and speeds are optional, but if filled in they must be sensible numbers.
  - Notes: up to 500 characters.
- `app/workouts/actions.ts`: create and update now run the checks on the server first. If something is wrong, they send the messages back instead of saving.
- `app/workouts/workout-form.tsx`: now shows the message under each wrong box, outlines it in red, keeps everything the runner typed, and moves the cursor to the first box that needs fixing.
- `app/globals.css`: styles for the red outline and message.

## Notes

- The checks run on the server, not only in the browser, so they cannot be skipped. The database rules from feature 2 stay as a second safety net.
- The browser's own pop-up bubbles are turned off (`noValidate`) so every message looks the same and is written in friendly words.
- The ranges are my choices as the runner (for example, no treadmill rep faster than 30 km/h); the agent proposed them and I accepted them.
