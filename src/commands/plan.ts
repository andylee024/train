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

/**
 * Default day-number → weekday mapping.
 * Day 1 = Monday, Day 5 = Friday. Override per plan if needed.
 */
const DEFAULT_DAY_MAP: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

/**
 * Parse weekly plan markdown into a map of weekday → exercises.
 *
 * Supports two formats:
 *   Format A (actual plans): `## Day N - Name` headers + `N. Exercise: prescription`
 *   Format B (legacy/simple): `## DayName` headers + `- Exercise: prescription`
 *
 * Session Note lines are skipped.
 */
function parsePlanMarkdown(content: string): Map<string, PlanItem[]> {
  const days = new Map<string, PlanItem[]>();
  let currentDay: string | null = null;

  for (const line of content.split("\n")) {
    // Format A: ## Day 1 - Lower A
    const dayNumMatch = line.match(/^##\s+Day\s+(\d+)\s*[-–—]\s*(.+)/i);
    if (dayNumMatch) {
      const dayNum = parseInt(dayNumMatch[1], 10);
      currentDay = DEFAULT_DAY_MAP[dayNum] ?? null;
      if (currentDay) days.set(currentDay, []);
      continue;
    }

    // Format B: ## Monday  (or ## Wednesday etc)
    const dayNameMatch = line.match(/^##\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*$/i);
    if (dayNameMatch) {
      currentDay = dayNameMatch[1].toLowerCase();
      days.set(currentDay, []);
      continue;
    }

    // Skip non-exercise headers (## Week Header, ## Weekly Goals, etc)
    if (line.match(/^##\s+/)) {
      currentDay = null;
      continue;
    }

    if (currentDay) {
      // Skip session note lines
      if (line.match(/^\d+\.\s+Session\s+Note:/i)) continue;

      // Format A: `1. Exercise: prescription`
      const numberedMatch = line.match(/^\d+\.\s+(.+?):\s+(.+)$/);
      if (numberedMatch) {
        days.get(currentDay)!.push({
          exercise: numberedMatch[1].trim(),
          prescription: numberedMatch[2].trim(),
        });
        continue;
      }

      // Format B: `- Exercise: prescription` or `* Exercise: prescription`
      const bulletMatch = line.match(/^[-*]\s+(.+?):\s+(.+)$/);
      if (bulletMatch) {
        days.get(currentDay)!.push({
          exercise: bulletMatch[1].trim(),
          prescription: bulletMatch[2].trim(),
        });
      }
    }
  }

  return days;
}

/**
 * Resolve the current week's plan file.
 * Search order:
 *   1. plans/active/current-week.md (if it exists and is current)
 *   2. plans/weekly-plans/ files matching ISO week in content or filename
 *   3. plans/weekly-plans/ — most recently modified .md file as fallback
 */
function findCurrentPlan(week: string): { file: string; content: string } | null {
  // 1. Check plans/active/current-week.md
  const activeWeek = path.join(PLANS_DIR, "active", "current-week.md");
  if (fs.existsSync(activeWeek)) {
    const content = fs.readFileSync(activeWeek, "utf-8");
    if (content.includes(week)) {
      return { file: "active/current-week.md", content };
    }
  }

  // 2. Search weekly-plans/ for matching week
  if (!fs.existsSync(WEEKLY_PLANS_DIR)) return null;

  const files = fs.readdirSync(WEEKLY_PLANS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse(); // newest first by filename

  for (const file of files) {
    const content = fs.readFileSync(path.join(WEEKLY_PLANS_DIR, file), "utf-8");
    if (content.includes(week) || file.includes(week)) {
      return { file, content };
    }
  }

  // 3. Fallback: most recently modified plan file
  if (files.length > 0) {
    const sorted = files
      .map((f) => ({ f, mtime: fs.statSync(path.join(WEEKLY_PLANS_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    const latest = sorted[0].f;
    return { file: latest, content: fs.readFileSync(path.join(WEEKLY_PLANS_DIR, latest), "utf-8") };
  }

  return null;
}

export function planToday(): JsonEnvelope<TodayPlan> {
  const now = new Date();
  const week = getISOWeek(now);
  const dayName = DAYS[now.getDay()];

  const plan = findCurrentPlan(week);

  if (!plan) {
    return err(`No plan found for week ${week}`);
  }

  const days = parsePlanMarkdown(plan.content);
  const exercises = days.get(dayName) ?? [];

  return ok({ week, day: dayName, file: plan.file, exercises });
}
