import type { DayCell } from "@/lib/queries";
import { cn } from "@/lib/cn";

/**
 * GitHub-contribution-style cadence grid.
 * Rows = days of week (Mon → Sun). Columns = weeks (oldest → newest, left → right).
 * Cell fill intensity = set count bucket. Sunday rendered as rest (blank).
 *
 * v1: binary-plus-intensity (any logged workout = filled, brighter for more sets).
 * v2 (later): planned-vs-actual once the bundle is machine-parsable per day.
 */
export function ConsistencyHeatmap({ days }: { days: DayCell[] }) {
  if (days.length === 0) {
    return <div className="text-[11px] text-[var(--ink-muted)]">No activity yet.</div>;
  }

  // Bucket each day into intensity 0-4
  const max = Math.max(20, ...days.map((d) => d.sets));
  const intensity = (sets: number): 0 | 1 | 2 | 3 | 4 => {
    if (sets === 0) return 0;
    if (sets <= max * 0.25) return 1;
    if (sets <= max * 0.5) return 2;
    if (sets <= max * 0.75) return 3;
    return 4;
  };

  // Group into weeks (Sun..Sat columns). Find Sunday of the first day's week.
  const first = new Date(days[0].date);
  const firstSunday = new Date(first);
  firstSunday.setDate(first.getDate() - first.getDay());
  const byDate = new Map(days.map((d) => [d.date, d]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(days[days.length - 1].date);
  const lastSunday = new Date(lastDate);
  lastSunday.setDate(lastDate.getDate() - lastDate.getDay());

  const weeks: { weekStart: Date; cells: (DayCell | null)[] }[] = [];
  let cur = new Date(firstSunday);
  while (cur <= lastSunday) {
    const cells: (DayCell | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      d.setDate(cur.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      cells.push(byDate.get(key) ?? null);
    }
    weeks.push({ weekStart: new Date(cur), cells: [...cells] });
    cur.setDate(cur.getDate() + 7);
  }

  // Month labels — show first week of each month
  const monthLabels: { idx: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const m = w.weekStart.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        idx: i,
        label: w.weekStart.toLocaleDateString("en-US", { month: "short" }),
      });
      lastMonth = m;
    }
  });

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="text-[10px] font-mono text-[var(--ink-muted)]">
      {/* Month labels */}
      <div className="ml-5 grid relative h-3 mb-0.5" style={{ gridTemplateColumns: `repeat(${weeks.length}, 10px)`, gap: "2px" }}>
        {monthLabels.map((m) => (
          <span
            key={m.idx}
            className="absolute tabular"
            style={{ left: `${m.idx * 12}px` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-[2px]">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[2px] mr-2">
          {DAY_LABELS.map((l, i) => (
            <div
              key={i}
              className={cn(
                "h-[10px] text-[9px] leading-[10px] w-3 text-right",
                i === 0 ? "text-[var(--ink-muted)] opacity-40" : ""
              )}
            >
              {i % 2 === 1 ? l : ""}
            </div>
          ))}
        </div>
        {/* Week columns */}
        <div className="flex gap-[2px]">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {w.cells.map((cell, di) => {
                const isSunday = di === 0;
                const isFuture = cell ? new Date(cell.date) > today : true;
                const i = cell ? intensity(cell.sets) : 0;
                return (
                  <Cell
                    key={di}
                    intensity={i}
                    isRest={isSunday}
                    isFuture={isFuture}
                    sets={cell?.sets ?? 0}
                    date={cell?.date}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-[9px]">
        <span>less</span>
        <Cell intensity={0} isRest={false} isFuture={false} sets={0} />
        <Cell intensity={1} isRest={false} isFuture={false} sets={0} />
        <Cell intensity={2} isRest={false} isFuture={false} sets={0} />
        <Cell intensity={3} isRest={false} isFuture={false} sets={0} />
        <Cell intensity={4} isRest={false} isFuture={false} sets={0} />
        <span>more</span>
        <span className="ml-3">·</span>
        <Cell intensity={0} isRest={true} isFuture={false} sets={0} />
        <span>rest</span>
      </div>
    </div>
  );
}

const INTENSITY_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[var(--bg-elev-2)]",
  1: "bg-[var(--accent)] opacity-25",
  2: "bg-[var(--accent)] opacity-50",
  3: "bg-[var(--accent)] opacity-75",
  4: "bg-[var(--accent)]",
};

function Cell({
  intensity,
  isRest,
  isFuture,
  sets,
  date,
}: {
  intensity: 0 | 1 | 2 | 3 | 4;
  isRest: boolean;
  isFuture: boolean;
  sets: number;
  date?: string;
}) {
  const cls = isRest
    ? "bg-transparent border border-dashed border-[var(--line-soft)]"
    : isFuture
      ? "bg-transparent border border-[var(--line-soft)]"
      : INTENSITY_CLASS[intensity];
  const title = date ? `${date} · ${sets} sets${isRest ? " (rest)" : ""}` : undefined;
  return <div className={cn("w-[10px] h-[10px] rounded-[1px]", cls)} title={title} />;
}
