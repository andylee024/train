/**
 * L1 widget primitive — the only place card chrome lives.
 *
 * Owns: border, background, padding, hover state, optional title/meta/footer,
 * whole-card click-through via href, empty/loading/error states.
 *
 * Does NOT know about data, queries, or domain shapes. Wraps children.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { WidgetSkeleton } from "./widget-skeleton";

export type WidgetState = "ok" | "loading" | "empty" | "error";

export type WidgetProps = {
  title?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  href?: string;                   // whole-card Link when set
  state?: WidgetState;
  emptyMessage?: ReactNode;
  children: ReactNode;
  className?: string;
};

const CHROME =
  "block bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-4 transition-colors";

const HOVER =
  "hover:border-[var(--accent-line)] hover:bg-[var(--bg-elev-2)]";

export function Widget({
  title,
  meta,
  footer,
  href,
  state = "ok",
  emptyMessage = "No data.",
  children,
  className,
}: WidgetProps) {
  const body = (
    <>
      {(title || meta) && (
        <div className="flex items-baseline justify-between gap-3 mb-3">
          {title && (
            <div className="text-[13px] text-[var(--ink)] font-medium truncate">
              {title}
            </div>
          )}
          {meta && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular truncate">
              {meta}
            </div>
          )}
        </div>
      )}

      {state === "loading" && <WidgetSkeleton />}
      {state === "empty" && (
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] py-3">
          {emptyMessage}
        </div>
      )}
      {state === "error" && (
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--bad)] py-3">
          error · couldn't load
        </div>
      )}
      {state === "ok" && children}

      {footer && (
        <div className="mt-3 pt-3 border-t border-[var(--line-soft)]">
          {footer}
        </div>
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
