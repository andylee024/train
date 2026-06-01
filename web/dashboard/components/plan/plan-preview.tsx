"use client";

/**
 * Plan preview — structured visual of the synthesized arc.
 *
 * Shows the athlete the work done: arc timeline, block breakdown, sample week,
 * KPIs tracked. Designed for fast alignment ("yes this is what I want").
 *
 * v1: renders a SamplePlan built from the selected coaches + goals (variant
 * picked by dominant category). v2: takes a real generated plan object.
 */
import { useState } from "react";
import { ChevronLeft, Download, Sparkles, Star, Info } from "lucide-react";
import { getCoach, type Coach } from "@/lib/coaches";
import {
  buildSamplePlan,
  type SamplePlan,
  type SamplePlanBlock,
  type SamplePlanDay,
  type SamplePlanExercise,
  type SamplePlanKPI,
} from "@/lib/sample-plan";
import type { GoalKey } from "@/lib/use-intake";
import { cn } from "@/lib/cn";

export function PlanPreview({
  selectedCoachIds,
  goals = [],
  plan: providedPlan,
  synthesized,
  fallbackReason,
  onBack,
  onActivate,
}: {
  selectedCoachIds: string[];
  goals?: GoalKey[];
  /** When provided, this plan is rendered instead of the local mocked build. */
  plan?: SamplePlan;
  /** True if the API returned a real Claude synthesis; false when fallback fired. */
  synthesized?: boolean;
  /** Optional fallback reason — shown in the banner when synthesized === false. */
  fallbackReason?: string;
  onBack: () => void;
  onActivate: () => void;
}) {
  const coaches = selectedCoachIds
    .map((id) => getCoach(id))
    .filter((c): c is Coach => !!c);
  const coachNames = coaches.map((c) => c.name).join(" · ");
  const plan = providedPlan ?? buildSamplePlan(coaches, goals);
  const [blockIdx, setBlockIdx] = useState<number>(
    Math.min(plan.defaultBlockIdx ?? 0, Math.max(plan.sampleWeeks.length - 1, 0))
  );
  // Show the legacy "example structure" note only when we don't have real
  // synthesis (no providedPlan OR synthesized === false).
  const showFallbackBanner = synthesized === false || providedPlan == null;
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      // TR-334: POST the currently-rendered plan to /api/xlsx and trigger a
      // blob-URL download. Athlete name defaults to "Andy Lee" server-side
      // (v0 is single-athlete).
      const res = await fetch("/api/xlsx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, athleteName: "Andy Lee" }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `request failed (${res.status})`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      const filename = match?.[1] ?? "plan.xlsx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDownloadError(msg);
      // Surface for dev triage; user-visible message rendered below button.
      console.error("[xlsx download] failed", err);
    } finally {
      setDownloading(false);
    }
  }

  const sampleWeek = plan.sampleWeeks[blockIdx] ?? plan.sampleWeeks[0];

  return (
    <div className="max-w-5xl mx-auto py-4">
      {showFallbackBanner && (
        <div
          className="mb-4 flex items-start gap-2 rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] p-3 text-[11px] leading-relaxed text-[var(--ink-dim)]"
          role="note"
        >
          <Info size={12} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <div>
            <span className="font-medium text-[var(--ink)]">
              AI synthesis unavailable — showing example structure.
            </span>{" "}
            {fallbackReason ?? "Set ANTHROPIC_API_KEY to enable real synthesis."}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="flex items-baseline gap-2 mb-1">
        <Sparkles size={14} className="text-[var(--accent)]" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">
          synthesized
        </span>
      </div>
      <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight leading-none mb-2">
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

      {/* Sample week — block toggle (A24-298) + horizontal scroll on mobile (A24-292) */}
      <Section label="Sample week" meta={sampleWeek.label}>
        <BlockSelector
          blocks={plan.blocks}
          current={blockIdx}
          onChange={setBlockIdx}
        />
        <div className="-mx-1 px-1 mt-3 flex gap-1.5 overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-7 sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0">
          {sampleWeek.days.map((day, i) => (
            <div key={`${blockIdx}-${i}`} className="shrink-0 w-[140px] snap-start sm:w-auto">
              <DayColumn day={day} />
            </div>
          ))}
        </div>
      </Section>

      {/* KPIs */}
      <Section label="KPIs tracked" meta="we'll measure these at every block boundary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plan.kpis.map((kpi, i) => (
            <KPICard key={i} kpi={kpi} />
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={11} /> change my picks
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download the synthesized plan as .xlsx"
              className="text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-progress"
            >
              <Download size={11} />
              {downloading ? "Building…" : "Download .xlsx"}
            </button>
            {downloadError && (
              <span className="text-[10px] font-mono text-red-500 max-w-[260px] text-right">
                {downloadError}
              </span>
            )}
          </div>
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

// ─── Block selector — sample-week toggle (A24-298) ─────────────────────────

function BlockSelector({
  blocks,
  current,
  onChange,
}: {
  blocks: SamplePlanBlock[];
  current: number;
  onChange: (idx: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {blocks.map((block, i) => {
        const active = i === current;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]"
                : "bg-[var(--bg-elev-1)] text-[var(--ink-muted)] border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--accent-line)]"
            )}
            title={block.name}
          >
            Block {i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ─── Arc timeline ──────────────────────────────────────────────────────────

function ArcTimeline({
  blocks,
  totalWeeks,
}: {
  blocks: SamplePlanBlock[];
  totalWeeks: number;
}) {
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

// ─── KPI card with primary highlighting (A24-313) ──────────────────────────

function KPICard({ kpi }: { kpi: SamplePlanKPI }) {
  return (
    <div
      className={cn(
        "rounded-md p-3 transition-colors",
        kpi.primary
          ? "bg-[var(--accent-soft)] border border-[var(--accent-line)]"
          : "bg-[var(--bg-elev-1)] border border-[var(--line)]"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] truncate">
          {kpi.name}
        </div>
        {kpi.primary && (
          <span
            className="inline-flex items-center gap-0.5 text-[8px] font-mono uppercase tracking-wider text-[var(--accent)] shrink-0"
            title="Headline goal"
          >
            <Star size={9} className="fill-[var(--accent)]" /> headline
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[11px] tabular text-[var(--ink-dim)]">
          {kpi.baseline}
        </span>
        <span className="text-[var(--ink-muted)]">→</span>
        <span
          className={cn(
            "tabular font-semibold text-[var(--accent)]",
            kpi.primary ? "text-[20px]" : "text-[16px]"
          )}
        >
          {kpi.target}
        </span>
      </div>
      <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
        tested {kpi.measured.toLowerCase()}
      </div>
    </div>
  );
}

// ─── Day column — compact vertical cell in the 7-day grid ──────────────────

function DayColumn({ day }: { day: SamplePlanDay }) {
  const isRest = day.rest || /rest/i.test(day.title);
  return (
    <div
      className={cn(
        "rounded-sm border p-2 min-w-0",
        isRest
          ? "bg-[var(--bg-elev-2)] border-[var(--line-soft)]"
          : "bg-[var(--bg-elev-1)] border-[var(--line)]"
      )}
    >
      <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
        {day.day}
      </div>
      <div
        className={cn(
          "text-[11px] font-medium leading-tight mb-2 mt-0.5 truncate",
          isRest ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"
        )}
        title={day.title}
      >
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

function ExerciseLine({ ex, dim }: { ex: SamplePlanExercise; dim?: boolean }) {
  const parts: string[] = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
  else if (ex.reps) parts.push(ex.reps);
  if (ex.load) parts.push(ex.load);
  const prescription = parts.join(" ");
  // A24-312: shortName for narrow-column rendering; full name in title attr.
  const displayName = ex.shortName ?? ex.name;

  return (
    <div className="leading-tight min-w-0">
      <div
        className={cn(
          "text-[10px] truncate",
          dim ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"
        )}
        title={ex.name}
      >
        {displayName}
      </div>
      {prescription && (
        // Load line must not truncate — diagnostic info per spec.
        <div className="text-[9px] font-mono text-[var(--ink-dim)] tabular whitespace-nowrap overflow-visible">
          {prescription}
        </div>
      )}
    </div>
  );
}
