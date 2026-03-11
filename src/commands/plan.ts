import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ok, err, type JsonEnvelope } from "../json-envelope.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLANS_DIR = path.join(__dirname, "..", "..", "plans");
const WEEKLY_PLANS_DIR = path.join(PLANS_DIR, "weekly-plans");
const ACTIVE_WEEK_FILE = path.join(PLANS_DIR, "active", "current-week.md");

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

interface WeekHeader {
  block?: string;
  blockWeekNumber?: string;
  weekType?: string;
  primaryFocus?: string;
}

interface DayOverview {
  dayNumber: number;
  title: string;
}

interface DayPlan {
  dayNumber: number;
  title: string;
  exercises: PlanItem[];
  sessionNote?: string;
}

interface ParsedWeekPlan {
  week: string;
  file: string;
  header: WeekHeader;
  weeklyGoals: string[];
  weeklyMetrics: string[];
  strategy: string[];
  splitOverview: DayOverview[];
  days: DayPlan[];
}

interface WeeklySchedule {
  cadence: "weekly";
  send_day: "sunday";
  send_time_local: "18:00";
  should_send_today: boolean;
  scheduled_for: string;
}

interface DailySchedule {
  cadence: "daily";
  send_days: ["monday", "tuesday", "wednesday", "thursday", "friday"];
  send_time_local: "07:00";
  should_send_today: boolean;
  scheduled_for: string;
}

interface WhatsAppPayload {
  text_fallback: string;
  card_html: string;
}

interface WeeklyDeliveryPlan {
  week: string;
  reference_date: string;
  source_file: string;
  previous_week_file: string | null;
  schedule: WeeklySchedule;
  day_by_day_overview: DayPlan[];
  rationale_from_last_week: string[];
  schedule_adjustments: string[];
  whatsapp: WhatsAppPayload;
}

interface DailyDeliveryPlan {
  week: string;
  reference_date: string;
  source_file: string;
  day_number: number;
  day_title: string;
  is_preview_for_next_training_day: boolean;
  schedule: DailySchedule;
  session_context: string[];
  exercises: PlanItem[];
  coach_notes: string[];
  whatsapp: WhatsAppPayload;
}

interface WeekPlanSource {
  file: string;
  content: string;
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

const TRAINING_SEND_DAYS: DailySchedule["send_days"] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

function parseReferenceDate(input?: string): Date | null {
  if (!input) {
    return new Date();
  }

  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function parseNumberedLine(line: string): string | null {
  const match = line.match(/^\d+\.\s+(.+)$/);
  return match ? match[1].trim() : null;
}

function parseWeekPlan(source: WeekPlanSource): ParsedWeekPlan {
  const lines = source.content.split("\n");
  const parsed: ParsedWeekPlan = {
    week: "",
    file: source.file,
    header: {},
    weeklyGoals: [],
    weeklyMetrics: [],
    strategy: [],
    splitOverview: [],
    days: [],
  };

  let section = "";
  let currentDay: DayPlan | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const weekMatch = line.match(/^#\s+Week\s+([0-9]{4}-W\d{2})\b/i);
    if (weekMatch) {
      parsed.week = weekMatch[1];
      continue;
    }

    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      const daySectionMatch = section.match(/^Day\s+(\d+)\s*-\s*(.+)$/i);
      if (daySectionMatch) {
        currentDay = {
          dayNumber: Number(daySectionMatch[1]),
          title: daySectionMatch[2].trim(),
          exercises: [],
        };
        parsed.days.push(currentDay);
      } else {
        currentDay = null;
      }
      continue;
    }

    if (section === "Week Header") {
      const headerMatch = line.match(/^-\s+([^:]+):\s+(.+)$/);
      if (headerMatch) {
        const key = headerMatch[1].trim().toLowerCase();
        const value = headerMatch[2].trim();
        if (key === "block") parsed.header.block = value;
        if (key === "block week number") parsed.header.blockWeekNumber = value;
        if (key === "week type") parsed.header.weekType = value;
        if (key === "primary focus") parsed.header.primaryFocus = value;
      }
      continue;
    }

    if (currentDay) {
      const numberedLine = parseNumberedLine(line);
      if (!numberedLine) {
        continue;
      }

      const splitIndex = numberedLine.indexOf(":");
      if (splitIndex === -1) {
        currentDay.exercises.push({ exercise: numberedLine, prescription: "" });
        continue;
      }

      const left = numberedLine.slice(0, splitIndex).trim();
      const right = numberedLine.slice(splitIndex + 1).trim();
      if (left.toLowerCase() === "session note") {
        currentDay.sessionNote = right;
      } else {
        currentDay.exercises.push({ exercise: left, prescription: right });
      }
      continue;
    }

    const numberedLine = parseNumberedLine(line);
    if (!numberedLine) {
      continue;
    }

    if (section === "Weekly Goals") {
      parsed.weeklyGoals.push(numberedLine);
      continue;
    }

    if (section === "Weekly Metrics Targets") {
      parsed.weeklyMetrics.push(numberedLine);
      continue;
    }

    if (section === "Strategy For The Week") {
      parsed.strategy.push(numberedLine);
      continue;
    }

    if (section === "5-Day Split Overview") {
      const splitMatch = numberedLine.match(/^Day\s+(\d+):\s+(.+)$/i);
      if (splitMatch) {
        parsed.splitOverview.push({
          dayNumber: Number(splitMatch[1]),
          title: splitMatch[2].trim(),
        });
      }
    }
  }

  if (!parsed.week) {
    const fallbackWeekMatch = source.content.match(/^#\s+Week\s+([0-9]{4}-W\d{2})\b/im);
    if (fallbackWeekMatch) {
      parsed.week = fallbackWeekMatch[1];
    }
  }

  parsed.days.sort((a, b) => a.dayNumber - b.dayNumber);
  parsed.splitOverview.sort((a, b) => a.dayNumber - b.dayNumber);
  return parsed;
}

function getTrainingDayNumber(date: Date): number | null {
  const dayOfWeek = date.getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return dayOfWeek;
  }
  return null;
}

function readWeekPlanSourceForToken(weekToken: string): WeekPlanSource | null {
  if (!fs.existsSync(WEEKLY_PLANS_DIR)) {
    return null;
  }

  const files = fs
    .readdirSync(WEEKLY_PLANS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  const weekPattern = new RegExp(`^#\\s+Week\\s+${escapeRegex(weekToken)}\\b`, "mi");
  for (const file of files) {
    const content = fs.readFileSync(path.join(WEEKLY_PLANS_DIR, file), "utf-8");
    if (weekPattern.test(content) || file.includes(weekToken)) {
      return { file, content };
    }
  }

  return null;
}

function readActiveWeekPlanSource(): WeekPlanSource | null {
  if (!fs.existsSync(ACTIVE_WEEK_FILE)) {
    return null;
  }

  return {
    file: path.join("active", "current-week.md"),
    content: fs.readFileSync(ACTIVE_WEEK_FILE, "utf-8"),
  };
}

function shiftIsoWeek(weekToken: string, deltaWeeks: number): string | null {
  const match = weekToken.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(week) || week < 1 || week > 53) {
    return null;
  }

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime());
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const targetMonday = new Date(week1Monday.getTime());
  targetMonday.setUTCDate(week1Monday.getUTCDate() + (week - 1 + deltaWeeks) * 7);

  const localLikeDate = new Date(
    targetMonday.getUTCFullYear(),
    targetMonday.getUTCMonth(),
    targetMonday.getUTCDate(),
  );
  return getISOWeek(localLikeDate);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolvePlanSourceForWeek(weekToken: string): WeekPlanSource | null {
  const weekly = readWeekPlanSourceForToken(weekToken);
  if (weekly) {
    return weekly;
  }

  const active = readActiveWeekPlanSource();
  if (!active) {
    return null;
  }

  const activeParsed = parseWeekPlan(active);
  if (activeParsed.week === weekToken) {
    return active;
  }

  return null;
}

function buildWeeklyRationale(current: ParsedWeekPlan, previous: ParsedWeekPlan | null): string[] {
  if (!previous) {
    return ["No previous-week file was found; treat this as a fresh baseline for execution quality."];
  }

  const notes: string[] = [];
  if (current.header.weekType && previous.header.weekType && current.header.weekType !== previous.header.weekType) {
    notes.push(
      `Week type shifted from ${previous.header.weekType} to ${current.header.weekType}, signaling a change in stress and intent.`,
    );
  }

  if (
    current.header.primaryFocus &&
    previous.header.primaryFocus &&
    current.header.primaryFocus !== previous.header.primaryFocus
  ) {
    notes.push(`Primary focus changed from "${previous.header.primaryFocus}" to "${current.header.primaryFocus}".`);
  }

  for (const day of current.days) {
    const prevDay = previous.days.find((candidate) => candidate.dayNumber === day.dayNumber);
    const currentTop = day.exercises[0];
    const prevTop = prevDay?.exercises[0];
    if (
      currentTop &&
      prevTop &&
      currentTop.exercise === prevTop.exercise &&
      currentTop.prescription !== prevTop.prescription
    ) {
      notes.push(
        `Day ${day.dayNumber} ${currentTop.exercise} target changed from ${prevTop.prescription} to ${currentTop.prescription}.`,
      );
    }
  }

  if (notes.length === 0) {
    return ["Programming intent is consistent with last week; prioritize cleaner execution and small load progressions."];
  }

  return notes;
}

function buildScheduleAdjustments(current: ParsedWeekPlan, previous: ParsedWeekPlan | null): string[] {
  if (!previous) {
    return ["No previous-week schedule to compare; no explicit day-order adjustment detected."];
  }

  const adjustments: string[] = [];
  const previousMap = new Map(previous.splitOverview.map((day) => [day.dayNumber, day.title]));

  if (current.splitOverview.length !== previous.splitOverview.length) {
    adjustments.push(
      `Split length changed from ${previous.splitOverview.length} day(s) to ${current.splitOverview.length} day(s).`,
    );
  }

  for (const day of current.splitOverview) {
    const prevTitle = previousMap.get(day.dayNumber);
    if (!prevTitle) {
      adjustments.push(`Day ${day.dayNumber} (${day.title}) is newly scheduled this week.`);
      continue;
    }
    if (prevTitle !== day.title) {
      adjustments.push(`Day ${day.dayNumber} changed from ${prevTitle} to ${day.title}.`);
    }
  }

  if (adjustments.length === 0) {
    return ["No schedule adjustments from last week; keep the same day order and cadence."];
  }

  return adjustments;
}

function buildWeeklySchedule(referenceDate: Date): WeeklySchedule {
  const dayOfWeek = referenceDate.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  return {
    cadence: "weekly",
    send_day: "sunday",
    send_time_local: "18:00",
    should_send_today: dayOfWeek === 0,
    scheduled_for: formatDate(addDays(referenceDate, daysUntilSunday)),
  };
}

function buildDailySchedule(referenceDate: Date): DailySchedule {
  const dayOfWeek = referenceDate.getDay();
  let daysUntilNextTraining = 0;
  if (dayOfWeek === 0) {
    daysUntilNextTraining = 1;
  } else if (dayOfWeek === 6) {
    daysUntilNextTraining = 2;
  }

  return {
    cadence: "daily",
    send_days: TRAINING_SEND_DAYS,
    send_time_local: "07:00",
    should_send_today: dayOfWeek >= 1 && dayOfWeek <= 5,
    scheduled_for: formatDate(addDays(referenceDate, daysUntilNextTraining)),
  };
}

function renderWeeklyText(plan: ParsedWeekPlan, rationale: string[], scheduleAdjustments: string[]): string {
  const lines: string[] = [];
  lines.push(`Weekly Plan ${plan.week}`);

  if (plan.header.primaryFocus) {
    lines.push(`Primary focus: ${plan.header.primaryFocus}`);
  }
  if (plan.header.weekType) {
    lines.push(`Week type: ${plan.header.weekType}`);
  }
  lines.push("");
  lines.push("Day-by-day overview:");
  for (const day of plan.days) {
    lines.push(`Day ${day.dayNumber} - ${day.title}`);
    for (const exercise of day.exercises) {
      lines.push(`- ${exercise.exercise}: ${exercise.prescription}`);
    }
    if (day.sessionNote) {
      lines.push(`- Coach note: ${day.sessionNote}`);
    }
    lines.push("");
  }

  lines.push("Rationale from last week:");
  for (const item of rationale) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("Schedule adjustments:");
  for (const item of scheduleAdjustments) {
    lines.push(`- ${item}`);
  }

  return lines.join("\n").trim();
}

function renderWeeklyCardHtml(plan: ParsedWeekPlan, rationale: string[], scheduleAdjustments: string[]): string {
  const dayCards = plan.days
    .map((day) => {
      const exercises = day.exercises
        .map((exercise) => `<li><strong>${escapeHtml(exercise.exercise)}:</strong> ${escapeHtml(exercise.prescription)}</li>`)
        .join("");
      const note = day.sessionNote
        ? `<li><em>Coach note:</em> ${escapeHtml(day.sessionNote)}</li>`
        : "";
      return `<section><h3>Day ${day.dayNumber} - ${escapeHtml(day.title)}</h3><ul>${exercises}${note}</ul></section>`;
    })
    .join("");

  const rationaleHtml = rationale.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const adjustmentsHtml = scheduleAdjustments.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<article class="train-card train-card-weekly"><h2>Weekly Plan ${escapeHtml(
    plan.week,
  )}</h2><p><strong>Primary focus:</strong> ${escapeHtml(
    plan.header.primaryFocus ?? "N/A",
  )}</p>${dayCards}<section><h3>Rationale From Last Week</h3><ul>${rationaleHtml}</ul></section><section><h3>Schedule Adjustments</h3><ul>${adjustmentsHtml}</ul></section></article>`;
}

function renderDailyText(
  plan: ParsedWeekPlan,
  day: DayPlan,
  sessionContext: string[],
  coachNotes: string[],
  isPreview: boolean,
): string {
  const lines: string[] = [];
  if (isPreview) {
    lines.push(`Upcoming Session Preview (${plan.week})`);
  } else {
    lines.push(`Today's Session (${plan.week})`);
  }

  lines.push(`Day ${day.dayNumber} - ${day.title}`);
  lines.push("");
  lines.push("Session context:");
  for (const item of sessionContext) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("Exercises and targets:");
  for (const exercise of day.exercises) {
    lines.push(`- ${exercise.exercise}: ${exercise.prescription}`);
  }
  lines.push("");
  lines.push("Coach notes:");
  for (const note of coachNotes) {
    lines.push(`- ${note}`);
  }
  return lines.join("\n").trim();
}

function renderDailyCardHtml(
  plan: ParsedWeekPlan,
  day: DayPlan,
  sessionContext: string[],
  coachNotes: string[],
): string {
  const contextHtml = sessionContext.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const exercisesHtml = day.exercises
    .map((exercise) => `<li><strong>${escapeHtml(exercise.exercise)}:</strong> ${escapeHtml(exercise.prescription)}</li>`)
    .join("");
  const notesHtml = coachNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<article class="train-card train-card-daily"><h2>${escapeHtml(
    plan.week,
  )} • Day ${day.dayNumber} - ${escapeHtml(day.title)}</h2><section><h3>Session Context</h3><ul>${contextHtml}</ul></section><section><h3>Exercises</h3><ul>${exercisesHtml}</ul></section><section><h3>Coach Notes</h3><ul>${notesHtml}</ul></section></article>`;
}

function resolveWeekForWeeklySend(referenceDate: Date): string {
  if (referenceDate.getDay() === 0) {
    return getISOWeek(addDays(referenceDate, 1));
  }
  return getISOWeek(referenceDate);
}

function findDayPlanOrFallback(parsed: ParsedWeekPlan, dayNumber: number): DayPlan | null {
  const exact = parsed.days.find((day) => day.dayNumber === dayNumber);
  if (exact) {
    return exact;
  }
  return parsed.days[dayNumber - 1] ?? null;
}

export function planToday(opts: { date?: string } = {}): JsonEnvelope<TodayPlan> {
  const now = parseReferenceDate(opts.date);
  if (!now) {
    return err(`Invalid --date value "${opts.date}". Expected YYYY-MM-DD.`);
  }

  const week = getISOWeek(now);
  const dayName = DAYS[now.getDay()];
  const source = resolvePlanSourceForWeek(week);
  if (!source) {
    return err(`No plan found for week ${week}`);
  }

  const parsed = parseWeekPlan(source);
  const trainingDay = getTrainingDayNumber(now);
  const dayPlan = trainingDay ? findDayPlanOrFallback(parsed, trainingDay) : null;
  const exercises = dayPlan?.exercises ?? [];

  return ok({ week, day: dayName, file: source.file, exercises });
}

export function planSendWeekly(opts: { date?: string } = {}): JsonEnvelope<WeeklyDeliveryPlan> {
  const referenceDate = parseReferenceDate(opts.date);
  if (!referenceDate) {
    return err(`Invalid --date value "${opts.date}". Expected YYYY-MM-DD.`);
  }

  const targetWeek = resolveWeekForWeeklySend(referenceDate);
  const source = resolvePlanSourceForWeek(targetWeek);
  if (!source) {
    return err(`No plan found for week ${targetWeek}`);
  }

  const parsed = parseWeekPlan(source);
  const previousWeekToken = shiftIsoWeek(parsed.week, -1);
  const previousSource = previousWeekToken ? resolvePlanSourceForWeek(previousWeekToken) : null;
  const previousParsed = previousSource ? parseWeekPlan(previousSource) : null;

  const rationale = buildWeeklyRationale(parsed, previousParsed);
  const scheduleAdjustments = buildScheduleAdjustments(parsed, previousParsed);
  const whatsapp: WhatsAppPayload = {
    text_fallback: renderWeeklyText(parsed, rationale, scheduleAdjustments),
    card_html: renderWeeklyCardHtml(parsed, rationale, scheduleAdjustments),
  };

  return ok({
    week: parsed.week,
    reference_date: formatDate(referenceDate),
    source_file: source.file,
    previous_week_file: previousSource?.file ?? null,
    schedule: buildWeeklySchedule(referenceDate),
    day_by_day_overview: parsed.days,
    rationale_from_last_week: rationale,
    schedule_adjustments: scheduleAdjustments,
    whatsapp,
  });
}

export function planSendToday(opts: { date?: string } = {}): JsonEnvelope<DailyDeliveryPlan> {
  const referenceDate = parseReferenceDate(opts.date);
  if (!referenceDate) {
    return err(`Invalid --date value "${opts.date}". Expected YYYY-MM-DD.`);
  }

  const schedule = buildDailySchedule(referenceDate);
  const scheduledDate = parseReferenceDate(schedule.scheduled_for);
  if (!scheduledDate) {
    return err(`Could not resolve scheduled delivery date "${schedule.scheduled_for}".`);
  }

  const week = getISOWeek(scheduledDate);
  const source = resolvePlanSourceForWeek(week);
  if (!source) {
    return err(`No plan found for week ${week}`);
  }

  const parsed = parseWeekPlan(source);
  const dayNumber = getTrainingDayNumber(scheduledDate);
  if (!dayNumber) {
    return err(`No training day is scheduled on ${formatDate(scheduledDate)}.`);
  }

  const dayPlan = findDayPlanOrFallback(parsed, dayNumber);
  if (!dayPlan) {
    return err(`Could not resolve Day ${dayNumber} in plan ${parsed.week}.`);
  }

  const sessionContext = [
    parsed.header.primaryFocus
      ? `Primary focus: ${parsed.header.primaryFocus}`
      : "Primary focus: keep execution quality high.",
    parsed.header.weekType ? `Week type: ${parsed.header.weekType}` : "Week type: standard progression",
    parsed.weeklyGoals[0] ?? "Execute all prescribed work with clean technique.",
  ];

  const coachNotes: string[] = [];
  if (dayPlan.sessionNote) {
    coachNotes.push(dayPlan.sessionNote);
  }
  if (parsed.strategy[0]) {
    coachNotes.push(parsed.strategy[0]);
  }
  if (coachNotes.length === 0) {
    coachNotes.push("Prioritize clean reps and leave room for progression later in the week.");
  }

  const isPreview = !schedule.should_send_today;
  const whatsapp: WhatsAppPayload = {
    text_fallback: renderDailyText(parsed, dayPlan, sessionContext, coachNotes, isPreview),
    card_html: renderDailyCardHtml(parsed, dayPlan, sessionContext, coachNotes),
  };

  return ok({
    week: parsed.week,
    reference_date: formatDate(referenceDate),
    source_file: source.file,
    day_number: dayPlan.dayNumber,
    day_title: dayPlan.title,
    is_preview_for_next_training_day: isPreview,
    schedule,
    session_context: sessionContext,
    exercises: dayPlan.exercises,
    coach_notes: coachNotes,
    whatsapp,
  });
}
