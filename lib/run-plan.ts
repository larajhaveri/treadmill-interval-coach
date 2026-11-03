// The run player's brain: turns a saved workout into a timeline of segments and a list of timed cues.
// Plain TypeScript with no browser or database in it, so tests can check it.
// This is the cue logic from my one-page prototype, rebuilt and typed.

import type { Workout } from "./workouts";
import { DEFAULT_SETTINGS, type Settings } from "./settings";

export type RunConfig = {
  warmMin: number; // 0 means no warm-up
  warmSpeed: number;
  reps: number;
  repDist: number; // meters
  repSpeed: number; // km/h
  walkSec: number;
  walkSpeed: number;
  walkAfterLast: boolean;
  coolMin: number; // 0 means no cool-down
  coolSpeed: number;
  lead: number; // heads-up, seconds before each change
  encourage: "off" | "light" | "frequent";
  countdownToWalk: number; // spoken "5, 4, 3, 2, 1" before a walk or the cool-down; 0 means off
  countdownToRep: number; // spoken countdown before the next rep; 0 means off
};

export type Segment = {
  kind: "easy" | "rep" | "walk";
  label: string; // "Warm-up", "Rep 3 of 5", "Walk", "Cool-down"
  dur: number; // seconds
  speed: number; // km/h
  dist?: number; // meters, reps only
  n?: number; // rep number, reps only
  start: number; // seconds from the start of the run
  end: number;
};

export type Timeline = { segs: Segment[]; total: number };

// priority: 4 = what to do now, 3 = heads-up, 2 = distance to go, 1 = progress, 0 = encouragement
export type Cue = { t: number; text: string; pri: number };

// Fills the gaps in a saved workout with sensible defaults (the optional boxes may be empty).
// The runner's saved settings decide the heads-up, the countdowns and the encouragement.
export function configFromWorkout(w: Workout, settings: Settings = DEFAULT_SETTINGS): RunConfig {
  return {
    warmMin: w.warmup_min ?? 0,
    warmSpeed: w.warmup_speed_kmh ?? 8,
    reps: w.reps,
    repDist: w.rep_distance_m,
    repSpeed: w.rep_speed_kmh,
    walkSec: w.walk_sec,
    walkSpeed: w.walk_speed_kmh ?? 5,
    walkAfterLast: false,
    coolMin: w.cooldown_min ?? 0,
    coolSpeed: w.cooldown_speed_kmh ?? 7,
    lead: settings.lead_sec,
    encourage: settings.encouragement,
    countdownToWalk: settings.countdown_to_walk_sec,
    countdownToRep: settings.countdown_to_rep_sec,
  };
}

export function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
}

// "2:05"
export function mmss(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// A rep takes distance ÷ speed. 600 m at 10.2 km/h is 0.6 ÷ 10.2 × 3600 = about 212 seconds.
export function repSeconds(distM: number, speedKmh: number): number {
  return Math.round((distM / 1000 / speedKmh) * 3600);
}

export function buildTimeline(c: RunConfig): Timeline {
  const segs: Segment[] = [];
  let t = 0;
  const add = (s: Omit<Segment, "start" | "end">) => {
    segs.push({ ...s, start: t, end: t + s.dur });
    t += s.dur;
  };

  if (c.warmMin > 0) add({ kind: "easy", label: "Warm-up", dur: Math.round(c.warmMin * 60), speed: c.warmSpeed });
  for (let i = 1; i <= c.reps; i++) {
    add({
      kind: "rep",
      label: `Rep ${i} of ${c.reps}`,
      dur: repSeconds(c.repDist, c.repSpeed),
      speed: c.repSpeed,
      dist: c.repDist,
      n: i,
    });
    if (i < c.reps || c.walkAfterLast) add({ kind: "walk", label: "Walk", dur: Math.round(c.walkSec), speed: c.walkSpeed });
  }
  if (c.coolMin > 0) add({ kind: "easy", label: "Cool-down", dur: Math.round(c.coolMin * 60), speed: c.coolSpeed });
  return { segs, total: t };
}

const PRAISE = ["Nice work.", "Strong rep.", "Well done.", "That was strong.", "Good job."];
const MOTIVATE: Record<Segment["kind"], string[]> = {
  rep: ["You've got this.", "Keep the pace.", "Keep going.", "Don't forget to breathe.", "Stay strong.", "Hold your form."],
  walk: ["Breathe.", "You're doing well.", "Shake out your arms.", "Recover and breathe."],
  easy: ["You're doing well.", "Nice and relaxed.", "Don't forget to breathe.", "Keep going.", "Stay loose."],
};
const MOTIVATE_GAP = { light: 80, frequent: 45 } as const;

export function buildCues(tl: Timeline, c: RunConfig): Cue[] {
  const segs = tl.segs;
  const lead = Math.round(c.lead);
  const main: Cue[] = [];
  const add = (t: number, text: string, pri: number) => main.push({ t: Math.max(0, Math.round(t)), text, pri });
  let praiseN = 0;
  const praise = () => PRAISE[praiseN++ % PRAISE.length];

  segs.forEach((s, i) => {
    const prev = segs[i - 1];

    // What to do right now, at the start of each segment.
    if (s.label === "Warm-up") {
      add(0, `Warm up. ${fmtNum(c.warmMin)} minutes at ${fmtNum(s.speed)} kilometers per hour.`, 4);
    } else if (s.kind === "rep") {
      add(s.start, `${s.n === c.reps ? "Go. Last rep. " : `Go. Rep ${s.n} of ${c.reps}. `}${s.dist} meters.`, 4);
    } else if (s.kind === "walk") {
      add(s.start, `Walk. Rep ${prev?.n} done. ${praise()} ${s.dur} seconds.`, 4);
    } else {
      const lastRepDone = prev?.kind === "rep" ? "Cool down. Last rep done. Great work. " : "Cool down. ";
      add(s.start, `${lastRepDone}${fmtNum(c.coolMin)} minutes at ${fmtNum(s.speed)}.`, 4);
    }

    // Heads-up so there is time to change the treadmill speed.
    if (i > 0) {
      const pre = s.start - lead;
      if (pre > prev.start + 5) {
        if (s.kind === "rep") {
          add(pre, `${s.n === c.reps ? "Last rep" : `Rep ${s.n} of ${c.reps}`} in ${lead} seconds. Set speed to ${fmtNum(s.speed)}.`, 3);
        } else if (s.kind === "walk") {
          add(pre, `Walk in ${lead} seconds. Slow to ${fmtNum(s.speed)}.`, 3);
        } else {
          add(pre, `Cool down in ${lead} seconds. Slow to ${fmtNum(s.speed)}.`, 3);
        }
      }
    }

    // Progress inside a segment.
    if (s.kind === "rep" && s.dist !== undefined) {
      if (s.dist > 400) add(s.start + s.dur / 2, "Halfway.", 1);
      if (s.dist >= 400) add(s.start + ((s.dist - 200) / s.dist) * s.dur, "200 meters to go.", 2);
      if (s.dist >= 300) add(s.start + ((s.dist - 100) / s.dist) * s.dur, "100 meters to go.", 2);
    }
    if (s.label === "Warm-up" && s.dur >= 150) add(s.end - 60, "One minute left.", 1);
    if (s.label === "Cool-down" && s.dur >= 120) {
      add(s.start + s.dur / 2, `Halfway. ${fmtNum(Math.round((s.dur / 120) * 10) / 10)} minutes left.`, 1);
    }
  });
  add(tl.total, "Workout complete. You did it. Great job.", 4);

  // Drop cues that land within 6 seconds of a more important one.
  main.sort((a, b) => a.t - b.t || b.pri - a.pri);
  const kept: Cue[] = [];
  for (const cue of main) {
    const last = kept[kept.length - 1];
    if (last && cue.t - last.t < 6) {
      if (cue.pri > last.pri) kept[kept.length - 1] = cue;
      continue;
    }
    kept.push(cue);
  }

  // Encouragement goes only where it clears every other cue.
  if (c.encourage !== "off") {
    const gap = MOTIVATE_GAP[c.encourage];
    const used: Record<Segment["kind"], number> = { rep: 0, walk: 0, easy: 0 };
    const extra: Cue[] = [];
    for (const s of segs) {
      for (let off = 25; off <= s.dur - 30; off += gap) {
        const t = Math.round(s.start + off);
        if (kept.some((k) => Math.abs(k.t - t) < 10)) continue;
        const list = MOTIVATE[s.kind];
        extra.push({ t, text: list[used[s.kind]++ % list.length], pri: 0 });
      }
    }
    kept.push(...extra);
    kept.sort((a, b) => a.t - b.t);
  }
  return withCountdowns(kept, segs, c);
}

// Spoken "5, 4, 3, 2, 1" before a change. A countdown before a rep uses countdownToRep; before a
// walk or the cool-down it uses countdownToWalk. While it counts, other cues stay quiet (the
// "what to do now" cue at the start of the segment is kept), so the numbers are not talked over.
function withCountdowns(cues: Cue[], segs: Segment[], c: RunConfig): Cue[] {
  let result = cues;
  segs.forEach((s, i) => {
    if (i === 0) return;
    const length = s.kind === "rep" ? c.countdownToRep : c.countdownToWalk;
    // Skip it if it would start almost as soon as the previous segment does.
    if (length <= 0 || s.start - length <= segs[i - 1].start + 5) return;

    const from = s.start - length;
    result = result.filter((cue) => cue.pri === 4 || cue.t < from - 1 || cue.t >= s.start);
    for (let n = length; n >= 1; n--) result.push({ t: s.start - n, text: String(n), pri: 4 });
  });
  return result === cues ? cues : [...result].sort((a, b) => a.t - b.t || b.pri - a.pri);
}

// Which segment is the runner in, given seconds since the start?
export function segmentIndexAt(tl: Timeline, seconds: number): number {
  const i = tl.segs.findIndex((s) => seconds < s.end);
  return i === -1 ? tl.segs.length - 1 : i;
}
