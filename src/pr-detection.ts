const KG_PER_LB = 0.45359237;
const VALUE_PRECISION = 3;
const WEIGHT_KEY_PRECISION = 3;
const EPSILON = 1e-9;

export type PRType = "weight" | "rep" | "e1rm" | "volume";
export type WeightUnit = "kg" | "lb" | "bw" | null;

export interface SetInfo {
  workout_id?: string | null;
  session_id?: string | null;
  session_date?: string | null;
  performed_at?: string | null;
  set_index?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  weight_value?: number | null;
  weight_unit?: WeightUnit;
  weight_kg?: number | null;
  rpe?: number | null;
  notes?: string | null;
}

export interface PR {
  type: PRType;
  value: number;
  previous_best: number;
  delta: number;
  set_details: SetInfo;
}

interface CandidateSet {
  set: SetInfo;
  value: number;
  index: number;
}

function round(value: number, precision = VALUE_PRECISION): number {
  const p = 10 ** precision;
  return Math.round(value * p) / p;
}

function asPositiveNumber(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

function resolveSessionKey(set: SetInfo, fallbackKey: string): string {
  const workoutId = typeof set.workout_id === "string" ? set.workout_id.trim() : "";
  if (workoutId) return `workout:${workoutId}`;

  const sessionId = typeof set.session_id === "string" ? set.session_id.trim() : "";
  if (sessionId) return `session:${sessionId}`;

  const sessionDate = typeof set.session_date === "string" ? set.session_date.trim() : "";
  if (sessionDate) return `date:${sessionDate}`;

  const performedAt = typeof set.performed_at === "string" ? set.performed_at.trim() : "";
  if (performedAt) return `at:${performedAt.slice(0, 10)}`;

  return fallbackKey;
}

function loadedWeightKg(set: SetInfo): number | null {
  const direct = asPositiveNumber(set.weight_kg);
  if (direct != null) return direct;

  const value = asPositiveNumber(set.weight_value);
  if (value == null) return null;

  if (set.weight_unit === "kg") return value;
  if (set.weight_unit === "lb") return value * KG_PER_LB;
  return null;
}

function repCount(set: SetInfo): number | null {
  return asPositiveNumber(set.reps);
}

function estimateOneRmKg(set: SetInfo): number | null {
  const weightKg = loadedWeightKg(set);
  const reps = repCount(set);
  if (weightKg == null || reps == null) return null;

  // Keep e1RM behavior aligned with existing queryEstimatedOneRm() implementation.
  return weightKg * (1 + reps / 30);
}

function setVolume(set: SetInfo): number {
  const reps = repCount(set);
  if (reps == null) return 0;

  const weightKg = loadedWeightKg(set);
  if (weightKg != null) return reps * weightKg;

  if (set.weight_unit === "bw") return reps;
  return 0;
}

function weightKey(weightKg: number): string {
  return round(weightKg, WEIGHT_KEY_PRECISION).toFixed(WEIGHT_KEY_PRECISION);
}

function shouldReplaceCandidate(current: CandidateSet | null, next: CandidateSet): boolean {
  if (current == null) return true;
  if (next.value > current.value + EPSILON) return true;
  if (Math.abs(next.value - current.value) < EPSILON && next.index > current.index) return true;
  return false;
}

function formatValue(type: PRType, value: number): number {
  if (type === "rep") return Math.round(value);
  return round(value);
}

function toRecord(type: PRType, value: number, previousBest: number, setDetails: SetInfo): PR {
  const formattedValue = formatValue(type, value);
  const formattedPrevious = formatValue(type, previousBest);
  return {
    type,
    value: formattedValue,
    previous_best: formattedPrevious,
    delta: formatValue(type, formattedValue - formattedPrevious),
    set_details: setDetails,
  };
}

export function detectPRs(exerciseName: string, newSets: SetInfo[], allTimeHistory: SetInfo[]): PR[] {
  void exerciseName;
  if (newSets.length === 0) return [];

  const currentSessionKeys = new Set<string>();
  for (let i = 0; i < newSets.length; i += 1) {
    currentSessionKeys.add(resolveSessionKey(newSets[i], `new:${i}`));
  }

  let previousBestWeight = 0;
  let previousBestE1rm = 0;
  const previousBestRepsByWeight = new Map<string, number>();
  const historySessionVolumes = new Map<string, number>();

  for (let i = 0; i < allTimeHistory.length; i += 1) {
    const set = allTimeHistory[i];
    const sessionKey = resolveSessionKey(set, `history:${i}`);
    if (currentSessionKeys.has(sessionKey)) {
      continue;
    }

    const volume = setVolume(set);
    if (volume > 0) {
      historySessionVolumes.set(sessionKey, (historySessionVolumes.get(sessionKey) ?? 0) + volume);
    }

    const weightKg = loadedWeightKg(set);
    if (weightKg != null && weightKg > previousBestWeight) {
      previousBestWeight = weightKg;
    }

    const reps = repCount(set);
    if (weightKg != null && reps != null) {
      const key = weightKey(weightKg);
      const currentRepBest = previousBestRepsByWeight.get(key) ?? 0;
      if (reps > currentRepBest) {
        previousBestRepsByWeight.set(key, reps);
      }
    }

    const e1rm = estimateOneRmKg(set);
    if (e1rm != null && e1rm > previousBestE1rm) {
      previousBestE1rm = e1rm;
    }
  }

  let bestNewWeight: CandidateSet | null = null;
  let bestNewE1rm: CandidateSet | null = null;
  const bestNewRepsByWeight = new Map<string, CandidateSet>();
  let currentSessionVolume = 0;
  let topVolumeSet: CandidateSet | null = null;

  for (let i = 0; i < newSets.length; i += 1) {
    const set = newSets[i];

    const weightKg = loadedWeightKg(set);
    if (weightKg != null) {
      const weightCandidate: CandidateSet = { set, value: weightKg, index: i };
      if (shouldReplaceCandidate(bestNewWeight, weightCandidate)) {
        bestNewWeight = weightCandidate;
      }
    }

    const reps = repCount(set);
    if (weightKg != null && reps != null) {
      const key = weightKey(weightKg);
      const repCandidate: CandidateSet = { set, value: reps, index: i };
      const current = bestNewRepsByWeight.get(key) ?? null;
      if (shouldReplaceCandidate(current, repCandidate)) {
        bestNewRepsByWeight.set(key, repCandidate);
      }
    }

    const e1rm = estimateOneRmKg(set);
    if (e1rm != null) {
      const e1rmCandidate: CandidateSet = { set, value: e1rm, index: i };
      if (shouldReplaceCandidate(bestNewE1rm, e1rmCandidate)) {
        bestNewE1rm = e1rmCandidate;
      }
    }

    const contribution = setVolume(set);
    if (contribution > 0) {
      currentSessionVolume += contribution;
      const volumeCandidate: CandidateSet = { set, value: contribution, index: i };
      if (shouldReplaceCandidate(topVolumeSet, volumeCandidate)) {
        topVolumeSet = volumeCandidate;
      }
    }
  }

  const records: PR[] = [];

  if (bestNewWeight != null && bestNewWeight.value > previousBestWeight + EPSILON) {
    records.push(toRecord("weight", bestNewWeight.value, previousBestWeight, bestNewWeight.set));
  }

  const repRecords: Array<{ index: number; record: PR }> = [];
  for (const [weightKgKey, bestRepCandidate] of bestNewRepsByWeight.entries()) {
    const previousBestAtWeight = previousBestRepsByWeight.get(weightKgKey) ?? 0;
    // Avoid first-time-at-weight noise; only count rep PRs when a prior baseline exists.
    if (previousBestAtWeight <= 0) continue;
    if (bestRepCandidate.value <= previousBestAtWeight + EPSILON) continue;

    repRecords.push({
      index: bestRepCandidate.index,
      record: toRecord("rep", bestRepCandidate.value, previousBestAtWeight, bestRepCandidate.set),
    });
  }

  repRecords.sort((a, b) => a.index - b.index);
  for (const item of repRecords) {
    records.push(item.record);
  }

  if (bestNewE1rm != null && bestNewE1rm.value > previousBestE1rm + EPSILON) {
    records.push(toRecord("e1rm", bestNewE1rm.value, previousBestE1rm, bestNewE1rm.set));
  }

  let previousBestVolume = 0;
  for (const sessionVolume of historySessionVolumes.values()) {
    if (sessionVolume > previousBestVolume) {
      previousBestVolume = sessionVolume;
    }
  }

  if (currentSessionVolume > previousBestVolume + EPSILON && topVolumeSet != null) {
    records.push(toRecord("volume", currentSessionVolume, previousBestVolume, topVolumeSet.set));
  }

  return records;
}
