import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "@/lib/knowledge";
import { allow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Small and cheap on purpose. Override with CLAUDE_MODEL in the environment.
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-5-5";
const IP_LIMIT = Number(process.env.CHAT_IP_LIMIT) || 20; // messages per IP per 10 minutes
const DAY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT) || 300; // messages per day, all visitors
const MAX_USER_CHARS = 400;
const MAX_ASSISTANT_CHARS = 1500;
const MAX_TURNS = 8;

const fail = (status: number, error: string) => Response.json({ error }, { status });

// The browser asks this to learn whether AI replies are switched on (never exposes the key).
export async function GET() {
  return Response.json({ ai: Boolean(process.env.ANTHROPIC_API_KEY) });
}

function parseMessages(body: unknown): Anthropic.MessageParam[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: Anthropic.MessageParam[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    const m = item as { role?: unknown; content?: unknown };
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const text = m.content.trim().slice(0, m.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS);
    if (text) out.push({ role: m.role, content: text });
  }
  while (out.length && out[0].role !== "user") out.shift(); // must start with the visitor
  if (!out.length || out[out.length - 1].role !== "user") return null;
  return out;
}

export async function POST(req: Request) {
  // same-origin browsers only (stops other websites calling this endpoint from a page)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return fail(403, "forbidden");
    } catch {
      return fail(403, "forbidden");
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "bad_request");
  }
  const messages = parseMessages(body);
  if (!messages) return fail(400, "bad_request");

  if (!process.env.ANTHROPIC_API_KEY) return fail(503, "ai_unavailable");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await allow(`ip:${ip}`, IP_LIMIT, 600))) return fail(429, "slow_down");
  const day = new Date().toISOString().slice(0, 10);
  if (!(await allow(`day:${day}`, DAY_LIMIT, 86400))) return fail(429, "daily_limit");

  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 500, // keeps replies short and caps the cost of one message
      system: systemPrompt,
      messages,
      output_config: { effort: "low" },
    });

    if (res.stop_reason === "refusal") return fail(502, "refused");
    const reply = res.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("\n")
      .trim();
    if (!reply) return fail(502, "empty");
    return Response.json({ reply });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return fail(429, "upstream_busy");
    if (e instanceof Anthropic.AuthenticationError) {
      console.error("[chat] Anthropic rejected the API key. Check ANTHROPIC_API_KEY.");
      return fail(502, "upstream_auth");
    }
    if (e instanceof Anthropic.APIError) {
      console.error("[chat] Anthropic API error", e.status);
      return fail(502, "upstream_error");
    }
    console.error("[chat] unexpected error");
    return fail(502, "error");
  }
}
