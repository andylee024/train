/**
 * L3 ROM change-list widget — diverging bars over % delta in the last 30 days.
 *
 * Direction polarity follows each test's `better_direction` so the right side
 * of the rail always means "improving". Sub text shows previous → current in
 * the test's native unit.
 */
import { Widget } from "./widget";
import {
  DivergingBarList,
  type DivergingBarRow,
} from "@/components/viz/diverging-bar-list";
import type { ROMHeadline } from "@/lib/queries";

export type ROMChangeListWidgetProps = {
  headlines: ROMHeadline[];
  /** Optional name filter. */
  filterNames?: string[];
};

export function ROMChangeListWidget({
  headlines,
  filterNames,
}: ROMChangeListWidgetProps) {
  const filtered = filterNames?.length
    ? headlines.filter((h) => filterNames.includes(h.name))
    : headlines;

  const rows: DivergingBarRow[] = filtered
    .filter((h) => h.pctDelta30 != null)
    .map((h) => {
      // Sign flip when "better" is a decrease, so the bar always points right
      // when the athlete is improving.
      const signed =
        h.betterDirection === "decrease" ? -(h.pctDelta30 ?? 0) : (h.pctDelta30 ?? 0);
      const sub =
        h.current != null && h.delta30 != null
          ? `${(h.current - h.delta30).toFixed(1)} → ${h.current.toFixed(1)} ${h.unit}`
          : `— ${h.unit}`;
      return {
        key: h.name,
        name: h.name,
        value: +signed.toFixed(1),
        sub,
      };
    })
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <Widget title="30-day change" meta="% delta · positive = improving">
      <DivergingBarList
        rows={rows}
        emptyMessage="no measurements in the last 30 days"
      />
    </Widget>
  );
}
