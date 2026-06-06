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
    // Videos pulled from youtube.com/@catalystathletics (2026-06-06).
    // TODO: switch from most-recent to true top-N-by-views once we have a sorted fetch path.
    videos: [
      { id: "XpN5dGyHKqY", title: "Exercise Selection & Order — How To Write Olympic Weightlifting Training Programs", duration: "12:59", views: "3.2K", thumbnail: "https://i.ytimg.com/vi/XpN5dGyHKqY/maxresdefault.jpg" },
      { id: "ra8dYrUKJys", title: "Your Feet Might Be Lying — Snatch & Clean Technique", duration: "3:01", views: "2.8K", thumbnail: "https://i.ytimg.com/vi/ra8dYrUKJys/maxresdefault.jpg" },
      { id: "XsqLP70vK5Y", title: "How to Use Prilepin's Table for Olympic Weightlifting", duration: "2:59", views: "2.6K", thumbnail: "https://i.ytimg.com/vi/XsqLP70vK5Y/maxresdefault.jpg" },
      { id: "mzzmZAWxOn4", title: "Laying Out The Training Week Schedule for Olympic Weightlifting", duration: "7:27", views: "2.4K", thumbnail: "https://i.ytimg.com/vi/mzzmZAWxOn4/maxresdefault.jpg" },
      { id: "5FscVghWSps", title: "The Year Plan for Olympic Weightlifting Training Programs", duration: "10:26", views: "1.8K", thumbnail: "https://i.ytimg.com/vi/5FscVghWSps/maxresdefault.jpg" },
      { id: "SInXEdJVTA8", title: "How & Why Athletes' Ability for Reps & Intensity Varies", duration: "3:02", views: "1.4K", thumbnail: "https://i.ytimg.com/vi/SInXEdJVTA8/maxresdefault.jpg" },
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
    // Videos pulled from youtube.com/@dylan_shannon (2026-06-06).
    // TODO: switch from most-recent to true top-N-by-views once we have a sorted fetch path.
    videos: [
      { id: "YOyFCTVfPEI", title: "The Power of Small Changes | Heavy Push Day for Strength", duration: "22:55", views: "6.0K", thumbnail: "https://i.ytimg.com/vi/YOyFCTVfPEI/maxresdefault.jpg" },
      { id: "Ws2b0CUiQRI", title: "Eating 4600 Calories In Miami While Staying Lean and Athletic", duration: "22:53", views: "3.8K", thumbnail: "https://i.ytimg.com/vi/Ws2b0CUiQRI/maxresdefault.jpg" },
      { id: "-aigVtGcOvg", title: "Build BIG & STRONG Quads with this Workout", duration: "25:26", views: "3.8K", thumbnail: "https://i.ytimg.com/vi/-aigVtGcOvg/maxresdefault.jpg" },
      { id: "YL5_TW4M1pg", title: "Squatting 545lbs for Reps: Why the First Set is Always the Hardest", duration: "26:00", views: "3.7K", thumbnail: "https://i.ytimg.com/vi/YL5_TW4M1pg/maxresdefault.jpg" },
      { id: "2fl7gJt2XH8", title: "How I Structure My Pull Day for Maximum Strength & Size", duration: "22:03", views: "3.6K", thumbnail: "https://i.ytimg.com/vi/2fl7gJt2XH8/maxresdefault.jpg" },
      { id: "x2-sSTG41ao", title: "Build Strong & Jacked Legs: Combining Explosive Power and Hypertrophy", duration: "20:12", views: "3.4K", thumbnail: "https://i.ytimg.com/vi/x2-sSTG41ao/maxresdefault.jpg" },
    ],
  },
};

export function getProfile(id: string): CoachProfile | undefined {
  return COACH_PROFILES[id];
}
