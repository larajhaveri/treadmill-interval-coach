import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/settings";

// The signed-in runner's settings, or the defaults when they have not saved any yet.
// Row-level security means this can only ever return their own row.
export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("lead_sec, countdown_to_walk_sec, countdown_to_rep_sec, encouragement")
    .maybeSingle<Settings>();
  return data ?? DEFAULT_SETTINGS;
}
