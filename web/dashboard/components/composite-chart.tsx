"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Dot,
} from "recharts";
import {
  computeComposite,
  type BaselineMode,
  type ComponentSeries,
  type CompositePoint,
} from "@/lib/composite";
import { cn } from "@/lib/cn";

const ACCENT = "#5b9eff";
const INK = "#eef1f5";
const MUTED = "#4a5160";
const LINE = "#1f2530";

const BASELINE_LABELS: Record<BaselineMode, string> = {
  "arc": "this arc",
  "all-time": "all-time",
  "12-months": "last 12 months",
};

export function CompositeChart({
  components,
  arcStartIso,
}: {
  components: ComponentSeries[];
  arcStartIso: string;
}) {
  const [baseline, setBaseline] = useState<BaselineMode>("arc");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const points = useMemo(
    () => computeComposite(components, baseline, arcStartIso, 12),
    [components, baseline, arcStartIso]
  );

  const validPoints = points.filter((p) => p.composite != null);
  const latest = validPoints[validPoints.length - 1];
  const baselinePoint = validPoints[0];
  const delta =
    latest && baselinePoint && latest.composite != null && baselinePoint.composite != null
      ? +(latest.composite - baselinePoint.composite).toFixed(1)
      : null;

  const tone = delta == null
    ? "text-[var(--ink-muted)]"
    : delta > 0.5 ? "text-[var(--good)]"
    : delta < -0.5 ? "text-[var(--bad)]"
    : "text-[var(--ink-dim)]";
  const arrow = delta == null ? "·" : delta > 0.5 ? "↗" : delta < -0.5 ? "↘" : "→";

  const chartData = points.map((p) => ({
    date: p.date,
    label: new Date(p.date).toLocaleDateString("en-US", { month: "short" }),
    value: p.composite,
  }));

  // Auto-scale Y axis with padding
  const values = points.map((p) => p.composite).filter((v): v is number => v != null);
  const minV = values.length ? Math.floor(Math.min(...values) - 2) : 95;
  const maxV = values.length ? Math.ceil(Math.max(...values) + 2) : 110;

  const detailPoint =
    selectedIdx != null && points[selectedIdx]
      ? points[selectedIdx]
      : latest ?? null;

  return (
    <div>
      {/* Header row: composite value + delta + baseline picker */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-semibold tabular leading-none">
            {latest?.composite != null ? latest.composite.toFixed(1) : "—"}
          </span>
          {delta != null && (
            <span className={cn("text-xs tabular font-mono", tone)}>
              {arrow} {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] ml-2">
            vs {BASELINE_LABELS[baseline]}
          </span>
        </div>
        <BaselinePicker value={baseline} onChange={setBaseline} />
      </div>

      {/* Line chart */}
      <div className="h-[100px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            onClick={(e) => {
              if (e && e.activeTooltipIndex != null) setSelectedIdx(Number(e.activeTooltipIndex));
            }}
          >
            <XAxis
              dataKey="label"
              tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: LINE }}
              interval={1}
            />
            <YAxis
              domain={[minV, maxV]}
              tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <ReferenceLine y={100} stroke={MUTED} strokeDasharray="2 2" strokeOpacity={0.5} />
            <Tooltip
              cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: "2 2" }}
              contentStyle={{
                backgroundColor: "#11151c",
                border: `1px solid ${LINE}`,
                borderRadius: 4,
                fontSize: 11,
                color: INK,
                padding: "4px 6px",
              }}
              labelStyle={{ color: MUTED, fontSize: 10 }}
              formatter={(v) => {
                if (v == null) return ["—", ""];
                const n = Number(v);
                return [Number.isFinite(n) ? n.toFixed(1) : "—", "index"];
              }}
              separator=""
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={ACCENT}
              strokeWidth={1.5}
              dot={(props) => {
                const { cx, cy, index } = props;
                if (cx == null || cy == null) return <></>;
                const isSelected = selectedIdx === index;
                return (
                  <Dot
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 4 : 2.5}
                    fill={ACCENT}
                    stroke={isSelected ? INK : ACCENT}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />
                );
              }}
              activeDot={{ r: 4, fill: ACCENT }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown */}
      {detailPoint && (
        <Breakdown point={detailPoint} isLatest={detailPoint === latest} />
      )}
    </div>
  );
}

function BaselinePicker({
  value,
  onChange,
}: {
  value: BaselineMode;
  onChange: (v: BaselineMode) => void;
}) {
  const opts: { mode: BaselineMode; label: string }[] = [
    { mode: "arc", label: "arc" },
    { mode: "12-months", label: "12mo" },
    { mode: "all-time", label: "all" },
  ];
  return (
    <div className="flex gap-1 text-[10px] font-mono uppercase tracking-wider">
      <span className="text-[var(--ink-muted)] mr-1">baseline:</span>
      {opts.map((o) => (
        <button
          key={o.mode}
          onClick={() => onChange(o.mode)}
          className={cn(
            "px-1.5 py-0 rounded-sm transition-colors",
            value === o.mode
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Breakdown({ point, isLatest }: { point: CompositePoint; isLatest: boolean }) {
  const label = new Date(point.date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return (
    <div className="mt-2 pt-2 border-t border-[var(--line-soft)]">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
          breakdown · {label} {!isLatest && <span className="text-[var(--accent)]">selected</span>}
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
          {point.composite != null ? `composite ${point.composite.toFixed(1)}` : "no data"}
        </span>
      </div>
      <div className="grid grid-cols-[1.5fr_auto_auto_auto] gap-x-3 gap-y-0.5 text-[11px]">
        {point.breakdown.map((b) => (
          <div key={b.name} className="contents">
            <div className="text-[var(--ink)] truncate">{b.name}</div>
            <div className="tabular text-[var(--ink-dim)] text-right">
              {b.current != null ? `${b.current.toFixed(0)} lb` : "—"}
            </div>
            <div className="tabular text-[var(--ink-muted)] text-right">
              {b.baseline != null ? `/ ${b.baseline.toFixed(0)}` : "/ —"}
            </div>
            <div className={cn(
              "tabular text-right font-mono",
              b.index == null ? "text-[var(--ink-muted)]"
                : b.index > 102 ? "text-[var(--good)]"
                : b.index < 98 ? "text-[var(--bad)]"
                : "text-[var(--ink-dim)]"
            )}>
              {b.index != null ? b.index.toFixed(0) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
