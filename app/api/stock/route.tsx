// app/api/stock/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "";
  const interval = searchParams.get("interval") || "1d";
  const range = searchParams.get("range") || "1d";

  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } }
    );
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ chart: { result: null } }, { status: 500 });
  }
}