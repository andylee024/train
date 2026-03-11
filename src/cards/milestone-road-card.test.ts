import assert from "node:assert/strict";
import test from "node:test";
import { renderMilestoneCard } from "./milestone-road-card.js";

function markerLefts(html: string): Record<string, number[]> {
  const out: Record<string, number[]> = {
    start: [],
    checkpoint: [],
    goal: [],
    current: [],
  };

  const pattern = /class="mr-marker mr-marker-(start|checkpoint|goal|current)[^"]*" style="left:([0-9.]+)%/g;
  for (const match of html.matchAll(pattern)) {
    out[match[1]].push(Number(match[2]));
  }

  return out;
}

test("renders in-progress state with remaining distance callout", () => {
  const html = renderMilestoneCard([
    {
      exercise: "Back Squat",
      startKg: 100,
      currentKg: 130,
      targetKg: 140,
      targetLabel: "3 plates",
    },
  ]);

  assert.match(html, /mr-in_progress/);
  assert.match(html, /10kg to 3 plates/);
  assert.match(html, /Now · 130kg<em>10kg to go<\/em>/);
});

test("renders achieved state with celebration callout and green goal marker", () => {
  const html = renderMilestoneCard([
    {
      exercise: "Bench Press",
      startKg: 80,
      currentKg: 100,
      targetKg: 100,
      targetLabel: "100kg",
      achievedAt: "2026-03-05",
    },
  ]);

  assert.match(html, /mr-achieved/);
  assert.match(html, /Hit 100kg on Mar 5/);
  assert.match(html, /Celebrate this win/);
});

test("renders exceeded state with over-goal context", () => {
  const html = renderMilestoneCard([
    {
      exercise: "Deadlift",
      startKg: 150,
      currentKg: 185,
      targetKg: 180,
      achievedAt: "2026-03-03",
    },
  ]);

  assert.match(html, /mr-exceeded/);
  assert.match(html, /5kg past your goal/);
});

test("marker positions are proportional to values", () => {
  const html = renderMilestoneCard([
    {
      exercise: "Overhead Press",
      startKg: 60,
      currentKg: 72.5,
      targetKg: 80,
    },
  ]);

  const lefts = markerLefts(html);
  assert.equal(lefts.start.length, 1);
  assert.equal(lefts.goal.length, 1);
  assert.equal(lefts.current.length, 1);
  assert.equal(lefts.checkpoint.length, 3);

  assert.ok(lefts.start[0] < lefts.current[0]);
  assert.ok(lefts.current[0] < lefts.goal[0]);

  assert.ok(lefts.checkpoint[0] > lefts.start[0]);
  assert.ok(lefts.checkpoint[2] < lefts.goal[0]);
});

test("supports one to three goals and rejects larger payloads", () => {
  const twoGoalHtml = renderMilestoneCard([
    { exercise: "Back Squat", startKg: 100, currentKg: 120, targetKg: 140 },
    { exercise: "Bench Press", startKg: 80, currentKg: 92.5, targetKg: 100 },
  ]);

  assert.match(twoGoalHtml, /mr-goal/g);

  assert.throws(() =>
    renderMilestoneCard([
      { exercise: "A", startKg: 1, currentKg: 2, targetKg: 3 },
      { exercise: "B", startKg: 1, currentKg: 2, targetKg: 3 },
      { exercise: "C", startKg: 1, currentKg: 2, targetKg: 3 },
      { exercise: "D", startKg: 1, currentKg: 2, targetKg: 3 },
    ])
  );
});
