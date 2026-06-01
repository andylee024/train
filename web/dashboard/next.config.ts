import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

// ─── Env propagation ───────────────────────────────────────────────────────
//
// The dashboard's secrets (ANTHROPIC_API_KEY, Supabase keys) live in the repo
// root `.env` file so the Python skills (build_training_arc.py, etc.) and the
// TS CLI (`npx tsx app/cli/cli.ts ...`) share one source of truth. Next.js,
// however, only auto-loads env files inside the app directory
// (`web/dashboard/.env.local`, `.env`, etc.). Without this shim the
// `/api/synthesize` route would see `process.env.ANTHROPIC_API_KEY === undefined`
// and silently fall back to the mocked plan.
//
// We use Node 22's built-in `process.loadEnvFile` (no `dotenv` dep) and load
// the root file BEFORE the dashboard's own env files so a developer can still
// override a value locally by dropping a `web/dashboard/.env.local`.
//
// We walk up from this file to find the nearest `.env`, which makes the lookup
// robust to git-worktree checkouts (where `../..` from `web/dashboard/` might
// be a worktree directory without an `.env` even though the real repo root
// further up has one).
function findRootEnv(start: string): string | null {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    const candidate = resolve(dir, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

const rootEnvPath = findRootEnv(resolve(__dirname, "..", ".."));
if (rootEnvPath) {
  try {
    process.loadEnvFile(rootEnvPath);
  } catch (err) {
    // Don't crash next.config evaluation if the file is malformed — just log.
    // eslint-disable-next-line no-console
    console.warn(`[next.config] failed to load root .env at ${rootEnvPath}:`, err);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
