import { getNutritionArc } from "@/lib/bundle";
import { getDailyMetrics } from "@/lib/queries";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Stat, Badge } from "@/components/ui";
import { LineChartCard } from "@/components/charts";
import { Utensils, ChefHat, Target } from "lucide-react";

export const dynamic = "force-dynamic";

async function safeQuery<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[nutrition] query failed:", (e as Error).message);
    return [];
  }
}

/** Pull a number after a markdown bullet like "- Daily protein: 200g" */
function findMetric(md: string | null, key: RegExp): string | null {
  if (!md) return null;
  const m = md.match(key);
  return m ? m[1].trim() : null;
}

export default async function NutritionPage() {
  const [nutritionMd, bw] = await Promise.all([
    getNutritionArc(),
    safeQuery(() => getDailyMetrics(30)),
  ]);

  const protein = findMetric(nutritionMd, /protein.*?(\d+\s*g)/i);
  const calories = findMetric(nutritionMd, /(\d{4})\s*(?:kcal|calories)/i);
  const target = findMetric(nutritionMd, /target.*?(\d+\s*lb|\d+\.\d+\s*lb)/i);

  const bwData = bw
    .filter((d) => d.bodyweight_lb != null)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      bw: d.bodyweight_lb,
    }));

  // 7-day avg
  const last7 = bw.slice(-7).filter((d) => d.bodyweight_lb != null);
  const avg7 =
    last7.length > 0
      ? last7.reduce((a, b) => a + (b.bodyweight_lb ?? 0), 0) / last7.length
      : null;

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Nutrition"
        subtitle="Daily targets, body weight trend, weekly menu."
      />

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Daily protein"
              value={protein ?? "—"}
              sub={protein ? "target" : "set in nutrition/arc.md"}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Daily calories"
              value={calories ? `${calories} kcal` : "—"}
              sub={calories ? "target" : "set in nutrition/arc.md"}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="7-day avg BW"
              value={avg7 != null ? `${avg7.toFixed(1)} lb` : "—"}
              sub={`${last7.length} of last 7 logged`}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Arc target"
              value={target ?? "—"}
              sub={target ? "from arc" : ""}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Body weight (30-day)</CardTitle>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">
              Logged via the CLI or chat
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-1">
          {bwData.length === 0 ? (
            <div className="text-sm text-[var(--ink-muted)] py-6 text-center">
              No body weight logs in the last 30 days.
            </div>
          ) : (
            <LineChartCard data={bwData} xKey="date" yKey="bw" label="BW" unit=" lb" />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nutrition arc</CardTitle>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">
              From athletes/andy/arc-2026-summer-dunk/nutrition/arc.md
            </div>
          </div>
          <ChefHat size={16} className="text-[var(--ink-muted)]" />
        </CardHeader>
        <CardBody className="pt-1">
          {nutritionMd ? (
            <pre className="text-xs text-[var(--ink-dim)] whitespace-pre-wrap leading-relaxed font-sans max-h-[400px] overflow-y-auto">
              {nutritionMd.slice(0, 4000)}
              {nutritionMd.length > 4000 && "\n\n..."}
            </pre>
          ) : (
            <div className="text-sm text-[var(--ink-muted)] py-3">
              No nutrition/arc.md found.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
