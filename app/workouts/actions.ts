"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { readFields, validateWorkout, type FormState } from "@/lib/validate-workout";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

// Both save actions return a FormState when something is wrong, and redirect when it worked.
export async function createWorkout(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();

  const fields = readFields(formData);
  const result = validateWorkout(fields);
  if (!result.ok) return { errors: result.errors, values: fields, saveFailed: false };

  const { error } = await supabase.from("workouts").insert({ user_id: user.id, ...result.workout });
  if (error) return { errors: {}, values: fields, saveFailed: true };

  revalidatePath("/");
  redirect("/");
}

export async function updateWorkout(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();

  const fields = readFields(formData);
  const result = validateWorkout(fields);
  if (!result.ok) return { errors: result.errors, values: fields, saveFailed: false };

  // Row-level security makes this change only the signed-in runner's own row.
  const { error } = await supabase.from("workouts").update(result.workout).eq("id", id);
  if (error) return { errors: {}, values: fields, saveFailed: true };

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
