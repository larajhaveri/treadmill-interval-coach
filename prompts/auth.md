# Prompts for Feature 1: Sign up and log in with Google

Issue: #3. Branch: `feature/auth`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompts

These are the instructions I gave the agent, in order. I decided the product and the technology; the agent wrote the code.

1. The user story from PLAN.md, pasted into the issue:
   > As a runner, I want to sign up and log in with my Google account and log out, so that my workouts are private and follow me from my phone to my laptop. Each account is a row in `users`, and each user sees only their own data.

2. Technology decisions (from my chat with the agent):
   - "lets do google sign in" (I chose Google sign-in over email and password, knowing it needs extra setup).
   - "if there are no requirements and you suggest supabase and vercel, then lets do that" (Supabase for the database and login, Vercel for hosting).
   - "yes" to the table design in the plan, where `users` is the first of five tables.

3. Constraints from the plan: red, yellow, black and white playful design; Next.js; a users table that gets a row automatically on first sign-in; each user sees only their own row.

## What the agent built

- A Next.js app (App Router) with Supabase libraries.
- `/login` page with a "Continue with Google" button, `/auth/callback` to finish sign-in, `/auth/signout` to log out, and a home page that redirects to `/login` when nobody is signed in.
- `proxy.ts` to keep the login session fresh.
- `supabase/migrations/0001_users.sql`: the `users` table, row-level security (a user can read and update only their own row) and a trigger that adds a row when someone signs up.

## Notes

- Next.js 16 renamed `middleware` to `proxy`; the agent read the docs bundled with Next.js before writing it.
- The agent could not test the real Google login (it needs my Google Cloud and Supabase settings), so I test it on the deployed site.
- Secrets are not in the repo. `.env.example` lists the two environment variable names; the real values are set in Vercel.
