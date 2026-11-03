import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createWorkout } from "../actions";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">New workout</p>
        <h1>Build your intervals</h1>
        <p>Fill in the numbers from your treadmill. Speeds are in km/h.</p>
      </section>

      <form action={createWorkout} className="card stack">
        {error && (
          <p className="notice" role="alert">
            Could not save that workout. Please check the numbers and try again.
          </p>
        )}

        <label className="field">
          Workout name
          <input name="name" type="text" placeholder="5 × 600 m at 10.2" />
        </label>

        <h2>Warm-up</h2>
        <div className="row">
          <label className="field">
            Minutes
            <input name="warmup_min" type="number" step="0.5" inputMode="decimal" placeholder="10" />
          </label>
          <label className="field">
            Speed (km/h)
            <input name="warmup_speed_kmh" type="number" step="0.1" inputMode="decimal" placeholder="8" />
          </label>
        </div>

        <h2>Hard reps</h2>
        <div className="row">
          <label className="field">
            Reps
            <input name="reps" type="number" step="1" inputMode="numeric" placeholder="5" />
          </label>
          <label className="field">
            Distance (m)
            <input name="rep_distance_m" type="number" step="50" inputMode="numeric" placeholder="600" />
          </label>
        </div>
        <label className="field">
          Rep speed (km/h)
          <input name="rep_speed_kmh" type="number" step="0.1" inputMode="decimal" placeholder="10.2" />
        </label>

        <h2>Walk break</h2>
        <div className="row">
          <label className="field">
            Seconds
            <input name="walk_sec" type="number" step="5" inputMode="numeric" placeholder="90" />
          </label>
          <label className="field">
            Speed (km/h)
            <input name="walk_speed_kmh" type="number" step="0.1" inputMode="decimal" placeholder="5" />
          </label>
        </div>

        <h2>Cool-down</h2>
        <div className="row">
          <label className="field">
            Minutes
            <input name="cooldown_min" type="number" step="0.5" inputMode="decimal" placeholder="10" />
          </label>
          <label className="field">
            Speed (km/h)
            <input name="cooldown_speed_kmh" type="number" step="0.1" inputMode="decimal" placeholder="7" />
          </label>
        </div>

        <label className="field">
          Notes (optional)
          <textarea name="notes" rows={3} placeholder="Incline 1%" />
        </label>

        <div className="row">
          <button type="submit" className="btn btn-red">
            Save workout
          </button>
          <Link href="/" className="btn btn-plain">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
