import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/cn";
import { nameToSlug } from "@/lib/queries";
import type { DimensionIndex } from "@/lib/athlete-index";

function fmt(v: number, dp = 1): string {
  return v.toFixed(dp);
}

export function DimensionBreakdown({ dim }: { dim: DimensionIndex }) {
  const valid = dim.components.filter((c) => c.hasData);
  const missing = dim.components.filter((c) => !c.hasData);

  return (
    <Card id={`dim-${dim.key}`} className="scroll-mt-6">
      <CardHeader>
        <div>
          <CardTitle>{dim.label}</CardTitle>
          <div className="mt-1 text-xs text-[var(--ink-muted)]">
            {dim.status === "no-data"
              ? "no data source yet — add logging to bring this dimension online"
              : "components averaged into the dimension index"}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular">
            {dim.status === "no-data" ? "—" : fmt(dim.index)}
          </div>
          <div
            className={cn(
              "text-xs tabular",
              dim.delta > 0
                ? "text-[var(--good)]"
                : dim.delta < 0
                  ? "text-[var(--bad)]"
                  : "text-[var(--ink-muted)]"
            )}
          >
            {dim.status === "no-data"
              ? ""
              : `${dim.delta > 0 ? "▲ +" : dim.delta < 0 ? "▼ " : "▬ "}${fmt(Math.abs(dim.delta))}`}
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-1">
        {valid.length === 0 && missing.length === 0 ? (
          <div className="text-sm text-[var(--ink-muted)] py-3">
            Nothing to roll up here yet.
          </div>
        ) : (
          <div className="text-sm">
            <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr_0.9fr_24px] gap-3 px-1 pb-2 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--ink-muted)]">
              <div>Component</div>
              <div className="text-right">Baseline</div>
              <div className="text-right">Current</div>
              <div className="text-right">Δ</div>
              <div className="text-right">Index</div>
              <div />
            </div>

            {valid.map((c) => {
              const drillable = dim.key === "strength" || dim.key === "power";
              const slug = nameToSlug(c.name);
              const Row = (
                <>
                  <div className="font-medium text-[var(--ink)]">{c.name}</div>
                  <div className="text-right tabular text-[var(--ink-dim)]">
                    {fmt(c.baseline)} {c.unit}
                  </div>
                  <div className="text-right tabular">
                    {fmt(c.current)} {c.unit}
                  </div>
                  <div
                    className={cn(
                      "text-right tabular",
                      c.delta > 0
                        ? "text-[var(--good)]"
                        : c.delta < 0
                          ? "text-[var(--bad)]"
                          : "text-[var(--ink-muted)]"
                    )}
                  >
                    {c.delta > 0 ? "+" : ""}{fmt(c.delta)}
                  </div>
                  <div
                    className={cn(
                      "text-right tabular",
                      c.ratio > 100
                        ? "text-[var(--good)]"
                        : c.ratio < 100
                          ? "text-[var(--bad)]"
                          : "text-[var(--ink-dim)]"
                    )}
                  >
                    {fmt(c.ratio)}
                  </div>
                  <div className="text-right text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors">
                    {drillable ? "›" : ""}
                  </div>
                </>
              );
              return drillable ? (
                <Link
                  key={c.name}
                  href={`/progress/${slug}`}
                  className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr_0.9fr_24px] gap-3 px-1 py-2.5 border-b border-[var(--line-soft)] last:border-0 hover:bg-[var(--bg-elev-2)] transition-colors group"
                >
                  {Row}
                </Link>
              ) : (
                <div
                  key={c.name}
                  className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr_0.9fr_24px] gap-3 px-1 py-2.5 border-b border-[var(--line-soft)] last:border-0"
                >
                  {Row}
                </div>
              );
            })}

            {missing.map((c) => (
              <div
                key={c.name}
                className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr_0.9fr_24px] gap-3 px-1 py-2.5 border-b border-[var(--line-soft)] last:border-0 opacity-50"
              >
                <div className="font-medium text-[var(--ink-muted)]">{c.name}</div>
                <div className="text-right text-[var(--ink-muted)]">─</div>
                <div className="text-right text-[var(--ink-muted)]">─</div>
                <div className="text-right text-[var(--ink-muted)]">─</div>
                <div className="text-right text-[var(--ink-muted)]">no data</div>
                <div />
              </div>
            ))}

            {/* Footer: average */}
            {valid.length > 0 && (
              <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr_0.9fr_24px] gap-3 px-1 py-2.5 border-t-2 border-[var(--line)] mt-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--ink-muted)] self-center">
                  Dimension index = mean of {valid.length}
                </div>
                <div />
                <div />
                <div />
                <div
                  className={cn(
                    "text-right tabular font-semibold",
                    dim.index > 100
                      ? "text-[var(--good)]"
                      : dim.index < 100
                        ? "text-[var(--bad)]"
                        : "text-[var(--ink-dim)]"
                  )}
                >
                  {fmt(dim.index)}
                </div>
                <div />
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
