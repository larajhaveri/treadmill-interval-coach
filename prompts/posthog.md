# Prompts for PostHog analytics

Branch: `feature/posthog`. Agent: Claude Code (Claude Sonnet 5.5).

## My prompt

I wrote: "Post hog for analytics."

## What the agent did first

It read the Next.js docs in `node_modules/next/dist/docs/` (this version of Next.js has a client instrumentation file, `instrumentation-client.ts`) and looked at how the app is built before choosing where to start PostHog.

## What the agent decided, and why

I didn't specify what to track, so the agent chose, with privacy first because this app is about people's running:

- Page views, with workout ids replaced by `:id` and no search words, because the search box puts what a runner types into the address.
- The Supabase user id only, never an email or name, and cleared on log out.
- Four run player events (started, paused, skipped, completed), with numbers only.
- No autocapture and no session recordings, so nothing typed into a form or a notes box is sent.
- It does nothing when no key is set, so my laptop and the tests send nothing.

## A bug the agent caught in its own work

The first version cleaned `$current_url`. When the agent loaded the built app in a browser and read what PostHog sent, it found that `$session_entry_url` still held the raw address with the search word in it. It changed the rule to clean every address-like field and added a test for that.

## What I decided not to do yet

Tracking sign-ups, workouts created, sessions logged and stars needs server-side events. That is in `BACKLOG.md`.
