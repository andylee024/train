import assert from "node:assert/strict";
import test from "node:test";
import { getSessionState } from "./train-api.js";

type MockExercise = { id: string; name: string };
type MockWorkout = { id: string; performed_at: string; notes: string | null };
type MockWorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  notes: string | null;
};

const EXERCISES: MockExercise[] = [
  { id: "e_bench", name: "Bench Press" },
  { id: "e_ohp", name: "OHP" },
  { id: "e_tricep", name: "Tricep Pushdown" },
  { id: "e_deadlift", name: "Deadlift" },
];

const WORKOUTS: MockWorkout[] = [
  { id: "w_monday_full", performed_at: "2026-02-23T12:00:00.000Z", notes: null },
  { id: "w_wednesday_partial", performed_at: "2026-02-25T12:00:00.000Z", notes: null },
  { id: "w_no_plan", performed_at: "2030-01-07T12:00:00.000Z", notes: null },
];

const WORKOUT_EXERCISES: MockWorkoutExercise[] = [
  {
    id: "we_1",
    workout_id: "w_monday_full",
    exercise_id: "e_bench",
    order_index: 1,
    notes: null,
  },
  {
    id: "we_2",
    workout_id: "w_monday_full",
    exercise_id: "e_ohp",
    order_index: 2,
    notes: null,
  },
  {
    id: "we_3",
    workout_id: "w_monday_full",
    exercise_id: "e_tricep",
    order_index: 3,
    notes: null,
  },
  {
    id: "we_4",
    workout_id: "w_wednesday_partial",
    exercise_id: "e_deadlift",
    order_index: 1,
    notes: null,
  },
  {
    id: "we_5",
    workout_id: "w_no_plan",
    exercise_id: "e_deadlift",
    order_index: 1,
    notes: null,
  },
];

function parseInFilter(value: string): string[] {
  const match = value.match(/^in\.\((.*)\)$/);
  if (!match) return [];
  return match[1].split(",").map((part) => part.trim()).filter(Boolean);
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const status = init.status ?? 200;
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createMockFetch(): typeof fetch {
  return async (input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
    if (init?.method && init.method !== "GET") {
      return jsonResponse({ message: "Unsupported method in test mock" }, { status: 405 });
    }

    const url =
      typeof input === "string"
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(input.url);
    const pathname = url.pathname;

    if (pathname.endsWith("/rest/v1/workouts")) {
      const performedAt = url.searchParams.get("performed_at");
      if (!performedAt?.startsWith("gte.")) {
        return jsonResponse([]);
      }

      const since = Date.parse(performedAt.slice(4));
      const rows = WORKOUTS.filter((workout) => Date.parse(workout.performed_at) >= since);
      return jsonResponse(rows);
    }

    if (pathname.endsWith("/rest/v1/workout_exercises")) {
      const workoutIdFilter = url.searchParams.get("workout_id");
      if (!workoutIdFilter) return jsonResponse([]);

      const workoutIds = parseInFilter(workoutIdFilter);
      const rows = WORKOUT_EXERCISES.filter((row) => workoutIds.includes(row.workout_id));
      return jsonResponse(rows);
    }

    if (pathname.endsWith("/rest/v1/exercises")) {
      const select = url.searchParams.get("select") ?? "";
      const idFilter = url.searchParams.get("id");
      const nameFilter = url.searchParams.get("name");

      if (select.includes("user_id")) {
        return jsonResponse([{ id: "probe", user_id: "user-1" }]);
      }

      if (idFilter) {
        const ids = parseInFilter(idFilter);
        const rows = EXERCISES.filter((exercise) => ids.includes(exercise.id));
        return jsonResponse(rows);
      }

      if (nameFilter?.startsWith("eq.")) {
        const requested = nameFilter.slice(3);
        const row = EXERCISES.find((exercise) => exercise.name === requested);
        return jsonResponse(row ? [row] : []);
      }

      if (nameFilter?.startsWith("ilike.*") && nameFilter.endsWith("*")) {
        const needle = nameFilter.slice(7, -1).toLowerCase();
        const rows = EXERCISES.filter((exercise) =>
          exercise.name.toLowerCase().includes(needle)
        );
        return jsonResponse(rows);
      }

      return jsonResponse([]);
    }

    return jsonResponse({ message: `Unhandled test mock route: ${pathname}` }, { status: 404 });
  };
}

function extractNames(items: Array<{ name: string }>): string[] {
  return items.map((item) => item.name);
}

async function withMockedApi<T>(run: () => Promise<T>): Promise<T> {
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_KEY;
  const previousAnon = process.env.SUPABASE_ANON_KEY;
  const previousUserId = process.env.TRAIN_USER_ID;

  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_KEY = "test-key";
  process.env.TRAIN_USER_ID = "user-1";
  delete process.env.SUPABASE_ANON_KEY;
  globalThis.fetch = createMockFetch();

  try {
    return await run();
  } finally {
    globalThis.fetch = previousFetch;

    if (previousUrl == null) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;

    if (previousKey == null) delete process.env.SUPABASE_KEY;
    else process.env.SUPABASE_KEY = previousKey;

    if (previousAnon == null) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = previousAnon;

    if (previousUserId == null) delete process.env.TRAIN_USER_ID;
    else process.env.TRAIN_USER_ID = previousUserId;
  }
}

test("getSessionState: full session", async () => {
  const result = await withMockedApi(() => getSessionState("2026-02-23"));

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.completion_pct, 100);
  assert.deepEqual(extractNames(result.data.planned), ["Bench Press", "OHP", "Tricep Pushdown"]);
  assert.deepEqual(extractNames(result.data.logged), ["Bench Press", "OHP", "Tricep Pushdown"]);
  assert.deepEqual(result.data.remaining, []);
});

test("getSessionState: partial session", async () => {
  const result = await withMockedApi(() => getSessionState("2026-02-25"));

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.completion_pct, 33.33);
  assert.deepEqual(extractNames(result.data.planned), ["Deadlift", "Barbell Row", "Lat Pulldown"]);
  assert.deepEqual(extractNames(result.data.logged), ["Deadlift"]);
  assert.deepEqual(extractNames(result.data.remaining), ["Barbell Row", "Lat Pulldown"]);
});

test("getSessionState: no plan", async () => {
  const result = await withMockedApi(() => getSessionState("2030-01-07"));

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.completion_pct, 0);
  assert.deepEqual(result.data.planned, []);
  assert.deepEqual(result.data.remaining, []);
  assert.deepEqual(extractNames(result.data.logged), ["Deadlift"]);
});

test("getSessionState: no logs", async () => {
  const result = await withMockedApi(() => getSessionState("2026-02-27"));

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.completion_pct, 0);
  assert.deepEqual(extractNames(result.data.planned), ["Squat", "Romanian Deadlift", "Leg Curl"]);
  assert.deepEqual(result.data.logged, []);
  assert.deepEqual(
    extractNames(result.data.remaining),
    ["Squat", "Romanian Deadlift", "Leg Curl"]
  );
});
