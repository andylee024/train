#!/usr/bin/env npx tsx
import { Command } from "commander";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Load the repo-root .env (SUPABASE_URL, SUPABASE_KEY, TRAIN_USER_ID) if present.
const ROOT_ENV = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".env");
if (existsSync(ROOT_ENV)) {
  try {
    process.loadEnvFile(ROOT_ENV);
  } catch {
    /* malformed .env — fall through to whatever the shell provides */
  }
}
import {
  logWorkoutFromJson,
  queryBestSetByReps,
  queryEstimatedOneRm,
  queryHistory,
  queryStats,
} from "./train-api.js";

const program = new Command();

program.name("train").description("Workout logging + progress queries against Supabase").version("0.1.0");

// --- log ---
const log = program.command("log");

log
  .command("import")
  .description("Import a workout from JSON (stdin or --data)")
  .option("--data <json>", "JSON payload (alternative to stdin)")
  .option("--json", "JSON output (default)")
  .action(async (opts) => {
    let input: string;

    if (opts.data) {
      input = opts.data;
    } else {
      // Read from stdin
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      input = Buffer.concat(chunks).toString("utf-8").trim();
    }

    if (!input) {
      console.log(JSON.stringify({ ok: false, error: "No input provided" }));
      process.exit(1);
    }

    const result = await logWorkoutFromJson(input);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

// --- history ---
program
  .command("history")
  .description("Show workout history")
  .argument("[exercise]", "Filter by exercise name")
  .option("--last <period>", "Time period (e.g. 7d, 4w)", "7d")
  .option("--json", "JSON output (default)")
  .action(async (exercise, opts) => {
    const result = await queryHistory({ last: opts.last, exercise });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

// --- stats ---
program
  .command("stats")
  .description("Show exercise stats and progression")
  .argument("<exercise>", "Exercise name")
  .option("--json", "JSON output (default)")
  .action(async (exercise) => {
    const result = await queryStats(exercise);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

// --- query ---
const query = program.command("query").description("Intent-focused stats queries");

query
  .command("e1rm")
  .description("Estimated 1RM for an exercise")
  .argument("<exercise>", "Exercise name")
  .option("--days <days>", "Lookback window in days", "365")
  .option("--json", "JSON output (default)")
  .action(async (exercise, opts) => {
    const days = Number(opts.days);
    const result = await queryEstimatedOneRm({ exercise, days: Number.isFinite(days) ? days : 365 });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

query
  .command("best-set")
  .description("Best loaded set for a target rep count")
  .argument("<exercise>", "Exercise name")
  .requiredOption("--reps <reps>", "Target reps")
  .option("--days <days>", "Lookback window in days", "365")
  .option("--json", "JSON output (default)")
  .action(async (exercise, opts) => {
    const reps = Number(opts.reps);
    const days = Number(opts.days);
    const result = await queryBestSetByReps({
      exercise,
      reps,
      days: Number.isFinite(days) ? days : 365,
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

program.parse();
