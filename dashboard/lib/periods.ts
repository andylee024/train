import { addDays, diffDays, endOfMonth, prevMonth } from "./dates";
import { ARC_W1, JUMP_ARC_START } from "./lifts";
import type { PeriodKind } from "./types";

export type PeriodWindow = { key: string; label: string; start: string; end: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

function longDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** Successive day-windows ending today, walking back to the first date. */
export function rollingPeriods(today: string, length: number, firstDate: string): PeriodWindow[] {
  const windows: PeriodWindow[] = [];
  let end = today;
  while (end >= firstDate) {
    const start = addDays(end, -(length - 1));
    windows.push({
      key: `${start}:${end}`,
      label: `${shortDate(start)} – ${longDate(end)}`,
      start,
      end,
    });
    end = addDays(start, -1);
  }
  return windows.reverse();
}

/** Calendar months from the first date through today. The open month ends today. */
export function monthPeriods(today: string, firstDate: string): PeriodWindow[] {
  const windows: PeriodWindow[] = [];
  let ym = today.slice(0, 7);
  const firstYm = firstDate.slice(0, 7);
  while (ym >= firstYm) {
    const [year, month] = ym.split("-");
    const start = `${ym}-01`;
    const end = ym === today.slice(0, 7) ? today : endOfMonth(ym);
    const name = `${MONTHS[Number(month) - 1]} ${year}`;
    windows.push({
      key: ym,
      label: ym === today.slice(0, 7) ? `${name} · through ${shortDate(today)}` : name,
      start,
      end,
    });
    ym = prevMonth(ym);
  }
  return windows.reverse();
}

/** Arc-aligned 4-week block containing this date, including pre-arc chunks. */
export function blockWindow(date: string): PeriodWindow {
  if (date >= JUMP_ARC_START) {
    const index = Math.floor(diffDays(JUMP_ARC_START, date) / 28);
    const start = addDays(JUMP_ARC_START, index * 28);
    const end = addDays(start, 27);
    const week = index * 4 + 1;
    return {
      key: `jump-${index}`,
      label: `Jump · B${index + 1} · W${week}–W${week + 3} · ${shortDate(start)}–${longDate(end)}`,
      start,
      end,
    };
  }
  if (date >= ARC_W1) {
    const index = Math.floor(diffDays(ARC_W1, date) / 28);
    const start = addDays(ARC_W1, index * 28);
    const end = addDays(start, 27);
    const week = index * 4 + 1;
    return {
      key: `summer-${index}`,
      label: `Summer dunk · B${index + 1} · W${week}–W${week + 3} · ${shortDate(start)}–${longDate(end)}`,
      start,
      end,
    };
  }
  const before = addDays(ARC_W1, -1);
  const index = Math.floor(diffDays(date, before) / 28);
  const end = addDays(before, -index * 28);
  const start = addDays(end, -27);
  return {
    key: `pre-${index}`,
    label: `Pre-arc · ${shortDate(start)}–${longDate(end)}`,
    start,
    end,
  };
}

/** Block windows from the first logged date through the block that contains today. */
export function blockPeriods(today: string, firstDate: string): PeriodWindow[] {
  const windows: PeriodWindow[] = [];
  const lastStart = blockWindow(today).start;
  let cursor = blockWindow(firstDate).start;
  const seen = new Set<string>();
  while (cursor <= lastStart) {
    const window = blockWindow(cursor);
    if (!seen.has(window.key)) {
      seen.add(window.key);
      windows.push(window);
    }
    cursor = addDays(window.end, 1);
  }
  return windows;
}

/** Period windows for one toggle, oldest first. */
export function periodsFor(kind: PeriodKind, today: string, firstDate: string): PeriodWindow[] {
  if (kind === "2w") return rollingPeriods(today, 14, firstDate);
  if (kind === "4w") return rollingPeriods(today, 28, firstDate);
  if (kind === "month") return monthPeriods(today, firstDate);
  return blockPeriods(today, firstDate);
}
