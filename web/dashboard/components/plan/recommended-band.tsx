"use client";

import { useEffect, useState } from "react";
import { CoachCard } from "./coach-card";
import type { Coach } from "@/lib/coaches";
import { matchingGoals as computeMatchingGoals } from "@/lib/matching";
import type { GoalKey } from "@/lib/use-intake";
import { cn } from "@/lib/cn";

export function RecommendedBand({
  coaches,
  selected,
  toggle,
  onOpen,
  goals,
  animate = false,
  atCap = false,
}: {
  coaches: Coach[];
  selected: string[];
  toggle: (id: string) => void;
  onOpen: (id: string) => void;
  goals: GoalKey[];
  animate?: boolean;
  atCap?: boolean;
}) {
  const [mounted, setMounted] = useState(!animate);
  const [pulse, setPulse] = useState(animate);

  useEffect(() => {
    if (!animate) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMounted(true);
      setPulse(false);
      return;
    }
    const r1 = requestAnimationFrame(() => setMounted(true));
    const t = window.setTimeout(() => setPulse(false), 1800);
    return () => {
      cancelAnimationFrame(r1);
      window.clearTimeout(t);
    };
  }, [animate]);

  if (coaches.length === 0) return null;

  return (
    <section
      className={cn(
        "mb-6 transition-all duration-300 ease-out motion-reduce:transition-none",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      )}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={cn(
            "text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--accent)]",
            pulse && "motion-safe:animate-pulse"
          )}
        >
          ★ Recommended for you
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-muted)]">
          based on your goals
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <CoachCard
            key={coach.id}
            coach={coach}
            selected={selected.includes(coach.id)}
            matchingGoals={computeMatchingGoals(coach, goals)}
            onToggle={() => toggle(coach.id)}
            onOpen={() => onOpen(coach.id)}
            atCap={atCap}
          />
        ))}
      </div>
    </section>
  );
}
