// Checks a submitted session and returns friendly, per-field messages.
// Plain TypeScript with no database in it, so it is easy to test.

import { HARDEST_PARTS } from "./sessions";

export const SESSION_FIELD_KEYS = ["run_date", "reps_completed", "effort", "hardest_part", "notes"] as const;

export type SessionFieldKey = (typeof SESSION_FIELD_KEYS)[number];
export type SessionFields = Record<SessionFieldKey, string>;
export type SessionErrors = Partial<Record<SessionFieldKey, string>>;

export type ParsedSession = {
  run_date: string;
  reps_completed: number;
  effort: number;
  hardest_part: string;
  notes: string | null;
};

export type SessionFormState = {
  errors: SessionErrors;
  values: SessionFields | null; // what the runner typed, sent back so a mistake never wipes the form
  saveFailed: boolean;
};

export const emptySessionFormState: SessionFormState = { errors: {}, values: null, saveFailed: false };

export function readSessionFields(formData: FormData): SessionFields {
  const fields = {} as SessionFields;
  for (const key of SESSION_FIELD_KEYS) fields[key] = String(formData.get(key) ?? "").trim();
  return fields;
}

// True only for a real calendar date written as YYYY-MM-DD (so 2026-02-31 fails).
function isRealDate(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// "today" is passed in so tests can fix it. The server clock is UTC, so a runner in the
// evening in California is already "tomorrow" there; we allow one day ahead to avoid a false error.
export function validateSession(
  fields: SessionFields,
  today: Date = new Date(),
): { ok: true; session: ParsedSession } | { ok: false; errors: SessionErrors } {
  const errors: SessionErrors = {};

  if (fields.run_date === "") {
    errors.run_date = "Pick the date you ran.";
  } else if (!isRealDate(fields.run_date)) {
    errors.run_date = "That date doesn't look right. Use the date picker.";
  } else {
    const latest = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (fields.run_date > latest) errors.run_date = "That date is in the future. Pick the day you ran.";
    else if (fields.run_date < "2020-01-01") errors.run_date = "That date is too long ago. Check the year.";
  }

  if (fields.reps_completed === "") {
    errors.reps_completed = "Enter how many hard reps you finished, from 1 to 50.";
  } else {
    const reps = Number(fields.reps_completed);
    if (!Number.isFinite(reps)) errors.reps_completed = "Reps finished should be a number. Use digits only, like 5.";
    else if (!Number.isInteger(reps)) errors.reps_completed = "Reps finished should be a whole number (no decimals).";
    else if (reps < 1 || reps > 50) errors.reps_completed = "Reps finished should be between 1 and 50.";
  }

  if (fields.effort === "") {
    errors.effort = "Pick how hard it felt, from 1 (easy) to 5 (all out).";
  } else if (!["1", "2", "3", "4", "5"].includes(fields.effort)) {
    errors.effort = "Effort should be 1, 2, 3, 4 or 5.";
  }

  if (fields.hardest_part === "") {
    errors.hardest_part = "Pick what was hardest, or choose Nothing.";
  } else if (!HARDEST_PARTS.some((part) => part.value === fields.hardest_part)) {
    errors.hardest_part = "Pick one of the choices in the list.";
  }

  if (fields.notes.length > 500) errors.notes = "Notes are too long. Keep them under 500 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    session: {
      run_date: fields.run_date,
      reps_completed: Number(fields.reps_completed),
      effort: Number(fields.effort),
      hardest_part: fields.hardest_part,
      notes: fields.notes || null,
    },
  };
}
