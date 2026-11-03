import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GoogleButton from "./google-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Treadmill Interval Coach</p>
        <h1>Run the workout. Skip the staring.</h1>
        <p>
          Sign in to save your interval workouts and hear when to speed up, slow down and
          finish.
        </p>
      </section>
      <section className="card stack">
        <h2>Sign up or log in</h2>
        <p className="muted">One tap. New here? Your account is created automatically.</p>
        {error && (
          <p className="notice" role="alert">
            Sign-in did not finish. Please try again.
          </p>
        )}
        <GoogleButton />
      </section>
    </main>
  );
}
