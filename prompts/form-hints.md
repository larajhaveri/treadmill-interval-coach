# Prompts for the stranger test fix: workout form hints

Branch: `fix/form-hints`. Agent: Claude Code (Claude Sonnet 5.5). This fix comes from the stranger test (Tester A).

## What Tester A did and said

Tester A used the live app unaided for about 10 minutes while I watched on a shared screen. On the add-workout form he said:
> "I feel like I leave it blank, it would by default take it as ten."
and, afterwards:
> "I should probably do a better job of highlighting the minutes versus seconds."

## My prompt

I gave the agent the transcript and asked it to check the form against what he said. It found that the grey placeholder in the warm-up and cool-down minutes boxes was "10", which looks like a default value, but a blank box means no warm-up or cool-down. The only unit hint was the label "Minutes" or "Seconds".

## What the agent changed

- Warm-up, walk break and cool-down now say what they are: "Length (minutes)" or "Length (seconds)".
- A short line under the optional sections says "Leave both boxes blank for no warm-up" (and cool-down). The walk section says it is in seconds.
- Every placeholder now starts with "e.g.", so it reads as an example and not a value.

## What I decided not to fix

Tester A also asked for follow-up cues, a multi-choice "hardest part", speed ramps, Spotify, and clearer "this is for treadmills" text on the first screen. Those are in `BACKLOG.md`, because each is bigger than one small fix, or came from only one person who is not a treadmill runner.
