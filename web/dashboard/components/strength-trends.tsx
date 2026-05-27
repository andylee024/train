"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import type { KeyLiftCard } from "@/lib/queries";

const ACCENT = "#5b9eff";
const MUTED = "#4a5160";
const LINE = "#1f2530";

const KG_PER_LB = 0.45359237;

/**
 * Stacked sparkline-with-axis charts. One row per key lift.
 * Y-axis at edges only. PR line as dashed reference.
 */
export function StrengthTrends({ cards }: { cards: KeyLiftCard[] }) {
  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <TrendRow key={card.name} card={card} />
      ))}
    </div>
  );
}

function TrendRow({ card }: { card: KeyLiftCard }) {
  if (card.sparkline.length === 0) {
    return (
      <div className="grid grid-cols-[140px_1fr_80px] items-center gap-3 h-14 border-b border-[var(--line-soft)] last:border-b-0">
        <div className="text-[12px] text-[var(--ink-dim)] truncate">{card.name}</div>
        <div className="text-[10px] text-[var(--ink-muted)] font-mono text-center">no data</div>
        <div />
      </div>
    );
  }

  const data = card.sparkline.map((s) => ({
    date: s.date,
    lb: +(s.e1rm_kg / KG_PER_LB).toFixed(1),
  }));
  const prLb = card.pr ? +(card.pr.e1rm_kg / KG_PER_LB).toFixed(1) : null;
  const currentLb = card.currentE1rm_kg
    ? +(card.currentE1rm_kg / KG_PER_LB).toFixed(1)
    : null;

  return (
    <div className="grid grid-cols-[140px_1fr_80px] items-center gap-3 h-14 border-b border-[var(--line-soft)] last:border-b-0">
      <div className="text-[12px] text-[var(--ink)] font-medium truncate">{card.name}</div>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            {prLb && (
              <ReferenceLine
                y={prLb}
                stroke={ACCENT}
                strokeDasharray="2 2"
                strokeOpacity={0.4}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: "#11151c",
                border: `1px solid ${LINE}`,
                borderRadius: 4,
                fontSize: 11,
                color: "#eef1f5",
                padding: "4px 6px",
              }}
              labelStyle={{ color: MUTED, fontSize: 10 }}
              formatter={(v: number) => [`${v} lb`, ""]}
              separator=""
            />
            <Line
              type="monotone"
              dataKey="lb"
              stroke={ACCENT}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: ACCENT }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-right text-[10px] font-mono text-[var(--ink-muted)] tabular leading-tight">
        {currentLb != null && <div className="text-[var(--ink-dim)] text-[12px]">{currentLb} lb</div>}
        {prLb != null && <div>PR {prLb}</div>}
      </div>
    </div>
  );
}
