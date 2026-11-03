"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { EFFORT_LABELS, HARDEST_PARTS } from "@/lib/sessions";
import {
  emptySessionFormState,
  type SessionFieldKey,
  type SessionFormState,
} from "@/lib/validate-session";

type Props = {
  action: (previous: SessionFormState, formData: FormData) => Promise<SessionFormState>;
  plannedReps: number;
  cancelHref: string;
};

// Today's date in the runner's own time zone, as YYYY-MM-DD.
function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// The "log a session" form with the post-run survey.
export default function SessionForm({ action, plannedReps, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, emptySessionFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // Fill in today's date on the runner's own device (the server doesn't know their time zone).
  useEffect(() => {
    if (dateRef.current && dateRef.current.value === "") dateRef.current.value = localToday();
  }, []);

  // After a failed save, jump to the first thing that needs fixing.
  useEffect(() => {
    if (Object.keys(state.errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  const valueOf = (key: SessionFieldKey, fallback = "") => (state.values ? state.values[key] : fallback);
  const error = (key: SessionFieldKey) => state.errors[key];
  const errorId = (key: SessionFieldKey) => `${key}-error`;
  const invalid = (key: SessionFieldKey) => ({
    "aria-invalid": error(key) ? (true as const) : undefined,
    "aria-describedby": error(key) ? errorId(key) : undefined,
  });
  const message = (key: SessionFieldKey) =>
    error(key) && (
      <span id={errorId(key)} className="field-error">
        {error(key)}
      </span>
    );

  return (
    <form ref={formRef} action={formAction} noValidate className="card stack">
      {state.saveFailed && (
        <p className="notice" role="alert">
          Something went wrong saving that session. Nothing was lost, so please try again.
        </p>
      )}
      {Object.keys(state.errors).length > 0 && (
        <p className="notice" role="alert">
          Almost there. Fix the boxes marked below and save again.
        </p>
      )}

      <div className="row">
        <label className="field">
          Date
          <input name="run_date" type="date" ref={dateRef} defaultValue={valueOf("run_date")} {...invalid("run_date")} />
          {message("run_date")}
        </label>
        <label className="field">
          Reps finished
          <input
            name="reps_completed"
            type="number"
            step="1"
            inputMode="numeric"
            defaultValue={valueOf("reps_completed", String(plannedReps))}
            {...invalid("reps_completed")}
          />
          {message("reps_completed")}
        </label>
      </div>

      <fieldset className={error("effort") ? "scale scale-invalid" : "scale"} aria-describedby={error("effort") ? errorId("effort") : undefined}>
        <legend>How hard did it feel?</legend>
        <div className="scale-options">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="scale-option">
              <input
                type="radio"
                name="effort"
                value={n}
                defaultChecked={valueOf("effort") === String(n)}
                {...(n === 1 ? invalid("effort") : {})}
              />
              <span>
                <strong>{n}</strong>
                <small>{EFFORT_LABELS[n]}</small>
              </span>
            </label>
          ))}
        </div>
        {message("effort")}
      </fieldset>

      <label className="field">
        What was hardest?
        <select name="hardest_part" defaultValue={valueOf("hardest_part")} {...invalid("hardest_part")}>
          <option value="">Choose one…</option>
          {HARDEST_PARTS.map((part) => (
            <option key={part.value} value={part.value}>
              {part.label}
            </option>
          ))}
        </select>
        {message("hardest_part")}
      </label>

      <label className="field">
        Notes (optional)
        <textarea
          name="notes"
          rows={3}
          defaultValue={valueOf("notes")}
          placeholder="Numbers only, like the treadmill incline"
          {...invalid("notes")}
        />
        {message("notes")}
      </label>

      <div className="row">
        <button type="submit" className="btn btn-red" disabled={pending}>
          {pending ? "Saving…" : "Save session"}
        </button>
        <Link href={cancelHref} className="btn btn-plain">
          Cancel
        </Link>
      </div>
    </form>
  );
}
