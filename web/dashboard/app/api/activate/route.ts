/**
 * POST /api/activate — A24-295
 *
 * Activates a synthesized plan by generating the arc bundle: README, CLAUDE,
 * arc.md, profile.md, blocks/, weeks/, active/, nutrition/ stub, and an xlsx
 * via the Python skill (best-effort).
 *
 * Bundle writes are gated by the `WRITE_BUNDLE_TO_DISK` env flag. When unset
 * (the default — including during CI/builds and most curl smoke tests) the
 * route returns the *would-be* bundle content as JSON instead of touching the
 * filesystem. Flip the flag locally to actually materialize an arc.
 */
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import type { SamplePlan } from "@/lib/sample-plan";
import { getCoach } from "@/lib/coaches";
import type { GoalKey, ConstraintKey } from "@/lib/use-intake";

type IntakePayload = {
  goals?: GoalKey[];
  daysPerWeek?: number | null;
  constraints?: ConstraintKey[];
};

type ActivateRequest = {
  plan?: SamplePlan;
  coachIds?: string[];
  intake?: IntakePayload;
  notes?: string;
};

// V1: hardcode athlete name — multi-tenant comes later.
const ATHLETE = "andy";

// ─── slug + paths ──────────────────────────────────────────────────────────

const GOAL_SLUG: Partial<Record<GoalKey, string>> = {
  "jump-higher":   "vertical-jump",
  "run-faster":    "speed",
  "stronger":      "strength",
  "build-muscle":  "hypertrophy",
  "look-ripped":   "physique",
  "more-flexible": "mobility",
  "longevity":     "longevity",
  "sport-prep":    "sport-prep",
  "hybrid":        "hybrid",
};

function seasonOf(monthIdx: number): string {
  // Northern hemisphere bucketing — good enough for arc naming.
  if (monthIdx <= 1 || monthIdx === 11) return "winter";
  if (monthIdx <= 4) return "spring";
  if (monthIdx <= 7) return "summer";
  return "fall";
}

function buildSlug(intake: IntakePayload, now = new Date()): string {
  const year = now.getUTCFullYear();
  const season = seasonOf(now.getUTCMonth());
  const primary = (intake.goals ?? [])[0];
  const goalPart = (primary && GOAL_SLUG[primary]) || "training";
  return `arc-${year}-${season}-${goalPart}`;
}

// ─── Template builders ─────────────────────────────────────────────────────

function buildArcMd(plan: SamplePlan, coachNames: string[], intake: IntakePayload, notes: string): string {
  const lines: string[] = [];
  lines.push(`# Arc — ${plan.meta.title}`);
  lines.push("");
  lines.push(`**Horizon:** ${plan.meta.horizon}  `);
  lines.push(`**Days/week:** ${plan.meta.daysPerWeek}  `);
  lines.push(`**Session length:** ${plan.meta.sessionLength}  `);
  lines.push(`**Training team:** ${coachNames.join(" · ") || "—"}`);
  lines.push("");
  lines.push("## Goals");
  lines.push("");
  for (const g of intake.goals ?? []) {
    lines.push(`- ${g}`);
  }
  lines.push("");
  lines.push("## Rationale");
  lines.push("");
  lines.push(plan.rationale);
  lines.push("");
  lines.push("## Blocks");
  lines.push("");
  plan.blocks.forEach((b, i) => {
    lines.push(`### Block ${i + 1} · ${b.name}`);
    lines.push("");
    lines.push(`- Weeks: ${b.weeks} (${b.weekStart}–${b.weekEnd})`);
    lines.push(`- Focus: ${b.focus}`);
    lines.push(`- Drawn from: ${b.source}`);
    lines.push("");
  });
  lines.push("## KPIs");
  lines.push("");
  for (const k of plan.kpis) {
    const star = k.primary ? " ★" : "";
    lines.push(`- **${k.name}**${star} — ${k.baseline} → ${k.target} (tested ${k.measured})`);
  }
  if (notes) {
    lines.push("");
    lines.push("## Athlete notes");
    lines.push("");
    lines.push(notes);
  }
  lines.push("");
  return lines.join("\n");
}

function buildReadme(slug: string, plan: SamplePlan): string {
  return [
    `# Arc Bundle — ${plan.meta.title}`,
    "",
    `Self-contained ${plan.meta.horizon} training arc package. This is what the text agent reads to deliver daily prescriptions.`,
    "",
    "## Layout",
    "",
    "- `arc.md` — arc context (purpose, goals, blocks, KPIs)",
    "- `profile.md` — athlete profile snapshot at arc start",
    "- `training/active/` — current-week + current-block (hot path)",
    "- `training/blocks/` — full per-block programming",
    "- `training/weeks/` — pre-rendered weekly prescriptions",
    "- `styles/` — vendored style guides",
    "- `outputs/` — athlete-facing .xlsx",
    "- `nutrition/` — per-arc nutrition plan",
    "",
    `Slug: \`${slug}\``,
    "",
  ].join("\n");
}

function buildClaudeMd(plan: SamplePlan, coachNames: string[]): string {
  return [
    `# CLAUDE.md — ${plan.meta.title}`,
    "",
    "Operating instructions for the daily-execution agent.",
    "",
    `Training team: ${coachNames.join(" · ") || "—"}`,
    "",
    "## What to read first",
    "",
    "1. `arc.md` — goals + block sequence",
    "2. `profile.md` — current athlete state",
    "3. `training/active/current-week.md` — today's work",
    "",
    "## Constraints",
    "",
    "(filled in from athlete profile + intake)",
    "",
  ].join("\n");
}

function buildProfileMd(intake: IntakePayload, notes: string): string {
  const lines: string[] = [];
  lines.push("# Athlete profile snapshot");
  lines.push("");
  lines.push(`- Goals: ${(intake.goals ?? []).join(", ") || "—"}`);
  lines.push(`- Days/week capacity: ${intake.daysPerWeek ?? "—"}`);
  lines.push(`- Constraints: ${(intake.constraints ?? []).join(", ") || "—"}`);
  if (notes) {
    lines.push("");
    lines.push("## Notes from intake");
    lines.push("");
    lines.push(notes);
  }
  lines.push("");
  return lines.join("\n");
}

function buildBlockMd(plan: SamplePlan, blockIdx: number): string {
  const block = plan.blocks[blockIdx];
  const sample = plan.sampleWeeks[blockIdx];
  const lines: string[] = [];
  lines.push(`# Block ${blockIdx + 1} · ${block.name}`);
  lines.push("");
  lines.push(`- Weeks: ${block.weeks} (${block.weekStart}–${block.weekEnd})`);
  lines.push(`- Focus: ${block.focus}`);
  lines.push(`- Drawn from: ${block.source}`);
  lines.push("");
  if (sample) {
    lines.push(`## ${sample.label}`);
    lines.push("");
    for (const day of sample.days) {
      lines.push(`### ${day.day} — ${day.title}${day.rest ? " (rest)" : ""}`);
      lines.push("");
      day.exercises.forEach((ex, i) => {
        const parts: string[] = [];
        if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
        else if (ex.reps) parts.push(ex.reps);
        if (ex.load) parts.push(`@ ${ex.load}`);
        if (ex.note) parts.push(`— ${ex.note}`);
        lines.push(`${i + 1}. **${ex.name}** ${parts.join(" ")}`.trim());
      });
      lines.push("");
    }
  }
  return lines.join("\n");
}

function isoWeekFile(weekIdx: number): string {
  const n = String(weekIdx).padStart(2, "0");
  return `2026-training-W${n}.md`;
}

function buildWeekMd(plan: SamplePlan, weekIdx: number, blockIdx: number): string {
  const block = plan.blocks[blockIdx];
  const sample = plan.sampleWeeks[blockIdx];
  const lines: string[] = [];
  lines.push(`# Week 2026-training-W${String(weekIdx).padStart(2, "0")} — ${block.name}`);
  lines.push("");
  lines.push(`- Arc week: ${weekIdx} of ${plan.meta.durationWeeks}`);
  lines.push(`- Block: ${block.name} (${block.weeks})`);
  lines.push("");
  if (sample) {
    lines.push("## 7-day overview");
    lines.push("");
    sample.days.forEach((d, i) => {
      lines.push(`${i + 1}. ${d.day} — ${d.title}`);
    });
    lines.push("");
    for (const day of sample.days) {
      lines.push(`### ${day.day} — ${day.title}${day.rest ? " (rest)" : ""}`);
      lines.push("");
      day.exercises.forEach((ex, i) => {
        const parts: string[] = [];
        if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
        else if (ex.reps) parts.push(ex.reps);
        if (ex.load) parts.push(`@ ${ex.load}`);
        if (ex.note) parts.push(`— ${ex.note}`);
        lines.push(`${i + 1}. **${ex.name}** ${parts.join(" ")}`.trim());
      });
      lines.push("");
    }
  }
  return lines.join("\n");
}

function blockIdxForWeek(plan: SamplePlan, weekIdx: number): number {
  for (let i = 0; i < plan.blocks.length; i++) {
    const b = plan.blocks[i];
    if (weekIdx >= b.weekStart && weekIdx <= b.weekEnd) return i;
  }
  return 0;
}

function buildNutritionStub(plan: SamplePlan): string {
  return [
    `# Nutrition — ${plan.meta.title}`,
    "",
    "> TODO: per-arc nutrition cascade. Run `plan-nutrition-arc` skill against this arc to populate.",
    "",
    "Strategy summary will live here.",
    "",
  ].join("\n");
}

// ─── Bundle composition ────────────────────────────────────────────────────

type BundleFile = { path: string; content: string };

function composeBundle(slug: string, plan: SamplePlan, coachNames: string[], intake: IntakePayload, notes: string): BundleFile[] {
  const files: BundleFile[] = [];
  files.push({ path: "README.md", content: buildReadme(slug, plan) });
  files.push({ path: "CLAUDE.md", content: buildClaudeMd(plan, coachNames) });
  files.push({ path: "profile.md", content: buildProfileMd(intake, notes) });
  files.push({ path: "training/arc.md", content: buildArcMd(plan, coachNames, intake, notes) });
  plan.blocks.forEach((b, i) => {
    const safeName = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    files.push({
      path: `training/blocks/block-${i + 1}-${safeName}.md`,
      content: buildBlockMd(plan, i),
    });
  });
  for (let w = 1; w <= plan.meta.durationWeeks; w++) {
    const b = blockIdxForWeek(plan, w);
    files.push({
      path: `training/weeks/${isoWeekFile(w)}`,
      content: buildWeekMd(plan, w, b),
    });
  }
  files.push({ path: "training/active/current-week.md", content: buildWeekMd(plan, 1, 0) });
  files.push({ path: "training/active/current-block.md", content: buildBlockMd(plan, 0) });
  files.push({ path: "nutrition/arc.md", content: buildNutritionStub(plan) });
  return files;
}

// ─── Disk write + archive ──────────────────────────────────────────────────

const REPO_ROOT = path.resolve(process.cwd(), "..", "..");

async function archivePreviousIfStale(athleteRoot: string): Promise<string | null> {
  // Look for prior arc-* directories (skip new slug, skip archive/).
  let entries: string[] = [];
  try {
    entries = await fs.readdir(athleteRoot);
  } catch {
    return null;
  }
  const arcDirs = entries.filter((e) => e.startsWith("arc-"));
  for (const dir of arcDirs) {
    const arcMdPath = path.join(athleteRoot, dir, "training", "arc.md");
    let staleEnough = false;
    try {
      const stat = await fs.stat(arcMdPath);
      const ageMs = Date.now() - stat.mtimeMs;
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;
      if (ageMs > fourteenDays) staleEnough = true;
      const content = await fs.readFile(arcMdPath, "utf8");
      if (/status:\s*complete/i.test(content)) staleEnough = true;
    } catch {
      // No arc.md — be conservative, skip.
      continue;
    }
    if (staleEnough) {
      const target = path.join(athleteRoot, "archive", dir);
      try {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.rename(path.join(athleteRoot, dir), target);
        return path.relative(REPO_ROOT, target);
      } catch {
        // Best-effort: ignore.
      }
    }
  }
  return null;
}

async function writeBundleToDisk(slug: string, files: BundleFile[]): Promise<{ archived: string | null; absRoot: string }> {
  const athleteRoot = path.join(REPO_ROOT, "athletes", ATHLETE);
  const archived = await archivePreviousIfStale(athleteRoot);
  const bundleRoot = path.join(athleteRoot, slug);
  for (const f of files) {
    const abs = path.join(bundleRoot, f.path);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    if (!existsSync(abs)) {
      await fs.writeFile(abs, f.content, "utf8");
    } else {
      // Idempotent: overwrite is fine since we own the generator.
      await fs.writeFile(abs, f.content, "utf8");
    }
  }
  // Empty marker dirs.
  for (const d of ["styles", "outputs"]) {
    await fs.mkdir(path.join(bundleRoot, d), { recursive: true });
  }
  return { archived, absRoot: bundleRoot };
}

// ─── Python skill invocation (best-effort) ─────────────────────────────────

function runPlanTrainingArc(bundleRoot: string): Promise<{ ok: boolean; reason?: string }> {
  return new Promise((resolve) => {
    const script = path.join(REPO_ROOT, ".claude", "skills", "plan-training-arc", "build_training_arc.py");
    if (!existsSync(script)) {
      resolve({ ok: false, reason: `script not found: ${script}` });
      return;
    }
    const proc = spawn("python3", [script], {
      cwd: REPO_ROOT,
      env: { ...process.env, ARC_BUNDLE_ROOT: bundleRoot },
      timeout: 30_000,
    });
    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("error", (err: Error) => resolve({ ok: false, reason: err.message }));
    proc.on("close", (code: number | null) => {
      if (code === 0) resolve({ ok: true });
      else resolve({ ok: false, reason: `exit ${code}: ${stderr.slice(0, 500)}` });
    });
  });
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: ActivateRequest;
  try {
    body = (await request.json()) as ActivateRequest;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const plan = body.plan;
  if (!plan || !plan.meta || !Array.isArray(plan.blocks)) {
    return Response.json({ error: "missing or invalid `plan`" }, { status: 400 });
  }
  const intake = body.intake ?? { goals: [], daysPerWeek: null, constraints: [] };
  const notes = typeof body.notes === "string" ? body.notes : "";
  const coachIds = Array.isArray(body.coachIds) ? body.coachIds : [];
  const coachNames = coachIds
    .map((id) => getCoach(id)?.name)
    .filter((n): n is string => !!n);

  const slug = buildSlug(intake);
  const files = composeBundle(slug, plan, coachNames, intake, notes);

  const writeFlag = process.env.WRITE_BUNDLE_TO_DISK === "1" || process.env.WRITE_BUNDLE_TO_DISK === "true";

  // Dry-run mode (default): return the would-be content as JSON.
  if (!writeFlag) {
    return Response.json({
      slug,
      athlete: ATHLETE,
      wrote: false,
      reason: "WRITE_BUNDLE_TO_DISK not set — returning structured content only",
      paths: {
        bundle: `athletes/${ATHLETE}/${slug}`,
        arc: `athletes/${ATHLETE}/${slug}/training/arc.md`,
        currentWeek: `athletes/${ATHLETE}/${slug}/training/active/current-week.md`,
        xlsx: `athletes/${ATHLETE}/${slug}/outputs/${slug}.xlsx`,
      },
      files: files.map((f) => ({ path: f.path, bytes: f.content.length })),
      preview: files.slice(0, 4),
      archived: null,
    });
  }

  // Live mode — actually write.
  let archived: string | null = null;
  let absRoot = "";
  try {
    const result = await writeBundleToDisk(slug, files);
    archived = result.archived;
    absRoot = result.absRoot;
  } catch (err) {
    return Response.json({
      error: `failed to write bundle: ${err instanceof Error ? err.message : String(err)}`,
    }, { status: 500 });
  }

  // Try to run the Python skill. Failure is non-fatal.
  const skillResult = await runPlanTrainingArc(absRoot);

  return Response.json({
    slug,
    athlete: ATHLETE,
    wrote: true,
    archived,
    paths: {
      bundle: `athletes/${ATHLETE}/${slug}`,
      arc: `athletes/${ATHLETE}/${slug}/training/arc.md`,
      currentWeek: `athletes/${ATHLETE}/${slug}/training/active/current-week.md`,
      xlsx: `athletes/${ATHLETE}/${slug}/outputs/${slug}.xlsx`,
    },
    skill: skillResult,
    files: files.map((f) => ({ path: f.path, bytes: f.content.length })),
  });
}
