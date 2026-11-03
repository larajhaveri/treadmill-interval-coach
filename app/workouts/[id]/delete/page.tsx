import Link from "next/link";
import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { describeWorkout } from "@/lib/workouts";
import { deleteWorkout } from "../../actions";

export default async function DeleteWorkoutPage({
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
        <p className="kicker">Delete workout</p>
        <h1>Are you sure?</h1>
        <p>
          This permanently deletes <strong>{workout.name}</strong> ({describeWorkout(workout)}). You can&apos;t
          undo it.
        </p>
      </section>
      <section className="card stack">
        {error && (
          <p className="notice" role="alert">
            Could not delete that workout. Please try again.
          </p>
        )}
        <form action={deleteWorkout.bind(null, workout.id)} className="row">
          <button type="submit" className="btn btn-red">
            Yes, delete it
          </button>
          <Link href={`/workouts/${workout.id}`} className="btn btn-plain">
            No, keep it
          </Link>
        </form>
      </section>
    </main>
  );
}
