// Checks a submitted workout and returns friendly, per-field messages.
// This is plain TypeScript with no database in it, so it is easy to test.

export const FIELD_KEYS = [
  "name",
  "warmup_min",
  "warmup_speed_kmh",
  "reps",
  "rep_distance_m",
  "rep_speed_kmh",
  "walk_sec",
  "walk_speed_kmh",
  "cooldown_min",
  "cooldown_speed_kmh",
  "notes",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

// What the runner typed, exactly as typed (everything is text at this point).
export type WorkoutFields = Record<FieldKey, string>;

// One message per field that has a problem.
export type WorkoutErrors = Partial<Record<FieldKey, string>>;

// A workout that passed every check, ready for the database.
export type ParsedWorkout = {
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
};

// What the form gets back from a save attempt.
export type FormState = {
  errors: WorkoutErrors;
  // The runner's own typing, sent back so a mistake never wipes the form.
  values: WorkoutFields | null;
  saveFailed: boolean;
};

export const emptyFormState: FormState = { errors: {}, values: null, saveFailed: false };

export function readFields(formData: FormData): WorkoutFields {
  const fields = {} as WorkoutFields;
  for (const key of FIELD_KEYS) {
    fields[key] = String(formData.get(key) ?? "").trim();
  }
  return fields;
}

type NumberRule = {
  label: string; // used in the message, e.g. "Reps"
  min: number;
  max: number;
  whole?: boolean;
  required: boolean;
  unit?: string; // e.g. "km/h"
};

const NUMBER_RULES: Record<Exclude<FieldKey, "name" | "notes">, NumberRule> = {
  warmup_min: { label: "Warm-up minutes", min: 0, max: 120, required: false, unit: "minutes" },
  warmup_speed_kmh: { label: "Warm-up speed", min: 1, max: 30, required: false, unit: "km/h" },
  reps: { label: "Reps", min: 1, max: 50, whole: true, required: true },
  rep_distance_m: { label: "Rep distance", min: 50, max: 10000, whole: true, required: true, unit: "meters" },
  rep_speed_kmh: { label: "Rep speed", min: 1, max: 30, required: true, unit: "km/h" },
  walk_sec: { label: "Walk break", min: 0, max: 1800, whole: true, required: true, unit: "seconds" },
  walk_speed_kmh: { label: "Walk speed", min: 1, max: 30, required: false, unit: "km/h" },
  cooldown_min: { label: "Cool-down minutes", min: 0, max: 120, required: false, unit: "minutes" },
  cooldown_speed_kmh: { label: "Cool-down speed", min: 1, max: 30, required: false, unit: "km/h" },
};

// Returns a message if the text is not acceptable, or null if it is fine.
function checkNumber(text: string, rule: NumberRule): string | null {
  const unit = rule.unit ? ` ${rule.unit}` : "";
  const range = `between ${rule.min} and ${rule.max}${unit}`;

  if (text === "") {
    return rule.required ? `${rule.label} is needed. Enter a number ${range}.` : null;
  }

  const value = Number(text);
  if (!Number.isFinite(value)) {
    return `${rule.label} should be a number. Use digits only, like 10.`;
  }
  if (rule.whole && !Number.isInteger(value)) {
    return `${rule.label} should be a whole number (no decimals).`;
  }
  if (value < rule.min || value > rule.max) {
    return `${rule.label} should be ${range}.`;
  }
  return null;
}

export function validateWorkout(
  fields: WorkoutFields,
): { ok: true; workout: ParsedWorkout } | { ok: false; errors: WorkoutErrors } {
  const errors: WorkoutErrors = {};

  if (fields.name === "") {
    errors.name = "Give your workout a name, like 5 × 600 m at 10.2.";
  } else if (fields.name.length > 80) {
    errors.name = "That name is too long. Keep it under 80 characters.";
  }

  for (const key of Object.keys(NUMBER_RULES) as (keyof typeof NUMBER_RULES)[]) {
    const message = checkNumber(fields[key], NUMBER_RULES[key]);
    if (message) errors[key] = message;
  }

  if (fields.notes.length > 500) {
    errors.notes = "Notes are too long. Keep them under 500 characters.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const num = (key: keyof typeof NUMBER_RULES) => (fields[key] === "" ? null : Number(fields[key]));

  return {
    ok: true,
    workout: {
      name: fields.name,
      warmup_min: num("warmup_min"),
      warmup_speed_kmh: num("warmup_speed_kmh"),
      reps: Number(fields.reps),
      rep_distance_m: Number(fields.rep_distance_m),
      rep_speed_kmh: Number(fields.rep_speed_kmh),
      walk_sec: Number(fields.walk_sec),
      walk_speed_kmh: num("walk_speed_kmh"),
      cooldown_min: num("cooldown_min"),
      cooldown_speed_kmh: num("cooldown_speed_kmh"),
      notes: fields.notes || null,
    },
  };
}
