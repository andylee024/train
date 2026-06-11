/**
 * Unicode sparkbar — discrete per-session bars. No interpolation, no curve smoothing.
 * Bars use 8 height steps (▁▂▃▄▅▆▇█). Use for showing e1RM progression.
 */

const BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export function Sparkbar({
  values,
  domain,
  max: maxLen = 24,
  className = "",
}: {
  values: number[];
  domain?: [number, number];
  max?: number;
  className?: string;
}) {
  if (values.length === 0) {
    return <span className={`font-mono text-[var(--ink-muted)] ${className}`}>───</span>;
  }
  // Sample down if too many points
  const sampled = values.length <= maxLen
    ? values
    : sample(values, maxLen);

  const [lo, hi] = domain ?? [Math.min(...sampled), Math.max(...sampled)];
  const range = Math.max(0.0001, hi - lo);
  const chars = sampled.map((v) => {
    const t = Math.max(0, Math.min(1, (v - lo) / range));
    return BLOCKS[Math.min(7, Math.floor(t * 7))];
  });
  return (
    <span className={`font-mono tracking-tight text-[var(--accent)] ${className}`}>
      {chars.join("")}
    </span>
  );
}

function sample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const step = (arr.length - 1) / (n - 1);
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(arr[Math.round(i * step)]);
  }
  return out;
}
