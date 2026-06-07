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

export type SocialPlatform = "youtube" | "instagram" | "tiktok";
export type SocialLink = {
  platform: SocialPlatform;
  url: string;
  /** Display @ handle (without the @). Falls back to URL slug if absent. */
  handle?: string;
  /** "153K" / "1.2M" — optional. Display next to icon when present. */
  followers?: string;
};

/**
 * One phase of the coach's arc. Universal shape — every coach fills 4 entries
 * from their guide.md §6 (Periodization) / §7 (Sample programs).
 */
export type ArcPhase = {
  name: string;          // "Block 1" · "Foundation" · "Skill"
  weeks: string;         // "W1-4" · "W5-12"
  focus: string;         // 1-3 words: "Skill" · "Volume"
  description: string;   // one-line for the row
};

export type FAQ = {
  q: string;
  a: string;
};

/**
 * Trust metrics for the "How this guide was built" section. Flexible to
 * support both auto-ingested coaches (videos analyzed, citations) and
 * hand-curated guides (articles, manual references).
 */
export type Sources = {
  origin: "auto-ingested" | "hand-curated";
  videosAnalyzed?: number;
  channelTotal?: number;
  texts?: { title: string; pages?: number }[];
  articles?: { title: string }[];
  citedClaims?: number;
  /** Display string like "June 2026". */
  lastRefreshed: string;
};

export const CATEGORIES: Record<CoachCategory, { label: string; accent: string }> = {
  strength:  { label: "Strength & Hypertrophy", accent: "#7c8cff" },
  athletic:  { label: "Athletic Performance",   accent: "#f0a868" },
  aesthetic: { label: "Aesthetic & Physique",   accent: "#e878b5" },
  hybrid:    { label: "Hybrid Performance",     accent: "#5ec99c" },
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
  /**
   * Social presence — icons render in hero, link to profiles, show follower
   * count where known. Order matters: first entry's followers display next to
   * the handle in the hero strip.
   */
  socials: SocialLink[];
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
  /** 4-phase arc timeline. See docs/design/coach-profile.md. */
  arcPhases: ArcPhase[];
  /** 3-5 FAQs in the coach's voice. Mix universal + coach-specific. */
  faqs: FAQ[];
  /** Trust metrics — what the guide was built from. */
  sources: Sources;
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
    socials: [
      { platform: "youtube", url: "https://www.youtube.com/@CatalystAthletics", handle: "CatalystAthletics", followers: "153K" },
      { platform: "instagram", url: "https://www.instagram.com/catalystathletics/", handle: "catalystathletics" },
    ],
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
    arcPhases: [
      { name: "Block 1", weeks: "W1-4", focus: "Skill",      description: "Snatch + C&J technique under coach-prescribed loads — no percentage work yet." },
      { name: "Block 2", weeks: "W5-10", focus: "Volume",    description: "Build sets + reps on the competition lifts; technique holds under fatigue." },
      { name: "Block 3", weeks: "W11-16", focus: "Comp prep", description: "Heavy % work, max-effort singles, competition-style attempts on the platform." },
      { name: "Test",    weeks: "W17-18", focus: "Maxes",    description: "Snatch + Clean & Jerk 1RM windows. Compare to baseline; recalibrate next arc." },
    ],
    faqs: [
      { q: "What if I've never snatched before?", a: "Skill Level 0 protocol — 12 weeks learning the lifts from scratch, no percentage work. You start where you are; technique gates everything else." },
      { q: "How much will my squat go up in 18 weeks?", a: "Beginners typically see 30-60 lb on back squat across a full arc. Intermediate gains slow but technique sharpens and snatch ratios climb." },
      { q: "What if I miss a session?", a: "Resume where you left off. The block timeline flexes — shift the test window by the same number of days, don't double up." },
      { q: "Do I need an in-person coach?", a: "Programs are designed for self-coaching with video review. Use the cue checklists in §10 of the guide and film every working set." },
      { q: "Can I add cardio?", a: "Light GPP (sprints, jumps, cross-country) is built in. Avoid heavy distance running during volume blocks — it competes for recovery." },
    ],
    sources: {
      origin: "auto-ingested",
      videosAnalyzed: 15,
      channelTotal: 1873,
      texts: [{ title: "Olympic Weightlifting: A Complete Guide for Athletes & Coaches", pages: 1267 }],
      citedClaims: 176,
      lastRefreshed: "June 2026",
    },
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
    socials: [
      { platform: "youtube", url: "https://www.youtube.com/@dylan_shannon", handle: "dylan_shannon", followers: "78.6K" },
      { platform: "instagram", url: "https://www.instagram.com/dylan_shannon/", handle: "dylan_shannon" },
    ],
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
    arcPhases: [
      { name: "Foundation", weeks: "W1-4",  focus: "Baseline",     description: "Establish the 6-day rhythm. Baseline every test (squat 1RM, vert, 20yd sprint, power clean)." },
      { name: "Power Block", weeks: "W5-9", focus: "Heavy + fast", description: "Olympic lifts heavy, sprints maximal, plyos progressive. CNS work first every session." },
      { name: "Density",    weeks: "W10-14", focus: "Volume + clocks", description: "14-min squat clocks at 80%, EMOM deadlifts, barbell jumps at 30-35%. Strength + hypertrophy fused." },
      { name: "Test",       weeks: "W15-18", focus: "Maxes + retests", description: "1RM back squat, clean, bench. Re-test vertical, broad jump, 20yd sprint. Compare to baseline." },
    ],
    faqs: [
      { q: "What if I can't recover from 6 sessions/week?", a: "Use the 4-day variant — sprints day + 2 lifting days + 1 conditioning. Skip density blocks until your recovery improves." },
      { q: "Do I need to do all 4 lower-body pillars every week?", a: "Yes. Sprint + jump + move-weight-violently + squat/hinge-heavy. Drop one and it's not POWERJACKED — it's another style." },
      { q: "What if I miss a session?", a: "Don't double up. Resume the next day; reorder the week if needed — lifting sequence matters more than calendar day." },
      { q: "How much will my squat go up in 18 weeks?", a: "Intermediate lifters typically see 25-50 lb on back squat per 12-week block, plus visible jump + sprint improvement." },
      { q: "Can I add steady-state cardio?", a: "Sprint days ARE your cardio. Z2 conversational pace on rest days is fine; avoid long runs that interfere with explosive output." },
    ],
    sources: {
      origin: "hand-curated",
      articles: [
        { title: "7 Things to Build Powerful Legs" },
        { title: "Sample 6-day training sessions" },
        { title: "POWERJACKED weekly template" },
      ],
      lastRefreshed: "June 2026",
    },
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
