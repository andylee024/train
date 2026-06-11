import type { ArcBlock } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Arc Timeline — one row per block, fixed-width track, "now" marker.
 * Track length = totalWeeks. Block range = b.weeks ("1-6" etc.).
 */
export function ArcTimeline({
  blocks,
  totalWeeks,
  currentWeek,
}: {
  blocks: ArcBlock[];
  totalWeeks: number;
  currentWeek: number;
}) {
  if (totalWeeks <= 0) return null;
  const pct = Math.min(100, (currentWeek / totalWeeks) * 100);
  return (
    <div>
      {/* Now marker rail */}
      <div className="relative h-3 mb-1">
        <div
          className="absolute -top-0.5 text-[10px] font-mono text-[var(--accent)] tabular -translate-x-1/2"
          style={{ left: `${pct}%` }}
        >
          ▼ Wk {currentWeek}
        </div>
      </div>
      <div className="space-y-1.5">
        {blocks.map((b) => (
          <BlockRow key={b.name} block={b} totalWeeks={totalWeeks} />
        ))}
      </div>
      {/* Week scale */}
      <div className="mt-2 pt-1 relative text-[9px] font-mono text-[var(--ink-muted)] tabular">
        <div className="flex justify-between">
          <span>Wk 1</span>
          <span>Wk {Math.ceil(totalWeeks / 2)}</span>
          <span>Wk {totalWeeks}</span>
        </div>
      </div>
    </div>
  );
}

function BlockRow({ block, totalWeeks }: { block: ArcBlock; totalWeeks: number }) {
  const range = block.weeks.replace(/[–—]/g, "-").split("-").map((s) => parseInt(s.trim(), 10));
  const [from, to] = range;
  if (!from || !to) {
    return (
      <div className="grid grid-cols-[140px_1fr_60px] gap-3 items-center text-[12px]">
        <div className="truncate text-[var(--ink-dim)]">{block.name}</div>
        <div className="text-[var(--ink-muted)] text-[11px]">—</div>
        <div className="text-right text-[10px] font-mono text-[var(--ink-muted)] tabular">
          {block.weeks}
        </div>
      </div>
    );
  }
  const leftPct = ((from - 1) / totalWeeks) * 100;
  const widthPct = ((to - from + 1) / totalWeeks) * 100;
  const tone =
    block.status === "active"
      ? "bg-[var(--accent)]"
      : block.status === "completed"
        ? "bg-[var(--ink-dim)]"
        : "bg-[var(--bg-elev-3)]";
  return (
    <div className="grid grid-cols-[140px_1fr_60px] gap-3 items-center text-[12px]">
      <div className="truncate text-[var(--ink)] font-medium">{block.name}</div>
      <div className="relative h-3 bg-[var(--bg-elev-2)] rounded-sm overflow-hidden">
        <div
          className={cn("absolute top-0 h-full rounded-sm", tone)}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>
      <div className="text-right text-[10px] font-mono text-[var(--ink-muted)] tabular">
        Wk {block.weeks}
      </div>
    </div>
  );
}
