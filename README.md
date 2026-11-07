# Treadmill Interval Coach

A web app for runners who do interval workouts on a treadmill. Save a workout (for example 5 × 600 m at
10.2 km/h with a 90 second walk), log each time you run it, and watch whether your hard running is building up.
It works on a phone, because nobody runs with a laptop in the gym.

**Live site:** https://treadmill-interval-coach.vercel.app

Sign-in is with Google. The Google app is in testing mode, so only people added as test users can sign in. If
you would like to try it, ask me to add your Google email.

## What it does

- **Sign up and log in** with Google. Every runner sees only their own data.
- **Workouts:** create, view, edit and delete (with an "Are you sure?" page), with friendly messages when a
  number doesn't make sense.
- **Stars:** star favorite workouts and open a Starred view.
- **Find things:** search by name, sort by newest, oldest, longest rep or fastest speed.
- **Log a session:** date, reps finished, effort from 1 to 5, and what was hardest.
- **Dashboard:** session count, total hard-rep distance, average rep speed, and a bar chart of hard-rep
  distance per session.
- **Run player:** press Start on a workout for timed spoken and on-screen cues (speed to set, heads-up, distance to go).
- **Settings:** choose the heads-up time, a spoken countdown before a walk or the next rep, and how much encouragement you hear.

## Tools

| Tool | What it does here |
|---|---|
| Next.js (React, TypeScript) | the website and its server code |
| Supabase | the Postgres database, Google sign-in, and row-level security |
| Vercel | hosts the site; every merge to `main` deploys automatically |
| GitHub | the code, issues and pull requests; a check runs the tests on every push |
| Recharts | the dashboard chart |
| Vitest and PGlite | the tests |
| Claude Code | the coding agent that wrote the code from my plan and prompts |

## How it fits together

1. You open the site on Vercel. Next.js builds the page on the server.
2. The server asks Supabase for your rows. Supabase checks who you are (your Google sign-in) and its
   row-level security rules return only your own rows.
3. Changes to the code go through GitHub: an issue, a branch, a pull request, a merge. Vercel deploys each merge.

## Run it yourself

You need Node 22 and a free Supabase project.

1. `npm install`
2. In Supabase, open **SQL Editor** and run the files in `supabase/migrations/` in order (`0001` to `0005`).
3. In Supabase, turn on Google under **Authentication → Providers** (this needs a Google Cloud OAuth client).
4. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key
   (Supabase → Project Settings → API Keys). Never use the secret key.
5. `npm run dev`, then open http://localhost:3000

Other commands: `npm test` runs the tests, `npm run lint` checks the code, `npm run build` makes a production build.

## Tests

Two tests run on every push (see `docs/tests.md` for plain-English explanations):
- **Data isolation:** one runner can never see another runner's workouts.
- **Dashboard:** 5 × 600 m, 4 × 400 m and 5 × 800 m show a total of 8,600 m.

## User research

I have interviewed one person so far, "Tester A". He is a street runner who used to run on treadmills and tracks
his runs on a watch and Strava. He is not in my class. He signed up with his own account, shared his screen, and used the
live app for about 10 minutes before I asked him questions. I recorded the call with his permission. I wasn't fully
hands-off: I told him to use his personal email, gave him the numbers for a 2.5 minute workout, and prompted him to
press Skip and to start his music.

**What he struggled with**
1. The blank warm-up and cool-down boxes looked like they had a default. A blank box means no warm-up, but he expected ten.
2. He didn't know it was a treadmill app. The name is on the first screen and he didn't notice it.
3. He couldn't find his past sessions, and he wanted a place for comments. Both exist, and he found neither.

**What he liked:** it is simple and not overloaded, he liked the colors and fonts, and he found the spoken cues brief
and to the point. **What he would use it for:** he said he probably wouldn't use it as a street runner, and would if he
followed a weekly training plan.

**What I changed:** the form labels and hints, in PR #35 (see `prompts/form-hints.md`). His other requests, and mine
from my own first full workout, are in `BACKLOG.md`. The full write-up is in `research/tester-a.md`. Raw recordings
and transcripts are not in this repo, because they contain a person's voice and name.

My next interviews should be with people who run intervals on a treadmill, since he doesn't.

## Project documents

- `PLAN.md`: the plan written before building
- `schema.md`: the database, compared with the plan
- `research/`: what I learned from interviewing people who tried the app
- `BACKLOG.md`: ideas and known gaps for after the project
- `docs/tests.md`: the two tests
- `prompts/`: the prompts I gave the coding agent, one file per feature

## Known limits

- **Music and spoken cues on iPhone (tested twice on 3 Nov 2026, with different results):** in a test at my desk on
  Chrome with Spotify playing, the cues were spoken over the music at normal volume, and the music did not dim or pause.
  In my first full workout that evening, each cue paused my music and I had to restart it by hand. I do not know why the results
  differ. A web page cannot lower another app's music, so dimming would need a native app. This was the biggest
  risk in `PLAN.md`.
- **Known bugs from my first full workout (not fixed yet, listed in `BACKLOG.md`):** the screen can lock during a run even though the
  page asks it to stay awake, and cues can be missed at the changes between a walk and a rep when that happens. Keep
  the app open and the screen unlocked until this is fixed.
- **The iPhone silent switch mutes the cues.** With the switch on (orange showing), the cue text appears but nothing is
  heard. Switch it off and turn the volume up. The run page says so.
- Sign-in works only for Google accounts added as test users.
- The demo data are my own treadmill rep sessions (numbers only; health notes were removed before import).
