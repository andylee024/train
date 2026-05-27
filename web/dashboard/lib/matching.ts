/**
 * Goal → coach matching. Score a coach by how many of the athlete's goals
 * its tags cover. Top-N scored coaches become "Recommended for you."
 */
import type { Coach } from "@/lib/coaches";
import type { GoalKey } from "@/lib/use-intake";

// Map our intake goal chips to the coach `tags.goals` vocabulary.
// One intake goal can map to multiple coach tags (loose match).
export const GOAL_TO_COACH_TAGS: Record<GoalKey, string[]> = {
  "stronger":       ["strength", "powerlifting"],
  "build-muscle":   ["hypertrophy", "aesthetics"],
  "jump-higher":    ["vertical jump", "power"],
  "run-faster":     ["speed", "endurance", "sport performance"],
  "look-ripped":    ["aesthetics", "hypertrophy"],
  "more-flexible":  ["mobility", "function"],
  "hybrid":         ["hybrid", "conditioning", "general fitness"],
  "longevity":      ["longevity", "mobility", "general fitness"],
  "sport-prep":     ["sport performance", "basketball", "speed", "vertical jump"],
};

export const GOAL_LABEL: Record<GoalKey, string> = {
  "stronger":       "Get stronger",
  "build-muscle":   "Build muscle",
  "jump-higher":    "Jump higher / dunk",
  "run-faster":     "Run faster",
  "look-ripped":    "Look ripped",
  "more-flexible":  "Get more flexible",
  "hybrid":         "Hybrid athlete",
  "longevity":      "Longevity",
  "sport-prep":     "Sport prep",
};

export function scoreCoach(coach: Coach, goals: GoalKey[]): number {
  if (goals.length === 0) return 0;
  const wantedTags = new Set<string>();
  for (const g of goals) {
    for (const tag of GOAL_TO_COACH_TAGS[g] ?? []) wantedTags.add(tag);
  }
  let score = 0;
  for (const tag of coach.tags.goals) {
    if (wantedTags.has(tag)) score++;
  }
  return score;
}

export function rankCoaches(coaches: Coach[], goals: GoalKey[]): Coach[] {
  if (goals.length === 0) return coaches;
  return [...coaches].sort((a, b) => scoreCoach(b, goals) - scoreCoach(a, goals));
}

export function topMatches(coaches: Coach[], goals: GoalKey[], n = 3): Coach[] {
  if (goals.length === 0) return [];
  return [...coaches]
    .map((c) => ({ c, s: scoreCoach(c, goals) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.c);
}

export function matchingGoals(coach: Coach, goals: GoalKey[]): GoalKey[] {
  if (goals.length === 0) return [];
  const coachTags = new Set(coach.tags.goals);
  return goals.filter((g) =>
    (GOAL_TO_COACH_TAGS[g] ?? []).some((tag) => coachTags.has(tag))
  );
}
