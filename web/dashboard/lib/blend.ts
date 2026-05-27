/**
 * Mock blend generator — given selected coaches + days/wk, assign each
 * training day to a coach + session type. This is the preview shown on the
 * Review step BEFORE real synthesis.
 *
 * v1 is deterministic and rule-based. v2 will use the AI synthesis output.
 *
 * v1.1 (A24-311) — vary session labels by coach + avoid back-to-back same
 * coach when there are ≥3 coaches selected.
 */
import type { Coach, CoachCategory } from "@/lib/coaches";

export type BlendDay = {
  dayLabel: string;
  coach: Coach | null;
  sessionLabel: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Per-category session label palette. Ordered so that round-robin assignment
// across a coach's training days produces a coherent split (heavy → light,
// upper → lower, etc.) instead of repeating the same label.
const SESSION_PALETTE: Record<CoachCategory, string[]> = {
  strength: [
    "Heavy lower",
    "Heavy upper",
    "Volume lower",
    "Volume upper",
    "Arms + accessories",
  ],
  athletic: [
    "Lower power",
    "Plyo + sprint",
    "Olympic + explosive",
    "Light lower",
    "Movement skill",
  ],
  aesthetic: [
    "Chest + tri",
    "Back + bi",
    "Legs",
    "Shoulders + core",
    "Arms pump",
  ],
  hybrid: [
    "Strength lower",
    "Engine + Z2",
    "Strength upper",
    "Tempo + intervals",
    "Long capacity",
  ],
};

/**
 * Distribute training days across coaches so no coach takes back-to-back days
 * when there are ≥3 coaches available. Returns a parallel array of coach
 * indexes — null entries are rest days.
 */
function distributeCoaches(coachCount: number, trainingCount: number): (number | null)[] {
  const out: (number | null)[] = [];
  if (coachCount === 0) {
    for (let i = 0; i < 7; i++) out.push(null);
    return out;
  }
  // Build a slotted training pattern that interleaves coaches.
  // For 3+ coaches, step by floor(N/2)+1 to spread them out.
  const step = coachCount >= 3 ? Math.max(1, Math.floor(coachCount / 2)) + 1 : 1;
  let cursor = 0;
  let trainingFilled = 0;
  for (let i = 0; i < 7; i++) {
    if (trainingFilled >= trainingCount) {
      out.push(null);
      continue;
    }
    out.push(cursor % coachCount);
    cursor += step;
    trainingFilled++;
  }
  return out;
}

export function generateBlend(coaches: Coach[], daysPerWeek: number): BlendDay[] {
  const trainingCount = Math.max(0, Math.min(7, daysPerWeek));
  const out: BlendDay[] = [];
  const assignment = distributeCoaches(coaches.length, trainingCount);

  // Track how many sessions each coach has been assigned so the per-coach
  // session-label cursor advances independently and avoids repeats.
  const perCoachCount: number[] = new Array(coaches.length).fill(0);

  for (let i = 0; i < 7; i++) {
    const coachIdx = assignment[i];
    if (coachIdx == null) {
      out.push({
        dayLabel: DAYS[i],
        coach: null,
        sessionLabel: i === 6 ? "Rest" : i >= trainingCount ? (i === trainingCount ? "Active recovery" : "Rest") : "Training",
      });
      continue;
    }
    const coach = coaches[coachIdx];
    const palette = SESSION_PALETTE[coach.category] ?? ["Training"];
    const sessionLabel = palette[perCoachCount[coachIdx] % palette.length];
    perCoachCount[coachIdx]++;
    out.push({ dayLabel: DAYS[i], coach, sessionLabel });
  }
  return out;
}
