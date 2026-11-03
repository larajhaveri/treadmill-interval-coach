import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Workout } from "@/lib/workouts";
import { DEFAULT_SORT, SORT_OPTIONS, cleanSearch, likePattern, parseSort } from "@/lib/find-workouts";
import WorkoutList from "./workouts/workout-list";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const showStarred = params.view === "starred";
  const search = cleanSearch(params.q);
  const sortKey = parseSort(params.sort);
  const sort = SORT_OPTIONS[sortKey];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Every account is a row in the users table. Row-level security means this query
  // can only ever return the signed-in runner's own row.
  const { data: profile } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  // Row-level security means this only returns the signed-in runner's workouts.
  // The search and the sort are done by the database.
  let query = supabase.from("workouts").select("*");
  if (search) query = query.ilike("name", likePattern(search));
  query = query.order(sort.column, { ascending: sort.ascending });
  if (sort.column !== "created_at") query = query.order("created_at", { ascending: false });
  const { data: workouts } = await query.returns<Workout[]>();

  // The tab counts ignore the search, so they always show your totals.
  const { count: totalCount } = await supabase.from("workouts").select("id", { count: "exact", head: true });

  // Stars are a junction table: one row per (runner, workout). Row-level security
  // returns only the signed-in runner's stars.
  const { data: starRows } = await supabase.from("stars").select("workout_id");
  const starredIds = new Set((starRows ?? []).map((row) => row.workout_id as string));

  const visible = (workouts ?? []).filter((w) => !showStarred || starredIds.has(w.id));

  // Tab links keep the current search and sort.
  function tabHref(starred: boolean) {
    const next = new URLSearchParams();
    if (starred) next.set("view", "starred");
    if (search) next.set("q", search);
    if (sortKey !== DEFAULT_SORT) next.set("sort", sortKey);
    const text = next.toString();
    return text ? `/?${text}` : "/";
  }

  const isFiltering = Boolean(search) || sortKey !== DEFAULT_SORT;

  let emptyMessage = "No workouts yet. Add your first one.";
  if (search) emptyMessage = `No ${showStarred ? "starred " : ""}workouts match "${search}".`;
  else if (showStarred) emptyMessage = "No starred workouts yet. Tap the ☆ next to a workout to star it.";

  return (
    <main className="page">
      <section className="hero">
        <p className="kicker">Treadmill Interval Coach</p>
        <h1>Hi, {profile?.display_name ?? "runner"}!</h1>
        <p>You are signed in as {profile?.email ?? user.email}.</p>
      </section>
      <section className="card stack">
        <h2>Your workouts</h2>
        <nav className="tabs" aria-label="Workout views">
          <Link href={tabHref(false)} className="tab" aria-current={showStarred ? undefined : "page"}>
            All ({totalCount ?? 0})
          </Link>
          <Link href={tabHref(true)} className="tab" aria-current={showStarred ? "page" : undefined}>
            ★ Starred ({starredIds.size})
          </Link>
        </nav>

        {/* A plain GET form: searching changes the address (?q=...&sort=...), so it works with no extra code and can be bookmarked. */}
        <form action="/" method="get" className="find-form" role="search">
          {showStarred && <input type="hidden" name="view" value="starred" />}
          <label className="field">
            Search by name
            <input type="search" name="q" defaultValue={search} placeholder="600" maxLength={60} />
          </label>
          <label className="field">
            Sort by
            <select name="sort" defaultValue={sortKey}>
              {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <button type="submit" className="btn btn-plain">
              Apply
            </button>
            {isFiltering && (
              <Link href={showStarred ? "/?view=starred" : "/"} className="btn btn-plain">
                Clear
              </Link>
            )}
          </div>
        </form>

        <p className="muted" aria-live="polite">
          {visible.length} {visible.length === 1 ? "workout" : "workouts"}
          {search ? ` matching "${search}"` : ""}
        </p>
        <WorkoutList workouts={visible} starredIds={starredIds} emptyMessage={emptyMessage} />

        <Link href="/workouts/new" className="btn btn-red">
          Add a workout
        </Link>
        <Link href="/dashboard" className="btn btn-plain">
          Dashboard
        </Link>
        <Link href="/settings" className="btn btn-plain">
          Settings
        </Link>
        {!profile && (
          <p className="notice" role="alert">
            Your account row was not found. Please log out and back in.
          </p>
        )}
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-plain">
            Log out
          </button>
        </form>
      </section>
    </main>
  );
}
