"use client";

/**
 * L2 viz primitive — vertical bar chart with optional top labels and a dashed
 * reference line. Pure data → pixels. No chrome.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";

const ACCENT = "#5b9eff";
const INK = "#eef1f5";
const MUTED = "#4a5160";
const LINE = "#1f2530";

export type BarDatum = {
  key: string;           // x-axis tick key (date, week, etc.)
  value: number;         // bar height + label
  highlight?: boolean;   // full-opacity bar (e.g. PR session)
  label?: string;        // x-axis tick label override
};

export type BarChartVizProps = {
  data: BarDatum[];
  height?: number;
  referenceY?: number;
  valueFormatter?: (v: number) => string;
  tickFormatter?: (key: string) => string;
  showTopLabels?: boolean;
};

export function BarChartViz({
  data,
  height = 80,
  referenceY,
  valueFormatter,
  tickFormatter,
  showTopLabels = true,
}: BarChartVizProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center text-[10px] font-mono text-[var(--ink-muted)] opacity-60"
        style={{ height }}
      >
        no data
      </div>
    );
  }
  return (
    <div style={{ height }} className="-mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: showTopLabels ? 18 : 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="key"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: LINE }}
            interval="preserveStartEnd"
            tickFormatter={tickFormatter}
          />
          <YAxis hide domain={["dataMin - 5", "dataMax + 3"]} />
          {referenceY != null && (
            <ReferenceLine
              y={referenceY}
              stroke={ACCENT}
              strokeDasharray="2 2"
              strokeOpacity={0.4}
            />
          )}
          <Tooltip
            cursor={{ fill: "rgba(91,158,255,0.08)" }}
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
              const n = Number(v);
              return [valueFormatter ? valueFormatter(n) : String(n), ""];
            }}
            separator=""
          />
          <Bar dataKey="value" radius={[1, 1, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={ACCENT}
                fillOpacity={d.highlight ? 1 : 0.55}
              />
            ))}
            {showTopLabels && (
              <LabelList
                dataKey="value"
                position="top"
                fill={INK}
                fontSize={9}
                fontFamily="monospace"
                offset={4}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
