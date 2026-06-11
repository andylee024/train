import { getArcSummary } from "@/lib/bundle";
import { getDailyMetrics } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { NutritionDashboard } from "@/components/nutrition-dashboard";
import { format } from "@/lib/format";

export const dynamic = "force-dynamic";

// BW curve hardcoded for v0 — promote to nutrition/arc.md parser later.
const BW_CURVE = {
  startLb: 192.0,
  wk8TargetLb: 188.0,
  finalTargetLb: 188.0,
};

function targetBwAtWeek(week: number): number {
  if (week <= 0) return BW_CURVE.startLb;
  if (week >= 8) return BW_CURVE.wk8TargetLb;
  const t = week / 8;
  return BW_CURVE.startLb + t * (BW_CURVE.wk8TargetLb - BW_CURVE.startLb);
}

async function safeQuery<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[nutrition] query failed:", (e as Error).message);
    return [];
  }
}

export default async function NutritionPage() {
  const [arc, bw] = await Promise.all([
    getArcSummary(),
    safeQuery(() => getDailyMetrics(60)),
  ]);

  const currentWeek = arc?.currentWeek ?? 1;
  const arcStart = arc?.start ? new Date(arc.start) : new Date("2026-05-03");

  // 7-day rolling average
  const last7 = bw.slice(-7).filter((d) => d.bodyweight_lb != null);
  const avg7 =
    last7.length > 0
      ? last7.reduce((a, b) => a + (b.bodyweight_lb ?? 0), 0) / last7.length
      : null;

  // BW + target series for the chart
  const bwSeries = bw
    .filter((d) => d.bodyweight_lb != null)
    .map((d) => {
      const dt = new Date(d.date);
      const daysFromStart = Math.floor(
        (dt.getTime() - arcStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const wk = Math.max(0, daysFromStart / 7);
      return {
        date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        bw: d.bodyweight_lb ?? null,
        target: +targetBwAtWeek(wk).toFixed(1),
      };
    });

  const headlines = {
    avg7,
    currentWeek,
    curveAtWk: +targetBwAtWeek(currentWeek).toFixed(1),
    milestoneLb: BW_CURVE.wk8TargetLb,
    startLb: BW_CURVE.startLb,
    daysLogged7d: last7.length,
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Nutrition"
        subtitle={arc ? format.orientation(arc) : "—"}
      />
      <div className="mt-4">
        <NutritionDashboard headlines={headlines} bwSeries={bwSeries} />
      </div>
    </div>
  );
}
