import type { HistoryRow } from "../train-api.js";

type Intensity = "light" | "moderate" | "heavy";

type CellState = "hit" | "missed" | "upcoming";

interface DaySummary {
  date: string;
  weekday: number;
  avgRpe: number | null;
  volumeKg: number;
}

interface WeeklySummary {
  weekStart: string;
  label: string;
  volumeKg: number;
}

interface GridCell {
  date: string;
  state: CellState;
  intensity?: Intensity;
  avgRpe?: number | null;
  volumeKg?: number;
}

interface GridRow {
  weekday: number;
  label: string;
  cells: GridCell[];
}

export interface SessionGridCardStats {
  total_sessions: number;
  frequency_per_week: number;
  consistency_percent: number;
}

export interface SessionGridCardModel {
  exercise: string;
  period_weeks: number;
  planned_days: string[];
  weekly_volume_kg: number[];
  stats: SessionGridCardStats;
  html: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function escapeHtml(raw: string): string {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseIsoDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function weekdayMonFirst(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

function formatMonthDay(date: Date): string {
  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function classifyIntensity(avgRpe: number | null): Intensity {
  if (avgRpe == null) return "light";
  if (avgRpe < 7) return "light";
  if (avgRpe < 8) return "moderate";
  return "heavy";
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deriveFrequency(totalSessions: number, periodWeeks: number): number {
  if (totalSessions <= 0) return 2;
  const raw = Math.round(totalSessions / periodWeeks);
  return clamp(raw, 2, 4);
}

function defaultWeekdaysForFrequency(frequency: number): number[] {
  if (frequency <= 2) return [1, 4];
  if (frequency === 3) return [1, 3, 5];
  return [1, 2, 4, 6];
}

function computeDaySummaries(sessions: HistoryRow[]): DaySummary[] {
  const perWorkout = new Map<
    string,
    {
      date: string;
      rpeValues: number[];
      volumeKg: number;
    }
  >();

  for (const row of sessions) {
    const dateRaw = row.session_date || row.performed_at.slice(0, 10);
    const parsed = parseIsoDate(dateRaw);
    if (!parsed) continue;

    const existing = perWorkout.get(row.workout_id);
    const record =
      existing ??
      {
        date: formatIsoDate(parsed),
        rpeValues: [] as number[],
        volumeKg: 0,
      };

    if (typeof row.rpe === "number" && Number.isFinite(row.rpe)) {
      record.rpeValues.push(row.rpe);
    }

    if (typeof row.weight_kg === "number" && Number.isFinite(row.weight_kg) && typeof row.reps === "number" && row.reps > 0) {
      record.volumeKg += row.weight_kg * row.reps;
    }

    perWorkout.set(row.workout_id, record);
  }

  const perDay = new Map<
    string,
    {
      rpeValues: number[];
      volumeKg: number;
    }
  >();

  for (const workout of perWorkout.values()) {
    const day = perDay.get(workout.date) ?? { rpeValues: [], volumeKg: 0 };
    day.rpeValues.push(...workout.rpeValues);
    day.volumeKg += workout.volumeKg;
    perDay.set(workout.date, day);
  }

  const summaries: DaySummary[] = [];
  for (const [date, day] of perDay.entries()) {
    const parsed = parseIsoDate(date);
    if (!parsed) continue;
    summaries.push({
      date,
      weekday: weekdayMonFirst(parsed),
      avgRpe: average(day.rpeValues),
      volumeKg: round(day.volumeKg, 2),
    });
  }

  summaries.sort((a, b) => a.date.localeCompare(b.date));
  return summaries;
}

function computePlannedWeekdays(daySummaries: DaySummary[], periodWeeks: number): number[] {
  const frequency = deriveFrequency(daySummaries.length, periodWeeks);
  const counts = new Map<number, number>();

  for (const day of daySummaries) {
    counts.set(day.weekday, (counts.get(day.weekday) ?? 0) + 1);
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0] - b[0];
    })
    .map(([weekday]) => weekday);

  const selected = ranked.slice(0, frequency);
  for (const weekday of defaultWeekdaysForFrequency(frequency)) {
    if (selected.length >= frequency) break;
    if (!selected.includes(weekday)) selected.push(weekday);
  }

  selected.sort((a, b) => a - b);
  return selected;
}

function buildWeeklyRange(periodWeeks: number, referenceDate: Date): WeeklySummary[] {
  const normalized = clamp(periodWeeks, 1, 52);
  const currentWeek = startOfWeek(referenceDate);
  const weeks: WeeklySummary[] = [];

  for (let offset = normalized - 1; offset >= 0; offset -= 1) {
    const weekStart = addDays(currentWeek, -7 * offset);
    weeks.push({
      weekStart: formatIsoDate(weekStart),
      label: formatMonthDay(weekStart),
      volumeKg: 0,
    });
  }

  return weeks;
}

function sparklinePoints(values: number[], width = 400, height = 64, padding = 6): string {
  if (values.length === 0) return "";

  const maxValue = Math.max(...values, 1);
  const step = values.length === 1 ? 0 : (width - padding * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = padding + index * step;
      const normalized = value / maxValue;
      const y = height - padding - normalized * (height - padding * 2);
      return `${round(x, 2)},${round(y, 2)}`;
    })
    .join(" ");
}

function formatRpe(avgRpe: number | null): string {
  if (avgRpe == null) return "n/a";
  return `${round(avgRpe, 2)}`;
}

function formatVolume(volumeKg: number): string {
  return `${round(volumeKg, 1)}kg`;
}

function renderCell(cell: GridCell): string {
  if (cell.state === "upcoming") {
    return `<div class="sg-cell sg-upcoming" title="${escapeHtml(cell.date)} upcoming"></div>`;
  }

  if (cell.state === "missed") {
    return `<div class="sg-cell sg-missed" title="${escapeHtml(cell.date)} missed planned session"></div>`;
  }

  const intensity = cell.intensity ?? "light";
  const rpeText = formatRpe(cell.avgRpe ?? null);
  const volumeText = formatVolume(cell.volumeKg ?? 0);

  return `<div class="sg-cell sg-hit sg-${intensity}" title="${escapeHtml(
    `${cell.date} ${intensity} | avg RPE ${rpeText} | volume ${volumeText}`
  )}"></div>`;
}

function renderSparkline(weeklyVolumes: number[]): string {
  const points = sparklinePoints(weeklyVolumes);

  if (!points) {
    return `<div class="sg-sparkline-empty">No weekly volume data</div>`;
  }

  return `<svg class="sg-sparkline" viewBox="0 0 400 64" role="img" aria-label="Weekly volume trend">
    <polyline class="sg-sparkline-line" points="${points}" />
  </svg>`;
}

function renderCardHtml(
  exercise: string,
  weekly: WeeklySummary[],
  rows: GridRow[],
  weeklyVolumes: number[],
  stats: SessionGridCardStats
): string {
  const headerWeeks = weekly.map((week) => `<span class="sg-week-label">${escapeHtml(week.label)}</span>`).join("");

  const gridRows = rows
    .map(
      (row) => `<div class="sg-row">
    <span class="sg-day">${escapeHtml(row.label)}</span>
    <div class="sg-row-cells">${row.cells.map(renderCell).join("")}</div>
  </div>`
    )
    .join("");

  const frequencyText = round(stats.frequency_per_week, 2).toFixed(2);
  const consistencyText = round(stats.consistency_percent, 1).toFixed(1);

  return `<article class="session-grid-card">
  <style>
    .session-grid-card { font-family: "IBM Plex Sans", "Segoe UI", sans-serif; color: #13243a; background: linear-gradient(160deg, #f4fbff 0%, #ffffff 55%, #eef7ff 100%); border: 1px solid #d6e5f5; border-radius: 18px; padding: 18px; width: min(760px, 100%); box-sizing: border-box; }
    .sg-header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
    .sg-title { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.2px; }
    .sg-subtitle { margin: 4px 0 0; color: #4f6b84; font-size: 13px; }
    .sg-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
    .sg-stat { background: #ffffffcc; border: 1px solid #dce9f7; border-radius: 10px; padding: 8px; }
    .sg-stat-label { display: block; color: #4f6b84; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sg-stat-value { display: block; margin-top: 2px; font-size: 20px; font-weight: 700; color: #0d2a47; }
    .sg-grid-wrap { margin-top: 16px; background: #ffffffc9; border: 1px solid #dce9f7; border-radius: 12px; padding: 10px; }
    .sg-grid-header { display: grid; grid-template-columns: 42px repeat(${weekly.length}, minmax(0, 1fr)); gap: 6px; margin-bottom: 8px; }
    .sg-grid-header .sg-week-label { color: #5d7690; font-size: 11px; text-align: center; }
    .sg-row { display: grid; grid-template-columns: 42px 1fr; gap: 6px; align-items: center; margin-bottom: 6px; }
    .sg-row:last-child { margin-bottom: 0; }
    .sg-day { color: #3f5e7a; font-size: 12px; font-weight: 600; }
    .sg-row-cells { display: grid; grid-template-columns: repeat(${weekly.length}, minmax(0, 1fr)); gap: 6px; }
    .sg-cell { aspect-ratio: 1 / 1; border-radius: 6px; border: 1px solid transparent; }
    .sg-hit.sg-light { background: #b9e3fa; border-color: #8ecde8; }
    .sg-hit.sg-moderate { background: #ffe2a8; border-color: #f5c15a; }
    .sg-hit.sg-heavy { background: #ffb8af; border-color: #ee7768; }
    .sg-missed { background: #ffffff; border: 1px dashed #95a8bb; }
    .sg-upcoming { background: #f6f9fc; border: 1px solid #e1eaf2; }
    .sg-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; font-size: 12px; color: #4f6b84; }
    .sg-legend-item { display: inline-flex; align-items: center; gap: 5px; }
    .sg-legend-dot { width: 12px; height: 12px; border-radius: 4px; display: inline-block; }
    .sg-sparkline-wrap { margin-top: 14px; background: #ffffffc9; border: 1px solid #dce9f7; border-radius: 12px; padding: 10px; }
    .sg-sparkline-title { margin: 0 0 8px; font-size: 12px; color: #4f6b84; letter-spacing: 0.4px; text-transform: uppercase; }
    .sg-sparkline { width: 100%; height: 72px; display: block; }
    .sg-sparkline-line { fill: none; stroke: #1980d0; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .sg-sparkline-empty { font-size: 12px; color: #7188a0; }
    @media (max-width: 720px) {
      .session-grid-card { padding: 14px; }
      .sg-stats { grid-template-columns: 1fr; }
      .sg-grid-header { grid-template-columns: 34px repeat(${weekly.length}, minmax(0, 1fr)); }
      .sg-row { grid-template-columns: 34px 1fr; }
      .sg-day { font-size: 11px; }
      .sg-grid-header .sg-week-label { font-size: 10px; }
    }
  </style>
  <header class="sg-header">
    <div>
      <h2 class="sg-title">Session Grid</h2>
      <p class="sg-subtitle">${escapeHtml(exercise)} · ${weekly.length} weeks</p>
    </div>
  </header>

  <section class="sg-stats">
    <div class="sg-stat"><span class="sg-stat-label">Sessions</span><span class="sg-stat-value">${stats.total_sessions}</span></div>
    <div class="sg-stat"><span class="sg-stat-label">Freq / week</span><span class="sg-stat-value">${frequencyText}</span></div>
    <div class="sg-stat"><span class="sg-stat-label">Consistency</span><span class="sg-stat-value">${consistencyText}%</span></div>
  </section>

  <section class="sg-grid-wrap">
    <div class="sg-grid-header"><span></span>${headerWeeks}</div>
    ${gridRows}
    <div class="sg-legend">
      <span class="sg-legend-item"><span class="sg-legend-dot sg-hit sg-light"></span>Light (&lt;7 RPE)</span>
      <span class="sg-legend-item"><span class="sg-legend-dot sg-hit sg-moderate"></span>Moderate (7-8 RPE)</span>
      <span class="sg-legend-item"><span class="sg-legend-dot sg-hit sg-heavy"></span>Heavy (&gt;=8 RPE)</span>
      <span class="sg-legend-item"><span class="sg-legend-dot sg-missed"></span>Missed planned</span>
    </div>
  </section>

  <section class="sg-sparkline-wrap">
    <h3 class="sg-sparkline-title">Weekly Volume (kg x reps)</h3>
    ${renderSparkline(weeklyVolumes)}
  </section>
</article>`;
}

export function buildSessionGridCardModel(
  exercise: string,
  sessions: HistoryRow[],
  period_weeks: number
): SessionGridCardModel {
  const periodWeeks = clamp(Math.floor(period_weeks), 1, 52);
  const daySummaries = computeDaySummaries(sessions);

  const today = new Date();
  const todayDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const latestSessionDate = daySummaries.length
    ? parseIsoDate(daySummaries[daySummaries.length - 1].date) ?? todayDate
    : todayDate;

  const referenceDate = latestSessionDate > todayDate ? latestSessionDate : todayDate;
  const weekly = buildWeeklyRange(periodWeeks, referenceDate);
  const rangeStart = weekly[0]?.weekStart;

  const inRange = daySummaries.filter((summary) => {
    if (!rangeStart) return false;
    return summary.date >= rangeStart && summary.date <= formatIsoDate(referenceDate);
  });

  const plannedWeekdays = computePlannedWeekdays(inRange, periodWeeks);
  const sessionsByDate = new Map(inRange.map((summary) => [summary.date, summary]));
  const weeklyByStart = new Map(weekly.map((entry) => [entry.weekStart, entry]));

  for (const summary of inRange) {
    const parsed = parseIsoDate(summary.date);
    if (!parsed) continue;
    const weekStart = formatIsoDate(startOfWeek(parsed));
    const entry = weeklyByStart.get(weekStart);
    if (entry) {
      entry.volumeKg = round(entry.volumeKg + summary.volumeKg, 2);
    }
  }

  const rows: GridRow[] = plannedWeekdays.map((weekday) => {
    const cells: GridCell[] = [];

    for (const week of weekly) {
      const weekStartDate = parseIsoDate(week.weekStart);
      if (!weekStartDate) continue;
      const slotDate = addDays(weekStartDate, weekday - 1);
      const slotIso = formatIsoDate(slotDate);

      if (slotDate > referenceDate) {
        cells.push({ date: slotIso, state: "upcoming" });
        continue;
      }

      const actual = sessionsByDate.get(slotIso);
      if (!actual) {
        cells.push({ date: slotIso, state: "missed" });
        continue;
      }

      cells.push({
        date: slotIso,
        state: "hit",
        intensity: classifyIntensity(actual.avgRpe),
        avgRpe: actual.avgRpe,
        volumeKg: actual.volumeKg,
      });
    }

    return {
      weekday,
      label: DAY_LABELS[weekday - 1],
      cells,
    };
  });

  let evaluatedSlots = 0;
  let hitSlots = 0;
  for (const row of rows) {
    for (const cell of row.cells) {
      if (cell.state === "upcoming") continue;
      evaluatedSlots += 1;
      if (cell.state === "hit") hitSlots += 1;
    }
  }

  const totalSessions = inRange.length;
  const consistency = evaluatedSlots > 0 ? (hitSlots / evaluatedSlots) * 100 : 0;
  const weeklyVolumes = weekly.map((entry) => round(entry.volumeKg, 2));

  const stats: SessionGridCardStats = {
    total_sessions: totalSessions,
    frequency_per_week: round(totalSessions / periodWeeks, 2),
    consistency_percent: round(consistency, 1),
  };

  const html = renderCardHtml(exercise, weekly, rows, weeklyVolumes, stats);

  return {
    exercise,
    period_weeks: periodWeeks,
    planned_days: plannedWeekdays.map((weekday) => DAY_LABELS[weekday - 1]),
    weekly_volume_kg: weeklyVolumes,
    stats,
    html,
  };
}

export function renderSessionGridCard(exercise: string, sessions: HistoryRow[], period_weeks: number): string {
  return buildSessionGridCardModel(exercise, sessions, period_weeks).html;
}
