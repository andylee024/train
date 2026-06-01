"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DaySession } from "@/lib/coach-profiles";
import { cn } from "@/lib/cn";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Renders a coach's 7-day strip + an inline expanded sample session for the
 * selected day. Used on both the coach profile page (single coach) and the
 * compare page (one viewer per coach, stacked).
 *
 * Default expanded day: the first non-rest day.
 */
export function WeeklySessionsViewer({
  weekStructure,
  accent,
  compact = false,
}: {
  weekStructure: DaySession[];
  accent: string;
  /** When true, hide the inline expanded session (just show the strip). */
  compact?: boolean;
}) {
  const firstTrainingDay = weekStructure.findIndex((d) => !d.isRest);
  const [openIdx, setOpenIdx] = useState<number>(firstTrainingDay === -1 ? 0 : firstTrainingDay);

  const openDay = weekStructure[openIdx];

  return (
    <div>
      {/* 7-day strip */}
      <div className="grid grid-cols-7 gap-1.5 mb-3 text-[11px]">
        {weekStructure.map((day, i) => {
          const isOpen = i === openIdx;
          const isRest = !!day.isRest;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !isRest && setOpenIdx(i)}
              disabled={isRest}
              className={cn(
                "p-2 rounded-sm border text-center transition-colors",
                isRest
                  ? "bg-[var(--bg-elev-2)] border-[var(--line-soft)] text-[var(--ink-muted)] cursor-default"
                  : isOpen
                    ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "bg-[var(--bg-elev-1)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent-line)] cursor-pointer"
              )}
              aria-pressed={isOpen}
              aria-label={isRest ? `${DAY_LABELS[i]} rest` : `Show ${DAY_LABELS[i]} session`}
            >
              <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                {DAY_LABELS[i]}
              </div>
              <div className="text-[10px] leading-tight truncate">{day.name}</div>
            </button>
          );
        })}
      </div>

      {/* Expanded session */}
      {!compact && openDay && !openDay.isRest && openDay.exercises && (
        <div className="rounded-md border border-[var(--line)] bg-[var(--bg-elev-1)] p-4 mt-2">
          <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-[var(--line-soft)]">
            <div className="flex items-baseline gap-2">
              <ChevronDown size={12} style={{ color: accent }} className="self-center" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                {DAY_LABELS[openIdx]}
              </span>
              <span className="text-[13px] font-medium text-[var(--ink)]">{openDay.name}</span>
            </div>
            {openDay.duration && (
              <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
                {openDay.duration}
              </span>
            )}
          </div>
          <ol className="space-y-2">
            {openDay.exercises.map((ex, i) => (
              <li
                key={`${openIdx}-${i}`}
                className="grid grid-cols-[20px_1fr_auto] gap-3 items-baseline text-[12px] py-1"
              >
                <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular text-right">
                  {i + 1}.
                </span>
                <div className="min-w-0">
                  <div className="text-[var(--ink)] leading-snug">{ex.name}</div>
                  {ex.note && (
                    <div className="text-[10px] text-[var(--ink-muted)] italic mt-0.5">{ex.note}</div>
                  )}
                </div>
                <div className="flex items-baseline gap-3 text-[11px] font-mono text-[var(--ink-dim)] tabular shrink-0">
                  <span>
                    {ex.sets}×{ex.reps}
                  </span>
                  {ex.load && <span className="text-[var(--ink-muted)]">{ex.load}</span>}
                  {ex.rest && <span className="text-[var(--ink-muted)]">{ex.rest}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!compact && openDay?.isRest && (
        <div className="rounded-md border border-dashed border-[var(--line)] p-4 text-[11px] text-[var(--ink-muted)] text-center mt-2">
          Rest day — recovery
        </div>
      )}
    </div>
  );
}
