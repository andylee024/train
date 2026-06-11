/**
 * L2 viz primitive — generic chronological grid table.
 * Pure data → pixels. Caller provides columns + rows. Optional per-row href
 * makes each row a Link.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type EventColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  width: string;           // CSS grid template column expression, e.g. "80px", "1fr"
  render: (row: T) => ReactNode;
};

export type EventTableProps<T> = {
  rows: T[];
  columns: EventColumn<T>[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string;
  emptyMessage?: ReactNode;
};

export function EventTable<T>({
  rows,
  columns,
  rowKey,
  rowHref,
  emptyMessage = "No events.",
}: EventTableProps<T>) {
  const gridTemplate = columns.map((c) => c.width).join(" ");
  if (rows.length === 0) {
    return (
      <div className="text-[11px] text-[var(--ink-muted)] py-2">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="text-[12px]">
      {/* Header */}
      <div
        className="grid gap-3 pb-1.5 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((c) => (
          <div key={c.key} className={c.align === "right" ? "text-right" : ""}>
            {c.label}
          </div>
        ))}
      </div>
      {/* Rows */}
      {rows.map((row) => {
        const href = rowHref?.(row);
        const Wrap = href ? Link : "div";
        const wrapProps = href
          ? { href: href as string }
          : ({} as Record<string, never>);
        return (
          <Wrap
            key={rowKey(row)}
            {...(wrapProps as { href: string })}
            className={cn(
              "grid gap-3 py-1 items-baseline border-b border-[var(--line-soft)] last:border-b-0 rounded-sm -mx-1 px-1 transition-colors",
              href && "hover:bg-[var(--bg-elev-2)]"
            )}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map((c) => (
              <div
                key={c.key}
                className={cn(
                  "min-w-0 truncate",
                  c.align === "right" && "text-right"
                )}
              >
                {c.render(row)}
              </div>
            ))}
          </Wrap>
        );
      })}
    </div>
  );
}
