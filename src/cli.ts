#!/usr/bin/env npx tsx
import { Command } from "commander";
import { logImport } from "./commands/log.js";
import { planEdit } from "./commands/plan-edit.js";
import { planSendToday, planSendWeekly, planToday } from "./commands/plan.js";
import { history } from "./commands/history.js";
import { stats } from "./commands/stats.js";
import { queryBestSet, queryE1rm } from "./commands/query.js";
import { supabaseImportCsv, supabaseVerify } from "./commands/supabase.js";

const program = new Command();

program.name("train").description("Chat-first workout tracker CLI").version("0.1.0");

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

    const result = await logImport(input);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

// --- plan ---
const plan = program.command("plan");

plan
  .command("today")
  .description("Show today's planned workout")
  .option("--date <yyyy-mm-dd>", "Reference date for deterministic output")
  .option("--json", "JSON output (default)")
  .action(async (opts) => {
    const result = planToday({ date: opts.date });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

plan
  .command("send-weekly")
  .description("Generate weekly WhatsApp delivery payload")
  .option("--date <yyyy-mm-dd>", "Reference date for deterministic output")
  .option("--json", "JSON output (default)")
  .action(async (opts) => {
    const result = planSendWeekly({ date: opts.date });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

plan
  .command("send-today")
  .description("Generate daily WhatsApp delivery payload")
  .option("--date <yyyy-mm-dd>", "Reference date for deterministic output")
  .option("--json", "JSON output (default)")
  .action(async (opts) => {
    const result = planSendToday({ date: opts.date });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

plan
  .command("edit")
  .description("Apply structured edits to the current week plan from JSON")
  .option("--data <json>", "JSON payload (alternative to stdin)")
  .option("--dry-run", "Preview edits without writing to disk")
  .option("--json", "JSON output (default)")
  .action(async (opts) => {
    let input: string;

    if (opts.data) {
      input = opts.data;
    } else {
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

    const result = planEdit(input, { dryRun: Boolean(opts.dryRun) });
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
    const result = await history({ last: opts.last, exercise });
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
    const result = await stats(exercise);
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
    const result = await queryE1rm({ exercise, days: Number.isFinite(days) ? days : 365 });
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
    const result = await queryBestSet({
      exercise,
      reps,
      days: Number.isFinite(days) ? days : 365,
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

// --- supabase ---
const supabase = program.command("supabase");

supabase
  .command("import-csv")
  .description("Import prepared CSV files into Supabase train schema")
  .requiredOption("--dir <path>", "Directory with exercises/workouts/workout_exercises/exercise_sets CSVs")
  .option("--db-url <url>", "Postgres connection string (or SUPABASE_DB_URL env var)")
  .option("--truncate", "Truncate train tables before import")
  .option("--json", "JSON output (default)")
  .action((opts) => {
    const result = supabaseImportCsv({
      dir: opts.dir,
      dbUrl: opts.dbUrl,
      truncate: Boolean(opts.truncate),
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

supabase
  .command("verify")
  .description("Verify Supabase train tables after import")
  .option("--db-url <url>", "Postgres connection string (or SUPABASE_DB_URL env var)")
  .option("--json", "JSON output (default)")
  .action((opts) => {
    const result = supabaseVerify({
      dbUrl: opts.dbUrl,
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  });

program.parse();
