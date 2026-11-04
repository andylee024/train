"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, formatInches, formatLb, formatShort } from "@/lib/format";
import type { BodyweightPoint, E1rmPoint, JumpAttempt, WeekBar } from "@/lib/types";

const AXIS = "#8d887f";
const GRID = "rgba(242, 239, 232, 0.08)";
const LIME = "#d6ff4a";
const BLUE = "#8eb6ff";
const AMBER = "#ffb020";
const PAPER = "#f2efe8";

/** Mount charts after layout so the responsive container has a width. */
function ChartFrame({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <div className="chart">{ready ? children : null}</div>;
}

function Tip({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="tip">
      <p>{title}</p>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function axisDomain(values: number[]): [number, number] {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const pad = Math.max(8, (high - low) * 0.16);
  return [Math.max(0, Math.floor(low - pad)), Math.ceil(high + pad)];
}

/** Estimated-1RM line with an optional goal. */
export function E1rmChart({ points, goalLb }: { points: E1rmPoint[]; goalLb: number | null }) {
  const domain = axisDomain(points.map((point) => point.e1rmLb).concat(goalLb ?? []));
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShort}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={domain}
            tickFormatter={(value: number) => formatLb(value)}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as E1rmPoint;
              return (
                <Tip
                  title={formatDate(point.date)}
                  lines={[`${formatLb(point.e1rmLb)} lb e1RM`, `${formatLb(point.weightLb)} × ${point.reps}`]}
                />
              );
            }}
          />
          {goalLb != null ? (
            <ReferenceLine
              y={goalLb}
              stroke={AMBER}
              strokeDasharray="4 4"
              label={{ value: `${formatLb(goalLb)} goal`, fill: AMBER, fontSize: 11, position: "insideTopRight" }}
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="e1rmLb"
            stroke={LIME}
            strokeWidth={2}
            dot={points.length < 8}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/** Weekly loaded tonnage for every lift. */
export function TonnageChart({ weeks }: { weeks: WeekBar[] }) {
  const interval = Math.max(0, Math.ceil(weeks.length / 8) - 1);
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeks} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatShort}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={interval}
          />
          <YAxis
            tickFormatter={(value: number) => formatLb(value)}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const bar = payload[0].payload as WeekBar;
              return (
                <Tip title={`Week of ${formatDate(bar.weekStart)}`} lines={[`${formatLb(bar.tonnageLb)} lb`]} />
              );
            }}
          />
          <Bar dataKey="tonnageLb" fill={BLUE} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/** Bodyweight in pounds. */
export function BodyweightChart({ points }: { points: BodyweightPoint[] }) {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShort}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={axisDomain(points.map((point) => point.bodyweightLb))}
            tickFormatter={(value: number) => formatLb(value)}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as BodyweightPoint;
              return (
                <Tip title={formatDate(point.date)} lines={[`${formatLb(point.bodyweightLb, 1)} lb`]} />
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="bodyweightLb"
            stroke={PAPER}
            strokeWidth={2}
            dot={{ r: 3, fill: PAPER }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/** Approach-touch height in inches. */
export function TouchChart({ attempts }: { attempts: JumpAttempt[] }) {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={attempts} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShort}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={axisDomain(attempts.map((attempt) => attempt.inches))}
            tickFormatter={(value: number) => `${value}"`}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const attempt = payload[0].payload as JumpAttempt;
              return (
                <Tip
                  title={formatDate(attempt.date)}
                  lines={[formatInches(attempt.inches), attempt.exercise]}
                />
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="inches"
            stroke={LIME}
            strokeWidth={2}
            dot={{ r: 3, fill: LIME }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
