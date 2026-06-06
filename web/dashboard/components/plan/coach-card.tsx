"use client";

import { Check, Plus } from "lucide-react";
import { CATEGORIES, initials, type Coach } from "@/lib/coaches";
import { GOAL_LABEL } from "@/lib/matching";
import type { GoalKey } from "@/lib/use-intake";
import { cn } from "@/lib/cn";

export function CoachCard({
  coach,
  selected,
  matchingGoals,
  onToggle,
  onOpen,
  atCap = false,
  matchesGoals: _matchesGoals,
}: {
  coach: Coach;
  selected: boolean;
  matchingGoals?: GoalKey[];
  onToggle: () => void;
  onOpen?: () => void;
  atCap?: boolean;
  matchesGoals?: boolean;
}) {
  const accent = CATEGORIES[coach.category].accent;
  const catLabel = CATEGORIES[coach.category].label;
  const hasMatches = !!matchingGoals && matchingGoals.length > 0;
  const primaryGoal = hasMatches ? GOAL_LABEL[matchingGoals[0]] : null;
  const matchTitle = hasMatches
    ? matchingGoals!.map((g) => GOAL_LABEL[g]).join(" · ")
    : undefined;
  const disabled = atCap && !selected;

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
          if (disabled) return;
          onToggle();
        }}
        disabled={disabled}
        title={
          selected
            ? "Remove"
            : disabled
              ? "Max 3 coaches — remove one to add another"
              : "Add to your team"
        }
        className={cn(
          "group/add absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center border transition-all z-10",
          selected
            ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] hover:opacity-90"
            : disabled
              ? "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border-[var(--line)] opacity-40 cursor-not-allowed"
              : "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border-[var(--line)] hover:bg-[var(--bg-elev-2)] hover:border-[var(--accent-line)] hover:text-[var(--accent)] hover:scale-105"
        )}
        aria-label={
          selected
            ? "Remove from your team"
            : disabled
              ? "Max 3 coaches reached"
              : "Add to your team"
        }
      >
        {selected ? <Check size={14} /> : <Plus size={14} />}
      </button>

      {/* Header: avatar + name + handle + category */}
      <div className="flex items-start gap-3 mb-3 pr-11">
        {coach.headshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coach.headshot}
            alt={coach.name}
            className="shrink-0 w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="shrink-0 w-10 h-10 rounded-full grid place-items-center text-[12px] font-semibold text-white tabular"
            style={{ background: accent }}
          >
            {initials(coach.name)}
          </div>
        )}
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

      {/* Match badge */}
      {hasMatches && (
        <div
          title={matchTitle}
          className="inline-flex items-center gap-1 mb-2 px-1.5 py-0.5 rounded-sm bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]"
        >
          <span>matches:</span>
          <span className="normal-case tracking-normal">{primaryGoal}</span>
          {matchingGoals!.length > 1 && (
            <span className="text-[var(--ink-muted)]">+{matchingGoals!.length - 1}</span>
          )}
        </div>
      )}

      {/* Tagline */}
      <p className="text-[12px] text-[var(--ink-dim)] leading-snug mb-3 line-clamp-3">
        {coach.tagline}
      </p>

      {/* Stats + Read profile link */}
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[var(--ink-muted)] tabular">
        <div className="flex items-center gap-3">
          {(() => {
            const primary = coach.socials.find((s) => s.followers);
            return primary?.followers ? <span>{primary.followers} followers</span> : null;
          })()}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
          className="text-[11px] text-[var(--ink-dim)] hover:text-[var(--accent)] hover:underline normal-case tracking-normal"
        >
          Read profile →
        </button>
      </div>
    </div>
  );
}
