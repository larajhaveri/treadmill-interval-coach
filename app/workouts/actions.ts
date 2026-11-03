"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Turns an empty form box into null, otherwise a number.
function numberOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text === "" ? null : Number(text);
}

export async function createWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("workouts").insert({
    user_id: user.id,
    name: String(formData.get("name") ?? "").trim(),
    warmup_min: numberOrNull(formData.get("warmup_min")),
    warmup_speed_kmh: numberOrNull(formData.get("warmup_speed_kmh")),
    reps: numberOrNull(formData.get("reps")),
    rep_distance_m: numberOrNull(formData.get("rep_distance_m")),
    rep_speed_kmh: numberOrNull(formData.get("rep_speed_kmh")),
    walk_sec: numberOrNull(formData.get("walk_sec")),
    walk_speed_kmh: numberOrNull(formData.get("walk_speed_kmh")),
    cooldown_min: numberOrNull(formData.get("cooldown_min")),
    cooldown_speed_kmh: numberOrNull(formData.get("cooldown_speed_kmh")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) {
    redirect("/workouts/new?error=save");
  }

  revalidatePath("/");
  redirect("/");
}
