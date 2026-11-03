import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createWorkout } from "../actions";
import WorkoutForm from "../workout-form";

export default async function NewWorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">New workout</p>
        <h1>Build your intervals</h1>
        <p>Fill in the numbers from your treadmill. Speeds are in km/h.</p>
      </section>
      <WorkoutForm action={createWorkout} submitLabel="Save workout" cancelHref="/" />
    </main>
  );
}
