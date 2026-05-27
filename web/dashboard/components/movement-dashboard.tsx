"use client";

import { useMemo } from "react";
import { Pencil, Check, RotateCcw, X as XIcon } from "lucide-react";
import { DashboardRenderer } from "@/components/widgets/dashboard-renderer";
import { EditModeProvider } from "@/components/widgets/edit-context";
import { useDashboardConfig } from "@/lib/widgets/use-dashboard-config";
import { buildMovementConfig } from "@/app/movement/dashboard";
import type { ROMSeries, ROMHeadline } from "@/lib/queries";

/**
 * Movement dashboard client. Same edit-mode shell as NutritionDashboard. The
 * widget engine reads ROM data from `ctx.romSeries` + `ctx.romHeadlines`.
 */
export function MovementDashboard({
  headlines,
  series,
}: {
  headlines: ROMHeadline[];
  series: ROMSeries[];
}) {
  const defaultConfig = useMemo(
    () => buildMovementConfig(headlines),
    [headlines]
  );
  const editor = useDashboardConfig(defaultConfig);

  const ctx = {
    romSeries: series,
    romHeadlines: headlines,
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
