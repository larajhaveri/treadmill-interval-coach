import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Test 1 from PLAN.md section 4.
// Given User A has saved a workout called "5 × 600 m" and User B has just signed up with no workouts,
// when User B requests the workout list and also tries to open User A's workout by its id,
// then User B gets an empty list and a "not found" for A's workout.
//
// How it works: this runs my real migration files (supabase/migrations) inside a small in-memory
// Postgres database, so it checks the real row-level security rules the app depends on.
// Supabase provides the `auth` schema, the `auth.uid()` function and the `authenticated` role
// itself, so the shim below recreates just those three things. "Signing in" as a user means
// switching to the `authenticated` role and setting who the user is.

const USER_A = "aaaaaaaa-0000-0000-0000-00000000000a";
const USER_B = "bbbbbbbb-0000-0000-0000-00000000000b";

const SUPABASE_SHIM = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to authenticated;
  grant execute on function auth.uid() to authenticated;
`;

let db: PGlite;

// Runs a query as a signed-in user, then goes back to being the database owner.
async function asUser<T>(userId: string, run: () => Promise<T>): Promise<T> {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId]);
  await db.exec("set role authenticated");
  try {
    return await run();
  } finally {
    await db.exec("reset role");
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_SHIM);

  // Apply the real migrations in order (0001, 0002, ...).
  const dir = path.resolve(__dirname, "../supabase/migrations");
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(path.join(dir, file), "utf8"));
  }

  // Supabase gives signed-in users table access by default; row-level security then narrows it.
  await db.exec("grant usage on schema public to authenticated");
  await db.exec("grant select, insert, update, delete on all tables in schema public to authenticated");

  // Two accounts. The migration's trigger creates their rows in public.users.
  await db.query("insert into auth.users (id, email) values ($1, 'a@example.com'), ($2, 'b@example.com')", [
    USER_A,
    USER_B,
  ]);
});

afterAll(async () => {
  await db.close();
});

describe("data isolation", () => {
  let workoutAId: string;

  beforeAll(async () => {
    // Given: User A has saved a workout called "5 × 600 m".
    const result = await asUser(USER_A, () =>
      db.query<{ id: string }>(
        `insert into public.workouts (user_id, name, reps, rep_distance_m, rep_speed_kmh, walk_sec)
         values ($1, '5 × 600 m', 5, 600, 10.2, 90) returning id`,
        [USER_A],
      ),
    );
    workoutAId = result.rows[0].id;
  });

  it("lets User A see their own workout (so the checks below are not passing on an empty table)", async () => {
    const list = await asUser(USER_A, () => db.query("select id from public.workouts"));
    expect(list.rows).toHaveLength(1);
  });

  it("gives User B an empty list", async () => {
    const list = await asUser(USER_B, () => db.query("select id from public.workouts"));
    expect(list.rows).toEqual([]);
  });

  it("gives User B 'not found' when opening User A's workout by its id", async () => {
    const found = await asUser(USER_B, () =>
      db.query("select id from public.workouts where id = $1", [workoutAId]),
    );
    expect(found.rows).toEqual([]);
  });

  it("stops User B from editing or deleting User A's workout", async () => {
    const edited = await asUser(USER_B, () =>
      db.query("update public.workouts set name = 'hacked' where id = $1", [workoutAId]),
    );
    const deleted = await asUser(USER_B, () => db.query("delete from public.workouts where id = $1", [workoutAId]));
    expect(edited.affectedRows).toBe(0);
    expect(deleted.affectedRows).toBe(0);

    const stillThere = await db.query<{ name: string }>("select name from public.workouts where id = $1", [workoutAId]);
    expect(stillThere.rows[0].name).toBe("5 × 600 m");
  });

  it("stops User B from saving a workout in User A's name", async () => {
    await expect(
      asUser(USER_B, () =>
        db.query(
          `insert into public.workouts (user_id, name, reps, rep_distance_m, rep_speed_kmh, walk_sec)
           values ($1, 'forged', 1, 400, 10, 60)`,
          [USER_A],
        ),
      ),
    ).rejects.toThrow();
  });

  it("stops User B from logging a session against User A's workout", async () => {
    await expect(
      asUser(USER_B, () =>
        db.query(
          `insert into public.sessions (user_id, workout_id, run_date, reps_completed)
           values ($1, $2, '2026-11-01', 3)`,
          [USER_B, workoutAId],
        ),
      ),
    ).rejects.toThrow();
  });
});
