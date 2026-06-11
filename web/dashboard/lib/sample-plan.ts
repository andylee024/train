/**
 * Mocked synthesized plan — the structured output the preview screen renders.
 *
 * v1: variant templates keyed by dominant coach category, picked at preview
 * time from selected coaches. Real AI synthesis is deferred (see A24-294).
 *
 * Each variant covers all 4 blocks with sample weeks so the athlete can toggle
 * between blocks on the preview surface.
 */
import type { Coach, CoachCategory } from "@/lib/coaches";
import type { GoalKey } from "@/lib/use-intake";

export type SamplePlanBlock = {
  name: string;
  weeks: string;
  focus: string;
  source: string;
  weekStart: number;
  weekEnd: number;
};

export type SamplePlanExercise = {
  name: string;
  shortName?: string;   // narrow-column rendering fallback (A24-312)
  sets?: string;
  reps?: string;
  load?: string;
  note?: string;
};

export type SamplePlanDay = {
  day: string;
  title: string;
  rest?: boolean;
  exercises: SamplePlanExercise[];
};

export type SamplePlanKPI = {
  name: string;
  baseline: string;
  target: string;
  measured: string;
  primary?: boolean;   // headline KPI gets accent treatment (A24-313)
};

export type SamplePlanSampleWeek = {
  label: string;
  days: SamplePlanDay[];
};

export type SamplePlan = {
  meta: {
    title: string;
    horizon: string;
    durationWeeks: number;
    daysPerWeek: number;
    sessionLength: string;
  };
  rationale: string;
  blocks: SamplePlanBlock[];
  sampleWeeks: SamplePlanSampleWeek[];  // one per block (length === blocks.length)
  defaultBlockIdx: number;
  kpis: SamplePlanKPI[];
};

// ─── Variant templates ─────────────────────────────────────────────────────
// Each variant is a fully-formed SamplePlan shell. Block "source" attributions
// are filled at runtime from real selected coach names.

type Variant = Omit<SamplePlan, "blocks"> & {
  blocks: Omit<SamplePlanBlock, "source">[];
};

const ATHLETIC: Variant = {
  meta: {
    title: "Your 16-Week Vertical Jump Arc",
    horizon: "16 weeks",
    durationWeeks: 16,
    daysPerWeek: 5,
    sessionLength: "75 min",
  },
  rationale:
    "Opens with a 4-week movement-quality block (assessment + correctives + base strength) so you build the chassis before loading it. Block 2 layers in Olympic derivatives and intent-based lifting to teach rate of force development. Block 3 introduces a plyometric ladder and depth jump progression with a posterior chain hypertrophy minimum dose. The final 4-week peak block taps the system: low volume, max intent, fully recovered jumps. KPIs tested wk 1, 8, 16.",
  blocks: [
    { name: "Foundation",        weeks: "Wk 1-4",   focus: "Movement quality, base strength, eccentric capacity",     weekStart: 1,  weekEnd: 4  },
    { name: "Power Development", weeks: "Wk 5-8",   focus: "Olympic derivatives, intent-based lifting, RFD",          weekStart: 5,  weekEnd: 8  },
    { name: "Plyometric Ladder", weeks: "Wk 9-12",  focus: "Reactive strength, depth jumps, posterior hypertrophy",   weekStart: 9,  weekEnd: 12 },
    { name: "Peak",              weeks: "Wk 13-16", focus: "Low volume, max intent, recovered jumps",                  weekStart: 13, weekEnd: 16 },
  ],
  defaultBlockIdx: 1,
  sampleWeeks: [
    {
      label: "Sample Week from Block 1 (Foundation)",
      days: [
        { day: "Mon", title: "Lower Base", exercises: [
          { name: "Goblet squat", sets: "4", reps: "8", load: "RPE 6" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "8", load: "RPE 7" },
          { name: "Single-leg glute bridge", shortName: "SL bridge", sets: "3", reps: "10/leg" },
          { name: "Ankle pogos", sets: "3", reps: "10", note: "stiffness" },
        ]},
        { day: "Tue", title: "Upper Base", exercises: [
          { name: "DB bench", sets: "4", reps: "8" },
          { name: "Chest-supported row", shortName: "CS row", sets: "4", reps: "10" },
          { name: "Half-kneel landmine press", shortName: "Landmine press", sets: "3", reps: "8/side" },
          { name: "Pallof press", sets: "3", reps: "10/side" },
        ]},
        { day: "Wed", title: "Movement Skill", exercises: [
          { name: "A-skips", sets: "4", reps: "20m" },
          { name: "Hurdle walkovers", sets: "3", reps: "6" },
          { name: "Med ball scoops", sets: "4", reps: "5" },
          { name: "Crawl patterns", sets: "3", reps: "20m" },
        ]},
        { day: "Thu", title: "Lower Capacity", exercises: [
          { name: "Front squat", sets: "4", reps: "6", load: "RPE 7" },
          { name: "Bulgarian split squat", shortName: "BSS", sets: "3", reps: "8/leg" },
          { name: "Nordic curl eccentrics", shortName: "Nordics", sets: "3", reps: "4" },
          { name: "Calf raise iso holds", shortName: "Calf iso", sets: "3", reps: "30s" },
        ]},
        { day: "Fri", title: "Upper + Core", exercises: [
          { name: "Pull-up", sets: "4", reps: "6" },
          { name: "Push-up variations", shortName: "Push-ups", sets: "3", reps: "12" },
          { name: "DB row", sets: "3", reps: "10" },
          { name: "Hollow hold", sets: "3", reps: "30s" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 bike", sets: "1", reps: "30 min" },
          { name: "Mobility flow", sets: "1", reps: "20 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 2 (Power Development)",
      days: [
        { day: "Mon", title: "Lower Power", exercises: [
          { name: "Hang clean", sets: "5", reps: "3", load: "80%", note: "max bar speed" },
          { name: "Back squat", sets: "4", reps: "4", load: "78%" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "6", load: "RPE 7" },
          { name: "Pogo jumps", sets: "4", reps: "8", note: "reactive intent" },
        ]},
        { day: "Tue", title: "Upper Strength", exercises: [
          { name: "Bench press", sets: "4", reps: "5", load: "80%" },
          { name: "Weighted pull-up", shortName: "Pull-up", sets: "4", reps: "5", load: "BW+25" },
          { name: "DB row", sets: "3", reps: "10" },
          { name: "Face pulls", sets: "3", reps: "15" },
        ]},
        { day: "Wed", title: "Plyo + Sprint", exercises: [
          { name: "Box jumps", sets: "5", reps: "3", note: "full recovery" },
          { name: "Broad jumps", sets: "4", reps: "3" },
          { name: "10m flying sprints", shortName: "10m fly", sets: "6", reps: "1" },
          { name: "Tempo run", sets: "4", reps: "100m", load: "70%" },
        ]},
        { day: "Thu", title: "Lower Hypertrophy", exercises: [
          { name: "Front squat", sets: "4", reps: "6", load: "RPE 8" },
          { name: "Bulgarian split squat", shortName: "BSS", sets: "3", reps: "8/leg" },
          { name: "Hip thrust", sets: "3", reps: "10" },
          { name: "Calf raises", sets: "4", reps: "12" },
        ]},
        { day: "Fri", title: "Upper Power", exercises: [
          { name: "Push press", sets: "5", reps: "3", load: "75%", note: "max intent" },
          { name: "Weighted dip", sets: "4", reps: "6", load: "BW+45" },
          { name: "Med ball chest pass", shortName: "MB pass", sets: "4", reps: "5", note: "throw + reset" },
          { name: "Pull-aparts", sets: "3", reps: "20" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 bike", sets: "1", reps: "30 min" },
          { name: "Mobility flow", sets: "1", reps: "20 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 3 (Plyometric Ladder)",
      days: [
        { day: "Mon", title: "Reactive Lower", exercises: [
          { name: "Depth jumps", sets: "5", reps: "3", note: "12in box" },
          { name: "Trap-bar deadlift", shortName: "TB DL", sets: "4", reps: "3", load: "80%" },
          { name: "Single-leg RDL", shortName: "SL RDL", sets: "3", reps: "6/leg" },
          { name: "Hop matrix", sets: "4", reps: "6" },
        ]},
        { day: "Tue", title: "Upper Hypertrophy", exercises: [
          { name: "Incline DB bench", shortName: "Inc DB bench", sets: "4", reps: "8" },
          { name: "Weighted chin-up", shortName: "Chin-up", sets: "4", reps: "6" },
          { name: "Cable row", sets: "3", reps: "10" },
          { name: "Lateral raise", sets: "4", reps: "12" },
        ]},
        { day: "Wed", title: "Plyo Ladder", exercises: [
          { name: "Approach jumps", sets: "6", reps: "1", note: "max effort" },
          { name: "Bounding", sets: "4", reps: "20m" },
          { name: "Lateral skater hops", shortName: "Skaters", sets: "3", reps: "8/side" },
          { name: "Med ball overhead toss", shortName: "MB toss", sets: "4", reps: "5" },
        ]},
        { day: "Thu", title: "Posterior Hyper", exercises: [
          { name: "Romanian deadlift", shortName: "RDL", sets: "4", reps: "8", load: "RPE 7" },
          { name: "Hip thrust", sets: "4", reps: "8" },
          { name: "Glute-ham raise", shortName: "GHR", sets: "3", reps: "6" },
          { name: "Calf raises", sets: "4", reps: "10" },
        ]},
        { day: "Fri", title: "Upper Power", exercises: [
          { name: "Landmine push press", shortName: "Landmine PP", sets: "5", reps: "3", note: "speed" },
          { name: "Pull-up", sets: "4", reps: "6", load: "BW+30" },
          { name: "DB rear delt fly", shortName: "Rear fly", sets: "3", reps: "12" },
          { name: "Med ball slam", shortName: "MB slam", sets: "4", reps: "5" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 bike", sets: "1", reps: "30 min" },
          { name: "Mobility flow", sets: "1", reps: "20 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 4 (Peak)",
      days: [
        { day: "Mon", title: "Lower Peak", exercises: [
          { name: "Hang clean", sets: "5", reps: "2", load: "85%", note: "max intent" },
          { name: "Back squat", sets: "3", reps: "2", load: "85%" },
          { name: "Box jumps", sets: "4", reps: "2", note: "full recovery" },
        ]},
        { day: "Tue", title: "Upper Peak", exercises: [
          { name: "Bench press", sets: "4", reps: "3", load: "85%" },
          { name: "Weighted pull-up", shortName: "Pull-up", sets: "4", reps: "3", load: "BW+40" },
          { name: "Push-up clusters", shortName: "Push-ups", sets: "3", reps: "5" },
        ]},
        { day: "Wed", title: "Jump Session", exercises: [
          { name: "Approach jumps", sets: "6", reps: "1", note: "fresh legs" },
          { name: "Depth jumps", sets: "4", reps: "2" },
          { name: "10m sprint", sets: "5", reps: "1", note: "max effort" },
        ]},
        { day: "Thu", title: "Light Maintenance", exercises: [
          { name: "Front squat", sets: "3", reps: "3", load: "70%" },
          { name: "Single-leg hop", shortName: "SL hop", sets: "3", reps: "5/leg" },
          { name: "Hip thrust", sets: "3", reps: "6" },
        ]},
        { day: "Fri", title: "Test Day", exercises: [
          { name: "Standing vertical test", shortName: "Vert test", sets: "5", reps: "1" },
          { name: "Broad jump test", shortName: "Broad test", sets: "5", reps: "1" },
          { name: "Approach jump test", shortName: "App jump", sets: "3", reps: "1" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 bike", sets: "1", reps: "20 min" },
          { name: "Mobility flow", sets: "1", reps: "15 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
  ],
  kpis: [
    { name: "Standing vertical", baseline: "28\"",    target: "34\"",     measured: "Wk 1, 8, 16", primary: true },
    { name: "Broad jump",        baseline: "8'2\"",   target: "9'2\"",    measured: "Wk 1, 8, 16" },
    { name: "10m sprint",        baseline: "1.85s",   target: "1.72s",    measured: "Wk 1, 8, 16" },
    { name: "Back squat 1RM",    baseline: "315 lb",  target: "365 lb",   measured: "Wk 4, 8, 12, 16" },
  ],
};

const STRENGTH: Variant = {
  meta: {
    title: "Your 16-Week Strength & Hypertrophy Arc",
    horizon: "16 weeks",
    durationWeeks: 16,
    daysPerWeek: 5,
    sessionLength: "75 min",
  },
  rationale:
    "Block 1 establishes baseline volume tolerance and technique consistency across the main compound lifts. Block 2 progresses to mid-RIR hypertrophy with calculated volume landmarks (MEV → MAV) on every muscle group. Block 3 shifts to a heavy strength bias with intensification cycles and accessory hypertrophy minimums. The peak block tests 1RMs and sets the new baseline for the next arc. PRs measured at block boundaries.",
  blocks: [
    { name: "Volume Foundation", weeks: "Wk 1-4",   focus: "Technique, volume tolerance, MEV calibration",            weekStart: 1,  weekEnd: 4  },
    { name: "Hypertrophy",       weeks: "Wk 5-8",   focus: "MAV-driven volume, stretch-mediated growth, RIR control", weekStart: 5,  weekEnd: 8  },
    { name: "Strength Bias",     weeks: "Wk 9-12",  focus: "Heavy compound work, accessory hypertrophy minimums",     weekStart: 9,  weekEnd: 12 },
    { name: "Peak + Test",       weeks: "Wk 13-16", focus: "Intensification, deload, 1RM tests",                       weekStart: 13, weekEnd: 16 },
  ],
  defaultBlockIdx: 1,
  sampleWeeks: [
    {
      label: "Sample Week from Block 1 (Volume Foundation)",
      days: [
        { day: "Mon", title: "Upper Push", exercises: [
          { name: "Bench press", sets: "4", reps: "8", load: "RPE 6" },
          { name: "Incline DB press", shortName: "Inc DB", sets: "3", reps: "10" },
          { name: "Overhead triceps extension", shortName: "OH tri", sets: "3", reps: "12" },
          { name: "Lateral raise", sets: "3", reps: "15" },
        ]},
        { day: "Tue", title: "Lower", exercises: [
          { name: "Back squat", sets: "4", reps: "8", load: "RPE 6" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "10" },
          { name: "Leg press", sets: "3", reps: "12" },
          { name: "Calf raise", sets: "4", reps: "12" },
        ]},
        { day: "Wed", title: "Upper Pull", exercises: [
          { name: "Pull-up", sets: "4", reps: "8" },
          { name: "Chest-supported row", shortName: "CS row", sets: "3", reps: "10" },
          { name: "DB curl", sets: "3", reps: "12" },
          { name: "Face pulls", sets: "3", reps: "15" },
        ]},
        { day: "Thu", title: "Lower Posterior", exercises: [
          { name: "Conventional deadlift", shortName: "Deadlift", sets: "4", reps: "5", load: "RPE 7" },
          { name: "Hip thrust", sets: "3", reps: "10" },
          { name: "Leg curl", sets: "3", reps: "12" },
          { name: "Calf raise seated", shortName: "Seated calf", sets: "4", reps: "15" },
        ]},
        { day: "Fri", title: "Upper Mixed", exercises: [
          { name: "Overhead press", shortName: "OHP", sets: "4", reps: "8" },
          { name: "Cable row", sets: "3", reps: "10" },
          { name: "Lateral raise", sets: "3", reps: "15" },
          { name: "Rope pressdown", sets: "3", reps: "12" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 cardio", sets: "1", reps: "30 min" },
          { name: "Mobility flow", sets: "1", reps: "15 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 2 (Hypertrophy)",
      days: [
        { day: "Mon", title: "Push Volume", exercises: [
          { name: "Incline bench press", shortName: "Inc bench", sets: "4", reps: "8", load: "RPE 8" },
          { name: "Flat DB press", shortName: "DB bench", sets: "4", reps: "10" },
          { name: "Cable fly", sets: "3", reps: "12" },
          { name: "Lateral raise drop set", shortName: "LR drop", sets: "3", reps: "12+8+6" },
        ]},
        { day: "Tue", title: "Quad Volume", exercises: [
          { name: "Hack squat", sets: "4", reps: "10", load: "RPE 8" },
          { name: "Bulgarian split squat", shortName: "BSS", sets: "3", reps: "10/leg" },
          { name: "Leg extension", sets: "4", reps: "12" },
          { name: "Calf raise", sets: "5", reps: "12" },
        ]},
        { day: "Wed", title: "Pull Volume", exercises: [
          { name: "Weighted pull-up", shortName: "Pull-up", sets: "4", reps: "6", load: "BW+15" },
          { name: "Pendlay row", sets: "3", reps: "8" },
          { name: "Lat pulldown", sets: "3", reps: "12" },
          { name: "DB curl + hammer", shortName: "Curl/hammer", sets: "3", reps: "10+10" },
        ]},
        { day: "Thu", title: "Hamstring + Glute", exercises: [
          { name: "Romanian deadlift", shortName: "RDL", sets: "4", reps: "8", load: "RPE 8" },
          { name: "Hip thrust", sets: "4", reps: "10" },
          { name: "Lying leg curl", shortName: "Leg curl", sets: "4", reps: "12" },
          { name: "Calf raise seated", shortName: "Seated calf", sets: "4", reps: "15" },
        ]},
        { day: "Fri", title: "Shoulder + Arm", exercises: [
          { name: "Seated DB press", shortName: "DB OHP", sets: "4", reps: "8" },
          { name: "Cable lateral raise", shortName: "Cable LR", sets: "4", reps: "12" },
          { name: "Rear delt fly", shortName: "Rear fly", sets: "3", reps: "15" },
          { name: "Triceps + biceps superset", shortName: "Tri/bi", sets: "3", reps: "10+10" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 cardio", sets: "1", reps: "30 min" },
          { name: "Mobility flow", sets: "1", reps: "15 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 3 (Strength Bias)",
      days: [
        { day: "Mon", title: "Heavy Bench", exercises: [
          { name: "Bench press", sets: "5", reps: "3", load: "85%" },
          { name: "Close-grip bench", shortName: "CG bench", sets: "3", reps: "6" },
          { name: "Weighted dip", sets: "3", reps: "6", load: "BW+45" },
          { name: "Lateral raise", sets: "3", reps: "12" },
        ]},
        { day: "Tue", title: "Heavy Squat", exercises: [
          { name: "Back squat", sets: "5", reps: "3", load: "85%" },
          { name: "Front squat", sets: "3", reps: "5", load: "75%" },
          { name: "Leg curl", sets: "3", reps: "10" },
          { name: "Calf raise", sets: "4", reps: "12" },
        ]},
        { day: "Wed", title: "Pull Strength", exercises: [
          { name: "Weighted pull-up", shortName: "Pull-up", sets: "5", reps: "3", load: "BW+40" },
          { name: "Barbell row", sets: "4", reps: "6" },
          { name: "Cable row", sets: "3", reps: "10" },
          { name: "Barbell curl", sets: "3", reps: "8" },
        ]},
        { day: "Thu", title: "Heavy Deadlift", exercises: [
          { name: "Conventional deadlift", shortName: "Deadlift", sets: "5", reps: "3", load: "85%" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "6" },
          { name: "Hip thrust", sets: "3", reps: "8" },
        ]},
        { day: "Fri", title: "Press Strength", exercises: [
          { name: "Overhead press", shortName: "OHP", sets: "5", reps: "3", load: "85%" },
          { name: "Incline DB press", shortName: "Inc DB", sets: "3", reps: "8" },
          { name: "Lateral raise", sets: "3", reps: "12" },
          { name: "Triceps pressdown", shortName: "Pressdown", sets: "3", reps: "10" },
        ]},
        { day: "Sat", title: "Active Recovery", exercises: [
          { name: "Z2 cardio", sets: "1", reps: "30 min" },
          { name: "Mobility flow", sets: "1", reps: "15 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 4 (Peak + Test)",
      days: [
        { day: "Mon", title: "Bench Peak", exercises: [
          { name: "Bench press", sets: "4", reps: "2", load: "90%" },
          { name: "Paused bench", shortName: "Pause bench", sets: "3", reps: "3", load: "80%" },
          { name: "Triceps pressdown", shortName: "Pressdown", sets: "3", reps: "8" },
        ]},
        { day: "Tue", title: "Squat Peak", exercises: [
          { name: "Back squat", sets: "4", reps: "2", load: "90%" },
          { name: "Tempo squat", sets: "3", reps: "3", load: "70%" },
          { name: "Leg curl", sets: "3", reps: "10" },
        ]},
        { day: "Wed", title: "Light Pull", exercises: [
          { name: "Pull-up", sets: "4", reps: "5" },
          { name: "Cable row", sets: "3", reps: "10" },
        ]},
        { day: "Thu", title: "Deadlift Peak", exercises: [
          { name: "Conventional deadlift", shortName: "Deadlift", sets: "3", reps: "1", load: "92%" },
          { name: "Block pull", sets: "3", reps: "3" },
        ]},
        { day: "Fri", title: "Test Day", exercises: [
          { name: "Bench 1RM test", shortName: "Bench test", sets: "1", reps: "1" },
          { name: "Squat 1RM test", shortName: "Squat test", sets: "1", reps: "1" },
          { name: "Deadlift 1RM test", shortName: "DL test", sets: "1", reps: "1" },
        ]},
        { day: "Sat", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
  ],
  kpis: [
    { name: "Bench 1RM",     baseline: "225 lb",  target: "265 lb",  measured: "Wk 1, 8, 16", primary: true },
    { name: "Squat 1RM",     baseline: "315 lb",  target: "365 lb",  measured: "Wk 1, 8, 16", primary: true },
    { name: "Deadlift 1RM",  baseline: "405 lb",  target: "455 lb",  measured: "Wk 1, 8, 16" },
    { name: "Body weight",   baseline: "180 lb",  target: "188 lb",  measured: "weekly" },
  ],
};

const AESTHETIC: Variant = {
  meta: {
    title: "Your 16-Week Physique Arc",
    horizon: "16 weeks",
    durationWeeks: 16,
    daysPerWeek: 6,
    sessionLength: "75 min",
  },
  rationale:
    "A V-taper-driven build: shoulders, back width, and chest get the highest stimulus while waist work emphasizes function over thickness. Block 1 builds the work capacity needed for the high-frequency phases ahead. Block 2 layers in stretch-mediated hypertrophy with controlled eccentrics on every showcase muscle. Block 3 is the brutal volume peak. Block 4 cuts volume but keeps intensity to sharpen separation. Caliper + photo checks every 4 weeks.",
  blocks: [
    { name: "Capacity",        weeks: "Wk 1-4",   focus: "Work capacity, mind-muscle, baseline volume",         weekStart: 1,  weekEnd: 4  },
    { name: "Stretch Bias",    weeks: "Wk 5-8",   focus: "Lengthened-position emphasis, slow eccentrics",        weekStart: 5,  weekEnd: 8  },
    { name: "Volume Peak",     weeks: "Wk 9-12",  focus: "MRV territory, drop sets, intensifiers",              weekStart: 9,  weekEnd: 12 },
    { name: "Refine + Reveal", weeks: "Wk 13-16", focus: "Volume taper, intensity hold, conditioning add-in",   weekStart: 13, weekEnd: 16 },
  ],
  defaultBlockIdx: 1,
  sampleWeeks: [
    {
      label: "Sample Week from Block 1 (Capacity)",
      days: [
        { day: "Mon", title: "Chest", exercises: [
          { name: "Incline DB press", shortName: "Inc DB", sets: "4", reps: "10" },
          { name: "Flat DB press", shortName: "DB bench", sets: "3", reps: "12" },
          { name: "Cable fly low-to-high", shortName: "Low fly", sets: "3", reps: "12" },
          { name: "Push-up burnout", shortName: "Push-ups", sets: "2", reps: "AMRAP" },
        ]},
        { day: "Tue", title: "Back", exercises: [
          { name: "Lat pulldown", sets: "4", reps: "10" },
          { name: "Chest-supported row", shortName: "CS row", sets: "4", reps: "10" },
          { name: "Cable pullover", sets: "3", reps: "12" },
          { name: "Face pulls", sets: "3", reps: "15" },
        ]},
        { day: "Wed", title: "Legs", exercises: [
          { name: "Leg press", sets: "4", reps: "12" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "10" },
          { name: "Leg extension", sets: "3", reps: "15" },
          { name: "Calf raise", sets: "4", reps: "12" },
        ]},
        { day: "Thu", title: "Shoulders", exercises: [
          { name: "Seated DB press", shortName: "DB OHP", sets: "4", reps: "10" },
          { name: "Lateral raise", sets: "4", reps: "12" },
          { name: "Rear delt fly", shortName: "Rear fly", sets: "3", reps: "15" },
          { name: "Shrug", sets: "3", reps: "12" },
        ]},
        { day: "Fri", title: "Arms", exercises: [
          { name: "EZ-bar curl", sets: "4", reps: "10" },
          { name: "Hammer curl", sets: "3", reps: "12" },
          { name: "Triceps pressdown", shortName: "Pressdown", sets: "4", reps: "12" },
          { name: "Overhead triceps", shortName: "OH tri", sets: "3", reps: "12" },
        ]},
        { day: "Sat", title: "Legs Posterior", exercises: [
          { name: "Hip thrust", sets: "4", reps: "10" },
          { name: "Leg curl", sets: "4", reps: "12" },
          { name: "Calf raise seated", shortName: "Seated calf", sets: "4", reps: "15" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 2 (Stretch Bias)",
      days: [
        { day: "Mon", title: "Chest Stretch", exercises: [
          { name: "Deep-stretch DB fly", shortName: "DB fly", sets: "4", reps: "10", note: "3s eccentric" },
          { name: "Incline DB press", shortName: "Inc DB", sets: "4", reps: "10" },
          { name: "Pec deck", sets: "3", reps: "12" },
          { name: "Cable fly high", shortName: "High fly", sets: "3", reps: "12" },
        ]},
        { day: "Tue", title: "Back Stretch", exercises: [
          { name: "Cable pullover", sets: "4", reps: "10", note: "lengthen" },
          { name: "Single-arm lat pulldown", shortName: "SA pulldown", sets: "4", reps: "10/side" },
          { name: "Seal row", sets: "3", reps: "10" },
          { name: "Reverse fly", sets: "3", reps: "15" },
        ]},
        { day: "Wed", title: "Leg Stretch", exercises: [
          { name: "Bulgarian split squat", shortName: "BSS", sets: "4", reps: "10/leg" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "4", reps: "10" },
          { name: "Sissy squat", sets: "3", reps: "12" },
          { name: "Calf raise", sets: "4", reps: "12" },
        ]},
        { day: "Thu", title: "Shoulder Stretch", exercises: [
          { name: "Cable Y-raise", shortName: "Y-raise", sets: "4", reps: "12" },
          { name: "Behind-the-back cable raise", shortName: "BTB raise", sets: "4", reps: "12" },
          { name: "Rear delt fly", shortName: "Rear fly", sets: "3", reps: "15" },
          { name: "Face pulls", sets: "3", reps: "15" },
        ]},
        { day: "Fri", title: "Arm Stretch", exercises: [
          { name: "Incline DB curl", shortName: "Inc curl", sets: "4", reps: "10" },
          { name: "Overhead cable curl", shortName: "OH curl", sets: "3", reps: "12" },
          { name: "Overhead triceps extension", shortName: "OH tri", sets: "4", reps: "10" },
          { name: "Cross-body cable curl", shortName: "Cross curl", sets: "3", reps: "12" },
        ]},
        { day: "Sat", title: "Glute Stretch", exercises: [
          { name: "Hip thrust", sets: "4", reps: "10" },
          { name: "B-stance RDL", sets: "3", reps: "10/leg" },
          { name: "Cable kickback", shortName: "Kickback", sets: "3", reps: "12" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 3 (Volume Peak)",
      days: [
        { day: "Mon", title: "Chest MRV", exercises: [
          { name: "Incline bench press", shortName: "Inc bench", sets: "5", reps: "8" },
          { name: "Flat DB press", shortName: "DB bench", sets: "4", reps: "10" },
          { name: "Pec deck drop set", shortName: "Pec drop", sets: "3", reps: "12+8+6" },
          { name: "Cable fly", sets: "4", reps: "12" },
        ]},
        { day: "Tue", title: "Back MRV", exercises: [
          { name: "Pull-up", sets: "5", reps: "8" },
          { name: "Pendlay row", sets: "4", reps: "8" },
          { name: "Lat pulldown drop", shortName: "Pulldown drop", sets: "3", reps: "10+8+6" },
          { name: "Cable pullover", sets: "4", reps: "12" },
        ]},
        { day: "Wed", title: "Leg MRV", exercises: [
          { name: "Hack squat", sets: "5", reps: "8" },
          { name: "Leg press", sets: "4", reps: "12" },
          { name: "Leg extension drop", shortName: "LE drop", sets: "3", reps: "12+8+6" },
          { name: "Calf raise", sets: "5", reps: "12" },
        ]},
        { day: "Thu", title: "Shoulder MRV", exercises: [
          { name: "Seated DB press", shortName: "DB OHP", sets: "5", reps: "8" },
          { name: "Cable lateral raise", shortName: "Cable LR", sets: "4", reps: "12" },
          { name: "Lateral raise drop", shortName: "LR drop", sets: "3", reps: "12+8+6" },
          { name: "Rear delt fly", shortName: "Rear fly", sets: "4", reps: "15" },
        ]},
        { day: "Fri", title: "Arm MRV", exercises: [
          { name: "Barbell curl", sets: "5", reps: "8" },
          { name: "Hammer curl", sets: "4", reps: "10" },
          { name: "Skullcrusher", sets: "5", reps: "8" },
          { name: "Pressdown drop", shortName: "PD drop", sets: "3", reps: "12+8+6" },
        ]},
        { day: "Sat", title: "Glute MRV", exercises: [
          { name: "Hip thrust", sets: "5", reps: "8" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "4", reps: "10" },
          { name: "Cable kickback", shortName: "Kickback", sets: "3", reps: "12" },
          { name: "Lying leg curl", shortName: "Leg curl", sets: "4", reps: "12" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 4 (Refine + Reveal)",
      days: [
        { day: "Mon", title: "Chest + Tri", exercises: [
          { name: "Incline DB press", shortName: "Inc DB", sets: "3", reps: "8" },
          { name: "Cable fly", sets: "3", reps: "12" },
          { name: "Pressdown", sets: "3", reps: "10" },
        ]},
        { day: "Tue", title: "Back + Bi", exercises: [
          { name: "Pull-up", sets: "3", reps: "8" },
          { name: "Cable row", sets: "3", reps: "10" },
          { name: "Incline curl", shortName: "Inc curl", sets: "3", reps: "10" },
        ]},
        { day: "Wed", title: "Legs Light", exercises: [
          { name: "Leg press", sets: "3", reps: "12" },
          { name: "Leg curl", sets: "3", reps: "12" },
          { name: "Calf raise", sets: "4", reps: "12" },
        ]},
        { day: "Thu", title: "Shoulders + Core", exercises: [
          { name: "DB lateral raise", shortName: "DB LR", sets: "4", reps: "12" },
          { name: "Rear delt fly", shortName: "Rear fly", sets: "3", reps: "15" },
          { name: "Cable crunch", sets: "3", reps: "15" },
        ]},
        { day: "Fri", title: "Conditioning", exercises: [
          { name: "Stairmaster intervals", shortName: "Stairs", sets: "1", reps: "20 min" },
          { name: "Vacuum + posing", shortName: "Posing", sets: "1", reps: "15 min" },
        ]},
        { day: "Sat", title: "Glute Pump", exercises: [
          { name: "Hip thrust", sets: "4", reps: "10" },
          { name: "Kickback", sets: "3", reps: "15" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
  ],
  kpis: [
    { name: "Shoulder width",  baseline: "20 in",   target: "22 in",   measured: "Wk 1, 8, 16", primary: true },
    { name: "Waist",           baseline: "32 in",   target: "31 in",   measured: "weekly" },
    { name: "Body fat %",      baseline: "15%",     target: "10%",     measured: "Wk 1, 8, 16" },
    { name: "Lean mass",       baseline: "153 lb",  target: "158 lb",  measured: "Wk 1, 8, 16" },
  ],
};

const HYBRID: Variant = {
  meta: {
    title: "Your 16-Week Hybrid Arc",
    horizon: "16 weeks",
    durationWeeks: 16,
    daysPerWeek: 6,
    sessionLength: "75 min",
  },
  rationale:
    "Both pillars in parallel — strength sessions stay short and heavy while endurance work builds aerobic base in Block 1, sharpens with VO2max work in Block 2, and tests in Block 4. Block 3 is the brutal middle where strength holds and endurance peaks. Modalities are separated AM/PM where possible to protect recovery. Tested KPIs: a heavy lift, a Zone 2 baseline, and a VO2max proxy.",
  blocks: [
    { name: "Base Build",     weeks: "Wk 1-4",   focus: "Zone 2 aerobic base, strength foundation",      weekStart: 1,  weekEnd: 4  },
    { name: "VO2max Sharpen", weeks: "Wk 5-8",   focus: "Intervals, sub-threshold work, strength hold",  weekStart: 5,  weekEnd: 8  },
    { name: "Peak Endurance", weeks: "Wk 9-12",  focus: "Long sessions + strength minimums",              weekStart: 9,  weekEnd: 12 },
    { name: "Sharpen + Test", weeks: "Wk 13-16", focus: "Taper, race-pace work, strength + run tests",   weekStart: 13, weekEnd: 16 },
  ],
  defaultBlockIdx: 1,
  sampleWeeks: [
    {
      label: "Sample Week from Block 1 (Base Build)",
      days: [
        { day: "Mon", title: "Strength Lower", exercises: [
          { name: "Back squat", sets: "4", reps: "6", load: "RPE 7" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "8" },
          { name: "Walking lunge", sets: "3", reps: "10/leg" },
        ]},
        { day: "Tue", title: "Z2 Run", exercises: [
          { name: "Zone 2 easy run", shortName: "Z2 run", sets: "1", reps: "45 min" },
          { name: "Mobility flow", sets: "1", reps: "10 min" },
        ]},
        { day: "Wed", title: "Strength Upper", exercises: [
          { name: "Bench press", sets: "4", reps: "6", load: "RPE 7" },
          { name: "Pull-up", sets: "4", reps: "6" },
          { name: "DB OHP", sets: "3", reps: "8" },
        ]},
        { day: "Thu", title: "Z2 Bike", exercises: [
          { name: "Zone 2 bike", shortName: "Z2 bike", sets: "1", reps: "60 min" },
        ]},
        { day: "Fri", title: "Strength Full", exercises: [
          { name: "Conventional deadlift", shortName: "Deadlift", sets: "4", reps: "5", load: "RPE 7" },
          { name: "Weighted carry", shortName: "Carry", sets: "3", reps: "40m" },
          { name: "DB row", sets: "3", reps: "10" },
        ]},
        { day: "Sat", title: "Long Run", exercises: [
          { name: "Long easy run", shortName: "Long run", sets: "1", reps: "75 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 2 (VO2max Sharpen)",
      days: [
        { day: "Mon", title: "Strength Lower", exercises: [
          { name: "Back squat", sets: "5", reps: "5", load: "RPE 8" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "6" },
          { name: "Calf raise", sets: "4", reps: "10" },
        ]},
        { day: "Tue", title: "VO2 Intervals", exercises: [
          { name: "4x4 min @ VO2", shortName: "4x4", sets: "4", reps: "4 min", note: "4 min rest" },
          { name: "Cool-down jog", shortName: "Cool", sets: "1", reps: "10 min" },
        ]},
        { day: "Wed", title: "Strength Upper", exercises: [
          { name: "Bench press", sets: "5", reps: "5", load: "RPE 8" },
          { name: "Pull-up", sets: "4", reps: "6", load: "BW+10" },
          { name: "DB OHP", sets: "3", reps: "8" },
        ]},
        { day: "Thu", title: "Tempo Bike", exercises: [
          { name: "Sub-threshold bike", shortName: "Sub-T bike", sets: "1", reps: "40 min" },
        ]},
        { day: "Fri", title: "Strength Full", exercises: [
          { name: "Conventional deadlift", shortName: "Deadlift", sets: "5", reps: "3", load: "85%" },
          { name: "Weighted carry", shortName: "Carry", sets: "3", reps: "40m" },
          { name: "DB row", sets: "3", reps: "10" },
        ]},
        { day: "Sat", title: "Long Easy", exercises: [
          { name: "Long easy run", shortName: "Long run", sets: "1", reps: "90 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 3 (Peak Endurance)",
      days: [
        { day: "Mon", title: "Strength Min", exercises: [
          { name: "Back squat", sets: "3", reps: "5", load: "RPE 7" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "3", reps: "6" },
        ]},
        { day: "Tue", title: "Threshold Run", exercises: [
          { name: "2x20 min @ threshold", shortName: "2x20", sets: "2", reps: "20 min", note: "5 min rest" },
          { name: "Cool-down jog", shortName: "Cool", sets: "1", reps: "10 min" },
        ]},
        { day: "Wed", title: "Strength Min", exercises: [
          { name: "Bench press", sets: "3", reps: "5" },
          { name: "Pull-up", sets: "3", reps: "6" },
        ]},
        { day: "Thu", title: "Long Bike", exercises: [
          { name: "Long Z2 bike", shortName: "Long bike", sets: "1", reps: "120 min" },
        ]},
        { day: "Fri", title: "Strength Full", exercises: [
          { name: "Conventional deadlift", shortName: "Deadlift", sets: "3", reps: "5" },
          { name: "Weighted carry", shortName: "Carry", sets: "3", reps: "40m" },
        ]},
        { day: "Sat", title: "Race Sim Long", exercises: [
          { name: "Long progression run", shortName: "Prog run", sets: "1", reps: "120 min" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
    {
      label: "Sample Week from Block 4 (Sharpen + Test)",
      days: [
        { day: "Mon", title: "Strength Light", exercises: [
          { name: "Back squat", sets: "3", reps: "3", load: "75%" },
          { name: "Romanian deadlift", shortName: "RDL", sets: "2", reps: "5" },
        ]},
        { day: "Tue", title: "Race Pace", exercises: [
          { name: "8x400m race pace", shortName: "8x400", sets: "8", reps: "400m" },
        ]},
        { day: "Wed", title: "Light Upper", exercises: [
          { name: "Bench press", sets: "3", reps: "3", load: "75%" },
          { name: "Pull-up", sets: "3", reps: "5" },
        ]},
        { day: "Thu", title: "Tempo Spin", exercises: [
          { name: "Tempo bike", shortName: "Tempo", sets: "1", reps: "30 min" },
        ]},
        { day: "Fri", title: "Strength Test", exercises: [
          { name: "Squat 3RM test", shortName: "Squat test", sets: "1", reps: "3" },
          { name: "Bench 3RM test", shortName: "Bench test", sets: "1", reps: "3" },
        ]},
        { day: "Sat", title: "Test Long Run", exercises: [
          { name: "10K time trial", shortName: "10K TT", sets: "1", reps: "10 km" },
        ]},
        { day: "Sun", title: "Rest", rest: true, exercises: [{ name: "Full rest" }] },
      ],
    },
  ],
  kpis: [
    { name: "5K time",       baseline: "22:30",   target: "20:00",   measured: "Wk 1, 8, 16", primary: true },
    { name: "Squat 1RM",     baseline: "315 lb",  target: "335 lb",  measured: "Wk 1, 8, 16" },
    { name: "Z2 HR pace",    baseline: "9:15/mi", target: "8:30/mi", measured: "weekly" },
    { name: "VO2max proxy",  baseline: "48",      target: "54",      measured: "Wk 1, 8, 16" },
  ],
};

const VARIANTS: Record<CoachCategory, Variant> = {
  strength:  STRENGTH,
  athletic:  ATHLETIC,
  aesthetic: AESTHETIC,
  hybrid:    HYBRID,
};

// ─── Variant selection ─────────────────────────────────────────────────────

/**
 * Tally selected coaches by category, return the dominant one (ties broken by
 * declaration order in CATEGORIES).
 */
export function dominantCategory(coaches: Coach[]): CoachCategory {
  const counts: Record<CoachCategory, number> = {
    strength: 0, athletic: 0, aesthetic: 0, hybrid: 0,
  };
  for (const c of coaches) counts[c.category]++;
  const order: CoachCategory[] = ["strength", "athletic", "aesthetic", "hybrid"];
  let best: CoachCategory = "athletic";
  let bestN = -1;
  for (const cat of order) {
    if (counts[cat] > bestN) { best = cat; bestN = counts[cat]; }
  }
  return best;
}

/**
 * Goal-driven KPI override: marks one KPI primary based on the athlete's top
 * goal when the variant's default primary doesn't align.
 */
function markPrimaryByGoal(kpis: SamplePlanKPI[], goals: GoalKey[]): SamplePlanKPI[] {
  if (goals.length === 0) return kpis;
  const goal = goals[0];
  const hints: Partial<Record<GoalKey, RegExp>> = {
    "jump-higher":   /vertical|jump|vert/i,
    "run-faster":    /sprint|10m|5k|10k|run|pace/i,
    "stronger":      /1rm|squat|bench|deadlift/i,
    "build-muscle":  /lean|mass|hypertrophy/i,
    "look-ripped":   /body fat|waist|shoulder/i,
    "more-flexible": /mobility|flex/i,
    "longevity":     /vo2|z2|hr/i,
    "sport-prep":    /vertical|sprint|broad/i,
    "hybrid":        /vo2|5k|squat/i,
  };
  const re = hints[goal];
  if (!re) return kpis;
  let matched = false;
  return kpis.map((k) => {
    if (!matched && re.test(k.name)) {
      matched = true;
      return { ...k, primary: true };
    }
    return { ...k, primary: false };
  });
}

/**
 * Build a SamplePlan for the selected coaches + goals.
 *
 * Variant chosen by dominant category. Block "source" attributions are filled
 * from real selected coach names (round-robin so each block credits someone).
 */
export function buildSamplePlan(coaches: Coach[], goals: GoalKey[] = []): SamplePlan {
  const category = coaches.length > 0 ? dominantCategory(coaches) : "athletic";
  const variant = VARIANTS[category];

  const names = coaches.length > 0 ? coaches.map((c) => c.name) : ["Your coaches"];
  const blocks: SamplePlanBlock[] = variant.blocks.map((b, i) => ({
    ...b,
    source: names[i % names.length],
  }));

  return {
    meta: variant.meta,
    rationale: variant.rationale,
    blocks,
    sampleWeeks: variant.sampleWeeks,
    defaultBlockIdx: variant.defaultBlockIdx,
    kpis: markPrimaryByGoal(variant.kpis, goals),
  };
}

// Back-compat default export — used by code paths that don't yet pass coaches.
export const SAMPLE_PLAN: SamplePlan = buildSamplePlan([]);
