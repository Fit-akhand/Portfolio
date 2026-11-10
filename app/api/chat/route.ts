import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/knowledge";
import { allow } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Two providers. Groq has a free tier; Claude is paid. Models can be overridden in the environment.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-5-5";
const IP_LIMIT = Number(process.env.CHAT_IP_LIMIT) || 20; // messages per IP per 10 minutes
const DAY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT) || 300; // messages per day, all visitors
const MAX_USER_CHARS = 400;
const MAX_ASSISTANT_CHARS = 1500;
const MAX_TURNS = 8;

type Provider = "groq" | "claude";
type ChatMsg = { role: "user" | "assistant"; content: string };

const fail = (status: number, error: string) => Response.json({ error }, { status });

// AI_PROVIDER forces one when both keys exist; otherwise the free one (Groq) wins.
function pickProvider(): Provider | null {
  const want = (process.env.AI_PROVIDER || "").toLowerCase();
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  if (want === "claude" && hasClaude) return "claude";
  if (want === "groq" && hasGroq) return "groq";
  if (hasGroq) return "groq";
  if (hasClaude) return "claude";
  return null;
}

// The browser asks this to learn whether AI replies are on, and which one (never exposes a key).
export async function GET() {
  const provider = pickProvider();
  return Response.json({ ai: provider !== null, provider });
}

function parseMessages(body: unknown): ChatMsg[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: ChatMsg[] = [];
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

// Akhand's pronouns aren't known, so never let a model guess them. The prompt forbids it;
// this is the safety net for models that slip.
function scrubPronouns(text: string): string {
  return text
    .replace(/\b[Hh]e['\u2019]s\b/g, "Akhand's")
    .replace(/\b[Hh]e\b/g, "Akhand")
    .replace(/\b[Ss]he\b/g, "Akhand")
    .replace(/\b[Hh]is\b/g, "Akhand's")
    .replace(/\b[Hh]im\b/g, "Akhand");
}

async function askGroq(messages: ChatMsg[], systemPrompt: string): Promise<Response> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 20_000);
  try {
    // Groq's API is OpenAI-compatible
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 800, // reasoning models spend part of this thinking; replies themselves stay short
        temperature: 0.3, // stay close to the facts
        // only the gpt-oss models take this; other models would reject the field
        ...(GROQ_MODEL.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      console.error("[chat] Groq rejected the API key. Check GROQ_API_KEY.");
      return fail(502, "upstream_auth");
    }
    if (res.status === 429) return fail(429, "upstream_busy"); // free-tier limit reached
    if (!res.ok) {
      console.error("[chat] Groq error", res.status);
      return fail(502, "upstream_error");
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
    console.info("[chat] groq tokens in/out:", data.usage?.prompt_tokens, data.usage?.completion_tokens); // counts only, never content
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply ? Response.json({ reply: scrubPronouns(reply) }) : fail(502, "empty");
  } catch {
    console.error("[chat] Groq request failed");
    return fail(502, "error");
  } finally {
    clearTimeout(timeout);
  }
}

async function askClaude(messages: ChatMsg[], systemPrompt: string): Promise<Response> {
  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
    const res = await client.messages.create({
      model: CLAUDE_MODEL,
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
    return reply ? Response.json({ reply: scrubPronouns(reply) }) : fail(502, "empty");
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

  const provider = pickProvider();
  if (!provider) return fail(503, "ai_unavailable");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await allow(`ip:${ip}`, IP_LIMIT, 600))) return fail(429, "slow_down");
  const day = new Date().toISOString().slice(0, 10);
  if (!(await allow(`day:${day}`, DAY_LIMIT, 86400))) return fail(429, "daily_limit");

  // small prompt: core facts + full detail only for the project(s) being asked about
  const recent = messages.filter((m) => m.role === "user").slice(-2).map((m) => m.content);
  const prompt = buildSystemPrompt(recent);
  return provider === "groq" ? askGroq(messages, prompt) : askClaude(messages, prompt);
}
