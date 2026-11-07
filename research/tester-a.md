# User research: Tester A

**Date:** 3 November 2026. **Interview 1 of several planned.**
Tester A is not in my class. His name, the recording and the raw transcript are not in this repo.
The quotes below come from an automatic transcript and are lightly cleaned. The transcript has no speaker labels, so I only quote lines I have checked against the recording as his.

## Who he is

- A street runner who used to run on treadmills and doesn't much now.
- Tracks runs on a watch and on Strava.
- Started running with the Nike Run Club coach, and still values a coach's voice for motivation.
- Runs to unwind, not to train, so he is not the runner I built for. Most of his reactions are those of a street runner looking at a treadmill app.

## How I ran it

He shared his screen on a call, signed up with his own Google account, and used the live app for about 10 minutes while I watched, then I asked questions. I recorded it with his permission.

I did not manage to stay hands-off. I told him to use his personal email rather than his school one, gave him the numbers for a short workout (2 reps of 150 m at 9 km/h, a 30 second walk, warm-up and cool-down left blank), asked him to play music like he would on a run, and suggested he press Skip so we didn't wait through the whole workout. Those were my choices and they shaped what he saw.

## What I saw, in order

1. **First screen.** He didn't register that it is a treadmill app.
2. **Add workout form.** He hesitated over the blank warm-up box and said: "I feel like I leave it blank, it would by default, take it as ten." A 30 went into a minutes box where the short workout needed seconds, and he said: "I should probably do a better job of highlighting the minutes versus seconds." Both point to the same problem: the units and the meaning of a blank box were not clear.
3. **Workout list.** He pressed Apply on the filter with nothing entered and saw his one workout. He mentioned that a drop-down might have worked better somewhere on the form; the transcript doesn't say which field.
4. **Run player.** He said he wouldn't look at the screen while running, so the spoken cues would help. He heard the "halfway" cue as speech and saw it as text.
5. **After a rep.** On the walk, the 20 second heads-up cut most of a short rest. He suggested building a buffer around speed changes, a 5 or 10 second window to move between speeds.
6. **Session survey.** He wanted to pick more than one "hardest part," or use a scale.

## Answers to my questions

- **How do you track workouts?** A Coros watch, synced to Strava, which he uses to follow progress over months.
- **How would you describe the app?** "A workout guide in its beta version," an on-the-go guide that nudges you so you don't spend mental effort on the transitions.
- **What did you like?** It's very simple and basic, not overloaded with information. He liked the colors and fonts. The spoken cues were "very brief, to the point."
- **What annoyed you or would you change?**
  - If he is in the zone with music, he might miss a cue, so he suggested a tiny follow-up ("not very pokey") to confirm he has switched to the next section.
  - The buttons could be placed better.
  - He couldn't see how to go back to a past session, and the survey gave him little insight. He wanted a comment box and said he would use it.
- **Why did you not know it was for a treadmill?** "I did not know that this was for a treadmill." He picked up benefits for street running anyway. The name is at the top of the first screen, so the fact that he missed it means it isn't obvious.
- **Would you use it?** As a street runner, probably not; the Nike Run Club coach already does a similar job. If he followed a weekly training plan he would, with routines named by day. The customization is what sets it apart from a preset coach.
- **Anything else?** A Spotify playlist inside the app, and more of a coach's motivation.

## Something I hadn't considered

Some gym treadmills can store a whole program, so a runner presses no buttons mid-run. He said the difference for this app is customization: a stored program follows preset curves, while this app lets a runner build the exact intervals. I haven't checked how many treadmills do this, or how many of my target runners use them.

## What I did with it

- **Fixed:** the form labels and hints (struggle 1), in PR #35. See `prompts/form-hints.md`.
- **Backlogged:** the treadmill description on the first screen, the follow-up cue, multiple "hardest part" answers, transition buffers, finding past sessions and notes, a Spotify playlist, and button placement. All are in `BACKLOG.md` under "From the stranger test".

## What this interview can't tell me

- It is one person, and a street runner. I need to hear from people who do interval workouts on a treadmill.
- I helped him in four places, listed above, so I can't say how far he would have got alone.
- His "I probably wouldn't use it" is useful, but it is a street runner talking about a treadmill app.

## Next interviews

Ask runners who use a treadmill for intervals:

- How do you time and count your reps today?
- What would make you stop using a tool like this halfway through a workout?
- Do you use a treadmill with stored programs?
- Does it matter to you that the cues are spoken over your music?
