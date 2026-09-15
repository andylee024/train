import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Supabase keys live in the repo-root `.env` (shared with the CLI). Next only
// auto-loads env files inside this directory, so load the root file first;
// a local `.env.local` still overrides it.
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
    console.warn(`[next.config] failed to load root .env at ${rootEnvPath}:`, err);
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
