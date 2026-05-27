"use client";

import { Check, Plus, Star } from "lucide-react";
import { CATEGORIES, initials, type Coach } from "@/lib/coaches";
import { cn } from "@/lib/cn";

export function CoachCard({
  coach,
  selected,
  onToggle,
  onOpen,
  matchesGoals: _matchesGoals,
}: {
  coach: Coach;
  selected: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  matchesGoals?: boolean;
}) {
  const accent = CATEGORIES[coach.category].accent;
  const catLabel = CATEGORIES[coach.category].label;

  return (
    <div
      className={cn(
        "relative bg-[var(--bg-elev-1)] border rounded-md p-4 transition-colors cursor-pointer",
        selected
          ? "border-[var(--accent-line)]"
          : "border-[var(--line)] hover:border-[var(--accent-line)]"
      )}
      onClick={onOpen}
    >
      {/* Select button (absolutely positioned top-right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center border transition-colors z-10",
          selected
            ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]"
            : "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border-[var(--line)] hover:border-[var(--accent-line)] hover:text-[var(--accent)]"
        )}
        aria-label={selected ? "Remove" : "Add to plan"}
      >
        {selected ? <Check size={13} /> : <Plus size={13} />}
      </button>

      {/* Header: avatar + name + handle + category */}
      <div className="flex items-start gap-3 mb-3 pr-9">
        <div
          className="shrink-0 w-10 h-10 rounded-full grid place-items-center text-[12px] font-semibold text-white tabular"
          style={{ background: accent }}
        >
          {initials(coach.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-[var(--ink)] truncate">
            {coach.name}
          </div>
          <div className="text-[10px] font-mono text-[var(--ink-muted)] truncate tabular">
            {coach.handle}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-wider">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: accent }}
            />
            {catLabel}
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-[12px] text-[var(--ink-dim)] leading-snug mb-3 line-clamp-3">
        {coach.tagline}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--ink-muted)] tabular">
        <span className="flex items-center gap-1">
          <Star size={9} className="fill-[var(--ink-muted)]" />
          {coach.stats.rating}
        </span>
        <span>{coach.stats.followers}</span>
        <span>{coach.stats.programs} programs</span>
      </div>
    </div>
  );
}
