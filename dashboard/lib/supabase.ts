import "server-only";

import { readAllPages } from "./pages";
import type { RawExercise, RawLog, RawMetric, RawSet, RawWorkout, RawWorkoutExercise } from "./types";

const PAGE_SIZE = 1000;
const REVALIDATE_SECONDS = 300;

/** GET every training-log table. Reads only; nothing is written. */
export async function fetchLog(): Promise<RawLog> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY are required.");
  }
  const base = restBase(supabaseUrl);
  const read = <T,>(path: string) =>
    readAllPages((offset, limit) => getPage<T>(base, supabaseKey, path, offset, limit), PAGE_SIZE);

  const [exercises, workouts, workoutExercises, sets, metrics] = await Promise.all([
    read<RawExercise>("exercises?select=id,name&order=id.asc"),
    read<RawWorkout>("workouts?select=id,performed_at&order=id.asc"),
    read<RawWorkoutExercise>("workout_exercises?select=id,workout_id,exercise_id&order=id.asc"),
    read<RawSet>(
      "exercise_sets?select=id,workout_exercise_id,set_index,reps,weight_value,weight_unit,weight_kg,notes&order=id.asc",
    ),
    read<RawMetric>("daily_metrics?select=date,bodyweight_lb&order=date.asc"),
  ]);

  return { exercises, workouts, workoutExercises, sets, metrics };
}

function restBase(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/rest/v1") ? trimmed : `${trimmed}/rest/v1`;
}

async function getPage<T>(
  base: string,
  key: string,
  path: string,
  offset: number,
  limit: number,
): Promise<T[]> {
  const joiner = path.includes("?") ? "&" : "?";
  const response = await fetch(`${base}/${path}${joiner}limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    const table = path.split("?")[0];
    throw new Error(`Supabase read failed (${response.status}) for ${table}.`);
  }
  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error(`Supabase returned an unexpected payload for ${path.split("?")[0]}.`);
  }
  return body as T[];
}
