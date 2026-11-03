import Link from "next/link";
import { describeWorkout, type Workout } from "@/lib/workouts";
import StarButton from "./star-button";

// The list of workouts on the home page, each with a star toggle.
export default function WorkoutList({
  workouts,
  starredIds,
  emptyMessage,
}: {
  workouts: Workout[];
  starredIds: Set<string>;
  emptyMessage: string;
}) {
  if (workouts.length === 0) return <p className="muted">{emptyMessage}</p>;

  return (
    <ul className="list">
      {workouts.map((w) => (
        <li key={w.id} className="list-item list-item-star">
          <Link href={`/workouts/${w.id}`} className="list-link">
            <strong>{w.name}</strong>
            <span className="muted">{describeWorkout(w)}</span>
          </Link>
          <StarButton workoutId={w.id} starred={starredIds.has(w.id)} />
        </li>
      ))}
    </ul>
  );
}
