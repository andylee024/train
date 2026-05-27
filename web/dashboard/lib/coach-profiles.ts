/**
 * Coach profile extras — principles, weekly structure, sample videos.
 * Keyed by coach id. Used by the profile page.
 *
 * Ported from prototypes/marketplace/data.js on the ff-onboarding branch.
 */

export type Principle = { title: string; body: string };
export type SampleVideo = { title: string; duration: string; views: string };

export type CoachProfile = {
  principles: Principle[];
  weekStructure: string[]; // 7 day labels
  videos: SampleVideo[];
};

export const COACH_PROFILES: Record<string, CoachProfile> = {
  "jeff-nippard": {
    principles: [
      { title: "RIR-based progression", body: "Top sets are calibrated to reps in reserve. Push effort up across a mesocycle, then deload before form breaks." },
      { title: "Volume landmarks per muscle", body: "Each muscle has its own MV / MEV / MAV / MRV. Programming hits the sweet spot, never the ceiling." },
      { title: "Exercise selection by mechanism", body: "Picks favor lengthened-position bias, stable resistance profiles, and movements with the highest hypertrophy-per-rep yield." },
      { title: "Specificity over novelty", body: "Big six lifts anchor every block. Variation is a tool, not a default." },
    ],
    weekStructure: ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"],
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
    weekStructure: ["Chest/Back", "Legs", "Arms/Shoulders", "Chest/Back", "Legs", "Arms/Shoulders", "Rest"],
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
    weekStructure: ["Push", "Legs", "Pull", "Conditioning", "Push", "Pull", "Mobility"],
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
    weekStructure: ["Lower power", "Upper strength", "Plyo + speed", "Recovery", "Lower strength", "Upper power", "Rest"],
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
    weekStructure: ["Lower power", "Court + upper", "Speed + plyo", "Court + recovery", "Lower strength", "Court + skills", "Rest"],
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
    weekStructure: ["Olympic + lower strength", "Upper strength", "Plyo + sprint", "Olympic + lower power", "Upper hypertrophy", "Rest", "Rest"],
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
    weekStructure: ["Chest/Triceps", "Back/Biceps", "Legs", "Shoulders", "Arms", "Legs", "Rest"],
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
    weekStructure: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Chest/Back accessories", "Rest"],
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
    weekStructure: ["Chest", "Back", "Legs", "Shoulders/Arms", "Chest/Back", "Legs", "Rest"],
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
    weekStructure: ["Strength + WOD", "Engine + skill", "Strength + WOD", "Active recovery", "Strength + WOD", "Long capacity", "Rest"],
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
    weekStructure: ["Lift + easy run", "Hard run", "Lift + recovery jog", "Lift", "Easy run", "Long run", "Rest"],
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
    weekStructure: ["Strength", "Zone 2", "Stability + mobility", "Strength", "Zone 2", "VO2 + carries", "Rest"],
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
