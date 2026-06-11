"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Search, X } from "lucide-react";
import type { ExerciseSummary } from "@/lib/queries";
import { cn } from "@/lib/cn";
import { format } from "@/lib/format";
import { categorizeExercise, CATEGORY_ORDER, type ExerciseCategory } from "@/lib/categorize";

type SortKey = "lastTouched" | "sessionCount" | "tonnage_kg" | "e1rmDelta_kg" | "currentE1rm_kg";

const COLUMNS: { key: SortKey; label: string; format: (s: ExerciseSummary) => string; align?: "right" }[] = [
  { key: "lastTouched", label: "Last", format: (s) => (s.lastTouched ? format.shortDate(s.lastTouched) : "—") },
  { key: "sessionCount", label: "Sessions", format: (s) => s.sessionCount.toString(), align: "right" },
  {
    key: "tonnage_kg",
    label: "Tonnage 90d",
    format: (s) => (s.tonnage_kg > 0 ? `${(s.tonnage_kg / 1000).toFixed(1)} t` : "—"),
    align: "right",
  },
  {
    key: "e1rmDelta_kg",
    label: "Δ e1RM",
    format: (s) =>
      s.e1rmDelta_kg == null
        ? "—"
        : `${s.e1rmDelta_kg > 0 ? "+" : ""}${(s.e1rmDelta_kg / 0.45359237).toFixed(1)} lb`,
    align: "right",
  },
  {
    key: "currentE1rm_kg",
    label: "Current",
    format: (s) => (s.currentE1rm_kg ? format.weight(s.currentE1rm_kg) : "—"),
    align: "right",
  },
];

export function ExerciseTable({ rows }: { rows: ExerciseSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("sessionCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, filter]);

  const grouped = useMemo(() => {
    const map = new Map<ExerciseCategory, ExerciseSummary[]>();
    for (const r of filtered) {
      const cat = categorizeExercise(r.name);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(r);
    }
    // Sort within each group by selected sort key (default: sessions desc)
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const av = (a[sortKey] ?? -Infinity) as number | string;
        const bv = (b[sortKey] ?? -Infinity) as number | string;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map(
      (c) => [c, map.get(c)!] as const
    );
  }, [filtered, sortKey, sortDir]);

  const totalSorted = grouped.reduce((n, [, arr]) => n + arr.length, 0);

  function setSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const recentPRThreshold = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  })();

  return (
    <div className="text-[13px]">
      {/* Filter input */}
      <div className="relative mb-2">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none"
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter exercises…  (e.g. squat, snatch, +25)"
          className={cn(
            "w-full pl-8 pr-8 py-1.5 text-[13px] rounded-md",
            "bg-[var(--bg-elev-2)] border border-[var(--line)]",
            "text-[var(--ink)] placeholder:text-[var(--ink-muted)]",
            "focus:outline-none focus:border-[var(--accent-line)] focus:bg-[var(--bg-elev-3)]",
            "transition-colors tabular"
          )}
          autoComplete="off"
          spellCheck={false}
        />
        {filter && (
          <button
            onClick={() => setFilter("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-elev-3)] transition-colors"
            aria-label="Clear filter"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {filter && (
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2 px-1">
          {totalSorted} of {rows.length} match "{filter}"
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.9fr_0.9fr_0.9fr_36px] gap-3 px-1 pb-1.5 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        <div>Exercise</div>
        {COLUMNS.map((c) => (
          <button
            key={c.key}
            onClick={() => setSort(c.key)}
            className={cn(
              "flex items-center gap-1 hover:text-[var(--ink-dim)] transition-colors",
              c.align === "right" && "justify-end",
              sortKey === c.key && "text-[var(--accent)]"
            )}
          >
            {c.label}
            {sortKey === c.key &&
              (sortDir === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />)}
          </button>
        ))}
        <div className="text-right">PR</div>
        <div />
      </div>

      {/* Rows, grouped by category */}
      {totalSorted === 0 ? (
        <div className="text-sm text-[var(--ink-muted)] py-8 text-center">
          No exercises match.
        </div>
      ) : null}
      {grouped.map(([cat, arr]) => (
        <div key={cat} className="mt-2">
          <div className="flex items-baseline gap-2 px-1 pt-2 pb-1 border-b border-[var(--line-soft)]">
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--accent)]">
              {cat}
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
              {arr.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--line-soft)]">
            {arr.map((row) => {
              const recentPR = row.pr && row.pr.date > recentPRThreshold;
              return (
                <Link
                  key={row.name}
                  href={`/progress/${row.slug}`}
                  className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.9fr_0.9fr_0.9fr_36px] gap-3 px-1 py-1.5 hover:bg-[var(--bg-elev-2)] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--ink)]">{row.name}</span>
                    {recentPR && (
                      <span className="text-[var(--accent)] text-xs" title="PR in last 30 days">
                        ✦
                      </span>
                    )}
                  </div>
                  {COLUMNS.map((c, i) => {
                    const v = c.format(row);
                    const positive =
                      c.key === "e1rmDelta_kg" && row.e1rmDelta_kg != null && row.e1rmDelta_kg > 0;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "tabular text-[var(--ink-dim)]",
                          c.align === "right" && "text-right",
                          positive && "text-[var(--good)]"
                        )}
                      >
                        {v}
                      </div>
                    );
                  })}
                  <div className="text-right tabular text-[var(--ink-muted)] text-xs">
                    {row.pr ? format.shortDate(row.pr.date) : "—"}
                  </div>
                  <div className="text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors text-right">
                    ›
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
