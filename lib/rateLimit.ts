// Small request limiter. Uses Upstash Redis (REST) when configured, otherwise an
// in-memory counter. The in-memory version is per server instance, so on Vercel it is
// best-effort: pair it with a monthly spend limit in the Anthropic Console.
type Counter = { n: number; reset: number };
const mem = new Map<string, Counter>();

async function remoteIncr(key: string, windowSec: number): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const k = encodeURIComponent(key);
    const r = await fetch(`${url}/incr/${k}`, { headers, cache: "no-store" });
    const { result } = (await r.json()) as { result?: number };
    if (typeof result !== "number") return null;
    if (result === 1) await fetch(`${url}/expire/${k}/${windowSec}`, { headers, cache: "no-store" });
    return result;
  } catch {
    return null;
  }
}

/** Counts one hit. Returns true while the key is within `limit` for the window. */
export async function allow(key: string, limit: number, windowSec: number): Promise<boolean> {
  const remote = await remoteIncr(key, windowSec);
  if (remote !== null) return remote <= limit;

  const now = Date.now();
  if (mem.size > 5000) for (const [k, v] of mem) if (v.reset < now) mem.delete(k);
  const c = mem.get(key);
  if (!c || c.reset < now) {
    mem.set(key, { n: 1, reset: now + windowSec * 1000 });
    return true;
  }
  c.n += 1;
  return c.n <= limit;
}
