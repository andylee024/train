/** Supabase queries — server-side reads of training/nutrition data.
 *
 * All queries fetch via the foreign-table embed shape
 * `workout_exercise:workout_exercises ( workout:workouts (...), exercise:... )`.
 * PostgREST can't order/limit on a nested foreign-table column, so most
 * queries pull a wider window and finish the sort + slice in JS.
 */

import { supabase } from "./supabase";
import type { SetRow, DailyMetric, ExercisePR } from "./types";

// ----- Constants --------------------------------------------------------------

const SET_SELECT = `id, set_index, reps, weight_value, weight_unit, weight_kg, rpe,
       workout_exercise:workout_exercises (
         workout:workouts ( id, performed_at ),
         exercise:exercises ( id, name )
       )`;

// ----- Helpers ---------------------------------------------------------------

/** Brzycki e1RM. Returns 0 for invalid input. */
export function e1rm(weight_kg: number | null | undefined, reps: number | null | undefined): number {
  if (!weight_kg || !reps || reps <= 0) return 0;
  if (reps === 1) return weight_kg;
  if (reps >= 37) return 0;
  return weight_kg * (36 / (37 - reps));
}

/** URL-safe slug from an exercise name. Round-trip-safe via slugToCandidate. */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function flattenRow(row: any): SetRow | null {
  const we = row.workout_exercise;
  const wo = we?.workout;
  const ex = we?.exercise;
  if (!wo || !ex) return null;
  return {
    id: row.id,
    workout_id: wo.id,
    exercise_id: ex.id,
    exercise_name: ex.name,
    set_index: row.set_index,
    reps: row.reps,
    weight_value: row.weight_value,
    weight_unit: row.weight_unit,
    weight_kg: row.weight_kg,
    rpe: row.rpe,
    performed_at: wo.performed_at,
  };
}

// ----- Existing queries (kept as-is for /today, /nutrition) ------------------

export async function getSetsForDate(date?: Date): Promise<SetRow[]> {
  const d = date ?? new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase()
    .from("exercise_sets")
    .select(SET_SELECT)
    .gte("workout_exercise.workout.performed_at", start.toISOString())
    .lt("workout_exercise.workout.performed_at", end.toISOString())
    .order("set_index");

  if (error) {
    console.error("getSetsForDate error", error);
    return [];
  }
  return (data ?? []).map(flattenRow).filter((r): r is SetRow => r !== null);
}

export async function getRecentSets(
  opts: { exerciseName?: string; sinceDays?: number; limit?: number } = {}
): Promise<SetRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - (opts.sinceDays ?? 90));

  let q = supabase()
    .from("exercise_sets")
    .select(SET_SELECT)
    .gte("workout_exercise.workout.performed_at", since.toISOString())
    .limit(opts.limit ?? 10000);

  if (opts.exerciseName) {
    q = q.eq("workout_exercise.exercise.name", opts.exerciseName);
  }
  const { data, error } = await q;
  if (error) {
    console.error("getRecentSets error", error);
    return [];
  }
  const rows = (data ?? []).map(flattenRow).filter((r): r is SetRow => r !== null);
  rows.sort((a, b) => b.performed_at.localeCompare(a.performed_at));
  return rows.slice(0, opts.limit ?? 10000);
}

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

export async function getRecentPRs(exerciseNames: string[]): Promise<ExercisePR[]> {
  const rows = await Promise.all(
    exerciseNames.map(async (name): Promise<ExercisePR | null> => {
      const sets = await getRecentSets({ exerciseName: name, sinceDays: 365 });
      let best: ExercisePR | null = null;
      for (const s of sets) {
        const e = e1rm(s.weight_kg, s.reps);
        if (e <= 0) continue;
        if (!best || e > best.e1rm_kg) {
          best = {
            exercise: s.exercise_name,
            weight_kg: s.weight_kg!,
            reps: s.reps!,
            date: s.performed_at,
            e1rm_kg: e,
          };
        }
      }
      return best;
    })
  );
  return rows.filter((r): r is ExercisePR => r !== null);
}

// ----- New Progress queries --------------------------------------------------

export type ExerciseSummary = {
  name: string;
  slug: string;
  lastTouched: string | null;
  sessionCount: number;
  tonnage_kg: number;
  e1rmDelta_kg: number | null;
  currentE1rm_kg: number | null;
  pr: { weight_kg: number; reps: number; date: string; e1rm_kg: number } | null;
};

/** Summaries for every exercise the athlete logged in the lookback window. */
export async function getAllExerciseSummaries(
  sinceDays = 3650
): Promise<ExerciseSummary[]> {
  const sets = await getRecentSets({ sinceDays, limit: 10000 });
  const byEx = new Map<string, SetRow[]>();
  for (const s of sets) {
    const list = byEx.get(s.exercise_name) ?? [];
    list.push(s);
    byEx.set(s.exercise_name, list);
  }

  const out: ExerciseSummary[] = [];
  for (const [name, list] of byEx) {
    let tonnage = 0;
    let pr: ExerciseSummary["pr"] = null;
    const workouts = new Set<string>();
    for (const s of list) {
      if (s.weight_kg && s.reps) tonnage += s.weight_kg * s.reps;
      workouts.add(s.workout_id);
      const e = e1rm(s.weight_kg, s.reps);
      if (e > 0 && (!pr || e > pr.e1rm_kg)) {
        pr = {
          weight_kg: s.weight_kg!,
          reps: s.reps!,
          date: s.performed_at,
          e1rm_kg: e,
        };
      }
    }

    // e1RM delta: latest session's best e1RM vs first session's best e1RM
    const sorted = [...list].sort((a, b) =>
      a.performed_at.localeCompare(b.performed_at)
    );
    const firstWk = sorted[0]?.performed_at;
    const lastWk = sorted[sorted.length - 1]?.performed_at;
    const firstE1 = bestE1rmIn(sorted, firstWk);
    const lastE1 = bestE1rmIn(sorted, lastWk);
    const e1rmDelta =
      firstE1 != null && lastE1 != null ? lastE1 - firstE1 : null;

    out.push({
      name,
      slug: nameToSlug(name),
      lastTouched: lastWk ?? null,
      sessionCount: workouts.size,
      tonnage_kg: tonnage,
      e1rmDelta_kg: e1rmDelta,
      currentE1rm_kg: lastE1,
      pr,
    });
  }
  // Default sort: most recent first
  out.sort((a, b) => (b.lastTouched ?? "").localeCompare(a.lastTouched ?? ""));
  return out;
}

function bestE1rmIn(sortedSets: SetRow[], performedAt: string | undefined): number | null {
  if (!performedAt) return null;
  // Sessions can have multiple sets at the same performed_at workout
  const same = sortedSets.filter((s) => s.performed_at === performedAt);
  let best = 0;
  for (const s of same) {
    const e = e1rm(s.weight_kg, s.reps);
    if (e > best) best = e;
  }
  return best > 0 ? best : null;
}

// ----- Key-lift cards (with sparkline) ---------------------------------------

export type KeyLiftCard = ExerciseSummary & {
  sparkline: { date: string; e1rm_kg: number }[];
  status: "building" | "stable" | "backed-off" | "on-hold" | "—";
};

export async function getKeyLiftCards(names: string[]): Promise<KeyLiftCard[]> {
  const cards: KeyLiftCard[] = [];
  for (const name of names) {
    const sets = await getRecentSets({ exerciseName: name, sinceDays: 3650 });
    if (sets.length === 0) {
      cards.push({
        name,
        slug: nameToSlug(name),
        lastTouched: null,
        sessionCount: 0,
        tonnage_kg: 0,
        e1rmDelta_kg: null,
        currentE1rm_kg: null,
        pr: null,
        sparkline: [],
        status: "—",
      });
      continue;
    }
    // Group by performed_at, take session-best e1RM
    const byDate = new Map<string, number>();
    for (const s of sets) {
      const e = e1rm(s.weight_kg, s.reps);
      if (e <= 0) continue;
      const d = s.performed_at.slice(0, 10);
      byDate.set(d, Math.max(byDate.get(d) ?? 0, e));
    }
    const sparkline = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, e1rm_kg]) => ({ date, e1rm_kg }));

    const last = sparkline[sparkline.length - 1];
    const first = sparkline[0];
    const delta = last && first ? last.e1rm_kg - first.e1rm_kg : null;

    // Recent slope (last 4 sessions)
    const recent = sparkline.slice(-4);
    const recentDelta =
      recent.length >= 2 ? recent[recent.length - 1].e1rm_kg - recent[0].e1rm_kg : 0;
    let status: KeyLiftCard["status"];
    if (recent.length < 2) status = "—";
    else if (recentDelta > 1) status = "building";
    else if (recentDelta < -2) status = "backed-off";
    else status = "stable";

    let pr: ExerciseSummary["pr"] = null;
    for (const s of sets) {
      const e = e1rm(s.weight_kg, s.reps);
      if (e > 0 && (!pr || e > pr.e1rm_kg)) {
        pr = { weight_kg: s.weight_kg!, reps: s.reps!, date: s.performed_at, e1rm_kg: e };
      }
    }

    cards.push({
      name,
      slug: nameToSlug(name),
      lastTouched: sets[0].performed_at,
      sessionCount: new Set(sets.map((s) => s.workout_id)).size,
      tonnage_kg: sets.reduce(
        (sum, s) => sum + (s.weight_kg && s.reps ? s.weight_kg * s.reps : 0),
        0
      ),
      e1rmDelta_kg: delta,
      currentE1rm_kg: last?.e1rm_kg ?? null,
      pr,
      sparkline,
      status,
    });
  }
  return cards;
}

// ----- Tonnage by week -------------------------------------------------------

export type TonnageWeek = {
  week: string;          // ISO date of week start (Sunday)
  weekLabel: string;     // "W12" etc, counting back from now
  kg: number;
};

/**
 * Aggregate tonnage by ISO week. `category` optionally filters by an exercise
 * name pattern (case-insensitive substring).
 */
export async function getTonnageByWeek(
  opts: { weeks?: number; category?: string } = {}
): Promise<TonnageWeek[]> {
  const weeks = opts.weeks ?? 12;
  const sets = await getRecentSets({ sinceDays: weeks * 7 + 7, limit: 5000 });
  const filtered = opts.category
    ? sets.filter((s) =>
        s.exercise_name.toLowerCase().includes(opts.category!.toLowerCase())
      )
    : sets;

  const byWeek = new Map<string, number>();
  for (const s of filtered) {
    if (!s.weight_kg || !s.reps) continue;
    const wkStart = weekStart(new Date(s.performed_at));
    const k = wkStart.toISOString().slice(0, 10);
    byWeek.set(k, (byWeek.get(k) ?? 0) + s.weight_kg * s.reps);
  }

  // Build a contiguous range from oldest week back `weeks` long
  const now = weekStart(new Date());
  const out: TonnageWeek[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    out.push({
      week: key,
      weekLabel: i === 0 ? "now" : `W-${i}`,
      kg: Math.round(byWeek.get(key) ?? 0),
    });
  }
  return out;
}

function weekStart(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // Sunday
  return x;
}

// ----- Lift change for the Strength growth/decline view ----------------------

export type LiftChange = {
  name: string;
  slug: string;
  baselineLb: number;       // best e1RM in the baseline window (~6 months ago)
  currentLb: number;        // best e1RM in last 4 weeks
  prLb: number;             // all-time best e1RM
  prDate: string;           // ISO date of PR
  deltaLb: number;          // currentLb - baselineLb
  pctChange: number;        // (delta / baseline) * 100
  sessionCount: number;     // total sessions of this lift, all-time
};

/**
 * For each lift with ≥2 sessions over a long lookback, compute baseline (best
 * e1RM ~lookbackMonths ago), current (best in last 4 weeks), all-time PR.
 * Caller filters by threshold and sorts.
 */
export async function getLiftChanges(
  opts: { lookbackMonths?: number } = {}
): Promise<LiftChange[]> {
  const lookbackMonths = opts.lookbackMonths ?? 6;
  // Pull all sets all-time to compute PR + baseline + current
  const allSets = await getRecentSets({ sinceDays: 3650, limit: 10000 });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const baselineEnd = new Date(now);
  baselineEnd.setMonth(now.getMonth() - lookbackMonths);
  const baselineStart = new Date(baselineEnd);
  baselineStart.setDate(baselineStart.getDate() - 60); // 60-day baseline window
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - 28);

  // Group sets by exercise → sessions (date → best e1RM that day)
  const byExercise = new Map<string, Map<string, number>>();
  for (const s of allSets) {
    const e = e1rm(s.weight_kg, s.reps);
    if (e <= 0) continue;
    if (!byExercise.has(s.exercise_name)) byExercise.set(s.exercise_name, new Map());
    const sessions = byExercise.get(s.exercise_name)!;
    const date = s.performed_at.slice(0, 10);
    sessions.set(date, Math.max(sessions.get(date) ?? 0, e));
  }

  const out: LiftChange[] = [];
  for (const [name, sessions] of byExercise.entries()) {
    if (sessions.size < 2) continue;
    let pr = 0;
    let prDate = "";
    let baselineLb = 0;       // best in 60-day baseline window
    let currentLb = 0;        // best in last 4 weeks
    let earliestLb = 0;       // fallback baseline if window is empty

    for (const [date, e_kg] of sessions.entries()) {
      const d = new Date(date);
      const lb = e_kg / 0.45359237;
      if (lb > pr) {
        pr = lb;
        prDate = date;
      }
      if (d >= currentStart && d <= now) {
        if (lb > currentLb) currentLb = lb;
      }
      if (d >= baselineStart && d <= baselineEnd) {
        if (lb > baselineLb) baselineLb = lb;
      }
    }

    // If no data in the baseline window, fall back to earliest session
    if (baselineLb === 0) {
      const earliest = [...sessions.entries()].sort(([a], [b]) =>
        a.localeCompare(b)
      )[0];
      if (earliest) earliestLb = earliest[1] / 0.45359237;
      baselineLb = earliestLb;
    }
    // If no current data, fall back to most recent session
    if (currentLb === 0) {
      const latest = [...sessions.entries()].sort(([a], [b]) =>
        b.localeCompare(a)
      )[0];
      if (latest) currentLb = latest[1] / 0.45359237;
    }
    if (baselineLb <= 0 || currentLb <= 0) continue;

    const deltaLb = +(currentLb - baselineLb).toFixed(1);
    const pctChange = +((deltaLb / baselineLb) * 100).toFixed(1);

    out.push({
      name,
      slug: nameToSlug(name),
      baselineLb: +baselineLb.toFixed(1),
      currentLb: +currentLb.toFixed(1),
      prLb: +pr.toFixed(1),
      prDate,
      deltaLb,
      pctChange,
      sessionCount: sessions.size,
    });
  }
  return out;
}

// ----- Tab headline metrics --------------------------------------------------

export type TabHeadlines = {
  prs30d: number;        // PRs (new all-time best) in last 30 days, in tab
  sessions30d: number;   // unique training days with a tab-scoped set, last 30d
  tonnage7d_lb: number;  // total tonnage (weight × reps) in last 7 days, in tab
  liftsUp: number;       // count of tab lifts where deltaLb > 0 (above threshold)
  liftsTotal: number;    // count of tab lifts with any change above threshold
};

/**
 * Compute headline numbers for each modality tab in a single sweep over the
 * last ~35 days of sets. `categorize(name)` decides which tab a lift belongs
 * to. Tonnage stays in kg→lb here so we don't drag kg through the UI.
 */
export async function getTabHeadlines(
  categorize: (name: string) => string,
  liftChanges: LiftChange[],
  recentPRs: { name: string; date: string }[],
): Promise<Record<string, TabHeadlines>> {
  const sets = await getRecentSets({ sinceDays: 31, limit: 10000 });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const day30 = new Date(now); day30.setDate(now.getDate() - 30);
  const day7  = new Date(now); day7.setDate(now.getDate() - 7);

  // Per-tab accumulators
  const out = new Map<string, {
    sessionDays: Set<string>;
    tonnageKg7d: number;
  }>();
  const getAcc = (tab: string) => {
    if (!out.has(tab)) out.set(tab, { sessionDays: new Set(), tonnageKg7d: 0 });
    return out.get(tab)!;
  };

  for (const s of sets) {
    const tab = categorize(s.exercise_name);
    if (!tab) continue;
    const d = new Date(s.performed_at);
    if (d >= day30) {
      getAcc(tab).sessionDays.add(s.performed_at.slice(0, 10));
    }
    if (d >= day7 && s.weight_kg && s.reps) {
      getAcc(tab).tonnageKg7d += s.weight_kg * s.reps;
    }
  }

  // PRs 30d — recentPRs is pre-computed by caller (typically from summaries)
  const day30Iso = day30.toISOString().slice(0, 10);
  const prsByTab = new Map<string, number>();
  for (const pr of recentPRs) {
    if (pr.date.slice(0, 10) < day30Iso) continue;
    const tab = categorize(pr.name);
    if (!tab) continue;
    prsByTab.set(tab, (prsByTab.get(tab) ?? 0) + 1);
  }

  // Lifts up / total above threshold — from liftChanges
  const upByTab = new Map<string, { up: number; total: number }>();
  for (const l of liftChanges) {
    const tab = categorize(l.name);
    if (!tab) continue;
    const meets = Math.abs(l.deltaLb) >= 5 || Math.abs(l.pctChange) >= 3;
    if (!meets) continue;
    const acc = upByTab.get(tab) ?? { up: 0, total: 0 };
    acc.total++;
    if (l.deltaLb > 0) acc.up++;
    upByTab.set(tab, acc);
  }

  // Build result for every tab seen
  const result: Record<string, TabHeadlines> = {};
  const tabs = new Set([
    ...out.keys(),
    ...prsByTab.keys(),
    ...upByTab.keys(),
  ]);
  for (const tab of tabs) {
    const acc = out.get(tab);
    const ut = upByTab.get(tab) ?? { up: 0, total: 0 };
    result[tab] = {
      prs30d: prsByTab.get(tab) ?? 0,
      sessions30d: acc?.sessionDays.size ?? 0,
      tonnage7d_lb: Math.round((acc?.tonnageKg7d ?? 0) / 0.45359237),
      liftsUp: ut.up,
      liftsTotal: ut.total,
    };
  }
  return result;
}

// ----- Workout cadence for the consistency heatmap ---------------------------

export type DayCell = {
  date: string;        // YYYY-MM-DD
  sets: number;        // 0 if no workout
  exercises: number;   // unique exercises that day
};

/** Per-day workout activity for the last `days` days. */
export async function getDailyActivity(days = 112): Promise<DayCell[]> {
  const sets = await getRecentSets({ sinceDays: days + 1, limit: 10000 });
  const byDate = new Map<string, { sets: number; ex: Set<string> }>();
  for (const s of sets) {
    const d = s.performed_at.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, { sets: 0, ex: new Set() });
    const e = byDate.get(d)!;
    e.sets++;
    e.ex.add(s.exercise_name);
  }
  // Fill contiguous range from oldest → today
  const out: DayCell[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = byDate.get(key);
    out.push({
      date: key,
      sets: hit?.sets ?? 0,
      exercises: hit?.ex.size ?? 0,
    });
  }
  return out;
}

// ----- Exercise detail data --------------------------------------------------

export type ExerciseSession = {
  workout_id: string;
  date: string;          // ISO performed_at
  sets: SetRow[];
  avgWt_kg: number | null;
  avgRpe: number | null;
  bestE1rm_kg: number | null;
  notes: string | null;
};

export async function getExerciseSessions(
  name: string,
  sinceDays = 365
): Promise<ExerciseSession[]> {
  const sets = await getRecentSets({ exerciseName: name, sinceDays, limit: 2000 });
  const byWorkout = new Map<string, SetRow[]>();
  for (const s of sets) {
    const list = byWorkout.get(s.workout_id) ?? [];
    list.push(s);
    byWorkout.set(s.workout_id, list);
  }
  const sessions: ExerciseSession[] = [];
  for (const [wid, list] of byWorkout) {
    list.sort((a, b) => a.set_index - b.set_index);
    let weightSum = 0,
      weightCount = 0,
      rpeSum = 0,
      rpeCount = 0,
      bestE = 0;
    for (const s of list) {
      if (s.weight_kg) {
        weightSum += s.weight_kg;
        weightCount++;
      }
      if (s.rpe) {
        rpeSum += s.rpe;
        rpeCount++;
      }
      const e = e1rm(s.weight_kg, s.reps);
      if (e > bestE) bestE = e;
    }
    sessions.push({
      workout_id: wid,
      date: list[0].performed_at,
      sets: list,
      avgWt_kg: weightCount ? weightSum / weightCount : null,
      avgRpe: rpeCount ? rpeSum / rpeCount : null,
      bestE1rm_kg: bestE > 0 ? bestE : null,
      notes: null,
    });
  }
  sessions.sort((a, b) => b.date.localeCompare(a.date));
  return sessions;
}

export type RepRecord = {
  reps: number;
  weight_kg: number;
  date: string;
  e1rm_kg: number;
};

export type RepTableRow = {
  reps: number;
  actualWeight_kg: number | null;
  actualDate: string | null;
  estimatedWeight_kg: number | null;
};

export type RepTable = {
  rows: RepTableRow[];
  bestE1rmKg: number;
  bestE1rmReps: number;
  bestE1rmWeight_kg: number;
  bestE1rmDate: string;
};

/**
 * 1-rep through 10-rep table: actual best weight at that rep count (if any),
 * plus the e1RM-derived estimate at that rep count from your overall best e1RM.
 */
export async function getExerciseRepTable(name: string): Promise<RepTable> {
  const sets = await getRecentSets({ exerciseName: name, sinceDays: 3650, limit: 5000 });

  const bestActual = new Map<number, { weight_kg: number; date: string }>();
  let bestE1rm = 0;
  let bestE1rmReps = 0;
  let bestE1rmWeight = 0;
  let bestE1rmDate = "";

  for (const s of sets) {
    if (!s.weight_kg || !s.reps || s.reps < 1) continue;
    const cur = bestActual.get(s.reps);
    if (!cur || s.weight_kg > cur.weight_kg) {
      bestActual.set(s.reps, { weight_kg: s.weight_kg, date: s.performed_at });
    }
    const e = e1rm(s.weight_kg, s.reps);
    if (e > bestE1rm) {
      bestE1rm = e;
      bestE1rmReps = s.reps;
      bestE1rmWeight = s.weight_kg;
      bestE1rmDate = s.performed_at;
    }
  }

  const rows: RepTableRow[] = [];
  for (let r = 1; r <= 10; r++) {
    const actual = bestActual.get(r);
    // Inverse Brzycki: weight = e1RM × (37 - reps) / 36 (for reps >= 2)
    const estimated = bestE1rm > 0
      ? r === 1 ? bestE1rm : bestE1rm * (37 - r) / 36
      : null;
    rows.push({
      reps: r,
      actualWeight_kg: actual?.weight_kg ?? null,
      actualDate: actual?.date ?? null,
      estimatedWeight_kg: estimated,
    });
  }

  return {
    rows,
    bestE1rmKg: bestE1rm,
    bestE1rmReps,
    bestE1rmWeight_kg: bestE1rmWeight,
    bestE1rmDate,
  };
}

export async function getExerciseRepRecords(name: string): Promise<RepRecord[]> {
  const sets = await getRecentSets({ exerciseName: name, sinceDays: 720, limit: 2000 });
  const best = new Map<number, RepRecord>();
  for (const s of sets) {
    if (!s.weight_kg || !s.reps) continue;
    const cur = best.get(s.reps);
    if (!cur || s.weight_kg > cur.weight_kg) {
      best.set(s.reps, {
        reps: s.reps,
        weight_kg: s.weight_kg,
        date: s.performed_at,
        e1rm_kg: e1rm(s.weight_kg, s.reps),
      });
    }
  }
  // Pick canonical rep ranges only
  const canonical = [1, 3, 5, 8, 10];
  const out: RepRecord[] = [];
  for (const r of canonical) {
    const rec = best.get(r);
    if (rec) out.push(rec);
  }
  // Fall back: if none of the canonical ranges have records, include the
  // record-holding rep counts available.
  if (out.length === 0) {
    return [...best.values()].sort((a, b) => a.reps - b.reps).slice(0, 5);
  }
  return out;
}

// ----- Session detail (one workout, one exercise) ---------------------------

export type SessionDetail = {
  workout_id: string;
  date: string;
  exercise_name: string;
  sets: SetRow[];
  otherExercises: string[]; // names of other exercises in the same workout
  bodyweight_lb: number | null;
};

export async function getSessionDetail(
  exerciseName: string,
  isoDate: string // YYYY-MM-DD
): Promise<SessionDetail | null> {
  const sets = await getRecentSets({ exerciseName, sinceDays: 720, limit: 1000 });
  const dayMatch = sets.filter((s) => s.performed_at.slice(0, 10) === isoDate);
  if (dayMatch.length === 0) return null;

  const wid = dayMatch[0].workout_id;
  // Fetch the entire workout's exercises (for the "other exercises" sidebar)
  const { data: weRows } = await supabase()
    .from("workout_exercises")
    .select("exercise:exercises ( name )")
    .eq("workout_id", wid);
  const otherExercises = (weRows ?? [])
    .map((r: any) => r.exercise?.name)
    .filter((n: string) => n && n !== exerciseName);

  // Bodyweight that day
  const { data: bwRow } = await supabase()
    .from("daily_metrics")
    .select("bodyweight_lb")
    .eq("date", isoDate)
    .maybeSingle();

  dayMatch.sort((a, b) => a.set_index - b.set_index);
  return {
    workout_id: wid,
    date: dayMatch[0].performed_at,
    exercise_name: exerciseName,
    sets: dayMatch,
    otherExercises,
    bodyweight_lb: (bwRow as { bodyweight_lb: number | null } | null)?.bodyweight_lb ?? null,
  };
}

// ----- Reverse-lookup name from slug ----------------------------------------

/** Given a slug, return the canonical exercise name (case-sensitive). */
export async function resolveExerciseSlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase()
    .from("exercises")
    .select("name");
  if (error || !data) return null;
  for (const row of data as { name: string }[]) {
    if (nameToSlug(row.name) === slug) return row.name;
  }
  return null;
}
