/**
 * L3 KPI widget — wraps the BigNumber viz in <Widget> chrome.
 *
 * Card-level href is optional. When set, the whole card becomes a Link.
 */
import { Widget } from "./widget";
import { BigNumber } from "@/components/viz/big-number";
import type { KpiWidgetSpecProps } from "@/lib/widgets/types";

export function KPIWidget(props: KpiWidgetSpecProps) {
  return (
    <Widget href={props.href}>
      <BigNumber
        value={props.value}
        unit={props.unit}
        caption={props.caption}
        trend={props.trend}
      />
    </Widget>
  );
}
