import Link from "next/link";
import type { Workout } from "@/lib/workouts";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  workout?: Partial<Workout>;
  showError?: boolean;
  submitLabel: string;
  cancelHref: string;
};

// The workout form, shared by "new workout" and "edit workout".
export default function WorkoutForm({ action, workout, showError, submitLabel, cancelHref }: Props) {
  return (
    <form action={action} className="card stack">
      {showError && (
        <p className="notice" role="alert">
          Could not save that workout. Please check the numbers and try again.
        </p>
      )}

      <label className="field">
        Workout name
        <input name="name" type="text" defaultValue={workout?.name ?? ""} placeholder="5 × 600 m at 10.2" />
      </label>

      <h2>Warm-up</h2>
      <div className="row">
        <label className="field">
          Minutes
          <input name="warmup_min" type="number" step="0.5" inputMode="decimal" defaultValue={workout?.warmup_min ?? ""} placeholder="10" />
        </label>
        <label className="field">
          Speed (km/h)
          <input name="warmup_speed_kmh" type="number" step="0.1" inputMode="decimal" defaultValue={workout?.warmup_speed_kmh ?? ""} placeholder="8" />
        </label>
      </div>

      <h2>Hard reps</h2>
      <div className="row">
        <label className="field">
          Reps
          <input name="reps" type="number" step="1" inputMode="numeric" defaultValue={workout?.reps ?? ""} placeholder="5" />
        </label>
        <label className="field">
          Distance (m)
          <input name="rep_distance_m" type="number" step="50" inputMode="numeric" defaultValue={workout?.rep_distance_m ?? ""} placeholder="600" />
        </label>
      </div>
      <label className="field">
        Rep speed (km/h)
        <input name="rep_speed_kmh" type="number" step="0.1" inputMode="decimal" defaultValue={workout?.rep_speed_kmh ?? ""} placeholder="10.2" />
      </label>

      <h2>Walk break</h2>
      <div className="row">
        <label className="field">
          Seconds
          <input name="walk_sec" type="number" step="5" inputMode="numeric" defaultValue={workout?.walk_sec ?? ""} placeholder="90" />
        </label>
        <label className="field">
          Speed (km/h)
          <input name="walk_speed_kmh" type="number" step="0.1" inputMode="decimal" defaultValue={workout?.walk_speed_kmh ?? ""} placeholder="5" />
        </label>
      </div>

      <h2>Cool-down</h2>
      <div className="row">
        <label className="field">
          Minutes
          <input name="cooldown_min" type="number" step="0.5" inputMode="decimal" defaultValue={workout?.cooldown_min ?? ""} placeholder="10" />
        </label>
        <label className="field">
          Speed (km/h)
          <input name="cooldown_speed_kmh" type="number" step="0.1" inputMode="decimal" defaultValue={workout?.cooldown_speed_kmh ?? ""} placeholder="7" />
        </label>
      </div>

      <label className="field">
        Notes (optional)
        <textarea name="notes" rows={3} defaultValue={workout?.notes ?? ""} placeholder="Incline 1%" />
      </label>

      <div className="row">
        <button type="submit" className="btn btn-red">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="btn btn-plain">
          Cancel
        </Link>
      </div>
    </form>
  );
}
