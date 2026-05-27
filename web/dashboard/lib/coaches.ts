/**
 * Coach roster — recognizable training programs / coaches the athlete shops
 * from when designing a new arc.
 *
 * Ported from `prototypes/marketplace/data.js` on the ff-onboarding branch.
 * v1: 12 coaches across 4 categories. Future: parse from a CMS or load from
 * Supabase as more coaches are onboarded.
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
  category: CoachCategory;
  tagline: string;
  stats: { followers: string; programs: number; rating: number };
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
  // ─── STRENGTH ─────────────────────────────────────────────────────────────
  {
    id: "jeff-nippard",
    name: "Jeff Nippard",
    handle: "@jeffnippard",
    category: "strength",
    tagline: "Science-based hypertrophy from a natty bodybuilder with a biochem degree.",
    stats: { followers: "4.6M", programs: 12, rating: 4.9 },
    tags: {
      goals: ["hypertrophy", "strength"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym"],
      daysPerWeek: "4–6",
      sessionLength: "60–90 min",
    },
    philosophy:
      "Every prescription is an answer to a literature question — what does the meta-analysis say about frequency, what stretch position drives the most growth, where does junk volume start? RIR-based progression, exercise selection ranked by EMG and stretch-mediated hypertrophy data, volume between MEV and MRV.",
    bestFor: ["Lifters chasing measured hypertrophy", "People who want to read the why", "Intermediate-to-advanced trainees with full gym access"],
    notFor:  ["Sport-specific athletes", "Beginners overwhelmed by detail", "30-min-session folks"],
    pairsWith: ["mike-israetel", "cbum"],
  },
  {
    id: "mike-israetel",
    name: "Dr. Mike Israetel",
    handle: "@drmikeisraetel",
    category: "strength",
    tagline: "PhD-backed hypertrophy programming with gym-bro energy.",
    stats: { followers: "3.1M", programs: 18, rating: 4.8 },
    tags: {
      goals: ["hypertrophy"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym"],
      daysPerWeek: "4–6",
      sessionLength: "60–90 min",
    },
    philosophy:
      "Renaissance Periodization codified the volume landmarks every modern lifter quotes. 4–6 week mesocycles of progressive volume from MEV toward MRV, then deload, then repeat. Effort is everything — most sets within 0–2 RIR by week's end.",
    bestFor: ["Lifters who want a system, not vibes", "People recovering well between sessions", "Anyone who likes deload weeks built in"],
    notFor:  ["Athletes who can't train to failure often", "Beginners with form issues", "Anyone with limited recovery bandwidth"],
    pairsWith: ["jeff-nippard", "ryan-humiston"],
  },
  {
    id: "athlean-x",
    name: "Athlean-X",
    handle: "@athleanx",
    category: "strength",
    tagline: "Function-first training from the former Mets PT — physique as a side effect of moving well.",
    stats: { followers: "14.2M", programs: 9, rating: 4.7 },
    tags: {
      goals: ["strength", "function", "general fitness"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["full gym", "minimal"],
      daysPerWeek: "3–5",
      sessionLength: "45–75 min",
    },
    philosophy:
      "Jeff Cavaliere coached MLB players for a decade — that lens shapes every workout. Movement quality, joint integrity, and corrective work come before aesthetics. Programs blend traditional lifts with unilateral work, anti-rotation core, and 'face pulls before bench' injury prevention.",
    bestFor: ["Recreational athletes who don't want to break", "Folks recovering from minor injury", "Anyone with weekend pickup-game commitments"],
    notFor:  ["Lifters chasing absolute hypertrophy maxes", "Powerlifters cycling around competition", "People who skip warm-ups on principle"],
    pairsWith: ["peter-attia", "cam-davidson"],
  },

  // ─── ATHLETIC ─────────────────────────────────────────────────────────────
  {
    id: "p3",
    name: "P3 Athletes",
    handle: "@p3athletes",
    category: "athletic",
    tagline: "Force-plate diagnostics + biomechanical assessments — the program that builds NBA athletes.",
    stats: { followers: "420K", programs: 6, rating: 4.9 },
    tags: {
      goals: ["vertical jump", "speed", "sport performance"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym", "plyo box"],
      daysPerWeek: "3–5",
      sessionLength: "60–90 min",
    },
    philosophy:
      "Marcus Elliott built P3 around the idea that elite athletes are individuals — generic plans waste their gifts and amplify their flaws. Every program starts with a movement assessment to identify the limiting system: ankle stiffness, hip extension, eccentric absorption, force production rate.",
    bestFor: ["Court/field athletes prioritizing performance", "Anyone training to dunk or sprint faster", "Athletes with access to plyo equipment"],
    notFor:  ["Pure hypertrophy seekers", "Beginners without movement foundation", "People who can't measure progress objectively"],
    pairsWith: ["cam-davidson", "hooper-training"],
  },
  {
    id: "hooper-training",
    name: "Hooper Training",
    handle: "@hoopertraining",
    category: "athletic",
    tagline: "Basketball-specific performance — court speed, change of direction, finishing strength.",
    stats: { followers: "780K", programs: 8, rating: 4.7 },
    tags: {
      goals: ["vertical jump", "speed", "basketball"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["full gym", "court access"],
      daysPerWeek: "4–6",
      sessionLength: "45–75 min",
    },
    philosophy:
      "Built by former D1 strength coaches for the basketball player who wants to show up on the court next month measurably better. Programming integrates court drills with weight room work — if you're training the lift, you're training the move it serves. Every block tracks vertical, lane agility, and 3/4-court sprint as KPIs.",
    bestFor: ["Basketball players of any level", "Athletes who play 1+ pickup games per week", "People who want measurable on-court gains"],
    notFor:  ["Pure aesthetic-driven trainees", "Powerlifters in competition prep", "Athletes in non-jumping sports"],
    pairsWith: ["p3", "cam-davidson"],
  },
  {
    id: "cam-davidson",
    name: "Cam Davidson",
    handle: "@camdavidson",
    category: "athletic",
    tagline: "Olympic lifting + jumping mechanics — explosive power for the court and field.",
    stats: { followers: "320K", programs: 5, rating: 4.8 },
    tags: {
      goals: ["vertical jump", "power", "olympic lifting"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym", "lifting platform"],
      daysPerWeek: "4–5",
      sessionLength: "75–90 min",
    },
    philosophy:
      "Power is a skill. Cam's programming uses Olympic lifts and their derivatives as the engine — not because they build the most muscle, but because they teach the nervous system to recruit fast-twitch fibers under coordinated load. Pair the cleans and snatches with intent-driven plyometrics.",
    bestFor: ["Athletes already squatting 1.5×+ bodyweight", "Olympic lifting enthusiasts", "Anyone with platform access and time to learn technique"],
    notFor:  ["Beginners without coaching access", "People with shoulder/wrist mobility limits", "Trainees on minimal equipment"],
    pairsWith: ["p3", "mat-fraser"],
  },

  // ─── AESTHETIC ────────────────────────────────────────────────────────────
  {
    id: "cbum",
    name: "Chris Bumstead",
    handle: "@cbum",
    category: "aesthetic",
    tagline: "Five-time Mr. Olympia Classic Physique — V-taper, structure, Golden Era.",
    stats: { followers: "12.4M", programs: 7, rating: 4.9 },
    tags: {
      goals: ["hypertrophy", "aesthetics"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym"],
      daysPerWeek: "5–6",
      sessionLength: "75–105 min",
    },
    philosophy:
      "Classic physique is about proportion — wide shoulders, narrow waist, full chest, sweeping quads. High-frequency, moderate-volume training of the showcase muscles, controlled eccentrics, and a brutal mind-muscle connection. The aesthetic is the metric.",
    bestFor: ["Lifters chasing a specific look", "People with 5+ training days per week", "Anyone who likes long sessions"],
    notFor:  ["Athletes prioritizing performance over looks", "Time-constrained trainees", "People who can't train past failure regularly"],
    pairsWith: ["jeff-nippard", "sam-sulek"],
  },
  {
    id: "sam-sulek",
    name: "Sam Sulek",
    handle: "@sam_sulek",
    category: "aesthetic",
    tagline: "High-frequency, intuitive bro split — train the muscle, not the program.",
    stats: { followers: "6.8M", programs: 3, rating: 4.6 },
    tags: {
      goals: ["hypertrophy", "aesthetics"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym"],
      daysPerWeek: "6",
      sessionLength: "60–90 min",
    },
    philosophy:
      "Hit each muscle hard, hit it often, eat a lot, sleep more. Bro split structured but intuitive in execution — working sets taken to or past failure, exercise selection rotates by feel, recovery is solved with food and sleep rather than deloads.",
    bestFor: ["Younger lifters with high recovery capacity", "People who like 6-day-a-week routines", "Anyone who eats in a heavy surplus"],
    notFor:  ["Lifters with limited recovery", "People over 40", "Anyone with joint issues from high-volume failure work"],
    pairsWith: ["cbum", "ryan-humiston"],
  },
  {
    id: "ryan-humiston",
    name: "Ryan Humiston",
    handle: "@ryanhumiston",
    category: "aesthetic",
    tagline: "Funny, fast, brutal — bodybuilding that finishes in 45 minutes and leaves you wrecked.",
    stats: { followers: "2.4M", programs: 11, rating: 4.7 },
    tags: {
      goals: ["hypertrophy", "aesthetics", "general fitness"],
      levels: ["beginner", "intermediate"],
      equipment: ["full gym", "minimal"],
      daysPerWeek: "4–6",
      sessionLength: "40–55 min",
    },
    philosophy:
      "You don't need 90-minute marathons to grow. 45-minute high-stimulus workouts by stacking supersets, drop sets, and short-rest intervals. Unconventional exercise variations drive new growth in muscles that have stagnated on the basics.",
    bestFor: ["Time-constrained trainees", "People who hate long sessions", "Lifters needing exercise variety"],
    notFor:  ["Powerlifters needing long rest periods", "People who only want compound lifts", "Trainees who hate supersets"],
    pairsWith: ["mike-israetel", "sam-sulek"],
  },

  // ─── HYBRID ───────────────────────────────────────────────────────────────
  {
    id: "mat-fraser",
    name: "Mat Fraser",
    handle: "@mathewfras",
    category: "hybrid",
    tagline: "Five-time CrossFit Games champion — engine, strength, and skill in one framework.",
    stats: { followers: "2.7M", programs: 14, rating: 4.9 },
    tags: {
      goals: ["general fitness", "strength", "conditioning"],
      levels: ["intermediate", "advanced"],
      equipment: ["full gym", "rower", "barbell"],
      daysPerWeek: "5–6",
      sessionLength: "75–120 min",
    },
    philosophy:
      "The fittest human in history built his model around capacity across every domain — strength, gymnastics, monostructural. HWPO programming layers strict strength work in the morning with conditioning, skill, or capacity work later. Versatility is the goal.",
    bestFor: ["CrossFit athletes", "Hybrid trainees who want everything", "People with 90+ minutes per session, 5+ days"],
    notFor:  ["Pure aesthetic seekers", "Beginners without barbell competence", "Time-constrained recreational trainees"],
    pairsWith: ["cam-davidson", "nick-bare"],
  },
  {
    id: "nick-bare",
    name: "Nick Bare",
    handle: "@nickbarefitness",
    category: "hybrid",
    tagline: "Lift heavy, run far — hybrid athlete blueprint for the recreational endurance crowd.",
    stats: { followers: "1.3M", programs: 9, rating: 4.7 },
    tags: {
      goals: ["endurance", "strength", "hybrid"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["full gym", "running shoes"],
      daysPerWeek: "5–7",
      sessionLength: "60–120 min",
    },
    philosophy:
      "You don't have to choose. Nick popularized the hybrid athlete archetype — a person who can squat 400 and run a sub-3 marathon. Programming builds both capacities in parallel by separating modalities (lift in the AM, run in the PM) and respecting recovery between hard sessions.",
    bestFor: ["Marathon runners who lift", "Tactical athletes", "Anyone who refuses to choose between cardio and strength"],
    notFor:  ["Pure aesthetic competitors", "People with low time availability", "Anyone with a recovery bottleneck"],
    pairsWith: ["mat-fraser", "peter-attia"],
  },
  {
    id: "peter-attia",
    name: "Peter Attia, MD",
    handle: "@peterattiamd",
    category: "hybrid",
    tagline: "Longevity-driven training — the four pillars of fitness for your last decade.",
    stats: { followers: "1.8M", programs: 4, rating: 4.9 },
    tags: {
      goals: ["longevity", "general fitness", "mobility"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["full gym", "minimal"],
      daysPerWeek: "4–6",
      sessionLength: "45–90 min",
    },
    philosophy:
      "Train for the Centenarian Decathlon — the things you want to do at 90. Every prescription serves one of four pillars: stability, strength, aerobic efficiency (Zone 2), and anaerobic peak (VO2max). Programming is unsexy by design. The point is to compound capacity, not chase PRs.",
    bestFor: ["Anyone over 30 thinking long-term", "People wanting a sustainable lifelong framework", "Trainees recovering from injury"],
    notFor:  ["Athletes chasing peak performance this season", "Pure aesthetics-driven lifters", "People who hate steady-state cardio"],
    pairsWith: ["athlean-x", "nick-bare"],
  },
];

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
