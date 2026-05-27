"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TonnageWeek } from "@/lib/queries";

const ACCENT = "#5b9eff";
const MUTED = "#4a5160";
const LINE = "#1f2530";

const KG_PER_LB = 0.45359237;

export function VolumeChart({ weeks }: { weeks: TonnageWeek[] }) {
  const data = weeks.map((w) => ({
    week: w.week.slice(5),
    lb: Math.round(w.kg / KG_PER_LB),
  }));
  const latest = data[data.length - 1]?.lb ?? 0;
  const recent = data.slice(-4);
  const recentAvg = recent.length > 0
    ? Math.round(recent.reduce((s, d) => s + d.lb, 0) / recent.length)
    : 0;
  const delta = latest - recentAvg;

  return (
    <div>
      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="week"
              tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: LINE }}
              interval={Math.max(0, Math.floor(data.length / 8))}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(91,158,255,0.1)" }}
              contentStyle={{
                backgroundColor: "#11151c",
                border: `1px solid ${LINE}`,
                borderRadius: 4,
                fontSize: 11,
                color: "#eef1f5",
                padding: "4px 6px",
              }}
              formatter={(v) => [`${Number(v).toLocaleString()} lb`, "tonnage"]}
            />
            <Bar dataKey="lb" fill={ACCENT} radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-baseline gap-4 text-[11px] font-mono text-[var(--ink-muted)] tabular">
        <span>
          last week <span className="text-[var(--ink)]">{latest.toLocaleString()} lb</span>
        </span>
        <span>
          4-wk avg <span className="text-[var(--ink-dim)]">{recentAvg.toLocaleString()} lb</span>
        </span>
        <span className={
          delta > 0 ? "text-[var(--good)]" :
          delta < 0 ? "text-[var(--bad)]" :
          "text-[var(--ink-dim)]"
        }>
          {delta > 0 ? "↗" : delta < 0 ? "↘" : "→"} {delta > 0 ? "+" : ""}{delta.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
