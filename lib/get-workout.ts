import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Workout } from "@/lib/workouts";

// Loads one workout for the signed-in runner. Row-level security means another
// runner's workout comes back empty, so it shows "not found" instead of leaking.
export async function getWorkoutOrNotFound(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .maybeSingle<Workout>();

  if (error || !data) notFound();
  return data;
}
