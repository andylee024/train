/**
 * Coach profile extras — principles, weekly structure with full sessions,
 * sample videos. Keyed by coach id. Used by the profile page and compare.
 *
 * Content here is DERIVED from the corresponding guide.md under
 * `docs/content/training-styles/<id>/`. Principles map to guide §2;
 * weekStructure maps to guide §7 sample programs. Videos require a YouTube
 * scrape pass (TODO) and may be empty until populated.
 */

export type Principle = { title: string; body: string };
export type SampleVideo = {
  id: string; // YouTube video id
  title: string;
  duration: string; // "mm:ss" or "h:mm:ss"
  views: string; // "3.4K" / "1.2M"
  thumbnail: string;
};

export type SampleExercise = {
  name: string;
  sets: number | string;
  reps: string;
  load?: string;
  rest?: string;
  note?: string;
};

export type DaySession = {
  name: string;
  isRest?: boolean;
  duration?: string;
  exercises?: SampleExercise[];
};

export type CoachProfile = {
  principles: Principle[];
  weekStructure: DaySession[]; // length 7, Mon-Sun
  videos: SampleVideo[];
};

const REST: DaySession = { name: "Rest", isRest: true };

export const COACH_PROFILES: Record<string, CoachProfile> = {
  // ─────────────────────────────────────────────────────────────────────────
  // CATALYST ATHLETICS — derived from docs/content/training-styles/catalyst-athletics/guide.md
  // Sample week: §7 Skill Level 1 Beginner Development, Week 1
  // ─────────────────────────────────────────────────────────────────────────
  "catalyst-athletics": {
    principles: [
      {
        title: "Specificity (SAID) over substitution",
        body: "The snatch and clean & jerk are themselves the most effective exercises for the qualities they require. No accessory replicates them — a significant portion of training volume must be the competition lifts.",
      },
      {
        title: "Four strength qualities, trained separately",
        body: "Absolute strength, speed-strength, explosive-strength, strength endurance. At advanced levels they no longer correlate — the Explosive Strength Deficit must be trained directly, not assumed from squat numbers.",
      },
      {
        title: "Fitness-fatigue scheduling",
        body: "Every training bout creates both fitness and fatigue. Fitness persists ~3× longer than fatigue. Programming schedules sessions so fitness is preserved while fatigue dissipates enough to train productively.",
      },
      {
        title: "Coach-prescribed loading (Level 0-1)",
        body: "Sets and reps are numerical; weights are by feel at beginner levels. Catalyst explicitly avoids fixed % prescriptions until Skill Level 2+, when technique is reliable enough to chase target loads.",
      },
    ],
    weekStructure: [
      {
        name: "Snatch + Squat", duration: "~90 min",
        exercises: [
          { name: "Snatch Skill Work", sets: "—", reps: "15-20 min", load: "Light", rest: "—", note: "technique focus" },
          { name: "Snatch", sets: 5, reps: "3", load: "Coach-prescribed", rest: "3 min" },
          { name: "Snatch Pull", sets: 3, reps: "5", load: "~Snatch top", rest: "2 min" },
          { name: "Back Squat", sets: 3, reps: "8", load: "RPE 7-8", rest: "3 min" },
          { name: "Back Extension + Abs", sets: 3, reps: "10-15", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Clean & Jerk + Press", duration: "~105 min",
        exercises: [
          { name: "Clean Skill Work", sets: "—", reps: "15-20 min", load: "Light", rest: "—" },
          { name: "Clean & Jerk", sets: 5, reps: "3+1", load: "Coach-prescribed", rest: "3-4 min" },
          { name: "Clean Pull", sets: 3, reps: "5", load: "~C&J top", rest: "2 min" },
          { name: "Push Press", sets: 3, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "Back Extension + Abs", sets: 3, reps: "10-15", load: "BW", rest: "60s" },
          { name: "GPP — Sprints, Jumps, Carries", sets: "—", reps: "10-15 min", load: "—", rest: "—" },
        ],
      },
      REST,
      {
        name: "Power Snatch + Front Squat", duration: "~90 min",
        exercises: [
          { name: "Snatch Skill Work", sets: "—", reps: "15-20 min", load: "Light", rest: "—" },
          { name: "Power Snatch", sets: 5, reps: "3", load: "Coach-prescribed", rest: "3 min" },
          { name: "Snatch Push Press + OHS", sets: 4, reps: "5+1", load: "RPE 8", rest: "2 min" },
          { name: "Front Squat", sets: 3, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "Back Extension + Abs", sets: 3, reps: "10-15", load: "BW", rest: "60s" },
        ],
      },
      REST,
      {
        name: "Power Clean + Power Jerk + Squat", duration: "~105 min",
        exercises: [
          { name: "Jerk Skill Work", sets: "—", reps: "15-20 min", load: "Light", rest: "—" },
          { name: "Power Clean & Power Jerk", sets: 5, reps: "3+1", load: "Coach-prescribed", rest: "3-4 min" },
          { name: "Clean Pull", sets: 3, reps: "5", load: "~PC top", rest: "2 min" },
          { name: "Back Squat", sets: 4, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "Back Extension + Abs", sets: 3, reps: "10-15", load: "BW", rest: "60s" },
          { name: "GPP — Throws, Jumps, X-Country", sets: "—", reps: "10-15 min", load: "—", rest: "—" },
        ],
      },
      REST,
    ],
    // Foundational picks via LLM classifier (TR-360, 2026-06-10).
    // Rationales committed to /tmp/coach-research/catalyst-athletics-picks.json.
    videos: [
      { id: "5FscVghWSps", title: "The Year Plan for Olympic Weightlifting Training Programs", duration: "10:26", views: "2K", thumbnail: "https://i.ytimg.com/vi/5FscVghWSps/maxresdefault.jpg" },
      { id: "mzzmZAWxOn4", title: "Laying Out The Training Week Schedule for Olympic Weightlifting", duration: "7:27", views: "2K", thumbnail: "https://i.ytimg.com/vi/mzzmZAWxOn4/maxresdefault.jpg" },
      { id: "tqs6UpgqQDg", title: "RPE or Percentages for Olympic Weightlifting - Training Intensity", duration: "6:11", views: "3K", thumbnail: "https://i.ytimg.com/vi/tqs6UpgqQDg/maxresdefault.jpg" },
      { id: "_Q0uEiiRWYs", title: "Training & Recovery for Adaptation - Program Design for Olympic Weightlifting", duration: "4:01", views: "2K", thumbnail: "https://i.ytimg.com/vi/_Q0uEiiRWYs/maxresdefault.jpg" },
      { id: "XsqLP70vK5Y", title: "How to Use Prilepin's Table for Olympic Weightlifting", duration: "2:59", views: "3K", thumbnail: "https://i.ytimg.com/vi/XsqLP70vK5Y/maxresdefault.jpg" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DYLAN SHANNON (POWERJACKED) — derived from docs/content/training-styles/dylan-shannon/guide.md
  // Sample week: §7 Intermediate template — the canonical 6-day week
  // ─────────────────────────────────────────────────────────────────────────
  "dylan-shannon": {
    principles: [
      {
        title: "Four lower-body pillars, hit weekly",
        body: "Sprint maximally · Jump high & far · Move weight violently · Squat + hinge heavy. If a week doesn't hit all four, it's not POWERJACKED — it's some other style.",
      },
      {
        title: "Velocity first, volume after",
        body: "Session ordering: jumps/sprints/Olympic → heavy compound → moderate compound → bodybuilding accessories. The first 30-40% demands a fresh CNS; the rest tolerates fatigue.",
      },
      {
        title: "Density as a third intensity zone",
        body: "Time-bounded sets (14-min back squat clocks at 80%, EMOM deadlifts 12×2 @ 80%) sit between max-strength and hypertrophy — driving both outcomes from one stimulus.",
      },
      {
        title: "Horizontal + vertical push/pull",
        body: "Two upper days, deliberately split. One horizontal-dominant (bench, barbell row, incline, chest-supported row), one vertical-dominant (chins, dips, incline press, single-arm pulldowns).",
      },
    ],
    weekStructure: [
      {
        name: "Sprints + Conditioning", duration: "45-60 min",
        exercises: [
          { name: "Warmup — Switches, Skips, Bounds", sets: "—", reps: "10 min", load: "BW", rest: "—" },
          { name: "Sprints", sets: "Mixed", reps: "3×20 yd, 2×30 yd, 2×40 yd", load: "Max effort", rest: "60s per 10 yd" },
          { name: "Seated Jumps", sets: 3, reps: "3", load: "BW", rest: "60s" },
          { name: "Triple Broad Jumps", sets: 3, reps: "1", load: "BW", rest: "60s" },
          { name: "Barbell Jumps", sets: 3, reps: "4", load: "30-35% Squat 1RM", rest: "2 min" },
          { name: "Power Cleans", sets: 4, reps: "3", load: "70-75% Clean 1RM", rest: "2-3 min" },
        ],
      },
      {
        name: "Lower (Bodybuilding emphasis)", duration: "75-90 min",
        exercises: [
          { name: "Leg Extensions", sets: 2, reps: "10-15", load: "RPE 9", rest: "90s" },
          { name: "Lying Hamstring Curl", sets: 3, reps: "10-15", load: "RPE 9", rest: "90s" },
          { name: "Hack Squats", sets: "1+1", reps: "6-8, 12-15", load: "RPE 8-9", rest: "2-3 min" },
          { name: "Leg Press", sets: "1+1", reps: "10-12, 20", load: "RPE 9-10", rest: "2 min", note: "rest-pause until 20 reps on top set" },
          { name: "DB Bulgarian Split Squat", sets: 3, reps: "12/leg", load: "RPE 9", rest: "90s" },
        ],
      },
      {
        name: "Upper (Horizontal)", duration: "75-90 min",
        exercises: [
          { name: "Bench Press", sets: "3+1", reps: "5, 8-10", load: "RPE 8-9", rest: "3 min" },
          { name: "Barbell Rows", sets: 4, reps: "6", load: "RPE 8", rest: "2 min" },
          { name: "DB Incline Bench", sets: 3, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "T-Bar Chest Supported Row", sets: 3, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "Cable Flys + Deficit Pushups", sets: "3+3", reps: "8-12 / 8-12", load: "RPE 9", rest: "90s", note: "superset" },
          { name: "Single-Arm + Lat Pulldowns", sets: "3+3", reps: "8-12 / 8-12", load: "RPE 9", rest: "90s", note: "superset" },
        ],
      },
      {
        name: "Sprints + Conditioning", duration: "45-60 min",
        exercises: [
          { name: "Same template as Day 1", sets: "—", reps: "—", load: "—", rest: "—", note: "swap volume distribution as block progresses" },
        ],
      },
      {
        name: "Lower (Olympic + posterior)", duration: "75-90 min",
        exercises: [
          { name: "Power Cleans", sets: 4, reps: "3", load: "70-80% Clean 1RM", rest: "2-3 min" },
          { name: "Deadlifts", sets: 4, reps: "6, 5, 4, 4", load: "RPE 8-9 ascending", rest: "3 min" },
          { name: "Front Squats", sets: 4, reps: "5", load: "RPE 8", rest: "2-3 min" },
          { name: "Pendulum Squats", sets: 3, reps: "8-10", load: "RPE 9", rest: "2 min" },
          { name: "Seated Hamstring Curl", sets: 3, reps: "8-10", load: "RPE 9", rest: "90s" },
          { name: "Calf Raises", sets: 3, reps: "15-20", load: "RPE 9-10", rest: "60s" },
        ],
      },
      {
        name: "Upper (Vertical)", duration: "75-90 min",
        exercises: [
          { name: "Chin-ups", sets: "3+1", reps: "5, 8-10", load: "RPE 8-9", rest: "2-3 min" },
          { name: "Dips", sets: "3+1", reps: "5, 8-10", load: "RPE 8-9", rest: "2 min" },
          { name: "Chest-Supported Row", sets: 4, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "Incline Press", sets: 4, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "Single-Arm Pulldowns", sets: 3, reps: "10-12", load: "RPE 9", rest: "90s" },
          { name: "Flys", sets: 3, reps: "10-12", load: "RPE 9", rest: "90s" },
        ],
      },
      REST,
    ],
    // Foundational picks via LLM classifier (TR-360, 2026-06-10).
    // Rationales committed to /tmp/coach-research/dylan-shannon-picks.json.
    videos: [
      { id: "Kb9WfJsL7-8", title: "MY NEW 8 DAY TRAINING SPLIT TO GET JACKED", duration: "21:05", views: "10K", thumbnail: "https://i.ytimg.com/vi/Kb9WfJsL7-8/maxresdefault.jpg" },
      { id: "MfJ56F4P21Y", title: "How I Combine Sprinting & Lifting for Max Performance", duration: "32:35", views: "5K", thumbnail: "https://i.ytimg.com/vi/MfJ56F4P21Y/maxresdefault.jpg" },
      { id: "tm3yVtIDWn0", title: "Start Sprinting if you want to get JACKED & ATHLETIC", duration: "20:42", views: "5K", thumbnail: "https://i.ytimg.com/vi/tm3yVtIDWn0/maxresdefault.jpg" },
      { id: "Kxo52Bs5eNU", title: "Build Strong & Jacked Legs: Combining Explosive Power and Hypertrophy Gains", duration: "21:06", views: "8K", thumbnail: "https://i.ytimg.com/vi/Kxo52Bs5eNU/maxresdefault.jpg" },
      { id: "8fEQiMKY10g", title: "How I Structure My Push Workouts To Build SIZE", duration: "23:07", views: "5K", thumbnail: "https://i.ytimg.com/vi/8fEQiMKY10g/maxresdefault.jpg" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // JEFF NIPPARD — derived from public PPL program + science-based content.
  // Sample week: Push / Pull / Legs split, 6-day Upper-Lower variant common too.
  // ─────────────────────────────────────────────────────────────────────────
  "nippard": {
    principles: [
      {
        title: "RIR-calibrated progression",
        body: "Working sets target 1–2 RIR through accumulation; drop to 0–1 RIR in intensification. Effort is the dial, not just weight on the bar.",
      },
      {
        title: "Volume between MEV and MRV",
        body: "Each muscle has a minimum effective volume and maximum recoverable volume per week. Programming hits the sweet spot, never the ceiling.",
      },
      {
        title: "Exercise selection by mechanism",
        body: "Picks favor lengthened-position bias, stable resistance profiles, and the highest hypertrophy-per-rep yield based on EMG + stretch-mediated data.",
      },
      {
        title: "Specificity over novelty",
        body: "The big six (squat, bench, DL, OHP, row, pull-up) anchor every block. Variation is a tool, not a default — swap in for stalls or weak points.",
      },
    ],
    weekStructure: [
      {
        name: "Push (heavy)", duration: "~75 min",
        exercises: [
          { name: "Smith Machine Bench Press", sets: 3, reps: "6-8", load: "RIR 1-2", rest: "3 min", note: "lengthened bias" },
          { name: "Standing DB Overhead Press", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "2 min" },
          { name: "Incline DB Press", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "2 min" },
          { name: "Cable Tricep Pushdown", sets: 3, reps: "12-15", load: "RIR 0-1", rest: "90s" },
          { name: "Cable Lateral Raise", sets: 3, reps: "12-15", load: "RIR 0", rest: "60s", note: "drop set on last" },
        ],
      },
      {
        name: "Pull (heavy)", duration: "~75 min",
        exercises: [
          { name: "Weighted Pull-up", sets: 3, reps: "5-7", load: "RIR 1-2", rest: "3 min" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "2 min" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "2 min", note: "lengthened bias" },
          { name: "Incline DB Curl", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "90s" },
          { name: "Cable Reverse Fly", sets: 3, reps: "15-20", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Legs (quad focus)", duration: "~80 min",
        exercises: [
          { name: "Back Squat", sets: 3, reps: "5-7", load: "RIR 1-2", rest: "3 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "2 min" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", load: "RIR 0-1", rest: "90s" },
          { name: "Lying Leg Curl", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "90s", note: "lengthened bias" },
          { name: "Standing Calf Raise", sets: 3, reps: "12-15", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Push (hypertrophy)", duration: "~75 min",
        exercises: [
          { name: "Incline Smith Bench Press", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "3 min" },
          { name: "Machine Shoulder Press", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "2 min" },
          { name: "Pec Deck", sets: 3, reps: "12-15", load: "RIR 0-1", rest: "90s", note: "stretch emphasis" },
          { name: "Overhead Cable Tri Ext", sets: 3, reps: "12-15", load: "RIR 0-1", rest: "90s" },
          { name: "Cable Lateral Raise", sets: 3, reps: "15-20", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Pull (back width)", duration: "~75 min",
        exercises: [
          { name: "Pendlay Row", sets: 3, reps: "6-8", load: "RIR 1-2", rest: "3 min" },
          { name: "Wide-Grip Pulldown", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "2 min" },
          { name: "Cable Pullover", sets: 3, reps: "12-15", load: "RIR 0-1", rest: "90s", note: "lengthened bias" },
          { name: "Hammer Curl", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "90s" },
          { name: "Face Pull", sets: 3, reps: "15-20", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Legs (posterior)", duration: "~80 min",
        exercises: [
          { name: "Front Squat", sets: 3, reps: "6-8", load: "RIR 1-2", rest: "3 min" },
          { name: "Hip Thrust", sets: 3, reps: "8-10", load: "RIR 1-2", rest: "2 min" },
          { name: "Walking Lunge", sets: 3, reps: "10-12/leg", load: "RIR 0-1", rest: "90s" },
          { name: "Seated Leg Curl", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "90s" },
          { name: "Seated Calf Raise", sets: 3, reps: "12-15", load: "RIR 0", rest: "60s" },
        ],
      },
      REST,
    ],
    // Foundational picks via LLM classifier (TR-360, 2026-06-10).
    // Rationales committed to /tmp/coach-research/nippard-picks.json.
    videos: [
      { id: "qVek72z3F1U", title: "The Smartest Push Pull Legs Routine (Fully Explained)", duration: "19:04", views: "9.8M", thumbnail: "https://i.ytimg.com/vi/qVek72z3F1U/maxresdefault.jpg" },
      { id: "lu_BObG6dj8", title: "How To Build Muscle (Explained In 5 Levels)", duration: "21:55", views: "9.3M", thumbnail: "https://i.ytimg.com/vi/lu_BObG6dj8/maxresdefault.jpg" },
      { id: "d8V9ZaSq9Oc", title: "The Smartest Way To Get Lean (Shredding Science Explained)", duration: "18:20", views: "12.0M", thumbnail: "https://i.ytimg.com/vi/d8V9ZaSq9Oc/maxresdefault.jpg" },
      { id: "deDlhPmT2SY", title: "How To Tell If You're Training Hard Enough (Using Science)", duration: "18:01", views: "4.1M", thumbnail: "https://i.ytimg.com/vi/deDlhPmT2SY/maxresdefault.jpg" },
      { id: "jLvqKgW-_G8", title: "The Best And Worst Back Exercises (Ranked By Science)", duration: "12:16", views: "10.7M", thumbnail: "https://i.ytimg.com/vi/jLvqKgW-_G8/maxresdefault.jpg" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MIKE ISRAETEL (Renaissance Periodization) — derived from RP volume
  // landmarks framework + public mesocycle templates.
  // ─────────────────────────────────────────────────────────────────────────
  "israetel": {
    principles: [
      {
        title: "Mesocycle structure",
        body: "4–6 week accumulation block where sets-per-muscle climbs week to week, capped by a deload. Repeat with variation.",
      },
      {
        title: "Junk volume is real",
        body: "Sets that don't hit hard-set count or proximity to failure don't move the needle. Cut them and reinvest the recovery elsewhere.",
      },
      {
        title: "Stimulus-to-fatigue ratio",
        body: "Every exercise gets evaluated by how much growth it causes vs how much recovery it taxes. Pick high-SFR movements first.",
      },
      {
        title: "Exercise variation by mesocycle",
        body: "Swap movements between blocks (incline → flat, sumo → conventional). Keep stimulus novel without losing specificity.",
      },
    ],
    weekStructure: [
      {
        name: "Chest + Back", duration: "~80 min",
        exercises: [
          { name: "Incline DB Press", sets: 3, reps: "8-10", load: "RIR 2-3 W1, RIR 0-1 W4", rest: "2-3 min" },
          { name: "Pec Deck", sets: 3, reps: "10-12", load: "RIR 1-2", rest: "90s", note: "stretch emphasis" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", load: "RIR 1-2", rest: "90s" },
          { name: "Cable Reverse Fly", sets: 2, reps: "12-15", load: "RIR 0-1", rest: "60s" },
        ],
      },
      {
        name: "Legs (quad bias)", duration: "~85 min",
        exercises: [
          { name: "High-Bar Back Squat", sets: 3, reps: "6-8", load: "RIR 2-3", rest: "3 min" },
          { name: "Leg Press (narrow stance)", sets: 3, reps: "10-12", load: "RIR 1-2", rest: "2-3 min" },
          { name: "Hack Squat", sets: 2, reps: "10-12", load: "RIR 0-1", rest: "2 min" },
          { name: "Lying Leg Curl", sets: 3, reps: "10-12", load: "RIR 1-2", rest: "90s", note: "lengthened bias" },
          { name: "Standing Calf Raise", sets: 3, reps: "8-10", load: "RIR 0-1", rest: "60s" },
        ],
      },
      {
        name: "Shoulders + Arms", duration: "~70 min",
        exercises: [
          { name: "Seated DB Overhead Press", sets: 3, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Cable Lateral Raise", sets: 4, reps: "12-15", load: "RIR 0-1", rest: "60s", note: "junk-volume threshold" },
          { name: "Rear-Delt Fly", sets: 3, reps: "12-15", load: "RIR 0-1", rest: "60s" },
          { name: "Incline DB Curl", sets: 3, reps: "10-12", load: "RIR 1", rest: "90s" },
          { name: "Cable Tricep Pushdown", sets: 3, reps: "10-12", load: "RIR 1", rest: "90s" },
        ],
      },
      { name: "Rest / GPP", isRest: true },
      {
        name: "Chest + Back (volume)", duration: "~80 min",
        exercises: [
          { name: "Flat Barbell Bench", sets: 3, reps: "6-8", load: "RIR 2", rest: "3 min" },
          { name: "Cable Crossover", sets: 3, reps: "12-15", load: "RIR 0-1", rest: "60s" },
          { name: "Barbell Row", sets: 3, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Single-Arm Pulldown", sets: 3, reps: "10-12", load: "RIR 1-2", rest: "90s" },
          { name: "Rope Face Pull", sets: 3, reps: "15-20", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Legs (posterior chain)", duration: "~85 min",
        exercises: [
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", load: "RIR 2", rest: "3 min" },
          { name: "Hip Thrust", sets: 3, reps: "10-12", load: "RIR 1", rest: "2-3 min" },
          { name: "Walking Lunge", sets: 2, reps: "10/leg", load: "RIR 1", rest: "2 min" },
          { name: "Seated Leg Curl", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "90s" },
          { name: "Seated Calf Raise", sets: 3, reps: "10-12", load: "RIR 0-1", rest: "60s" },
        ],
      },
      { name: "Rest / GPP", isRest: true },
    ],
    // Foundational picks via LLM classifier (TR-360, 2026-06-10).
    // Rationales committed to /tmp/coach-research/israetel-picks.json.
    videos: [
      { id: "zhP5gsBbgYY", title: "How to Train for Muscle Growth: Beginner to Advanced Training", duration: "44:38", views: "214K", thumbnail: "https://i.ytimg.com/vi/zhP5gsBbgYY/maxresdefault.jpg" },
      { id: "tIsE3jLz5zI", title: "How to Build the Most Aesthetic Physique (Full Workout Plan)", duration: "18:28", views: "300K", thumbnail: "https://i.ytimg.com/vi/tIsE3jLz5zI/maxresdefault.jpg" },
      { id: "PgG_qyZmF5M", title: "11 Signs Your Workouts Aren't Hard Enough to Build Muscle", duration: "20:25", views: "234K", thumbnail: "https://i.ytimg.com/vi/PgG_qyZmF5M/maxresdefault.jpg" },
      { id: "-N18byHLSF8", title: "Not Growing? You Aren't Training Enough", duration: "24:14", views: "158K", thumbnail: "https://i.ytimg.com/vi/-N18byHLSF8/maxresdefault.jpg" },
      { id: "jOTVZaSRV0s", title: "Low Reps Aren't Worth It (for Muscle Growth)", duration: "28:28", views: "355K", thumbnail: "https://i.ytimg.com/vi/jOTVZaSRV0s/maxresdefault.jpg" },
    ],
  },
};

export function getProfile(id: string): CoachProfile | undefined {
  return COACH_PROFILES[id];
}
