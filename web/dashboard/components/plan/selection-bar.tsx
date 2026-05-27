"use client";

import { X } from "lucide-react";
import { CATEGORIES, getCoach, initials } from "@/lib/coaches";
import { cn } from "@/lib/cn";

export function SelectionBar({
  selected,
  onRemove,
  onClear,
  onBuild,
  building = false,
}: {
  selected: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onBuild: () => void;
  building?: boolean;
}) {
  if (selected.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3 backdrop-blur-md bg-[rgba(10,13,18,0.85)] border-t border-[var(--line)]">
      <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
        {/* Pills */}
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {selected.map((id) => {
            const coach = getCoach(id);
            if (!coach) return null;
            const accent = CATEGORIES[coach.category].accent;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[var(--bg-elev-2)] border border-[var(--line)] text-[11px]"
              >
                <span
                  className="w-5 h-5 rounded-full grid place-items-center text-[9px] font-semibold text-white tabular"
                  style={{ background: accent }}
                >
                  {initials(coach.name)}
                </span>
                <span className="text-[var(--ink)]">{coach.name}</span>
                <button
                  onClick={() => onRemove(id)}
                  className="text-[var(--ink-muted)] hover:text-[var(--bad)] transition-colors p-0.5"
                  aria-label="Remove"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>

        {/* Count + actions */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
            {selected.length} selected
          </span>
          <button
            onClick={onClear}
            className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1.5 rounded-sm border border-[var(--line)] transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onBuild}
            disabled={building}
            className={cn(
              "text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-sm transition-opacity",
              building
                ? "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] cursor-not-allowed"
                : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
            )}
          >
            {building ? "Composing…" : "Build plan →"}
          </button>
        </div>
      </div>
    </div>
  );
}
