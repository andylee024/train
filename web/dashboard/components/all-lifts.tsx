"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { LiftChange } from "@/lib/queries";
import {
  LiftChangesHeader,
  LiftRow,
} from "@/components/lift-changes";
import { cn } from "@/lib/cn";

const THRESHOLD_LB = 5;
const THRESHOLD_PCT = 3;

const aboveThreshold = (l: LiftChange) =>
  Math.abs(l.deltaLb) >= THRESHOLD_LB || Math.abs(l.pctChange) >= THRESHOLD_PCT;

export type AllLiftsFilter = {
  id: string;
  label: string;
  predicate: (lift: LiftChange) => boolean;
};

/**
 * Composable diverging-bar table for "every lift moving in this tab."
 * Ships with default filter chips; extra chips can be passed in via
 * `additionalFilters` (this is the v2 extension point — user-defined filters).
 */
export function AllLifts({
  lifts,
  keyNames = [],
  additionalFilters = [],
}: {
  lifts: LiftChange[];
  keyNames?: string[];
  additionalFilters?: AllLiftsFilter[];
}) {
  const keySet = useMemo(() => new Set(keyNames), [keyNames]);

  const DEFAULT_FILTERS: AllLiftsFilter[] = useMemo(
    () => [
      { id: "all",       label: "All",       predicate: aboveThreshold },
      { id: "core",      label: "Core",      predicate: (l) => keySet.has(l.name) },
      { id: "growing",   label: "Growing",   predicate: (l) => l.deltaLb > 0 && aboveThreshold(l) },
      { id: "declining", label: "Declining", predicate: (l) => l.deltaLb < 0 && aboveThreshold(l) },
      { id: "stalled",   label: "Stalled",   predicate: (l) => !aboveThreshold(l) },
    ],
    [keySet]
  );

  const filters = useMemo(
    () => [...DEFAULT_FILTERS, ...additionalFilters],
    [DEFAULT_FILTERS, additionalFilters]
  );

  const [activeId, setActiveId] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const activeFilter = filters.find((f) => f.id === activeId) ?? filters[0];

  const matched = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lifts.filter((l) => {
      if (q && !l.name.toLowerCase().includes(q)) return false;
      return activeFilter.predicate(l);
    });
  }, [lifts, activeFilter, search]);

  const sorted = useMemo(
    () => [...matched].sort((a, b) => b.deltaLb - a.deltaLb),
    [matched]
  );

  const domain = Math.max(1, ...sorted.map((l) => Math.abs(l.deltaLb)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      {/* Filter chips + search */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider flex-wrap">
          {filters.map((f) => {
            const isActive = f.id === activeId;
            return (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className={cn(
                  "px-1.5 py-0.5 rounded-sm transition-colors",
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                    : "text-[var(--ink-muted)] border border-transparent hover:text-[var(--ink-dim)]"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="relative max-w-[220px] w-full">
          <Search
            size={11}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search..."
            className="w-full pl-7 pr-7 py-1 text-[11px] rounded-sm bg-[var(--bg-elev-2)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-line)] tabular"
            autoComplete="off"
            spellCheck={false}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
              aria-label="clear"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Rows */}
      {sorted.length === 0 ? (
        <div className="text-[11px] text-[var(--ink-muted)] py-3">
          {search
            ? `No lifts match "${search}"`
            : `No lifts match this filter.`}
        </div>
      ) : (
        <>
          <LiftChangesHeader hideThemeColumn />
          {sorted.map((lift) => (
            <LiftRow
              key={lift.name}
              lift={lift}
              domain={domain}
              today={today}
              hideThemeColumn
            />
          ))}
        </>
      )}

    </div>
  );
}
