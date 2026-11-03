import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { updateWorkout } from "../../actions";
import WorkoutForm from "../../workout-form";

export default async function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = await getWorkoutOrNotFound(id);

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Edit workout</p>
        <h1>{workout.name}</h1>
        <p>Change any number, then save.</p>
      </section>
      <WorkoutForm
        action={updateWorkout.bind(null, workout.id)}
        workout={workout}
        submitLabel="Save changes"
        cancelHref={`/workouts/${workout.id}`}
      />
    </main>
  );
}
