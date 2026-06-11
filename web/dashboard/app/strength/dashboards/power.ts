import type { DashboardConfig, WidgetSpec } from "@/lib/widgets/types";
import type { TabHeadlines } from "@/lib/queries";

// Updated 2026-05-25 — Vertical Jump only 1 session; Seated Vertical Jumps
// (8) is the better measurement. Approach Jumps (6) is the in-context plyo.
export const POWER_KEY_LIFTS = [
  "Power Clean",            // 17 sessions
  "Seated Vertical Jumps",  // 8 sessions
  "Approach Jumps",         // 6 sessions
  "Broad Jump",             // 5 sessions
];

export function buildPowerConfig(headlines: TabHeadlines | undefined): DashboardConfig {
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

  const coreLifts: WidgetSpec[] = POWER_KEY_LIFTS.map((name) => ({
    kind: "lift-trajectory" as const,
    w: 6 as const,
    props: { liftName: name },
  }));

  return {
    id: "performance.power",
    sections: [
      { widgets: kpiRow },
      { label: "Core Lifts", meta: "e1RM trajectory · last 12 months", widgets: coreLifts },
      { widgets: [{ kind: "lift-change", w: 12, props: { keyNames: POWER_KEY_LIFTS } }] },
    ],
  };
}
