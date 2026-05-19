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
};
