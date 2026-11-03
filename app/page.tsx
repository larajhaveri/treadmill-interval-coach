import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Workout } from "@/lib/workouts";
import WorkoutList from "./workouts/workout-list";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showStarred = view === "starred";

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

  // Stars are a junction table: one row per (runner, workout). Row-level security
  // returns only the signed-in runner's stars.
  const { data: starRows } = await supabase.from("stars").select("workout_id");
  const starredIds = new Set((starRows ?? []).map((row) => row.workout_id as string));

  const visible = (workouts ?? []).filter((w) => !showStarred || starredIds.has(w.id));

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Treadmill Interval Coach</p>
        <h1>Hi, {profile?.display_name ?? "runner"}!</h1>
        <p>You are signed in as {profile?.email ?? user.email}.</p>
      </section>
      <section className="card stack">
        <h2>Your workouts</h2>
        <nav className="tabs" aria-label="Workout views">
          <Link href="/" className="tab" aria-current={showStarred ? undefined : "page"}>
            All ({workouts?.length ?? 0})
          </Link>
          <Link href="/?view=starred" className="tab" aria-current={showStarred ? "page" : undefined}>
            ★ Starred ({starredIds.size})
          </Link>
        </nav>
        <WorkoutList
          workouts={visible}
          starredIds={starredIds}
          emptyMessage={
            showStarred
              ? "No starred workouts yet. Tap the ☆ next to a workout to star it."
              : "No workouts yet. Add your first one."
          }
        />
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
