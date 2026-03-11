import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSessionState,
  type LoggedExercise,
  type SessionExercise,
} from "./session-state.js";

function planned(names: string[]): SessionExercise[] {
  return names.map((name) => ({ name }));
}

function logged(entries: Array<[string, string]>): LoggedExercise[] {
  return entries.map(([id, name]) => ({ id, name }));
}

test("buildSessionState handles full session completion", async () => {
  const state = await buildSessionState({
    plannedExercises: planned(["Squat", "Bench Press"]),
    loggedExercises: logged([
      ["e_squat", "Back Squat"],
      ["e_bench", "Bench Press"],
    ]),
    resolvePlannedExerciseId: async (name) => {
      if (name === "Squat") return "e_squat";
      if (name === "Bench Press") return "e_bench";
      return null;
    },
  });

  assert.equal(state.completion_pct, 100);
  assert.deepEqual(state.remaining, []);
});

test("buildSessionState handles partial session completion", async () => {
  const state = await buildSessionState({
    plannedExercises: planned(["Back Squat", "Bench Press", "Barbell Row"]),
    loggedExercises: logged([["e_squat", "Back Squat"]]),
    resolvePlannedExerciseId: async (name) => {
      if (name === "Back Squat") return "e_squat";
      return null;
    },
  });

  assert.equal(state.completion_pct, 33.33);
  assert.deepEqual(state.remaining, planned(["Bench Press", "Barbell Row"]));
});

test("buildSessionState handles no plan with logged data", async () => {
  const state = await buildSessionState({
    plannedExercises: [],
    loggedExercises: logged([["e_deadlift", "Deadlift"]]),
  });

  assert.equal(state.completion_pct, 0);
  assert.deepEqual(state.planned, []);
  assert.deepEqual(state.remaining, []);
  assert.deepEqual(state.logged, [{ name: "Deadlift" }]);
});

test("buildSessionState handles plan with no logs", async () => {
  const state = await buildSessionState({
    plannedExercises: planned(["Back Squat", "Bench Press"]),
    loggedExercises: [],
  });

  assert.equal(state.completion_pct, 0);
  assert.deepEqual(state.remaining, planned(["Back Squat", "Bench Press"]));
});
