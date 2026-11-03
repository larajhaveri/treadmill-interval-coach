import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { updateWorkout } from "../../actions";
import WorkoutForm from "../../workout-form";

export default async function EditWorkoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
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
        showError={Boolean(error)}
        submitLabel="Save changes"
        cancelHref={`/workouts/${workout.id}`}
      />
    </main>
  );
}
