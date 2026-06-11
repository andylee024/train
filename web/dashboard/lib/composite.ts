/**
 * Per-theme composite metric.
 *
 * Given a set of component lifts (each with a session-best e1RM sparkline),
 * compute an indexed time series where:
 *   - baseline = component's first recorded e1RM in the chosen baseline window
 *   - index(t) = (best e1RM in 4-week window ending at t / baseline) × 100
 *   - composite(t) = arithmetic mean of all components' indices at t
 *
 * The composite is computed client-side so the baseline picker doesn't require
 * a refetch.
 */

export type ComponentSeries = {
  name: string;
  /** Session-best e1RM in lb, sorted ascending by date (YYYY-MM-DD). */
  sessions: { date: string; lb: number }[];
};

export type BaselineMode = "all-time" | "arc" | "12-months";

export type CompositePoint = {
  date: string;                  // YYYY-MM-DD of the sample
  composite: number | null;      // null if no components have data yet
  breakdown: {
    name: string;
    current: number | null;      // best e1RM in the 4w window ending at this date
    baseline: number | null;     // baseline e1RM for this component
    index: number | null;        // (current / baseline) * 100
  }[];
};

/**
 * Compute a monthly-sampled composite time series for the last `months` months.
 */
export function computeComposite(
  components: ComponentSeries[],
  baselineMode: BaselineMode,
  arcStartIso: string,
  months = 12
): CompositePoint[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Determine the baseline window start
  const baselineStart = baselineWindowStart(baselineMode, arcStartIso, now);

  // Compute baseline for each component = first session ≥ baselineStart
  const baselines = new Map<string, number | null>();
  for (const c of components) {
    const firstInWindow = c.sessions.find((s) => new Date(s.date) >= baselineStart);
    baselines.set(c.name, firstInWindow?.lb ?? null);
  }

  // Sample monthly going back `months` months
  const points: CompositePoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const sampleDate = new Date(now);
    sampleDate.setMonth(now.getMonth() - i);
    sampleDate.setDate(1);
    sampleDate.setHours(0, 0, 0, 0);

    const breakdown = components.map((c) => {
      const baseline = baselines.get(c.name) ?? null;
      const current = bestInWindow(c.sessions, sampleDate, 28);
      const index =
        baseline != null && current != null && baseline > 0
          ? +((current / baseline) * 100).toFixed(1)
          : null;
      return { name: c.name, current, baseline, index };
    });

    const valid = breakdown.filter((b) => b.index != null);
    const composite =
      valid.length > 0
        ? +(valid.reduce((s, b) => s + b.index!, 0) / valid.length).toFixed(1)
        : null;

    points.push({
      date: sampleDate.toISOString().slice(0, 10),
      composite,
      breakdown,
    });
  }
  return points;
}

function baselineWindowStart(mode: BaselineMode, arcStartIso: string, now: Date): Date {
  if (mode === "arc") return new Date(arcStartIso);
  if (mode === "12-months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 12);
    return d;
  }
  return new Date("1970-01-01"); // all-time
}

function bestInWindow(
  sessions: { date: string; lb: number }[],
  endDate: Date,
  windowDays: number
): number | null {
  const start = new Date(endDate);
  start.setDate(endDate.getDate() - windowDays);
  let best: number | null = null;
  for (const s of sessions) {
    const d = new Date(s.date);
    if (d < start || d > endDate) continue;
    if (best == null || s.lb > best) best = s.lb;
  }
  return best;
}
