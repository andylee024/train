import test from "node:test";
import assert from "node:assert/strict";
import { buildSessionGridCardModel, renderSessionGridCard } from "./session-grid.js";
import type { HistoryRow } from "../train-api.js";

function makeRow(params: {
  workoutId: string;
  sessionDate: string;
  exercise?: string;
  rpe?: number | null;
  weightKg?: number | null;
  reps?: number | null;
}): HistoryRow {
  const exercise = params.exercise ?? "Back Squat";
  return {
    session_date: params.sessionDate,
    performed_at: `${params.sessionDate}T00:00:00+00:00`,
    workout_id: params.workoutId,
    exercise_name: exercise,
    set_number: 1,
    reps: params.reps ?? 5,
    duration_seconds: null,
    weight_value: params.weightKg ?? null,
    weight_unit: params.weightKg == null ? null : "kg",
    weight_kg: params.weightKg ?? null,
    rpe: params.rpe ?? null,
  };
}

function currentPeriodStart(periodWeeks: number): Date {
  const today = new Date();
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + mondayOffset - (periodWeeks - 1) * 7);
  return date;
}

function isoFromPeriodStart(periodWeeks: number, weekOffset: number, weekdayMonFirst: number): string {
  const start = currentPeriodStart(periodWeeks);
  const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + weekOffset * 7 + (weekdayMonFirst - 1));
  return date.toISOString().slice(0, 10);
}

function makeRowsInRecentRange(totalSessions: number, stepDays: number): HistoryRow[] {
  const rows: HistoryRow[] = [];
  const today = new Date();
  const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  for (let i = 0; i < totalSessions; i += 1) {
    const date = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - i * stepDays);
    rows.push(
      makeRow({
        workoutId: `freq-${i}`,
        sessionDate: date.toISOString().slice(0, 10),
        rpe: 7,
        weightKg: 100,
        reps: 5,
      })
    );
  }

  return rows;
}

test("renders intensity levels from average session RPE thresholds", () => {
  const sessions: HistoryRow[] = [
    makeRow({ workoutId: "w1", sessionDate: isoFromPeriodStart(4, 0, 1), rpe: 6.4, weightKg: 100, reps: 5 }),
    makeRow({ workoutId: "w2", sessionDate: isoFromPeriodStart(4, 0, 2), rpe: 7.4, weightKg: 110, reps: 5 }),
    makeRow({ workoutId: "w3", sessionDate: isoFromPeriodStart(4, 1, 1), rpe: 8.4, weightKg: 120, reps: 5 }),
    makeRow({ workoutId: "w4", sessionDate: isoFromPeriodStart(4, 1, 2), rpe: 7.2, weightKg: 108, reps: 5 }),
    makeRow({ workoutId: "w5", sessionDate: isoFromPeriodStart(4, 2, 1), rpe: 8.1, weightKg: 122, reps: 4 }),
    makeRow({ workoutId: "w6", sessionDate: isoFromPeriodStart(4, 2, 2), rpe: 6.5, weightKg: 95, reps: 5 }),
  ];

  const html = renderSessionGridCard("Back Squat", sessions, 4);

  assert.match(html, /avg RPE 6\.4/);
  assert.match(html, /avg RPE 7\.4/);
  assert.match(html, /avg RPE 8\.4/);
  assert.match(html, /sg-hit sg-light/);
  assert.match(html, /sg-hit sg-moderate/);
  assert.match(html, /sg-hit sg-heavy/);
});

test("marks missed planned sessions with dashed outline", () => {
  const sessions: HistoryRow[] = [
    makeRow({ workoutId: "one", sessionDate: "2026-03-03", rpe: 7.1, weightKg: 100, reps: 5 }),
  ];

  const html = renderSessionGridCard("Back Squat", sessions, 4);
  assert.match(html, /missed planned session/);
});

test("supports variable training frequencies (2x, 3x, 4x)", () => {
  const twoPerWeek = buildSessionGridCardModel("Back Squat", makeRowsInRecentRange(8, 3), 4);
  const threePerWeek = buildSessionGridCardModel("Back Squat", makeRowsInRecentRange(12, 2), 4);
  const fourPerWeek = buildSessionGridCardModel("Back Squat", makeRowsInRecentRange(16, 1), 4);

  assert.equal(twoPerWeek.planned_days.length, 2);
  assert.equal(threePerWeek.planned_days.length, 3);
  assert.equal(fourPerWeek.planned_days.length, 4);
});

test("works for 4-week and 12-week periods", () => {
  const sessions = makeRowsInRecentRange(16, 1);

  const fourWeeks = buildSessionGridCardModel("Back Squat", sessions, 4);
  const twelveWeeks = buildSessionGridCardModel("Back Squat", sessions, 12);

  assert.equal(fourWeeks.period_weeks, 4);
  assert.equal(fourWeeks.weekly_volume_kg.length, 4);

  assert.equal(twelveWeeks.period_weeks, 12);
  assert.equal(twelveWeeks.weekly_volume_kg.length, 12);
});
