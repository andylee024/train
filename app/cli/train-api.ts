import { err, ok, type JsonEnvelope } from "./json-envelope.js";

const KG_PER_LB = 0.45359237;

type ApiError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

interface RequestResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: ApiError | string | null;
}

interface SupabaseContext {
  baseUrl: string;
  apiKey: string;
  userScoped: boolean;
  userId: string | null;
}

interface ExerciseRow {
  id: string;
  name: string;
}

interface WorkoutRow {
  id: string;
  performed_at: string;
  notes: string | null;
}

interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  notes: string | null;
}

interface ExerciseSetRow {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  reps: number | null;
  duration_seconds: number | null;
  weight_value: number | null;
  weight_unit: "kg" | "lb" | "bw" | null;
  weight_kg: number | null;
  rpe: number | null;
  notes: string | null;
}

export interface HistoryRow {
  session_date: string;
  performed_at: string;
  workout_id: string;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  duration_seconds: number | null;
  weight_value: number | null;
  weight_unit: string | null;
  weight_kg: number | null;
  rpe: number | null;
}

export interface HistoryResult {
  period: string;
  rows: HistoryRow[];
}

interface JoinedSetRow {
  performed_at: string;
  workout_id: string;
  order_index: number;
  exercise_name: string;
  set_index: number;
  reps: number | null;
  duration_seconds: number | null;
  weight_value: number | null;
  weight_unit: "kg" | "lb" | "bw" | null;
  weight_kg: number | null;
  rpe: number | null;
}

interface ParseResultPayload {
  kind?: string;
  session?: {
    session_date?: string;
    notes?: string;
  };
  entries?: Array<{
    exercise_raw?: string;
    exercise_resolved?: string;
    notes?: string;
    sets?: Array<{
      set_number?: number;
      reps?: number | null;
      duration_seconds?: number | null;
      weight_value?: number | null;
      weight_unit?: "kg" | "lb" | "bw" | null;
      rpe?: number | null;
      notes?: string | null;
    }>;
  }>;
}

interface LegacyPayload {
  session_date?: string;
  notes?: string;
  sets?: Array<{
    exercise_name?: string;
    set_number?: number;
    reps?: number | null;
    weight_value?: number | null;
    weight_unit?: "kg" | "lb" | "bw";
    duration_seconds?: number | null;
    rpe?: number | null;
    notes?: string | null;
  }>;
}

interface NormalizedSet {
  set_index: number;
  reps: number | null;
  duration_seconds: number | null;
  weight_value: number | null;
  weight_unit: "kg" | "lb" | "bw" | null;
  rpe: number | null;
  notes: string | null;
}

interface NormalizedEntry {
  exercise_name: string;
  notes: string | null;
  sets: NormalizedSet[];
}

interface NormalizedLogPayload {
  session_date: string;
  notes: string | null;
  entries: NormalizedEntry[];
}

interface BestSetResult {
  exercise: string;
  reps: number;
  period_days: number;
  best_set: {
    performed_at: string;
    session_date: string;
    weight_value: number;
    weight_unit: "kg" | "lb";
    weight_kg: number;
    e1rm_kg: number;
    set_number: number;
  };
}

interface E1rmResult {
  exercise: string;
  period_days: number;
  formula: "e1rm = weight_kg * (1 + reps/30)";
  estimated_1rm_kg: number;
  source_set: {
    performed_at: string;
    session_date: string;
    reps: number;
    weight_value: number;
    weight_unit: "kg" | "lb";
    weight_kg: number;
    e1rm_kg: number;
    set_number: number;
  };
}

interface StatsResult {
  exercise: string;
  sessions: number;
  progression: Array<{
    session_date: string;
    top_weight_kg: number;
    total_reps: number;
  }>;
  pr_weight_kg: number | null;
  pr_date: string | null;
  e1rm_kg_365d: number | null;
}

function parseApiError(text: string): ApiError | string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as ApiError;
  } catch {
    return trimmed;
  }
}

function apiErrorToMessage(context: string, error: ApiError | string | null, status: number): string {
  if (!error) return `${context} (HTTP ${status})`;
  if (typeof error === "string") return `${context}: ${error}`;

  const parts = [error.message, error.details, error.hint].filter(Boolean) as string[];
  if (parts.length > 0) {
    return `${context}: ${parts.join(" | ")}`;
  }
  return `${context} (HTTP ${status})`;
}

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, "");
}

function asNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asInt(value: unknown): number | null {
  const n = asNumber(value);
  if (n == null) return null;
  return Number.isInteger(n) ? n : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function round(value: number, precision = 3): number {
  const p = 10 ** precision;
  return Math.round(value * p) / p;
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function parseDuration(last: string): number {
  const match = last.match(/^(\d+)(d|w)$/i);
  if (!match) return 7;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  return unit === "w" ? value * 7 : value;
}

async function requestRest<T>(
  ctx: { baseUrl: string; apiKey: string },
  method: "GET" | "POST" | "DELETE",
  path: string,
  query: Record<string, string | number | undefined> = {},
  payload?: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<RequestResult<T>> {
  const url = new URL(`${ctx.baseUrl}/rest/v1/${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    apikey: ctx.apiKey,
    Authorization: `Bearer ${ctx.apiKey}`,
    ...extraHeaders,
  };

  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const text = await response.text();
  const parsed = parseApiError(text);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: parsed,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: (parsed as T | null) ?? null,
    error: null,
  };
}

async function initContext(): Promise<JsonEnvelope<SupabaseContext>> {
  const baseUrlRaw = process.env.SUPABASE_URL;
  const apiKey = process.env.SUPABASE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!baseUrlRaw) return err("Missing SUPABASE_URL in environment.");
  if (!apiKey) return err("Missing SUPABASE_KEY or SUPABASE_ANON_KEY in environment.");

  const baseUrl = normalizeBaseUrl(baseUrlRaw);

  const probe = await requestRest<unknown[]>(
    { baseUrl, apiKey },
    "GET",
    "exercises",
    { select: "id,user_id", limit: 1 }
  );

  if (probe.ok) {
    const userId = asString(process.env.TRAIN_USER_ID);
    if (!userId) {
      return err("TRAIN_USER_ID is required because public.exercises has a user_id column.");
    }
    return ok({ baseUrl, apiKey, userScoped: true, userId });
  }

  const probeError = typeof probe.error === "object" && probe.error ? probe.error : null;
  const missingUserIdColumn =
    probe.status === 400 &&
    (probeError?.message?.includes("user_id") || probeError?.details?.includes("user_id"));

  if (missingUserIdColumn) {
    return ok({ baseUrl, apiKey, userScoped: false, userId: null });
  }

  return err(apiErrorToMessage("Supabase probe failed", probe.error, probe.status));
}

function withUserScope(
  ctx: SupabaseContext,
  row: Record<string, unknown>
): Record<string, unknown> {
  if (!ctx.userScoped || !ctx.userId) return row;
  return { ...row, user_id: ctx.userId };
}

function userFilter(ctx: SupabaseContext): Record<string, string> {
  if (!ctx.userScoped || !ctx.userId) return {};
  return { user_id: `eq.${ctx.userId}` };
}

async function resolveExerciseExact(
  ctx: SupabaseContext,
  name: string
): Promise<JsonEnvelope<ExerciseRow | null>> {
  const resp = await requestRest<Array<Record<string, unknown>>>(ctx, "GET", "exercises", {
    select: "id,name",
    ...userFilter(ctx),
    name: `eq.${name}`,
    limit: 1,
  });

  if (!resp.ok) {
    return err(apiErrorToMessage("Failed to query exercises", resp.error, resp.status));
  }

  const row = Array.isArray(resp.data) && resp.data.length ? resp.data[0] : null;
  if (!row) return ok(null);

  const id = asString(row.id);
  const exerciseName = asString(row.name);
  if (!id || !exerciseName) {
    return err("Exercise query returned an invalid row.");
  }

  return ok({ id, name: exerciseName });
}

async function resolveExerciseForQuery(
  ctx: SupabaseContext,
  requested: string
): Promise<JsonEnvelope<ExerciseRow>> {
  const trimmed = requested.trim();
  if (!trimmed) {
    return err("Exercise name is required.");
  }

  const exact = await resolveExerciseExact(ctx, trimmed);
  if (!exact.ok) return exact;
  if (exact.data) return ok(exact.data);

  const likeResp = await requestRest<Array<Record<string, unknown>>>(ctx, "GET", "exercises", {
    select: "id,name",
    ...userFilter(ctx),
    name: `ilike.*${trimmed.replace(/\*/g, "")}*`,
    order: "name.asc",
    limit: 10,
  });

  if (!likeResp.ok) {
    return err(apiErrorToMessage("Failed to search exercises", likeResp.error, likeResp.status));
  }

  const rows = Array.isArray(likeResp.data) ? likeResp.data : [];
  const parsed = rows
    .map((row) => {
      const id = asString(row.id);
      const name = asString(row.name);
      return id && name ? { id, name } : null;
    })
    .filter((row): row is ExerciseRow => row !== null);

  if (parsed.length === 1) {
    return ok(parsed[0]);
  }

  if (parsed.length === 0) {
    return err(`No exercise found for '${requested}'.`);
  }

  return err(
    `Exercise '${requested}' is ambiguous. Use one of: ${parsed
      .slice(0, 5)
      .map((x) => x.name)
      .join(", ")}`
  );
}

async function getOrCreateExerciseId(
  ctx: SupabaseContext,
  name: string
): Promise<JsonEnvelope<string>> {
  const trimmed = name.trim();
  if (!trimmed) return err("Exercise name cannot be empty.");

  const existing = await resolveExerciseExact(ctx, trimmed);
  if (!existing.ok) return err(existing.error);
  if (existing.data) return ok(existing.data.id);

  const createResp = await requestRest<Array<Record<string, unknown>>>(
    ctx,
    "POST",
    "exercises",
    {},
    [withUserScope(ctx, { name: trimmed })],
    { Prefer: "return=representation" }
  );

  if (!createResp.ok) {
    const maybeDuplicate =
      typeof createResp.error === "object" &&
      createResp.error &&
      createResp.error.code === "23505";

    if (maybeDuplicate) {
      const retry = await resolveExerciseExact(ctx, trimmed);
      if (retry.ok && retry.data) return ok(retry.data.id);
    }

    return err(apiErrorToMessage("Failed to create exercise", createResp.error, createResp.status));
  }

  const row = Array.isArray(createResp.data) && createResp.data.length ? createResp.data[0] : null;
  const id = row ? asString(row.id) : null;
  if (!id) return err("Exercise create returned no id.");

  return ok(id);
}

async function insertWorkout(
  ctx: SupabaseContext,
  sessionDate: string,
  notes: string | null
): Promise<JsonEnvelope<{ id: string; performed_at: string }>> {
  const resp = await requestRest<Array<Record<string, unknown>>>(
    ctx,
    "POST",
    "workouts",
    {},
    [withUserScope(ctx, { performed_at: sessionDate, notes })],
    { Prefer: "return=representation" }
  );

  if (!resp.ok) {
    return err(apiErrorToMessage("Failed to create workout", resp.error, resp.status));
  }

  const row = Array.isArray(resp.data) && resp.data.length ? resp.data[0] : null;
  const id = row ? asString(row.id) : null;
  const performedAt = row ? asString(row.performed_at) : null;

  if (!id || !performedAt) {
    return err("Workout create returned an invalid row.");
  }

  return ok({ id, performed_at: performedAt });
}

async function insertWorkoutExercise(
  ctx: SupabaseContext,
  workoutId: string,
  exerciseId: string,
  orderIndex: number,
  notes: string | null
): Promise<JsonEnvelope<string>> {
  const resp = await requestRest<Array<Record<string, unknown>>>(
    ctx,
    "POST",
    "workout_exercises",
    {},
    [
      withUserScope(ctx, {
        workout_id: workoutId,
        exercise_id: exerciseId,
        order_index: orderIndex,
        notes,
      }),
    ],
    { Prefer: "return=representation" }
  );

  if (!resp.ok) {
    return err(apiErrorToMessage("Failed to create workout_exercise", resp.error, resp.status));
  }

  const row = Array.isArray(resp.data) && resp.data.length ? resp.data[0] : null;
  const id = row ? asString(row.id) : null;
  if (!id) return err("workout_exercises insert returned no id.");

  return ok(id);
}

async function insertSets(
  ctx: SupabaseContext,
  workoutExerciseId: string,
  sets: NormalizedSet[]
): Promise<JsonEnvelope<number>> {
  if (sets.length === 0) return ok(0);

  const payload = sets.map((set) =>
    withUserScope(ctx, {
      workout_exercise_id: workoutExerciseId,
      set_index: set.set_index,
      reps: set.reps,
      duration_seconds: set.duration_seconds,
      weight_value: set.weight_value,
      weight_unit: set.weight_unit,
      rpe: set.rpe,
      notes: set.notes,
    })
  );

  const resp = await requestRest<unknown[]>(
    ctx,
    "POST",
    "exercise_sets",
    {},
    payload,
    { Prefer: "return=minimal" }
  );

  if (!resp.ok) {
    return err(apiErrorToMessage("Failed to insert sets", resp.error, resp.status));
  }

  return ok(sets.length);
}

async function deleteWorkout(ctx: SupabaseContext, workoutId: string): Promise<void> {
  const response = await requestRest<unknown[]>(ctx, "DELETE", "workouts", {
    id: `eq.${workoutId}`,
    ...userFilter(ctx),
  });

  if (!response.ok) {
    // best-effort cleanup only
  }
}

function isValidDateInput(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

function normalizeSet(
  raw: {
    set_number?: number;
    reps?: number | null;
    duration_seconds?: number | null;
    weight_value?: number | null;
    weight_unit?: "kg" | "lb" | "bw" | null;
    rpe?: number | null;
    notes?: string | null;
  },
  fallbackIndex: number
): JsonEnvelope<NormalizedSet> {
  const setIndex = asInt(raw.set_number) ?? fallbackIndex;
  if (setIndex <= 0) return err("set_number must be a positive integer.");

  const reps = asInt(raw.reps);
  const durationSeconds = asInt(raw.duration_seconds);
  if (reps == null && durationSeconds == null) {
    return err("Each set must include reps or duration_seconds.");
  }

  const weightUnit = raw.weight_unit ?? null;
  const weightValue = asNumber(raw.weight_value);
  if (weightUnit === "kg" || weightUnit === "lb") {
    if (weightValue == null) return err("weight_value is required when weight_unit is kg/lb.");
  }
  if (weightUnit === "bw" && weightValue != null) {
    return err("weight_value must be null when weight_unit is bw.");
  }

  const rpe = asNumber(raw.rpe);

  return ok({
    set_index: setIndex,
    reps,
    duration_seconds: durationSeconds,
    weight_value: weightValue,
    weight_unit: weightUnit,
    rpe,
    notes: raw.notes ?? null,
  });
}

function normalizeFromParseResult(payload: ParseResultPayload): JsonEnvelope<NormalizedLogPayload> {
  if (payload.kind && payload.kind !== "parse_result") {
    return err(`Unsupported payload kind '${payload.kind}'. Expected parse_result.`);
  }

  const sessionDate = payload.session?.session_date ?? "";
  if (!isValidDateInput(sessionDate)) {
    return err("Invalid session.session_date. Expected ISO date like 2026-03-01.");
  }

  if (!Array.isArray(payload.entries) || payload.entries.length === 0) {
    return err("parse_result must include a non-empty entries array.");
  }

  const entries: NormalizedEntry[] = [];
  for (const entry of payload.entries) {
    const exerciseName = asString(entry.exercise_resolved) ?? asString(entry.exercise_raw);
    if (!exerciseName) {
      return err("Each entry must include exercise_resolved or exercise_raw.");
    }
    if (!Array.isArray(entry.sets) || entry.sets.length === 0) {
      return err(`Entry '${exerciseName}' must include at least one set.`);
    }

    const sets: NormalizedSet[] = [];
    for (let i = 0; i < entry.sets.length; i += 1) {
      const normalized = normalizeSet(entry.sets[i], i + 1);
      if (!normalized.ok) return normalized;
      sets.push(normalized.data);
    }

    entries.push({
      exercise_name: exerciseName,
      notes: entry.notes ?? null,
      sets,
    });
  }

  return ok({
    session_date: sessionDate,
    notes: payload.session?.notes ?? null,
    entries,
  });
}

function normalizeFromLegacy(payload: LegacyPayload): JsonEnvelope<NormalizedLogPayload> {
  const sessionDate = payload.session_date ?? "";
  if (!isValidDateInput(sessionDate)) {
    return err("Invalid session_date. Expected ISO date like 2026-03-01.");
  }
  if (!Array.isArray(payload.sets) || payload.sets.length === 0) {
    return err("Legacy payload requires non-empty sets array.");
  }

  const grouped = new Map<string, NormalizedSet[]>();
  for (let i = 0; i < payload.sets.length; i += 1) {
    const rawSet = payload.sets[i];
    const exerciseName = asString(rawSet.exercise_name);
    if (!exerciseName) {
      return err("Each legacy set requires exercise_name.");
    }
    const normalized = normalizeSet(rawSet, i + 1);
    if (!normalized.ok) return normalized;

    if (!grouped.has(exerciseName)) grouped.set(exerciseName, []);
    grouped.get(exerciseName)!.push(normalized.data);
  }

  const entries: NormalizedEntry[] = [];
  for (const [exerciseName, sets] of grouped.entries()) {
    sets.sort((a, b) => a.set_index - b.set_index);
    entries.push({ exercise_name: exerciseName, notes: null, sets });
  }

  return ok({
    session_date: sessionDate,
    notes: payload.notes ?? null,
    entries,
  });
}

function normalizeLogPayload(payload: unknown): JsonEnvelope<NormalizedLogPayload> {
  if (!payload || typeof payload !== "object") {
    return err("Payload must be an object.");
  }

  const obj = payload as Record<string, unknown>;
  if ("entries" in obj || "session" in obj || obj.kind === "parse_result") {
    return normalizeFromParseResult(obj as ParseResultPayload);
  }

  return normalizeFromLegacy(obj as LegacyPayload);
}

function computeVolumeKg(set: NormalizedSet): number {
  if (set.reps == null || set.weight_value == null || set.weight_unit == null) return 0;
  const weightKg = set.weight_unit === "lb" ? set.weight_value * KG_PER_LB : set.weight_unit === "kg" ? set.weight_value : null;
  if (weightKg == null) return 0;
  return weightKg * set.reps;
}

async function listWorkoutsSince(
  ctx: SupabaseContext,
  days: number
): Promise<JsonEnvelope<WorkoutRow[]>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const resp = await requestRest<Array<Record<string, unknown>>>(ctx, "GET", "workouts", {
    select: "id,performed_at,notes",
    ...userFilter(ctx),
    performed_at: `gte.${since}`,
    order: "performed_at.desc",
    limit: 5000,
  });

  if (!resp.ok) {
    return err(apiErrorToMessage("Failed to query workouts", resp.error, resp.status));
  }

  const rows = (Array.isArray(resp.data) ? resp.data : [])
    .map((row) => {
      const id = asString(row.id);
      const performedAt = asString(row.performed_at);
      const notes = typeof row.notes === "string" ? row.notes : null;
      if (!id || !performedAt) return null;
      return { id, performed_at: performedAt, notes };
    })
    .filter((row): row is WorkoutRow => row !== null);

  return ok(rows);
}

async function listWorkoutExercisesByWorkoutIds(
  ctx: SupabaseContext,
  workoutIds: string[],
  exerciseId?: string
): Promise<JsonEnvelope<WorkoutExerciseRow[]>> {
  if (workoutIds.length === 0) return ok([]);

  const rows: WorkoutExerciseRow[] = [];
  for (const ids of chunk(workoutIds, 150)) {
    const resp = await requestRest<Array<Record<string, unknown>>>(ctx, "GET", "workout_exercises", {
      select: "id,workout_id,exercise_id,order_index,notes",
      ...userFilter(ctx),
      workout_id: `in.(${ids.join(",")})`,
      ...(exerciseId ? { exercise_id: `eq.${exerciseId}` } : {}),
      order: "order_index.asc",
      limit: 5000,
    });

    if (!resp.ok) {
      return err(apiErrorToMessage("Failed to query workout_exercises", resp.error, resp.status));
    }

    for (const row of Array.isArray(resp.data) ? resp.data : []) {
      const id = asString(row.id);
      const workoutId = asString(row.workout_id);
      const rowExerciseId = asString(row.exercise_id);
      const orderIndex = asInt(row.order_index);
      const notes = typeof row.notes === "string" ? row.notes : null;
      if (!id || !workoutId || !rowExerciseId || orderIndex == null) continue;
      rows.push({
        id,
        workout_id: workoutId,
        exercise_id: rowExerciseId,
        order_index: orderIndex,
        notes,
      });
    }
  }

  return ok(rows);
}

async function listSetsByWorkoutExerciseIds(
  ctx: SupabaseContext,
  workoutExerciseIds: string[],
  reps?: number
): Promise<JsonEnvelope<ExerciseSetRow[]>> {
  if (workoutExerciseIds.length === 0) return ok([]);

  const rows: ExerciseSetRow[] = [];
  for (const ids of chunk(workoutExerciseIds, 150)) {
    const resp = await requestRest<Array<Record<string, unknown>>>(ctx, "GET", "exercise_sets", {
      select:
        "id,workout_exercise_id,set_index,reps,duration_seconds,weight_value,weight_unit,weight_kg,rpe,notes",
      ...userFilter(ctx),
      workout_exercise_id: `in.(${ids.join(",")})`,
      ...(reps != null ? { reps: `eq.${reps}` } : {}),
      order: "set_index.asc",
      limit: 10000,
    });

    if (!resp.ok) {
      return err(apiErrorToMessage("Failed to query exercise_sets", resp.error, resp.status));
    }

    for (const row of Array.isArray(resp.data) ? resp.data : []) {
      const id = asString(row.id);
      const workoutExerciseId = asString(row.workout_exercise_id);
      const setIndex = asInt(row.set_index);
      if (!id || !workoutExerciseId || setIndex == null) continue;

      rows.push({
        id,
        workout_exercise_id: workoutExerciseId,
        set_index: setIndex,
        reps: asInt(row.reps),
        duration_seconds: asInt(row.duration_seconds),
        weight_value: asNumber(row.weight_value),
        weight_unit:
          row.weight_unit === "kg" || row.weight_unit === "lb" || row.weight_unit === "bw"
            ? row.weight_unit
            : null,
        weight_kg: asNumber(row.weight_kg),
        rpe: asNumber(row.rpe),
        notes: typeof row.notes === "string" ? row.notes : null,
      });
    }
  }

  return ok(rows);
}

async function listExercisesByIds(
  ctx: SupabaseContext,
  exerciseIds: string[]
): Promise<JsonEnvelope<ExerciseRow[]>> {
  if (exerciseIds.length === 0) return ok([]);

  const rows: ExerciseRow[] = [];
  for (const ids of chunk(exerciseIds, 150)) {
    const resp = await requestRest<Array<Record<string, unknown>>>(ctx, "GET", "exercises", {
      select: "id,name",
      ...userFilter(ctx),
      id: `in.(${ids.join(",")})`,
      limit: 5000,
    });

    if (!resp.ok) {
      return err(apiErrorToMessage("Failed to query exercises", resp.error, resp.status));
    }

    for (const row of Array.isArray(resp.data) ? resp.data : []) {
      const id = asString(row.id);
      const name = asString(row.name);
      if (!id || !name) continue;
      rows.push({ id, name });
    }
  }

  return ok(rows);
}

async function fetchJoinedSets(
  ctx: SupabaseContext,
  opts: { days: number; exerciseId?: string; reps?: number }
): Promise<JsonEnvelope<JoinedSetRow[]>> {
  const workoutsResult = await listWorkoutsSince(ctx, opts.days);
  if (!workoutsResult.ok) return workoutsResult;
  if (workoutsResult.data.length === 0) return ok([]);

  const workoutById = new Map(workoutsResult.data.map((workout) => [workout.id, workout]));
  const workoutIds = workoutsResult.data.map((workout) => workout.id);

  const workoutExercisesResult = await listWorkoutExercisesByWorkoutIds(ctx, workoutIds, opts.exerciseId);
  if (!workoutExercisesResult.ok) return workoutExercisesResult;
  if (workoutExercisesResult.data.length === 0) return ok([]);

  const workoutExerciseById = new Map(workoutExercisesResult.data.map((row) => [row.id, row]));
  const workoutExerciseIds = workoutExercisesResult.data.map((row) => row.id);

  const setsResult = await listSetsByWorkoutExerciseIds(ctx, workoutExerciseIds, opts.reps);
  if (!setsResult.ok) return setsResult;
  if (setsResult.data.length === 0) return ok([]);

  const exerciseIds = [...new Set(workoutExercisesResult.data.map((row) => row.exercise_id))];
  const exercisesResult = await listExercisesByIds(ctx, exerciseIds);
  if (!exercisesResult.ok) return exercisesResult;

  const exerciseNameById = new Map(exercisesResult.data.map((row) => [row.id, row.name]));

  const joined: JoinedSetRow[] = [];
  for (const setRow of setsResult.data) {
    const workoutExercise = workoutExerciseById.get(setRow.workout_exercise_id);
    if (!workoutExercise) continue;

    const workout = workoutById.get(workoutExercise.workout_id);
    if (!workout) continue;

    const exerciseName = exerciseNameById.get(workoutExercise.exercise_id);
    if (!exerciseName) continue;

    joined.push({
      performed_at: workout.performed_at,
      workout_id: workout.id,
      order_index: workoutExercise.order_index,
      exercise_name: exerciseName,
      set_index: setRow.set_index,
      reps: setRow.reps,
      duration_seconds: setRow.duration_seconds,
      weight_value: setRow.weight_value,
      weight_unit: setRow.weight_unit,
      weight_kg: setRow.weight_kg,
      rpe: setRow.rpe,
    });
  }

  joined.sort((a, b) => {
    const timeDiff = Date.parse(b.performed_at) - Date.parse(a.performed_at);
    if (timeDiff !== 0) return timeDiff;
    if (a.order_index !== b.order_index) return a.order_index - b.order_index;
    return a.set_index - b.set_index;
  });

  return ok(joined);
}

export async function logWorkoutFromJson(jsonInput: string): Promise<
  JsonEnvelope<{
    workout_id: string;
    performed_at: string;
    exercise_count: number;
    set_count: number;
    total_volume_kg: number;
  }>
> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonInput);
  } catch {
    return err("Invalid JSON input.");
  }

  const normalized = normalizeLogPayload(parsed);
  if (!normalized.ok) return err(normalized.error);

  const ctxResult = await initContext();
  if (!ctxResult.ok) return err(ctxResult.error);
  const ctx = ctxResult.data;

  const payload = normalized.data;
  const workoutResult = await insertWorkout(ctx, payload.session_date, payload.notes);
  if (!workoutResult.ok) return workoutResult;

  const workout = workoutResult.data;
  let totalSets = 0;
  let totalVolumeKg = 0;

  try {
    for (let i = 0; i < payload.entries.length; i += 1) {
      const entry = payload.entries[i];
      const exerciseIdResult = await getOrCreateExerciseId(ctx, entry.exercise_name);
      if (!exerciseIdResult.ok) throw new Error(exerciseIdResult.error);

      const workoutExerciseResult = await insertWorkoutExercise(
        ctx,
        workout.id,
        exerciseIdResult.data,
        i + 1,
        entry.notes
      );
      if (!workoutExerciseResult.ok) throw new Error(workoutExerciseResult.error);

      const setsResult = await insertSets(ctx, workoutExerciseResult.data, entry.sets);
      if (!setsResult.ok) throw new Error(setsResult.error);

      totalSets += setsResult.data;
      for (const set of entry.sets) {
        totalVolumeKg += computeVolumeKg(set);
      }
    }
  } catch (e) {
    await deleteWorkout(ctx, workout.id);
    const message = e instanceof Error ? e.message : String(e);
    return err(`Failed to log workout: ${message}`);
  }

  return ok({
    workout_id: workout.id,
    performed_at: workout.performed_at,
    exercise_count: payload.entries.length,
    set_count: totalSets,
    total_volume_kg: round(totalVolumeKg, 2),
  });
}

export async function queryHistory(opts: {
  last?: string;
  exercise?: string;
}): Promise<JsonEnvelope<HistoryResult>> {
  const ctxResult = await initContext();
  if (!ctxResult.ok) return err(ctxResult.error);
  const ctx = ctxResult.data;

  const days = parseDuration(opts.last ?? "7d");

  let exerciseId: string | undefined;
  if (opts.exercise) {
    const resolved = await resolveExerciseForQuery(ctx, opts.exercise);
    if (!resolved.ok) return err(resolved.error);
    exerciseId = resolved.data.id;
  }

  const joinedResult = await fetchJoinedSets(ctx, { days, exerciseId });
  if (!joinedResult.ok) return err(joinedResult.error);

  const rows: HistoryRow[] = joinedResult.data.map((row) => ({
    session_date: row.performed_at.slice(0, 10),
    performed_at: row.performed_at,
    workout_id: row.workout_id,
    exercise_name: row.exercise_name,
    set_number: row.set_index,
    reps: row.reps,
    duration_seconds: row.duration_seconds,
    weight_value: row.weight_value,
    weight_unit: row.weight_unit,
    weight_kg: row.weight_kg,
    rpe: row.rpe,
  }));

  return ok({
    period: `last ${days} days`,
    rows,
  });
}

export async function queryBestSetByReps(opts: {
  exercise: string;
  reps: number;
  days?: number;
}): Promise<JsonEnvelope<BestSetResult>> {
  if (!opts.exercise?.trim()) return err("Exercise name is required.");
  if (!Number.isInteger(opts.reps) || opts.reps <= 0) {
    return err("--reps must be a positive integer.");
  }

  const days = opts.days ?? 365;

  const ctxResult = await initContext();
  if (!ctxResult.ok) return err(ctxResult.error);
  const ctx = ctxResult.data;

  const resolved = await resolveExerciseForQuery(ctx, opts.exercise);
  if (!resolved.ok) return err(resolved.error);

  const joinedResult = await fetchJoinedSets(ctx, {
    days,
    exerciseId: resolved.data.id,
    reps: opts.reps,
  });
  if (!joinedResult.ok) return err(joinedResult.error);

  const candidates = joinedResult.data.filter(
    (row): row is JoinedSetRow & { weight_kg: number; weight_value: number; weight_unit: "kg" | "lb" } =>
      row.weight_kg != null &&
      row.weight_value != null &&
      (row.weight_unit === "kg" || row.weight_unit === "lb")
  );

  if (candidates.length === 0) {
    return err(`No ${opts.reps}-rep loaded sets found for '${resolved.data.name}' in the last ${days} days.`);
  }

  candidates.sort((a, b) => {
    if (b.weight_kg !== a.weight_kg) return b.weight_kg - a.weight_kg;
    return Date.parse(b.performed_at) - Date.parse(a.performed_at);
  });

  const top = candidates[0];
  const e1rm = round(top.weight_kg * (1 + opts.reps / 30), 3);

  return ok({
    exercise: resolved.data.name,
    reps: opts.reps,
    period_days: days,
    best_set: {
      performed_at: top.performed_at,
      session_date: top.performed_at.slice(0, 10),
      weight_value: round(top.weight_value, 3),
      weight_unit: top.weight_unit,
      weight_kg: round(top.weight_kg, 3),
      e1rm_kg: e1rm,
      set_number: top.set_index,
    },
  });
}

export async function queryEstimatedOneRm(opts: {
  exercise: string;
  days?: number;
}): Promise<JsonEnvelope<E1rmResult>> {
  if (!opts.exercise?.trim()) return err("Exercise name is required.");

  const days = opts.days ?? 365;

  const ctxResult = await initContext();
  if (!ctxResult.ok) return err(ctxResult.error);
  const ctx = ctxResult.data;

  const resolved = await resolveExerciseForQuery(ctx, opts.exercise);
  if (!resolved.ok) return err(resolved.error);

  const joinedResult = await fetchJoinedSets(ctx, { days, exerciseId: resolved.data.id });
  if (!joinedResult.ok) return err(joinedResult.error);

  const candidates = joinedResult.data.filter(
    (row): row is JoinedSetRow & { reps: number; weight_kg: number; weight_value: number; weight_unit: "kg" | "lb" } =>
      row.reps != null &&
      row.reps > 0 &&
      row.weight_kg != null &&
      row.weight_value != null &&
      (row.weight_unit === "kg" || row.weight_unit === "lb")
  );

  if (candidates.length === 0) {
    return err(`No loaded rep sets found for '${resolved.data.name}' in the last ${days} days.`);
  }

  let best = candidates[0];
  let bestE1rm = best.weight_kg * (1 + best.reps / 30);

  for (const row of candidates.slice(1)) {
    const e1rm = row.weight_kg * (1 + row.reps / 30);
    if (e1rm > bestE1rm) {
      best = row;
      bestE1rm = e1rm;
      continue;
    }

    if (Math.abs(e1rm - bestE1rm) < 1e-9) {
      if (Date.parse(row.performed_at) > Date.parse(best.performed_at)) {
        best = row;
        bestE1rm = e1rm;
      }
    }
  }

  const roundedE1rm = round(bestE1rm, 3);

  return ok({
    exercise: resolved.data.name,
    period_days: days,
    formula: "e1rm = weight_kg * (1 + reps/30)",
    estimated_1rm_kg: roundedE1rm,
    source_set: {
      performed_at: best.performed_at,
      session_date: best.performed_at.slice(0, 10),
      reps: best.reps,
      weight_value: round(best.weight_value, 3),
      weight_unit: best.weight_unit,
      weight_kg: round(best.weight_kg, 3),
      e1rm_kg: roundedE1rm,
      set_number: best.set_index,
    },
  });
}

export async function queryStats(exercise: string): Promise<JsonEnvelope<StatsResult>> {
  if (!exercise?.trim()) {
    return err("Exercise name required. Usage: train stats <exercise>");
  }

  const ctxResult = await initContext();
  if (!ctxResult.ok) return err(ctxResult.error);
  const ctx = ctxResult.data;

  const resolved = await resolveExerciseForQuery(ctx, exercise);
  if (!resolved.ok) return err(resolved.error);

  const historyResult = await fetchJoinedSets(ctx, { days: 3650, exerciseId: resolved.data.id });
  if (!historyResult.ok) return err(historyResult.error);

  if (historyResult.data.length === 0) {
    return ok({
      exercise: resolved.data.name,
      sessions: 0,
      progression: [],
      pr_weight_kg: null,
      pr_date: null,
      e1rm_kg_365d: null,
    });
  }

  const perSession = new Map<string, { top_weight_kg: number; total_reps: number }>();
  let prWeight: number | null = null;
  let prDate: string | null = null;

  for (const row of historyResult.data) {
    const day = row.performed_at.slice(0, 10);
    const top = row.weight_kg ?? 0;
    const reps = row.reps ?? 0;

    const existing = perSession.get(day);
    if (!existing) {
      perSession.set(day, { top_weight_kg: top, total_reps: reps });
    } else {
      existing.top_weight_kg = Math.max(existing.top_weight_kg, top);
      existing.total_reps += reps;
    }

    if (row.weight_kg != null && (prWeight == null || row.weight_kg > prWeight)) {
      prWeight = row.weight_kg;
      prDate = day;
    }
  }

  const progression = [...perSession.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sessionDate, agg]) => ({
      session_date: sessionDate,
      top_weight_kg: round(agg.top_weight_kg, 3),
      total_reps: agg.total_reps,
    }));

  const e1rmResult = await queryEstimatedOneRm({ exercise: resolved.data.name, days: 365 });
  const e1rm = e1rmResult.ok ? e1rmResult.data.estimated_1rm_kg : null;

  return ok({
    exercise: resolved.data.name,
    sessions: progression.length,
    progression,
    pr_weight_kg: prWeight == null ? null : round(prWeight, 3),
    pr_date: prDate,
    e1rm_kg_365d: e1rm,
  });
}
