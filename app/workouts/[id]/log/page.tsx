import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { describeWorkout } from "@/lib/workouts";
import { logSession } from "../../session-actions";
import SessionForm from "./session-form";

export default async function LogSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = await getWorkoutOrNotFound(id);

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Log a session</p>
        <h1>{workout.name}</h1>
        <p>{describeWorkout(workout)}</p>
      </section>
      <SessionForm
        action={logSession.bind(null, workout.id)}
        plannedReps={workout.reps}
        cancelHref={`/workouts/${workout.id}`}
      />
    </main>
  );
}
