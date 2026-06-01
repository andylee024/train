/**
 * Coach profile extras — principles, weekly structure with full sessions,
 * sample videos. Keyed by coach id. Used by the profile page and compare.
 */

export type Principle = { title: string; body: string };
export type SampleVideo = { title: string; duration: string; views: string };

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
  "jeff-nippard": {
    principles: [
      { title: "RIR-based progression", body: "Top sets are calibrated to reps in reserve. Push effort up across a mesocycle, then deload before form breaks." },
      { title: "Volume landmarks per muscle", body: "Each muscle has its own MV / MEV / MAV / MRV. Programming hits the sweet spot, never the ceiling." },
      { title: "Exercise selection by mechanism", body: "Picks favor lengthened-position bias, stable resistance profiles, and movements with the highest hypertrophy-per-rep yield." },
      { title: "Specificity over novelty", body: "Big six lifts anchor every block. Variation is a tool, not a default." },
    ],
    weekStructure: [
      {
        name: "Push", duration: "~75 min",
        exercises: [
          { name: "Smith Machine Bench Press", sets: 3, reps: "6-8", load: "RPE 8", rest: "3 min", note: "lengthened bias" },
          { name: "Standing DB Overhead Press", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Incline DB Press", sets: 3, reps: "10-12", load: "RPE 9", rest: "2 min" },
          { name: "Cable Tricep Pushdown", sets: 3, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "Cable Lateral Raise", sets: 3, reps: "12-15", load: "RPE 10", rest: "60s", note: "drop set on last" },
        ],
      },
      {
        name: "Pull", duration: "~75 min",
        exercises: [
          { name: "Weighted Pull-up", sets: 3, reps: "5-7", load: "RPE 8", rest: "3 min" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", load: "RPE 9", rest: "2 min", note: "lengthened bias" },
          { name: "Incline DB Curl", sets: 3, reps: "10-12", load: "RPE 9", rest: "90s" },
          { name: "Cable Reverse Fly", sets: 3, reps: "15-20", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~80 min",
        exercises: [
          { name: "Back Squat", sets: 3, reps: "5-7", load: "RPE 8", rest: "3 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", load: "RPE 9", rest: "90s" },
          { name: "Leg Curl (lying)", sets: 3, reps: "10-12", load: "RPE 9", rest: "90s", note: "lengthened bias" },
          { name: "Standing Calf Raise", sets: 3, reps: "12-15", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Push", duration: "~75 min",
        exercises: [
          { name: "Incline Smith Bench Press", sets: 3, reps: "8-10", load: "RPE 8", rest: "3 min" },
          { name: "Machine Shoulder Press", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Pec Deck", sets: 3, reps: "12-15", load: "RPE 9", rest: "90s", note: "stretch emphasis" },
          { name: "Overhead Cable Tri Ext", sets: 3, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "Cable Lateral Raise", sets: 3, reps: "15-20", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Pull", duration: "~75 min",
        exercises: [
          { name: "Pendlay Row", sets: 3, reps: "6-8", load: "RPE 8", rest: "3 min" },
          { name: "Pulldown (wide grip)", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Cable Pullover", sets: 3, reps: "12-15", load: "RPE 9", rest: "90s", note: "lengthened bias" },
          { name: "Hammer Curl", sets: 3, reps: "10-12", load: "RPE 9", rest: "90s" },
          { name: "Face Pull", sets: 3, reps: "15-20", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~80 min",
        exercises: [
          { name: "Front Squat", sets: 3, reps: "6-8", load: "RPE 8", rest: "3 min" },
          { name: "Hip Thrust", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Walking Lunge", sets: 3, reps: "10-12/leg", load: "RPE 9", rest: "90s" },
          { name: "Seated Leg Curl", sets: 3, reps: "10-12", load: "RPE 9", rest: "90s" },
          { name: "Seated Calf Raise", sets: 3, reps: "12-15", load: "RPE 10", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "The Most Scientific Push Workout (Chest/Shoulders/Triceps)", duration: "14:21", views: "3.2M" },
      { title: "How To Build Muscle: Explained In 5 Levels",                  duration: "11:08", views: "2.7M" },
      { title: "The Optimal Training Volume To Build Muscle",                  duration: "12:47", views: "1.9M" },
    ],
  },

  "mike-israetel": {
    principles: [
      { title: "Mesocycle structure", body: "4-week accumulation block where sets-per-muscle climbs week to week, capped by a deload." },
      { title: "Junk volume is real", body: "Sets that don't hit a hard set count or proximity to failure don't move the needle. Cut them." },
      { title: "Stimulus-to-fatigue ratio", body: "Every exercise gets evaluated by how much growth it causes vs. how much recovery it taxes." },
      { title: "Exercise variation by mesocycle", body: "Swap movements between blocks to keep the stimulus novel without losing specificity." },
    ],
    weekStructure: [
      {
        name: "Chest/Back", duration: "~80 min",
        exercises: [
          { name: "Incline DB Press", sets: 4, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Chest-Supported T-Bar Row", sets: 4, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Pec Deck", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s", note: "stretch + squeeze" },
          { name: "Lat Pulldown", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Cable Crossover (low to high)", sets: 3, reps: "15-20", load: "RIR 0", rest: "60s" },
          { name: "Straight-Arm Pullover", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
        ],
      },
      {
        name: "Legs", duration: "~85 min",
        exercises: [
          { name: "Hack Squat", sets: 4, reps: "8-10", load: "RIR 2", rest: "3 min", note: "high foot for quads" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Leg Press (close stance)", sets: 3, reps: "12-15", load: "RIR 1", rest: "2 min" },
          { name: "Lying Leg Curl", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Leg Extension", sets: 3, reps: "15-20", load: "RIR 0", rest: "90s", note: "myo-rep last set" },
          { name: "Standing Calf Raise", sets: 4, reps: "10-12", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Arms/Shoulders", duration: "~70 min",
        exercises: [
          { name: "DB Shoulder Press", sets: 4, reps: "8-10", load: "RIR 2", rest: "2 min" },
          { name: "Cable Lateral Raise", sets: 4, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "EZ-Bar Curl", sets: 3, reps: "10-12", load: "RIR 1", rest: "90s" },
          { name: "Rope Tricep Pushdown", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Incline DB Curl", sets: 3, reps: "10-12", load: "RIR 0", rest: "90s", note: "lengthened bias" },
          { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Chest/Back", duration: "~80 min",
        exercises: [
          { name: "Flat DB Press", sets: 4, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Lat Pulldown (neutral)", sets: 4, reps: "8-10", load: "RIR 2", rest: "2-3 min" },
          { name: "Cable Fly (mid-chest)", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Seated Cable Row", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Smith Incline Press", sets: 3, reps: "12-15", load: "RIR 0", rest: "90s" },
          { name: "Single-Arm Cable Row", sets: 3, reps: "12-15", load: "RIR 1", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~85 min",
        exercises: [
          { name: "Front Squat", sets: 4, reps: "6-8", load: "RIR 2", rest: "3 min" },
          { name: "Hip Thrust", sets: 3, reps: "8-10", load: "RIR 2", rest: "2 min" },
          { name: "Walking Lunge", sets: 3, reps: "10-12/leg", load: "RIR 1", rest: "2 min" },
          { name: "Seated Leg Curl", sets: 3, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Sissy Squat", sets: 3, reps: "10-12", load: "BW", rest: "90s" },
          { name: "Seated Calf Raise", sets: 4, reps: "12-15", load: "RIR 0", rest: "60s" },
        ],
      },
      {
        name: "Arms/Shoulders", duration: "~70 min",
        exercises: [
          { name: "Machine Shoulder Press", sets: 4, reps: "8-10", load: "RIR 2", rest: "2 min" },
          { name: "Reverse Pec Deck", sets: 4, reps: "12-15", load: "RIR 1", rest: "90s" },
          { name: "Preacher Curl", sets: 3, reps: "10-12", load: "RIR 1", rest: "90s" },
          { name: "Cable Tricep Kickback", sets: 3, reps: "12-15", load: "RIR 0", rest: "90s" },
          { name: "Cable Curl (bilateral)", sets: 3, reps: "12-15", load: "RIR 0", rest: "60s" },
          { name: "Skull Crusher (DB)", sets: 3, reps: "10-12", load: "RIR 1", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "How Many Sets Per Muscle Per Week (Latest Research)", duration: "18:32", views: "1.4M" },
      { title: "The Perfect Mesocycle for Maximum Gains",              duration: "21:15", views: "980K" },
      { title: "Junk Volume: The Sets That Are Killing Your Gains",    duration: "15:44", views: "1.1M" },
    ],
  },

  "athlean-x": {
    principles: [
      { title: "Joint integrity first", body: "Warm-ups address common dysfunctions (scap, hips, t-spine) before any heavy load." },
      { title: "Function dictates exercise selection", body: "Movements chosen for athletic carryover, not just muscle isolation." },
      { title: "Unilateral work in every session", body: "Single-limb training to surface and correct asymmetries that cause long-term injury." },
      { title: "Eccentric emphasis", body: "Slow lowering phases for tendon resilience and protective hypertrophy around vulnerable joints." },
    ],
    weekStructure: [
      {
        name: "Push", duration: "~70 min",
        exercises: [
          { name: "Scap Push-up + Y-W-T Wall", sets: 2, reps: "10 each", load: "BW", rest: "60s", note: "warm-up" },
          { name: "Landmine Press (single-arm)", sets: 4, reps: "6-8/arm", load: "Heavy", rest: "2 min", note: "core anti-rotation" },
          { name: "Incline DB Press", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Single-Arm Cable Crossover", sets: 3, reps: "10-12/arm", load: "Moderate", rest: "90s" },
          { name: "DB Tricep Skull Crusher", sets: 3, reps: "10-12", load: "RPE 8", rest: "90s", note: "3s eccentric" },
          { name: "TKE (terminal knee ext) bonus", sets: 2, reps: "15/leg", load: "Band", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~75 min",
        exercises: [
          { name: "Hip 90/90 + Couch Stretch", sets: 2, reps: "60s each", load: "BW", rest: "30s", note: "warm-up" },
          { name: "Barbell Back Squat", sets: 4, reps: "5-8", load: "RPE 8", rest: "3 min" },
          { name: "Single-Leg RDL", sets: 3, reps: "8-10/leg", load: "DBs", rest: "2 min", note: "balance + posterior chain" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10/leg", load: "RPE 8", rest: "90s" },
          { name: "Nordic Curl (assisted)", sets: 3, reps: "6-8", load: "BW", rest: "2 min", note: "5s eccentric" },
          { name: "Standing Calf Raise (single leg)", sets: 3, reps: "12-15/leg", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Pull", duration: "~70 min",
        exercises: [
          { name: "Band Pull-Apart + Scap Pull-up", sets: 2, reps: "12 each", load: "BW/Band", rest: "60s", note: "warm-up" },
          { name: "Weighted Pull-up", sets: 4, reps: "5-7", load: "RPE 8", rest: "2-3 min" },
          { name: "Single-Arm DB Row", sets: 3, reps: "8-10/arm", load: "Heavy", rest: "90s" },
          { name: "Face Pull (3-way)", sets: 4, reps: "12-15", load: "Light", rest: "60s", note: "external rotation" },
          { name: "Incline DB Curl", sets: 3, reps: "10-12", load: "RPE 8", rest: "90s", note: "3s eccentric" },
          { name: "Forearm Roller", sets: 2, reps: "Up/down x2", load: "Light", rest: "60s" },
        ],
      },
      {
        name: "Conditioning", duration: "~30 min",
        exercises: [
          { name: "Jump Rope", sets: 5, reps: "60s", load: "BW", rest: "30s", note: "warm-up + ankle prep" },
          { name: "KB Swing", sets: 5, reps: "20", load: "Heavy KB", rest: "60s" },
          { name: "Sled Push (low handle)", sets: 5, reps: "20m", load: "Heavy", rest: "90s" },
          { name: "Battle Rope", sets: 5, reps: "30s on", load: "—", rest: "30s off" },
        ],
      },
      {
        name: "Push", duration: "~70 min",
        exercises: [
          { name: "Wall Slide + Scap Push", sets: 2, reps: "10 each", load: "BW", rest: "60s", note: "warm-up" },
          { name: "Barbell Bench Press", sets: 4, reps: "5-7", load: "RPE 8", rest: "3 min" },
          { name: "DB Z-Press (seated)", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Dip (weighted if able)", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Cable Lateral Raise", sets: 3, reps: "12-15/arm", load: "RPE 9", rest: "60s" },
          { name: "Plank w/ Reach", sets: 3, reps: "8/side", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Pull", duration: "~70 min",
        exercises: [
          { name: "Dead Hang + Scap Pull", sets: 2, reps: "30s + 8", load: "BW", rest: "60s", note: "warm-up" },
          { name: "Conventional Deadlift", sets: 4, reps: "3-5", load: "RPE 8", rest: "3 min" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10", load: "RPE 8", rest: "90s" },
          { name: "Single-Arm Pulldown", sets: 3, reps: "10-12/arm", load: "Moderate", rest: "90s" },
          { name: "Hammer Curl", sets: 3, reps: "10-12", load: "RPE 8", rest: "90s" },
          { name: "Farmer Carry", sets: 3, reps: "30m", load: "Heavy DBs", rest: "90s" },
        ],
      },
      {
        name: "Mobility", duration: "~30 min",
        exercises: [
          { name: "Cat-Cow + Bird Dog", sets: 2, reps: "10 each", load: "BW", rest: "30s" },
          { name: "World's Greatest Stretch", sets: 2, reps: "5/side", load: "BW", rest: "30s" },
          { name: "Couch Stretch + Hip Flexor", sets: 2, reps: "60s/side", load: "BW", rest: "—" },
          { name: "T-Spine Rotation (open book)", sets: 2, reps: "10/side", load: "BW", rest: "—" },
          { name: "Easy Walk", sets: 1, reps: "20 min", load: "—", rest: "—" },
        ],
      },
    ],
    videos: [
      { title: "The Perfect Push Workout (BIGGER & STRONGER!)",         duration: "12:02", views: "8.4M" },
      { title: "Stop Doing Face Pulls Like This!",                      duration: "7:18",  views: "4.1M" },
      { title: "The 6 Best Exercises for Bigger Arms (NO MORE CURLS)",  duration: "13:55", views: "11.2M" },
    ],
  },

  "p3": {
    principles: [
      { title: "Diagnose before prescribing", body: "Movement screen first — identify the asymmetry or capacity gap before adding load." },
      { title: "Force in vs. force out", body: "Build eccentric capacity to absorb force, then concentric capacity to redirect it." },
      { title: "Plyometric ladder", body: "Progress from low-intensity rebounds to depth jumps as nervous system tolerance grows." },
      { title: "Deceleration is the prerequisite", body: "You can't train explosive change-of-direction until you can stop cleanly." },
    ],
    weekStructure: [
      {
        name: "Lower power", duration: "~70 min",
        exercises: [
          { name: "Hurdle Hop (low)", sets: 4, reps: "5", load: "BW", rest: "90s", note: "rebound contact ~0.2s" },
          { name: "Trap-Bar Jump", sets: 5, reps: "3", load: "30-40% 1RM", rest: "2 min", note: "max intent" },
          { name: "Box Squat", sets: 4, reps: "5", load: "RPE 7", rest: "2-3 min", note: "pause + accelerate" },
          { name: "Single-Leg RDL", sets: 3, reps: "6/leg", load: "Moderate DBs", rest: "90s" },
          { name: "Lateral Bound", sets: 3, reps: "5/side", load: "BW", rest: "90s", note: "stick the landing" },
        ],
      },
      {
        name: "Upper strength", duration: "~60 min",
        exercises: [
          { name: "DB Bench Press", sets: 4, reps: "6-8", load: "RPE 8", rest: "2-3 min" },
          { name: "Weighted Pull-up", sets: 4, reps: "5", load: "RPE 8", rest: "2-3 min" },
          { name: "Half-Kneeling Landmine Press", sets: 3, reps: "8/arm", load: "Moderate", rest: "90s" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10", load: "RPE 8", rest: "90s" },
          { name: "Pallof Press", sets: 3, reps: "10/side", load: "Light cable", rest: "60s", note: "anti-rotation" },
        ],
      },
      {
        name: "Plyo + speed", duration: "~60 min",
        exercises: [
          { name: "Pogo Hop (in-place)", sets: 4, reps: "10", load: "BW", rest: "60s", note: "ankle stiffness" },
          { name: "Depth Jump (12-18\")", sets: 5, reps: "3", load: "BW", rest: "2 min", note: "minimal ground contact" },
          { name: "Approach Jump (off 1 leg)", sets: 4, reps: "3/side", load: "BW", rest: "2 min" },
          { name: "10m Sprint Acceleration", sets: 6, reps: "10m", load: "Max effort", rest: "90s" },
          { name: "Lateral Shuffle to Sprint", sets: 4, reps: "20m", load: "Max effort", rest: "90s" },
        ],
      },
      {
        name: "Recovery", duration: "~40 min",
        exercises: [
          { name: "Sled Drag (low intensity)", sets: 3, reps: "30m", load: "Light", rest: "60s", note: "blood flow" },
          { name: "T-Spine Rotation", sets: 3, reps: "8/side", load: "BW", rest: "30s" },
          { name: "Hip 90/90", sets: 3, reps: "60s/side", load: "BW", rest: "—" },
          { name: "Standing Calf Raise (slow)", sets: 3, reps: "15", load: "BW", rest: "60s" },
          { name: "Walk", sets: 1, reps: "20 min", load: "—", rest: "—" },
        ],
      },
      {
        name: "Lower strength", duration: "~75 min",
        exercises: [
          { name: "Back Squat", sets: 4, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "RFE Split Squat", sets: 3, reps: "6-8/leg", load: "Heavy DBs", rest: "2 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "6", load: "RPE 8", rest: "2 min" },
          { name: "Eccentric Hamstring Slide", sets: 3, reps: "6", load: "BW", rest: "90s", note: "5s eccentric" },
          { name: "Standing Calf Raise", sets: 4, reps: "8", load: "Heavy", rest: "60s" },
        ],
      },
      {
        name: "Upper power", duration: "~60 min",
        exercises: [
          { name: "Med-Ball Chest Pass", sets: 4, reps: "5", load: "8-12 lb", rest: "90s", note: "max intent" },
          { name: "Push Press", sets: 4, reps: "3", load: "RPE 7", rest: "2-3 min" },
          { name: "Med-Ball Slam", sets: 3, reps: "5", load: "Heavy MB", rest: "90s" },
          { name: "Chest-Supported Row (explosive)", sets: 3, reps: "5", load: "RPE 7", rest: "90s" },
          { name: "Side Plank w/ Reach", sets: 3, reps: "8/side", load: "BW", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "Why Some NBA Players Jump Higher Than Others",         duration: "16:40", views: "890K" },
      { title: "P3 Movement Assessment Explained",                      duration: "22:11", views: "440K" },
      { title: "The Truth About Vertical Jump Training",                duration: "14:25", views: "1.2M" },
    ],
  },

  "hooper-training": {
    principles: [
      { title: "Train movements, not muscles", body: "Lifts are categorized by triple-extension, deceleration, multi-directional power, and finishing strength." },
      { title: "Court + gym integration", body: "Every weight-room week is paired with on-court ball-handling and finishing drills." },
      { title: "Conditioning that mimics game demands", body: "Intervals replicate the work-to-rest ratio of an NBA possession, not steady-state cardio." },
      { title: "KPI tracking", body: "Vert, lane agility, sprint, broad jump tested at the start and end of every block." },
    ],
    weekStructure: [
      {
        name: "Lower power", duration: "~75 min",
        exercises: [
          { name: "Box Jump (max height)", sets: 4, reps: "3", load: "BW", rest: "90s", note: "land soft, max intent" },
          { name: "Hang Clean", sets: 5, reps: "3", load: "RPE 7", rest: "2-3 min" },
          { name: "Trap-Bar Deadlift", sets: 4, reps: "5", load: "RPE 8", rest: "2-3 min" },
          { name: "Single-Leg Bound", sets: 4, reps: "5/leg", load: "BW", rest: "90s" },
          { name: "Heel-Elevated Goblet Squat", sets: 3, reps: "8", load: "Moderate", rest: "90s", note: "quad emphasis" },
        ],
      },
      {
        name: "Court + upper", duration: "~80 min",
        exercises: [
          { name: "Ball-Handling Series", sets: 1, reps: "20 min", load: "—", rest: "—", note: "two-ball, cone, change-of-pace" },
          { name: "DB Bench Press", sets: 4, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "Weighted Pull-up", sets: 4, reps: "5-7", load: "RPE 8", rest: "2 min" },
          { name: "Landmine Press (rotational)", sets: 3, reps: "8/side", load: "Moderate", rest: "90s" },
          { name: "Cable Row", sets: 3, reps: "10-12", load: "RPE 8", rest: "90s" },
        ],
      },
      {
        name: "Speed + plyo", duration: "~55 min",
        exercises: [
          { name: "Ladder + Hurdle Mobility", sets: 3, reps: "1 lap", load: "BW", rest: "30s", note: "warm-up" },
          { name: "10/20m Sprint", sets: 8, reps: "20m", load: "Max effort", rest: "90s" },
          { name: "Lateral Bound to Sprint", sets: 4, reps: "10m", load: "Max effort", rest: "90s" },
          { name: "Depth Jump to Sprint", sets: 4, reps: "10m", load: "BW", rest: "2 min" },
          { name: "5-10-5 Pro Shuttle", sets: 4, reps: "1 rep", load: "Max effort", rest: "90s" },
        ],
      },
      {
        name: "Court + recovery", duration: "~70 min",
        exercises: [
          { name: "Finishing Drills (off both feet)", sets: 1, reps: "30 min", load: "—", rest: "—", note: "low-volume, high-quality" },
          { name: "Sled Drag", sets: 3, reps: "30m", load: "Light", rest: "60s" },
          { name: "Hip Flexor + 90/90", sets: 3, reps: "60s/side", load: "BW", rest: "—" },
          { name: "Standing Calf Raise (slow)", sets: 3, reps: "12", load: "BW", rest: "60s" },
          { name: "Walk", sets: 1, reps: "15 min", load: "—", rest: "—" },
        ],
      },
      {
        name: "Lower strength", duration: "~75 min",
        exercises: [
          { name: "Back Squat", sets: 4, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "RFE Split Squat", sets: 3, reps: "8/leg", load: "Heavy DBs", rest: "2 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "Glute Ham Raise", sets: 3, reps: "6-8", load: "BW", rest: "90s" },
          { name: "Standing Calf Raise", sets: 4, reps: "8-10", load: "Heavy", rest: "60s" },
        ],
      },
      {
        name: "Court + skills", duration: "~75 min",
        exercises: [
          { name: "Pick-Up / Game Reps", sets: 1, reps: "45 min", load: "—", rest: "—", note: "live game intensity" },
          { name: "Med-Ball Slam", sets: 3, reps: "8", load: "Heavy MB", rest: "60s" },
          { name: "Push-up Plyo (clap or hand release)", sets: 3, reps: "5", load: "BW", rest: "60s" },
          { name: "Ankle Bounce", sets: 3, reps: "20", load: "BW", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "How To Add 6 Inches To Your Vertical In 12 Weeks",       duration: "12:33", views: "2.1M" },
      { title: "Game-Speed Conditioning For Basketball Players",         duration: "9:48",  views: "650K" },
      { title: "Finishing Strength: The Hidden Skill of Elite Scorers",  duration: "15:12", views: "430K" },
    ],
  },

  "cam-davidson": {
    principles: [
      { title: "Intent over volume", body: "Every rep moved with maximal speed. If bar speed drops, set ends." },
      { title: "Olympic derivatives daily", body: "Hang variations, pulls, and high-pulls used as primary power developers." },
      { title: "Rate of force development", body: "Programming targets RFD specifically — short, intense efforts with full recovery." },
      { title: "Strength as a base, not a goal", body: "Get strong enough that strength is no longer the limiter, then chase rate." },
    ],
    weekStructure: [
      {
        name: "Olympic + lower strength", duration: "~75 min",
        exercises: [
          { name: "Hang Power Clean", sets: 6, reps: "2", load: "RPE 7", rest: "2-3 min", note: "stop if bar speed drops" },
          { name: "Front Squat", sets: 4, reps: "3", load: "RPE 8", rest: "3 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "5", load: "RPE 7", rest: "2 min" },
          { name: "Snatch-Grip High Pull", sets: 3, reps: "3", load: "Moderate", rest: "2 min" },
          { name: "Standing Calf Raise", sets: 3, reps: "8", load: "Heavy", rest: "60s" },
        ],
      },
      {
        name: "Upper strength", duration: "~60 min",
        exercises: [
          { name: "Push Press", sets: 5, reps: "3", load: "RPE 7", rest: "2-3 min" },
          { name: "Weighted Pull-up", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "Bench Press", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "Pendlay Row", sets: 3, reps: "5", load: "RPE 7", rest: "90s" },
          { name: "Plank w/ Drag", sets: 3, reps: "8/side", load: "Light DB", rest: "60s" },
        ],
      },
      {
        name: "Plyo + sprint", duration: "~50 min",
        exercises: [
          { name: "Pogo + Ankle Hops", sets: 3, reps: "15", load: "BW", rest: "60s", note: "warm-up" },
          { name: "Approach Jump", sets: 5, reps: "3", load: "BW", rest: "90s", note: "off 1 or 2 feet" },
          { name: "Hurdle Hop (max height)", sets: 5, reps: "3", load: "BW", rest: "90s" },
          { name: "10m Acceleration Sprint", sets: 6, reps: "10m", load: "Max effort", rest: "90s" },
          { name: "Standing Long Jump", sets: 4, reps: "3", load: "BW", rest: "90s" },
        ],
      },
      {
        name: "Olympic + lower power", duration: "~65 min",
        exercises: [
          { name: "Hang Power Snatch", sets: 5, reps: "2", load: "Moderate", rest: "2-3 min", note: "speed over load" },
          { name: "Trap-Bar Jump", sets: 4, reps: "3", load: "30-40% 1RM", rest: "2 min" },
          { name: "Snatch-Grip Deadlift", sets: 3, reps: "3", load: "RPE 7", rest: "2 min" },
          { name: "Single-Leg Bound", sets: 3, reps: "5/side", load: "BW", rest: "90s" },
          { name: "Lateral Bound to Stick", sets: 3, reps: "5/side", load: "BW", rest: "90s" },
        ],
      },
      {
        name: "Upper hypertrophy", duration: "~55 min",
        exercises: [
          { name: "Incline DB Press", sets: 4, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Chest-Supported Row", sets: 4, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Standing Cable Lat Raise", sets: 3, reps: "12", load: "RPE 9", rest: "90s" },
          { name: "Incline DB Curl", sets: 3, reps: "10", load: "RPE 9", rest: "90s" },
          { name: "Cable Tricep Pushdown", sets: 3, reps: "12", load: "RPE 9", rest: "60s" },
        ],
      },
      REST,
      REST,
    ],
    videos: [
      { title: "Why Olympic Lifters Have The Best Verticals",          duration: "11:27", views: "720K" },
      { title: "Cleans vs. Squats For Vertical Jump",                  duration: "13:44", views: "480K" },
      { title: "How To Train For Maximum Rate of Force Development",   duration: "17:08", views: "290K" },
    ],
  },

  "cbum": {
    principles: [
      { title: "Train the silhouette", body: "Volume biased toward shoulders, lats, chest, and quads — the muscles that define the V." },
      { title: "Mind-muscle connection over PRs", body: "Felt tension trumps weight on the bar. If the muscle isn't firing, the rep doesn't count." },
      { title: "Controlled eccentrics", body: "2-3 second negatives on hypertrophy work. Time under tension is non-negotiable." },
      { title: "High frequency on weak points", body: "Lagging muscles get hit twice or three times per week with focused volume." },
    ],
    weekStructure: [
      {
        name: "Chest/Triceps", duration: "~75 min",
        exercises: [
          { name: "Incline Smith Press", sets: 4, reps: "8-10", load: "RPE 8", rest: "2 min", note: "3s eccentric" },
          { name: "Flat DB Press", sets: 4, reps: "10-12", load: "RPE 8", rest: "2 min" },
          { name: "Cable Crossover (high to low)", sets: 4, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "Dip (weighted)", sets: 3, reps: "8-10", load: "RPE 8", rest: "90s" },
          { name: "Rope Tricep Pushdown", sets: 4, reps: "12-15", load: "RPE 9", rest: "60s" },
          { name: "Overhead Cable Tri Ext", sets: 3, reps: "12-15", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Back/Biceps", duration: "~80 min",
        exercises: [
          { name: "Lat Pulldown (wide)", sets: 4, reps: "10-12", load: "RPE 8", rest: "2 min", note: "2s squeeze" },
          { name: "Hammer Strength Row", sets: 4, reps: "10-12", load: "RPE 8", rest: "2 min" },
          { name: "Single-Arm DB Row", sets: 3, reps: "10/arm", load: "Heavy", rest: "90s" },
          { name: "Straight-Arm Pullover", sets: 3, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "EZ-Bar Curl", sets: 4, reps: "10-12", load: "RPE 9", rest: "90s" },
          { name: "Incline DB Curl", sets: 3, reps: "10-12", load: "RPE 10", rest: "60s", note: "stretch emphasis" },
        ],
      },
      {
        name: "Legs", duration: "~85 min",
        exercises: [
          { name: "Leg Extension (warm-up)", sets: 3, reps: "15", load: "Light", rest: "60s" },
          { name: "Hack Squat", sets: 5, reps: "8-12", load: "RPE 8", rest: "3 min", note: "deep ROM" },
          { name: "Leg Press", sets: 4, reps: "12-15", load: "RPE 9", rest: "2 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "10-12", load: "RPE 8", rest: "2 min" },
          { name: "Lying Leg Curl", sets: 4, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "Standing Calf Raise", sets: 5, reps: "10-12", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Shoulders", duration: "~70 min",
        exercises: [
          { name: "Seated DB Shoulder Press", sets: 4, reps: "10-12", load: "RPE 8", rest: "2 min" },
          { name: "Cable Lateral Raise", sets: 5, reps: "12-15", load: "RPE 9", rest: "90s", note: "drop set on last" },
          { name: "Reverse Pec Deck", sets: 4, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "Front Raise (cable)", sets: 3, reps: "12-15", load: "RPE 9", rest: "60s" },
          { name: "Shrug (heavy)", sets: 4, reps: "10-12", load: "RPE 9", rest: "90s" },
        ],
      },
      {
        name: "Arms", duration: "~65 min",
        exercises: [
          { name: "Preacher Curl (machine)", sets: 4, reps: "10-12", load: "RPE 8", rest: "90s" },
          { name: "Cable Curl (bilateral)", sets: 4, reps: "12-15", load: "RPE 9", rest: "60s" },
          { name: "Skull Crusher", sets: 4, reps: "10-12", load: "RPE 8", rest: "90s" },
          { name: "Cable Tricep Pushdown", sets: 4, reps: "12-15", load: "RPE 9", rest: "60s" },
          { name: "Concentration Curl", sets: 3, reps: "12", load: "RPE 10", rest: "60s" },
          { name: "Bench Dip", sets: 3, reps: "12-15", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~80 min",
        exercises: [
          { name: "Front Squat", sets: 4, reps: "8-10", load: "RPE 8", rest: "3 min" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", load: "Heavy DBs", rest: "2 min" },
          { name: "Hip Thrust", sets: 4, reps: "10-12", load: "RPE 8", rest: "2 min" },
          { name: "Seated Leg Curl", sets: 4, reps: "12-15", load: "RPE 9", rest: "90s" },
          { name: "Sissy Squat", sets: 3, reps: "10-12", load: "BW", rest: "90s" },
          { name: "Seated Calf Raise", sets: 4, reps: "15", load: "RPE 10", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "Full Chest Workout for Classic Physique",         duration: "18:22", views: "4.8M" },
      { title: "My Off-Season Back Workout (No Pump = No Gain)",  duration: "21:15", views: "3.6M" },
      { title: "How I Train Quads For Olympia",                    duration: "24:08", views: "2.9M" },
    ],
  },

  "sam-sulek": {
    principles: [
      { title: "One muscle per day", body: "Bro split keeps the volume on a single muscle so you can crush it without limiting other sessions." },
      { title: "Failure or beyond", body: "Top sets taken to muscular failure. Drop sets, partials, and rest-pause used liberally." },
      { title: "Intuitive exercise selection", body: "Pick movements based on how the muscle responds today, not what's on the page." },
      { title: "Food and sleep are the program", body: "Massive caloric surplus, 8+ hours of sleep, no deloads — recovery is a calorie problem." },
    ],
    weekStructure: [
      {
        name: "Chest", duration: "~75 min",
        exercises: [
          { name: "Incline Smith Press", sets: 4, reps: "6-10", load: "to failure", rest: "2-3 min" },
          { name: "Flat DB Press", sets: 4, reps: "8-12", load: "to failure", rest: "2 min" },
          { name: "Pec Deck", sets: 4, reps: "10-15", load: "to failure", rest: "90s", note: "rest-pause last set" },
          { name: "Cable Crossover", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Dip (BW + chains)", sets: 3, reps: "AMRAP", load: "BW+", rest: "90s" },
        ],
      },
      {
        name: "Back", duration: "~80 min",
        exercises: [
          { name: "Lat Pulldown (wide)", sets: 4, reps: "8-12", load: "to failure", rest: "2 min" },
          { name: "Hammer Strength Row", sets: 4, reps: "10-12", load: "to failure", rest: "2 min" },
          { name: "Single-Arm DB Row", sets: 4, reps: "10/arm", load: "Heavy", rest: "90s" },
          { name: "Cable Pullover", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Shrug (DB)", sets: 4, reps: "12-15", load: "Heavy", rest: "60s" },
        ],
      },
      {
        name: "Shoulders", duration: "~70 min",
        exercises: [
          { name: "Smith Shoulder Press", sets: 4, reps: "8-10", load: "to failure", rest: "2 min" },
          { name: "DB Lateral Raise", sets: 5, reps: "10-15", load: "to failure", rest: "60s", note: "partials at end" },
          { name: "Cable Lateral Raise (single-arm)", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Reverse Pec Deck", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Front Raise (plate)", sets: 3, reps: "10-12", load: "Moderate", rest: "60s" },
        ],
      },
      {
        name: "Arms", duration: "~75 min",
        exercises: [
          { name: "EZ-Bar Curl", sets: 4, reps: "8-10", load: "to failure", rest: "90s" },
          { name: "Hammer Curl (DB)", sets: 4, reps: "10-12", load: "to failure", rest: "60s" },
          { name: "Cable Curl", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Skull Crusher", sets: 4, reps: "8-10", load: "to failure", rest: "90s" },
          { name: "Cable Tricep Pushdown", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Bench Dip", sets: 3, reps: "AMRAP", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~85 min",
        exercises: [
          { name: "Leg Extension (warm-up)", sets: 3, reps: "20", load: "Light", rest: "60s" },
          { name: "Hack Squat", sets: 5, reps: "8-15", load: "to failure", rest: "3 min" },
          { name: "Leg Press", sets: 4, reps: "12-20", load: "to failure", rest: "2 min" },
          { name: "Lying Leg Curl", sets: 5, reps: "10-15", load: "to failure", rest: "90s" },
          { name: "Standing Calf Raise", sets: 5, reps: "10-15", load: "to failure", rest: "60s" },
        ],
      },
      {
        name: "Chest/Back accessories", duration: "~60 min",
        exercises: [
          { name: "Incline DB Fly", sets: 4, reps: "10-12", load: "Moderate", rest: "90s" },
          { name: "Pec Deck (drop set)", sets: 3, reps: "12 + 12 + 12", load: "Descending", rest: "90s" },
          { name: "Seated Cable Row", sets: 4, reps: "10-12", load: "to failure", rest: "90s" },
          { name: "Straight-Arm Pulldown", sets: 4, reps: "12-15", load: "to failure", rest: "60s" },
          { name: "Face Pull", sets: 3, reps: "15", load: "Moderate", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "Pushing My Chest To Absolute Failure (RAW)",  duration: "32:18", views: "5.2M" },
      { title: "Back Day With 5000 Calorie Meal Prep",         duration: "28:44", views: "4.7M" },
      { title: "Arms Day: The Pump From Hell",                  duration: "24:31", views: "3.9M" },
    ],
  },

  "ryan-humiston": {
    principles: [
      { title: "Density over duration", body: "Workouts run 40–55 min with minimal rest. Higher work-per-minute drives metabolic stress." },
      { title: "Superset structure", body: "Most exercises paired — opposing muscle groups or pre-exhaust pairings to magnify stimulus." },
      { title: "Variation as stimulus", body: "Unusual angles, unilateral takes, and grip variations refresh growth in plateaued muscles." },
      { title: "Effort is the only currency", body: "Most sets to 0–1 RIR. The short workout earns its right to be short by being maximally hard." },
    ],
    weekStructure: [
      {
        name: "Chest", duration: "~50 min",
        exercises: [
          { name: "Pec Deck → Incline DB Press", sets: 4, reps: "12 + 8", load: "RPE 9", rest: "60s", note: "pre-exhaust superset" },
          { name: "Decline Press → Push-up", sets: 3, reps: "10 + AMRAP", load: "RPE 9", rest: "60s" },
          { name: "Cable Crossover (3-angle)", sets: 4, reps: "10 each angle", load: "Moderate", rest: "30s", note: "high → mid → low" },
          { name: "DB Squeeze Press", sets: 3, reps: "12-15", load: "RPE 10", rest: "60s" },
        ],
      },
      {
        name: "Back", duration: "~55 min",
        exercises: [
          { name: "Pull-up → Lat Pullover", sets: 4, reps: "8 + 12", load: "BW + Cable", rest: "60s", note: "superset" },
          { name: "Chest-Supported Row → Single-Arm Pulldown", sets: 4, reps: "10 + 10/arm", load: "RPE 9", rest: "60s" },
          { name: "Rope Face Pull", sets: 3, reps: "15-20", load: "Moderate", rest: "45s" },
          { name: "Reverse Grip Pulldown", sets: 3, reps: "10-12", load: "RPE 9", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~55 min",
        exercises: [
          { name: "Goblet Squat → Walking Lunge", sets: 4, reps: "12 + 10/leg", load: "Moderate", rest: "90s", note: "superset" },
          { name: "Romanian Deadlift", sets: 4, reps: "10", load: "RPE 9", rest: "90s" },
          { name: "Bulgarian Split Squat → Sissy Squat", sets: 3, reps: "10/leg + 12", load: "BW/DBs", rest: "60s" },
          { name: "Standing Calf Raise → Seated Calf Raise", sets: 4, reps: "12 + 15", load: "RPE 9", rest: "30s" },
        ],
      },
      {
        name: "Shoulders/Arms", duration: "~55 min",
        exercises: [
          { name: "DB Shoulder Press → Lateral Raise", sets: 4, reps: "10 + 12", load: "RPE 9", rest: "60s" },
          { name: "Reverse Fly → Front Raise", sets: 3, reps: "12 + 12", load: "Moderate", rest: "45s" },
          { name: "EZ Curl → Skull Crusher", sets: 4, reps: "10 + 10", load: "RPE 9", rest: "60s" },
          { name: "Hammer Curl → Rope Pushdown", sets: 3, reps: "12 + 15", load: "RPE 9", rest: "45s" },
        ],
      },
      {
        name: "Chest/Back", duration: "~50 min",
        exercises: [
          { name: "DB Bench Press → Chest-Supported Row", sets: 4, reps: "10 + 10", load: "RPE 9", rest: "60s" },
          { name: "Incline DB Fly → Cable Row", sets: 3, reps: "12 + 12", load: "Moderate", rest: "60s" },
          { name: "Cable Crossover → Lat Pulldown", sets: 3, reps: "15 + 12", load: "RPE 9", rest: "45s" },
          { name: "Push-up to Failure", sets: 2, reps: "AMRAP", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Legs", duration: "~55 min",
        exercises: [
          { name: "Leg Extension → Leg Press", sets: 4, reps: "15 + 10", load: "RPE 9", rest: "60s", note: "pre-exhaust" },
          { name: "Hip Thrust → Glute Kickback", sets: 4, reps: "10 + 12", load: "Heavy/Cable", rest: "60s" },
          { name: "Walking Lunge", sets: 3, reps: "20m", load: "DBs", rest: "60s" },
          { name: "Standing Calf Raise", sets: 4, reps: "15", load: "RPE 10", rest: "30s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "45-Minute Chest Workout That Will Crush You",         duration: "11:42", views: "1.8M" },
      { title: "I Tried Mike Israetel's Back Routine (HONEST REVIEW)", duration: "14:08", views: "2.2M" },
      { title: "The Best Superset Workout for Muscle Growth",          duration: "13:55", views: "1.4M" },
    ],
  },

  "mat-fraser": {
    principles: [
      { title: "Two-a-days when possible", body: "Strength work in the AM, conditioning or skill in the PM — separates fatigue, doubles stimulus." },
      { title: "Strength first", body: "Heavy barbell work always before metcons. The base of every block is squat, deadlift, press strength." },
      { title: "Engine matters", body: "Sustained Z2/Z3 cardio plus repeatable max-effort intervals. Build the aerobic floor and the anaerobic ceiling." },
      { title: "Skill density", body: "Gymnastics movements and Olympic lifts touched almost daily — competence comes from frequency." },
    ],
    weekStructure: [
      {
        name: "Strength + WOD", duration: "~90 min",
        exercises: [
          { name: "Back Squat", sets: 5, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "Strict Press", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "AMRAP 15:", sets: 1, reps: "—", load: "—", rest: "—", note: "10 Power Cleans @135 / 15 T2B / 20 Box Jumps" },
          { name: "Hollow Hold + L-Sit", sets: 3, reps: "30s + 20s", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Engine + skill", duration: "~90 min",
        exercises: [
          { name: "Zone 2 Row", sets: 1, reps: "45 min", load: "Easy", rest: "—", note: "nasal-breath pace" },
          { name: "Bar Muscle-Up Skill", sets: 6, reps: "3-5", load: "BW", rest: "90s" },
          { name: "Snatch Complex", sets: 5, reps: "1+1+1", load: "Light", rest: "2 min", note: "snatch + OH squat + snatch" },
          { name: "GHD Sit-up", sets: 3, reps: "15", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Strength + WOD", duration: "~90 min",
        exercises: [
          { name: "Deadlift", sets: 5, reps: "3", load: "RPE 8", rest: "3 min" },
          { name: "Bench Press", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "For Time:", sets: 1, reps: "—", load: "—", rest: "—", note: "21-15-9 Thrusters @95 / Pull-ups" },
          { name: "L-Sit Hold", sets: 3, reps: "20-30s", load: "BW", rest: "60s" },
        ],
      },
      {
        name: "Active recovery", duration: "~45 min",
        exercises: [
          { name: "Easy Bike", sets: 1, reps: "30 min", load: "Z1-Z2", rest: "—" },
          { name: "Goblet Squat (slow)", sets: 3, reps: "10", load: "Moderate", rest: "60s" },
          { name: "T-Spine Rotation + Hip 90/90", sets: 3, reps: "10/side", load: "BW", rest: "30s" },
          { name: "Walk", sets: 1, reps: "15 min", load: "—", rest: "—" },
        ],
      },
      {
        name: "Strength + WOD", duration: "~90 min",
        exercises: [
          { name: "Front Squat", sets: 5, reps: "3", load: "RPE 8", rest: "3 min" },
          { name: "Weighted Pull-up", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "EMOM 20:", sets: 1, reps: "—", load: "—", rest: "—", note: "rotating: row cals / DUs / KB swing / wall ball" },
          { name: "Plank w/ Drag", sets: 3, reps: "8/side", load: "DB", rest: "60s" },
        ],
      },
      {
        name: "Long capacity", duration: "~75 min",
        exercises: [
          { name: "Run", sets: 1, reps: "5 km", load: "Z2", rest: "—" },
          { name: "Row", sets: 1, reps: "5 km", load: "Z2", rest: "—" },
          { name: "Assault Bike Intervals", sets: 8, reps: "30s on / 90s off", load: "Max effort", rest: "—" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "A Day In The Life: HWPO Training",                duration: "19:33", views: "1.9M" },
      { title: "How I Built My Engine: Aerobic Capacity Training", duration: "23:11", views: "870K" },
      { title: "The 5x Champion's Squat Program",                  duration: "17:22", views: "1.2M" },
    ],
  },

  "nick-bare": {
    principles: [
      { title: "Separate the modalities", body: "Strength work and running on different sessions or different days to protect both adaptations." },
      { title: "Polarized cardio", body: "80% easy Z2 mileage, 20% hard intervals. The middle is where overtraining lives." },
      { title: "Progressive overload on both", body: "Track lifts in pounds and runs in pace/mileage. Both must trend up across a block." },
      { title: "Fueling matches the work", body: "Carbs scale with mileage. Protein scales with lifting. Underfeeding kills hybrid progress." },
    ],
    weekStructure: [
      {
        name: "Lift + easy run", duration: "~90 min",
        exercises: [
          { name: "Back Squat", sets: 4, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "Bench Press", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "Romanian Deadlift", sets: 3, reps: "8", load: "RPE 7", rest: "2 min" },
          { name: "Chest-Supported Row", sets: 3, reps: "10", load: "RPE 8", rest: "90s" },
          { name: "Easy Run (PM)", sets: 1, reps: "5 km", load: "Z2", rest: "—", note: "separate session" },
        ],
      },
      {
        name: "Hard run", duration: "~60 min",
        exercises: [
          { name: "Dynamic Warm-up", sets: 1, reps: "10 min", load: "—", rest: "—" },
          { name: "Tempo Intervals", sets: 5, reps: "1 km", load: "Threshold pace", rest: "2 min jog" },
          { name: "Strides", sets: 4, reps: "100m", load: "85%", rest: "60s" },
          { name: "Cool-down Jog", sets: 1, reps: "10 min", load: "Z1", rest: "—" },
        ],
      },
      {
        name: "Lift + recovery jog", duration: "~75 min",
        exercises: [
          { name: "Deadlift", sets: 4, reps: "3", load: "RPE 8", rest: "3 min" },
          { name: "Strict Press", sets: 4, reps: "5", load: "RPE 8", rest: "2 min" },
          { name: "Weighted Pull-up", sets: 3, reps: "5-7", load: "RPE 8", rest: "2 min" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "8/leg", load: "RPE 7", rest: "90s" },
          { name: "Recovery Jog (PM)", sets: 1, reps: "3 km", load: "Z1", rest: "—" },
        ],
      },
      {
        name: "Lift", duration: "~70 min",
        exercises: [
          { name: "Front Squat", sets: 4, reps: "5", load: "RPE 7", rest: "2-3 min" },
          { name: "Incline DB Press", sets: 3, reps: "8-10", load: "RPE 8", rest: "2 min" },
          { name: "Single-Arm DB Row", sets: 3, reps: "10/arm", load: "Heavy", rest: "90s" },
          { name: "Walking Lunge", sets: 3, reps: "20m", load: "DBs", rest: "90s" },
          { name: "Face Pull + Bicep Curl Superset", sets: 3, reps: "15 + 12", load: "Light/Mod", rest: "60s" },
        ],
      },
      {
        name: "Easy run", duration: "~50 min",
        exercises: [
          { name: "Easy Run", sets: 1, reps: "8 km", load: "Z2", rest: "—", note: "conversational pace" },
          { name: "Hip Mobility", sets: 2, reps: "60s/side", load: "BW", rest: "—" },
        ],
      },
      {
        name: "Long run", duration: "~110 min",
        exercises: [
          { name: "Long Run", sets: 1, reps: "16-20 km", load: "Z2", rest: "—", note: "fueled with carbs" },
          { name: "Post-run Stretch", sets: 1, reps: "15 min", load: "—", rest: "—" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "How I Train For A Marathon AND A 500lb Deadlift",         duration: "17:55", views: "1.4M" },
      { title: "The Hybrid Athlete Weekly Schedule (Real Numbers)",        duration: "14:22", views: "890K" },
      { title: "Lift In The Morning, Run At Night: My Recovery Protocol",  duration: "12:08", views: "720K" },
    ],
  },

  "peter-attia": {
    principles: [
      { title: "The Four Pillars", body: "Stability + Strength + Zone 2 + VO2max. Every week touches all four. Skip none." },
      { title: "Zone 2 is non-negotiable", body: "3–4 hours per week of low-intensity steady-state cardio. The mitochondrial base for everything else." },
      { title: "Strength = grip + carry + hinge", body: "Farmer's carries, deadlifts, step-ups. Train for the things you'll do at 85." },
      { title: "VO2 once per week", body: "One session of 4×4-min near-max intervals. The single highest-leverage lifespan input you can train." },
    ],
    weekStructure: [
      {
        name: "Strength", duration: "~75 min",
        exercises: [
          { name: "Trap-Bar Deadlift", sets: 4, reps: "5", load: "RPE 8", rest: "3 min" },
          { name: "Goblet Squat (slow)", sets: 3, reps: "8", load: "Moderate", rest: "2 min", note: "5s eccentric" },
          { name: "Single-Arm DB Press", sets: 3, reps: "8/arm", load: "RPE 7", rest: "90s" },
          { name: "Pull-up (assisted ok)", sets: 3, reps: "6-8", load: "BW/Band", rest: "2 min" },
          { name: "Farmer Carry", sets: 4, reps: "30m", load: "Heavy DBs", rest: "90s" },
        ],
      },
      {
        name: "Zone 2", duration: "~60 min",
        exercises: [
          { name: "Bike or Row", sets: 1, reps: "45-60 min", load: "Z2 (~120-140 bpm)", rest: "—", note: "nasal breathing the whole time" },
          { name: "Walking Cool-down", sets: 1, reps: "10 min", load: "Z1", rest: "—" },
        ],
      },
      {
        name: "Stability + mobility", duration: "~45 min",
        exercises: [
          { name: "Bird Dog + Dead Bug", sets: 3, reps: "8/side", load: "BW", rest: "30s" },
          { name: "Pallof Press", sets: 3, reps: "10/side", load: "Cable", rest: "30s" },
          { name: "Half-Kneeling Anti-Lateral Flexion", sets: 3, reps: "8/side", load: "KB", rest: "30s" },
          { name: "Hip 90/90 + Couch Stretch", sets: 3, reps: "60s/side", load: "BW", rest: "—" },
          { name: "T-Spine Rotation (open book)", sets: 3, reps: "10/side", load: "BW", rest: "—" },
        ],
      },
      {
        name: "Strength", duration: "~70 min",
        exercises: [
          { name: "Romanian Deadlift", sets: 4, reps: "6", load: "RPE 8", rest: "2-3 min" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "8/leg", load: "Heavy DBs", rest: "2 min" },
          { name: "Bench Press", sets: 3, reps: "6-8", load: "RPE 8", rest: "2 min" },
          { name: "Chest-Supported Row", sets: 3, reps: "8-10", load: "RPE 7", rest: "90s" },
          { name: "Suitcase Carry", sets: 3, reps: "30m/side", load: "Heavy KB", rest: "90s" },
        ],
      },
      {
        name: "Zone 2", duration: "~60 min",
        exercises: [
          { name: "Bike or Row", sets: 1, reps: "60 min", load: "Z2", rest: "—" },
          { name: "Stretch + Walk", sets: 1, reps: "15 min", load: "—", rest: "—" },
        ],
      },
      {
        name: "VO2 + carries", duration: "~60 min",
        exercises: [
          { name: "Warm-up Bike", sets: 1, reps: "10 min", load: "Z1-Z2", rest: "—" },
          { name: "4×4 Intervals", sets: 4, reps: "4 min on / 4 min easy", load: "Near max (~95%)", rest: "—", note: "RPE 9 at end of each work block" },
          { name: "Cool-down Bike", sets: 1, reps: "5 min", load: "Z1", rest: "—" },
          { name: "Farmer Carry", sets: 4, reps: "30m", load: "Heavy", rest: "60s" },
        ],
      },
      REST,
    ],
    videos: [
      { title: "The 4 Pillars of Exercise For Longevity",         duration: "28:14", views: "2.4M" },
      { title: "How To Train Zone 2 (And Why It Matters)",         duration: "22:08", views: "1.7M" },
      { title: "Why VO2max Is The Best Predictor of Lifespan",     duration: "18:55", views: "1.3M" },
    ],
  },
};

export function getProfile(id: string): CoachProfile | undefined {
  return COACH_PROFILES[id];
}
