"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { readSessionFields, validateSession, type SessionFormState } from "@/lib/validate-session";

// Saves one finished run of a workout for the signed-in runner.
// Returns messages when something is wrong, and goes back to the workout when it worked.
export async function logSession(
  workoutId: string,
  _previous: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = readSessionFields(formData);
  const result = validateSession(fields);
  if (!result.ok) return { errors: result.errors, values: fields, saveFailed: false };

  // Row-level security refuses this unless the workout is the runner's own.
  const { error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, workout_id: workoutId, ...result.session });
  if (error) return { errors: {}, values: fields, saveFailed: true };

  revalidatePath(`/workouts/${workoutId}`);
  redirect(`/workouts/${workoutId}`);
}
