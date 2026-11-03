import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Treadmill Interval Coach</p>
        <h1>Hi, {profile?.display_name ?? "runner"}!</h1>
        <p>You are signed in as {profile?.email ?? user.email}.</p>
      </section>
      <section className="card stack">
        <h2>Your workouts</h2>
        <p className="muted">Workouts you save will show up here.</p>
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
