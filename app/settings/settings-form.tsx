"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  ENCOURAGEMENT_OPTIONS,
  LEAD_OPTIONS,
  REP_COUNTDOWN_OPTIONS,
  WALK_COUNTDOWN_OPTIONS,
  emptySettingsFormState,
  type Settings,
  type SettingsFormState,
} from "@/lib/settings";

type Props = {
  action: (previous: SettingsFormState, formData: FormData) => Promise<SettingsFormState>;
  current: Settings;
};

const secondsLabel = (n: number) => (n === 0 ? "Off" : `${n} seconds`);

export default function SettingsForm({ action, current }: Props) {
  const [state, formAction, pending] = useActionState(action, emptySettingsFormState);

  const message = (key: keyof Settings) =>
    state.errors[key] && (
      <span id={`${key}-error`} className="field-error">
        {state.errors[key]}
      </span>
    );
  const invalid = (key: keyof Settings) => ({
    "aria-invalid": state.errors[key] ? (true as const) : undefined,
    "aria-describedby": state.errors[key] ? `${key}-error` : undefined,
  });

  return (
    <form action={formAction} className="card stack">
      {state.saveFailed && (
        <p className="notice" role="alert">
          Sorry, your settings did not save. Please try again.
        </p>
      )}
      {state.saved && (
        <p className="notice" role="status">
          Saved. These settings are used the next time you press Start.
        </p>
      )}

      <label className="field">
        Heads-up before each change
        <select name="lead_sec" defaultValue={String(current.lead_sec)} {...invalid("lead_sec")}>
          {LEAD_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} seconds before
            </option>
          ))}
        </select>
        {message("lead_sec")}
      </label>

      <label className="field">
        Countdown before a walk or the cool-down
        <select name="countdown_to_walk_sec" defaultValue={String(current.countdown_to_walk_sec)} {...invalid("countdown_to_walk_sec")}>
          {WALK_COUNTDOWN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {secondsLabel(n)}
            </option>
          ))}
        </select>
        {message("countdown_to_walk_sec")}
      </label>

      <label className="field">
        Countdown before the next rep
        <select name="countdown_to_rep_sec" defaultValue={String(current.countdown_to_rep_sec)} {...invalid("countdown_to_rep_sec")}>
          {REP_COUNTDOWN_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {secondsLabel(n)}
            </option>
          ))}
        </select>
        {message("countdown_to_rep_sec")}
      </label>

      <label className="field">
        Encouragement
        <select name="encouragement" defaultValue={current.encouragement} {...invalid("encouragement")}>
          {ENCOURAGEMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "off" ? "Off" : option === "light" ? "Light" : "Frequent"}
            </option>
          ))}
        </select>
        {message("encouragement")}
      </label>

      <button type="submit" className="btn btn-red" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </button>
      <Link href="/" className="btn btn-plain">
        Back to workouts
      </Link>
    </form>
  );
}
