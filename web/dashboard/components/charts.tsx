"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";

const COLORS = {
  accent: "#5b9eff",
  ink: "#eef1f5",
  muted: "#4a5160",
  line: "#1f2530",
  tooltipBg: "#11151c",
  tooltipBorder: "#1f2530",
};

export function LineChartCard({
  data,
  xKey,
  yKey,
  label,
  color = COLORS.accent,
  unit,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  label: string;
  color?: string;
  unit?: string;
}) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.line }}
          />
          <YAxis
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: COLORS.tooltipBg,
              border: `1px solid ${COLORS.tooltipBorder}`,
              borderRadius: 4,
              fontSize: 11,
              color: COLORS.ink,
            }}
            labelStyle={{ color: COLORS.ink, fontSize: 11 }}
            itemStyle={{ color: COLORS.ink }}
            formatter={(v) => [`${Number(v)}${unit ?? ""}`, label]}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, stroke: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({
  data,
  yKey,
  color = COLORS.accent,
  height = 32,
}: {
  data: Record<string, unknown>[];
  yKey: string;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center text-[var(--ink-muted)] font-mono text-xs">
        ───
      </div>
    );
  }
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${yKey}-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${yKey}-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VolumeBars({
  data,
  xKey,
  yKey,
  color = COLORS.accent,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
}) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={COLORS.line} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: COLORS.line }}
          />
          <YAxis
            stroke={COLORS.muted}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,122,61,0.06)" }}
            contentStyle={{
              backgroundColor: COLORS.tooltipBg,
              border: `1px solid ${COLORS.tooltipBorder}`,
              borderRadius: 4,
              fontSize: 11,
              color: COLORS.ink,
            }}
            labelStyle={{ color: COLORS.ink }}
            itemStyle={{ color: COLORS.ink }}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
