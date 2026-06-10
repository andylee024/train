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
    pairsWith: ["dylan-shannon", "israetel"],
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
    pairsWith: ["catalyst-athletics", "nippard"],
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

  // ─── STRENGTH / HYPERTROPHY ───────────────────────────────────────────────
  // Jeff Nippard — derived from deep research on @JeffNippard YouTube channel.
  // Headshot + handle + follower count pulled from youtube.com/@JeffNippard (2026-06-09).
  {
    id: "nippard",
    name: "Jeff Nippard",
    handle: "@JeffNippard",
    headshot: "/coaches/nippard.jpg",
    category: "strength",
    credentials: "Natural pro bodybuilder · BSc Biochemistry, MSc Exercise Science (in progress)",
    tagline: "Every set should answer a literature question.",
    overview:
      "Science-based hypertrophy and strength programming from a natural pro bodybuilder with a biochem degree. Programming uses RIR-based progression, exercise selection ranked by EMG and stretch-mediated hypertrophy data, and volume calibrated between MEV and MRV. Built for intermediate-to-advanced lifters who want measurable muscle gain backed by the meta-analysis literature, with full-gym access and the patience to read the why.",
    socials: [
      { platform: "youtube", url: "https://www.youtube.com/@JeffNippard", handle: "JeffNippard", followers: "8.4M" },
      { platform: "instagram", url: "https://www.instagram.com/jeffnippard/", handle: "jeffnippard" },
    ],
    tags: {
      goals: ["hypertrophy", "strength", "aesthetics"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym"],
      daysPerWeek: "4–6",
      sessionLength: "60–90 min",
    },
    philosophy:
      "Every prescription is an answer to a literature question. What does the meta-analysis say about frequency? Which stretch position drives the most growth? Where does junk volume start? RIR-based progression governs intensity; exercise selection is ranked by EMG, stretch-mediated bias, and resistance-profile data. Volume sits between MEV and MRV per muscle, and weekly sets-per-muscle is the primary dial. Lengthened-position bias favored where the exercise allows it.",
    bestFor: [
      "Lifters chasing measured hypertrophy with full gym access",
      "People who want to read the why — citations, EMG data, stretch-mediated arguments",
      "Intermediate-to-advanced trainees who can train near failure and recover well",
    ],
    notFor: [
      "Sport-specific athletes who need power expression more than hypertrophy",
      "Beginners overwhelmed by exercise-selection detail (better off with simpler programs first)",
      "Trainees with <45 min per session — the volume doesn't compress that far",
    ],
    pairsWith: ["israetel", "dylan-shannon"],
    arcPhases: [
      { name: "Foundation",    weeks: "W1-3",   focus: "MEV → MAV",  description: "Start at minimum effective volume (MEV) per muscle. Calibrate technique and RIR perception before adding sets." },
      { name: "Accumulation",  weeks: "W4-9",   focus: "Add volume", description: "Climb from MAV toward MRV. Add 1–2 sets/muscle weekly until you hit a stall or recovery deficit. Lengthened-bias picks anchor each split." },
      { name: "Intensification", weeks: "W10-15", focus: "Lower RIR",  description: "Drop volume slightly, push every working set to RIR 0–1. Heaviest loads of the arc on the big six." },
      { name: "Deload + Test", weeks: "W16-18", focus: "Deload + 1RM", description: "Deload week 16. Test 1RM on bench / squat / DL in W17–18. Compare to baseline; reset MEV for next arc." },
    ],
    faqs: [
      { q: "Do I have to train to failure?", a: "Not on every set. The literature says 1–2 RIR is enough on most working sets; failure on the last set of an isolation lift is fine. Avoid failure on compound lifts in the accumulation phase — it taxes recovery without much marginal growth." },
      { q: "How do I know if I've hit junk volume?", a: "If your reps drop across sets faster than expected, your soreness lingers past 48h, or your weights stall for 2+ weeks at the same volume — you're past MRV. Drop a set per muscle and reassess." },
      { q: "Can I skip cardio?", a: "Yes for pure hypertrophy. If you add it, keep it Z2 (conversational pace) on rest days — high-intensity cardio competes for recovery with the lifting." },
      { q: "What if my gym only has DBs and a rack?", a: "The program runs. Substitute compounds with DB equivalents (DB bench, goblet squat, single-arm row). You lose some of the optimal exercise-selection picks but the volume framework is intact." },
      { q: "How much muscle should I expect in 18 weeks?", a: "Intermediate lifters typically see 2–4 lb of lean mass per 12-week block at a small surplus, with visible improvement in lagging body parts that get prioritized volume." },
    ],
    sources: {
      origin: "auto-ingested",
      videosAnalyzed: 12,
      channelTotal: 320,
      texts: [{ title: "The Ultimate Push Pull Legs System (program PDF)", pages: 96 }],
      citedClaims: 142,
      lastRefreshed: "June 2026",
    },
  },

  // Mike Israetel (Renaissance Periodization) — derived from deep research on
  // @RenaissancePeriodization YouTube channel + RP volume-landmarks framework.
  // Headshot is the RP brand logo; channel is 3.86M subs.
  {
    id: "israetel",
    name: "Mike Israetel",
    handle: "@RenaissancePeriodization",
    headshot: "/coaches/israetel.jpg",
    category: "strength",
    credentials: "PhD Sport Physiology · Co-founder, Renaissance Periodization",
    tagline: "Volume landmarks, mesocycles, deloads — repeat.",
    overview:
      "Renaissance Periodization codified the volume landmarks (MV / MEV / MAV / MRV) that every modern hypertrophy programmer references. The system runs 4–6 week mesocycles: weekly volume climbs from MEV toward MRV, then a deload week resets fatigue before the next cycle begins. Effort is non-negotiable — most working sets sit at 0–2 RIR by the end of the cycle. Built for lifters who want a repeatable system, not vibes.",
    socials: [
      { platform: "youtube", url: "https://www.youtube.com/@RenaissancePeriodization", handle: "RenaissancePeriodization", followers: "3.86M" },
      { platform: "instagram", url: "https://www.instagram.com/drmikeisraetel/", handle: "drmikeisraetel" },
    ],
    tags: {
      goals: ["hypertrophy", "strength"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym"],
      daysPerWeek: "4–6",
      sessionLength: "60–90 min",
    },
    philosophy:
      "Programming is a problem of stimulus-to-fatigue ratio. Every exercise gets evaluated by how much growth it causes vs how much recovery it taxes. Mesocycles climb from MEV toward MRV across 4–6 weeks; deloads dump fatigue without losing fitness. Effort matters — most working sets within 0–2 RIR by week's end. Junk volume (sets that don't hit the proximity-to-failure threshold) is real and worth cutting. Variation between mesocycles keeps stimulus fresh without losing specificity.",
    bestFor: [
      "Lifters who want a system, not vibes — clear volume math per muscle group",
      "People who recover well between sessions and can train near failure",
      "Anyone who likes built-in deload weeks instead of crashing into burnout",
    ],
    notFor: [
      "Athletes who can't train near failure often (sport in-season, injury return)",
      "Beginners with form issues — high-RIR work first, RP later",
      "Trainees with limited recovery bandwidth (high life stress, poor sleep, large training history)",
    ],
    pairsWith: ["nippard", "catalyst-athletics"],
    arcPhases: [
      { name: "Meso 1",  weeks: "W1-5",   focus: "MEV → MRV",  description: "5-week mesocycle. Start at MEV per muscle, add a set/muscle every week, end at MRV in W4. Deload W5." },
      { name: "Meso 2",  weeks: "W6-10",  focus: "Variation",  description: "Swap variations on the big lifts (incline vs flat, sumo vs conv DL). Volume math repeats; stimulus stays fresh." },
      { name: "Meso 3",  weeks: "W11-15", focus: "Specialization", description: "Pick 1–2 lagging body parts; pull from other muscles' volume to redirect. Same MEV → MRV climb on the specialized targets." },
      { name: "Test",    weeks: "W16-18", focus: "Test + reset", description: "Test 1RMs / e1RMs. Reset MEV based on the new baseline. Document which mesocycle structure produced the best growth for next arc." },
    ],
    faqs: [
      { q: "What's a mesocycle?", a: "A 4–6 week block where weekly volume per muscle climbs from MEV to MRV, ending in a deload week. The basic unit of RP programming — you'll run 3–4 of them per arc." },
      { q: "How do I find my MEV?", a: "Start with the published per-muscle minimums (e.g. 8–10 sets/week for chest). If you're growing and not stalled, that's roughly your MEV. If not, add 2 sets and observe for 2 weeks." },
      { q: "Do I have to deload every 4–6 weeks?", a: "Yes if you want the system to keep working. Skipping deloads accumulates fatigue that masks future growth and increases injury risk. The deload is a feature, not a chore." },
      { q: "What if I can't train to failure due to a joint issue?", a: "Stay at 3–4 RIR on compound lifts that aggravate the joint; isolation lifts can still go to failure. Reduce volume by 1 set/muscle to compensate for the lower effort." },
      { q: "Can I run RP while cutting?", a: "Yes — drop to MEV during the cut, run a 2-meso cut cycle, and accept that growth stalls or reverses slightly. Bring volume back up when returning to maintenance or surplus." },
    ],
    sources: {
      origin: "auto-ingested",
      videosAnalyzed: 10,
      channelTotal: 1200,
      texts: [{ title: "The Renaissance Diet 2.0", pages: 412 }, { title: "Scientific Principles of Hypertrophy Training", pages: 256 }],
      citedClaims: 108,
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
