/**
 * Athlete Index configuration.
 *
 * Defines which lifts/metrics roll up into each dimension of the Athlete
 * Index. v1 default; will become user-pinnable later.
 */

export type DimensionConfig = {
  label: string;
  lifts: string[]; // exact `exercises.name` matches in Supabase
};

export const INDEX_CONFIG = {
  strength: {
    label: "Strength",
    lifts: [
      "Back Squat",
      "Bench Press",
      "Front Squat",
      "Deadlift",
      "Pull-up +25",
      "Weighted Pull-up",
    ],
  } satisfies DimensionConfig,

  power: {
    label: "Power & Speed",
    lifts: [
      "Hang Snatch",
      "Power Clean",
      "Power Snatch",
      "Muscle Snatch",
      "Snatch DL",
      "Snatch Deadlift",
      "Clean Deadlift",
      "Overhead Squat",
    ],
  } satisfies DimensionConfig,

  // Body comp uses bodyweight + target from arc, special formula
  comp: {
    label: "Body Comp",
    // Target BW pulled from arc; if missing we default to current = maintain
    // and the index sits at 100.
    targetBwLb: 191,
  },

  // Mobility — no data source yet; rendered as "not measured"
  mobility: {
    label: "Mobility",
    metrics: [] as string[],
  },
};
