import { Card, CardBody } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { DimensionIndex } from "@/lib/athlete-index";

const STATUS_ARROW: Record<DimensionIndex["status"], string> = {
  building: "↗",
  stable: "→",
  "backed-off": "↘",
  "no-data": "─",
};

const STATUS_TONE: Record<DimensionIndex["status"], string> = {
  building: "text-[var(--good)]",
  stable: "text-[var(--ink-dim)]",
  "backed-off": "text-[var(--bad)]",
  "no-data": "text-[var(--ink-muted)]",
};

export function CompositeMetricCard({ dim }: { dim: DimensionIndex }) {
  const hasData = dim.status !== "no-data";
  const deltaTone =
    dim.delta > 0
      ? "text-[var(--good)]"
      : dim.delta < 0
        ? "text-[var(--bad)]"
        : "text-[var(--ink-dim)]";
  const deltaGlyph = dim.delta > 0 ? "▲" : dim.delta < 0 ? "▼" : "▬";

  return (
    <Card>
      <CardBody className="!px-3 !pt-2.5 !pb-2.5">
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--ink-muted)] mb-1">
          {dim.label}
        </div>

        <div className="flex items-baseline gap-2">
          <div className={cn("text-lg font-semibold tabular leading-none", deltaTone)}>
            {hasData ? (
              <>
                {deltaGlyph}{" "}
                {dim.delta > 0 ? "+" : dim.delta < 0 ? "" : ""}
                {Math.abs(dim.delta).toFixed(1)}
              </>
            ) : (
              <span className="text-[var(--ink-muted)]">─</span>
            )}
          </div>
          <div className={cn("text-xs tabular leading-none", STATUS_TONE[dim.status])}>
            {hasData ? STATUS_ARROW[dim.status] : "no data"}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
