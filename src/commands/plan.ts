import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ok, err, type JsonEnvelope } from "../json-envelope.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLANS_DIR = path.join(__dirname, "..", "..", "plans");
const WEEKLY_PLANS_DIR = path.join(PLANS_DIR, "weekly-plans");

interface PlanItem {
  exercise: string;
  prescription: string; // raw text like "4x5 @ 185 lb"
}

interface TodayPlan {
  week: string;
  day: string;
  file: string;
  exercises: PlanItem[];
}

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parsePlanMarkdown(content: string): Map<string, PlanItem[]> {
  const days = new Map<string, PlanItem[]>();
  let currentDay: string | null = null;

  for (const line of content.split("\n")) {
    const dayMatch = line.match(/^##\s+(\w+)/);
    if (dayMatch) {
      currentDay = dayMatch[1].toLowerCase();
      days.set(currentDay, []);
      continue;
    }

    if (currentDay) {
      const itemMatch = line.match(/^[-*]\s+(.+?):\s+(.+)$/);
      if (itemMatch) {
        days.get(currentDay)!.push({
          exercise: itemMatch[1].trim(),
          prescription: itemMatch[2].trim(),
        });
      }
    }
  }

  return days;
}

export function planToday(): JsonEnvelope<TodayPlan> {
  const now = new Date();
  const week = getISOWeek(now);
  const dayName = DAYS[now.getDay()];

  // Look for current week's plan file in plans/weekly-plans
  if (!fs.existsSync(WEEKLY_PLANS_DIR)) {
    return err(`Weekly plans directory not found: ${WEEKLY_PLANS_DIR}`);
  }

  const files = fs.readdirSync(WEEKLY_PLANS_DIR).filter((f) => f.endsWith(".md"));

  // Try exact week match first, then fall back to any file containing the week
  let planFile: string | null = null;
  let planContent: string | null = null;

  for (const file of files) {
    const content = fs.readFileSync(path.join(WEEKLY_PLANS_DIR, file), "utf-8");
    if (content.includes(week) || file.includes(week)) {
      planFile = file;
      planContent = content;
      break;
    }
  }

  if (!planFile || !planContent) {
    return err(`No plan found for week ${week}`);
  }

  const days = parsePlanMarkdown(planContent);
  const exercises = days.get(dayName) ?? [];

  if (exercises.length === 0) {
    return ok({
      week,
      day: dayName,
      file: planFile,
      exercises: [],
    });
  }

  return ok({ week, day: dayName, file: planFile, exercises });
}
