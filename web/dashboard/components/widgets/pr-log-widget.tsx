/**
 * L3 PR log widget — wraps EventTable with PR event columns.
 *
 * Per-row href drills into the per-lift page. The widget itself does NOT set
 * a card-level href (nested anchors forbidden).
 */
import { Widget } from "./widget";
import { EventTable, type EventColumn } from "@/components/viz/event-table";
import { nameToSlug, type ExerciseSummary } from "@/lib/queries";
import { prEventsFromSummaries, type PREvent } from "@/components/pr-log";
import { format } from "@/lib/format";

const COLUMNS: EventColumn<PREvent>[] = [
  {
    key: "date",
    label: "Date",
    width: "80px",
    render: (r) => (
      <span className="text-[10px] font-mono tabular text-[var(--ink-muted)]">
        {format.shortDate(r.date)}
      </span>
    ),
  },
  {
    key: "name",
    label: "Lift",
    width: "1fr",
    render: (r) => (
      <span className="text-[var(--ink)]">
        {r.name}
        <span className="ml-1 text-[var(--accent)] text-[10px]">✦</span>
      </span>
    ),
  },
  {
    key: "set",
    label: "Set",
    align: "right",
    width: "80px",
    render: (r) => (
      <span className="tabular text-[var(--ink-dim)] text-[11px]">
        {r.weight_lb} × {r.reps}
      </span>
    ),
  },
  {
    key: "e1rm",
    label: "e1RM",
    align: "right",
    width: "80px",
    render: (r) => (
      <span className="tabular text-[var(--ink)] font-mono text-[11px]">
        {r.e1rm_lb} lb
      </span>
    ),
  },
];

export function PRLogWidget({
  summaries,
  inTab,
  lookbackDays = 90,
  limit = 10,
}: {
  summaries: ExerciseSummary[];
  inTab: (name: string) => boolean;
  lookbackDays?: number;
  limit?: number;
}) {
  const events = prEventsFromSummaries(summaries, lookbackDays, inTab).slice(0, limit);
  return (
    <Widget
      title="Recent PRs"
      meta={`last ${lookbackDays} days · ${events.length} PR${events.length === 1 ? "" : "s"}`}
      state={events.length === 0 ? "empty" : "ok"}
      emptyMessage="no PRs in window"
    >
      <EventTable
        rows={events}
        columns={COLUMNS}
        rowKey={(r) => `${r.name}-${r.date}`}
        rowHref={(r) => `/progress/${nameToSlug(r.name)}`}
      />
    </Widget>
  );
}
