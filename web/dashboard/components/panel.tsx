/**
 * Panel — the one place card chrome lives (border, padding, hover, optional
 * title/meta, whole-card link, empty state). Knows nothing about data.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const CHROME =
  "block bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-4 transition-colors";
const HOVER = "hover:border-[var(--accent-line)] hover:bg-[var(--bg-elev-2)]";

export function Panel({
  title,
  meta,
  href,
  empty,
  emptyMessage = "No data.",
  children,
  className,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  href?: string;
  empty?: boolean;
  emptyMessage?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      {(title || meta) && (
        <div className="flex items-baseline justify-between gap-3 mb-3">
          {title && (
            <div className="text-[13px] text-[var(--ink)] font-medium truncate">{title}</div>
          )}
          {meta && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular truncate">
              {meta}
            </div>
          )}
        </div>
      )}
      {empty ? (
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] py-3">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(CHROME, HOVER, className)}>
        {body}
      </Link>
    );
  }
  return <div className={cn(CHROME, className)}>{body}</div>;
}
