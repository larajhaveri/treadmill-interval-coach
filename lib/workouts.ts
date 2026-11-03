// The shape of one row in the workouts table.
export type Workout = {
  id: string;
  user_id: string;
  name: string;
  warmup_min: number | null;
  warmup_speed_kmh: number | null;
  reps: number;
  rep_distance_m: number;
  rep_speed_kmh: number;
  walk_sec: number;
  walk_speed_kmh: number | null;
  cooldown_min: number | null;
  cooldown_speed_kmh: number | null;
  notes: string | null;
  created_at: string;
};

// "5 × 600 m at 10.2 km/h, 90 s walk"
export function describeWorkout(w: Pick<Workout, "reps" | "rep_distance_m" | "rep_speed_kmh" | "walk_sec">) {
  return `${w.reps} × ${w.rep_distance_m} m at ${w.rep_speed_kmh} km/h, ${w.walk_sec} s walk`;
}

// Total meters run hard in one go through the workout (reps × rep distance).
export function hardDistanceMeters(w: Pick<Workout, "reps" | "rep_distance_m">) {
  return w.reps * w.rep_distance_m;
}

// "10 min at 8 km/h", or a dash when the runner left it blank.
export function describeSegment(minutes: number | null, speed: number | null) {
  if (minutes === null && speed === null) return "Not set";
  const time = minutes === null ? "" : `${minutes} min`;
  const pace = speed === null ? "" : `${speed} km/h`;
  return [time, pace].filter(Boolean).join(" at ");
}

// Long distances read better in kilometers: 800 m stays "800 m", 40600 becomes "40.6 km".
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  const km = parseFloat((meters / 1000).toFixed(2));
  return `${km.toLocaleString("en-US")} km`;
}
