/**
 * L3 lift change widget — wraps the existing AllLifts (filter chips + diverging
 * bar list) in <Widget> chrome.
 *
 * Per-row drill lives inside AllLifts; the widget itself has no card-level href.
 * `additionalFilters` is the v2 hook for user-defined filter chips.
 */
import { Widget } from "./widget";
import { AllLifts, type AllLiftsFilter } from "@/components/all-lifts";
import type { LiftChange } from "@/lib/queries";

export function LiftChangeWidget({
  lifts,
  keyNames = [],
  additionalFilters = [],
}: {
  lifts: LiftChange[];
  keyNames?: string[];
  additionalFilters?: AllLiftsFilter[];
}) {
  return (
    <Widget title="All Lifts">
      <AllLifts
        lifts={lifts}
        keyNames={keyNames}
        additionalFilters={additionalFilters}
      />
    </Widget>
  );
}
