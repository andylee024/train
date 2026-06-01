"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, GitCompareArrows, Users, X } from "lucide-react";
import { CATEGORIES, getCoach, initials } from "@/lib/coaches";
import { MAX_COACHES } from "@/lib/use-selection";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  if (selected.length === 0) return null;

  const count = selected.length;
  const canCompare = count >= 2 && count <= 3;
  const compareHref = `/plan/compare?ids=${selected.slice(0, 3).join(",")}`;

  return (
    <>
      {/* MOBILE: collapsed pill + expandable drawer (<sm) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30">
        {/* Drawer panel (only when open) */}
        {mobileOpen && (
          <div className="backdrop-blur-md bg-[rgba(10,13,18,0.95)] border-t border-[var(--line)] px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
                {count} of {MAX_COACHES} on your team
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                aria-label="Collapse"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pb-2">
              {selected.map((id) => {
                const coach = getCoach(id);
                if (!coach) return null;
                const accent = CATEGORIES[coach.category].accent;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-md bg-[var(--bg-elev-2)] border border-[var(--line)]"
                  >
                    <span
                      className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-semibold text-white tabular"
                      style={{ background: accent }}
                    >
                      {initials(coach.name)}
                    </span>
                    <span className="text-[12px] text-[var(--ink)] flex-1 truncate">
                      {coach.name}
                    </span>
                    <button
                      onClick={() => onRemove(id)}
                      className="text-[var(--ink-muted)] hover:text-[var(--bad)] transition-colors p-1"
                      aria-label="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--line-soft)]">
              {canCompare && (
                <Link
                  href={compareHref}
                  className="text-[10px] font-mono uppercase tracking-wider px-2 py-1.5 rounded-sm border border-[var(--line)] text-[var(--ink-dim)] hover:text-[var(--ink)] flex items-center gap-1"
                >
                  <GitCompareArrows size={11} /> Compare
                </Link>
              )}
              <button
                onClick={onClear}
                className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1.5 rounded-sm border border-[var(--line)] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Bottom pill (always visible when selection > 0) */}
        <div className="backdrop-blur-md bg-[rgba(10,13,18,0.95)] border-t border-[var(--line)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-elev-2)] border border-[var(--line)] text-[12px] text-[var(--ink)] flex-1 max-w-[55%]"
          >
            <Users size={12} className="text-[var(--accent)]" />
            <span>View team ({count})</span>
            <ChevronUp
              size={12}
              className={cn(
                "ml-auto transition-transform text-[var(--ink-muted)]",
                mobileOpen && "rotate-180"
              )}
            />
          </button>
          <button
            onClick={onBuild}
            disabled={building}
            className={cn(
              "flex-1 text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm transition-opacity",
              building
                ? "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] cursor-not-allowed"
                : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
            )}
          >
            {building ? "Composing…" : "Build plan →"}
          </button>
        </div>
      </div>

      {/* DESKTOP / TABLET: original sticky-row layout (>=sm) */}
      <div className="hidden sm:block fixed bottom-0 left-0 right-0 z-30 px-4 py-3 backdrop-blur-md bg-[rgba(10,13,18,0.85)] border-t border-[var(--line)]">
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
              {count} of {MAX_COACHES} selected
            </span>
            {canCompare && (
              <Link
                href={compareHref}
                className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-dim)] hover:text-[var(--ink)] px-2 py-1.5 rounded-sm border border-[var(--line)] transition-colors flex items-center gap-1"
              >
                <GitCompareArrows size={11} /> Compare
              </Link>
            )}
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
    </>
  );
}
