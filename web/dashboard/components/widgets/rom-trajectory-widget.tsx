/**
 * L3 ROM trajectory widget — line chart of a single ROM test over time.
 *
 * Mirrors `bw-trend-widget` but pulls from `ctx.romSeries` (one entry per
 * `rom_test_types.name`). No target line yet — reference targets land when the
 * arc plan starts tracking ROM goals.
 */
import { Widget } from "./widget";
import { LineChartViz, type LinePoint } from "@/components/viz/line-chart-viz";
import type { ROMSeries } from "@/lib/queries";

export type ROMTrajectoryWidgetProps = {
  series: ROMSeries | null;
  title?: string;
};

export function ROMTrajectoryWidget({
  series,
  title,
}: ROMTrajectoryWidgetProps) {
  const name = series?.type.name ?? title ?? "ROM";
  const unit = series?.type.unit ?? "";
  const hasData = (series?.rows.length ?? 0) > 0;

  const data: LinePoint[] = (series?.rows ?? []).map((r) => ({
    key: new Date(r.measured_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: r.value,
  }));

  return (
    <Widget
      title={title ?? name}
      meta={unit ? `${unit} · trajectory` : "trajectory"}
      state={hasData ? "ok" : "empty"}
      emptyMessage="no measurements yet"
    >
      <LineChartViz
        data={data}
        height={200}
        valueFormatter={(v) => `${v.toFixed(1)}`}
        valueLabel={name.toLowerCase()}
        unit={unit ? ` ${unit}` : ""}
      />
    </Widget>
  );
}
