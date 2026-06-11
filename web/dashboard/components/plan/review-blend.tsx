"use client";

/**
 * Review step — "Here's your blend" before synthesis.
 *
 * Shows: picked coaches with roles · day-by-day week shape · inline days/wk
 * adjustment · "anything else to know?" textarea · back/Build buttons.
 *
 * Lives between the marketplace and the synthesis loading screen so the
 * athlete can confirm/tweak before triggering plan generation.
 */
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { CATEGORIES, getCoach, initials, type Coach } from "@/lib/coaches";
import { generateBlend } from "@/lib/blend";
import { GOAL_LABEL } from "@/lib/matching";
import type { GoalKey } from "@/lib/use-intake";
import { cn } from "@/lib/cn";

const DAYS_OPTIONS = [3, 4, 5, 6];

export function ReviewBlend({
  selected,
  goals,
  daysPerWeek,
  onChangeDays,
  notes,
  onChangeNotes,
  onBack,
  onBuild,
}: {
  selected: string[];
  goals: GoalKey[];
  daysPerWeek: number;
  onChangeDays: (d: number) => void;
  notes: string;
  onChangeNotes: (v: string) => void;
  onBack: () => void;
  onBuild: () => void;
}) {
  const coaches = selected
    .map((id) => getCoach(id))
    .filter((c): c is Coach => !!c);

  const blend = generateBlend(coaches, daysPerWeek);

  const goalLine = goals
    .map((g) => GOAL_LABEL[g])
    .join(" · ");

  return (
    <div className="max-w-3xl mx-auto py-4">
      <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight leading-none mb-2">
        Here's your blend
      </h1>
      <p className="text-[12px] text-[var(--ink-dim)]">
        Review before we generate the full plan. Adjust anything that looks off.
      </p>

      {/* Coaches list */}
      <section className="mt-6">
        <div className="hairline pt-2 pb-2 mb-3">
          <span className="section-label">Your training team</span>
        </div>
        <div className="space-y-2">
          {coaches.map((coach) => {
            const accent = CATEGORIES[coach.category].accent;
            return (
              <div
                key={coach.id}
                className="flex items-center gap-3 p-2 rounded-sm bg-[var(--bg-elev-1)] border border-[var(--line)]"
              >
                <span
                  className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold text-white tabular"
                  style={{ background: accent }}
                >
                  {initials(coach.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-[var(--ink)] truncate">{coach.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                    {coach.category} · {coach.tags.goals.slice(0, 2).join(", ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Week shape */}
      <section className="mt-6">
        <div className="hairline pt-2 pb-2 mb-3 flex items-baseline justify-between">
          <span className="section-label">Your week shape</span>
          <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
            {goalLine ? `${goalLine} · ` : ""}{daysPerWeek} d/wk
          </span>
        </div>
        <div className="-mx-1 px-1 flex gap-2 overflow-x-auto snap-x snap-mandatory text-[11px] sm:grid sm:grid-cols-7 sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0">
          {blend.map((day, i) => {
            const isRest = day.coach === null;
            const accent = day.coach ? CATEGORIES[day.coach.category].accent : null;
            return (
              <div
                key={i}
                className={cn(
                  "shrink-0 w-[110px] snap-start sm:w-auto p-2 rounded-sm border min-h-[64px]",
                  isRest
                    ? "bg-[var(--bg-elev-2)] border-[var(--line-soft)]"
                    : "bg-[var(--bg-elev-1)] border-[var(--line)]"
                )}
              >
                <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                  {day.dayLabel}
                </div>
                {day.coach ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: accent ?? "transparent" }}
                      />
                      <span className="text-[9px] font-mono text-[var(--ink-muted)] truncate">
                        {initials(day.coach.name)}
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--ink)] leading-tight">
                      {day.sessionLabel}
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-[var(--ink-muted)]">
                    {day.sessionLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Adjustments */}
      <section className="mt-6">
        <div className="hairline pt-2 pb-2 mb-3">
          <span className="section-label">Adjust</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-[var(--ink-dim)] font-mono uppercase tracking-wider">
            days / week
          </span>
          <div className="flex gap-1.5">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => onChangeDays(d)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                  daysPerWeek === d
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]"
                    : "bg-[var(--bg-elev-1)] text-[var(--ink-dim)] border-[var(--line)] hover:border-[var(--accent-line)] hover:text-[var(--ink)]"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Anything else? textarea */}
      <section className="mt-6">
        <div className="hairline pt-2 pb-2 mb-3 flex items-baseline justify-between">
          <span className="section-label">Anything else to know?</span>
          <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-wider">
            optional
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Specifics on injuries, equipment, schedule, anything the AI should know when generating the full plan."
          className={cn(
            "w-full min-h-[80px] p-3 text-[12px] leading-relaxed rounded-md tabular",
            "bg-[var(--bg-elev-1)] border border-[var(--line)]",
            "text-[var(--ink)] placeholder:text-[var(--ink-muted)]",
            "focus:outline-none focus:border-[var(--accent-line)]"
          )}
        />
      </section>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={11} /> change my picks
        </button>
        <button
          onClick={onBuild}
          className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
        >
          Build plan →
        </button>
      </div>
    </div>
  );
}
