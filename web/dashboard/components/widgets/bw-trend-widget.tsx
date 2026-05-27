/**
 * L3 BW trend widget — wraps LineChartViz with bodyweight + target curve data.
 *
 * Reads the BW series from RenderContext.bwSeries. No card-level href
 * (no per-day drill yet). Click-throughs from individual points can come later.
 */
import { Widget } from "./widget";
import { LineChartViz, type LinePoint } from "@/components/viz/line-chart-viz";

export type BwTrendWidgetProps = {
  title?: string;
  lookbackDays?: number;
  series: { date: string; bw: number | null; target: number }[];
};

export function BWTrendWidget({
  title = "Bodyweight",
  lookbackDays = 60,
  series,
}: BwTrendWidgetProps) {
  const hasData = series.some((d) => d.bw != null);
  const data: LinePoint[] = series.map((d) => ({
    key: d.date,
    value: d.bw,
    overlay: d.target,
  }));

  return (
    <Widget
      title={title}
      meta={`vs cut curve · last ${lookbackDays} d`}
      state={hasData ? "ok" : "empty"}
      emptyMessage="no bodyweight logs yet"
    >
      <LineChartViz
        data={data}
        height={220}
        valueFormatter={(v) => `${v.toFixed(1)}`}
        valueLabel="bw"
        overlayLabel="target"
        unit=" lb"
      />
    </Widget>
  );
}
