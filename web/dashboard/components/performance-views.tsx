"use client";

import { useMemo, useState } from "react";
import { Pencil, Check, RotateCcw, X as XIcon } from "lucide-react";
import type {
  LiftChange,
  KeyLiftCard,
  TabHeadlines,
  ExerciseSummary,
} from "@/lib/queries";
import { DashboardRenderer } from "@/components/widgets/dashboard-renderer";
import { EditModeProvider } from "@/components/widgets/edit-context";
import { useDashboardConfig } from "@/lib/widgets/use-dashboard-config";
import { buildUpperConfig } from "@/app/strength/dashboards/upper";
import { buildLowerConfig } from "@/app/strength/dashboards/lower";
import { buildPowerConfig } from "@/app/strength/dashboards/power";
import { viewFor, VIEWS, type View } from "@/lib/view";
import { cn } from "@/lib/cn";

/**
 * Performance Views — switches between Upper / Lower / Power / Flexibility
 * lenses on the dashboard. Each view is a fully-composable widget canvas;
 * users can edit the layout per-view and persist it to localStorage.
 */
export function PerformanceViews({
  lifts,
  keyLifts,
  summaries,
  headlines,
  initialView = "Upper",
}: {
  lifts: LiftChange[];
  keyLifts: KeyLiftCard[];
  summaries: ExerciseSummary[];
  headlines: Record<string, TabHeadlines>;
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);

  return (
    <div>
      <div className="flex items-baseline gap-6 mb-5 border-b border-[var(--line)]">
        {VIEWS.map((v) => {
          const isActive = v === view;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "pb-2 -mb-px text-[11px] font-mono uppercase tracking-wider transition-colors",
                isActive
                  ? "text-[var(--accent)] border-b border-[var(--accent)]"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink-dim)]"
              )}
            >
              {v}
            </button>
          );
        })}
      </div>

      {view === "Flexibility" ? (
        <FlexibilityPlaceholder />
      ) : (
        <ViewContent
          view={view}
          lifts={lifts}
          keyLifts={keyLifts}
          summaries={summaries}
          headlines={headlines[view]}
        />
      )}
    </div>
  );
}

function ViewContent({
  view,
  lifts,
  keyLifts,
  summaries,
  headlines,
}: {
  view: Exclude<View, "Flexibility">;
  lifts: LiftChange[];
  keyLifts: KeyLiftCard[];
  summaries: ExerciseSummary[];
  headlines: TabHeadlines | undefined;
}) {
  const inView = (name: string) => viewFor(name) === view;
  const viewLifts = lifts.filter((l) => inView(l.name));

  // Build the default config from props; editor wraps with localStorage state
  const defaultConfig = useMemo(() => {
    if (view === "Upper") return buildUpperConfig(headlines);
    if (view === "Lower") return buildLowerConfig(headlines);
    return buildPowerConfig(headlines);
  }, [view, headlines]);

  const editor = useDashboardConfig(defaultConfig);

  const ctx = {
    tabLifts: viewLifts,
    keyLifts,
    summaries,
    headlines,
    inTab: inView,
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-3">
        {editor.editing ? (
          <>
            {editor.dirty && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
                unsaved
              </span>
            )}
            <button
              onClick={editor.resetToDefault}
              className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--bad)] flex items-center gap-1 px-2 py-1 rounded-sm border border-[var(--line)] hover:border-[var(--bad)]"
              title="Reset to default view"
            >
              <RotateCcw size={11} /> Reset
            </button>
            <button
              onClick={editor.cancel}
              className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1 px-2 py-1 rounded-sm border border-[var(--line)]"
            >
              <XIcon size={11} /> Cancel
            </button>
            <button
              onClick={editor.save}
              className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-ink)] bg-[var(--accent)] hover:opacity-90 flex items-center gap-1 px-2 py-1 rounded-sm"
            >
              <Check size={11} /> Save
            </button>
          </>
        ) : (
          <button
            onClick={editor.toggleEdit}
            className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--accent)] flex items-center gap-1 px-2 py-1 rounded-sm border border-[var(--line)] hover:border-[var(--accent-line)]"
            title="Edit view"
          >
            <Pencil size={11} /> Edit View
          </button>
        )}
      </div>

      <EditModeProvider
        value={{
          editing: editor.editing,
          onRemove: editor.removeWidget,
          onReorder: editor.reorderWidget,
        }}
      >
        <DashboardRenderer
          config={editor.config}
          ctx={ctx}
          onAdd={editor.addWidget}
        />
      </EditModeProvider>
    </div>
  );
}

function FlexibilityPlaceholder() {
  return (
    <div className="py-6 text-[12px] text-[var(--ink-muted)]">
      <div className="mb-2">ROM tests not yet wired.</div>
      <div className="text-[11px]">
        Once side-split tape and hip-IR ROM start logging, this view will adopt
        the same widget engine (big numbers, core lifts, all lifts).
      </div>
    </div>
  );
}
