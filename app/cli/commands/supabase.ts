import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

type JsonEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

function ok<T>(data: T): JsonEnvelope<T> {
  return { ok: true, data };
}

function err(message: string): JsonEnvelope<never> {
  return { ok: false, error: message };
}

interface ImportCsvOptions {
  dir: string;
  dbUrl?: string;
  truncate?: boolean;
}

interface VerifyOptions {
  dbUrl?: string;
}

interface ImportCsvResult {
  directory: string;
  files: {
    exercises: string;
    workouts: string;
    workout_exercises: string;
    exercise_sets: string;
  };
  truncated: boolean;
  row_counts: {
    exercises: number;
    workouts: number;
    workout_exercises: number;
    exercise_sets: number;
  };
}

interface VerifyResult {
  row_counts: {
    exercises: number;
    workouts: number;
    workout_exercises: number;
    exercise_sets: number;
  };
  violations: {
    invalid_order_index: number;
    invalid_set_index: number;
    missing_reps_or_duration: number;
    invalid_weight_combination: number;
  };
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function runPsql(args: string[], input?: string): { stdout: string; stderr: string } {
  const result = spawnSync("psql", args, {
    encoding: "utf-8",
    input,
  });

  if (result.error) {
    const maybeErrno = result.error as NodeJS.ErrnoException;
    if (maybeErrno.code === "ENOENT") {
      throw new Error("psql is not installed or not in PATH");
    }
    throw result.error;
  }

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || "psql command failed").trim();
    throw new Error(details);
  }

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function parseCounts(stdout: string): ImportCsvResult["row_counts"] {
  const line = stdout.trim();
  const parts = line.split(",");
  if (parts.length !== 4) {
    throw new Error(`Unexpected count output: ${line}`);
  }

  const [exercises, workouts, workoutExercises, exerciseSets] = parts.map((p) => Number(p));
  if ([exercises, workouts, workoutExercises, exerciseSets].some((n) => Number.isNaN(n))) {
    throw new Error(`Non-numeric count output: ${line}`);
  }

  return {
    exercises,
    workouts,
    workout_exercises: workoutExercises,
    exercise_sets: exerciseSets,
  };
}

function parseNumberRow(stdout: string, expected: number, context: string): number[] {
  const line = stdout.trim();
  const parts = line.split(",");
  if (parts.length !== expected) {
    throw new Error(`Unexpected ${context} output: ${line}`);
  }

  const values = parts.map((p) => Number(p));
  if (values.some((n) => Number.isNaN(n))) {
    throw new Error(`Non-numeric ${context} output: ${line}`);
  }
  return values;
}

function resolveDbUrl(dbUrl?: string): JsonEnvelope<string> {
  const resolved = dbUrl ?? process.env.SUPABASE_DB_URL;
  if (!resolved) {
    return err("Missing DB URL. Pass --db-url or set SUPABASE_DB_URL.");
  }
  return ok(resolved);
}

export function supabaseImportCsv(opts: ImportCsvOptions): JsonEnvelope<ImportCsvResult> {
  const dbUrlResult = resolveDbUrl(opts.dbUrl);
  if (!dbUrlResult.ok) {
    return dbUrlResult;
  }
  const dbUrl = dbUrlResult.data;

  const directory = path.resolve(opts.dir);
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    return err(`Directory not found: ${directory}`);
  }

  const files = {
    exercises: path.join(directory, "exercises.csv"),
    workouts: path.join(directory, "workouts.csv"),
    workout_exercises: path.join(directory, "workout_exercises.csv"),
    exercise_sets: path.join(directory, "exercise_sets.csv"),
  };

  for (const [name, filePath] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      return err(`Missing required CSV: ${name} (${filePath})`);
    }
  }

  try {
    const scriptLines = [
      "begin;",
      opts.truncate
        ? "truncate table train.exercise_sets, train.workout_exercises, train.workouts, train.exercises;"
        : "",
      `\\copy train.exercises (id, user_id, name) from ${sqlLiteral(files.exercises)} with (format csv, header true);`,
      `\\copy train.workouts (id, user_id, performed_at, notes) from ${sqlLiteral(files.workouts)} with (format csv, header true);`,
      `\\copy train.workout_exercises (id, user_id, workout_id, exercise_id, order_index, notes) from ${sqlLiteral(files.workout_exercises)} with (format csv, header true);`,
      `\\copy train.exercise_sets (id, user_id, workout_exercise_id, set_index, reps, duration_seconds, weight_value, weight_unit, rpe, notes) from ${sqlLiteral(files.exercise_sets)} with (format csv, header true);`,
      "commit;",
    ].filter(Boolean);

    runPsql(["-v", "ON_ERROR_STOP=1", dbUrl, "-f", "-"], scriptLines.join("\n"));

    const countSql = `
      select
        (select count(*) from train.exercises),
        (select count(*) from train.workouts),
        (select count(*) from train.workout_exercises),
        (select count(*) from train.exercise_sets)
    `;
    const countOut = runPsql(["-At", "-F", ",", "-v", "ON_ERROR_STOP=1", dbUrl, "-c", countSql]);
    const rowCounts = parseCounts(countOut.stdout);

    return ok({
      directory,
      files,
      truncated: Boolean(opts.truncate),
      row_counts: rowCounts,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(`Supabase CSV import failed: ${message}`);
  }
}

export function supabaseVerify(opts: VerifyOptions): JsonEnvelope<VerifyResult> {
  const dbUrlResult = resolveDbUrl(opts.dbUrl);
  if (!dbUrlResult.ok) {
    return dbUrlResult;
  }
  const dbUrl = dbUrlResult.data;

  try {
    const countSql = `
      select
        (select count(*) from train.exercises),
        (select count(*) from train.workouts),
        (select count(*) from train.workout_exercises),
        (select count(*) from train.exercise_sets)
    `;
    const countOut = runPsql(["-At", "-F", ",", "-v", "ON_ERROR_STOP=1", dbUrl, "-c", countSql]);
    const [exercises, workouts, workoutExercises, exerciseSets] = parseNumberRow(
      countOut.stdout,
      4,
      "row count"
    );

    const violationsSql = `
      select
        (select count(*) from train.workout_exercises where order_index <= 0),
        (select count(*) from train.exercise_sets where set_index <= 0),
        (select count(*) from train.exercise_sets where reps is null and duration_seconds is null),
        (select count(*) from train.exercise_sets where not (
          (weight_unit in ('kg', 'lb') and weight_value is not null)
          or (weight_unit = 'bw' and weight_value is null)
          or (weight_unit is null and weight_value is null)
        ))
    `;
    const violationsOut = runPsql([
      "-At",
      "-F",
      ",",
      "-v",
      "ON_ERROR_STOP=1",
      dbUrl,
      "-c",
      violationsSql,
    ]);
    const [invalidOrderIndex, invalidSetIndex, missingRepsOrDuration, invalidWeightCombination] =
      parseNumberRow(violationsOut.stdout, 4, "violation");

    return ok({
      row_counts: {
        exercises,
        workouts,
        workout_exercises: workoutExercises,
        exercise_sets: exerciseSets,
      },
      violations: {
        invalid_order_index: invalidOrderIndex,
        invalid_set_index: invalidSetIndex,
        missing_reps_or_duration: missingRepsOrDuration,
        invalid_weight_combination: invalidWeightCombination,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(`Supabase verification failed: ${message}`);
  }
}
