"use client";

import Link from "next/link";
import { GitCompareArrows, Plus, X } from "lucide-react";
import { CATEGORIES, getCoach, initials } from "@/lib/coaches";
import { MAX_COACHES } from "@/lib/use-selection";
import { cn } from "@/lib/cn";

/**
 * Persistent right-rail panel showing the athlete's selected coaches.
 * Renders on lg+ screens only — small screens fall back to <SelectionBar>'s
 * bottom-pill UI. Mirrors SelectionBar's actions (remove, clear, compare,
 * build) but in a vertical layout that stays in view while browsing.
 */
export function TeamSidebar({
  selected,
  onRemove,
  onClear,
  onBuild,
  building = false,
  showBuildCta = true,
}: {
  selected: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onBuild?: () => void;
  building?: boolean;
  showBuildCta?: boolean;
}) {
  const count = selected.length;
  const canCompare = count >= 2 && count <= MAX_COACHES;
  const compareHref = `/plan/compare?ids=${selected.slice(0, MAX_COACHES).join(",")}`;
  const slotsRemaining = Math.max(0, MAX_COACHES - count);

  return (
    <aside className="hidden lg:block sticky top-4 self-start w-[280px] shrink-0">
      <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-4">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--ink)]">
            Your team
          </span>
          <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
            {count} of {MAX_COACHES}
          </span>
        </div>

        {/* Slots */}
        <ol className="space-y-2 mb-3">
          {Array.from({ length: MAX_COACHES }).map((_, idx) => {
            const id = selected[idx];
            if (id) {
              const coach = getCoach(id);
              if (!coach) return null;
              const accent = CATEGORIES[coach.category].accent;
              return (
                <li key={id}>
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-[var(--bg-elev-2)] border border-[var(--line)]">
                    <span
                      className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold text-white tabular"
                      style={{ background: accent }}
                    >
                      {initials(coach.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/plan/coaches/${coach.id}`}
                        className="block text-[12px] text-[var(--ink)] truncate hover:text-[var(--accent)]"
                      >
                        {coach.name}
                      </Link>
                      <div className="text-[9px] font-mono text-[var(--ink-muted)] uppercase tracking-wider truncate">
                        {CATEGORIES[coach.category].label}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(id)}
                      className="shrink-0 p-1 text-[var(--ink-muted)] hover:text-[var(--bad,#c33)] transition-colors"
                      aria-label={`Remove ${coach.name}`}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </li>
              );
            }
            return (
              <li key={`empty-${idx}`}>
                <div className="flex items-center gap-2 p-2 rounded-sm border border-dashed border-[var(--line)] text-[var(--ink-muted)]">
                  <span className="shrink-0 w-7 h-7 rounded-full grid place-items-center border border-dashed border-[var(--line-soft)]">
                    <Plus size={11} />
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    Slot {idx + 1}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Footer actions */}
        {count > 0 && (
          <div className="space-y-2 pt-3 border-t border-[var(--line-soft)]">
            {showBuildCta && onBuild && (
              <button
                onClick={onBuild}
                disabled={building}
                className={cn(
                  "block w-full text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm transition-opacity",
                  building
                    ? "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] cursor-not-allowed"
                    : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
                )}
              >
                {building ? "Composing…" : "Build plan →"}
              </button>
            )}
            <div className="flex items-center gap-2">
              {canCompare && (
                <Link
                  href={compareHref}
                  className="flex-1 text-center text-[10px] font-mono uppercase tracking-wider px-2 py-1.5 rounded-sm border border-[var(--line)] text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-[var(--accent-line)] transition-colors flex items-center justify-center gap-1"
                >
                  <GitCompareArrows size={11} /> Compare
                </Link>
              )}
              <button
                onClick={onClear}
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wider px-2 py-1.5 rounded-sm border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors",
                  canCompare ? "shrink-0" : "flex-1"
                )}
              >
                Clear
              </button>
            </div>
            {slotsRemaining > 0 && (
              <div className="text-[10px] font-mono text-[var(--ink-muted)] tabular text-center pt-1">
                {slotsRemaining} more slot{slotsRemaining > 1 ? "s" : ""} available
              </div>
            )}
          </div>
        )}

        {count === 0 && (
          <div className="text-[11px] text-[var(--ink-muted)] leading-relaxed pt-2">
            Pick coaches whose programming you trust — we'll synthesize their styles into one plan.
          </div>
        )}
      </div>
    </aside>
  );
}
