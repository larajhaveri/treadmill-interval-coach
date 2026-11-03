import { describe, expect, it } from "vitest";
import { buildCues, buildTimeline, repSeconds, segmentIndexAt, type RunConfig } from "@/lib/run-plan";

// 5 × 600 m at 10.2 km/h with a 90 second walk, 10 minute warm-up and cool-down.
const config: RunConfig = {
  warmMin: 10,
  warmSpeed: 8,
  reps: 5,
  repDist: 600,
  repSpeed: 10.2,
  walkSec: 90,
  walkSpeed: 5,
  walkAfterLast: false,
  coolMin: 10,
  coolSpeed: 7,
  lead: 20,
  encourage: "off",
};

describe("run plan: timeline", () => {
  it("works out how long a rep takes from distance and speed (600 m at 10.2 km/h is 212 s)", () => {
    expect(repSeconds(600, 10.2)).toBe(212);
  });

  it("builds warm-up, 5 reps with 4 walks between, and cool-down", () => {
    const tl = buildTimeline(config);
    expect(tl.segs.map((s) => s.kind)).toEqual(["easy", "rep", "walk", "rep", "walk", "rep", "walk", "rep", "walk", "rep", "easy"]);
    // 600 + 5 × 212 + 4 × 90 + 600 = 2,620 seconds
    expect(tl.total).toBe(2620);
  });

  it("leaves out warm-up and cool-down when they are zero", () => {
    const tl = buildTimeline({ ...config, warmMin: 0, coolMin: 0 });
    expect(tl.segs[0].kind).toBe("rep");
    expect(tl.segs[tl.segs.length - 1].kind).toBe("rep");
    expect(tl.total).toBe(5 * 212 + 4 * 90);
  });

  it("finds which segment the runner is in", () => {
    const tl = buildTimeline(config);
    expect(tl.segs[segmentIndexAt(tl, 0)].label).toBe("Warm-up");
    expect(tl.segs[segmentIndexAt(tl, 605)].label).toBe("Rep 1 of 5");
    expect(tl.segs[segmentIndexAt(tl, 9999)].label).toBe("Cool-down");
  });
});

describe("run plan: cues", () => {
  const tl = buildTimeline(config);
  const cues = buildCues(tl, config);

  it("starts with the warm-up and ends with workout complete", () => {
    expect(cues[0].t).toBe(0);
    expect(cues[0].text).toContain("Warm up");
    expect(cues[cues.length - 1].text).toContain("Workout complete");
    expect(cues[cues.length - 1].t).toBe(tl.total);
  });

  it("gives a heads-up with the speed to set, 20 seconds before the first rep", () => {
    const headsUp = cues.find((c) => c.t === 580);
    expect(headsUp?.text).toBe("Rep 1 of 5 in 20 seconds. Set speed to 10.2.");
  });

  it("says 'Last rep' for the final rep", () => {
    expect(cues.some((c) => c.text.startsWith("Go. Last rep."))).toBe(true);
    expect(cues.some((c) => c.text.startsWith("Last rep in 20 seconds."))).toBe(true);
  });

  it("calls 200 and 100 meters to go in every 600 m rep", () => {
    expect(cues.filter((c) => c.text === "200 meters to go.")).toHaveLength(5);
    expect(cues.filter((c) => c.text === "100 meters to go.")).toHaveLength(5);
  });

  it("is in time order, and never crowds two cues within 6 seconds when encouragement is off", () => {
    for (let i = 1; i < cues.length; i++) {
      expect(cues[i].t).toBeGreaterThanOrEqual(cues[i - 1].t + 6);
    }
  });

  it("adds encouragement only when asked for", () => {
    const withPraise = buildCues(tl, { ...config, encourage: "frequent" });
    expect(withPraise.length).toBeGreaterThan(cues.length);
    expect(withPraise.filter((c) => c.pri === 0).length).toBeGreaterThan(0);
  });
});
