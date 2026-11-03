import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { describeWorkout, type Workout } from "@/lib/workouts";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Every account is a row in the users table. Row-level security means this query
  // can only ever return the signed-in runner's own row.
  const { data: profile } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  // Row-level security means this only returns the signed-in runner's workouts.
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Workout[]>();

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Treadmill Interval Coach</p>
        <h1>Hi, {profile?.display_name ?? "runner"}!</h1>
        <p>You are signed in as {profile?.email ?? user.email}.</p>
      </section>
      <section className="card stack">
        <h2>Your workouts</h2>
        {workouts && workouts.length > 0 ? (
          <ul className="list">
            {workouts.map((w) => (
              <li key={w.id} className="list-item">
                <strong>{w.name}</strong>
                <span className="muted">{describeWorkout(w)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No workouts yet. Add your first one.</p>
        )}
        <Link href="/workouts/new" className="btn btn-red">
          Add a workout
        </Link>
        {!profile && (
          <p className="notice" role="alert">
            Your account row was not found. Please log out and back in.
          </p>
        )}
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-plain">
            Log out
          </button>
        </form>
      </section>
    </main>
  );
}
