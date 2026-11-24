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
export type RawMeasurement = { id?: unknown; date?: unknown; metric?: unknown; value?: unknown };

export type RawLog = {
  exercises: RawExercise[];
  workouts: RawWorkout[];
  workoutExercises: RawWorkoutExercise[];
  sets: RawSet[];
  metrics: RawMetric[];
  measurements: RawMeasurement[];
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

/** Reps logged for one exercise in one workout, loaded or not (feeds reactive contacts). */
export type RepsLogged = { date: string; workoutId: string; exercise: string; reps: number };

/** A numeric row from `measurements` (wall tests, ladder rung). */
export type Measurement = { date: string; metric: string; value: number };

export type DriverKey = "reactive" | "explosive" | "approach" | "strength" | "bodyweight";

export type DriverWeek = {
  weekStart: string;
  values: Record<DriverKey, number | null>;
  scores: Record<DriverKey, number | null>;
  composite: number | null;
  measured: number;
  squatE1rmLb: number | null;
  cleanE1rmLb: number | null;
  reactiveContacts: number;
  reactivePrev: number | null;
  approachPrev: number | null;
  reactiveTestDate: string | null;
  approachTestDate: string | null;
  approachTouchIn: number | null;
  ladderRung: number | null;
  jumpSessions: number;
};

export type DriverStatus =
  | "improving"
  | "flat"
  | "slipping"
  | "unmeasured"
  | "new"
  | "dose-none"
  | "dose-light"
  | "dose-on";

export type DriverNow = {
  weekStart: string;
  composite: number | null;
  compositeChange: number | null;
  measured: number;
  limiter: DriverKey | null;
  drivers: {
    key: DriverKey;
    score: number | null;
    value: number | null;
    status: DriverStatus;
    track: "no reading" | "goal hit" | "on pace" | "behind";
    expected: number | null;
    pace: number | null;
  }[];
  reactiveContacts: number;
  reactiveTestDate: string | null;
  approachTestDate: string | null;
  approachTouchIn: number | null;
  ladderRung: number | null;
  jumpSessions: number;
};

export type DriversView = { weeks: DriverWeek[]; now: DriverNow | null };

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
  reps: RepsLogged[];
  measurements: Measurement[];
  drivers: DriversView;
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
