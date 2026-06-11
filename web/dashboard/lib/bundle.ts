/**
 * Bundle reader — parses the athlete's arc markdown files into typed shapes.
 *
 * Read once at request time (these are small files, no need to cache).
 * Path is resolved relative to the repo root, which is `web/dashboard/..`.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  ArcBlock,
  ArcGoal,
  ArcSummary,
  PlannedSession,
  SessionExercise,
} from "./types";

const REPO_ROOT = resolve(process.cwd(), "..", "..");
const BUNDLE_DIR = resolve(
  REPO_ROOT,
  "docs/athletes/andy/arc-2026-summer-dunk"
);

const PATHS = {
  arc: resolve(BUNDLE_DIR, "training/arc.md"),
  profile: resolve(BUNDLE_DIR, "profile.md"),
  currentWeek: resolve(BUNDLE_DIR, "training/active/current-week.md"),
  currentBlock: resolve(BUNDLE_DIR, "training/active/current-block.md"),
  nutritionArc: resolve(BUNDLE_DIR, "nutrition/arc.md"),
};

async function readMaybe(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

// ----- Markdown sectioning ----------------------------------------------------

/** Return the body under a heading like "## Purpose", stopping at next H2 */
function section(md: string, heading: string): string | null {
  const re = new RegExp(
    `^##\\s+${escapeRegex(heading)}\\s*$([\\s\\S]*?)(?=^##\\s+|\\z)`,
    "im"
  );
  const m = md.match(re);
  return m ? m[1].trim() : null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Parse a pipe-separated markdown table. Returns row objects keyed by lower-cased header. */
function table(md: string): Record<string, string>[] {
  const lines = md.split("\n").map((l) => l.trim()).filter(Boolean);
  const headerIdx = lines.findIndex((l) => l.startsWith("|"));
  if (headerIdx < 0) return [];
  const headers = lines[headerIdx]
    .split("|")
    .slice(1, -1)
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: Record<string, string>[] = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    if (!lines[i].startsWith("|")) break;
    const cells = lines[i].split("|").slice(1, -1).map((s) => s.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => (row[h] = cells[j] ?? ""));
    rows.push(row);
  }
  return rows;
}

function stripMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

// ----- Public API -------------------------------------------------------------

export async function getArcSummary(): Promise<ArcSummary | null> {
  const arcMd = await readMaybe(PATHS.arc);
  if (!arcMd) return null;

  // Athlete name from arc title or profile
  const profile = (await readMaybe(PATHS.profile)) ?? "";
  const profileTitle = profile.match(/^#\s+Athlete Profile\s+—\s+(.+)$/m);
  const athlete = profileTitle ? profileTitle[1].trim() : "Athlete";

  const arcTitle = arcMd.match(/^#\s+(.+)$/m);
  const name = arcTitle ? arcTitle[1].replace(/^Arc\s+—\s+/, "").trim() : "Arc";

  const startM = arcMd.match(/\*\*Start:\*\*\s+(\S+)/);
  const endM = arcMd.match(/\*\*End:\*\*\s+(\S+)/);
  const durM = arcMd.match(/\*\*Duration:\*\*\s+(\d+)\s+weeks/);

  const start = startM ? startM[1] : "";
  const end = endM ? endM[1] : "";
  const totalWeeks = durM ? parseInt(durM[1], 10) : 0;

  // Compute current week from start date
  const currentWeek = currentWeekFromStart(start);

  const purpose = stripMd(section(arcMd, "Purpose") ?? "");

  // Goals table (under "Goals" or "Goals (Priority Order)")
  const goalsMd =
    section(arcMd, "Goals (Priority Order)") ?? section(arcMd, "Goals") ?? "";
  const goalRows = table(goalsMd);
  const goals: ArcGoal[] = goalRows.map((r) => ({
    name: stripMd(r["#"] ? r["goal"] ?? "" : r["goal"] ?? ""),
    type: r["test"] ?? "",
    metric: r["test"] ?? "",
    target: r["deadline"] ?? "",
  }));

  // Block sequence
  const blocksMd =
    section(arcMd, "Block Sequence") ??
    section(arcMd, "Blocks") ??
    "";
  const blockRows = table(blocksMd);
  const blocks: ArcBlock[] = blockRows.map((r) => {
    const weeks = (r["weeks"] ?? "").replace(/[–—]/g, "-");
    const [from, to] = weeks.split("-").map((s) => parseInt(s.trim(), 10));
    let status: ArcBlock["status"] = "planned";
    if (currentWeek && from && to) {
      if (currentWeek > to) status = "completed";
      else if (currentWeek >= from) status = "active";
    }
    return {
      name: stripMd(r["name"] ?? r["block"] ?? "—"),
      weeks: r["weeks"] ?? "",
      serves: (r["serves"] ?? "").split(/,\s*/).filter(Boolean),
      status,
    };
  });

  const currentBlock = blocks.find((b) => b.status === "active") ?? null;

  return {
    athlete,
    name,
    purpose,
    start,
    end,
    totalWeeks,
    currentWeek,
    currentBlock,
    goals,
    blocks,
    priorityRules: [],
  };
}

function currentWeekFromStart(start: string): number {
  if (!start) return 0;
  const s = new Date(start);
  const now = new Date();
  const ms = now.getTime() - s.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(days / 7) + 1);
}

// ----- Sessions from current-week.md -----------------------------------------

const DAY_RE = /^##\s+(\w+\s+\w+\s+\d+)\s+\((\w+)\)\s+—\s+(.+)$/m;

export async function getCurrentWeek(): Promise<PlannedSession[]> {
  const md = await readMaybe(PATHS.currentWeek);
  if (!md) return [];

  // Header lines that start day sections look like:
  //   ## Sun May 17 (SUNDAY) — DNT Day 1 + Lower Posterior
  const days: PlannedSession[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    const headMatch = lines[i].match(
      /^##\s+(?:(\w{3})\s+)?(\w+\s+\d+)\s+\((\w+)\)\s+—\s+(.+)$/
    );
    if (!headMatch) {
      i++;
      continue;
    }
    const [, weekday, monthDay, dayUpper, title] = headMatch;
    // Collect bullet lines below until next ## or section
    const exercises: SessionExercise[] = [];
    i++;
    while (i < lines.length && !lines[i].startsWith("## ")) {
      const m = lines[i].match(/^\d+\.\s+(.+)$/);
      if (m) {
        const line = stripMd(m[1]);
        // Split on the first ":" — left = name (incl tags), right = prescription
        const colon = line.indexOf(":");
        if (colon > 0) {
          exercises.push({
            name: line.slice(0, colon).trim(),
            prescription: line.slice(colon + 1).trim(),
          });
        } else {
          exercises.push({ name: line, prescription: "" });
        }
      }
      i++;
    }
    days.push({
      day: dayUpper.toLowerCase(),
      date: `${weekday ?? ""} ${monthDay}`.trim(),
      title: stripMd(title),
      exercises,
    });
  }
  return days;
}

export async function getTodaySession(): Promise<PlannedSession | null> {
  const sessions = await getCurrentWeek();
  if (sessions.length === 0) return null;
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  return sessions.find((s) => s.day === today) ?? null;
}

// ----- Current block ---------------------------------------------------------

export async function getCurrentBlockText(): Promise<string | null> {
  return readMaybe(PATHS.currentBlock);
}

// ----- Nutrition arc ---------------------------------------------------------

export async function getNutritionArc(): Promise<string | null> {
  return readMaybe(PATHS.nutritionArc);
}
