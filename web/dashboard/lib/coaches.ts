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

export type ProgramFAQ = {
  q: string;
  a: string;
};

/**
 * Sources for the "Sources" section (Videos + Documents). Replaces the older
 * `videosAnalyzed / texts / articles / citedClaims` shape with a unified
 * two-bucket model. See TR-364.
 */
export type Sources = {
  origin: "auto-ingested" | "hand-curated";
  videos?: {
    channel?: { handle: string; url: string; total?: number };
    /** YouTube watch URL is derivable from `id`. */
    analyzed: { id: string; title: string }[];
  };
  documents?: {
    title: string;
    pages?: number;
    /** Omit to display a "Referenced offline" tag in place of the link. */
    url?: string;
    author?: string;
  }[];
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
  /**
   * Answers to `UNIVERSAL_FAQ_QUESTIONS` in the coach's voice — same questions
   * across every coach so users can comparison-shop. Length MUST equal
   * `UNIVERSAL_FAQ_QUESTIONS.length` (4). See TR-361.
   */
  faqAnswers: string[];
  /**
   * 2-3 coach-specific FAQs that explain signature concepts / jargon (e.g.
   * "What's a mesocycle?", "What's Prilepin's Table?"). See TR-361.
   */
  programFaqs: ProgramFAQ[];
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
    faqAnswers: [
      // What kind of training is this?
      "Olympic weightlifting — the snatch and clean & jerk are the program, not accessories to it. Squats, pulls, and pressing exist to support the competition lifts. You'll spend most sessions on the platform with a barbell overhead.",
      // Who is this for?
      "Athletes pursuing competitive Olympic weightlifting, or field/court athletes who need transferable triple-extension power. Also anyone whose absolute strength has saturated and now needs speed-strength back — that's the Explosive Strength Deficit at work.",
      // What will I get out of 12-18 weeks of this?
      "Beginners typically add 30-60 lb to back squat and learn the competition lifts well enough to compete. Intermediates sharpen technique under fatigue and climb snatch / clean-and-jerk ratios. Either way, you finish with a tested 1RM on snatch + C&J.",
      // What do I need to commit to?
      "3-6 sessions per week, 60-120 min each. You need a barbell, bumper plates, a platform, and a squat rack. Safe overhead and front-rack positions are non-negotiable — if mobility blocks the catch, we fix that before adding load.",
    ],
    programFaqs: [
      {
        q: "What's the difference between coach-prescribed loads and percentages?",
        a: "Beginners get coach-prescribed loads — the coach picks the weight based on technique that day, not a number from a chart. Percentages enter once you have a real 1RM and consistent technique under load. Skipping straight to percentages teaches you to chase numbers instead of positions.",
      },
      {
        q: "What's the Explosive Strength Deficit and why does Catalyst train it directly?",
        a: "ESD is the gap between your absolute strength (slow max) and your rate of force development (fast force). At advanced levels the two stop correlating — you can squat more without snatching more. The snatch + C&J, jumps, and speed pulls close that gap; nothing else does.",
      },
      {
        q: "What's Prilepin's Table and how does it guide weight choice?",
        a: "Prilepin's Table maps intensity zones (70-80%, 80-90%, 90%+) to optimal rep ranges and total reps per session. Stay inside the zone and you get the adaptation without burning the CNS; leave it and you either undershoot or accumulate fatigue you can't recover from. The program prescribes total reps; the table tells you why.",
      },
    ],
    sources: {
      origin: "auto-ingested",
      videos: {
        channel: {
          handle: "@CatalystAthletics",
          url: "https://www.youtube.com/@CatalystAthletics",
          total: 1873,
        },
        analyzed: [
          { id: "5FscVghWSps", title: "The Year Plan for Olympic Weightlifting Training Programs" },
          { id: "mzzmZAWxOn4", title: "Laying Out The Training Week Schedule for Olympic Weightlifting" },
          { id: "tqs6UpgqQDg", title: "RPE or Percentages for Olympic Weightlifting - Training Intensity" },
          { id: "_Q0uEiiRWYs", title: "Training & Recovery for Adaptation - Program Design for Olympic Weightlifting" },
          { id: "XsqLP70vK5Y", title: "How to Use Prilepin's Table for Olympic Weightlifting" },
        ],
      },
      documents: [
        {
          title: "Olympic Weightlifting: A Complete Guide for Athletes & Coaches",
          pages: 1267,
          author: "Greg Everett",
        },
      ],
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
    faqAnswers: [
      // What kind of training is this?
      "A 6-day hybrid system that runs two adaptation streams in parallel: explosive power (sprints, jumps, Olympic lifts, heavy compounds) when the CNS is fresh, then high-volume bodybuilding accessories layered on top of the same session. Look like a bodybuilder, perform like an athlete.",
      // Who is this for?
      "Field-sport athletes (rugby, football, lacrosse, basketball) who need speed and power and size at the same time. Also intermediate-to-advanced lifters plateaued on pure bodybuilding splits who want explosive output back. Not for true novices or anyone who can't recover from 6 sessions a week.",
      // What will I get out of 12-18 weeks of this?
      "25-50 lb on back squat per 12-week block at the intermediate level, with measurable vertical, broad jump, and 20-yd sprint improvements alongside visible muscle gain. Every test re-fires at the end of the arc against your Week-1 baseline.",
      // What do I need to commit to?
      "6 sessions per week, 75-90 min each. You need a full gym, a sprint surface, and plyo boxes. The schedule is non-negotiable on the four lower-body pillars — sprint, jump, move weight violently, squat/hinge heavy — every single week.",
    ],
    programFaqs: [
      {
        q: "What are the four lower-body pillars and why do all four need to hit weekly?",
        a: "Sprint, jump, move weight violently (Olympic lifts / loaded jumps), and squat + hinge heavy. Each one drives a different quality — speed, reactivity, RFD, max force. Drop one and the adaptation it owns regresses inside a couple of weeks. Hit all four and they reinforce each other.",
      },
      {
        q: "What's density work (14-min squat clock, EMOM deadlifts) and what does it produce?",
        a: "Density is a third intensity zone between max strength and pure hypertrophy: heavy load (75-85%) on a clock, where the constraint is total work in a fixed window. The 14-min squat clock and EMOM deadlifts build strength + hypertrophy + work capacity in one piece. It's how the program gets bodybuilding-grade volume on the big lifts.",
      },
      {
        q: "Why are sprints + plyos + Olympic lifts done before hypertrophy work in the same session?",
        a: "Velocity work demands a fresh CNS — quality drops fast under fatigue and you stop driving the adaptation you came for. Hypertrophy work tolerates residual fatigue just fine because it runs on metabolic stress and time-under-tension, not peak output. The sequence preserves both streams.",
      },
    ],
    sources: {
      origin: "hand-curated",
      documents: [
        { title: "7 Things to Build Powerful Legs", author: "Dylan Shannon" },
        { title: "Sample 6-day training sessions", author: "Dylan Shannon" },
        { title: "POWERJACKED weekly template", author: "Dylan Shannon" },
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
    faqAnswers: [
      // What kind of training is this?
      "Science-based hypertrophy and strength. Every prescription is an answer to a literature question — what the meta-analyses say about frequency, which stretch position drives growth, where junk volume starts. RIR-based progression governs effort; exercise selection is ranked by EMG and stretch-mediated data.",
      // Who is this for?
      "Intermediate-to-advanced lifters chasing measured hypertrophy with full gym access who want to read the why behind every choice. Not for sport-specific athletes who need power expression over size, and not for beginners overwhelmed by exercise-selection detail.",
      // What will I get out of 12-18 weeks of this?
      "Intermediate lifters typically see 2-4 lb of lean mass at a small surplus, visible improvement in whichever body parts get prioritized volume, and a heavier-loaded 1RM test on bench / squat / DL at the end of the arc.",
      // What do I need to commit to?
      "4-6 sessions per week, 60-90 min each, full gym. You need to be willing to train near failure (1-2 RIR), track weekly sets per muscle, and run a deload when the program says so. Sub-45-min sessions don't compress the volume cleanly.",
    ],
    programFaqs: [
      {
        q: "What are volume landmarks (MEV / MAV / MRV) and how do they govern weekly sets?",
        a: "MEV is the minimum effective volume — the fewest weekly sets per muscle that still drive growth. MAV is the maximum adaptive volume — the sweet spot. MRV is the maximum recoverable volume — the ceiling before fatigue swamps the stimulus. The accumulation phase climbs from MEV toward MRV adding 1-2 sets per week, then a deload resets the dial.",
      },
      {
        q: "What's RIR-based progression and how do I actually gauge it?",
        a: "RIR (reps in reserve) is how many reps you could have done before failure. RIR 2 = two more in the tank. You gauge it honestly by occasionally taking a set to failure on isolation work and recalibrating — most people overestimate their RIR until they've tested it a few times. Compound lifts sit at 1-2 RIR most of the arc; isolation can go to failure on the last set.",
      },
      {
        q: "What's lengthened-position bias and why is it preferred in exercise selection?",
        a: "Lengthened-position bias means the exercise loads the muscle hardest when it's stretched (RDLs > leg curls, incline curls > preacher curls, deficit pushups > regular). The data shows stretch-mediated hypertrophy is a real and large driver of growth. Where the lift allows it, we pick the variation that puts the muscle under tension at its longest length.",
      },
    ],
    sources: {
      origin: "auto-ingested",
      videos: {
        channel: {
          handle: "@JeffNippard",
          url: "https://www.youtube.com/@JeffNippard",
          total: 320,
        },
        analyzed: [
          { id: "qVek72z3F1U", title: "The Smartest Push Pull Legs Routine (Fully Explained)" },
          { id: "lu_BObG6dj8", title: "How To Build Muscle (Explained In 5 Levels)" },
          { id: "d8V9ZaSq9Oc", title: "The Smartest Way To Get Lean (Shredding Science Explained)" },
          { id: "deDlhPmT2SY", title: "How To Tell If You're Training Hard Enough (Using Science)" },
          { id: "jLvqKgW-_G8", title: "The Best And Worst Back Exercises (Ranked By Science)" },
        ],
      },
      documents: [
        {
          title: "The Ultimate Push Pull Legs System",
          pages: 96,
          author: "Jeff Nippard",
        },
      ],
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
    faqAnswers: [
      // What kind of training is this?
      "Mesocycle-based hypertrophy. The Renaissance Periodization system codified MV / MEV / MAV / MRV — the volume landmarks every modern hypertrophy programmer references. You run 4-6 week blocks, climb volume from MEV toward MRV, deload, repeat. Programming is a problem of stimulus-to-fatigue ratio.",
      // Who is this for?
      "Lifters who want a system instead of vibes — clear volume math per muscle group, scheduled deloads, repeatable structure. You should recover well and be willing to train near failure (0-2 RIR). Not for sport in-season, post-surgical return, or anyone whose recovery bandwidth is shot.",
      // What will I get out of 12-18 weeks of this?
      "Three mesocycles inside the arc, each with measurable growth on the targeted muscle groups, plus a re-tested 1RM / e1RM at the end. You'll also walk away with a documented set of volume landmarks personalized to your recovery — the next arc is faster to plan because of it.",
      // What do I need to commit to?
      "4-6 sessions per week, 60-90 min each, full gym. You commit to deload weeks even when you feel fine (skipping them is the most common way the system breaks). And you commit to honest RIR — most working sets land at 0-2 RIR by the end of the mesocycle.",
    ],
    programFaqs: [
      {
        q: "What's a mesocycle and how do I run one?",
        a: "A mesocycle is a 4-6 week block. Week 1 starts at MEV for each muscle (the published minimum, e.g. 8-10 sets/week for chest). Each week you add 1-2 sets per muscle as long as growth and recovery support it. By the last working week you're at or near MRV. Then a deload week dumps fatigue and you start the next cycle.",
      },
      {
        q: "What's a deload week and when do I trigger it?",
        a: "A deload is a planned reduction in volume and intensity (typically ~50% of working sets at 60-70% loads) to clear accumulated fatigue without losing fitness. Trigger it at the end of every mesocycle — automatically, not when you 'feel' burned out. By the time you feel it, you've already lost two productive weeks.",
      },
      {
        q: "What's junk volume and how do I cut it?",
        a: "Junk volume is sets that don't get close enough to failure (>4 RIR) to drive growth but still tax recovery. The fix: every working set should sit at 0-3 RIR; warm-ups and rest-set fillers don't count toward weekly volume math. If your weekly sets-per-muscle number includes anything you barely felt, it's inflated.",
      },
    ],
    sources: {
      origin: "auto-ingested",
      videos: {
        channel: {
          handle: "@RenaissancePeriodization",
          url: "https://www.youtube.com/@RenaissancePeriodization",
          total: 1200,
        },
        analyzed: [
          { id: "zhP5gsBbgYY", title: "How to Train for Muscle Growth: Beginner to Advanced Training" },
          { id: "tIsE3jLz5zI", title: "How to Build the Most Aesthetic Physique (Full Workout Plan)" },
          { id: "PgG_qyZmF5M", title: "11 Signs Your Workouts Aren't Hard Enough to Build Muscle" },
          { id: "-N18byHLSF8", title: "Not Growing? You Aren't Training Enough" },
          { id: "jOTVZaSRV0s", title: "Low Reps Aren't Worth It (for Muscle Growth)" },
        ],
      },
      documents: [
        {
          title: "The Renaissance Diet 2.0",
          pages: 412,
          author: "Mike Israetel et al.",
        },
        {
          title: "Scientific Principles of Hypertrophy Training",
          pages: 256,
          author: "Renaissance Periodization",
        },
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
