import type { RawLog, RawSet, RawWorkoutExercise } from "./types";

type SetSpec = {
  exercise: string;
  reps: number | string;
  weight?: number | string | null;
  unit?: string | null;
  kg?: number | null;
  notes?: string | null;
};

/**
 * Synthetic log for local builds and deploys that have no Supabase key.
 * These sessions are not Andy's training log.
 */
export function fixtureLog(): RawLog {
  const exercises = [
    ["back-squat", "Back Squat"],
    ["power-clean", "Power Clean"],
    ["pcj", "Power Clean and Jerk"],
    ["cj", "Clean & Jerk"],
    ["power-snatch", "Power Snatch"],
    ["hang", "Hang Power Clean"],
    ["bench", "Bench Press"],
    ["approach", "Approach Jumps"],
    ["depth", "Depth Jump"],
  ].map(([id, name]) => ({ id, name }));

  const workouts: RawLog["workouts"] = [];
  const workoutExercises: RawWorkoutExercise[] = [];
  const sets: RawSet[] = [];
  let sequence = 0;

  const session = (date: string, items: SetSpec[]) => {
    sequence += 1;
    const workoutId = `fixture-workout-${sequence}`;
    workouts.push({ id: workoutId, performed_at: `${date}T19:00:00Z` });
    items.forEach((item, index) => {
      sequence += 1;
      const workoutExerciseId = `fixture-we-${sequence}`;
      workoutExercises.push({
        id: workoutExerciseId,
        workout_id: workoutId,
        exercise_id: item.exercise,
      });
      sets.push({
        id: `fixture-set-${sequence}`,
        workout_exercise_id: workoutExerciseId,
        set_index: index + 1,
        reps: item.reps,
        weight_value: item.weight ?? null,
        weight_unit: item.unit === undefined ? (item.weight ? "lb" : null) : item.unit,
        weight_kg: item.kg ?? null,
        notes: item.notes ?? null,
      });
    });
  };

  session("2026-04-12", [
    { exercise: "back-squat", reps: 5, weight: 275 },
    { exercise: "back-squat", reps: 5, weight: 275 },
    { exercise: "approach", reps: 5, notes: null },
  ]);
  session("2026-05-03", [
    { exercise: "power-clean", reps: 3, weight: 80, unit: "kg" },
    { exercise: "bench", reps: "5", weight: "185", unit: "lb" },
  ]);
  session("2026-05-31", [
    { exercise: "back-squat", reps: 5, weight: 295 },
    { exercise: "power-snatch", reps: 2, weight: 135 },
  ]);
  session("2026-06-14", [
    { exercise: "pcj", reps: 1, weight: 185 },
    { exercise: "hang", reps: 2, weight: 155 },
    { exercise: "depth", reps: 3, notes: '18" box' },
  ]);
  session("2026-06-28", [
    { exercise: "back-squat", reps: 4, weight: 315 },
    { exercise: "cj", reps: 1, weight: 175 },
  ]);
  session("2026-08-02", [
    { exercise: "back-squat", reps: 4, weight: 325 },
    { exercise: "power-clean", reps: 1, weight: 205 },
    { exercise: "bench", reps: 4, weight: 195 },
  ]);
  session("2026-09-06", [
    { exercise: "power-snatch", reps: 1, unit: null, kg: 70 },
  ]);
  session("2026-09-20", [
    { exercise: "back-squat", reps: 3, weight: 335 },
    { exercise: "power-snatch", reps: 1, weight: 155 },
    { exercise: "approach", reps: 5 },
    { exercise: "bench", reps: 8, weight: 0, unit: "lb" },
  ]);
  session("2026-10-11", [
    { exercise: "back-squat", reps: 3, weight: 345 },
    { exercise: "back-squat", reps: 12, weight: 135 },
    { exercise: "pcj", reps: 1, weight: 205 },
  ]);
  session("2026-10-25", [
    { exercise: "back-squat", reps: 2, weight: 355 },
    { exercise: "power-clean", reps: 1, weight: 215 },
  ]);
  session("2026-11-01", [
    { exercise: "back-squat", reps: 1, weight: 385 },
    { exercise: "depth", reps: 3 },
    { exercise: "bench", reps: 3, weight: 200 },
    { exercise: "bench", reps: 5, weight: null, unit: "bw" },
  ]);

  return {
    exercises,
    workouts,
    workoutExercises,
    sets,
    metrics: [
      { date: "2026-04-07", bodyweight_lb: "192.00" },
      { date: "2026-05-16", bodyweight_lb: 186.2 },
      { date: "2026-06-22", bodyweight_lb: 189.6 },
      { date: "2026-06-24", bodyweight_lb: null },
      { date: "2026-07-30", bodyweight_lb: 189 },
      { date: "2026-10-11", bodyweight_lb: 190.4 },
    ],
  };
}
