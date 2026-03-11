import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { err, ok, type JsonEnvelope } from "../json-envelope.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLANS_DIR = path.join(__dirname, "..", "..", "plans");
const WEEKLY_PLANS_DIR = path.join(PLANS_DIR, "weekly-plans");
const ACTIVE_WEEK_FILE = path.join(PLANS_DIR, "active", "current-week.md");

interface PlanItem {
  exercise: string;
  prescription: string;
}

type PlanEdit =
  | {
      type: "swap_days";
      day_a: number;
      day_b: number;
    }
  | {
      type: "set_training_days";
      days: number;
    }
  | {
      type: "add_exercise";
      day: number;
      exercise: string;
      prescription: string;
      position?: number;
    }
  | {
      type: "remove_exercise";
      day: number;
      exercise: string;
    }
  | {
      type: "adjust_muscle_group_volume";
      muscle_group: string;
      sets_delta?: number;
      percent?: number;
      days?: number[];
    }
  | {
      type: "change_weight_target";
      exercise: string;
      set_percent?: number;
      percent_delta?: number;
      load_delta?: number;
      unit?: "lb" | "kg";
      days?: number[];
    };

interface PlanEditPayload {
  target_week?: string;
  dry_run?: boolean;
  edits: PlanEdit[];
}

interface AppliedEdit {
  index: number;
  type: PlanEdit["type"];
  summary: string;
}

interface PlanDaySummary {
  day: number;
  title: string;
  exercises: PlanItem[];
}

interface PlanEditResult {
  week: string;
  file: string;
  dry_run: boolean;
  applied_edits: AppliedEdit[];
  warnings: string[];
  preview: PlanDaySummary[];
}

interface ResolvedPlanFile {
  week: string;
  file: string;
  filePath: string;
  content: string;
}

interface DayState {
  day: number;
  title: string;
  items: PlanItem[];
}

interface DayBlock {
  start: number;
  end: number;
  days: DayState[];
}

const WEEKDAY_NAME_TO_DAY_NUMBER = new Map<string, number>([
  ["monday", 1],
  ["tuesday", 2],
  ["wednesday", 3],
  ["thursday", 4],
  ["friday", 5],
  ["saturday", 6],
  ["sunday", 7],
]);

const MUSCLE_GROUP_KEYWORDS: Record<string, string[]> = {
  chest: ["bench", "incline", "dips", "push-up", "push up", "pec"],
  back: ["row", "pull-up", "pull up", "pulldown", "chin-up", "chin up", "deadlift"],
  legs: ["squat", "deadlift", "rdl", "hamstring", "quad", "calf", "split squat", "lunge"],
  shoulders: ["ohp", "press", "jerk", "lateral raise", "rear delt"],
  arms: ["curl", "tricep", "bicep", "pushdown", "extension"],
  core: ["core", "ab", "plank", "sit-up", "sit up", "leg raise"],
  jump: ["jump", "sprint", "dunk", "broad", "vertical"],
};

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function parseInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) return null;
  return value;
}

function parseNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function parseDayList(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const out: number[] = [];
  for (const item of value) {
    const parsed = parseInteger(item);
    if (parsed === null || parsed < 1 || parsed > 7) return null;
    out.push(parsed);
  }
  return out;
}

function extractWeekToken(content: string): string | null {
  const match = content.match(/^#\s+Week\s+([0-9]{4}-W\d{2})\s*$/m);
  return match?.[1] ?? null;
}

function toPlansRelativePath(filePath: string): string {
  const rel = path.relative(PLANS_DIR, filePath).replace(/\\/g, "/");
  return rel.startsWith("..") ? path.basename(filePath) : rel;
}

function resolvePlanFile(targetWeek?: string): JsonEnvelope<ResolvedPlanFile> {
  const desiredWeek = targetWeek ?? getISOWeek(new Date());

  if (!fs.existsSync(WEEKLY_PLANS_DIR)) {
    return err(`Weekly plans directory not found: ${WEEKLY_PLANS_DIR}`);
  }

  const files = fs
    .readdirSync(WEEKLY_PLANS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  for (const file of files) {
    const filePath = path.join(WEEKLY_PLANS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes(desiredWeek) || file.includes(desiredWeek)) {
      return ok({
        week: desiredWeek,
        file,
        filePath,
        content,
      });
    }
  }

  if (fs.existsSync(ACTIVE_WEEK_FILE)) {
    const content = fs.readFileSync(ACTIVE_WEEK_FILE, "utf-8");
    const activeWeek = extractWeekToken(content);
    if (!targetWeek || activeWeek === desiredWeek || content.includes(desiredWeek)) {
      return ok({
        week: activeWeek ?? desiredWeek,
        file: toPlansRelativePath(ACTIVE_WEEK_FILE),
        filePath: ACTIVE_WEEK_FILE,
        content,
      });
    }
  }

  return err(`No plan found for week ${desiredWeek}`);
}

function parsePlanEdit(edit: unknown, index: number): JsonEnvelope<PlanEdit> {
  if (!isObject(edit)) return err(`Edit ${index + 1} must be an object.`);
  const type = typeof edit.type === "string" ? edit.type : "";

  if (type === "swap_days") {
    const dayA = parseInteger(edit.day_a);
    const dayB = parseInteger(edit.day_b);
    if (dayA === null || dayB === null || dayA < 1 || dayA > 7 || dayB < 1 || dayB > 7) {
      return err(`Edit ${index + 1}: swap_days requires integer day_a/day_b in 1..7.`);
    }
    return ok({ type, day_a: dayA, day_b: dayB });
  }

  if (type === "set_training_days") {
    const days = parseInteger(edit.days);
    if (days === null || days < 1 || days > 7) {
      return err(`Edit ${index + 1}: set_training_days.days must be an integer in 1..7.`);
    }
    return ok({ type, days });
  }

  if (type === "add_exercise") {
    const day = parseInteger(edit.day);
    const exercise = typeof edit.exercise === "string" ? edit.exercise.trim() : "";
    const prescription = typeof edit.prescription === "string" ? edit.prescription.trim() : "";
    const position = edit.position === undefined ? undefined : parseInteger(edit.position);
    if (day === null || day < 1 || day > 7) {
      return err(`Edit ${index + 1}: add_exercise.day must be an integer in 1..7.`);
    }
    if (!exercise) return err(`Edit ${index + 1}: add_exercise.exercise is required.`);
    if (!prescription) return err(`Edit ${index + 1}: add_exercise.prescription is required.`);
    if (position !== undefined && (position === null || position < 1)) {
      return err(`Edit ${index + 1}: add_exercise.position must be >= 1 when provided.`);
    }
    return ok({ type, day, exercise, prescription, position: position ?? undefined });
  }

  if (type === "remove_exercise") {
    const day = parseInteger(edit.day);
    const exercise = typeof edit.exercise === "string" ? edit.exercise.trim() : "";
    if (day === null || day < 1 || day > 7) {
      return err(`Edit ${index + 1}: remove_exercise.day must be an integer in 1..7.`);
    }
    if (!exercise) return err(`Edit ${index + 1}: remove_exercise.exercise is required.`);
    return ok({ type, day, exercise });
  }

  if (type === "adjust_muscle_group_volume") {
    const muscleGroup = typeof edit.muscle_group === "string" ? edit.muscle_group.trim() : "";
    const setsDelta = edit.sets_delta === undefined ? undefined : parseInteger(edit.sets_delta);
    const percent = edit.percent === undefined ? undefined : parseNumber(edit.percent);
    const days = edit.days === undefined ? undefined : parseDayList(edit.days);
    if (!muscleGroup) return err(`Edit ${index + 1}: adjust_muscle_group_volume.muscle_group is required.`);
    if (setsDelta === null) return err(`Edit ${index + 1}: sets_delta must be an integer when provided.`);
    if (percent === null) return err(`Edit ${index + 1}: percent must be numeric when provided.`);
    if (days === null) return err(`Edit ${index + 1}: days must be an array of integers in 1..7.`);
    if (setsDelta === undefined && percent === undefined) {
      return err(`Edit ${index + 1}: include sets_delta or percent.`);
    }
    if (setsDelta !== undefined && percent !== undefined) {
      return err(`Edit ${index + 1}: use either sets_delta or percent, not both.`);
    }
    return ok({
      type,
      muscle_group: muscleGroup,
      sets_delta: setsDelta,
      percent,
      days,
    });
  }

  if (type === "change_weight_target") {
    const exercise = typeof edit.exercise === "string" ? edit.exercise.trim() : "";
    const setPercent = edit.set_percent === undefined ? undefined : parseNumber(edit.set_percent);
    const percentDelta = edit.percent_delta === undefined ? undefined : parseNumber(edit.percent_delta);
    const loadDelta = edit.load_delta === undefined ? undefined : parseNumber(edit.load_delta);
    const unit = edit.unit === undefined ? undefined : edit.unit;
    const days = edit.days === undefined ? undefined : parseDayList(edit.days);
    if (!exercise) return err(`Edit ${index + 1}: change_weight_target.exercise is required.`);
    if (setPercent === null || percentDelta === null || loadDelta === null) {
      return err(`Edit ${index + 1}: weight target numeric fields must be valid numbers.`);
    }
    if (unit !== undefined && unit !== "lb" && unit !== "kg") {
      return err(`Edit ${index + 1}: unit must be lb or kg when provided.`);
    }
    if (days === null) return err(`Edit ${index + 1}: days must be an array of integers in 1..7.`);
    if (setPercent === undefined && percentDelta === undefined && loadDelta === undefined) {
      return err(`Edit ${index + 1}: include set_percent, percent_delta, or load_delta.`);
    }
    return ok({
      type,
      exercise,
      set_percent: setPercent,
      percent_delta: percentDelta,
      load_delta: loadDelta,
      unit: unit as "lb" | "kg" | undefined,
      days,
    });
  }

  return err(`Edit ${index + 1}: unsupported type "${type}".`);
}

function parsePlanEditPayload(input: string): JsonEnvelope<PlanEditPayload> {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch {
    return err("Invalid JSON payload.");
  }

  if (!isObject(raw)) return err("Payload must be a JSON object.");

  if (typeof raw.kind === "string") {
    if (raw.kind === "needs_clarification") {
      const question = typeof raw.question === "string" ? raw.question : "Clarification required before edits.";
      return err(question);
    }
    if (raw.kind !== "parse_result") {
      return err(`Unsupported payload kind "${raw.kind}".`);
    }
  }

  const editsRaw = raw.edits;
  if (!Array.isArray(editsRaw) || editsRaw.length === 0) {
    return err("Payload must include a non-empty edits array.");
  }

  const edits: PlanEdit[] = [];
  for (let i = 0; i < editsRaw.length; i += 1) {
    const parsed = parsePlanEdit(editsRaw[i], i);
    if (!parsed.ok) return parsed;
    edits.push(parsed.data);
  }

  const targetWeek = typeof raw.target_week === "string" ? raw.target_week.trim() : undefined;
  if (targetWeek && !/^\d{4}-W\d{2}$/.test(targetWeek)) {
    return err("target_week must be in ISO week format YYYY-Www (example: 2026-W11).");
  }

  return ok({
    target_week: targetWeek,
    dry_run: Boolean(raw.dry_run),
    edits,
  });
}

function parseDayItems(lines: string[]): PlanItem[] {
  const items: PlanItem[] = [];
  for (const line of lines) {
    const itemMatch = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+?):\s+(.+)\s*$/);
    if (!itemMatch) continue;
    items.push({
      exercise: itemMatch[1].trim(),
      prescription: itemMatch[2].trim(),
    });
  }
  return items;
}

function extractDayBlock(content: string): JsonEnvelope<DayBlock> {
  const lines = content.split("\n");
  const days: DayState[] = [];

  let firstStart = -1;
  let lastEnd = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const headingMatch = lines[i].match(/^##\s+(.+)\s*$/);
    if (!headingMatch) continue;
    const heading = headingMatch[1].trim();

    let dayNumber: number | null = null;
    let title = heading;

    const dayNumberMatch = heading.match(/^Day\s+(\d+)\s*-\s*(.+)$/i);
    if (dayNumberMatch) {
      dayNumber = Number(dayNumberMatch[1]);
      title = dayNumberMatch[2].trim();
    } else {
      const normalized = heading.toLowerCase();
      const fromName = WEEKDAY_NAME_TO_DAY_NUMBER.get(normalized);
      if (fromName) {
        dayNumber = fromName;
      }
    }

    if (dayNumber === null) continue;

    let end = i + 1;
    while (end < lines.length && !/^##\s+/.test(lines[end])) {
      end += 1;
    }

    if (firstStart === -1) firstStart = i;
    lastEnd = end;

    days.push({
      day: dayNumber,
      title,
      items: parseDayItems(lines.slice(i + 1, end)),
    });

    i = end - 1;
  }

  if (days.length === 0 || firstStart < 0 || lastEnd < 0) {
    return err("Could not find editable day sections in the weekly plan.");
  }

  const dedup = new Map<number, DayState>();
  for (const day of days) {
    dedup.set(day.day, day);
  }

  return ok({
    start: firstStart,
    end: lastEnd,
    days: [...dedup.values()].sort((a, b) => a.day - b.day),
  });
}

function cloneDays(days: DayState[]): DayState[] {
  return days.map((day) => ({
    day: day.day,
    title: day.title,
    items: day.items.map((item) => ({ ...item })),
  }));
}

function ensureDay(days: DayState[], dayNumber: number): JsonEnvelope<DayState> {
  const found = days.find((day) => day.day === dayNumber);
  if (!found) return err(`Day ${dayNumber} does not exist in the current edit state.`);
  return ok(found);
}

function getSessionNoteIndex(items: PlanItem[]): number {
  return items.findIndex((item) => normalizeToken(item.exercise) === "session note");
}

function exerciseMatchesMuscleGroup(exerciseName: string, muscleGroup: string): boolean {
  const normalizedExercise = normalizeToken(exerciseName);
  const normalizedGroup = normalizeToken(muscleGroup);
  const keywords = MUSCLE_GROUP_KEYWORDS[normalizedGroup] ?? [normalizedGroup];
  return keywords.some((keyword) => normalizedExercise.includes(keyword));
}

function adjustSetCount(prescription: string, nextSets: number): string | null {
  const setRepPattern = /(\d+)\s*x\s*(\d+)/i;
  const match = prescription.match(setRepPattern);
  if (!match) return null;
  const reps = Number(match[2]);
  return prescription.replace(setRepPattern, `${nextSets}x${reps}`);
}

function applyWeightTargetEdit(
  item: PlanItem,
  edit: Extract<PlanEdit, { type: "change_weight_target" }>,
): boolean {
  let nextPrescription = item.prescription;
  let changed = false;

  if (edit.set_percent !== undefined) {
    const replacement = `@ ${formatNumber(edit.set_percent)}%`;
    const before = nextPrescription;
    nextPrescription = nextPrescription
      .replace(/@\s*\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?%/g, replacement)
      .replace(/@\s*\d+(?:\.\d+)?%/g, replacement);
    if (nextPrescription !== before) changed = true;
  }

  if (edit.percent_delta !== undefined) {
    const before = nextPrescription;
    nextPrescription = nextPrescription.replace(/(\d+(?:\.\d+)?)%/g, (_full, value) => {
      const current = Number(value);
      const adjusted = Math.max(1, current + edit.percent_delta!);
      return `${formatNumber(adjusted)}%`;
    });
    if (nextPrescription !== before) changed = true;
  }

  if (edit.load_delta !== undefined) {
    const loadPattern = /(\d+(?:\.\d+)?)\s*(lb|lbs|kg)\b/gi;
    let replaced = false;
    const before = nextPrescription;
    nextPrescription = nextPrescription.replace(loadPattern, (full, value, rawUnit) => {
      const normalizedUnit = rawUnit.toLowerCase().startsWith("lb") ? "lb" : "kg";
      if (edit.unit && normalizedUnit !== edit.unit) return full;
      replaced = true;
      const adjusted = Math.max(0, Number(value) + edit.load_delta!);
      const outputUnit = normalizedUnit === "lb" ? "lb" : "kg";
      return `${formatNumber(adjusted)} ${outputUnit}`;
    });
    if (replaced && nextPrescription !== before) changed = true;
  }

  if (changed) {
    item.prescription = nextPrescription;
  }
  return changed;
}

function serializeDayBlock(days: DayState[]): string[] {
  const lines: string[] = [];
  const sorted = [...days].sort((a, b) => a.day - b.day);

  for (const day of sorted) {
    lines.push(`## Day ${day.day} - ${day.title}`);
    lines.push("");

    day.items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.exercise}: ${item.prescription}`);
    });

    lines.push("");
  }

  return lines;
}

function replaceDayBlock(lines: string[], block: DayBlock): string[] {
  return [...lines.slice(0, block.start), ...serializeDayBlock(block.days), ...lines.slice(block.end)];
}

function replaceSplitOverview(lines: string[], days: DayState[]): { lines: string[]; warning?: string } {
  const headingIndex = lines.findIndex((line) => /^##\s+\d+-Day Split Overview\s*$/i.test(line.trim()));
  if (headingIndex === -1) {
    return { lines, warning: "Split overview section not found; day sections were still updated." };
  }

  let end = headingIndex + 1;
  while (end < lines.length && !/^##\s+/.test(lines[end])) {
    end += 1;
  }

  const sorted = [...days].sort((a, b) => a.day - b.day);
  const section: string[] = [`## ${sorted.length}-Day Split Overview`, ""];
  sorted.forEach((day, index) => {
    section.push(`${index + 1}. Day ${day.day}: ${day.title}`);
  });
  section.push("");

  return {
    lines: [...lines.slice(0, headingIndex), ...section, ...lines.slice(end)],
  };
}

function applySingleEdit(days: DayState[], edit: PlanEdit, index: number): JsonEnvelope<AppliedEdit> {
  if (edit.type === "swap_days") {
    if (edit.day_a === edit.day_b) {
      return ok({ index: index + 1, type: edit.type, summary: `Day ${edit.day_a} unchanged (swap target identical).` });
    }
    const dayA = ensureDay(days, edit.day_a);
    if (!dayA.ok) return err(`Edit ${index + 1} failed: ${dayA.error}`);
    const dayB = ensureDay(days, edit.day_b);
    if (!dayB.ok) return err(`Edit ${index + 1} failed: ${dayB.error}`);
    const a = dayA.data;
    const b = dayB.data;
    const tmpTitle = a.title;
    const tmpItems = a.items;
    a.title = b.title;
    a.items = b.items;
    b.title = tmpTitle;
    b.items = tmpItems;
    return ok({
      index: index + 1,
      type: edit.type,
      summary: `Swapped day ${edit.day_a} and day ${edit.day_b}.`,
    });
  }

  if (edit.type === "set_training_days") {
    const nextDays: DayState[] = [];
    for (let dayNumber = 1; dayNumber <= edit.days; dayNumber += 1) {
      const existing = days.find((day) => day.day === dayNumber);
      if (existing) {
        nextDays.push(existing);
        continue;
      }
      nextDays.push({
        day: dayNumber,
        title: `Added Day ${dayNumber}`,
        items: [
          {
            exercise: "Recovery/Mobility",
            prescription: "20-30 min easy work",
          },
          {
            exercise: "Session Note",
            prescription: "autogenerated placeholder; customize as needed.",
          },
        ],
      });
    }

    days.length = 0;
    days.push(...nextDays);
    return ok({
      index: index + 1,
      type: edit.type,
      summary: `Set training days to ${edit.days}.`,
    });
  }

  if (edit.type === "add_exercise") {
    const day = ensureDay(days, edit.day);
    if (!day.ok) return err(`Edit ${index + 1} failed: ${day.error}`);

    const targetItems = day.data.items;
    const requestedIndex = edit.position ? Math.max(0, edit.position - 1) : null;
    const sessionNoteIndex = getSessionNoteIndex(targetItems);
    const insertIndex =
      requestedIndex !== null
        ? Math.min(requestedIndex, targetItems.length)
        : sessionNoteIndex >= 0
          ? sessionNoteIndex
          : targetItems.length;

    targetItems.splice(insertIndex, 0, {
      exercise: edit.exercise,
      prescription: edit.prescription,
    });

    return ok({
      index: index + 1,
      type: edit.type,
      summary: `Added ${edit.exercise} to day ${edit.day}.`,
    });
  }

  if (edit.type === "remove_exercise") {
    const day = ensureDay(days, edit.day);
    if (!day.ok) return err(`Edit ${index + 1} failed: ${day.error}`);

    const target = normalizeToken(edit.exercise);
    const matchIndexes = day.data.items
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => normalizeToken(item.exercise) === target)
      .map(({ itemIndex }) => itemIndex);

    if (matchIndexes.length === 0) {
      return err(`Edit ${index + 1} failed: ${edit.exercise} not found on day ${edit.day}.`);
    }
    if (matchIndexes.length > 1) {
      return err(
        `Edit ${index + 1} failed: multiple "${edit.exercise}" entries on day ${edit.day}; use more specific targeting.`,
      );
    }

    day.data.items.splice(matchIndexes[0], 1);
    return ok({
      index: index + 1,
      type: edit.type,
      summary: `Removed ${edit.exercise} from day ${edit.day}.`,
    });
  }

  if (edit.type === "adjust_muscle_group_volume") {
    const dayFilter = edit.days ? new Set(edit.days) : null;
    let updates = 0;

    for (const day of days) {
      if (dayFilter && !dayFilter.has(day.day)) continue;
      for (const item of day.items) {
        if (!exerciseMatchesMuscleGroup(item.exercise, edit.muscle_group)) continue;
        const setRepPattern = /(\d+)\s*x\s*(\d+)/i;
        const matched = item.prescription.match(setRepPattern);
        if (!matched) continue;
        const currentSets = Number(matched[1]);
        const nextSets =
          edit.sets_delta !== undefined
            ? currentSets + edit.sets_delta
            : Math.max(1, Math.round(currentSets * (1 + (edit.percent ?? 0) / 100)));

        if (nextSets < 1) {
          return err(`Edit ${index + 1} failed: resulting set count below 1 for ${item.exercise}.`);
        }

        const adjusted = adjustSetCount(item.prescription, nextSets);
        if (!adjusted) continue;
        item.prescription = adjusted;
        updates += 1;
      }
    }

    if (updates === 0) {
      return err(
        `Edit ${index + 1} failed: no set-based exercises matched muscle group "${edit.muscle_group}".`,
      );
    }

    const changeDescription =
      edit.sets_delta !== undefined
        ? `${edit.sets_delta > 0 ? "+" : ""}${edit.sets_delta} sets`
        : `${edit.percent! > 0 ? "+" : ""}${formatNumber(edit.percent!)}%`;

    return ok({
      index: index + 1,
      type: edit.type,
      summary: `Adjusted ${edit.muscle_group} volume (${changeDescription}) across ${updates} exercises.`,
    });
  }

  if (edit.type === "change_weight_target") {
    const dayFilter = edit.days ? new Set(edit.days) : null;
    const target = normalizeToken(edit.exercise);
    let updates = 0;

    for (const day of days) {
      if (dayFilter && !dayFilter.has(day.day)) continue;
      for (const item of day.items) {
        if (normalizeToken(item.exercise) !== target) continue;
        if (applyWeightTargetEdit(item, edit)) updates += 1;
      }
    }

    if (updates === 0) {
      return err(
        `Edit ${index + 1} failed: no editable weight target found for "${edit.exercise}" in selected days.`,
      );
    }

    return ok({
      index: index + 1,
      type: edit.type,
      summary: `Updated weight targets for ${edit.exercise} (${updates} line${updates === 1 ? "" : "s"}).`,
    });
  }

  return err(`Edit ${index + 1} failed: unsupported edit type.`);
}

export function planEdit(input: string, opts?: { dryRun?: boolean }): JsonEnvelope<PlanEditResult> {
  const payloadResult = parsePlanEditPayload(input);
  if (!payloadResult.ok) return payloadResult;
  const payload = payloadResult.data;
  const dryRun = Boolean(opts?.dryRun || payload.dry_run);

  const planResult = resolvePlanFile(payload.target_week);
  if (!planResult.ok) return planResult;
  const plan = planResult.data;

  const dayBlockResult = extractDayBlock(plan.content);
  if (!dayBlockResult.ok) return dayBlockResult;

  const dayBlock = dayBlockResult.data;
  dayBlock.days = cloneDays(dayBlock.days);

  const applied: AppliedEdit[] = [];
  for (let i = 0; i < payload.edits.length; i += 1) {
    const editResult = applySingleEdit(dayBlock.days, payload.edits[i], i);
    if (!editResult.ok) return editResult;
    applied.push(editResult.data);
  }

  const originalLines = plan.content.split("\n");
  const withDays = replaceDayBlock(originalLines, dayBlock);
  const splitReplacement = replaceSplitOverview(withDays, dayBlock.days);

  const warnings: string[] = [];
  if (splitReplacement.warning) warnings.push(splitReplacement.warning);

  const nextContent = splitReplacement.lines.join("\n");
  if (!dryRun) {
    fs.writeFileSync(plan.filePath, nextContent, "utf-8");
  }

  return ok({
    week: plan.week,
    file: plan.file,
    dry_run: dryRun,
    applied_edits: applied,
    warnings,
    preview: dayBlock.days
      .sort((a, b) => a.day - b.day)
      .map((day) => ({
        day: day.day,
        title: day.title,
        exercises: day.items.map((item) => ({ ...item })),
      })),
  });
}
