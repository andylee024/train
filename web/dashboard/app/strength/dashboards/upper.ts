/**
 * Upper-tab dashboard config.
 *
 * `buildUpperConfig(data)` returns a fully-populated DashboardConfig for the
 * Upper modality. Tabs are TypeScript, not JSON — props are filled directly
 * from the data bag, no string interpolation.
 */
import type { DashboardConfig, WidgetSpec } from "@/lib/widgets/types";
import type { TabHeadlines } from "@/lib/queries";

// Updated 2026-05-25 to reflect cleaned-up Supabase data:
//   - Pull-Up was merged into Chin-up/Pull-up (31 sessions, most-trained pull)
//   - Dips promoted (30 sessions, last logged May 8)
export const UPPER_KEY_LIFTS = [
  "Bench Press",      // 42 sessions
  "Chin-up/Pull-up",  // 31 sessions (was Pull-Up)
  "BB OHP",           // 19 sessions
  "Dips",             // 30 sessions
];

export function buildUpperConfig(headlines: TabHeadlines | undefined): DashboardConfig {
  const h = headlines ?? {
    prs30d: 0,
    sessions30d: 0,
    tonnage7d_lb: 0,
    liftsUp: 0,
    liftsTotal: 0,
  };

  const kpiRow: WidgetSpec[] = [
    { kind: "kpi", w: 3, props: { caption: "PRs last 30 d", value: h.prs30d, trend: h.prs30d > 0 ? "up" : null } },
    { kind: "kpi", w: 3, props: { caption: "Sessions 30 d", value: h.sessions30d } },
    { kind: "kpi", w: 3, props: { caption: "Tonnage 7 d", unit: "lb", value: h.tonnage7d_lb > 0 ? h.tonnage7d_lb.toLocaleString() : "—" } },
    { kind: "kpi", w: 3, props: { caption: "Lifts moving ↗", value: h.liftsTotal > 0 ? `${h.liftsUp}/${h.liftsTotal}` : "—" } },
  ];

  const coreLifts: WidgetSpec[] = UPPER_KEY_LIFTS.map((name) => ({
    kind: "lift-trajectory" as const,
    w: 6 as const,
    props: { liftName: name },
  }));

  return {
    id: "performance.upper",
    sections: [
      { widgets: kpiRow },
      {
        label: "Core Lifts",
        meta: "e1RM trajectory · last 12 months",
        widgets: coreLifts,
      },
      {
        widgets: [
          { kind: "lift-change", w: 12, props: { keyNames: UPPER_KEY_LIFTS } },
        ],
      },
    ],
  };
}
