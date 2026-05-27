/**
 * View membership predicate — pure, server-callable.
 *
 * A "view" is a saved lens on the data — Upper / Lower / Power / Flexibility
 * for now. The same module is used by both the server page (to compute
 * view-scoped headlines) and the client view switcher.
 */
import { categorizeExercise, subcategorizeStrength } from "@/lib/categorize";

export type View = "Upper" | "Lower" | "Power" | "Flexibility";

export const VIEWS: View[] = ["Upper", "Lower", "Power", "Flexibility"];

export function viewFor(name: string): View | null {
  const sub = subcategorizeStrength(name);
  if (sub === "Upper") return "Upper";
  if (sub === "Lower") return "Lower";
  if (categorizeExercise(name) === "Power") return "Power";
  return null;
}
