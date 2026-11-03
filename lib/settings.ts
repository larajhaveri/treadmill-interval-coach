// Countdown preferences (feature 10). Plain TypeScript with no database or browser in it,
// so the checking can be tested.

export const LEAD_OPTIONS = [10, 20, 30] as const;
export const WALK_COUNTDOWN_OPTIONS = [0, 5, 10] as const;
export const REP_COUNTDOWN_OPTIONS = [0, 5, 10, 15] as const;
export const ENCOURAGEMENT_OPTIONS = ["off", "light", "frequent"] as const;

export type Settings = {
  lead_sec: number;
  countdown_to_walk_sec: number;
  countdown_to_rep_sec: number;
  encouragement: (typeof ENCOURAGEMENT_OPTIONS)[number];
};

// What a runner gets before they save anything.
export const DEFAULT_SETTINGS: Settings = {
  lead_sec: 20,
  countdown_to_walk_sec: 0,
  countdown_to_rep_sec: 0,
  encouragement: "light",
};

export type SettingsErrors = Partial<Record<keyof Settings, string>>;

export type SettingsFormState = { errors: SettingsErrors; saved: boolean; saveFailed: boolean };
export const emptySettingsFormState: SettingsFormState = { errors: {}, saved: false, saveFailed: false };

function pickNumber(raw: unknown, allowed: readonly number[]): number | null {
  const text = String(raw ?? "").trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return allowed.includes(value) ? value : null;
}

// Every box is a drop-down, so a wrong value only arrives if someone edits the page by hand.
// It is still checked on the server, and answered with a plain message.
export function validateSettings(
  input: Record<keyof Settings, unknown>,
): { ok: true; settings: Settings } | { ok: false; errors: SettingsErrors } {
  const errors: SettingsErrors = {};

  const lead = pickNumber(input.lead_sec, LEAD_OPTIONS);
  if (lead === null) errors.lead_sec = "Pick 10, 20 or 30 seconds.";

  const toWalk = pickNumber(input.countdown_to_walk_sec, WALK_COUNTDOWN_OPTIONS);
  if (toWalk === null) errors.countdown_to_walk_sec = "Pick off, 5 or 10 seconds.";

  const toRep = pickNumber(input.countdown_to_rep_sec, REP_COUNTDOWN_OPTIONS);
  if (toRep === null) errors.countdown_to_rep_sec = "Pick off, 5, 10 or 15 seconds.";

  const encouragement = String(input.encouragement ?? "");
  if (!(ENCOURAGEMENT_OPTIONS as readonly string[]).includes(encouragement)) {
    errors.encouragement = "Pick off, light or frequent.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    settings: {
      lead_sec: lead as number,
      countdown_to_walk_sec: toWalk as number,
      countdown_to_rep_sec: toRep as number,
      encouragement: encouragement as Settings["encouragement"],
    },
  };
}
