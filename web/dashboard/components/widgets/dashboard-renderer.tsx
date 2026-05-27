"use client";

/**
 * L4 dashboard renderer — walks a DashboardConfig and renders each section as a
 * responsive 12-column grid, dispatching each widget spec to its L3 component
 * via a typed switch.
 *
 * In edit mode (controlled by EditModeProvider via context), wraps each widget
 * with hover-revealed ✕ delete + draggable handle, and renders a "+ Add Widget"
 * button at the end of each section.
 *
 * Adding a new widget kind: add a variant to `WidgetSpec` in lib/widgets/types.ts
 * AND a case in `renderWidget` below. Both sites are typechecked.
 */
import { useState, type ReactNode } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import type {
  ColumnSpan,
  DashboardConfig,
  WidgetSpec,
} from "@/lib/widgets/types";
import type { LiftChange, KeyLiftCard, ExerciseSummary, TabHeadlines } from "@/lib/queries";
import { KPIWidget } from "./kpi-widget";
import { LiftTrajectoryWidget } from "./lift-trajectory-widget";
import { PRLogWidget } from "./pr-log-widget";
import { LiftChangeWidget } from "./lift-change-widget";
import { BWTrendWidget } from "./bw-trend-widget";
import { useEditMode } from "./edit-context";
import { WidgetGallery } from "./widget-gallery";
import { cn } from "@/lib/cn";

/**
 * Shared data bag passed to every widget render. Fields are optional because
 * different dashboards populate different subsets — strength views fill the
 * lift fields, nutrition fills `bwSeries`, etc. Each widget asserts what it
 * needs.
 */
export type RenderContext = {
  // Strength-view fields
  tabLifts?: LiftChange[];
  keyLifts?: KeyLiftCard[];
  summaries?: ExerciseSummary[];
  headlines?: TabHeadlines | undefined;
  inTab?: (name: string) => boolean;
  // Nutrition fields
  bwSeries?: { date: string; bw: number | null; target: number }[];
};

const COL_SPAN: Record<ColumnSpan, string> = {
  3: "col-span-1 md:col-span-3",
  4: "col-span-1 md:col-span-4",
  6: "col-span-1 md:col-span-6",
  12: "col-span-1 md:col-span-12",
};

export function DashboardRenderer({
  config,
  ctx,
  onAdd,
}: {
  config: DashboardConfig;
  ctx: RenderContext;
  onAdd?: (sectionIdx: number, spec: WidgetSpec) => void;
}) {
  const { editing, onRemove, onReorder } = useEditMode();
  const [galleryOpenFor, setGalleryOpenFor] = useState<number | null>(null);
  const [dragInfo, setDragInfo] = useState<{ sectionIdx: number; fromIdx: number } | null>(null);

  return (
    <div className="space-y-6">
      {config.sections.map((section, si) => (
        <section key={si}>
          {(section.label || section.meta) && (
            <div className="hairline pt-2 pb-2 mb-3 flex items-baseline justify-between">
              {section.label && (
                <span className="section-label">{section.label}</span>
              )}
              {section.meta && (
                <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
                  {section.meta}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {section.widgets.map((spec, wi) => (
              <div
                key={wi}
                className={cn(COL_SPAN[spec.w], "relative")}
                draggable={editing}
                onDragStart={(e) => {
                  if (!editing) return;
                  setDragInfo({ sectionIdx: si, fromIdx: wi });
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!editing || !dragInfo || dragInfo.sectionIdx !== si) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (!editing || !dragInfo || dragInfo.sectionIdx !== si) return;
                  e.preventDefault();
                  if (dragInfo.fromIdx !== wi) {
                    onReorder?.(si, dragInfo.fromIdx, wi);
                  }
                  setDragInfo(null);
                }}
                onDragEnd={() => setDragInfo(null)}
              >
                {editing && <EditOverlay onRemove={() => onRemove?.(si, wi)} />}
                {renderWidget(spec, ctx)}
              </div>
            ))}

            {editing && (
              <div className="col-span-1 md:col-span-12 relative">
                <button
                  onClick={() => setGalleryOpenFor(si)}
                  className="w-full py-3 border border-dashed border-[var(--line)] rounded-md text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-line)] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={12} /> Add Widget
                </button>
                {galleryOpenFor === si && (
                  <WidgetGallery
                    onPick={(spec) => {
                      onAdd?.(si, spec);
                      setGalleryOpenFor(null);
                    }}
                    onClose={() => setGalleryOpenFor(null)}
                    ctx={ctx}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function EditOverlay({ onRemove }: { onRemove: () => void }) {
  return (
    <>
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
          className="p-1 rounded-sm bg-[var(--bg-elev-2)] border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--bad)] hover:border-[var(--bad)] transition-colors"
          aria-label="Remove widget"
          title="Remove"
        >
          <X size={12} />
        </button>
      </div>
      <div className="absolute top-2 left-2 z-10 text-[var(--ink-muted)] opacity-40 hover:opacity-100 cursor-grab">
        <GripVertical size={12} />
      </div>
    </>
  );
}

function renderWidget(spec: WidgetSpec, ctx: RenderContext): ReactNode {
  const wrap = (children: ReactNode) => (
    <div className="group h-full">{children}</div>
  );

  switch (spec.kind) {
    case "kpi":
      return wrap(<KPIWidget {...spec.props} />);

    case "lift-trajectory": {
      const card = ctx.keyLifts?.find((k) => k.name === spec.props.liftName);
      const safeCard: KeyLiftCard = card ?? {
        name: spec.props.liftName,
        slug: spec.props.liftName.toLowerCase().replace(/\s+/g, "-"),
        lastTouched: null,
        sessionCount: 0,
        tonnage_kg: 0,
        e1rmDelta_kg: null,
        currentE1rm_kg: null,
        pr: null,
        sparkline: [],
        status: "—",
      };
      return wrap(<LiftTrajectoryWidget card={safeCard} />);
    }

    case "pr-log":
      return wrap(
        <PRLogWidget
          summaries={ctx.summaries ?? []}
          inTab={ctx.inTab ?? (() => true)}
          lookbackDays={spec.props.lookbackDays}
          limit={spec.props.limit}
        />
      );

    case "lift-change":
      return wrap(
        <LiftChangeWidget
          lifts={ctx.tabLifts ?? []}
          keyNames={spec.props.keyNames}
          additionalFilters={spec.props.additionalFilters}
        />
      );

    case "bw-trend":
      return wrap(
        <BWTrendWidget
          title={spec.props.title}
          lookbackDays={spec.props.lookbackDays}
          series={ctx.bwSeries ?? []}
        />
      );
  }
}
