import Link from "next/link";
import type { LiftChange } from "@/lib/queries";
import { DivergingBar } from "@/components/diverging-bar";
import { categorizeExercise, type ExerciseCategory } from "@/lib/categorize";
import { cn } from "@/lib/cn";

const THEME_TAG: Record<ExerciseCategory, { label: string; tone: string }> = {
  Strength: { label: "S", tone: "text-[var(--accent)] border-[var(--accent-line)]" },
  Power:    { label: "P", tone: "text-[var(--info)] border-[var(--line)]" },
  Mobility: { label: "M", tone: "text-[var(--good)] border-[var(--line)]" },
  Other:    { label: "O", tone: "text-[var(--ink-muted)] border-[var(--line-soft)]" },
};

const GRID_WITH_TAG = "grid-cols-[28px_180px_1fr_70px_140px]";
const GRID_NO_TAG   = "grid-cols-[180px_1fr_70px_140px]";

export function LiftChangesHeader({ hideThemeColumn = false }: { hideThemeColumn?: boolean }) {
  const gridCols = hideThemeColumn ? GRID_NO_TAG : GRID_WITH_TAG;
  return (
    <div className={cn(
      "grid gap-3 items-baseline pb-1.5 mb-1 border-b border-[var(--line)] text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)]",
      gridCols
    )}>
      {!hideThemeColumn && <div></div>}
      <div></div>
      <div className="grid grid-cols-3 items-baseline">
        <span>← decline</span>
        <span className="text-center">baseline</span>
        <span className="text-right">growth →</span>
      </div>
      <div className="text-right">Δ lb</div>
      <div className="text-right">start → now</div>
    </div>
  );
}

/**
 * One lift row with diverging bar. Exported so KeyLifts can render the same shape.
 */
export function LiftRow({
  lift,
  domain,
  today,
  hideThemeColumn = false,
}: {
  lift: LiftChange;
  domain: number;
  today: Date;
  hideThemeColumn?: boolean;
}) {
  const theme = categorizeExercise(lift.name);
  const tag = THEME_TAG[theme];
  const prDate = new Date(lift.prDate);
  const isPRToday = prDate.toDateString() === today.toDateString();
  const isAtPR = Math.abs(lift.currentLb - lift.prLb) < 0.5;
  const isGrowth = lift.deltaLb > 0;

  const fmt = (v: number) => {
    if (lift.name.toLowerCase().includes("pull")) {
      return `${v >= 0 ? "+" : ""}${v.toFixed(0)}`;
    }
    return v.toFixed(0);
  };

  const gridCols = hideThemeColumn ? GRID_NO_TAG : GRID_WITH_TAG;

  return (
    <Link
      href={`/progress/${lift.slug}`}
      className={cn(
        "grid gap-3 items-center py-1 -mx-2 px-2 rounded-sm hover:bg-[var(--bg-elev-2)] transition-colors text-[12px]",
        gridCols
      )}
    >
      {!hideThemeColumn && (
        <div className="flex justify-start">
          <span className={cn(
            "inline-flex items-center justify-center w-5 h-5 rounded-sm text-[9px] font-mono uppercase font-semibold border tabular",
            tag.tone
          )}>
            {tag.label}
          </span>
        </div>
      )}
      <div className="text-[var(--ink)] truncate">{lift.name}</div>
      <DivergingBar value={lift.deltaLb} domain={domain} />
      <div className={cn(
        "text-right tabular font-mono",
        isGrowth ? "text-[var(--good)]" : "text-[var(--bad)]"
      )}>
        {isGrowth ? "+" : ""}{lift.deltaLb.toFixed(0)}
      </div>
      <div className="text-right tabular text-[10px] font-mono text-[var(--ink-muted)]">
        {fmt(lift.baselineLb)}
        <span className="mx-1">→</span>
        <span className="text-[var(--ink-dim)]">{fmt(lift.currentLb)}</span>
        {isAtPR && (
          <span className="text-[var(--accent)] ml-1">
            {isPRToday ? "PR✦" : "PR"}
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * Placeholder row when a representative lift has no data in the lookback window.
 */
export function NoDataRow({
  name,
  hideThemeColumn = false,
}: {
  name: string;
  hideThemeColumn?: boolean;
}) {
  const theme = categorizeExercise(name);
  const tag = THEME_TAG[theme];
  const gridCols = hideThemeColumn ? GRID_NO_TAG : GRID_WITH_TAG;
  return (
    <div className={cn(
      "grid gap-3 items-center py-1 -mx-2 px-2 text-[12px] text-[var(--ink-muted)] opacity-60",
      gridCols
    )}>
      {!hideThemeColumn && (
        <div className="flex justify-start">
          <span className={cn(
            "inline-flex items-center justify-center w-5 h-5 rounded-sm text-[9px] font-mono uppercase font-semibold border tabular opacity-60",
            tag.tone
          )}>
            {tag.label}
          </span>
        </div>
      )}
      <div className="truncate">{name}</div>
      <div className="text-[10px] font-mono tabular">no data in lookback</div>
      <div className="text-right tabular font-mono">—</div>
      <div className="text-right tabular text-[10px] font-mono">—</div>
    </div>
  );
}

/**
 * Render representative (key) lifts as rows. Names are rendered in the given
 * order; any missing from the dataset render as a NoDataRow placeholder.
 */
export function KeyLifts({
  names,
  lifts,
  domain,
  hideThemeColumn = false,
}: {
  names: string[];
  lifts: LiftChange[];
  domain: number;
  hideThemeColumn?: boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div>
      <LiftChangesHeader hideThemeColumn={hideThemeColumn} />
      {names.map((name) => {
        const lift = lifts.find((l) => l.name === name);
        return lift ? (
          <LiftRow
            key={name}
            lift={lift}
            domain={domain}
            today={today}
            hideThemeColumn={hideThemeColumn}
          />
        ) : (
          <NoDataRow key={name} name={name} hideThemeColumn={hideThemeColumn} />
        );
      })}
    </div>
  );
}

/**
 * The full ranked diverging-bar list.
 * Threshold: |Δ| ≥ thresholdLb OR |%| ≥ thresholdPct.
 * `excludeNames` skips rows whose lift name is already shown elsewhere (e.g.
 * the Key Lifts section).
 */
export function LiftChanges({
  lifts,
  thresholdLb = 5,
  thresholdPct = 3,
  hideThemeColumn = false,
  excludeNames = [],
}: {
  lifts: LiftChange[];
  thresholdLb?: number;
  thresholdPct?: number;
  hideThemeColumn?: boolean;
  excludeNames?: string[];
}) {
  const excludeSet = new Set(excludeNames);
  const meaningful = lifts.filter(
    (l) =>
      !excludeSet.has(l.name) &&
      (Math.abs(l.deltaLb) >= thresholdLb || Math.abs(l.pctChange) >= thresholdPct)
  );
  const sorted = [...meaningful].sort((a, b) => b.deltaLb - a.deltaLb);
  const domain = Math.max(1, ...sorted.map((l) => Math.abs(l.deltaLb)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (sorted.length === 0) {
    return (
      <div className="text-[11px] text-[var(--ink-muted)] py-2">
        Nothing else has moved more than {thresholdLb} lb in the lookback window.
      </div>
    );
  }

  return (
    <div>
      <LiftChangesHeader hideThemeColumn={hideThemeColumn} />
      <div>
        {sorted.map((lift) => (
          <LiftRow
            key={lift.name}
            lift={lift}
            domain={domain}
            today={today}
            hideThemeColumn={hideThemeColumn}
          />
        ))}
      </div>
    </div>
  );
}
