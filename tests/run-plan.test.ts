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
  countdownToWalk: 0,
  countdownToRep: 0,
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

describe("run plan: countdowns", () => {
  const tl = buildTimeline(config);

  it("adds no countdown numbers when both countdowns are off", () => {
    const cues = buildCues(tl, config);
    expect(cues.some((c) => /^\d+$/.test(c.text))).toBe(false);
  });

  it("counts 5, 4, 3, 2, 1 one second apart before each rep, and ends on the 'Go' cue", () => {
    const cues = buildCues(tl, { ...config, countdownToRep: 5 });
    const rep2Start = tl.segs.find((s) => s.label === "Rep 2 of 5")!.start;
    const numbers = cues.filter((c) => /^\d+$/.test(c.text) && c.t >= rep2Start - 5 && c.t < rep2Start);
    expect(numbers.map((c) => c.text)).toEqual(["5", "4", "3", "2", "1"]);
    expect(numbers.map((c) => c.t)).toEqual([rep2Start - 5, rep2Start - 4, rep2Start - 3, rep2Start - 2, rep2Start - 1]);
    expect(cues.find((c) => c.t === rep2Start)?.text).toContain("Go. Rep 2 of 5");
  });

  it("counts down before a walk with its own length, separate from the rep countdown", () => {
    const cues = buildCues(tl, { ...config, countdownToWalk: 10 });
    const walkStart = tl.segs.find((s) => s.kind === "walk")!.start;
    const numbers = cues.filter((c) => /^\d+$/.test(c.text) && c.t >= walkStart - 10 && c.t < walkStart);
    expect(numbers).toHaveLength(10);
    // Reps have no countdown here, so the first rep gets none.
    const firstRepStart = tl.segs.find((s) => s.kind === "rep")!.start;
    expect(cues.some((c) => /^\d+$/.test(c.text) && c.t >= firstRepStart - 5 && c.t < firstRepStart)).toBe(false);
  });

  it("keeps other cues out of the way while the countdown is speaking", () => {
    const cues = buildCues(tl, { ...config, countdownToWalk: 10, encourage: "frequent" });
    for (const seg of tl.segs.filter((s) => s.kind === "walk")) {
      const inside = cues.filter((c) => c.t >= seg.start - 11 && c.t < seg.start && !/^\d+$/.test(c.text));
      expect(inside).toEqual([]);
    }
  });
});
