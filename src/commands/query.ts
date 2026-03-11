import { buildSessionGridCardModel } from "../cards/session-grid.js";
import { err, ok, type JsonEnvelope } from "../json-envelope.js";
import { queryBestSetByReps, queryEstimatedOneRm, queryHistory } from "../train-api.js";

interface SessionGridCardResult {
  exercise: string;
  period_weeks: number;
  planned_days: string[];
  weekly_volume_kg: number[];
  stats: {
    total_sessions: number;
    frequency_per_week: number;
    consistency_percent: number;
  };
  html: string;
}

export const queryE1rm = queryEstimatedOneRm;
export const queryBestSet = queryBestSetByReps;

export async function querySessionGridCard(opts: {
  exercise: string;
  period_weeks?: number;
}): Promise<JsonEnvelope<SessionGridCardResult>> {
  const exercise = opts.exercise?.trim();
  if (!exercise) return err("Exercise name is required.");

  const periodWeeks = opts.period_weeks ?? 4;
  if (!Number.isInteger(periodWeeks) || periodWeeks <= 0) {
    return err("--weeks must be a positive integer.");
  }

  const historyResult = await queryHistory({ last: `${periodWeeks}w`, exercise });
  if (!historyResult.ok) return err(historyResult.error);

  const model = buildSessionGridCardModel(exercise, historyResult.data.rows, periodWeeks);
  return ok({
    exercise: model.exercise,
    period_weeks: model.period_weeks,
    planned_days: model.planned_days,
    weekly_volume_kg: model.weekly_volume_kg,
    stats: model.stats,
    html: model.html,
  });
}
