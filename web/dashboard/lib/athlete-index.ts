/**
 * Athlete Index — composite athleticism score across dimensions.
 *
 * Mental model:
 *   100 = where you started this arc
 *   >100 = you've improved on average across dimensions you're tracking
 *   <100 = regression
 *
 * Math:
 *   For each lift in a dimension:
 *     baseline = best e1RM in first 14 days of arc (or first ever in arc)
 *     current  = best e1RM in last 28 days
 *     ratio    = current / baseline × 100
 *   dimension_index = mean(ratios across lifts with data)
 *   athlete_index   = mean(dimension_indices that have data)
 *
 * Comp dimension uses a special "progress toward target" formula because
 * bodyweight is "less is better" (during a cut) — described inline.
 */

import { getRecentSets, getDailyMetrics, e1rm } from "./queries";
import { INDEX_CONFIG } from "./index-config";
import type { SetRow } from "./types";

export type Component = {
  name: string;
  current: number;
  baseline: number;
  ratio: number;        // current/baseline × 100 (or progress formula for comp)
  delta: number;        // current - baseline (in unit)
  unit: string;
  hasData: boolean;
};

export type DimensionIndex = {
  key: "strength" | "power" | "comp" | "mobility";
  label: string;
  index: number;        // mean ratio of components with data
  delta: number;        // index - 100
  components: Component[];
  status: "building" | "stable" | "backed-off" | "no-data";
};

export type AthleteIndex = {
  overall: number;
  delta: number;
  baselineDate: string;
  asOfDate: string;
  dimensions: {
    strength: DimensionIndex;
    power: DimensionIndex;
    comp: DimensionIndex;
    mobility: DimensionIndex;
  };
  sparkline: { date: string; value: number }[];
};

const KG_PER_LB = 0.45359237;

function bestE1rmInWindow(
  bySession: Map<string, SetRow[]>,
  name: string,
  from: Date,
  to: Date
): number {
  const sets = bySession.get(name);
  if (!sets) return 0;
  let best = 0;
  for (const s of sets) {
    const d = new Date(s.performed_at);
    if (d < from || d > to) continue;
    const e = e1rm(s.weight_kg, s.reps);
    if (e > best) best = e;
  }
  return best;
}

function statusFor(delta: number, hasData: boolean): DimensionIndex["status"] {
  if (!hasData) return "no-data";
  if (delta >= 2) return "building";
  if (delta <= -2) return "backed-off";
  return "stable";
}

export async function computeAthleteIndex(arcStartIso: string): Promise<AthleteIndex> {
  const arcStart = new Date(arcStartIso);
  const baselineEnd = new Date(arcStart);
  baselineEnd.setDate(baselineEnd.getDate() + 21); // 3-week baseline window
  const now = new Date();
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - 28);

  // Fetch all sets in the arc once
  const arcDays = Math.max(
    7,
    Math.ceil((now.getTime() - arcStart.getTime()) / (1000 * 60 * 60 * 24))
  );
  const allSets = await getRecentSets({ sinceDays: arcDays + 1, limit: 5000 });
  const bySession = new Map<string, SetRow[]>();
  for (const s of allSets) {
    if (!bySession.has(s.exercise_name)) bySession.set(s.exercise_name, []);
    bySession.get(s.exercise_name)!.push(s);
  }

  function buildLiftDimension(
    key: DimensionIndex["key"],
    label: string,
    lifts: string[]
  ): DimensionIndex {
    const components: Component[] = lifts.map((name) => {
      const baseline = bestE1rmInWindow(bySession, name, arcStart, baselineEnd);
      const current = bestE1rmInWindow(bySession, name, currentStart, now);
      const hasData = baseline > 0 && current > 0;
      return {
        name,
        current: hasData ? +(current / KG_PER_LB).toFixed(1) : 0,
        baseline: hasData ? +(baseline / KG_PER_LB).toFixed(1) : 0,
        ratio: hasData ? (current / baseline) * 100 : 100,
        delta: hasData ? +((current - baseline) / KG_PER_LB).toFixed(1) : 0,
        unit: "lb",
        hasData,
      };
    });
    const valid = components.filter((c) => c.hasData);
    const index = valid.length > 0
      ? valid.reduce((s, c) => s + c.ratio, 0) / valid.length
      : 100;
    const delta = index - 100;
    return {
      key,
      label,
      index: +index.toFixed(1),
      delta: +delta.toFixed(1),
      components,
      status: statusFor(delta, valid.length > 0),
    };
  }

  const strength = buildLiftDimension(
    "strength",
    INDEX_CONFIG.strength.label,
    INDEX_CONFIG.strength.lifts
  );
  const power = buildLiftDimension(
    "power",
    INDEX_CONFIG.power.label,
    INDEX_CONFIG.power.lifts
  );

  // ----- Body Comp -----
  const dailies = await getDailyMetrics(arcDays + 1);
  const inArc = dailies.filter(
    (d) => new Date(d.date) >= arcStart && d.bodyweight_lb != null
  );
  const compComponent: Component = (() => {
    if (inArc.length < 2) {
      return {
        name: "Body weight",
        current: 0,
        baseline: 0,
        ratio: 100,
        delta: 0,
        unit: "lb",
        hasData: false,
      };
    }
    const baselineBW = inArc[0].bodyweight_lb!;
    const currentBW = inArc[inArc.length - 1].bodyweight_lb!;
    const target = INDEX_CONFIG.comp.targetBwLb;
    let progress = 0;
    if (Math.abs(baselineBW - target) > 0.1) {
      progress = ((baselineBW - currentBW) / (baselineBW - target)) * 100;
    } else if (Math.abs(currentBW - target) < 1) {
      progress = 50; // already at target; maintaining counts as half-progress
    }
    // Cap [-50, +150] so a wrong-direction drift doesn't tank the index
    const capped = Math.max(-50, Math.min(150, progress));
    const ratio = 100 + capped / 2; // 0% progress → 100, 100% → 150, -50% → 75
    return {
      name: "Body weight",
      current: +currentBW.toFixed(1),
      baseline: +baselineBW.toFixed(1),
      ratio: +ratio.toFixed(1),
      delta: +(currentBW - baselineBW).toFixed(1),
      unit: "lb",
      hasData: true,
    };
  })();
  const compIndex: DimensionIndex = {
    key: "comp",
    label: INDEX_CONFIG.comp.label,
    index: +compComponent.ratio.toFixed(1),
    delta: +(compComponent.ratio - 100).toFixed(1),
    components: [compComponent],
    status: statusFor(compComponent.ratio - 100, compComponent.hasData),
  };

  // ----- Mobility (no data source yet) -----
  const mobility: DimensionIndex = {
    key: "mobility",
    label: INDEX_CONFIG.mobility.label,
    index: 100,
    delta: 0,
    components: [],
    status: "no-data",
  };

  // ----- Overall -----
  const validDimensions = [strength, power, compIndex, mobility].filter(
    (d) => d.status !== "no-data"
  );
  const overall = validDimensions.length > 0
    ? validDimensions.reduce((s, d) => s + d.index, 0) / validDimensions.length
    : 100;

  // ----- Sparkline: recompute the index each week of the arc -----
  const sparkline = computeSparkline(
    bySession,
    inArc,
    arcStart,
    now,
    baselineEnd
  );

  return {
    overall: +overall.toFixed(1),
    delta: +(overall - 100).toFixed(1),
    baselineDate: arcStart.toISOString().slice(0, 10),
    asOfDate: now.toISOString().slice(0, 10),
    dimensions: { strength, power, comp: compIndex, mobility },
    sparkline,
  };
}

function computeSparkline(
  bySession: Map<string, SetRow[]>,
  bwDailies: { date: string; bodyweight_lb: number | null }[],
  arcStart: Date,
  now: Date,
  baselineEnd: Date
): { date: string; value: number }[] {
  const points: { date: string; value: number }[] = [];
  const targetBw = INDEX_CONFIG.comp.targetBwLb;

  // Baseline lifts (fixed)
  function liftBaseline(name: string): number {
    return bestE1rmInWindow(bySession, name, arcStart, baselineEnd);
  }

  function liftIndexAtPoint(lifts: string[], asOf: Date): number {
    const ratios: number[] = [];
    for (const name of lifts) {
      const baseline = liftBaseline(name);
      const windowStart = new Date(asOf);
      windowStart.setDate(windowStart.getDate() - 28);
      const current = bestE1rmInWindow(bySession, name, windowStart, asOf);
      if (baseline > 0 && current > 0) {
        ratios.push((current / baseline) * 100);
      }
    }
    return ratios.length > 0
      ? ratios.reduce((a, b) => a + b, 0) / ratios.length
      : 100;
  }

  function compIndexAt(asOf: Date): { value: number; hasData: boolean } {
    const upTo = bwDailies.filter(
      (d) => new Date(d.date) <= asOf && d.bodyweight_lb != null
    );
    if (upTo.length < 2) return { value: 100, hasData: false };
    const baseline = upTo[0].bodyweight_lb!;
    const current = upTo[upTo.length - 1].bodyweight_lb!;
    let progress = 0;
    if (Math.abs(baseline - targetBw) > 0.1) {
      progress = ((baseline - current) / (baseline - targetBw)) * 100;
    }
    const capped = Math.max(-50, Math.min(150, progress));
    return { value: 100 + capped / 2, hasData: true };
  }

  // Step by week from arc start to now
  let cursor = new Date(arcStart);
  cursor.setDate(cursor.getDate() + 7);
  while (cursor <= now) {
    const s = liftIndexAtPoint(INDEX_CONFIG.strength.lifts, cursor);
    const p = liftIndexAtPoint(INDEX_CONFIG.power.lifts, cursor);
    const c = compIndexAt(cursor);

    const indices = [s, p];
    if (c.hasData) indices.push(c.value);
    const overall =
      indices.reduce((a, b) => a + b, 0) / indices.length;

    points.push({
      date: cursor.toISOString().slice(0, 10),
      value: +overall.toFixed(1),
    });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }

  // Prepend the baseline point
  if (points.length > 0) {
    points.unshift({
      date: arcStart.toISOString().slice(0, 10),
      value: 100,
    });
  }
  return points;
}
