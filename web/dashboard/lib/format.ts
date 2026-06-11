/** Display helpers — all return strings. */
export const format = {
  weight: (kg: number | null | undefined, unit: "lb" | "kg" = "lb"): string => {
    if (kg == null) return "—";
    return unit === "lb"
      ? `${Math.round((kg / 0.45359237) * 10) / 10} lb`
      : `${Math.round(kg * 10) / 10} kg`;
  },

  date: (d: Date | string | null | undefined): string => {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  shortDate: (d: Date | string | null | undefined): string => {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },

  time: (d: Date | string | null | undefined): string => {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  },

  /** Brzycki e1RM */
  e1rm: (weight_kg: number, reps: number): number => {
    if (reps <= 0) return 0;
    if (reps === 1) return weight_kg;
    return weight_kg * (36 / (37 - reps));
  },

  pct: (n: number, d: number): string => {
    if (!d) return "0%";
    return `${Math.round((n / d) * 100)}%`;
  },

  delta: (current: number, target: number): string => {
    const d = target - current;
    if (d === 0) return "on target";
    const sign = d > 0 ? "+" : "";
    return `${sign}${Math.round(d * 10) / 10}`;
  },

  /** Page orientation string — "Wk 4 of 18 · 87 days to Aug 15 · Block 1 of 3" */
  orientation: (arc: {
    currentWeek?: number;
    totalWeeks?: number;
    end?: string;
    currentBlock?: { name: string } | null;
    blocks?: { name: string }[];
  }): string => {
    const parts: string[] = [];
    if (arc.currentWeek && arc.totalWeeks) {
      parts.push(`Wk ${arc.currentWeek} of ${arc.totalWeeks}`);
    }
    if (arc.end) {
      const days = Math.max(
        0,
        Math.ceil(
          (new Date(arc.end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      );
      const endStr = new Date(arc.end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      parts.push(`${days} days to ${endStr}`);
    }
    if (arc.currentBlock && arc.blocks?.length) {
      const idx = arc.blocks.findIndex((b) => b.name === arc.currentBlock!.name);
      if (idx >= 0) {
        parts.push(`Block ${idx + 1} of ${arc.blocks.length}`);
      }
    }
    return parts.join("  ·  ");
  },
};
