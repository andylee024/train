/**
 * L3 lift trajectory widget — wraps BarChartViz with a single lift's session
 * history. Card-level href drills into the per-lift detail page.
 *
 * If the lift has no data in the lookback window, the widget renders an
 * empty-state placeholder.
 */
import { Widget } from "./widget";
import { BarChartViz, type BarDatum } from "@/components/viz/bar-chart-viz";
import type { KeyLiftCard } from "@/lib/queries";
import { nameToSlug } from "@/lib/queries";
import { format } from "@/lib/format";

const KG_PER_LB = 0.45359237;
const MAX_BARS = 20;

export function LiftTrajectoryWidget({ card }: { card: KeyLiftCard }) {
  const hasData = card.sparkline.length > 0;
  const currentLb = card.currentE1rm_kg
    ? Math.round(card.currentE1rm_kg / KG_PER_LB)
    : null;
  const prLb = card.pr ? Math.round(card.pr.e1rm_kg / KG_PER_LB) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const prDate = card.pr ? new Date(card.pr.date) : null;
  const isPRToday = prDate && prDate.toDateString() === today.toDateString();
  let ageLabel = "—";
  if (prDate) {
    const ageDays = Math.max(
      0,
      Math.floor((today.getTime() - prDate.getTime()) / 86400000)
    );
    if (isPRToday) ageLabel = "today";
    else if (ageDays < 7) ageLabel = `${ageDays}d ago`;
    else if (ageDays < 60) ageLabel = `${Math.round(ageDays / 7)}w ago`;
    else ageLabel = `${Math.round(ageDays / 30)}mo ago`;
  }

  const sampled = hasData ? sampleSparkline(card.sparkline, MAX_BARS) : [];
  const data: BarDatum[] = sampled.map((s) => ({
    key: s.date,
    value: Math.round(s.e1rm_kg / KG_PER_LB),
    highlight: card.pr
      ? s.date.slice(0, 10) === card.pr.date.slice(0, 10)
      : false,
  }));

  const meta =
    currentLb != null
      ? `${currentLb} lb${prLb != null ? ` · PR ${prLb} · ${ageLabel}${isPRToday ? " ✦" : ""}` : ""}`
      : "no data in lookback";

  return (
    <Widget
      title={card.name}
      meta={meta}
      href={`/progress/${nameToSlug(card.name)}`}
      state={hasData ? "ok" : "empty"}
      emptyMessage="no sessions in last 6 months"
    >
      <BarChartViz
        data={data}
        height={80}
        referenceY={prLb ?? undefined}
        valueFormatter={(v) => `${v} lb`}
        tickFormatter={(d) => format.shortDate(d)}
      />
    </Widget>
  );
}

function sampleSparkline<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const step = (arr.length - 1) / (n - 1);
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(arr[Math.round(i * step)]);
  }
  return out;
}
