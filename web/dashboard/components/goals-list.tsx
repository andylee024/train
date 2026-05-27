import type { ArcGoal } from "@/lib/types";

/**
 * Goals list — Kindle style. One row per goal.
 * v0: name + test + deadline. Components (sub-goal progress bars) deferred until
 * each goal is wired to a metric source.
 */
export function GoalsList({ goals }: { goals: ArcGoal[] }) {
  if (goals.length === 0) {
    return <div className="text-[11px] text-[var(--ink-muted)]">No goals defined.</div>;
  }
  return (
    <div className="space-y-2">
      {goals.map((g, i) => (
        <div
          key={i}
          className="grid grid-cols-[24px_1fr_auto] gap-3 items-baseline py-1.5 border-b border-[var(--line-soft)] last:border-b-0"
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] tabular">
            G{i + 1}
          </span>
          <div>
            <div className="text-[13px] text-[var(--ink)] leading-snug">{g.name}</div>
            {g.metric && (
              <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-wider mt-0.5">
                Test · {g.metric}
              </div>
            )}
          </div>
          {g.target && (
            <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-wider tabular whitespace-nowrap">
              {g.target}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
