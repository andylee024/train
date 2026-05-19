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
} from "recharts";

const COLORS = {
  accent: "#ff7a3d",
  ink: "#ecedef",
  muted: "#5b616c",
  line: "#232834",
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
              backgroundColor: "#11141a",
              border: "1px solid #232834",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: COLORS.ink, fontSize: 11 }}
            itemStyle={{ color: COLORS.ink }}
            formatter={(v: number) => [`${v}${unit ?? ""}`, label]}
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
              backgroundColor: "#11141a",
              border: "1px solid #232834",
              borderRadius: 8,
              fontSize: 12,
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
