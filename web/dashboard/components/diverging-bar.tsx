import { cn } from "@/lib/cn";

/**
 * Diverging bar: centered baseline, growth to the right, decline to the left.
 * `value` is the change magnitude (positive = growth, negative = decline).
 * `domain` is the symmetric absolute max in the dataset, so bars scale together.
 */
export function DivergingBar({
  value,
  domain,
  className,
}: {
  value: number;
  domain: number;
  className?: string;
}) {
  const pct = Math.min(100, (Math.abs(value) / Math.max(1, domain)) * 50);
  const isGrowth = value > 0;
  const tone = isGrowth ? "bg-[var(--accent)]" : "bg-[var(--bad)]";
  return (
    <div className={cn("relative h-3 w-full", className)}>
      {/* Center baseline rail */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--ink-dim)] opacity-60" />
      {/* Bar */}
      {value !== 0 && (
        <div
          className={cn("absolute top-0 bottom-0 rounded-sm", tone)}
          style={
            isGrowth
              ? { left: "50%", width: `${pct}%` }
              : { right: "50%", width: `${pct}%` }
          }
        />
      )}
    </div>
  );
}
