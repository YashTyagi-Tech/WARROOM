import { NextResponse } from "next/server";

// Longer TTLs — chart data doesn't need to be fresh every minute
const PRICE_TTL = 2 * 60_000;   // 2 min for prices
const CHART_TTL = 10 * 60_000;  // 10 min for charts

// Persist across Next.js hot reloads in dev
declare global {
  var __cgCache: Map<string, { data: unknown; ts: number }> | undefined;
  var __cgInflight: Map<string, Promise<unknown>> | undefined;
  var __cgLastRequest: number | undefined;
}

const cache    = (global.__cgCache   ??= new Map());
const inflight = (global.__cgInflight ??= new Map());

// CoinGecko free tier: ~30 req/min → enforce ~2.5s minimum gap between outbound calls
const MIN_GAP_MS = 2_500;

function getTTL(path: string) {
  return path.includes("market_chart") || path.includes("ohlc") ? CHART_TTL : PRICE_TTL;
}

async function fetchCG(path: string, params: string): Promise<unknown> {
  const key = `${path}?${params}`;
  const ttl = getTTL(path);

  // 1. Serve from fresh cache
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttl) return hit.data;

  // 2. Deduplicate concurrent requests for the same key
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      // 3. Global throttle — space out outbound requests
      const wait = MIN_GAP_MS - (Date.now() - (global.__cgLastRequest ?? 0));
      if (wait > 0) await new Promise(r => setTimeout(r, wait));

      global.__cgLastRequest = Date.now();

      const url = `https://api.coingecko.com/api/v3/${path}?${params}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        // Next.js cache tag for ISR revalidation
        next: { revalidate: Math.floor(ttl / 1000) },
      });

      if (res.status === 429) {
        console.warn(`[CoinGecko] 429 — ${key} — serving stale cache`);
        if (hit) return hit.data;
        throw new Error("429");
      }

      if (!res.ok) {
        if (hit) return hit.data;
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      cache.set(key, { data, ts: Date.now() });
      return data;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path   = decodeURIComponent(searchParams.get("path")   ?? "");
  const params = decodeURIComponent(searchParams.get("params") ?? "");

  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  try {
    const data = await fetchCG(path, params);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg    = e instanceof Error ? e.message : "Failed";
    const status = msg === "429" ? 429 : 500;
    console.error("[crypto route]", msg);
    return NextResponse.json({ error: msg }, { status });
  }
}