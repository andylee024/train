import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { renderMilestoneCard, type MilestoneGoal } from "../src/cards/milestone-road-card.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const demoGoals: MilestoneGoal[] = [
  {
    exercise: "Back Squat",
    startKg: 112.5,
    currentKg: 135,
    targetKg: 140,
    targetLabel: "3 plates",
  },
  {
    exercise: "Bench Press",
    startKg: 82.5,
    currentKg: 100,
    targetKg: 100,
    targetLabel: "100kg",
    achievedAt: "2026-03-05",
  },
  {
    exercise: "Deadlift",
    startKg: 155,
    currentKg: 183,
    targetKg: 180,
    targetLabel: "4 plates",
    achievedAt: "2026-03-03",
  },
];

const outputPath = path.resolve(__dirname, "..", "cards", "h-milestone-road.html");
const html = renderMilestoneCard(demoGoals);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${html}\n`, "utf-8");

console.log(`Wrote ${outputPath}`);
