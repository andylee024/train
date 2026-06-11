/**
 * POST /api/synthesize — A24-294
 *
 * Synthesizes a SamplePlan from the selected coaches + athlete intake using
 * Claude with tool use to enforce structured output. Streams progress events
 * (SSE) so the client can update the synthesizing UI line-by-line.
 *
 * Falls back to the mocked `buildSamplePlan` if ANTHROPIC_API_KEY is missing
 * or the API call fails — the route always returns a valid SamplePlan so the
 * preview step keeps working.
 */
import Anthropic from "@anthropic-ai/sdk";
import { COACHES, getCoach, type Coach } from "@/lib/coaches";
import { COACH_PROFILES } from "@/lib/coach-profiles";
import {
  buildSamplePlan,
  type SamplePlan,
} from "@/lib/sample-plan";
import type { GoalKey, ConstraintKey } from "@/lib/use-intake";

type IntakePayload = {
  goals?: GoalKey[];
  daysPerWeek?: number | null;
  constraints?: ConstraintKey[];
};

type SynthesizeRequest = {
  coachIds?: string[];
  intake?: IntakePayload;
  notes?: string;
};

const MODEL = "claude-opus-4-7";

// ─── JSONSchema for the synthesized plan (matches SamplePlan in sample-plan.ts)

const PLAN_TOOL: Anthropic.Tool = {
  name: "emit_plan",
  description:
    "Emit the final synthesized training plan. Call exactly once at the end of synthesis with the complete plan in the structure required.",
  input_schema: {
    type: "object",
    properties: {
      meta: {
        type: "object",
        properties: {
          title: { type: "string" },
          horizon: { type: "string" },
          durationWeeks: { type: "number" },
          daysPerWeek: { type: "number" },
          sessionLength: { type: "string" },
        },
        required: ["title", "horizon", "durationWeeks", "daysPerWeek", "sessionLength"],
      },
      rationale: { type: "string" },
      blocks: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            weeks: { type: "string" },
            focus: { type: "string" },
            source: { type: "string", description: "Coach the block draws from most heavily" },
            weekStart: { type: "number" },
            weekEnd: { type: "number" },
          },
          required: ["name", "weeks", "focus", "source", "weekStart", "weekEnd"],
        },
      },
      sampleWeeks: {
        type: "array",
        description: "One sample week per block (length === blocks.length)",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            days: {
              type: "array",
              minItems: 7,
              maxItems: 7,
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  title: { type: "string" },
                  rest: { type: "boolean" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        shortName: { type: "string" },
                        sets: { type: "string" },
                        reps: { type: "string" },
                        load: { type: "string" },
                        note: { type: "string" },
                      },
                      required: ["name"],
                    },
                  },
                },
                required: ["day", "title", "exercises"],
              },
            },
          },
          required: ["label", "days"],
        },
      },
      defaultBlockIdx: { type: "number" },
      kpis: {
        type: "array",
        minItems: 2,
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            baseline: { type: "string" },
            target: { type: "string" },
            measured: { type: "string" },
            primary: { type: "boolean" },
          },
          required: ["name", "baseline", "target", "measured"],
        },
      },
    },
    required: ["meta", "rationale", "blocks", "sampleWeeks", "defaultBlockIdx", "kpis"],
  },
};

// ─── Prompt builder ────────────────────────────────────────────────────────

function buildSystemPrompt(coaches: Coach[], intake: IntakePayload, notes: string): string {
  const lines: string[] = [];
  lines.push(
    "You are a training-plan synthesizer. The athlete has selected a team of coaches whose philosophies you must blend into ONE coherent 16-week arc."
  );
  lines.push("");
  lines.push("Selected coaches:");
  for (const c of coaches) {
    const profile = COACH_PROFILES[c.id];
    lines.push(`- ${c.name} (${c.category}) — ${c.tagline}`);
    lines.push(`  Philosophy: ${c.philosophy}`);
    if (profile) {
      lines.push("  Principles:");
      for (const p of profile.principles) {
        lines.push(`    • ${p.title}: ${p.body}`);
      }
    }
    lines.push("");
  }
  lines.push("Athlete intake:");
  lines.push(`- Goals: ${(intake.goals ?? []).join(", ") || "none specified"}`);
  lines.push(`- Days per week: ${intake.daysPerWeek ?? "unspecified"}`);
  lines.push(`- Constraints: ${(intake.constraints ?? []).join(", ") || "none"}`);
  if (notes) {
    lines.push(`- Notes: ${notes}`);
  }
  lines.push("");
  lines.push(
    "Output requirements: call the `emit_plan` tool exactly once with a complete plan."
  );
  lines.push("- Arc is 16 weeks divided into 4 blocks of 4 weeks each.");
  lines.push("- Each block should credit ONE selected coach in `source` (rotate so every coach gets a block where reasonable).");
  lines.push("- sampleWeeks must have exactly one entry per block in matching order.");
  lines.push("- Each sample week has 7 days (Mon–Sun) with 1–6 exercises each (rest days are OK).");
  lines.push("- Use `shortName` for exercises that have long names so narrow grid rendering works.");
  lines.push("- Provide 3–5 KPIs; mark ONE as `primary` aligned to the athlete's top goal.");
  lines.push("- The rationale (~3–4 sentences) explains how the coaches' principles are sequenced across blocks.");
  return lines.join("\n");
}

// ─── Streaming helper ──────────────────────────────────────────────────────

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: SynthesizeRequest;
  try {
    body = (await request.json()) as SynthesizeRequest;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const coachIds = Array.isArray(body.coachIds) ? body.coachIds : [];
  const intake = body.intake ?? { goals: [], daysPerWeek: null, constraints: [] };
  const notes = typeof body.notes === "string" ? body.notes : "";
  const coaches = coachIds
    .map((id) => getCoach(id))
    .filter((c): c is Coach => !!c);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = buildSamplePlan(coaches.length > 0 ? coaches : COACHES.slice(0, 3), (intake.goals ?? []) as GoalKey[]);

  // No key → return fallback synchronously (with banner flag).
  if (!apiKey) {
    return Response.json({
      plan: fallback,
      synthesized: false,
      reason: "ANTHROPIC_API_KEY not set — falling back to mocked plan",
    });
  }

  // Stream progress events + final plan via SSE.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(sseEncode(event, data)));

      try {
        send("progress", { step: "loading_principles", label: "Loading coach principles" });
        const client = new Anthropic({ apiKey });

        send("progress", { step: "reading_context", label: "Reading your context" });

        const systemPrompt = buildSystemPrompt(coaches, intake, notes);

        send("progress", { step: "designing_arc", label: "Designing arc structure" });

        const response = await client.messages.create({
          model: MODEL,
          max_tokens: 8000,
          system: systemPrompt,
          tools: [PLAN_TOOL],
          tool_choice: { type: "tool", name: "emit_plan" },
          messages: [
            {
              role: "user",
              content:
                "Synthesize the 16-week plan now. Call the emit_plan tool exactly once with the full structured plan.",
            },
          ],
        });

        // Find the tool_use block.
        const toolUse = response.content.find(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );
        if (!toolUse) {
          throw new Error("model did not call emit_plan tool");
        }
        const plan = toolUse.input as SamplePlan;

        // Emit a synthetic per-block progress event so the UI can render the
        // block-by-block ticks even though the model produced everything at once.
        const blocks = Array.isArray(plan.blocks) ? plan.blocks : [];
        blocks.forEach((b, i) => {
          send("progress", {
            step: `block_${i + 1}`,
            label: `Block ${i + 1} · ${b.name ?? "Designed"}`,
          });
        });

        send("done", { plan, synthesized: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send("error", { message });
        send("done", {
          plan: fallback,
          synthesized: false,
          reason: `API error: ${message}`,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
