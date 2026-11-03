import Link from "next/link";
import { getWorkoutOrNotFound } from "@/lib/get-workout";
import { createClient } from "@/lib/supabase/server";
import StarButton from "../star-button";
import { EFFORT_LABELS, formatRunDate, hardestLabel, type Session } from "@/lib/sessions";
import { describeSegment, describeWorkout, hardDistanceMeters } from "@/lib/workouts";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workout = await getWorkoutOrNotFound(id);

  const supabase = await createClient();
  const { data: star } = await supabase.from("stars").select("workout_id").eq("workout_id", workout.id).maybeSingle();
  const starred = Boolean(star);

  // Row-level security returns only this runner's sessions.
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("workout_id", workout.id)
    .order("run_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<Session[]>();

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
          <Link href={`/workouts/${workout.id}/run`} className="btn btn-red">
            Start run
          </Link>
          <Link href={`/workouts/${workout.id}/edit`} className="btn btn-plain">
            Edit
          </Link>
          <Link href={`/workouts/${workout.id}/delete`} className="btn btn-plain">
            Delete
          </Link>
          <StarButton workoutId={workout.id} starred={starred} labeled />
          <Link href="/" className="btn btn-plain">
            Back
          </Link>
        </div>
      </section>

      <section className="card stack">
        <h2>Sessions</h2>
        {sessions && sessions.length > 0 ? (
          <ul className="list">
            {sessions.map((session) => (
              <li key={session.id} className="list-item">
                <strong>{formatRunDate(session.run_date)}</strong>
                <span className="muted">
                  {session.reps_completed} of {workout.reps} reps
                  {session.effort !== null ? ` · effort ${session.effort}/5 (${EFFORT_LABELS[session.effort]})` : ""}
                  {session.hardest_part ? ` · hardest: ${hardestLabel(session.hardest_part).toLowerCase()}` : ""}
                </span>
                {session.notes && <span className="muted">{session.notes}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No sessions logged yet. Finished a run? Log it.</p>
        )}
        <Link href={`/workouts/${workout.id}/log`} className="btn btn-red">
          Log a session
        </Link>
      </section>
    </main>
  );
}
