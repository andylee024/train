const TZ = "America/Los_Angeles";

/** Calendar date YYYY-MM-DD for an instant in America/Los_Angeles. */
export function formatLaDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Shift a YYYY-MM-DD calendar date by a number of days. */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Whole calendar days from a to b. */
export function diffDays(a: string, b: string): number {
  const start = Date.parse(`${a}T00:00:00Z`);
  const end = Date.parse(`${b}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

/** Sunday on or before this calendar date. */
export function weekStartSunday(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addDays(iso, -dow);
}

/** Last calendar day of a YYYY-MM month. */
export function endOfMonth(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

/** The YYYY-MM before this one. */
export function prevMonth(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  return new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
}

/** Training-day calendar date from a timestamp or a date-only string. */
export function performedDate(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 10) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatLaDate(parsed);
}
