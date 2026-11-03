import Link from "next/link";
import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { describeSegment, describeWorkout, hardDistanceMeters } from "@/lib/workouts";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = await getWorkoutOrNotFound(id);

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Workout</p>
        <h1>{workout.name}</h1>
        <p>{describeWorkout(workout)}</p>
      </section>

      <section className="card stack">
        <dl className="facts">
          <div>
            <dt>Warm-up</dt>
            <dd>{describeSegment(workout.warmup_min, workout.warmup_speed_kmh)}</dd>
          </div>
          <div>
            <dt>Hard reps</dt>
            <dd>
              {workout.reps} × {workout.rep_distance_m} m at {workout.rep_speed_kmh} km/h
            </dd>
          </div>
          <div>
            <dt>Hard distance</dt>
            <dd>{hardDistanceMeters(workout)} m</dd>
          </div>
          <div>
            <dt>Walk break</dt>
            <dd>
              {workout.walk_sec} s{workout.walk_speed_kmh !== null ? ` at ${workout.walk_speed_kmh} km/h` : ""}
            </dd>
          </div>
          <div>
            <dt>Cool-down</dt>
            <dd>{describeSegment(workout.cooldown_min, workout.cooldown_speed_kmh)}</dd>
          </div>
          {workout.notes && (
            <div>
              <dt>Notes</dt>
              <dd>{workout.notes}</dd>
            </div>
          )}
        </dl>

        <div className="row">
          <Link href={`/workouts/${workout.id}/edit`} className="btn btn-red">
            Edit
          </Link>
          <Link href={`/workouts/${workout.id}/delete`} className="btn btn-plain">
            Delete
          </Link>
          <Link href="/" className="btn btn-plain">
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}
