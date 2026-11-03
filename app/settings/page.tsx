import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/get-settings";
import { saveSettings } from "./actions";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const current = await getSettings();

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Settings</p>
        <h1>How should the coach talk?</h1>
        <p>Choose how much warning you get before each change. Your treadmill speed is still set by you.</p>
      </section>
      <SettingsForm action={saveSettings} current={current} />
    </main>
  );
}
