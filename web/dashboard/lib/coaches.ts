/**
 * Coach roster — real coaches whose programs Train can synthesize from.
 *
 * Every entry here MUST have a matching ingested style guide under
 * `docs/content/training-styles/<id>/guide.md`. Adding a coach without an
 * ingested guide is a bug — synthesis will fall back to a generic template.
 *
 * Source of truth: each coach's `guide.md`. The fields below are derived
 * from §1 (when to use) and §2 (mechanism) of that document. Free text
 * fields (tagline, headshot URL) are hand-curated.
 */

export type CoachCategory = "strength" | "athletic" | "aesthetic" | "hybrid";

export const CATEGORIES: Record<CoachCategory, { label: string; accent: string }> = {
  strength:  { label: "Strength & Hypertrophy", accent: "#7c8cff" },
  athletic:  { label: "Athletic Performance",   accent: "#f0a868" },
  aesthetic: { label: "Aesthetic & Physique",   accent: "#e878b5" },
  hybrid:    { label: "Hybrid & Longevity",     accent: "#5ec99c" },
};

export type Coach = {
  id: string;
  name: string;
  handle: string;
  /** URL or path to coach headshot. Falls back to colored initials when null. */
  headshot: string | null;
  category: CoachCategory;
  /** 1-line bio embedded next to handle in hero. e.g. "10-year NFL veteran" */
  credentials: string;
  /** Big visceral tagline — page H1 in the coach's voice. */
  tagline: string;
  /**
   * 3-sentence narrative paragraph: style intro → programming approach → who it's for.
   * Spec: docs/design/coach-profile.md §3.2
   */
  overview: string;
  stats: { followers: string };
  tags: {
    goals: string[];
    levels: string[];
    equipment: string[];
    daysPerWeek: string;
    sessionLength: string;
  };
  philosophy: string;
  bestFor: string[];
  notFor: string[];
  pairsWith: string[];
};

export const COACHES: Coach[] = [
  // ─── ATHLETIC ─────────────────────────────────────────────────────────────
  // Catalyst Athletics — derived from docs/content/training-styles/catalyst-athletics/guide.md
  // Headshot + handle + follower count pulled from youtube.com/@CatalystAthletics (2026-06-06)
  {
    id: "catalyst-athletics",
    name: "Catalyst Athletics",
    handle: "@CatalystAthletics",
    headshot: "/coaches/catalyst-athletics.jpg",
    category: "athletic",
    credentials: "Greg Everett · 25+ years coaching Olympic-level weightlifters",
    tagline: "The competition lifts are the program.",
    overview:
      "Catalyst Athletics is Greg Everett's Olympic weightlifting system, built around the snatch and clean & jerk as the primary training tools — with squats, pulls, and pressing as support. The programs scale by skill level: beginners learn the competition lifts with coach-prescribed loads and lots of technique work; advanced athletes layer in higher volume, more variations, and percentage-based loading. Built for athletes pursuing competitive Olympic weightlifting performance, or athletes who need transferable triple-extension power for sport.",
    stats: { followers: "153K" },
    tags: {
      goals: ["olympic lifting", "power", "vertical jump"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell", "bumper plates", "platform", "squat rack"],
      daysPerWeek: "3–6",
      sessionLength: "60–120 min",
    },
    philosophy:
      "The snatch and clean & jerk are unique because the competition lifts themselves are the most effective training exercises for the qualities they require — a degree of specificity not possible in other strength sports. Programming arranges progressive overload of these specific lifts and their close variations while balancing fitness, fatigue, and supercompensation against the body's recovery capacity. Strength is one quality among four — absolute strength, speed-strength, explosive-strength, strength endurance — and at advanced levels they no longer correlate. The Explosive Strength Deficit must be trained directly.",
    bestFor: [
      "Competitive Olympic weightlifting (snatch + clean & jerk maxima)",
      "Athletes who need transferable triple-extension power for sport prep",
      "Restoration of speed-strength in athletes whose absolute strength has saturated",
    ],
    notFor: [
      "Athletes who can't achieve safe overhead + front-rack positions and won't invest in mobility",
      "Active shoulder/wrist/back/knee injury that prevents catch positions",
      "Pure absolute-strength or pure hypertrophy goals with no need for power expression",
    ],
    pairsWith: ["dylan-shannon"],
  },

  // ─── HYBRID ───────────────────────────────────────────────────────────────
  // Dylan Shannon (POWERJACKED) — derived from docs/content/training-styles/dylan-shannon/guide.md
  // Headshot + handle + follower count pulled from youtube.com/@dylan_shannon (2026-06-06)
  {
    id: "dylan-shannon",
    name: "Dylan Shannon",
    handle: "@dylan_shannon",
    headshot: "/coaches/dylan-shannon.jpg",
    category: "hybrid",
    credentials: "Performance + physique hybrid coach · POWERJACKED",
    tagline: "Look like a bodybuilder, perform like an athlete.",
    overview:
      "POWERJACKED is Dylan Shannon's 6-day hybrid system that builds an explosive lower body and a jacked upper body in parallel. Each week stacks sprints, jumps, Olympic lifts, and heavy compounds when the nervous system is fresh, then layers high-volume bodybuilding accessories over the top of every session. Built for field-sport athletes and intermediate-to-advanced lifters who want size and speed at the same time.",
    stats: { followers: "78.6K" },
    tags: {
      goals: ["power", "hypertrophy", "vertical jump", "speed"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym", "sprint surface", "plyo boxes"],
      daysPerWeek: "6",
      sessionLength: "75–90 min",
    },
    philosophy:
      "Two adaptation streams running in parallel: explosive force production from low-volume sprint + plyo + Olympic + heavy compound work when the nervous system is fresh, then structural hypertrophy from moderate-load high-rep accessory work that follows the strength piece in the same session. The sequence matters — velocity work first preserves quality; bodybuilding work at the back end runs on residual fatigue without degrading the high-CNS adaptation. Four lower-body pillars (sprint, jump, move weight violently, squat + hinge heavy) must each hit weekly.",
    bestFor: [
      "Athletes who want to be faster, more explosive, and visibly muscular at the same time",
      "Field-sport athletes (rugby, football, lacrosse, basketball) needing speed + power + size",
      "Trainees plateaued on pure bodybuilding splits who want power expression back",
    ],
    notFor: [
      "Athletes who can't recover from 6 sessions/week",
      "Active lower-body tendinopathy or post-surgical phase < 12 weeks",
      "True novices (< 1 year training, no Olympic lift experience)",
    ],
    pairsWith: ["catalyst-athletics"],
  },
];

const COACH_ID_SET = new Set(COACHES.map((c) => c.id));
for (const c of COACHES) {
  for (const pid of c.pairsWith) {
    if (!COACH_ID_SET.has(pid)) {
      console.warn(
        `[coaches] unknown coach ID in pairsWith: "${pid}" referenced by "${c.id}"`
      );
    }
  }
}

export function getCoach(id: string): Coach | undefined {
  return COACHES.find((c) => c.id === id);
}

export function initials(name: string): string {
  return name
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function allGoals(): string[] {
  return [...new Set(COACHES.flatMap((c) => c.tags.goals))].sort();
}

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
