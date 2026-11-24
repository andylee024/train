import "server-only";

import { formatLaDate } from "./dates";
import { jumpDrivers } from "./drivers";
import { fixtureLog } from "./fixture";
import { normalizeLog } from "./normalize";
import { fetchLog } from "./supabase";
import type { DashboardData, DataSource } from "./types";

/** Load the dashboard model from Supabase, or from the fixture when keys are absent. */
export async function loadDashboard(): Promise<DashboardData> {
  const source = resolveSource();
  const raw = source === "fixture" ? fixtureLog() : await fetchLog();
  const today = formatLaDate(new Date());
  const log = normalizeLog(raw);
  return {
    source,
    today,
    generatedAt: new Date().toISOString(),
    ...log,
    drivers: jumpDrivers({ ...log, today }),
  };
}

function resolveSource(): DataSource {
  if (process.env.DASHBOARD_DATA_SOURCE === "fixture") return "fixture";
  const hasCredentials = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
  if (hasCredentials) return "supabase";
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("SUPABASE_URL and SUPABASE_KEY are required in production.");
  }
  return "fixture";
}
