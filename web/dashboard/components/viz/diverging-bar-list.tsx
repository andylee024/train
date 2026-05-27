/**
 * L2 viz primitive — sorted list of (name, value, sub) rows with diverging
 * bars (centered baseline rail, growth right, decline left).
 * No chrome, no card. Caller wraps in <Widget> and provides filter chrome.
 */
import Link from "next/link";
import { DivergingBar } from "@/components/diverging-bar";
import { cn } from "@/lib/cn";

export type DivergingBarRow = {
  key: string;             // stable id (e.g. lift name)
  name: string;            // display name
  value: number;           // signed delta — drives bar direction + length
  sub?: string;            // secondary text (e.g. baseline → current)
  highlight?: boolean;     // accent variant of bar (e.g. PR row)
  href?: string;           // per-row drill-through
  trailing?: string;       // small text after sub (e.g. "PR✦")
};

export type DivergingBarListProps = {
  rows: DivergingBarRow[];
  domain?: number;         // shared bar scale (defaults to max |value|)
  emptyMessage?: string;
};

const GRID_COLS = "grid-cols-[180px_1fr_70px_140px]";

export function DivergingBarList({
  rows,
  domain,
  emptyMessage = "No rows match.",
}: DivergingBarListProps) {
  if (rows.length === 0) {
    return (
      <div className="text-[11px] text-[var(--ink-muted)] py-3">
        {emptyMessage}
      </div>
    );
  }

  const computedDomain = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  const d = domain ?? computedDomain;

  return (
    <div>
      <div
        className={cn(
          "grid gap-3 items-baseline pb-1.5 mb-1 border-b border-[var(--line)] text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)]",
          GRID_COLS
        )}
      >
        <div></div>
        <div className="grid grid-cols-3 items-baseline">
          <span>← decline</span>
          <span className="text-center">baseline</span>
          <span className="text-right">growth →</span>
        </div>
        <div className="text-right">Δ</div>
        <div className="text-right">detail</div>
      </div>
      {rows.map((row) => (
        <Row key={row.key} row={row} domain={d} />
      ))}
    </div>
  );
}

function Row({ row, domain }: { row: DivergingBarRow; domain: number }) {
  const isGrowth = row.value > 0;
  const Wrap = row.href ? Link : "div";
  const wrapProps = row.href
    ? { href: row.href as string }
    : ({} as Record<string, never>);
  return (
    <Wrap
      {...(wrapProps as { href: string })}
      className={cn(
        "grid gap-3 items-center py-1 -mx-2 px-2 rounded-sm transition-colors text-[12px]",
        GRID_COLS,
        row.href && "hover:bg-[var(--bg-elev-2)]"
      )}
    >
      <div className="text-[var(--ink)] truncate">{row.name}</div>
      <DivergingBar value={row.value} domain={domain} />
      <div
        className={cn(
          "text-right tabular font-mono",
          isGrowth ? "text-[var(--good)]" : row.value < 0 ? "text-[var(--bad)]" : "text-[var(--ink-dim)]"
        )}
      >
        {isGrowth ? "+" : ""}
        {row.value.toFixed(0)}
      </div>
      <div className="text-right tabular text-[10px] font-mono text-[var(--ink-muted)]">
        {row.sub ?? "—"}
        {row.trailing && (
          <span className="text-[var(--accent)] ml-1">{row.trailing}</span>
        )}
      </div>
    </Wrap>
  );
}
