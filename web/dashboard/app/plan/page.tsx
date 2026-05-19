import { getArcSummary } from "@/lib/bundle";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Badge } from "@/components/ui";
import { format } from "@/lib/format";
import { Target, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const arc = await getArcSummary();

  if (!arc) {
    return (
      <div className="max-w-6xl">
        <PageHeader title="Plan" />
        <Card>
          <CardBody>
            <div className="text-sm text-[var(--ink-muted)] py-3">
              No active arc found. Add one at{" "}
              <code className="font-mono text-[var(--ink-dim)]">
                athletes/andy/arc-2026-summer-dunk/
              </code>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={arc.name}
        subtitle={
          <div className="flex items-center gap-3">
            <span className="tabular">
              {format.shortDate(arc.start)} → {format.shortDate(arc.end)}
            </span>
            <span className="text-[var(--ink-muted)]">·</span>
            <span>{arc.totalWeeks} weeks</span>
            <span className="text-[var(--ink-muted)]">·</span>
            <Badge tone="accent">Week {arc.currentWeek} / {arc.totalWeeks}</Badge>
          </div>
        }
      />

      {/* Purpose */}
      {arc.purpose && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Purpose</CardTitle>
          </CardHeader>
          <CardBody className="pt-1">
            <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
              {arc.purpose}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Goals */}
      {arc.goals.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <Target size={14} className="text-[var(--ink-muted)]" />
          </CardHeader>
          <CardBody className="pt-1">
            <div className="space-y-3">
              {arc.goals.map((g, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[40px_1fr_auto] gap-3 py-2 border-b border-[var(--line-soft)] last:border-0"
                >
                  <div className="text-xs font-mono text-[var(--accent)] tracking-wider">
                    G{i + 1}
                  </div>
                  <div>
                    <div className="text-sm leading-snug">{g.name}</div>
                    {g.metric && (
                      <div className="text-xs text-[var(--ink-muted)] mt-0.5">
                        Test: {g.metric}
                      </div>
                    )}
                  </div>
                  {g.target && <Badge tone="muted">{g.target}</Badge>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Block sequence */}
      <Card>
        <CardHeader>
          <CardTitle>Block sequence</CardTitle>
          <div className="text-[10px] font-mono text-[var(--ink-muted)] tracking-wider">
            {arc.blocks.filter((b) => b.status === "completed").length} done ·{" "}
            {arc.blocks.filter((b) => b.status === "active").length} active ·{" "}
            {arc.blocks.filter((b) => b.status === "planned").length} planned
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <div className="space-y-2">
            {arc.blocks.map((b, i) => {
              const tone =
                b.status === "active"
                  ? "accent"
                  : b.status === "completed"
                    ? "good"
                    : "muted";
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[80px_1fr_auto_24px] items-center gap-4 px-4 py-3 rounded-lg border ${
                    b.status === "active"
                      ? "bg-[var(--accent-soft)] border-[var(--accent-line)]"
                      : "bg-[var(--bg-elev-2)] border-[var(--line)]"
                  }`}
                >
                  <div className="text-xs font-mono text-[var(--ink-muted)] tabular">
                    Wk {b.weeks}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{b.name}</div>
                    {b.serves.length > 0 && (
                      <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                        Serves: {b.serves.join(", ")}
                      </div>
                    )}
                  </div>
                  <Badge tone={tone}>{b.status}</Badge>
                  <ChevronRight size={14} className="text-[var(--ink-muted)]" />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
