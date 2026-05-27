/**
 * Mocked synthesized plan — the structured output the preview screen renders.
 *
 * v1: hardcoded for the dunk-style arc to demonstrate the shape. v2 replaced
 * by real AI synthesis from coaches + intake + notes.
 */

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
  sets?: string;       // "5"
  reps?: string;       // "3" or "3-5"
  load?: string;       // "80%" / "215 lb" / "RPE 7" / "BW+25"
  note?: string;       // "max bar speed"
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
  sampleWeek: {
    label: string;
    days: SamplePlanDay[];
  };
  kpis: SamplePlanKPI[];
};

export const SAMPLE_PLAN: SamplePlan = {
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
    { name: "Foundation",        weeks: "Wk 1-4",   focus: "Movement quality, base strength, eccentric capacity",        source: "P3",                  weekStart: 1,  weekEnd: 4 },
    { name: "Power Development", weeks: "Wk 5-8",   focus: "Olympic derivatives, intent-based lifting, RFD",              source: "Cam Davidson",        weekStart: 5,  weekEnd: 8 },
    { name: "Plyometric Ladder", weeks: "Wk 9-12",  focus: "Reactive strength, depth jumps, posterior hypertrophy",       source: "P3 + Jeff Nippard",   weekStart: 9,  weekEnd: 12 },
    { name: "Peak",              weeks: "Wk 13-16", focus: "Low volume, max intent, recovered jumps",                      source: "Cam Davidson",        weekStart: 13, weekEnd: 16 },
  ],
  sampleWeek: {
    label: "Sample Week from Block 2 (Power Development)",
    days: [
      {
        day: "Mon", title: "Lower Power",
        exercises: [
          { name: "Hang clean",        sets: "5", reps: "3", load: "80%",   note: "max bar speed" },
          { name: "Back squat",        sets: "4", reps: "4", load: "78%" },
          { name: "Romanian deadlift", sets: "3", reps: "6", load: "RPE 7" },
          { name: "Pogo jumps",        sets: "4", reps: "8",                note: "reactive intent" },
        ],
      },
      {
        day: "Tue", title: "Upper Strength",
        exercises: [
          { name: "Bench press",       sets: "4", reps: "5", load: "80%" },
          { name: "Weighted pull-up",  sets: "4", reps: "5", load: "BW+25" },
          { name: "DB row",            sets: "3", reps: "10" },
          { name: "Face pulls",        sets: "3", reps: "15" },
        ],
      },
      {
        day: "Wed", title: "Plyo + Sprint",
        exercises: [
          { name: "Box jumps",         sets: "5", reps: "3",                note: "full recovery" },
          { name: "Broad jumps",       sets: "4", reps: "3" },
          { name: "10m flying sprints", sets: "6", reps: "1" },
          { name: "Tempo run",         sets: "4", reps: "100m",  load: "70%" },
        ],
      },
      {
        day: "Thu", title: "Lower Hypertrophy",
        exercises: [
          { name: "Front squat",                 sets: "4", reps: "6",   load: "RPE 8" },
          { name: "Bulgarian split squat",       sets: "3", reps: "8/leg" },
          { name: "Hip thrust",                  sets: "3", reps: "10" },
          { name: "Calf raises",                 sets: "4", reps: "12" },
        ],
      },
      {
        day: "Fri", title: "Upper Power",
        exercises: [
          { name: "Push press",        sets: "5", reps: "3", load: "75%",  note: "max intent" },
          { name: "Weighted dip",      sets: "4", reps: "6", load: "BW+45" },
          { name: "Med ball chest pass", sets: "4", reps: "5",             note: "throw + reset" },
          { name: "Pull-aparts",       sets: "3", reps: "20" },
        ],
      },
      {
        day: "Sat", title: "Active Recovery",
        exercises: [
          { name: "Z2 bike",           sets: "1", reps: "30 min" },
          { name: "Mobility flow",     sets: "1", reps: "20 min" },
          { name: "Foam roll posterior chain", sets: "1", reps: "10 min" },
        ],
      },
      {
        day: "Sun", title: "Rest", rest: true,
        exercises: [
          { name: "Full rest" },
          { name: "Optional walk" },
        ],
      },
    ],
  },
  kpis: [
    { name: "Standing vertical", baseline: "28\"",    target: "34\"",     measured: "Wk 1, 8, 16" },
    { name: "Broad jump",        baseline: "8'2\"",   target: "9'2\"",    measured: "Wk 1, 8, 16" },
    { name: "10m sprint",        baseline: "1.85s",   target: "1.72s",    measured: "Wk 1, 8, 16" },
    { name: "Back squat 1RM",    baseline: "315 lb",  target: "365 lb",   measured: "Wk 4, 8, 12, 16" },
  ],
};
