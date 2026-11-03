"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleButton() {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  async function signIn() {
    setBusy(true);
    setProblem("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setProblem("Could not start Google sign-in. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <button type="button" className="btn btn-red" onClick={signIn} disabled={busy}>
        {busy ? "Opening Google..." : "Continue with Google"}
      </button>
      {problem && (
        <p className="notice" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
