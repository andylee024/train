import { addDays, diffDays, weekStartSunday } from "./dates";
import type {
  BodyweightPoint,
  DriverKey,
  DriverNow,
  DriversView,
  DriverWeek,
  LoadedSet,
  Measurement,
  RepsLogged,
} from "./types";

/**
 * Jump Drivers: the five qualities the dunk plan trains, each scored 0–100 from a floor to its
 * Jan 30 goal, plus a weighted geometric-mean composite. Same rules as the Jump Drivers artifact.
 */
export type DriverConfig = {
  key: DriverKey;
  name: string;
  oneLiner: string;
  measure: string;
  unit: string;
  floor: number;
  target: number;
  weight: number;
  digits: number;
  retest: boolean;
};

export const DRIVERS: DriverConfig[] = [
  {
    key: "reactive",
    name: "Reactive",
    oneLiner: "How springy you are off the ground.",
    measure: "Depth-jump touch − standing touch, at retests",
    unit: "in",
    floor: 0,
    target: 4,
    weight: 25,
    digits: 1,
    retest: true,
  },
  {
    key: "explosive",
    name: "Explosive",
    oneLiner: "How much of your strength you can use fast.",
    measure: "Power clean e1RM ÷ back squat e1RM",
    unit: "",
    floor: 0.55,
    target: 0.75,
    weight: 25,
    digits: 2,
    retest: false,
  },
  {
    key: "approach",
    name: "Approach skill",
    oneLiner: "What your run-up adds to your jump.",
    measure: "Approach touch − standing touch, at retests",
    unit: "in",
    floor: 3,
    target: 9,
    weight: 20,
    digits: 1,
    retest: true,
  },
  {
    key: "strength",
    name: "Strength",
    oneLiner: "How much force you have for your size.",
    measure: "Back squat e1RM ÷ bodyweight",
    unit: "×",
    floor: 1.5,
    target: 2.0,
    weight: 15,
    digits: 2,
    retest: false,
  },
  {
    key: "bodyweight",
    name: "Bodyweight",
    oneLiner: "How much you have to get off the ground.",
    measure: "Latest weigh-in",
    unit: "lb",
    floor: 195,
    target: 184,
    weight: 15,
    digits: 1,
    retest: false,
  },
];

export const TOUCH_TARGET_IN = 127;
export const CONTACTS_PLAN = 55;
export const DRIVERS_START = "2026-07-05";
export const DRIVERS_ARC_START = "2026-11-08";
export const DRIVERS_GOAL_DATE = "2027-01-30";

/** Exercises whose logged reps count as reactive contacts. */
export const REACTIVE_EXERCISES = [
  "Depth Jump",
  "Low Box Depth Jump",
  "Pogo Jumps (ankle hops)",
  "Single-Leg Pogos",
  "Reactive Hurdle Jumps",
  "Single-Leg Bounds",
];

/** Exercises that make a workout a jump session. */
export const JUMP_SESSION_EXERCISES = [...REACTIVE_EXERCISES, "Approach Jumps", "Dunk Attempts"];

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;

export function scoreFor(driver: DriverConfig, value: number | null): number | null {
  if (value == null) return null;
  const scaled = (100 * (value - driver.floor)) / (driver.target - driver.floor);
  return Math.round(Math.max(0, Math.min(100, scaled)));
}

type Inputs = {
  sets: LoadedSet[];
  bodyweight: BodyweightPoint[];
  reps: RepsLogged[];
  measurements: Measurement[];
  today: string;
};

type Retest = { date: string; standing: number | null; dj: number | null; approach: number | null };

function bestE1rm(sets: LoadedSet[], liftKey: string, maxReps: number, from: string, to: string): number | null {
  let best: number | null = null;
  for (const set of sets) {
    if (set.liftKey !== liftKey || set.e1rmLb == null || set.reps < 1 || set.reps > maxReps) continue;
    if (set.date < from || set.date > to) continue;
    if (best == null || set.e1rmLb > best) best = set.e1rmLb;
  }
  return best == null ? null : Math.round(best);
}

/** Lifts: best in the last 6 weeks, else the last 12, so a quiet month doesn't drop a driver. */
function liftFor(sets: LoadedSet[], liftKey: string, maxReps: number, weekStart: string): number | null {
  const end = addDays(weekStart, 6);
  return (
    bestE1rm(sets, liftKey, maxReps, addDays(weekStart, -35), end) ??
    bestE1rm(sets, liftKey, maxReps, addDays(weekStart, -77), end)
  );
}

function retests(measurements: Measurement[]): Retest[] {
  const byDate = new Map<string, Retest>();
  const take = (current: number | null, value: number) => (current == null || value > current ? value : current);
  for (const row of measurements) {
    const bucket = byDate.get(row.date) ?? { date: row.date, standing: null, dj: null, approach: null };
    if (row.metric === "standing_touch_in") bucket.standing = take(bucket.standing, row.value);
    else if (row.metric === "dj_touch_in") bucket.dj = take(bucket.dj, row.value);
    else if (row.metric === "approach_touch_in") bucket.approach = take(bucket.approach, row.value);
    else continue;
    byDate.set(row.date, bucket);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Latest and previous gap on or before a date, with the latest test date. */
function gapAsOf(tests: Retest[], end: string, gap: (test: Retest) => number | null) {
  const found = tests.filter((test) => test.date <= end && gap(test) != null);
  const latest = found[found.length - 1];
  const previous = found[found.length - 2];
  return {
    value: latest ? gap(latest) : null,
    previous: previous ? gap(previous) : null,
    date: latest ? latest.date : null,
  };
}

/** One row per Sunday week from July 5 to this week, then this week's read. */
export function jumpDrivers({ sets, bodyweight, reps, measurements, today }: Inputs): DriversView {
  const tests = retests(measurements);
  const ladder = measurements.filter((row) => row.metric === "ladder_rung");
  const reactive = new Set(REACTIVE_EXERCISES);
  const jumpy = new Set(JUMP_SESSION_EXERCISES);
  const thisWeek = weekStartSunday(today);

  const weeks: DriverWeek[] = [];
  for (let ws = DRIVERS_START; ws <= thisWeek; ws = addDays(ws, 7)) {
    const end = addDays(ws, 6);
    const squat = liftFor(sets, "back-squat", 8, ws);
    const clean = liftFor(sets, "power-clean", 5, ws);
    const bw = [...bodyweight].reverse().find((point) => point.date <= end)?.bodyweightLb ?? null;
    const reactiveGap = gapAsOf(tests, end, (t) => (t.dj != null && t.standing != null ? t.dj - t.standing : null));
    const approachGap = gapAsOf(tests, end, (t) =>
      t.approach != null && t.standing != null ? t.approach - t.standing : null,
    );
    const touch = gapAsOf(tests, end, (t) => t.approach);
    const inWeek = reps.filter((row) => row.date >= ws && row.date <= end);
    const contacts = inWeek.filter((row) => reactive.has(row.exercise)).reduce((sum, row) => sum + row.reps, 0);
    const sessions = new Set(inWeek.filter((row) => jumpy.has(row.exercise)).map((row) => row.workoutId)).size;
    const rungs = ladder.filter((row) => row.date <= end).map((row) => row.value);

    const raw: Record<DriverKey, number | null> = {
      reactive: reactiveGap.value,
      explosive: squat && clean ? clean / squat : null,
      approach: approachGap.value,
      strength: squat && bw ? squat / bw : null,
      bodyweight: bw,
    };
    const values = {} as Record<DriverKey, number | null>;
    const scores = {} as Record<DriverKey, number | null>;
    let logSum = 0;
    let weightSum = 0;
    let measured = 0;
    for (const driver of DRIVERS) {
      const value = raw[driver.key] == null ? null : round(raw[driver.key] as number, driver.digits);
      const score = scoreFor(driver, value);
      values[driver.key] = value;
      scores[driver.key] = score;
      if (score != null) {
        logSum += driver.weight * Math.log(Math.max(score, 5) / 100);
        weightSum += driver.weight;
        measured += 1;
      }
    }

    weeks.push({
      weekStart: ws,
      values,
      scores,
      composite: measured ? Math.round(100 * Math.exp(logSum / weightSum)) : null,
      measured,
      squatE1rmLb: squat,
      cleanE1rmLb: clean,
      reactiveContacts: contacts,
      reactivePrev: reactiveGap.previous,
      approachPrev: approachGap.previous,
      reactiveTestDate: reactiveGap.date,
      approachTestDate: touch.date,
      approachTouchIn: touch.value,
      ladderRung: rungs.length ? Math.max(...rungs) : null,
      jumpSessions: sessions,
    });
  }

  return { weeks, now: weeks.length ? readNow(weeks) : null };
}

function readNow(weeks: DriverWeek[]): DriverNow {
  const i = weeks.length - 1;
  const cur = weeks[i];
  const back = weeks[Math.max(0, i - 4)];
  const drivers: DriverNow["drivers"] = [];
  let limiter: DriverConfig | null = null;
  let limiterScore = Infinity;

  for (const driver of DRIVERS) {
    const score = cur.scores[driver.key];
    const value = cur.values[driver.key];
    let status: DriverNow["drivers"][number]["status"] = "unmeasured";
    if (score != null) {
      const prior = driver.retest
        ? scoreFor(driver, driver.key === "reactive" ? cur.reactivePrev : cur.approachPrev)
        : i >= 3
          ? weeks[i - 3].scores[driver.key]
          : null;
      if (prior == null) status = "new";
      else if (score - prior >= 3) status = "improving";
      else if (score - prior <= -3) status = "slipping";
      else status = "flat";
      if (score < limiterScore) {
        limiterScore = score;
        limiter = driver;
      }
    }

    // Goal pace: straight line from the first reading since the arc began to the goal on Jan 30.
    const first =
      weeks.find((week) => week.weekStart >= DRIVERS_ARC_START && week.values[driver.key] != null) ??
      weeks.find((week) => week.values[driver.key] != null);
    let track: DriverNow["drivers"][number]["track"] = "no reading";
    let expected: number | null = null;
    let pace: number | null = null;
    if (value != null && first) {
      const start = first.values[driver.key] as number;
      const total = diffDays(first.weekStart, DRIVERS_GOAL_DATE);
      const elapsed = diffDays(first.weekStart, addDays(cur.weekStart, 6));
      const frac = Math.min(1, Math.max(0, elapsed / total));
      expected = round(start + (driver.target - start) * frac, driver.digits);
      const weeksLeft = Math.max(1, diffDays(addDays(cur.weekStart, 6), DRIVERS_GOAL_DATE) / 7);
      pace = round((driver.target - value) / weeksLeft, driver.digits + 1);
      const rising = driver.target >= driver.floor;
      const hit = rising ? value >= driver.target : value <= driver.target;
      const ahead = rising ? value >= expected : value <= expected;
      track = hit ? "goal hit" : ahead ? "on pace" : "behind";
    }

    if (driver.key === "reactive") {
      const contacts = cur.reactiveContacts;
      status = contacts === 0 ? "dose-none" : contacts >= 45 ? "dose-on" : "dose-light";
    }

    drivers.push({ key: driver.key, score, value, status, track, expected, pace });
  }

  return {
    weekStart: cur.weekStart,
    composite: cur.composite,
    compositeChange: i >= 4 && cur.composite != null && back.composite != null ? cur.composite - back.composite : null,
    measured: cur.measured,
    limiter: limiter ? (limiter as DriverConfig).key : null,
    drivers,
    reactiveContacts: cur.reactiveContacts,
    reactiveTestDate: cur.reactiveTestDate,
    approachTestDate: cur.approachTestDate,
    approachTouchIn: cur.approachTouchIn,
    ladderRung: cur.ladderRung,
    jumpSessions: cur.jumpSessions,
  };
}

export const STATUS_LABEL: Record<DriverNow["drivers"][number]["status"], string> = {
  improving: "Improving",
  flat: "Flat",
  slipping: "Slipping",
  unmeasured: "Not tested yet",
  new: "Baseline",
  "dose-none": "No work this week",
  "dose-light": "Light week",
  "dose-on": "On plan",
};

/** What to do next week, per driver and status. */
export const TODO: Record<DriverKey, Partial<Record<DriverNow["drivers"][number]["status"], string>>> = {
  reactive: {
    "dose-none":
      "No reactive work logged this week. J1 is where it happens: depth jumps, hurdle hops and pogos after the approach jumps. Log the reps so they count.",
    "dose-light":
      "Some reactive work, but under the plan. Finish J1's depth jumps and hops; if a day was lost, don't make it up, just get next week's J1 in.",
    "dose-on": "On plan. Keep every contact quick and full intent; stop a set when contacts feel slower.",
  },
  explosive: {
    unmeasured: "Needs a power clean and a back squat in the last 12 weeks.",
    new: "Baseline set. Three more weeks of readings show the trend; run the plan as written.",
    improving: "Keep Coach Zhou's cleans as written and the jump squats on P1.",
    flat: "Add speed, not load: jump squats at 20–25% of your squat (Block P) or speed squats at 60–65% (Block R), every rep fast. A heavier squat won't fix this ratio.",
    slipping:
      "If your squat went up, the ratio drops even though nothing got worse; check the clean itself. If the clean dropped, you're likely tired: keep her percentages but end sets when the bar slows.",
  },
  approach: {
    unmeasured:
      "First test at the W4 retest (Tue Dec 1): at the wall, best standing touch and best approach touch. The gap is what your approach adds. Until then, keep the 3-step drills.",
    new: "Baseline set at the retest. The next retest shows the trend; keep the 3-step drills and filmed technique jumps.",
    improving: "Keep the 3-step drills and filmed technique jumps.",
    flat: "More approach practice before max jumps: 6 filmed 3-step drills, cueing a long, low penultimate step and a quick last step. Compare the video week to week.",
    slipping: "Usually tired legs or rushed reps. Take full 2' rests and stop when your touch drops twice in a row.",
  },
  strength: {
    unmeasured: "Needs a back squat in the last 12 weeks and a recent weigh-in.",
    new: "Baseline set. Three more weeks of readings show the trend; run the plan as written.",
    improving: "Hold the squat at 2 sets to a box. You're close to target and strength isn't the limiter.",
    flat: "Fine to hold here. Only if it sits under 1.85× add a third squat set on Sunday.",
    slipping: "If the squat dropped, add a set back for two weeks. If your bodyweight rose, it's the weight, not the squat.",
  },
  bodyweight: {
    unmeasured: "Weigh in every Sunday morning.",
    new: "Baseline set. Three more weeks of readings show the trend.",
    improving: "Keep it slow and steady; dropping fast costs strength.",
    flat: "Every pound off is free height. Tighten intake on rest days and keep protein high.",
    slipping: "Weight is going up. If it's up two weeks running, trim intake.",
  },
};
