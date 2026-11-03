"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateSettings, type SettingsFormState } from "@/lib/settings";

// Saves the signed-in runner's countdown preferences (one row per runner, so this is an upsert).
export async function saveSettings(_previous: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = validateSettings({
    lead_sec: formData.get("lead_sec"),
    countdown_to_walk_sec: formData.get("countdown_to_walk_sec"),
    countdown_to_rep_sec: formData.get("countdown_to_rep_sec"),
    encouragement: formData.get("encouragement"),
  });
  if (!result.ok) return { errors: result.errors, saved: false, saveFailed: false };

  // Row-level security only lets this write the runner's own row.
  const { error } = await supabase
    .from("settings")
    .upsert({ user_id: user.id, ...result.settings, updated_at: new Date().toISOString() });
  if (error) return { errors: {}, saved: false, saveFailed: true };

  return { errors: {}, saved: true, saveFailed: false };
}
