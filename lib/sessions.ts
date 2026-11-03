// The shape of one row in the sessions table, plus the "what was hardest" choices.

export const HARDEST_PARTS = [
  { value: "breathing", label: "Breathing" },
  { value: "legs", label: "Legs" },
  { value: "mental", label: "Mental (my head)" },
  { value: "stitch or stomach", label: "Stitch or stomach" },
  { value: "pace too fast", label: "Pace was too fast" },
  { value: "nothing", label: "Nothing, it felt good" },
] as const;

export type HardestPart = (typeof HARDEST_PARTS)[number]["value"];

export type Session = {
  id: string;
  user_id: string;
  workout_id: string;
  run_date: string; // "2026-10-27"
  reps_completed: number;
  effort: number | null;
  hardest_part: string | null;
  notes: string | null;
  created_at: string;
};

export const EFFORT_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Steady",
  3: "Hard",
  4: "Very hard",
  5: "All out",
};

export function hardestLabel(value: string | null) {
  return HARDEST_PARTS.find((part) => part.value === value)?.label ?? value ?? "";
}

// "Oct 27, 2026". Built from the parts so the day never shifts with time zones.
export function formatRunDate(runDate: string) {
  const [year, month, day] = runDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
