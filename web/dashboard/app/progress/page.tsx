import { getDailyMetrics, getRecentSets, getRecentPRs } from "@/lib/queries";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Stat, Badge } from "@/components/ui";
import { LineChartCard, VolumeBars } from "@/components/charts";
import { format } from "@/lib/format";

export const dynamic = "force-dynamic";

const KEY_LIFTS = ["Back Squat", "Bench Press", "Power Clean", "Hang Snatch"];

async function safeQuery<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[progress] query failed:", (e as Error).message);
    return [];
  }
}

export default async function ProgressPage() {
  const [bw, prs, recentSets] = await Promise.all([
    safeQuery(() => getDailyMetrics(90)),
    safeQuery(() => getRecentPRs(KEY_LIFTS)),
    safeQuery(() => getRecentSets({ sinceDays: 28 })),
  ]);

  const bwData = bw
    .filter((d) => d.bodyweight_lb != null)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      bw: d.bodyweight_lb,
    }));

  // Weekly volume by exercise (sum reps × weight_kg) — last 4 weeks
  const volByExWeek = new Map<string, Map<string, number>>();
  for (const s of recentSets) {
    if (!s.weight_kg || !s.reps) continue;
    const d = new Date(s.performed_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const wk = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const ex = s.exercise_name;
    const byWeek = volByExWeek.get(ex) ?? new Map<string, number>();
    byWeek.set(wk, (byWeek.get(wk) ?? 0) + s.weight_kg * s.reps);
    volByExWeek.set(ex, byWeek);
  }
  const volData = (() => {
    const allWeeks = new Set<string>();
    for (const m of volByExWeek.values()) for (const k of m.keys()) allWeeks.add(k);
    const weekArr = [...allWeeks].slice(-4);
    return weekArr.map((w) => {
      const row: Record<string, string | number> = { week: w };
      let total = 0;
      for (const m of volByExWeek.values()) total += m.get(w) ?? 0;
      row.kg = Math.round(total);
      return row;
    });
  })();

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Progress"
        subtitle="PRs, volume, and body composition over time."
      />

      {/* Top PR row */}
      <div className="grid grid-cols-4 gap-4">
        {KEY_LIFTS.map((lift) => {
          const pr = prs.find((p) => p.exercise === lift);
          return (
            <Card key={lift}>
              <CardBody className="pt-5">
                <Stat
                  label={lift}
                  value={pr ? format.weight(pr.e1rm_kg) : "—"}
                  sub={
                    pr
                      ? `${pr.reps}×${format.weight(pr.weight_kg)} · ${format.shortDate(pr.date)}`
                      : "no recent log"
                  }
                />
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Body weight trend */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Body weight</CardTitle>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">
              Last {bwData.length} logs · 90-day window
            </div>
          </div>
          {bwData.length >= 2 && (
            <Badge tone={bwData[bwData.length - 1].bw! < bwData[0].bw! ? "good" : "warn"}>
              {bwData[bwData.length - 1].bw! < bwData[0].bw! ? "▼" : "▲"}{" "}
              {Math.abs(bwData[bwData.length - 1].bw! - bwData[0].bw!).toFixed(1)} lb
            </Badge>
          )}
        </CardHeader>
        <CardBody className="pt-1">
          {bwData.length === 0 ? (
            <div className="text-sm text-[var(--ink-muted)] py-6 text-center">
              No body weight logs in the last 90 days.
            </div>
          ) : (
            <LineChartCard data={bwData} xKey="date" yKey="bw" label="BW" unit=" lb" />
          )}
        </CardBody>
      </Card>

      {/* Weekly volume */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Weekly training volume</CardTitle>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">
              Total reps × weight (kg), all logged sets
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-1">
          {volData.length === 0 ? (
            <div className="text-sm text-[var(--ink-muted)] py-6 text-center">
              No volume data in the last 4 weeks.
            </div>
          ) : (
            <VolumeBars data={volData} xKey="week" yKey="kg" />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
