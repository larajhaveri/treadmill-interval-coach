import posthog from "posthog-js";
import { scrubProperties } from "./lib/analytics";

// Starts PostHog in the browser before the app loads (a Next.js file convention).
// With no key set, nothing starts and nothing is sent, so local development stays quiet.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  try {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2025-05-24",
      // Counts a page view on every screen change, which is what a single-page app needs.
      capture_pageview: "history_change",
      // No automatic click and typing capture: it can pick up text from workout names and notes.
      autocapture: false,
      // No screen recordings. The run screen and the notes box are not for replay.
      disable_session_recording: true,
      // Visitors who never sign in do not get a person profile.
      person_profiles: "identified_only",
      respect_dnt: true,
      before_send: (event) => {
        if (!event) return event;
        // PostHog also copies the first address a person arrived on into $set and $set_once.
        if (event.properties) event.properties = scrubProperties(event.properties);
        if (event.$set) event.$set = scrubProperties(event.$set);
        if (event.$set_once) event.$set_once = scrubProperties(event.$set_once);
        return event;
      },
    });
  } catch {
    // If PostHog cannot start, the app should still work.
  }
}
