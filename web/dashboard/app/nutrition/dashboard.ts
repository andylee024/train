/**
 * Nutrition dashboard config.
 *
 * Single view (no view switcher) — composed of:
 *   - 4 KPIs: BW 7-day avg, total delta, curve gap, days logged
 *   - BW vs Curve line chart
 *
 * `buildNutritionConfig(headlines)` returns a fully-populated DashboardConfig.
 * Same pattern as buildUpperConfig — TypeScript, not JSON.
 */
import type { DashboardConfig, WidgetSpec } from "@/lib/widgets/types";

export type NutritionHeadlines = {
  /** 7-day rolling avg of bodyweight (lb). null if no logs. */
  avg7?: number | null;
  /** Current arc week. */
  currentWeek: number;
  /** Linear curve target for the current week (lb). */
  curveAtWk: number;
  /** Wk-8 cut milestone target (lb). */
  milestoneLb: number;
  /** BW at arc start (lb). */
  startLb: number;
  /** Days with a logged BW in the last 7 days. */
  daysLogged7d: number;
};

export function buildNutritionConfig(h: NutritionHeadlines): DashboardConfig {
  const avg = h.avg7 ?? null;
  const totalDelta = avg != null ? +(avg - h.startLb).toFixed(1) : null;
  const curveGap = avg != null ? +(avg - h.curveAtWk).toFixed(1) : null;

  const kpiRow: WidgetSpec[] = [
    {
      kind: "kpi",
      w: 3,
      props: {
        caption: "BW · 7-day avg",
        value: avg != null ? avg.toFixed(1) : "—",
        unit: "lb",
      },
    },
    {
      kind: "kpi",
      w: 3,
      props: {
        caption: "vs Arc start",
        value:
          totalDelta != null
            ? `${totalDelta > 0 ? "+" : ""}${totalDelta.toFixed(1)}`
            : "—",
        unit: "lb",
        trend:
          totalDelta == null ? null :
          totalDelta < -0.2 ? "down" :
          totalDelta > 0.2  ? "up" :
          "flat",
      },
    },
    {
      kind: "kpi",
      w: 3,
      props: {
        caption: `Gap to Wk ${h.currentWeek} target`,
        value:
          curveGap != null
            ? `${curveGap > 0 ? "+" : ""}${curveGap.toFixed(1)}`
            : "—",
        unit: "lb",
        trend:
          curveGap == null ? null :
          Math.abs(curveGap) < 0.6 ? "flat" :
          curveGap > 0  ? "up"   :
          "down",
      },
    },
    {
      kind: "kpi",
      w: 3,
      props: {
        caption: "Days logged · last 7",
        value: `${h.daysLogged7d}/7`,
      },
    },
  ];

  return {
    id: "nutrition.bodycomp",
    sections: [
      { widgets: kpiRow },
      {
        label: "Bodyweight",
        meta: `vs Wk ${h.currentWeek} target ${h.curveAtWk.toFixed(1)} lb · Wk 8 milestone ${h.milestoneLb.toFixed(1)} lb`,
        widgets: [{ kind: "bw-trend", w: 12, props: { title: "BW vs Curve", lookbackDays: 60 } }],
      },
    ],
  };
}
