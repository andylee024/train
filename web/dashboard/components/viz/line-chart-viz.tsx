"use client";

/**
 * L2 viz primitive — line chart with optional second overlay line (e.g. for a
 * target curve, baseline, prediction). Pure data → pixels.
 *
 * Designed for nutrition's BW vs Curve view but generic enough for any
 * dual-series comparison. North palette.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ACCENT = "#5b9eff";
const INK = "#eef1f5";
const MUTED = "#4a5160";
const LINE = "#1f2530";
const DIM = "#8b91a0";

export type LinePoint = {
  key: string;
  value: number | null;
  overlay?: number | null;
};

export type LineChartVizProps = {
  data: LinePoint[];
  height?: number;
  valueFormatter?: (v: number) => string;
  tickFormatter?: (key: string) => string;
  valueLabel?: string;       // legend label for the main line
  overlayLabel?: string;     // legend label for the overlay line
  unit?: string;
};

export function LineChartViz({
  data,
  height = 200,
  valueFormatter,
  tickFormatter,
  valueLabel = "value",
  overlayLabel = "target",
  unit = "",
}: LineChartVizProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[10px] font-mono text-[var(--ink-muted)] opacity-60"
        style={{ height }}
      >
        no data
      </div>
    );
  }
  const hasOverlay = data.some((d) => d.overlay != null);
  return (
    <div style={{ height }} className="-mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={LINE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="key"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: LINE }}
            interval="preserveStartEnd"
            tickFormatter={tickFormatter}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            width={36}
            domain={["dataMin - 1", "dataMax + 1"]}
            tickFormatter={(v: number) =>
              valueFormatter ? valueFormatter(v) : String(v)
            }
          />
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
            formatter={(v, name) => {
              if (v == null) return ["—", String(name)];
              const n = Number(v);
              const formatted = valueFormatter ? valueFormatter(n) : `${n}${unit}`;
              return [formatted, String(name)];
            }}
          />
          {hasOverlay && (
            <Line
              type="monotone"
              dataKey="overlay"
              name={overlayLabel}
              stroke={DIM}
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={ACCENT}
            strokeWidth={1.5}
            dot={{ r: 2, fill: ACCENT, stroke: ACCENT }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
