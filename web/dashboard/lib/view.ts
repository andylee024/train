/**
 * Views — the three lenses on the strength data (Upper / Lower / Power),
 * each with its key lifts. Names must match `exercises.name` in Supabase.
 */
import { categorizeExercise, subcategorizeStrength } from "@/lib/categorize";

export type View = "Upper" | "Lower" | "Power";

export const VIEWS: View[] = ["Upper", "Lower", "Power"];

export const KEY_LIFTS: Record<View, string[]> = {
  Upper: ["Bench Press", "Chin-up/Pull-up", "BB OHP", "Dips"],
  Lower: ["Back Squat", "Front Squat", "Deadlift", "Hip Thrust"],
  Power: ["Power Clean", "Seated Vertical Jumps", "Approach Jumps", "Broad Jump"],
};

export const ALL_KEY_LIFTS = VIEWS.flatMap((v) => KEY_LIFTS[v]);

export function viewFor(name: string): View | null {
  const sub = subcategorizeStrength(name);
  if (sub === "Upper") return "Upper";
  if (sub === "Lower") return "Lower";
  if (categorizeExercise(name) === "Power") return "Power";
  return null;
}
