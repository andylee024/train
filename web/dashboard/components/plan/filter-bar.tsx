"use client";

import { Search, X } from "lucide-react";
import { CATEGORIES, type CoachCategory } from "@/lib/coaches";
import { cn } from "@/lib/cn";

export type Filters = {
  search: string;
  category: CoachCategory | "all";
  goal: string | "all";
  level: string | "all";
};

export function FilterBar({
  filters,
  onChange,
  goals,
  levels,
  resultCount,
}: {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  goals: string[];
  levels: string[];
  resultCount: number;
}) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search coaches, programs, philosophies…"
          className={cn(
            "w-full pl-9 pr-9 py-2 text-[12px] rounded-md tabular",
            "bg-[var(--bg-elev-1)] border border-[var(--line)]",
            "text-[var(--ink)] placeholder:text-[var(--ink-muted)]",
            "focus:outline-none focus:border-[var(--accent-line)]"
          )}
        />
        {filters.search && (
          <button
            onClick={() => onChange({ search: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Chip
          active={filters.category === "all"}
          onClick={() => onChange({ category: "all" })}
          label="All"
        />
        {(Object.entries(CATEGORIES) as [CoachCategory, { label: string; accent: string }][]).map(
          ([key, cat]) => (
            <Chip
              key={key}
              active={filters.category === key}
              onClick={() => onChange({ category: key })}
              label={cat.label}
              dot={cat.accent}
            />
          )
        )}
      </div>

      {/* Secondary filters: goal + level + count */}
      <div className="flex items-center gap-4 flex-wrap text-[11px]">
        <label className="flex items-center gap-2 text-[var(--ink-muted)]">
          <span className="font-mono uppercase tracking-wider text-[10px]">goal</span>
          <select
            value={filters.goal}
            onChange={(e) => onChange({ goal: e.target.value })}
            className="bg-[var(--bg-elev-2)] border border-[var(--line)] rounded-sm px-2 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--accent-line)] text-[11px]"
          >
            <option value="all">any</option>
            {goals.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[var(--ink-muted)]">
          <span className="font-mono uppercase tracking-wider text-[10px]">level</span>
          <select
            value={filters.level}
            onChange={(e) => onChange({ level: e.target.value })}
            className="bg-[var(--bg-elev-2)] border border-[var(--line)] rounded-sm px-2 py-1 text-[var(--ink)] focus:outline-none focus:border-[var(--accent-line)] text-[11px]"
          >
            <option value="all">any</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
          {resultCount} coach{resultCount === 1 ? "" : "es"}
        </span>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider border transition-colors",
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]"
          : "text-[var(--ink-muted)] border-[var(--line)] hover:border-[var(--accent-line)] hover:text-[var(--ink)]"
      )}
    >
      {dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: dot }}
        />
      )}
      {label}
    </button>
  );
}
