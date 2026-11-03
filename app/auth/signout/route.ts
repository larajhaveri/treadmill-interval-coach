import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Log out: end the session, then go back to the login page.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
