/**
 * Widget engine type system.
 *
 * `WidgetSpec` is a discriminated union — adding a new widget kind means
 * adding a variant here AND a case in the `<DashboardRenderer>` switch. Both
 * sites are typechecked.
 *
 * `w` (column span) is constrained to the static set [3, 4, 6, 12] so
 * Tailwind's scanner can statically pick up `col-span-3` / `col-span-4` /
 * `col-span-6` / `col-span-12` from the renderer.
 */

import type { AllLiftsFilter } from "@/components/all-lifts";

export type ColumnSpan = 3 | 4 | 6 | 12;

// ----- Per-widget prop shapes ------------------------------------------------

export type KpiWidgetSpecProps = {
  caption: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat" | null;
  href?: string;
};

export type LiftTrajectoryWidgetSpecProps = {
  liftName: string;
};

export type PrLogWidgetSpecProps = {
  lookbackDays?: number;
  limit?: number;
};

export type LiftChangeWidgetSpecProps = {
  keyNames?: string[];
  additionalFilters?: AllLiftsFilter[];
};

export type BwTrendWidgetSpecProps = {
  title?: string;
  lookbackDays?: number;
};

// ----- Discriminated union ---------------------------------------------------

export type WidgetSpec =
  | { kind: "kpi";             w: ColumnSpan; props: KpiWidgetSpecProps }
  | { kind: "lift-trajectory"; w: ColumnSpan; props: LiftTrajectoryWidgetSpecProps }
  | { kind: "pr-log";          w: ColumnSpan; props: PrLogWidgetSpecProps }
  | { kind: "lift-change";     w: ColumnSpan; props: LiftChangeWidgetSpecProps }
  | { kind: "bw-trend";        w: ColumnSpan; props: BwTrendWidgetSpecProps };

export type DashboardSection = {
  label?: string;
  meta?: string;
  widgets: WidgetSpec[];
};

export type DashboardConfig = {
  id: string;
  sections: DashboardSection[];
};
