import Link from "next/link";
import type { ExerciseSummary } from "@/lib/queries";
import { nameToSlug } from "@/lib/queries";
import { format } from "@/lib/format";

const KG_PER_LB = 0.45359237;

export type PREvent = {
  date: string;          // ISO date
  name: string;
  weight_lb: number;
  reps: number;
  e1rm_lb: number;
};

/**
 * Derive chronological PR events from each lift's all-time PR record.
 * One event per lift (the date that lift hit its all-time best e1RM).
 * Sorted by date desc, limited to last `lookbackDays`.
 */
export function prEventsFromSummaries(
  summaries: ExerciseSummary[],
  lookbackDays = 90,
  tabFilter?: (name: string) => boolean,
): PREvent[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const events: PREvent[] = [];
  for (const s of summaries) {
    if (!s.pr) continue;
    if (s.pr.date.slice(0, 10) < cutoffIso) continue;
    if (tabFilter && !tabFilter(s.name)) continue;
    events.push({
      date: s.pr.date,
      name: s.name,
      weight_lb: Math.round(s.pr.weight_kg / KG_PER_LB),
      reps: s.pr.reps,
      e1rm_lb: Math.round(s.pr.e1rm_kg / KG_PER_LB),
    });
  }
  events.sort((a, b) => b.date.localeCompare(a.date));
  return events;
}

export function PRLog({ events, limit = 10 }: { events: PREvent[]; limit?: number }) {
  const shown = events.slice(0, limit);
  if (shown.length === 0) {
    return (
      <div className="text-[11px] text-[var(--ink-muted)] py-2">
        No PRs in the lookback window.
      </div>
    );
  }
  return (
    <div className="text-[12px]">
      <div className="grid grid-cols-[80px_1fr_80px_80px] gap-3 pb-1.5 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
        <div>Date</div>
        <div>Lift</div>
        <div className="text-right">Set</div>
        <div className="text-right">e1RM</div>
      </div>
      {shown.map((ev) => (
        <Link
          key={`${ev.name}-${ev.date}`}
          href={`/progress/${nameToSlug(ev.name)}`}
          className="grid grid-cols-[80px_1fr_80px_80px] gap-3 py-1 -mx-1 px-1 rounded-sm hover:bg-[var(--bg-elev-2)] transition-colors items-baseline border-b border-[var(--line-soft)] last:border-b-0"
        >
          <div className="text-[10px] font-mono tabular text-[var(--ink-muted)]">
            {format.shortDate(ev.date)}
          </div>
          <div className="text-[var(--ink)] truncate">
            {ev.name}
            <span className="ml-1 text-[var(--accent)] text-[10px]">✦</span>
          </div>
          <div className="text-right tabular text-[var(--ink-dim)] text-[11px]">
            {ev.weight_lb} × {ev.reps}
          </div>
          <div className="text-right tabular text-[var(--ink)] font-mono text-[11px]">
            {ev.e1rm_lb} lb
          </div>
        </Link>
      ))}
    </div>
  );
}
