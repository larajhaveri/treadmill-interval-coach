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

## Project documents

- `PLAN.md`: the plan written before building
- `schema.md`: the database, compared with the plan
- `BACKLOG.md`: ideas and known gaps for after the project
- `docs/tests.md`: the two tests
- `prompts/`: the prompts I gave the coding agent, one file per feature

## Known limits

- **Music and spoken cues on iPhone (tested 3 Nov 2026, iPhone, Chrome):** with Spotify playing, the cues were spoken
  over the music at normal volume. The music did not dim and did not pause, in either audio mode the run page offers.
  A web page cannot lower another app's music, so real dimming would need a native app. This was the biggest risk in `PLAN.md`.
- **The iPhone silent switch mutes the cues.** With the switch on (orange showing), the cue text appears but nothing is
  heard. Switch it off and turn the volume up. The run page says so.
- Sign-in works only for Google accounts added as test users.
- The demo data are my own treadmill rep sessions (numbers only; health notes were removed before import).
