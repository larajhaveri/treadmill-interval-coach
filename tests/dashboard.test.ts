import { describe, expect, it } from "vitest";
import { calculateDashboard, type SessionForStats } from "@/lib/dashboard";

// Test 2 from PLAN.md section 4.
// Given a user has three logged sessions with completed reps of 5 × 600 m, 4 × 400 m and 5 × 800 m,
// when the dashboard calculates total hard-rep distance,
// then it shows 8,600 m (3,000 + 1,600 + 4,000).
describe("dashboard", () => {
  const threeSessions: SessionForStats[] = [
    { id: "a", run_date: "2026-10-06", reps_completed: 5, workouts: { rep_distance_m: 600, rep_speed_kmh: 10.2 } },
    { id: "b", run_date: "2026-10-13", reps_completed: 4, workouts: { rep_distance_m: 400, rep_speed_kmh: 10.5 } },
    { id: "c", run_date: "2026-10-20", reps_completed: 5, workouts: { rep_distance_m: 800, rep_speed_kmh: 10.0 } },
  ];

  it("totals hard-rep distance across sessions: 3,000 + 1,600 + 4,000 = 8,600 m", () => {
    const stats = calculateDashboard(threeSessions);
    expect(stats.totalHardMeters).toBe(8600);
  });

  it("counts sessions and averages the rep speed", () => {
    const stats = calculateDashboard(threeSessions);
    expect(stats.sessionCount).toBe(3);
    expect(stats.averageRepSpeed).toBe(10.2); // (10.2 + 10.5 + 10.0) / 3 = 10.23
  });

  it("gives one bar per session, oldest first", () => {
    const stats = calculateDashboard([...threeSessions].reverse());
    expect(stats.points.map((point) => point.meters)).toEqual([3000, 1600, 4000]);
    expect(stats.points.map((point) => point.label)).toEqual(["Oct 6", "Oct 13", "Oct 20"]);
  });

  it("shows zeros, not a crash, when there are no sessions", () => {
    const stats = calculateDashboard([]);
    expect(stats).toEqual({ sessionCount: 0, totalHardMeters: 0, averageRepSpeed: null, points: [] });
  });
});
