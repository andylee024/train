"use client";

import Link from "next/link";
import { Check, Plus, UsersRound } from "lucide-react";
import { CATEGORIES, getCoach, initials, type Coach } from "@/lib/coaches";
import { cn } from "@/lib/cn";

export function PairsCarousel({
  pairIds,
  selected,
  onToggle,
  onAddAll,
}: {
  pairIds: string[];
  selected: string[];
  onToggle: (id: string) => void;
  onAddAll: () => void;
}) {
  const coaches = pairIds
    .map((id) => getCoach(id))
    .filter((c): c is Coach => !!c);

  if (coaches.length === 0) return null;

  const unselectedCount = coaches.filter((c) => !selected.includes(c.id)).length;

  return (
    <div>
      {/* Horizontal scroll row — snaps on mobile, fits inline on >=sm */}
      <div className="-mx-1 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-1 sm:flex-wrap sm:overflow-visible sm:snap-none">
        {coaches.map((coach) => (
          <MiniCoachCard
            key={coach.id}
            coach={coach}
            selected={selected.includes(coach.id)}
            onToggle={() => onToggle(coach.id)}
          />
        ))}
      </div>

      {unselectedCount > 0 && (
        <button
          onClick={onAddAll}
          className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity"
        >
          <UsersRound size={12} />
          Add {unselectedCount === 1 ? "this coach" : `these ${unselectedCount}`} to your team
        </button>
      )}
    </div>
  );
}

function MiniCoachCard({
  coach,
  selected,
  onToggle,
}: {
  coach: Coach;
  selected: boolean;
  onToggle: () => void;
}) {
  const accent = CATEGORIES[coach.category].accent;
  const catLabel = CATEGORIES[coach.category].label;

  return (
    <div
      className={cn(
        "relative shrink-0 w-[260px] sm:w-[240px] snap-start",
        "bg-[var(--bg-elev-1)] border rounded-md p-3 transition-colors",
        selected
          ? "border-[var(--accent-line)]"
          : "border-[var(--line)] hover:border-[var(--accent-line)]"
      )}
    >
      <Link
        href={`/plan/coaches/${coach.id}`}
        className="block pr-8"
      >
        <div className="flex items-start gap-2.5">
          <span
            className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-[10px] font-semibold text-white tabular"
            style={{ background: accent }}
          >
            {initials(coach.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-[var(--ink)] truncate">
              {coach.name}
            </div>
            <div className="text-[9px] font-mono text-[var(--ink-muted)] truncate tabular">
              {coach.handle}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: accent }}
              />
              <span className="truncate">{catLabel}</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[var(--ink-dim)] leading-snug line-clamp-2">
          {coach.tagline}
        </p>
        {coach.stats.followers !== "—" && (
          <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-[var(--ink-muted)] tabular">
            <span>{coach.stats.followers} followers</span>
          </div>
        )}
      </Link>

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggle();
        }}
        className={cn(
          "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border transition-colors",
          selected
            ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]"
            : "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border-[var(--line)] hover:border-[var(--accent-line)] hover:text-[var(--accent)]"
        )}
        aria-label={selected ? "Remove" : "Add to plan"}
      >
        {selected ? <Check size={11} /> : <Plus size={11} />}
      </button>
    </div>
  );
}
