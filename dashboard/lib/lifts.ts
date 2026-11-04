import type { LiftMeta } from "./types";

/** Sunday that starts arc week 1. Blocks are 28 days from here. */
export const ARC_W1 = "2026-05-24";

/** Last day of the summer dunk arc (W24, Saturday). */
export const SUMMER_ARC_END = "2026-11-07";

/** Sunday the next arc's week numbers restart. */
export const JUMP_ARC_START = "2026-11-08";

/** Pounds per kilogram. Inverse of exercise_sets.weight_kg factor 0.45359237. */
export const LB_PER_KG = 1 / 0.45359237;

export const PINNED_LIFTS: LiftMeta[] = [
  { key: "back-squat", label: "Back Squat", goalLb: 405 },
  { key: "power-clean", label: "Power Clean", goalLb: 225 },
  { key: "clean-and-jerk", label: "Clean & Jerk", goalLb: 225 },
  { key: "power-snatch", label: "Power Snatch", goalLb: null },
];

const GOAL_LB = new Map(PINNED_LIFTS.map((lift) => [lift.key, lift.goalLb]));

/** Collapse case, ampersands, and punctuation so aliases compare cleanly. */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Map a logged exercise name onto a dashboard lift. */
export function canonicalLift(name: string): { key: string; label: string } {
  const normalized = normalizeName(name);
  if (normalized === "back squat") return { key: "back-squat", label: "Back Squat" };
  if (normalized === "power clean") return { key: "power-clean", label: "Power Clean" };
  if (normalized === "power clean and jerk" || normalized === "clean and jerk") {
    return { key: "clean-and-jerk", label: "Clean & Jerk" };
  }
  if (normalized === "power snatch") return { key: "power-snatch", label: "Power Snatch" };
  return { key: `x:${normalized}`, label: name.trim() };
}

/** Goal line in pounds, or null when this lift has no stated target. */
export function goalFor(key: string): number | null {
  return GOAL_LB.get(key) ?? null;
}

/** Epley estimated 1RM. Sets outside 1–10 reps are excluded. */
export function epleyLb(weightLb: number, reps: number): number | null {
  if (!Number.isFinite(weightLb) || weightLb <= 0) return null;
  if (!Number.isInteger(reps) || reps < 1 || reps > 10) return null;
  return weightLb * (1 + reps / 30);
}

/** Loaded weight in pounds. Bodyweight, zero, and empty loads are null. */
export function weightToLb(unit: unknown, value: unknown, weightKg: unknown): number | null {
  const fromNumber = (raw: unknown): number | null => {
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };
  const named = typeof unit === "string" ? unit.trim().toLowerCase() : "";
  const amount = fromNumber(value);
  const kg = fromNumber(weightKg);
  if (named === "lb" || named === "lbs" || named === "pounds") {
    return amount != null && amount > 0 ? amount : null;
  }
  if (named === "kg" || named === "kgs" || named === "kilograms") {
    return amount != null && amount > 0 ? amount * LB_PER_KG : null;
  }
  if (named === "bw" || named === "bodyweight") return null;
  if (kg != null && kg > 0) return kg * LB_PER_KG;
  return null;
}
