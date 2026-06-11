import Link from "next/link";
import type { ExerciseSummary } from "@/lib/queries";
import { categorizeExercise, CATEGORY_ORDER, type ExerciseCategory } from "@/lib/categorize";

function isRecentPR(row: ExerciseSummary): boolean {
  if (!row.pr) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return new Date(row.pr.date) > cutoff;
}

function CategoryColumn({
  category,
  rows,
}: {
  category: ExerciseCategory;
  rows: ExerciseSummary[];
}) {
  const sorted = [...rows].sort((a, b) => b.sessionCount - a.sessionCount);
  return (
    <div>
      <div className="hairline pt-1.5 pb-1.5 mb-1.5 flex items-baseline justify-between">
        <span className="section-label">{category}</span>
        <span className="text-[10px] font-mono tabular text-[var(--ink-muted)]">
          {rows.length}
        </span>
      </div>
      {sorted.length === 0 ? (
        <div className="text-[10px] font-mono text-[var(--ink-muted)] py-1">no data</div>
      ) : (
        <div>
          {sorted.map((row) => {
            const recent = isRecentPR(row);
            return (
              <Link
                key={row.name}
                href={`/progress/${row.slug}`}
                className="grid grid-cols-[1fr_auto] gap-2 items-baseline py-0.5 hover:bg-[var(--bg-elev-2)] -mx-1 px-1 rounded-sm transition-colors text-[11px]"
              >
                <span className="text-[var(--ink)] truncate">
                  {row.name}
                  {recent && (
                    <span className="text-[var(--accent)] text-[10px] ml-1">✦</span>
                  )}
                </span>
                <span className="tabular text-[var(--ink-muted)] font-mono">
                  {row.sessionCount}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ExerciseCategoryCards({ rows }: { rows: ExerciseSummary[] }) {
  const groups = new Map<ExerciseCategory, ExerciseSummary[]>();
  for (const cat of CATEGORY_ORDER) groups.set(cat, []);
  for (const r of rows) {
    const cat = categorizeExercise(r.name);
    groups.get(cat)!.push(r);
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {CATEGORY_ORDER.map((cat) => (
        <CategoryColumn key={cat} category={cat} rows={groups.get(cat)!} />
      ))}
    </div>
  );
}
