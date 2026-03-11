import test from "node:test";
import assert from "node:assert/strict";

import { detectPRs, type SetInfo } from "../src/pr-detection.ts";

function set(overrides: Partial<SetInfo>): SetInfo {
  return {
    workout_id: "w-default",
    set_index: 1,
    reps: null,
    duration_seconds: null,
    weight_value: null,
    weight_unit: null,
    weight_kg: null,
    ...overrides,
  };
}

function byType(result: ReturnType<typeof detectPRs>, type: "weight" | "rep" | "e1rm" | "volume") {
  return result.find((entry) => entry.type === type);
}

test("detects weight PR", () => {
  const history = [
    set({ workout_id: "w1", reps: 8, weight_value: 100, weight_unit: "kg", weight_kg: 100 }),
    set({ workout_id: "w1", reps: 1, weight_value: 120, weight_unit: "kg", weight_kg: 120 }),
  ];
  const current = [set({ workout_id: "w2", reps: 1, weight_value: 122.5, weight_unit: "kg", weight_kg: 122.5 })];

  const result = detectPRs("Bench Press", current, history);
  const weightPr = byType(result, "weight");

  assert.ok(weightPr);
  assert.equal(weightPr.value, 122.5);
  assert.equal(weightPr.previous_best, 120);
  assert.equal(weightPr.delta, 2.5);
});

test("detects rep PR at fixed load", () => {
  const history = [
    set({ workout_id: "w1", reps: 5, weight_value: 100, weight_unit: "kg", weight_kg: 100 }),
    set({ workout_id: "w1", reps: 1, weight_value: 120, weight_unit: "kg", weight_kg: 120 }),
  ];
  const current = [set({ workout_id: "w2", reps: 6, weight_value: 100, weight_unit: "kg", weight_kg: 100 })];

  const result = detectPRs("Bench Press", current, history);
  const repPr = byType(result, "rep");

  assert.ok(repPr);
  assert.equal(repPr.value, 6);
  assert.equal(repPr.previous_best, 5);
  assert.equal(repPr.delta, 1);
});

test("detects e1RM PR", () => {
  const history = [
    set({ workout_id: "w1", reps: 1, weight_value: 140, weight_unit: "kg", weight_kg: 140 }),
    set({ workout_id: "w1", reps: 5, weight_value: 100, weight_unit: "kg", weight_kg: 100 }),
  ];
  const current = [set({ workout_id: "w2", reps: 6, weight_value: 130, weight_unit: "kg", weight_kg: 130 })];

  const result = detectPRs("Squat", current, history);
  const e1rmPr = byType(result, "e1rm");

  assert.ok(e1rmPr);
  assert.equal(e1rmPr.value, 156);
  assert.equal(e1rmPr.previous_best, 144.667);
  assert.equal(e1rmPr.delta, 11.333);
});

test("returns empty array when no PRs are hit", () => {
  const history = [
    set({ workout_id: "w1", reps: 8, weight_value: 110, weight_unit: "kg", weight_kg: 110 }),
    set({ workout_id: "w1", reps: 6, weight_value: 100, weight_unit: "kg", weight_kg: 100 }),
  ];
  const current = [set({ workout_id: "w2", reps: 5, weight_value: 100, weight_unit: "kg", weight_kg: 100 })];

  const result = detectPRs("Bench Press", current, history);
  assert.deepEqual(result, []);
});

test("can detect multiple PR types in one session", () => {
  const history = [
    set({ workout_id: "w1", reps: 4, weight_value: 100, weight_unit: "kg", weight_kg: 100, set_index: 1 }),
    set({ workout_id: "w1", reps: 1, weight_value: 110, weight_unit: "kg", weight_kg: 110, set_index: 2 }),
  ];
  const current = [
    set({ workout_id: "w2", reps: 6, weight_value: 100, weight_unit: "kg", weight_kg: 100, set_index: 1 }),
    set({ workout_id: "w2", reps: 2, weight_value: 112.5, weight_unit: "kg", weight_kg: 112.5, set_index: 2 }),
  ];

  const result = detectPRs("Bench Press", current, history);
  const types = result.map((entry) => entry.type);

  assert.deepEqual(types, ["weight", "rep", "e1rm", "volume"]);
});

test("handles bodyweight exercises with volume-only PRs", () => {
  const history = [
    set({ workout_id: "w1", reps: 10, weight_unit: "bw", weight_value: null, weight_kg: null }),
    set({ workout_id: "w1", reps: 10, weight_unit: "bw", weight_value: null, weight_kg: null }),
  ];
  const current = [
    set({ workout_id: "w2", reps: 12, weight_unit: "bw", weight_value: null, weight_kg: null }),
    set({ workout_id: "w2", reps: 11, weight_unit: "bw", weight_value: null, weight_kg: null }),
  ];

  const result = detectPRs("Pull Up", current, history);

  assert.equal(result.length, 1);
  assert.equal(result[0].type, "volume");
  assert.equal(result[0].value, 23);
  assert.equal(result[0].previous_best, 20);
  assert.equal(result[0].delta, 3);
});
