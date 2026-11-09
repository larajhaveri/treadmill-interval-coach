// Analytics rules, as plain TypeScript with no browser in it, so tests can check them.
// Nothing here sends anything. It only decides what is allowed to leave the app.
//
// What is allowed: page paths (with ids hidden), the runner's anonymous user id, and a few counts from the run player.
// What is never sent: names of workouts, notes, search words, email addresses, or anything typed into a form.

export type AnalyticsEvent = "run_started" | "run_paused" | "run_skipped" | "run_completed";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

// "https://site.app/workouts/3f2a...-...?q=hill repeats#top" becomes "https://site.app/workouts/:id".
// Workout ids are random, so they only add noise, and the search box puts what a runner typed into the address.
export function scrubUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname.replace(UUID, ":id")}`;
  } catch {
    // A path such as "/workouts/abc?q=x" has no origin, so clean it by hand.
    return url.replace(/[?#].*$/, "").replace(UUID, ":id");
  }
}

// PostHog adds several address fields by itself ($current_url, $session_entry_url, $initial_referrer and more).
// Rather than list them, clean any text field whose name mentions an address and whose value looks like one.
const ADDRESS_FIELD = /url|path|referrer/i;
const LOOKS_LIKE_ADDRESS = /^(https?:\/\/|\/)/;

// Applied to every event just before it is sent.
export function scrubProperties(properties: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    cleaned[key] =
      typeof value === "string" && ADDRESS_FIELD.test(key) && LOOKS_LIKE_ADDRESS.test(value) ? scrubUrl(value) : value;
  }
  return cleaned;
}

// Our own events may carry numbers and true/false only, so text a runner typed cannot slip in by mistake.
export function cleanProperties(properties: Record<string, unknown>): Record<string, number | boolean> {
  const cleaned: Record<string, number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
