/**
 * POST /api/welcome-sms — TR-335
 *
 * Sends a single welcome SMS via Linq's partner-API v2 when an athlete
 * activates their plan.
 *
 *     POST { phone: string, planTitle: string }
 *     -> { sent: true }
 *     -> { sent: false, reason: "..." }
 *
 * Linq API contract (ported from app/sms_session.py + app/linq.py):
 *
 *     POST {LINQ_API_BASE_URL}/v2/chats
 *     headers: X-LINQ-INTEGRATION-TOKEN: {LINQ_API_KEY}
 *     body: {
 *       send_from: "{LINQ_FROM_NUMBER}",
 *       chat: { phone_numbers: ["+1XXXXXXXXXX"] },
 *       message: { text: "Your <planTitle> is live. Train hard." }
 *     }
 *
 * Never throws on Linq HTTP / network failure — returns a structured
 * { sent: false, reason } so the client can show a graceful message.
 */

type WelcomeSmsRequest = {
  phone?: string;
  planTitle?: string;
};

const LINQ_TIMEOUT_MS = 20_000;

function normalizePhone(input: string): string | null {
  // Strip non-digits, validate 10-digit US format, prepend +1.
  const digits = (input || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  // Accept "1XXXXXXXXXX" (11 digits starting with 1) for resilience.
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function POST(request: Request) {
  let body: WelcomeSmsRequest;
  try {
    body = (await request.json()) as WelcomeSmsRequest;
  } catch {
    return Response.json(
      { sent: false, reason: "invalid JSON body" },
      { status: 400 },
    );
  }

  const phoneRaw = typeof body.phone === "string" ? body.phone : "";
  const planTitle =
    typeof body.planTitle === "string" && body.planTitle.trim()
      ? body.planTitle.trim()
      : "plan";

  const toPhone = normalizePhone(phoneRaw);
  if (!toPhone) {
    return Response.json(
      { sent: false, reason: "invalid phone — expected 10-digit US number" },
      { status: 400 },
    );
  }

  const apiBaseUrl = (process.env.LINQ_API_BASE_URL || "").trim();
  const apiKey = (process.env.LINQ_API_KEY || "").trim();
  const fromNumber = (process.env.LINQ_FROM_NUMBER || "").trim();

  if (!apiBaseUrl || !apiKey || !fromNumber) {
    return Response.json({
      sent: false,
      reason: "linq_not_configured",
    });
  }

  const text = `Your ${planTitle} is live. Train hard.`;
  const url = `${apiBaseUrl.replace(/\/$/, "")}/v2/chats`;
  const payload = {
    send_from: fromNumber,
    chat: { phone_numbers: [toPhone] },
    message: { text },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINQ_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "X-LINQ-INTEGRATION-TOKEN": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const snippet = (await resp.text()).slice(0, 200);
      return Response.json({
        sent: false,
        reason: `linq_http_${resp.status}`,
        body: snippet,
      });
    }
    return Response.json({ sent: true });
  } catch (err) {
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? "linq_timeout"
          : err.message
        : "linq_request_failed";
    return Response.json({ sent: false, reason });
  } finally {
    clearTimeout(timer);
  }
}
