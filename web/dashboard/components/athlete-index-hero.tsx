"use client";

import { Sparkline } from "@/components/charts";
import { cn } from "@/lib/cn";
import type { AthleteIndex, DimensionIndex } from "@/lib/athlete-index";

const STATUS_COLOR: Record<DimensionIndex["status"], string> = {
  building: "text-[var(--good)]",
  stable: "text-[var(--ink-dim)]",
  "backed-off": "text-[var(--bad)]",
  "no-data": "text-[var(--ink-muted)]",
};

const STATUS_ARROW: Record<DimensionIndex["status"], string> = {
  building: "▲",
  stable: "▬",
  "backed-off": "▼",
  "no-data": "─",
};

function fmtDelta(delta: number, hasData: boolean): string {
  if (!hasData) return "─";
  if (delta === 0) return "0.0";
  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;
}

export function AthleteIndexHero({ data }: { data: AthleteIndex }) {
  const sparklineData = data.sparkline.map((p) => ({
    date: p.date,
    value: p.value,
  }));

  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--bg-elev-1)] overflow-hidden">
      {/* Top: big number + sparkline */}
      <div className="px-6 pt-6 pb-4 flex items-end gap-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink-muted)] mb-1.5">
            Athlete Index
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-5xl font-semibold tabular tracking-tight">
              {data.overall.toFixed(1)}
            </div>
            <div
              className={cn(
                "text-lg tabular font-medium",
                data.delta > 0
                  ? "text-[var(--good)]"
                  : data.delta < 0
                    ? "text-[var(--bad)]"
                    : "text-[var(--ink-dim)]"
              )}
            >
              {data.delta > 0 ? "▲" : data.delta < 0 ? "▼" : "▬"}{" "}
              {fmtDelta(data.delta, true)}
            </div>
          </div>
          <div className="mt-1 text-xs text-[var(--ink-muted)] tabular">
            since arc start ·{" "}
            {new Date(data.baselineDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="flex-1 h-14 min-w-0">
          {sparklineData.length >= 2 ? (
            <Sparkline data={sparklineData} yKey="value" height={56} />
          ) : (
            <div className="h-full flex items-center text-[var(--ink-muted)] font-mono text-xs">
              not enough history yet
            </div>
          )}
        </div>
      </div>

      {/* Dimension chips */}
      <div className="border-t border-[var(--line)] grid grid-cols-4 divide-x divide-[var(--line)]">
        {[
          data.dimensions.strength,
          data.dimensions.power,
          data.dimensions.comp,
          data.dimensions.mobility,
        ].map((dim) => (
          <a
            key={dim.key}
            href={`#dim-${dim.key}`}
            className="px-5 py-4 hover:bg-[var(--bg-elev-2)] transition-colors group"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--ink-muted)]">
              {dim.label}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <div className="text-2xl font-semibold tabular">
                {dim.status === "no-data" ? "—" : dim.index.toFixed(1)}
              </div>
              <div className={cn("text-xs tabular", STATUS_COLOR[dim.status])}>
                {STATUS_ARROW[dim.status]} {fmtDelta(dim.delta, dim.status !== "no-data")}
              </div>
            </div>
            <div className="mt-1 text-[11px] text-[var(--ink-muted)]">
              {dim.status === "no-data"
                ? "not measured"
                : `${dim.components.filter((c) => c.hasData).length} of ${dim.components.length} tracked`}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
