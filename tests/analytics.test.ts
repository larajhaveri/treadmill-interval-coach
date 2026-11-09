import { describe, expect, it } from "vitest";
import { cleanProperties, scrubProperties, scrubUrl } from "@/lib/analytics";

// Analytics must never carry what a runner typed. These tests check the rules in lib/analytics.ts.
describe("analytics privacy rules", () => {
  const id = "3f2a9c1e-7b4d-4e8a-9a51-0c6d2f8b1a77";

  it("hides workout ids in addresses", () => {
    expect(scrubUrl(`https://treadmill-interval-coach.vercel.app/workouts/${id}/run`)).toBe(
      "https://treadmill-interval-coach.vercel.app/workouts/:id/run",
    );
  });

  it("drops the search words and anything after # from an address", () => {
    expect(scrubUrl("https://example.app/?q=hill+repeats&sort=fastest#top")).toBe("https://example.app/");
  });

  it("cleans a bare path that has no website in front", () => {
    expect(scrubUrl(`/workouts/${id}/edit?x=1`)).toBe("/workouts/:id/edit");
  });

  it("cleans the address fields PostHog adds to every event and leaves the others alone", () => {
    const cleaned = scrubProperties({
      $current_url: `https://example.app/workouts/${id}?q=secret`,
      $pathname: `/workouts/${id}`,
      $referrer: "https://example.app/?q=secret",
      $browser: "Safari",
    });
    expect(cleaned).toEqual({
      $current_url: "https://example.app/workouts/:id",
      $pathname: "/workouts/:id",
      $referrer: "https://example.app/",
      $browser: "Safari",
    });
  });

  it("also cleans the first-visit address PostHog remembers for the session and the person", () => {
    const cleaned = scrubProperties({
      $session_entry_url: "https://example.app/?q=secret&utm=x",
      $initial_current_url: `https://example.app/workouts/${id}?q=secret`,
      $referrer: "$direct",
      $screen_width: 390,
    });
    expect(cleaned).toEqual({
      $session_entry_url: "https://example.app/",
      $initial_current_url: "https://example.app/workouts/:id",
      $referrer: "$direct",
      $screen_width: 390,
    });
  });

  it("keeps only numbers and true/false in our own events", () => {
    expect(
      cleanProperties({
        reps: 5,
        resumed: false,
        notes: "my shins hurt",
        name: "Hill repeats",
        bad: Number.NaN,
      }),
    ).toEqual({ reps: 5, resumed: false });
  });
});
