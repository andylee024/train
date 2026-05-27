/**
 * Mock blend generator — given selected coaches + days/wk, assign each
 * training day to a coach + session type. This is the preview shown on the
 * Review step BEFORE real synthesis.
 *
 * v1 is deterministic and rule-based. v2 will use the AI synthesis output.
 */
import type { Coach, CoachCategory } from "@/lib/coaches";

export type BlendDay = {
  dayLabel: string;          // "Mon", "Tue", ...
  coach: Coach | null;       // null = rest/recovery
  sessionLabel: string;      // "Lower power", "Recovery", "Rest"
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Session label hints by coach category — keeps the preview feeling distinct.
const SESSION_BY_CATEGORY: Record<CoachCategory, string[]> = {
  strength:  ["Upper hypertrophy", "Lower hypertrophy", "Push", "Pull", "Arms"],
  athletic:  ["Lower power", "Plyo + movement", "Olympic + explosive", "Sprint + jump"],
  aesthetic: ["Chest", "Back", "Legs", "Shoulders", "Arms"],
  hybrid:    ["Strength + WOD", "Engine", "Long capacity", "VO2 + carries"],
};

/**
 * Generate a deterministic mock blend for the review step.
 * - Distributes coaches across training days (round-robin in declaration order)
 * - Picks session labels from each coach's category
 * - Fills remaining days with "Recovery" / "Rest"
 */
export function generateBlend(coaches: Coach[], daysPerWeek: number): BlendDay[] {
  const trainingCount = Math.max(0, Math.min(7, daysPerWeek));
  const out: BlendDay[] = [];

  // For each of the 7 calendar days, decide: training or rest.
  // Pattern for 5 d/wk = Mon-Fri training, Sat recovery, Sun rest. Adjust by count.
  for (let i = 0; i < 7; i++) {
    const isTraining = i < trainingCount;
    if (!isTraining) {
      out.push({
        dayLabel: DAYS[i],
        coach: null,
        sessionLabel: i === 6 ? "Rest" : i === trainingCount ? "Active recovery" : "Rest",
      });
      continue;
    }
    if (coaches.length === 0) {
      out.push({ dayLabel: DAYS[i], coach: null, sessionLabel: "Training" });
      continue;
    }
    const coach = coaches[i % coaches.length];
    const labels = SESSION_BY_CATEGORY[coach.category] ?? ["Training"];
    const sessionLabel = labels[Math.floor(i / coaches.length) % labels.length];
    out.push({ dayLabel: DAYS[i], coach, sessionLabel });
  }
  return out;
}
