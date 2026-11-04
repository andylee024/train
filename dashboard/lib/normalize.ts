import { performedDate } from "./dates";
import { isJumpWork, parseTouchInches } from "./jumps";
import { canonicalLift, epleyLb, goalFor, PINNED_LIFTS, weightToLb } from "./lifts";
import { num, str } from "./parse";
import type {
  BodyweightPoint,
  DashboardData,
  JumpAttempt,
  JumpWork,
  LiftMeta,
  LoadedSet,
  RawLog,
} from "./types";

/** Turn PostgREST rows into loaded sets, bodyweight, and jump reads. */
export function normalizeLog(raw: RawLog): Omit<DashboardData, "source" | "today" | "generatedAt"> {
  const exerciseName = new Map<string, string>();
  for (const exercise of raw.exercises) {
    const id = str(exercise.id);
    const name = str(exercise.name);
    if (id && name) exerciseName.set(id, name);
  }

  const workoutDate = new Map<string, string>();
  for (const workout of raw.workouts) {
    const id = str(workout.id);
    const date = performedDate(workout.performed_at);
    if (id && date) workoutDate.set(id, date);
  }

  const link = new Map<string, { workoutId: string; exerciseId: string }>();
  for (const row of raw.workoutExercises) {
    const id = str(row.id);
    const workoutId = str(row.workout_id);
    const exerciseId = str(row.exercise_id);
    if (id && workoutId && exerciseId) link.set(id, { workoutId, exerciseId });
  }

  const sets: LoadedSet[] = [];
  const jumps: JumpAttempt[] = [];
  const jumpSessions = new Map<string, { sessions: Set<string>; lastDate: string }>();
  const labelByKey = new Map(PINNED_LIFTS.map((lift) => [lift.key, lift.label]));

  for (const row of raw.sets) {
    const joined = link.get(str(row.workout_exercise_id) ?? "");
    if (!joined) continue;
    const date = workoutDate.get(joined.workoutId);
    const exercise = exerciseName.get(joined.exerciseId);
    if (!date || !exercise) continue;

    const note = str(row.notes);
    if (note) {
      const inches = parseTouchInches(note, exercise);
      if (inches != null) jumps.push({ date, exercise, inches, note });
    }

    if (isJumpWork(exercise)) {
      const bucket = jumpSessions.get(exercise) ?? { sessions: new Set<string>(), lastDate: date };
      bucket.sessions.add(joined.workoutId);
      if (date > bucket.lastDate) bucket.lastDate = date;
      jumpSessions.set(exercise, bucket);
    }

    const reps = num(row.reps);
    const weightLb = weightToLb(row.weight_unit, row.weight_value, row.weight_kg);
    if (reps == null || reps <= 0 || weightLb == null) continue;
    const wholeReps = Math.round(reps);
    const canon = canonicalLift(exercise);
    if (!labelByKey.has(canon.key)) labelByKey.set(canon.key, canon.label);
    sets.push({
      liftKey: canon.key,
      liftLabel: labelByKey.get(canon.key) ?? canon.label,
      date,
      workoutId: joined.workoutId,
      reps: wholeReps,
      weightLb,
      e1rmLb: epleyLb(weightLb, wholeReps),
      tonnageLb: weightLb * wholeReps,
    });
  }

  const lifts: LiftMeta[] = [
    ...PINNED_LIFTS.map((lift) => ({ ...lift })),
    ...[...labelByKey.entries()]
      .filter(([key]) => !PINNED_LIFTS.some((lift) => lift.key === key))
      .map(([key, label]) => ({ key, label, goalLb: goalFor(key) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const bodyweight: BodyweightPoint[] = raw.metrics
    .flatMap((metric) => {
      const date = performedDate(metric.date);
      const bodyweightLb = num(metric.bodyweight_lb);
      if (!date || bodyweightLb == null || bodyweightLb <= 0) return [];
      return [{ date, bodyweightLb }];
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const jumpWork: JumpWork[] = [...jumpSessions.entries()]
    .map(([exercise, bucket]) => ({
      exercise,
      sessions: bucket.sessions.size,
      lastDate: bucket.lastDate,
    }))
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate));

  jumps.sort((a, b) => a.date.localeCompare(b.date) || b.inches - a.inches);
  sets.sort((a, b) => a.date.localeCompare(b.date) || a.liftKey.localeCompare(b.liftKey));

  return { lifts, sets, bodyweight, jumps, jumpWork };
}
