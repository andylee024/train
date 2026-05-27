"use client";

import { useIntake, type GoalKey, type ConstraintKey } from "@/lib/use-intake";
import { GOAL_LABEL } from "@/lib/matching";
import { cn } from "@/lib/cn";

const GOAL_KEYS: GoalKey[] = [
  "stronger", "build-muscle", "jump-higher",
  "run-faster", "look-ripped", "more-flexible",
  "hybrid", "longevity", "sport-prep",
];

const DAYS = [3, 4, 5, 6];

const CONSTRAINTS: { key: ConstraintKey; label: string }[] = [
  { key: "shoulder",           label: "Shoulder issue" },
  { key: "knees",              label: "Knee issue" },
  { key: "wrists",             label: "Wrist issue" },
  { key: "lower-back",         label: "Lower back" },
  { key: "hips",               label: "Tight hips" },
  { key: "limited-equipment",  label: "Limited equipment" },
  { key: "no-gym",             label: "No gym access" },
  { key: "time-constrained",   label: "Time-constrained" },
  { key: "travel-often",       label: "Travel often" },
];

export function GoalIntake({ onComplete }: { onComplete: () => void }) {
  const {
    intake,
    isComplete,
    toggleGoal,
    setDays,
    toggleConstraint,
  } = useIntake();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-[28px] font-semibold tracking-tight leading-none mb-2">
        Let's build your training plan.
      </h1>
      <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed mb-8">
        Two questions to find your training team. We'll show you matched coaches you can mix and match.
      </p>

      {/* Goals */}
      <Section label="What do you want?" hint="pick any that apply">
        <div className="flex flex-wrap gap-2">
          {GOAL_KEYS.map((g) => (
            <Chip
              key={g}
              label={GOAL_LABEL[g]}
              active={intake.goals.includes(g)}
              onClick={() => toggleGoal(g)}
            />
          ))}
        </div>
      </Section>

      {/* Days/week */}
      <Section label="How many days per week?" hint="single answer">
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <Chip
              key={d}
              label={`${d} d/wk`}
              active={intake.daysPerWeek === d}
              onClick={() => setDays(d)}
            />
          ))}
        </div>
      </Section>

      {/* Constraints (optional) */}
      <Section label="Any constraints?" hint="optional · informs matching">
        <div className="flex flex-wrap gap-2">
          {CONSTRAINTS.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              active={intake.constraints.includes(c.key)}
              onClick={() => toggleConstraint(c.key)}
            />
          ))}
        </div>
      </Section>

      {/* CTA */}
      <div className="mt-10 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
          {isComplete
            ? `${intake.goals.length} goal${intake.goals.length === 1 ? "" : "s"} · ${intake.daysPerWeek} d/wk${intake.constraints.length ? ` · ${intake.constraints.length} constraint${intake.constraints.length === 1 ? "" : "s"}` : ""}`
            : "Pick at least one goal and your days/week to continue."}
        </span>
        <button
          onClick={onComplete}
          disabled={!isComplete}
          className={cn(
            "text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-sm transition-opacity",
            isComplete
              ? "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
              : "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] cursor-not-allowed"
          )}
        >
          Find my team →
        </button>
      </div>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[13px] text-[var(--ink)] font-medium">{label}</span>
        {hint && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-[12px] border transition-colors",
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]"
          : "bg-[var(--bg-elev-1)] text-[var(--ink-dim)] border-[var(--line)] hover:border-[var(--accent-line)] hover:text-[var(--ink)]"
      )}
    >
      {label}
    </button>
  );
}
