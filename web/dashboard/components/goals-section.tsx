import { Card, CardBody } from "@/components/ui";
import type { ArcGoal } from "@/lib/types";

/**
 * Renders the arc's goals from arc.md.
 *
 * v0: Shows goal name + test + deadline (the columns in arc.md's goals table).
 * Per-goal metric tracking (gap math, current vs target, rate-needed) requires
 * mapping each goal to a metric source — not wired yet. Add when ready.
 */
export function GoalsSection({ goals }: { goals: ArcGoal[] }) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-sm text-[var(--ink-muted)] py-3">
            No goals found in arc.md.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="!py-2.5 !px-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-1.5">
          Goals
        </div>
        <div className="space-y-1.5">
          {goals.map((g, i) => (
            <div
              key={i}
              className="border-l-2 border-[var(--accent-line)] pl-2.5 py-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                  G{i + 1}
                </span>
                <span className="text-[13px] text-[var(--ink)] font-medium leading-tight">
                  {g.name}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-[10.5px] text-[var(--ink-muted)] leading-tight">
                {g.type && (
                  <span>
                    <span className="font-mono uppercase tracking-wider text-[9px] mr-1">
                      Test
                    </span>
                    {g.type}
                  </span>
                )}
                {g.target && (
                  <span>
                    <span className="font-mono uppercase tracking-wider text-[9px] mr-1">
                      By
                    </span>
                    {g.target}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
