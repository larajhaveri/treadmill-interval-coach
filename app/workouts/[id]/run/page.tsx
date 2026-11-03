import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { configFromWorkout } from "@/lib/run-plan";
import { describeWorkout } from "@/lib/workouts";
import RunPlayer from "./run-player";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = await getWorkoutOrNotFound(id);

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Run</p>
        <h1>{workout.name}</h1>
        <p>{describeWorkout(workout)}</p>
      </section>
      <RunPlayer config={configFromWorkout(workout)} workoutId={workout.id} />
    </main>
  );
}
