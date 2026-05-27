import {
  getAllExerciseSummaries,
  getLiftChanges,
  getKeyLiftCards,
  getTabHeadlines,
} from "@/lib/queries";
import { PerformanceViews } from "@/components/performance-views";
import { viewFor } from "@/lib/view";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

// Every key lift across all views — fetched in one call.
// Names match canonical Supabase entries post-2026-05-25 cleanup.
const ALL_KEY_LIFTS = [
  // Upper
  "Bench Press", "Chin-up/Pull-up", "BB OHP", "Dips",
  // Lower
  "Back Squat", "Front Squat", "Deadlift", "Hip Thrust",
  // Power
  "Power Clean", "Seated Vertical Jumps", "Approach Jumps", "Broad Jump",
];

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[performance] query failed:", (e as Error).message);
    return fallback;
  }
}

export default async function PerformancePage() {
  const [lifts, summaries, keyLifts] = await Promise.all([
    safe(() => getLiftChanges({ lookbackMonths: 6 }), []),
    safe(() => getAllExerciseSummaries(), []),
    safe(() => getKeyLiftCards(ALL_KEY_LIFTS), []),
  ]);

  // Compute headline numbers per tab using the categorizer.
  const recentPRs = summaries
    .filter((s) => s.pr)
    .map((s) => ({ name: s.name, date: s.pr!.date }));
  const headlines = await safe(
    () => getTabHeadlines((name) => viewFor(name) ?? "", lifts, recentPRs),
    {}
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);
  const prsLast30 = summaries.filter(
    (s) => s.pr && new Date(s.pr.date) >= monthAgo
  ).length;

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Performance"
        subtitle={`${prsLast30} PRs in last 30 days`}
      />

      <div className="mt-4">
        <PerformanceViews
          lifts={lifts}
          keyLifts={keyLifts}
          summaries={summaries}
          headlines={headlines}
        />
      </div>
    </div>
  );
}
