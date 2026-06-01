/**
 * POST /api/xlsx — TR-334
 *
 * Generates a downloadable .xlsx from a synthesized SamplePlan.
 *
 * Body: `{ plan: SamplePlan, athleteName?: string }`
 * Response: binary xlsx stream with attachment Content-Disposition.
 *
 * The workbook has 3 sheets:
 *   - Arc Overview — title, horizon, days/week, rationale, KPIs
 *   - Blocks       — one row per block (name, weeks, focus, source)
 *   - Sample Week  — exercises laid out by day for the default block
 *
 * The xlsx generated here is the v0 athlete-facing artifact. It mirrors the
 * preview UI's three structural sections so the file matches what the athlete
 * just saw on screen.
 */
import ExcelJS from "exceljs";
import type {
  SamplePlan,
  SamplePlanBlock,
  SamplePlanKPI,
  SamplePlanSampleWeek,
} from "@/lib/sample-plan";

type XlsxRequest = {
  plan?: SamplePlan;
  athleteName?: string;
};

// ─── helpers ───────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return (input || "athlete")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "athlete";
}

function arcSlugFromTitle(title: string): string {
  // "Your 16-Week Strength & Hypertrophy Arc" -> "strength-hypertrophy-arc"
  return slugify(title.replace(/^your\s+/i, "").replace(/\d+[-\s]?week/i, ""));
}

function isValidPlan(p: unknown): p is SamplePlan {
  if (!p || typeof p !== "object") return false;
  const plan = p as Partial<SamplePlan>;
  return (
    !!plan.meta &&
    typeof plan.meta.title === "string" &&
    Array.isArray(plan.blocks) &&
    Array.isArray(plan.sampleWeeks) &&
    Array.isArray(plan.kpis)
  );
}

// ─── sheet builders ────────────────────────────────────────────────────────

function addArcOverview(wb: ExcelJS.Workbook, plan: SamplePlan, athleteName: string) {
  const ws = wb.addWorksheet("Arc Overview");
  ws.columns = [
    { header: "", key: "label", width: 22 },
    { header: "", key: "value", width: 80 },
  ];

  const titleRow = ws.addRow([plan.meta.title]);
  titleRow.font = { size: 16, bold: true };
  ws.mergeCells(`A${titleRow.number}:B${titleRow.number}`);
  ws.addRow([]);

  const meta: [string, string | number][] = [
    ["Athlete", athleteName],
    ["Horizon", plan.meta.horizon],
    ["Duration (weeks)", plan.meta.durationWeeks],
    ["Days / week", plan.meta.daysPerWeek],
    ["Session length", plan.meta.sessionLength],
  ];
  for (const [label, value] of meta) {
    const row = ws.addRow([label, value]);
    row.getCell(1).font = { bold: true };
  }

  ws.addRow([]);
  const rationaleHdr = ws.addRow(["Rationale"]);
  rationaleHdr.font = { bold: true, size: 12 };
  const rationaleRow = ws.addRow([plan.rationale]);
  ws.mergeCells(`A${rationaleRow.number}:B${rationaleRow.number}`);
  rationaleRow.getCell(1).alignment = { wrapText: true, vertical: "top" };
  rationaleRow.height = 80;

  ws.addRow([]);
  const kpiHdr = ws.addRow(["KPIs tracked"]);
  kpiHdr.font = { bold: true, size: 12 };
  const kpiCols = ws.addRow(["Metric", "Baseline → Target (measured)"]);
  kpiCols.font = { bold: true };
  for (const kpi of plan.kpis as SamplePlanKPI[]) {
    const label = `${kpi.name}${kpi.primary ? " (headline)" : ""}`;
    const value = `${kpi.baseline} → ${kpi.target} · tested ${kpi.measured}`;
    ws.addRow([label, value]);
  }
}

function addBlocks(wb: ExcelJS.Workbook, plan: SamplePlan) {
  const ws = wb.addWorksheet("Blocks");
  ws.columns = [
    { header: "#",      key: "n",      width: 4  },
    { header: "Name",   key: "name",   width: 28 },
    { header: "Weeks",  key: "weeks",  width: 14 },
    { header: "Focus",  key: "focus",  width: 60 },
    { header: "Source", key: "source", width: 24 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).alignment = { vertical: "middle" };

  (plan.blocks as SamplePlanBlock[]).forEach((b, i) => {
    const row = ws.addRow({
      n: i + 1,
      name: b.name,
      weeks: b.weeks,
      focus: b.focus,
      source: b.source,
    });
    row.alignment = { wrapText: true, vertical: "top" };
  });
}

function addSampleWeek(wb: ExcelJS.Workbook, plan: SamplePlan) {
  const ws = wb.addWorksheet("Sample Week");

  const idx = Math.min(
    Math.max(plan.defaultBlockIdx ?? 0, 0),
    Math.max(plan.sampleWeeks.length - 1, 0),
  );
  const week: SamplePlanSampleWeek | undefined = plan.sampleWeeks[idx];

  if (!week) {
    ws.addRow(["No sample week available."]);
    return;
  }

  const header = ws.addRow([week.label]);
  header.font = { bold: true, size: 14 };
  ws.mergeCells(`A${header.number}:E${header.number}`);
  ws.addRow([]);

  const cols = ws.addRow(["Day", "Title", "Exercise", "Sets × Reps", "Load / Note"]);
  cols.font = { bold: true };
  ws.columns = [
    { width: 8  },
    { width: 22 },
    { width: 34 },
    { width: 16 },
    { width: 28 },
  ];

  for (const day of week.days) {
    const exercises = day.exercises.length > 0 ? day.exercises : [{ name: "—" }];
    exercises.forEach((ex, i) => {
      const prescription = [
        ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.reps ?? "",
      ].filter(Boolean).join(" ");
      const loadNote = [ex.load, ex.note].filter(Boolean).join(" · ");
      ws.addRow([
        i === 0 ? day.day : "",
        i === 0 ? day.title : "",
        ex.name,
        prescription,
        loadNote,
      ]);
    });
  }
}

// ─── handler ───────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: XlsxRequest;
  try {
    body = (await request.json()) as XlsxRequest;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!isValidPlan(body.plan)) {
    return Response.json({ error: "missing or invalid `plan`" }, { status: 400 });
  }

  const plan = body.plan;
  const athleteName = (body.athleteName ?? "Andy Lee").trim() || "Andy Lee";

  const wb = new ExcelJS.Workbook();
  wb.creator = "Train";
  wb.created = new Date();
  wb.title = plan.meta.title;

  addArcOverview(wb, plan, athleteName);
  addBlocks(wb, plan);
  addSampleWeek(wb, plan);

  const buffer = await wb.xlsx.writeBuffer();

  const nameSlug = slugify(athleteName);
  const arcSlug = arcSlugFromTitle(plan.meta.title);
  const filename = `${nameSlug}-${arcSlug}.xlsx`;

  return new Response(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
