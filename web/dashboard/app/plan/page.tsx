import Link from "next/link";
import { Plus } from "lucide-react";
import { getArcSummary } from "@/lib/bundle";
import { getDailyActivity } from "@/lib/queries";
import { ArcTimeline } from "@/components/arc-timeline";
import { ConsistencyHeatmap } from "@/components/consistency-heatmap";
import { GoalsList } from "@/components/goals-list";
import { PageHeader, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[plan] query failed:", (e as Error).message);
    return fallback;
  }
}

export default async function PlanPage() {
  const arc = await getArcSummary();
  const days = await safe(() => getDailyActivity(112), []);

  if (!arc) {
    return (
      <div className="max-w-5xl">
        <PageHeader title="Plan" />
        <div className="text-[12px] text-[var(--ink-muted)] mt-6">
          No active arc found.
        </div>
      </div>
    );
  }

  const daysRemaining = arc.end
    ? Math.max(0, Math.ceil((new Date(arc.end).getTime() - Date.now()) / 86400000))
    : 0;
  const loggedDays = days.filter((d) => d.sets > 0).length;

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between">
        <PageHeader
          title={arc.name}
          subtitle={`Wk ${arc.currentWeek} of ${arc.totalWeeks}  ·  ${daysRemaining} days remaining`}
        />
        <Link
          href="/plan/new"
          className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--accent)] flex items-center gap-1 px-2 py-1 rounded-sm border border-[var(--line)] hover:border-[var(--accent-line)] transition-colors"
        >
          <Plus size={11} /> New Arc
        </Link>
      </div>

      <Section label="Arc">
        <ArcTimeline
          blocks={arc.blocks}
          totalWeeks={arc.totalWeeks}
          currentWeek={arc.currentWeek}
        />
      </Section>

      <Section
        label="Consistency"
        meta={`${loggedDays} sessions · last ${Math.round(days.length / 7)} weeks`}
      >
        <ConsistencyHeatmap days={days} />
      </Section>

      <Section label="Goals">
        <GoalsList goals={arc.goals} />
      </Section>
    </div>
  );
}
