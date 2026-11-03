# Prompts for Feature 9: Run player

Branch: `feature/run-player`. Agent: Claude Code (Claude Sonnet 5.5). This is one of my 3 own features.

## My prompts

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to start a saved workout and hear and see timed cues (speed to set, 20-second heads-up, 200 m and 100 m to go, walk and rep changes, praise), so that I never have to look at the treadmill.

2. Decisions I made earlier that shape this feature:
   - This rebuilds the cue logic from my one-page prototype, which I used in a real interval session. The timing rules (a rep takes distance divided by speed, a 20 second heads-up that says the speed to set, "200 meters to go", "100 meters to go") come from that prototype.
   - The plan says I will not promise that music keeps playing. The run player ships with on-screen and spoken cues, and the music behavior is written down as a known limitation.
   - Countdown choices (10, 5 or no seconds before a change) are a separate feature (feature 10), so they are not here.

## What the agent built

- `lib/run-plan.ts`: the plan logic on its own, with no browser in it. It turns a saved workout into a timeline (warm-up, reps, walks, cool-down) and a list of timed cues. Empty warm-up or cool-down boxes are skipped.
- `app/workouts/[id]/run/`: the run page. It has a big countdown for the current part, the speed to set, what comes next, a progress bar, the last spoken cue, and Start, Pause, Back, Skip and Reset buttons. It keeps the screen awake. When the workout ends it offers "Log this session".
- A "Start run" button on each workout's page.
- `tests/run-plan.test.ts`: 10 tests for the timeline and the cues, for example that 600 m at 10.2 km/h is 212 seconds, that the first heads-up says "Rep 1 of 5 in 20 seconds. Set speed to 10.2.", and that every 600 m rep gets "200 meters to go" and "100 meters to go".

## Notes

- I tested the screen in a browser with a short pretend workout: Start spoke the warm-up cue and moved on to "Rep 1 of 2" on schedule. I have not yet tested it on my phone in a real run, and I have not confirmed what happens to Spotify when a cue speaks.
- The page asks the phone to treat the sound as background sound (`audioSession.type = "ambient"`). That is an attempt, not a promise.
- Speech needs a tap to start on iPhones, so the first cue is spoken inside the Start tap.
- Speed is shown in km/h only. A units toggle (km/h or mph) is in my backlog.

## Follow-up after my first phone test

On my phone the music kept playing but I heard no spoken cues. The agent had set the audio mode to `ambient` without testing it; my prototype used `transient`. The fix:
- The run page now defaults to `transient` (cues are heard clearly, music may pause), like the prototype.
- A menu lets me choose "Keep music playing (cues may be quiet)" instead, so I can compare both on my phone.
- After Start, the page shows what audio mode the phone reports, so my test result is a fact and not a guess.

## Second follow-up: no voice in either audio mode

On my phone the cue text appeared on screen but I heard nothing in either audio mode, so the audio mode was not the cause. To find out what is, the run page now has a "Test voice" button, a "Test beep" button, and a line that reports what the speech engine did (started, finished, or an error, and how many voices the phone has). It also picks an English voice by name before speaking, because some phones need that.
