import { INDEX_CONFIG } from "@/lib/index-config";

export type ExerciseCategory = "Strength" | "Power" | "Mobility" | "Other";

export const CATEGORY_ORDER: ExerciseCategory[] = [
  "Strength",
  "Power",
  "Mobility",
  "Other",
];

const STRENGTH_NAMES = new Set(INDEX_CONFIG.strength.lifts.map((n) => n.toLowerCase()));
const POWER_NAMES = new Set(INDEX_CONFIG.power.lifts.map((n) => n.toLowerCase()));

// Pattern checked in order: power wins over strength when both match
// (e.g. "Snatch Deadlift" → Power, not Strength)
const POWER_PATTERNS = [
  /snatch/i,
  /clean/i,
  /jerk/i,
  /\bjump/i,
  /sprint/i,
  /plyo/i,
  /\bhang\b/i,
  /high pull/i,
  /^(power|muscle|block|hang) /i,
];

const STRENGTH_PATTERNS = [
  /squat/i,
  /bench/i,
  /deadlift/i,
  /\bpress\b/i,
  /pull-?up/i,
  /chin-?up/i,
  /\brow\b/i,
  /\bshrug/i,
  /\bdip\b/i,
  /landmine/i,
  /\bcurl\b/i,
  /\bOHP\b/i,
  /\bthrust\b/i,
  /\bGHR\b/i,
];

const MOBILITY_PATTERNS = [
  /stretch/i,
  /mobility/i,
  /\bPAIL/,
  /\bRAIL/,
  /\bCARS\b/i,
  /\bIR\b/,
  /\bER\b/,
  /split/i,
  /pancake/i,
  /pigeon/i,
  /hip\s*(opener|hinge|capsule)/i,
  /kick/i,
  /90\/90/,
];

export function categorizeExercise(name: string): ExerciseCategory {
  const lower = name.toLowerCase();
  if (POWER_NAMES.has(lower)) return "Power";
  if (STRENGTH_NAMES.has(lower)) return "Strength";
  if (POWER_PATTERNS.some((p) => p.test(name))) return "Power";
  if (MOBILITY_PATTERNS.some((p) => p.test(name))) return "Mobility";
  if (STRENGTH_PATTERNS.some((p) => p.test(name))) return "Strength";
  return "Other";
}

// ----- Strength sub-categorization (Upper / Lower) ---------------------------
// Used by Performance tabs to split the Strength category. Lower checked first
// because patterns like /leg/ are more specific than /press/ ("leg press" must
// land Lower, not Upper).

const LOWER_PATTERNS = [
  /squat/i,
  /deadlift/i,
  /\blunge/i,
  /\bleg\b/i,
  /\bglute/i,
  /\bcalf/i,
  /\bhamstring/i,
  /\bhip\b.*(thrust|bridge|hinge|flexor|abduct|adduct)/i,
  /\bhip thrust/i,
  /\bquad/i,
  /\bRDL\b/i,
  /\bGHR\b/i,
  /split squat/i,
  /step-?up/i,
  /tibialis/i,
  /copenhagen/i,
  /\bTKE\b/i,
  /nordic/i,
  /adductor/i,
  /abductor/i,
  /belt squat/i,
];

const UPPER_PATTERNS = [
  /bench/i,
  /\bpress\b/i,
  /pull-?up/i,
  /chin-?up/i,
  /\brow\b/i,
  /\bdip/i,
  /\bcurl\b/i,
  /\bshrug/i,
  /\braise/i,
  /pulldown/i,
  /\bfly/i,
  /landmine/i,
  /face pull/i,
  /\bOHP\b/i,
  /\bOH\b/i,
  /\bDB\b.*(press|row|fly|curl|raise)/i,
];

export type StrengthSubcat = "Upper" | "Lower";

export function subcategorizeStrength(name: string): StrengthSubcat | null {
  if (categorizeExercise(name) !== "Strength") return null;
  if (LOWER_PATTERNS.some((p) => p.test(name))) return "Lower";
  if (UPPER_PATTERNS.some((p) => p.test(name))) return "Upper";
  return null;
}
