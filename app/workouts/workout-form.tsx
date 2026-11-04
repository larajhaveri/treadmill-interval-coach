"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Workout } from "@/lib/workouts";
import { emptyFormState, type FieldKey, type FormState } from "@/lib/validate-workout";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  workout?: Partial<Workout>;
  submitLabel: string;
  cancelHref: string;
};

// The workout form, shared by "new workout" and "edit workout".
export default function WorkoutForm({ action, workout, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed save, jump to the first box that needs fixing.
  useEffect(() => {
    if (Object.keys(state.errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Show what the runner just typed if a save failed; otherwise the saved workout.
  function valueOf(key: FieldKey) {
    if (state.values) return state.values[key];
    const saved = workout?.[key];
    return saved === null || saved === undefined ? "" : String(saved);
  }

  // One labelled box with its error message underneath.
  function field(key: FieldKey, label: string, inputProps: React.InputHTMLAttributes<HTMLInputElement>) {
    const error = state.errors[key];
    return (
      <label className="field">
        {label}
        <input
          name={key}
          defaultValue={valueOf(key)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${key}-error` : undefined}
          {...inputProps}
        />
        {error && (
          <span id={`${key}-error`} className="field-error">
            {error}
          </span>
        )}
      </label>
    );
  }

  const notesError = state.errors.notes;

  return (
    // noValidate turns off the browser's pop-up bubbles so our own friendly messages show instead.
    <form ref={formRef} action={formAction} noValidate className="card stack">
      {state.saveFailed && (
        <p className="notice" role="alert">
          Something went wrong saving that workout. Nothing was lost, so please try again.
        </p>
      )}
      {Object.keys(state.errors).length > 0 && (
        <p className="notice" role="alert">
          Almost there. Fix the boxes marked below and save again.
        </p>
      )}

      {field("name", "Workout name", { type: "text", placeholder: "5 × 600 m at 10.2" })}

      <h2>Warm-up</h2>
      <p className="muted">Optional. Leave both boxes blank for no warm-up.</p>
      <div className="row">
        {field("warmup_min", "Length (minutes)", { type: "number", step: "0.5", inputMode: "decimal", placeholder: "e.g. 10" })}
        {field("warmup_speed_kmh", "Speed (km/h)", { type: "number", step: "0.1", inputMode: "decimal", placeholder: "e.g. 8" })}
      </div>

      <h2>Hard reps</h2>
      <div className="row">
        {field("reps", "Reps", { type: "number", step: "1", inputMode: "numeric", placeholder: "e.g. 5" })}
        {field("rep_distance_m", "Distance (m)", { type: "number", step: "50", inputMode: "numeric", placeholder: "e.g. 600" })}
      </div>
      {field("rep_speed_kmh", "Rep speed (km/h)", { type: "number", step: "0.1", inputMode: "decimal", placeholder: "e.g. 10.2" })}

      <h2>Walk break</h2>
      <p className="muted">How long you walk between reps. This one is in seconds.</p>
      <div className="row">
        {field("walk_sec", "Length (seconds)", { type: "number", step: "5", inputMode: "numeric", placeholder: "e.g. 90" })}
        {field("walk_speed_kmh", "Speed (km/h)", { type: "number", step: "0.1", inputMode: "decimal", placeholder: "e.g. 5" })}
      </div>

      <h2>Cool-down</h2>
      <p className="muted">Optional. Leave both boxes blank for no cool-down.</p>
      <div className="row">
        {field("cooldown_min", "Length (minutes)", { type: "number", step: "0.5", inputMode: "decimal", placeholder: "e.g. 10" })}
        {field("cooldown_speed_kmh", "Speed (km/h)", { type: "number", step: "0.1", inputMode: "decimal", placeholder: "e.g. 7" })}
      </div>

      <label className="field">
        Notes (optional)
        <textarea
          name="notes"
          rows={3}
          defaultValue={valueOf("notes")}
          placeholder="Incline 1%"
          aria-invalid={notesError ? true : undefined}
          aria-describedby={notesError ? "notes-error" : undefined}
        />
        {notesError && (
          <span id="notes-error" className="field-error">
            {notesError}
          </span>
        )}
      </label>

      <div className="row">
        <button type="submit" className="btn btn-red" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="btn btn-plain">
          Cancel
        </Link>
      </div>
    </form>
  );
}
