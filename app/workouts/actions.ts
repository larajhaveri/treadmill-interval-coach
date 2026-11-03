"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Turns an empty form box into null, otherwise a number.
function numberOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text === "" ? null : Number(text);
}

// Reads every workout field out of the submitted form.
function workoutFromForm(formData: FormData) {
  return {
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
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createWorkout(formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("workouts")
    .insert({ user_id: user.id, ...workoutFromForm(formData) });

  if (error) redirect("/workouts/new?error=save");

  revalidatePath("/");
  redirect("/");
}

export async function updateWorkout(id: string, formData: FormData) {
  const { supabase } = await requireUser();

  // Row-level security makes this change only the signed-in runner's own row.
  const { error } = await supabase
    .from("workouts")
    .update(workoutFromForm(formData))
    .eq("id", id);

  if (error) redirect(`/workouts/${id}/edit?error=save`);

  revalidatePath("/");
  revalidatePath(`/workouts/${id}`);
  redirect(`/workouts/${id}`);
}

export async function deleteWorkout(id: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("workouts").delete().eq("id", id);

  if (error) redirect(`/workouts/${id}/delete?error=delete`);

  revalidatePath("/");
  redirect("/");
}
