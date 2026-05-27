/**
 * Movement (ROM) dashboard config.
 *
 * Single view. Composes:
 *   - 6 KPI cards (one per priority ROM test)
 *   - 2 trajectory charts (Side Split Tape + Hip IR L)
 *   - 1 change list (30-day % delta across all tests)
 *
 * `buildMovementConfig(headlines)` returns a fully-populated DashboardConfig.
 * Same pattern as buildNutritionConfig — TypeScript, not JSON.
 */
import type { DashboardConfig, WidgetSpec } from "@/lib/widgets/types";
import type { ROMHeadline } from "@/lib/queries";

/**
 * The KPI strip — six measurements that act as the "headline" of the pillar.
 * Order is intentional: the side split is the arc's flagship metric, hips and
 * ankles come next, t-spine last.
 */
const KPI_ORDER: string[] = [
  "Side Split Tape",
  "Hip IR L",
  "Hip IR R",
  "Ankle DF L",
  "Ankle DF R",
  "T-Spine Rotation L",
];

/** Tests that get a dedicated trajectory chart in the default view. */
const TRAJECTORY_TESTS: string[] = ["Side Split Tape", "Hip IR L"];

function findHeadline(
  headlines: ROMHeadline[],
  name: string
): ROMHeadline | null {
  return headlines.find((h) => h.name === name) ?? null;
}

function kpiCardFor(h: ROMHeadline | null, fallbackName: string): WidgetSpec {
  if (!h) {
    return {
      kind: "kpi",
      w: 4,
      props: { caption: fallbackName, value: "—" },
    };
  }
  return {
    kind: "kpi",
    w: 4,
    props: {
      caption: h.name,
      value: h.current != null ? h.current.toFixed(1) : "—",
      unit: h.unit,
      trend: h.trend,
    },
  };
}

export function buildMovementConfig(headlines: ROMHeadline[]): DashboardConfig {
  const kpiRow: WidgetSpec[] = KPI_ORDER.map((name) =>
    kpiCardFor(findHeadline(headlines, name), name)
  );

  const trajectories: WidgetSpec[] = TRAJECTORY_TESTS.map((name) => ({
    kind: "rom-trajectory" as const,
    w: 6,
    props: { testName: name },
  }));

  return {
    id: "movement.rom",
    sections: [
      { widgets: kpiRow },
      {
        label: "Trajectory",
        meta: "last 12 months · raw measurements",
        widgets: trajectories,
      },
      {
        label: "30-day change",
        meta: "positive = improving",
        widgets: [{ kind: "rom-change-list", w: 12, props: {} }],
      },
    ],
  };
}
