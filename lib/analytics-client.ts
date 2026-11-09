import posthog from "posthog-js";
import { cleanProperties, type AnalyticsEvent } from "./analytics";

// Records one event in PostHog. It does nothing when no PostHog key is set (for example on my laptop),
// and it never throws, so a blocked or failing analytics call cannot break the run player.
export function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, cleanProperties(properties));
  } catch {
    // analytics is never worth breaking the app for
  }
}
