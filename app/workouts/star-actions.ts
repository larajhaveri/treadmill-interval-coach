"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Stars or un-stars one workout for the signed-in runner.
// The page re-renders in place afterwards, so there is no redirect.
export async function setStar(workoutId: string, shouldStar: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (shouldStar) {
    // Row-level security refuses this unless the workout is the runner's own.
    // A duplicate star is harmless: the pair (user_id, workout_id) is the primary key.
    await supabase.from("stars").upsert({ user_id: user.id, workout_id: workoutId }, { ignoreDuplicates: true });
  } else {
    await supabase.from("stars").delete().eq("user_id", user.id).eq("workout_id", workoutId);
  }

  revalidatePath("/");
  revalidatePath(`/workouts/${workoutId}`);
}
