/** Supabase queries — server-side reads of training/nutrition data. */

import { supabase } from "./supabase";
import type { SetRow, DailyMetric, ExercisePR } from "./types";

/** All sets logged on a given date (defaults to today, local time). */
export async function getSetsForDate(date?: Date): Promise<SetRow[]> {
  const d = date ?? new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase()
    .from("exercise_sets")
    .select(
      `id, set_index, reps, weight_value, weight_unit, weight_kg, rpe,
       workout_exercise:workout_exercises (
         workout:workouts ( id, performed_at ),
         exercise:exercises ( id, name )
       )`
    )
    .gte("workout_exercise.workout.performed_at", start.toISOString())
    .lt("workout_exercise.workout.performed_at", end.toISOString())
    .order("set_index");

  if (error) {
    console.error("getSetsForDate error", error);
    return [];
  }
  return (data ?? [])
    .map((row): SetRow | null => {
      const we = (row as any).workout_exercise;
      const wo = we?.workout;
      const ex = we?.exercise;
      if (!wo || !ex) return null;
      return {
        id: row.id as string,
        workout_id: wo.id,
        exercise_id: ex.id,
        exercise_name: ex.name,
        set_index: row.set_index as number,
        reps: row.reps as number | null,
        weight_value: row.weight_value as number | null,
        weight_unit: row.weight_unit as SetRow["weight_unit"],
        weight_kg: row.weight_kg as number | null,
        rpe: row.rpe as number | null,
        performed_at: wo.performed_at,
      };
    })
    .filter((r): r is SetRow => r !== null);
}

/** Recent sets, optionally filtered by exercise name. */
export async function getRecentSets(
  opts: { exerciseName?: string; sinceDays?: number; limit?: number } = {}
): Promise<SetRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - (opts.sinceDays ?? 90));

  // PostgREST doesn't allow ordering by a nested foreign-table column. Fetch
  // a wider window then sort + slice in JS.
  let q = supabase()
    .from("exercise_sets")
    .select(
      `id, set_index, reps, weight_value, weight_unit, weight_kg, rpe,
       workout_exercise:workout_exercises (
         workout:workouts ( id, performed_at ),
         exercise:exercises ( id, name )
       )`
    )
    .gte("workout_exercise.workout.performed_at", since.toISOString())
    .limit(2000);

  if (opts.exerciseName) {
    q = q.eq("workout_exercise.exercise.name", opts.exerciseName);
  }
  const { data, error } = await q;
  if (error) {
    console.error("getRecentSets error", error);
    return [];
  }
  const rows = (data ?? [])
    .map((row): SetRow | null => {
      const we = (row as any).workout_exercise;
      const wo = we?.workout;
      const ex = we?.exercise;
      if (!wo || !ex) return null;
      return {
        id: row.id as string,
        workout_id: wo.id,
        exercise_id: ex.id,
        exercise_name: ex.name,
        set_index: row.set_index as number,
        reps: row.reps as number | null,
        weight_value: row.weight_value as number | null,
        weight_unit: row.weight_unit as SetRow["weight_unit"],
        weight_kg: row.weight_kg as number | null,
        rpe: row.rpe as number | null,
        performed_at: wo.performed_at,
      };
    })
    .filter((r): r is SetRow => r !== null);
  rows.sort((a, b) => b.performed_at.localeCompare(a.performed_at));
  return rows.slice(0, opts.limit ?? 500);
}

/** Daily metric rows (bodyweight + notes) over recent days. */
export async function getDailyMetrics(days = 90): Promise<DailyMetric[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase()
    .from("daily_metrics")
    .select("date, bodyweight_lb, notes")
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true });
  if (error) {
    console.error("getDailyMetrics error", error);
    return [];
  }
  return (data ?? []) as DailyMetric[];
}

/** Compute e1RM PR per exercise from recent sets (Brzycki). */
export async function getRecentPRs(
  exerciseNames: string[]
): Promise<ExercisePR[]> {
  const rows = await Promise.all(
    exerciseNames.map(async (name): Promise<ExercisePR | null> => {
      const sets = await getRecentSets({ exerciseName: name, sinceDays: 365 });
      let best: ExercisePR | null = null;
      for (const s of sets) {
        if (!s.weight_kg || !s.reps) continue;
        const e1 =
          s.reps === 1 ? s.weight_kg : s.weight_kg * (36 / (37 - s.reps));
        if (!best || e1 > best.e1rm_kg) {
          best = {
            exercise: s.exercise_name,
            weight_kg: s.weight_kg,
            reps: s.reps,
            date: s.performed_at,
            e1rm_kg: e1,
          };
        }
      }
      return best;
    })
  );
  return rows.filter((r): r is ExercisePR => r !== null);
}
