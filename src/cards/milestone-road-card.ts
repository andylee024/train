interface ExercisePalette {
  accent: string;
  accentSoft: string;
  accentDark: string;
  track: string;
  border: string;
}

export interface MilestoneGoal {
  exercise: string;
  startKg: number;
  currentKg: number;
  targetKg: number;
  achievedAt?: string | null;
  targetLabel?: string | null;
  currentLabel?: string | null;
  startLabel?: string | null;
  checkpoints?: number;
}

type GoalState = "in_progress" | "achieved" | "exceeded";

const DEFAULT_CHECKPOINTS = 3;

export const CARD_E_EXERCISE_COLORS: Readonly<Record<string, ExercisePalette>> = Object.freeze({
  squat: {
    accent: "#cb4b2d",
    accentSoft: "#f8ddd6",
    accentDark: "#7a2a18",
    track: "#fff2ed",
    border: "#efb7a8",
  },
  "bench press": {
    accent: "#2f7de1",
    accentSoft: "#d9e9ff",
    accentDark: "#1f4d84",
    track: "#edf5ff",
    border: "#b8d3fb",
  },
  deadlift: {
    accent: "#d08b1b",
    accentSoft: "#fce8c5",
    accentDark: "#7c4d09",
    track: "#fff7e9",
    border: "#efcc8f",
  },
  "overhead press": {
    accent: "#008977",
    accentSoft: "#d6f3ee",
    accentDark: "#005046",
    track: "#ebfaf7",
    border: "#a8ddd5",
  },
  "pull-up": {
    accent: "#2f9951",
    accentSoft: "#dcf5e4",
    accentDark: "#1d5d31",
    track: "#eefcf2",
    border: "#bce7ca",
  },
  default: {
    accent: "#526071",
    accentSoft: "#e5e9ef",
    accentDark: "#2f3945",
    track: "#f4f6f9",
    border: "#cfd8e3",
  },
});

export function renderMilestoneCard(goals: MilestoneGoal[]): string {
  validateGoals(goals);

  const sections = goals
    .map((goal) => {
      const palette = paletteForExercise(goal.exercise);
      const goalState = deriveGoalState(goal);
      const checkpoints = buildCheckpointValues(
        goal.startKg,
        goal.targetKg,
        sanitizeCheckpointCount(goal.checkpoints)
      );
      const [scaleMin, scaleMax] = buildScale(goal, checkpoints);
      const progressForBar = clamp(goalState.rawProgress, 0, 1);

      const startMarker = renderMarker({
        kind: "start",
        label: goal.startLabel ?? "Start",
        valueKg: goal.startKg,
        positionPercent: toPercent(goal.startKg, scaleMin, scaleMax),
      });

      const checkpointMarkers = checkpoints
        .map((checkpointValue, checkpointIndex) =>
          renderMarker({
            kind: "checkpoint",
            label: `M${checkpointIndex + 1}`,
            valueKg: checkpointValue,
            positionPercent: toPercent(checkpointValue, scaleMin, scaleMax),
            compact: true,
          })
        )
        .join("\n");

      const goalMarker = renderMarker({
        kind: "goal",
        label: goal.targetLabel ?? "Goal",
        valueKg: goal.targetKg,
        positionPercent: toPercent(goal.targetKg, scaleMin, scaleMax),
        state: goalState.state,
      });

      const currentHint =
        goalState.state === "in_progress"
          ? `${formatKg(goalState.remainingKg)}kg to go`
          : goalState.state === "exceeded"
            ? `+${formatKg(goalState.overKg)}kg`
            : "Goal hit";

      const currentMarker = renderMarker({
        kind: "current",
        label: goal.currentLabel ?? "Now",
        valueKg: goal.currentKg,
        positionPercent: toPercent(goal.currentKg, scaleMin, scaleMax),
        hint: currentHint,
        state: goalState.state,
      });

      const callout = renderCallout(goal, goalState);
      const percentageLabel = `${Math.round(Math.max(goalState.rawProgress, 0) * 100)}%`;

      return `
<section class="mr-goal mr-${goalState.state}" style="--mr-accent:${palette.accent};--mr-accent-soft:${palette.accentSoft};--mr-accent-dark:${palette.accentDark};--mr-track:${palette.track};--mr-border:${palette.border};">
  <header class="mr-goal-head">
    <div>
      <h2>${escapeHtml(goal.exercise)}</h2>
      <p>${stateLabel(goalState.state)}</p>
    </div>
    <span class="mr-goal-percent">${percentageLabel}</span>
  </header>

  <div class="mr-road">
    <div class="mr-road-track"></div>
    ${startMarker}
    ${checkpointMarkers}
    ${goalMarker}
    ${currentMarker}
  </div>

  <div class="mr-progress-meta">
    <span>Current <strong>${formatKg(goal.currentKg)}kg</strong></span>
    <span>Target <strong>${formatKg(goal.targetKg)}kg</strong></span>
  </div>
  <div class="mr-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progressForBar * 100)}">
    <span class="mr-progress-fill" style="width:${(progressForBar * 100).toFixed(2)}%"></span>
  </div>

  <p class="mr-callout">${escapeHtml(callout)}</p>
</section>
`.trim();
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Milestone Road Card</title>
  <style>
    :root {
      color-scheme: light;
      --canvas: #f4f6f8;
      --ink: #17202c;
      --muted: #516073;
      --card-shadow: 0 18px 40px rgba(19, 28, 41, 0.12);
      --radius: 20px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      background:
        radial-gradient(circle at 8% 12%, rgba(203, 75, 45, 0.16), transparent 38%),
        radial-gradient(circle at 92% 78%, rgba(47, 125, 225, 0.14), transparent 42%),
        var(--canvas);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 18px;
    }

    .mr-shell {
      width: min(1080px, 100%);
      background: #ffffff;
      border-radius: 28px;
      box-shadow: var(--card-shadow);
      border: 1px solid #dde3ea;
      padding: 22px;
    }

    .mr-header {
      margin: 0 0 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e4e9f0;
    }

    .mr-header h1 {
      margin: 0;
      font-size: clamp(1.2rem, 2.3vw, 1.6rem);
      letter-spacing: 0.01em;
    }

    .mr-header p {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .mr-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .mr-goal {
      border-radius: var(--radius);
      border: 1px solid var(--mr-border);
      background: linear-gradient(180deg, #ffffff 0%, var(--mr-track) 100%);
      padding: 14px;
      min-height: 290px;
      display: grid;
      gap: 10px;
      align-content: start;
    }

    .mr-goal-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .mr-goal-head h2 {
      margin: 0;
      font-size: 1.1rem;
      line-height: 1.25;
    }

    .mr-goal-head p {
      margin: 2px 0 0;
      color: var(--mr-accent-dark);
      font-size: 0.83rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .mr-goal-percent {
      border-radius: 999px;
      background: var(--mr-accent-soft);
      color: var(--mr-accent-dark);
      font-size: 0.83rem;
      font-weight: 700;
      padding: 5px 10px;
      white-space: nowrap;
    }

    .mr-road {
      position: relative;
      height: 132px;
      margin-top: 2px;
      padding-top: 12px;
    }

    .mr-road-track {
      position: absolute;
      left: 0;
      right: 0;
      top: 72px;
      height: 12px;
      border-radius: 999px;
      background: linear-gradient(90deg, #f2f4f8 0%, #e8edf4 100%);
      border: 1px solid #d5dde7;
    }

    .mr-marker {
      position: absolute;
      transform: translateX(-50%);
      display: grid;
      justify-items: center;
      width: 86px;
      text-align: center;
      gap: 5px;
    }

    .mr-marker .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 3px solid #c3ccda;
      background: #ffffff;
      z-index: 1;
    }

    .mr-marker .label {
      display: block;
      font-size: 0.71rem;
      line-height: 1.25;
      color: #546073;
      font-weight: 600;
    }

    .mr-marker .label em {
      display: block;
      font-style: normal;
      font-size: 0.68rem;
      opacity: 0.82;
      color: #728096;
    }

    .mr-marker-start {
      top: 28px;
    }

    .mr-marker-checkpoint {
      top: 54px;
      width: 68px;
    }

    .mr-marker-checkpoint .dot {
      width: 10px;
      height: 10px;
      border-width: 2px;
      border-color: #b9c2d2;
      background: #fdfefe;
    }

    .mr-marker-checkpoint .label {
      font-size: 0.63rem;
      color: #728096;
    }

    .mr-marker-goal {
      top: 18px;
    }

    .mr-marker-goal .dot {
      border-color: var(--mr-accent);
      background: #fff;
    }

    .mr-achieved .mr-marker-goal .dot,
    .mr-exceeded .mr-marker-goal .dot {
      border-color: #219661;
      background: #d6f5e6;
      box-shadow: 0 0 0 4px rgba(33, 150, 97, 0.18);
    }

    .mr-marker-current {
      top: 84px;
    }

    .mr-marker-current .dot {
      width: 16px;
      height: 16px;
      border-width: 3px;
      border-color: var(--mr-accent-dark);
      background: var(--mr-accent);
    }

    .mr-marker-current .label {
      color: #293649;
    }

    .mr-progress-meta {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      color: #4a586a;
      font-size: 0.79rem;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .mr-progress-meta strong {
      color: #1f2a38;
      font-size: 0.86rem;
    }

    .mr-progress-track {
      position: relative;
      height: 10px;
      border-radius: 999px;
      background: #e2e8f0;
      border: 1px solid #d3dce8;
      overflow: hidden;
    }

    .mr-progress-fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--mr-accent) 0%, var(--mr-accent-dark) 100%);
      transition: width 220ms ease;
    }

    .mr-callout {
      margin: 4px 0 0;
      padding: 9px 11px;
      border-radius: 12px;
      background: var(--mr-accent-soft);
      color: var(--mr-accent-dark);
      font-size: 0.84rem;
      font-weight: 600;
      line-height: 1.32;
      border: 1px solid var(--mr-border);
    }

    @media (max-width: 680px) {
      body {
        padding: 16px 10px;
      }

      .mr-shell {
        border-radius: 20px;
        padding: 14px;
      }

      .mr-goal {
        min-height: 278px;
      }

      .mr-road {
        height: 124px;
      }

      .mr-road-track {
        top: 68px;
      }
    }
  </style>
</head>
<body>
  <main class="mr-shell" aria-label="Milestone Road Card">
    <header class="mr-header">
      <h1>Milestone Road</h1>
      <p>Progress from your starting point to your next performance targets.</p>
    </header>
    <section class="mr-grid">
      ${sections}
    </section>
  </main>
</body>
</html>`;
}

function validateGoals(goals: MilestoneGoal[]): void {
  if (!Array.isArray(goals) || goals.length === 0 || goals.length > 3) {
    throw new Error("renderMilestoneCard(goals) requires between 1 and 3 goals.");
  }

  for (const goal of goals) {
    if (!goal.exercise || !goal.exercise.trim()) {
      throw new Error("Each goal must include an exercise name.");
    }

    assertFinite(goal.startKg, "startKg");
    assertFinite(goal.currentKg, "currentKg");
    assertFinite(goal.targetKg, "targetKg");
  }
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}. Expected a finite number.`);
  }
}

function deriveGoalState(goal: MilestoneGoal): {
  state: GoalState;
  rawProgress: number;
  remainingKg: number;
  overKg: number;
  nextTargetKg: number;
} {
  const denominator = goal.targetKg - goal.startKg;
  const rawProgress = denominator === 0 ? (goal.currentKg >= goal.targetKg ? 1 : 0) : (goal.currentKg - goal.startKg) / denominator;

  const remainingKg = Math.max(goal.targetKg - goal.currentKg, 0);
  const overKg = Math.max(goal.currentKg - goal.targetKg, 0);

  const state: GoalState =
    goal.currentKg > goal.targetKg
      ? "exceeded"
      : goal.currentKg >= goal.targetKg || Boolean(goal.achievedAt)
        ? "achieved"
        : "in_progress";

  return {
    state,
    rawProgress,
    remainingKg,
    overKg,
    nextTargetKg: suggestNextTarget(goal.targetKg),
  };
}

function suggestNextTarget(targetKg: number): number {
  const increment = targetKg >= 120 ? 5 : 2.5;
  const next = targetKg + increment;
  return Math.round(next * 10) / 10;
}

function sanitizeCheckpointCount(value: number | undefined): number {
  if (value === undefined) return DEFAULT_CHECKPOINTS;
  if (!Number.isFinite(value)) return DEFAULT_CHECKPOINTS;
  return clamp(Math.round(value), 1, 5);
}

function buildCheckpointValues(startKg: number, targetKg: number, count: number): number[] {
  if (count <= 0) return [];

  const checkpoints: number[] = [];
  for (let index = 1; index <= count; index += 1) {
    const ratio = index / (count + 1);
    checkpoints.push(startKg + (targetKg - startKg) * ratio);
  }
  return checkpoints;
}

function buildScale(goal: MilestoneGoal, checkpoints: number[]): [number, number] {
  const values = [goal.startKg, goal.targetKg, goal.currentKg, ...checkpoints];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (minValue === maxValue) {
    return [minValue - 1, maxValue + 1];
  }

  const padding = Math.max((maxValue - minValue) * 0.05, 1);
  return [minValue - padding, maxValue + padding];
}

function toPercent(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function formatKg(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
}

function formatShortDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function renderCallout(
  goal: MilestoneGoal,
  goalState: {
    state: GoalState;
    remainingKg: number;
    overKg: number;
    nextTargetKg: number;
  }
): string {
  if (goalState.state === "exceeded") {
    const achievedDate = goal.achievedAt ? formatShortDate(goal.achievedAt) : null;
    const dateSuffix = achievedDate ? ` (hit on ${achievedDate})` : "";
    return `${formatKg(goalState.overKg)}kg past your goal${dateSuffix}. Next target: ${formatKg(goalState.nextTargetKg)}kg.`;
  }

  if (goalState.state === "achieved") {
    const targetLabel = goal.targetLabel ?? `${formatKg(goal.targetKg)}kg`;
    const achievedDate = goal.achievedAt ? formatShortDate(goal.achievedAt) : null;
    const dateSuffix = achievedDate ? ` on ${achievedDate}` : "";
    return `Hit ${targetLabel}${dateSuffix}. Celebrate this win and set ${formatKg(goalState.nextTargetKg)}kg next.`;
  }

  const targetLabel = goal.targetLabel ?? `${formatKg(goal.targetKg)}kg`;
  return `${formatKg(goalState.remainingKg)}kg to ${targetLabel}. Stay steady and close the gap.`;
}

function stateLabel(state: GoalState): string {
  if (state === "exceeded") return "Goal Exceeded";
  if (state === "achieved") return "Goal Achieved";
  return "In Progress";
}

function paletteForExercise(exercise: string): ExercisePalette {
  const normalized = exercise.toLowerCase();

  if (normalized.includes("squat")) return CARD_E_EXERCISE_COLORS.squat;
  if (normalized.includes("bench")) return CARD_E_EXERCISE_COLORS["bench press"];
  if (normalized.includes("deadlift")) return CARD_E_EXERCISE_COLORS.deadlift;
  if (normalized.includes("press")) return CARD_E_EXERCISE_COLORS["overhead press"];
  if (normalized.includes("pull") || normalized.includes("chin")) return CARD_E_EXERCISE_COLORS["pull-up"];

  return CARD_E_EXERCISE_COLORS.default;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarker(options: {
  kind: "start" | "checkpoint" | "goal" | "current";
  label: string;
  valueKg: number;
  positionPercent: number;
  compact?: boolean;
  hint?: string;
  state?: GoalState;
}): string {
  const classes = ["mr-marker", `mr-marker-${options.kind}`];

  if (options.kind === "goal" && options.state && options.state !== "in_progress") {
    classes.push("is-complete");
  }

  if (options.kind === "current" && options.state === "exceeded") {
    classes.push("is-surpassed");
  }

  const hint = options.hint ? `<em>${escapeHtml(options.hint)}</em>` : "";

  const displayLabel = options.compact
    ? `${escapeHtml(options.label)} · ${formatKg(options.valueKg)}kg`
    : `${escapeHtml(options.label)} · ${formatKg(options.valueKg)}kg${hint}`;

  return `<div class="${classes.join(" ")}" style="left:${options.positionPercent.toFixed(2)}%;"><span class="dot"></span><span class="label">${displayLabel}</span></div>`;
}
