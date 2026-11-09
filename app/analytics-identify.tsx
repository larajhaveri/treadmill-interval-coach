"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { createClient } from "@/lib/supabase/client";

// Tells PostHog who is signed in, using only the Supabase user id (a random id, never the email or name),
// and clears it when the runner logs out. It renders nothing.
export default function AnalyticsIdentify() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        const id = session?.user?.id;
        if (id) {
          if (posthog.get_distinct_id() !== id) posthog.identify(id);
        } else if (posthog.get_property("$user_state") === "identified") {
          posthog.reset();
        }
      } catch {
        // analytics is never worth breaking the app for
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
