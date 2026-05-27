"use client";

/**
 * Plan preview — structured visual of the synthesized arc.
 *
 * Shows the athlete the work done: arc timeline, block breakdown, sample week,
 * KPIs tracked. Designed for fast alignment ("yes this is what I want").
 *
 * v1: renders against SAMPLE_PLAN. v2: takes a real generated plan object.
 */
import { ChevronLeft, Download, Sparkles } from "lucide-react";
import { CATEGORIES, getCoach, initials, type Coach } from "@/lib/coaches";
import { SAMPLE_PLAN } from "@/lib/sample-plan";
import { cn } from "@/lib/cn";

export function PlanPreview({
  selectedCoachIds,
  onBack,
  onActivate,
}: {
  selectedCoachIds: string[];
  onBack: () => void;
  onActivate: () => void;
}) {
  const coaches = selectedCoachIds
    .map((id) => getCoach(id))
    .filter((c): c is Coach => !!c);
  const coachNames = coaches.map((c) => c.name).join(" · ");
  const plan = SAMPLE_PLAN;

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Hero */}
      <div className="flex items-baseline gap-2 mb-1">
        <Sparkles size={14} className="text-[var(--accent)]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          synthesized
        </span>
      </div>
      <h1 className="text-[24px] font-semibold tracking-tight leading-none mb-2">
        {plan.meta.title}
      </h1>
      <div className="text-[12px] text-[var(--ink-dim)] mb-1">
        From your training team: <span className="text-[var(--ink)]">{coachNames}</span>
      </div>
      <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
        {plan.meta.horizon} · {plan.meta.daysPerWeek} d/wk · {plan.meta.sessionLength} sessions
      </div>

      {/* Arc timeline */}
      <Section label="Arc">
        <ArcTimeline blocks={plan.blocks} totalWeeks={plan.meta.durationWeeks} />
        <div className="mt-3 text-[12px] text-[var(--ink-dim)] leading-relaxed">
          {plan.rationale}
        </div>
      </Section>

      {/* Block breakdown */}
      <Section label="Blocks">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.blocks.map((block, i) => (
            <div
              key={i}
              className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-4"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[13px] text-[var(--ink)] font-medium">
                  Block {i + 1} · {block.name}
                </span>
                <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
                  {block.weeks}
                </span>
              </div>
              <div className="text-[11px] text-[var(--ink-dim)] leading-relaxed mb-2">
                {block.focus}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                ← drawn from <span className="text-[var(--accent)]">{block.source}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sample week */}
      <Section label="Sample week" meta={plan.sampleWeek.label}>
        <div className="grid grid-cols-7 gap-1.5">
          {plan.sampleWeek.days.map((day, i) => (
            <DayColumn key={i} day={day} />
          ))}
        </div>
      </Section>

      {/* KPIs */}
      <Section label="KPIs tracked" meta="we'll measure these at every block boundary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plan.kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3"
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
                {kpi.name}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[11px] tabular text-[var(--ink-dim)]">
                  {kpi.baseline}
                </span>
                <span className="text-[var(--ink-muted)]">→</span>
                <span className="text-[16px] font-semibold tabular text-[var(--accent)]">
                  {kpi.target}
                </span>
              </div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
                tested {kpi.measured.toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={11} /> change my picks
        </button>
        <div className="flex items-center gap-2">
          <button className="text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1.5">
            <Download size={11} /> Download .xlsx
          </button>
          <button
            onClick={onActivate}
            className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
          >
            Activate this plan →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Arc timeline ──────────────────────────────────────────────────────────

function ArcTimeline({
  blocks,
  totalWeeks,
}: {
  blocks: typeof SAMPLE_PLAN.blocks;
  totalWeeks: number;
}) {
  // Accent shades for the 4 blocks. Light gradient to communicate progression.
  const SHADES = [
    "rgba(91, 158, 255, 0.30)",
    "rgba(91, 158, 255, 0.50)",
    "rgba(91, 158, 255, 0.70)",
    "rgba(91, 158, 255, 0.95)",
  ];
  return (
    <div>
      <div className="flex w-full rounded-md overflow-hidden border border-[var(--line)] h-12">
        {blocks.map((block, i) => {
          const widthPct = ((block.weekEnd - block.weekStart + 1) / totalWeeks) * 100;
          return (
            <div
              key={i}
              className="flex flex-col items-start justify-center px-3 border-r border-[var(--line)] last:border-r-0 min-w-0"
              style={{
                width: `${widthPct}%`,
                background: SHADES[i % SHADES.length],
              }}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink)] tabular truncate w-full">
                Block {i + 1}
              </div>
              <div className="text-[11px] text-[var(--ink)] font-medium truncate w-full">
                {block.name}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-mono text-[var(--ink-muted)] tabular px-1">
        <span>Wk 1</span>
        <span>Wk {Math.ceil(totalWeeks / 2)}</span>
        <span>Wk {totalWeeks}</span>
      </div>
    </div>
  );
}

// ─── Section primitive ─────────────────────────────────────────────────────

function Section({
  label,
  meta,
  children,
}: {
  label: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="hairline pt-2 pb-2 mb-3 flex items-baseline justify-between">
        <span className="section-label">{label}</span>
        {meta && (
          <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ─── Day column — compact vertical cell in the 7-day grid ──────────────────

function DayColumn({ day }: { day: import("@/lib/sample-plan").SamplePlanDay }) {
  const isRest = day.rest || /rest/i.test(day.title);
  return (
    <div
      className={cn(
        "rounded-sm border p-2",
        isRest
          ? "bg-[var(--bg-elev-2)] border-[var(--line-soft)]"
          : "bg-[var(--bg-elev-1)] border-[var(--line)]"
      )}
    >
      <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
        {day.day}
      </div>
      <div className={cn(
        "text-[11px] font-medium leading-tight mb-2 mt-0.5",
        isRest ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"
      )}>
        {day.title}
      </div>
      <div className="space-y-1.5">
        {day.exercises.map((ex, i) => (
          <ExerciseLine key={i} ex={ex} dim={isRest} />
        ))}
      </div>
    </div>
  );
}

function ExerciseLine({
  ex,
  dim,
}: {
  ex: import("@/lib/sample-plan").SamplePlanExercise;
  dim?: boolean;
}) {
  // Build prescription string: "5×3", "5×3 80%", "4×5 BW+25", "3×6 RPE 7"
  const parts: string[] = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
  else if (ex.reps) parts.push(ex.reps);
  if (ex.load) parts.push(ex.load);
  const prescription = parts.join(" ");

  return (
    <div className="leading-tight">
      <div className={cn(
        "text-[10px] truncate",
        dim ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"
      )}>
        {ex.name}
      </div>
      {prescription && (
        <div className="text-[9px] font-mono text-[var(--ink-dim)] tabular truncate">
          {prescription}
        </div>
      )}
    </div>
  );
}
