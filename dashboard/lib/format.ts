/** Pounds with grouped digits. */
export function formatLb(value: number, digits = 0): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

/** Signed whole pounds, with a minus sign for decreases. */
export function formatSignedLb(value: number): string {
  const rounded = Math.round(value);
  const absolute = Math.abs(rounded).toLocaleString("en-US");
  if (rounded > 0) return `+${absolute}`;
  if (rounded < 0) return `−${absolute}`;
  return "0";
}

/** Signed whole-number percent. */
export function formatPct(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `−${Math.abs(rounded)}%`;
  return "0%";
}

/** Calendar date, rendered in UTC so server and client match. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Month and day, rendered in UTC. */
export function formatShort(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Feet and inches from a total inch count. */
export function formatInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rest = Math.round(inches - feet * 12);
  return `${feet}'${rest}"`;
}

/** Timestamp in UTC, stable across server and browser. */
export function formatStamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(iso));
}
