"use client";

import { CoachCard } from "./coach-card";
import type { Coach } from "@/lib/coaches";

export function RecommendedBand({
  coaches,
  selected,
  toggle,
  onOpen,
}: {
  coaches: Coach[];
  selected: string[];
  toggle: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  if (coaches.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--accent)]">
          ★ Recommended for you
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-muted)]">
          based on your goals
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <CoachCard
            key={coach.id}
            coach={coach}
            selected={selected.includes(coach.id)}
            matchesGoals
            onToggle={() => toggle(coach.id)}
            onOpen={() => onOpen(coach.id)}
          />
        ))}
      </div>
    </section>
  );
}
