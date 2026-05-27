import { getROMTests, getROMHeadlines, type ROMSeries, type ROMHeadline } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { MovementDashboard } from "@/components/movement-dashboard";

export const dynamic = "force-dynamic";

async function safeArray<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[movement] query failed:", (e as Error).message);
    return [];
  }
}

export default async function MovementPage() {
  const [series, headlines]: [ROMSeries[], ROMHeadline[]] = await Promise.all([
    safeArray<ROMSeries>(() => getROMTests()),
    safeArray<ROMHeadline>(() => getROMHeadlines()),
  ]);

  const totalLogged = series.reduce((acc, s) => acc + s.rows.length, 0);
  const tracked = series.length;
  const subtitle =
    totalLogged === 0
      ? `${tracked} tests tracked · log your first measurement to populate the dashboard`
      : `${totalLogged} measurements across ${tracked} tests`;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Movement" subtitle={subtitle} />
      <div className="mt-4">
        <MovementDashboard headlines={headlines} series={series} />
      </div>
    </div>
  );
}
