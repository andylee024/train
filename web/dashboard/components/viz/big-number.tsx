/**
 * L2 viz primitive — single big tabular value + caption + optional trend arrow.
 * No chrome, no card, no border. Caller wraps in <Widget>.
 */
import { cn } from "@/lib/cn";

export type BigNumberProps = {
  value: string | number;
  unit?: string;
  caption?: string;
  trend?: "up" | "down" | "flat" | null;
  className?: string;
};

export function BigNumber({ value, unit, caption, trend, className }: BigNumberProps) {
  const arrow =
    trend === "up" ? "↗" :
    trend === "down" ? "↘" :
    trend === "flat" ? "→" :
    "";
  const tone =
    trend === "up" ? "text-[var(--good)]" :
    trend === "down" ? "text-[var(--bad)]" :
    "text-[var(--ink-muted)]";
  return (
    <div className={cn("flex flex-col items-start min-w-0", className)}>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold tabular leading-none tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-[var(--ink-muted)] tabular leading-none">
            {unit}
          </span>
        )}
        {arrow && (
          <span className={cn("text-sm tabular leading-none", tone)}>{arrow}</span>
        )}
      </div>
      {caption && (
        <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          {caption}
        </div>
      )}
    </div>
  );
}
