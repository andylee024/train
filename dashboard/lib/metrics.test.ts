import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fixtureLog } from "./fixture";
import { isJumpWork, parseTouchInches } from "./jumps";
import { canonicalLift, epleyLb, LB_PER_KG, weightToLb } from "./lifts";
import { normalizeLog } from "./normalize";
import { readAllPages } from "./pages";
import { blockWindow } from "./periods";
import { liftView, weeklyTonnage } from "./series";

const TODAY = "2026-11-04";

describe("weights and e1RM", () => {
  it("keeps pounds and converts kilograms with the generated-column factor", () => {
    assert.equal(weightToLb("lb", 225, null), 225);
    assert.equal(weightToLb("lbs", "90", null), 90);
    assert.equal(weightToLb("kg", 90, null), 90 * LB_PER_KG);
    assert.equal(weightToLb(null, null, "70"), 70 * LB_PER_KG);
    assert.equal(weightToLb("bw", null, null), null);
    assert.equal(weightToLb("lb", 0, null), null);
    assert.equal(weightToLb("kg", 0, 0), null);
  });

  it("uses Epley for 1–10 reps and drops heavier sets", () => {
    assert.ok(Math.abs((epleyLb(300, 1) ?? 0) - 310) < 1e-9);
    assert.ok(Math.abs((epleyLb(300, 10) ?? 0) - 400) < 1e-9);
    assert.equal(epleyLb(300, 11), null);
    assert.equal(epleyLb(300, 0), null);
  });
});

describe("lift names", () => {
  it("groups power clean and jerk with clean and jerk, and leaves variants alone", () => {
    assert.equal(canonicalLift("Power Clean and Jerk").key, "clean-and-jerk");
    assert.equal(canonicalLift("Clean & Jerk").key, "clean-and-jerk");
    assert.equal(canonicalLift("Power Clean").key, "power-clean");
    assert.equal(canonicalLift("Hang Power Clean").key, "x:hang power clean");
    assert.equal(canonicalLift("Block Power Cleans").key, "x:block power cleans");
    assert.equal(canonicalLift("Power Snatch").key, "power-snatch");
    assert.equal(canonicalLift("Hang Power Snatch").key, "x:hang power snatch");
    assert.equal(canonicalLift("Back Squat").key, "back-squat");
    assert.equal(canonicalLift("Front Squat").key, "x:front squat");
  });
});

describe("arc blocks", () => {
  it("anchors week 1 at May 24, 2026 and restarts the next arc on Nov 8", () => {
    const current = blockWindow("2026-11-04");
    assert.equal(current.start, "2026-10-11");
    assert.equal(current.end, "2026-11-07");
    assert.match(current.label, /Summer dunk · B6 · W21–W24/);

    assert.match(blockWindow("2026-05-23").label, /Pre-arc/);
    const next = blockWindow("2026-11-08");
    assert.equal(next.start, "2026-11-08");
    assert.equal(next.end, "2026-12-05");
    assert.match(next.label, /Jump · B1 · W1–W4/);
  });
});

describe("jumps", () => {
  it("reads touch height and ignores box height", () => {
    assert.equal(parseTouchInches('18" box', "Depth Jump"), null);
    assert.equal(parseTouchInches('10\'2"', "Approach Jumps"), 122);
    assert.equal(parseTouchInches("122 in", "Approach Touch"), 122);
    assert.equal(parseTouchInches("118", "Approach Touch"), 118);
    assert.equal(parseTouchInches("zero->null bodyweight normalize", "Approach Jumps"), null);
    assert.equal(isJumpWork("Approach Jumps"), true);
    assert.equal(isJumpWork("Jump Squat"), false);
  });
});

describe("fixture log", () => {
  const data = normalizeLog(fixtureLog());
  const squat = data.lifts.find((lift) => lift.key === "back-squat");
  const view = liftView(data.sets, squat!, "block", TODAY);

  it("is clearly not a touch log, and still sees jump sessions", () => {
    assert.equal(data.jumps.length, 0);
    assert.ok(data.jumpWork.some((work) => work.exercise === "Approach Jumps"));
    assert.ok(data.jumpWork.some((work) => work.exercise === "Depth Jump"));
    assert.equal(data.bodyweight.length, 5);
  });

  it("rolls squat e1RM up to the single and keeps the 12-rep set out of the estimate", () => {
    assert.equal(view.best?.e1rmLb, 385 * (1 + 1 / 30));
    assert.equal(view.best?.date, "2026-11-01");
    assert.equal(view.points.some((point) => point.reps === 12), false);
    const october = data.sets.filter((set) => set.date === "2026-10-11" && set.liftKey === "back-squat");
    assert.equal(october.length, 2);
    assert.ok(october.some((set) => set.reps === 12 && set.e1rmLb == null && set.tonnageLb === 135 * 12));
  });

  it("puts power clean and jerk on the clean and jerk goal, not on the power clean", () => {
    const clean = liftView(data.sets, data.lifts.find((lift) => lift.key === "power-clean")!, "4w", TODAY);
    const jerk = liftView(data.sets, data.lifts.find((lift) => lift.key === "clean-and-jerk")!, "4w", TODAY);
    assert.equal(jerk.lift.goalLb, 225);
    assert.equal(jerk.best?.weightLb, 205);
    assert.ok(jerk.points.some((point) => point.weightLb === 175));
    assert.ok(jerk.points.some((point) => point.weightLb === 185));
    assert.ok(!clean.points.some((point) => point.weightLb === 175 || point.weightLb === 185));
    assert.equal(data.lifts.some((lift) => lift.key === "x:hang power clean"), true);
    const kg = data.sets.find((set) => set.liftKey === "power-clean" && set.reps === 3);
    assert.ok(kg);
    assert.ok(Math.abs(kg.weightLb - 80 * LB_PER_KG) < 1e-9);
  });

  it("compares the open block with the previous block", () => {
    const current = view.periods[0];
    const previous = view.periods[1];
    assert.match(current.label, /B6/);
    assert.ok(current.sessions >= 1);
    assert.equal(current.deltaTonnageLb, current.tonnageLb - previous.tonnageLb);
    assert.equal(view.periods[view.periods.length - 1].deltaTonnageLb, null);
  });

  it("counts tonnage across every loaded lift, including empty weeks", () => {
    const bars = weeklyTonnage(data.sets, TODAY);
    assert.ok(bars.length > 8);
    assert.ok(bars.some((bar) => bar.tonnageLb === 0));
    assert.ok(bars.some((bar) => bar.tonnageLb > 0));
  });
});

describe("pagination", () => {
  it("walks 1000-row pages until a short page", async () => {
    const calls: number[] = [];
    const rows = await readAllPages((offset, limit) => {
      calls.push(offset);
      const remaining = Math.max(0, 2500 - offset);
      return Promise.resolve(Array.from({ length: Math.min(limit, remaining) }, (_, index) => offset + index));
    }, 1000);
    assert.deepEqual(calls, [0, 1000, 2000]);
    assert.equal(rows.length, 2500);
    assert.equal(rows[0], 0);
    assert.equal(rows[2499], 2499);
  });
});
