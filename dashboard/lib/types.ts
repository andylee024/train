/** Shapes shared by the server fetch, the fixture, and the dashboard. */

export type RawExercise = { id?: unknown; name?: unknown };
export type RawWorkout = { id?: unknown; performed_at?: unknown };
export type RawWorkoutExercise = {
  id?: unknown;
  workout_id?: unknown;
  exercise_id?: unknown;
};
export type RawSet = {
  id?: unknown;
  workout_exercise_id?: unknown;
  set_index?: unknown;
  reps?: unknown;
  weight_value?: unknown;
  weight_unit?: unknown;
  weight_kg?: unknown;
  notes?: unknown;
};
export type RawMetric = { date?: unknown; bodyweight_lb?: unknown };

export type RawLog = {
  exercises: RawExercise[];
  workouts: RawWorkout[];
  workoutExercises: RawWorkoutExercise[];
  sets: RawSet[];
  metrics: RawMetric[];
};

export type LoadedSet = {
  liftKey: string;
  liftLabel: string;
  date: string;
  workoutId: string;
  reps: number;
  weightLb: number;
  e1rmLb: number | null;
  tonnageLb: number;
};

export type LiftMeta = {
  key: string;
  label: string;
  goalLb: number | null;
};

export type BodyweightPoint = { date: string; bodyweightLb: number };

export type JumpAttempt = {
  date: string;
  exercise: string;
  inches: number;
  note: string;
};

export type JumpWork = {
  exercise: string;
  sessions: number;
  lastDate: string;
};

export type DataSource = "fixture" | "supabase";

export type DashboardData = {
  source: DataSource;
  today: string;
  generatedAt: string;
  lifts: LiftMeta[];
  sets: LoadedSet[];
  bodyweight: BodyweightPoint[];
  jumps: JumpAttempt[];
  jumpWork: JumpWork[];
};

export type PeriodKind = "2w" | "4w" | "month" | "block";

export type PeriodRow = {
  key: string;
  label: string;
  start: string;
  end: string;
  sessions: number;
  loadedSets: number;
  tonnageLb: number;
  deltaTonnageLb: number | null;
  deltaPct: number | null;
};

export type E1rmPoint = {
  date: string;
  e1rmLb: number;
  weightLb: number;
  reps: number;
};

export type TopSet = {
  date: string;
  weightLb: number;
  reps: number;
  e1rmLb: number;
};

export type WeekBar = { weekStart: string; tonnageLb: number };

export type LiftView = {
  lift: LiftMeta;
  points: E1rmPoint[];
  topSets: TopSet[];
  periods: PeriodRow[];
  best: E1rmPoint | null;
  latest: E1rmPoint | null;
};
