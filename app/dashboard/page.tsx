import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateDashboard, type SessionForStats } from "@/lib/dashboard";
import { formatDistance } from "@/lib/workouts";
import DashboardChart from "./dashboard-chart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Each session comes with its workout's rep distance and speed.
  // Row-level security means this only returns the signed-in runner's own sessions.
  const { data } = await supabase
    .from("sessions")
    .select("id, run_date, reps_completed, workouts(rep_distance_m, rep_speed_kmh)")
    .returns<SessionForStats[]>();

  const stats = calculateDashboard(data ?? []);

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Dashboard</p>
        <h1>Are you building up?</h1>
        <p>Your hard running, session by session.</p>
      </section>

      {stats.sessionCount === 0 ? (
        <section className="card stack">
          <p className="muted">No sessions yet. Open a workout and log a session to see your numbers here.</p>
          <Link href="/" className="btn btn-red">
            Back to workouts
          </Link>
        </section>
      ) : (
        <>
          <section className="stats" aria-label="Summary">
            <div className="stat">
              <span className="stat-label">Sessions</span>
              <span className="stat-value">{stats.sessionCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Hard-rep distance</span>
              <span className="stat-value">{formatDistance(stats.totalHardMeters)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Average rep speed</span>
              <span className="stat-value">{stats.averageRepSpeed} km/h</span>
            </div>
          </section>

          <section className="card stack">
            <h2>Hard-rep distance per session</h2>
            <DashboardChart points={stats.points} />
            <details>
              <summary>View as a table</summary>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Hard-rep distance</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.points.map((point) => (
                    <tr key={point.id}>
                      <td>{point.runDate}</td>
                      <td>{formatDistance(point.meters)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
            <Link href="/" className="btn btn-plain">
              Back to workouts
            </Link>
          </section>
        </>
      )}
    </main>
  );
}
