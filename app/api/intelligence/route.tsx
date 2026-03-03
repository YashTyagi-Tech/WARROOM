import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// WARROOM Intelligence API
// ─────────────────────────────────────────────────────────────────────────────

const buildChatSystemPrompt = (date: string) => `You are WARROOM AI, a sharp real-time geopolitical intelligence analyst with access to today's live news feed.

TODAY'S DATE: ${date}

RULES:
1. Plain text ONLY — no JSON, no curly braces, no markdown asterisks.
2. Answer EXACTLY what was asked. Be specific to current events.
3. 2-6 sentences or "- " bullet points. Concise and factual.
4. Reference REAL current events from the live news context below.
5. If the context contains relevant news, prioritize it over old knowledge.
6. State dates/timeframes when known. Never give outdated info without flagging it.
7. No preamble. Start your answer immediately.`;

// ── LIVE NEWS FETCHER ─────────────────────────────────────────────────────────
async function fetchLiveHeadlines(): Promise<string[]> {
  const headlines: string[] = [];

  const feeds = [
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fworld%2Frss.xml&count=15",
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.aljazeera.com%2Fxml%2Frss%2Fall.xml&count=15",
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.reuters.com%2Freuters%2FworldNews&count=15",
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.nytimes.com%2Fservices%2Fxml%2Frss%2Fnyt%2FWorld.xml&count=15",
    "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.theguardian.com%2Fworld%2Frss&count=15",
  ];

  const results = await Promise.allSettled(
    feeds.map(async (url) => {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (data.status !== "ok" || !Array.isArray(data.items)) return [];
      return data.items
        .slice(0, 12)
        .map((item: any) => {
          const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "recent";
          return `[${pubDate}] ${item.title?.trim()} — ${data.feed?.title ?? "News"}`;
        });
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") headlines.push(...r.value);
  }

  const seen = new Set<string>();
  return headlines.filter((h) => {
    const key = h.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50);
}

// ── GROQ HELPER ───────────────────────────────────────────────────────────────
async function groq(
  model: string,
  system: string,
  user: string,
  json: boolean,
  maxTokens: number
): Promise<{ ok: boolean; text: string; rateLimit: boolean }> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: json ? 0.4 : 0.7,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.status === 429) return { ok: false, text: "", rateLimit: true };
    if (!res.ok) return { ok: false, text: "", rateLimit: false };
    const d = await res.json();
    return { ok: true, text: d.choices?.[0]?.message?.content ?? "", rateLimit: false };
  } catch {
    return { ok: false, text: "", rateLimit: false };
  }
}

// ── FALLBACK ──────────────────────────────────────────────────────────────────
const FALLBACK = {
  globalThreatLevel: 68, defcon: 3,
  summary: "Live intelligence feed temporarily unavailable. Data may be outdated.",
  updated: "",
  hotspotIntensity: { "Ukraine/Russia":0.90,"Taiwan Strait":0.75,"Gaza/Israel":0.82,"Korean Peninsula":0.60,"Strait of Hormuz":0.58,"Baltic Region":0.52,"South China Sea":0.70,"Yemen":0.65 },
  events: [
    { id:"f1", headline:"Russia-Ukraine war continues with active frontline fighting", detail:"Ongoing combat operations in eastern Ukraine.", severity:"critical", type:"ground", region:"Eastern Europe", country:"Ukraine/Russia", timeAgo:"live", source:"ISW", lat:48.5, lng:35.5 },
    { id:"f2", headline:"Gaza ceasefire negotiations ongoing", detail:"Mediators continue efforts to extend the ceasefire.", severity:"high", type:"ground", region:"Middle East", country:"Israel/Gaza", timeAgo:"live", source:"Reuters", lat:31.3, lng:34.3 },
    { id:"f3", headline:"Red Sea shipping disruptions persist", detail:"Commercial vessels rerouting around Cape of Good Hope.", severity:"high", type:"naval", region:"Middle East", country:"Yemen", timeAgo:"live", source:"Lloyd's", lat:15.2, lng:43.1 },
    { id:"f4", headline:"US-China tensions over Taiwan remain elevated", detail:"Military posturing on both sides continues.", severity:"high", type:"naval", region:"Asia-Pacific", country:"China/Taiwan/USA", timeAgo:"live", source:"CSIS", lat:24.5, lng:122.0 },
  ],
  nationThreats: [
    {name:"Russia",code:"RU",threat:90},{name:"Iran",code:"IR",threat:82},{name:"North Korea",code:"KP",threat:75},
    {name:"China",code:"CN",threat:72},{name:"Israel",code:"IL",threat:68},{name:"Yemen (Houthis)",code:"YE",threat:65},
    {name:"Syria",code:"SY",threat:48},{name:"Pakistan",code:"PK",threat:42},
  ],
  predictions: [
    {zone:"Ukraine/Russia",scenario:"Spring offensive season likely to intensify along eastern front.",probability:80,timeframe:"30 days"},
    {zone:"Gaza/Israel",scenario:"Ceasefire fragility increases risk of renewed operations.",probability:62,timeframe:"2 weeks"},
    {zone:"Red Sea/Yemen",scenario:"Houthi attacks continue threatening global shipping routes.",probability:72,timeframe:"7 days"},
    {zone:"Taiwan Strait",scenario:"PLA exercises may escalate in response to US arms deliveries.",probability:45,timeframe:"60 days"},
  ],
};

// ── ROUTE ─────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ content: [{ type: "text", text: "Invalid request." }] });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // ── CHAT ────────────────────────────────────────────────────────────────────
  if (body?.chat === true) {
    const context: string = body?.context ?? "";
    const messages: { role: string; content: string }[] = (body?.messages ?? [])
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({ role: m.role, content: String(m.content ?? "").slice(0, 1200) }));

    if (!messages.length) return NextResponse.json({ content: [{ type: "text", text: "No message." }] });

    // Fetch fresh headlines specifically for chat too
    let chatHeadlines: string[] = [];
    try {
      chatHeadlines = await fetchLiveHeadlines();
    } catch {}

    const headlinesSection = chatHeadlines.length > 0
      ? `\n\nLIVE NEWS FEED (fetched ${now.toUTCString()}):\n${chatHeadlines.slice(0, 25).map((h, i) => `${i+1}. ${h}`).join("\n")}`
      : "";

    const contextSection = context
      ? `\n\nINTEL CONTEXT:\n${context.slice(0, 1500)}`
      : "";

    const sys = buildChatSystemPrompt(dateStr) + headlinesSection + contextSection;
    const lastMsg = messages[messages.length - 1].content;

    for (const model of ["llama-3.3-70b-versatile", "llama3-70b-8192", "llama-3.1-8b-instant", "llama3-8b-8192"]) {
      const r = await groq(model, sys, lastMsg, false, 600);
      if (r.rateLimit) continue;
      if (!r.ok || !r.text.trim()) continue;
      let t = r.text.trim();
      // Strip any JSON wrapper if model returns it
      if (t.startsWith("{")) {
        try {
          const p = JSON.parse(t);
          for (const k of ["response", "answer", "message", "text", "analysis", "summary"]) {
            if (typeof p[k] === "string" && p[k].length > 10) { t = p[k]; break; }
          }
        } catch {}
      }
      return NextResponse.json({ content: [{ type: "text", text: t }] });
    }
    return NextResponse.json({ content: [{ type: "text", text: "Rate limit reached — please wait a moment and try again." }] });
  }

  // ── INTEL ───────────────────────────────────────────────────────────────────
  console.log("[WARROOM] Fetching live news...");
  let headlines: string[] = [];
  try {
    headlines = await fetchLiveHeadlines();
  } catch (e) {
    console.warn("[WARROOM] News fetch failed:", e);
  }

  const frontendHeadlines: string = body?.newsHeadlines ?? "";
  if (headlines.length === 0 && frontendHeadlines.trim().length > 20) {
    headlines = frontendHeadlines.split("\n").filter(Boolean);
  }

  console.log(`[WARROOM] Got ${headlines.length} live headlines`);

  const hasNews = headlines.length > 3;
  const headlinesBlock = hasNews
    ? `TODAY'S LIVE NEWS HEADLINES (${now.toUTCString()}):\n${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
    : `No live news available. Use your knowledge of ongoing world conflicts as of ${dateStr}.`;

  const INTEL_SYS = `You are a geopolitical intelligence analyst API. Respond with ONLY a valid JSON object — no markdown, no backticks, no explanation.

Required structure:
{
  "globalThreatLevel": <0-100>,
  "defcon": <1-5>,
  "summary": "<2-3 sentences describing the current global situation based on today's news>",
  "updated": "${now.toISOString()}",
  "hotspotIntensity": {
    "Ukraine/Russia":<0-1>,"Taiwan Strait":<0-1>,"Gaza/Israel":<0-1>,
    "Korean Peninsula":<0-1>,"Strait of Hormuz":<0-1>,"Baltic Region":<0-1>,
    "South China Sea":<0-1>,"Yemen":<0-1>
  },
  "events": [ ...12-18 events ],
  "nationThreats": [ ...8-10 nations ],
  "predictions": [ ...4-6 predictions ]
}

Event object: {"id","headline","detail","severity","type","region","country","timeAgo","source","lat","lng"}
- severity: critical|high|medium|low|info
- type: missile|nuclear|cyber|naval|ground|air|economic|terror|protest
- lat/lng: coordinates or null

NationThreat: {"name","code","threat"}
Prediction: {"zone","scenario","probability","timeframe"}

CRITICAL:
- EVERY event must be derived from the actual news headlines provided
- Headlines must be specific (include real place names, actor names, actions)
- Do NOT write generic template headlines
- Vary severity realistically
- Source field should match the news outlet from the headline`;

  const INTEL_USER = `Generate the intelligence report now.\n\n${headlinesBlock}\n\nCreate 12-18 specific events directly based on the headlines above. Each event headline should clearly reference a real story. Adjust threat levels to reflect what the news actually shows today.`;

  const MODELS = [
    "llama3-70b-8192",
    "llama-3.3-70b-versatile",
    "llama3-8b-8192",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ];

  for (const model of MODELS) {
    console.log(`[WARROOM] Intel → ${model}`);
    const r = await groq(model, INTEL_SYS, INTEL_USER, true, 4000);
    if (r.rateLimit) { console.warn(`[WARROOM] 429 on ${model}`); continue; }
    if (!r.ok || !r.text || r.text.trim() === "{}") { console.warn(`[WARROOM] empty on ${model}`); continue; }
    try {
      JSON.parse(r.text);
      console.log(`[WARROOM] SUCCESS: ${model}, news_grounded=${hasNews}`);
      return NextResponse.json({ content: [{ type: "text", text: r.text }] });
    } catch {
      console.warn(`[WARROOM] Bad JSON from ${model}`);
    }
  }

  console.error("[WARROOM] All models failed");
  return NextResponse.json({
    content: [{ type: "text", text: JSON.stringify({ ...FALLBACK, updated: now.toISOString() }) }],
  });
}