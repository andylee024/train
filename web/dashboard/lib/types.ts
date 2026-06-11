/** Shared dashboard types — Supabase rows + bundle-parsed shapes. */

export type ArcGoal = {
  name: string;
  type: string;
  metric?: string;
  current?: string;
  target?: string;
  status?: "active" | "completed" | "planned";
};

export type ArcBlock = {
  name: string;
  weeks: string;
  serves: string[];
  status: "completed" | "active" | "planned";
};

export type ArcSummary = {
  athlete: string;
  name: string;
  purpose: string;
  start: string;
  end: string;
  totalWeeks: number;
  currentWeek: number;
  currentBlock?: ArcBlock | null;
  goals: ArcGoal[];
  blocks: ArcBlock[];
  priorityRules: { rank: number; domain: string; rule: string }[];
};

export type SessionExercise = {
  name: string;
  prescription: string;
  notes?: string;
};

export type PlannedSession = {
  day: string;
  date?: string;
  title: string;
  blockTitle?: string;
  duration?: string;
  intent?: string;
  exercises: SessionExercise[];
};

export type SetRow = {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_name: string;
  set_index: number;
  reps: number | null;
  weight_value: number | null;
  weight_unit: "kg" | "lb" | "bw" | null;
  weight_kg: number | null;
  rpe: number | null;
  performed_at: string;
};

export type DailyMetric = {
  date: string;
  bodyweight_lb: number | null;
  notes: string | null;
};

export type ExercisePR = {
  exercise: string;
  weight_kg: number;
  reps: number;
  date: string;
  e1rm_kg: number;
};
