# Backlog (for after the class project)

Ideas from using the app, plus known gaps. None of these are built.

## Home screen and navigation
- **Too many workouts on the home page.** With 15 workouts the list takes over the screen. Make each row smaller or show several per row, and make the list collapsible.
- **The main action should be starting a run, not browsing.** The first thing on opening the app should be "start a workout" (for example the last one run, or the starred ones).
- **Wasted space, and the main links are hard to find.** Settings, Add a workout and Dashboard are all at the bottom of a long page. Move them to a top navigation bar, and put Log out in the top right.
- **Onboarding.** A new user should get a short guided tour of how to use the app (add a workout, run it, log a session, see the dashboard).
- **Tabs instead of one long scroll.** Replace "scroll past workouts, then Add a workout, then Dashboard" with a tab bar (for example Workouts, Add, Dashboard).

## Units and display
- **Units toggle:** km/h or mph for speed, km or miles for distance. This needs a units column in the `settings` table and conversion on every screen, both forms, the validation ranges and the dashboard.
- **Dashboard chart:** the x-axis label for one date is missing because labels collide on a phone-width screen.

## From PLAN.md
- Rep-speed trendline ("am I getting faster").
- Pace versus rep length (can I hold a speed for longer reps).
- Recorded human voice clips instead of the phone's voice.
- Music matched to the workout.
- Outdoor navigation cues.
- **Music dimming while a cue speaks:** this needs a native app (see the tested result below).

## From the stranger test (Tester A, a street runner)
- **Say what the app is for on the first screen.** He did not realize it is for treadmills: "I did not know that this was for a treadmill." A new account shows no description. This belongs with the onboarding idea.
- **A short follow-up cue after a change,** to confirm the runner switched ("not very pokey").
- **More than one "hardest part",** or a scale, instead of a single choice.
- **Transition buffers around speed changes.** With a short walk, the 20 second heads-up cuts most of the rest. The Settings page lets a runner choose 10 seconds, but he never opened it.
- **Make past sessions and the notes box easier to find.** Both exist; he asked how to go back to a session and wished for a comment box.
- **Spotify playlist and coach-style motivation,** like the Nike Run Club coach he already uses.
- **Better button placement.**
- **Open question:** some gym treadmills can store a whole program, so a runner presses no buttons mid-run. Check how much that overlaps with this app for people who have those treadmills.

## Tested result: music and spoken cues on iPhone
Tested on an iPhone in Google Chrome with Spotify playing. The cues are spoken over the music at normal volume. The music does not dim and does not pause, in both audio modes, and there is no difference between them. The earlier silent voice was caused by the iPhone's silent switch, which mutes web audio.

## Known gaps
- Google sign-in is in testing mode: only listed test users can sign in. Publishing needs a homepage and a privacy policy page.
- The plan's `voice` setting was left out: a web page cannot choose the phone's voice reliably across devices.

## From my own real run (3 Nov evening, on my treadmill)
I used the live app for a real workout. It did not hold up, and I stopped using it partway and went back to working out the times and distances myself, which is the problem the app was built to solve. In order of how much they hurt:
- **The screen kept locking.** I had to unlock my phone again and again to keep the app open. The screen wake lock did not hold. This is a bug.
- **Cues were missed at the changes.** Sometimes I did not hear the change from walk to rep or from rep to walk, so I kept running longer than planned. A likely cause is the page being suspended when the screen goes dark, but that is a guess and needs real debugging.
- **The cues stopped my music.** Each cue paused it, and I had to press my AirPods to start it again. My earlier phone test showed the cues playing over the music without pausing it. I do not know why the result changed. One difference I have not tested: the earlier test was not necessarily with AirPods connected.
- **Getting started took too long.** Typing my email and password to sign in was annoying, and typing the workout name and all the numbers cost me running time.
- **Ideas from this run:** stay signed in; start the last workout in one tap; auto-fill the workout name from the numbers; fill in a workout by speaking it.

What to do first after the assignment: fix the screen lock and the missed cues, then retest the music with and without AirPods.

