export interface SessionExercise {
  name: string;
}

export interface LoggedExercise {
  id: string;
  name: string;
}

export interface SessionStateResult {
  planned: SessionExercise[];
  logged: SessionExercise[];
  remaining: SessionExercise[];
  completion_pct: number;
}

export interface BuildSessionStateOptions {
  plannedExercises: SessionExercise[];
  loggedExercises: LoggedExercise[];
  resolvePlannedExerciseId?: (
    plannedExerciseName: string,
    loggedExerciseIds: Set<string>
  ) => Promise<string | null>;
}

function sanitizeExerciseName(name: string): string {
  return name.trim();
}

function normalizeExerciseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function namesLikelyMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizeExerciseName(left);
  const normalizedRight = normalizeExerciseName(right);

  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;

  return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export async function buildSessionState(
  options: BuildSessionStateOptions
): Promise<SessionStateResult> {
  const planned = options.plannedExercises
    .map((exercise) => ({ name: sanitizeExerciseName(exercise.name) }))
    .filter((exercise) => exercise.name.length > 0);

  const dedupedLogged: LoggedExercise[] = [];
  const seenLoggedIds = new Set<string>();

  for (const exercise of options.loggedExercises) {
    const id = exercise.id.trim();
    const name = sanitizeExerciseName(exercise.name);
    if (!id || !name || seenLoggedIds.has(id)) continue;
    seenLoggedIds.add(id);
    dedupedLogged.push({ id, name });
  }

  const loggedExerciseIds = new Set(dedupedLogged.map((exercise) => exercise.id));
  const remaining: SessionExercise[] = [];

  for (const plannedExercise of planned) {
    let isLogged = false;

    if (options.resolvePlannedExerciseId && loggedExerciseIds.size > 0) {
      const resolvedId = await options.resolvePlannedExerciseId(
        plannedExercise.name,
        loggedExerciseIds
      );
      isLogged = resolvedId != null && loggedExerciseIds.has(resolvedId);
    }

    if (!isLogged) {
      isLogged = dedupedLogged.some((loggedExercise) =>
        namesLikelyMatch(plannedExercise.name, loggedExercise.name)
      );
    }

    if (!isLogged) {
      remaining.push(plannedExercise);
    }
  }

  const completedCount = planned.length - remaining.length;
  const completionPct =
    planned.length === 0 ? 0 : round((completedCount / planned.length) * 100, 2);

  return {
    planned,
    logged: dedupedLogged.map((exercise) => ({ name: exercise.name })),
    remaining,
    completion_pct: completionPct,
  };
}
