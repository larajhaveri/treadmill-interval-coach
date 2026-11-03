// The numbers on the dashboard. Plain TypeScript with no database in it, so a test can check it.

// One logged session, together with the workout it was run as.
export type SessionForStats = {
  id: string;
  run_date: string; // "2026-10-14"
  reps_completed: number;
  workouts: { rep_distance_m: number; rep_speed_kmh: number } | null;
};

export type ChartPoint = {
  id: string;
  runDate: string;
  label: string; // "Oct 14"
  meters: number;
};

export type DashboardStats = {
  sessionCount: number;
  totalHardMeters: number;
  averageRepSpeed: number | null; // km/h, null when there are no sessions
  points: ChartPoint[]; // oldest to newest, one per session
};

// Meters run hard in one session: reps finished × the workout's rep distance.
export function hardMeters(session: SessionForStats): number {
  return session.workouts ? session.reps_completed + session.workouts.rep_distance_m : 0;
}

// "Oct 14". Built from the parts so the day never shifts with time zones.
function shortDate(runDate: string): string {
  const [year, month, day] = runDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function calculateDashboard(sessions: SessionForStats[]): DashboardStats {
  const counted = sessions.filter((session) => session.workouts !== null);

  const points = counted
    .map((session) => ({
      id: session.id,
      runDate: session.run_date,
      label: shortDate(session.run_date),
      meters: hardMeters(session),
    }))
    .sort((a, b) => a.runDate.localeCompare(b.runDate) || a.id.localeCompare(b.id));

  const totalHardMeters = points.reduce((sum, point) => sum + point.meters, 0);

  const speedTotal = counted.reduce((sum, session) => sum + (session.workouts?.rep_speed_kmh ?? 0), 0);
  const averageRepSpeed = counted.length === 0 ? null : Math.round((speedTotal / counted.length) * 10) / 10;

  return { sessionCount: counted.length, totalHardMeters, averageRepSpeed, points };
}
