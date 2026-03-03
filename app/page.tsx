"use client";
import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ===== Theme Context =====
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  t: ThemeColors;
}

interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  sidebar: string;
  header: string;
  ticker: string;
  inputBg: string;
  cardBg: string;
  cardHover: string;
  scrollbar: string;
}

const DARK_THEME: ThemeColors = {
  bg: "#000",
  bgSecondary: "#050505",
  bgTertiary: "#0a0a0a",
  border: "#1c1c1c",
  borderLight: "#111",
  text: "#e2e8f0",
  textSecondary: "#c4d4e8",
  textMuted: "#8aaccc",
  textDim: "#444",
  sidebar: "linear-gradient(180deg,#050505 0%,#030303 100%)",
  header: "#050505",
  ticker: "#080808",
  inputBg: "#080808",
  cardBg: "#0a0a0a",
  cardHover: "#0f0f0f",
  scrollbar: "#1c1c1c",
};

const LIGHT_THEME: ThemeColors = {
  bg: "#f0f2f5",
  bgSecondary: "#e8ecf0",
  bgTertiary: "#ffffff",
  border: "#d0d8e4",
  borderLight: "#dde3ec",
  text: "#0f172a",
  textSecondary: "#1e3a5f",
  textMuted: "#2d5a8e",
  textDim: "#64748b",
  sidebar: "linear-gradient(180deg,#e8ecf0 0%,#dde3ec 100%)",
  header: "#e8ecf0",
  ticker: "#dde3ec",
  inputBg: "#f8fafc",
  cardBg: "#ffffff",
  cardHover: "#f1f5f9",
  scrollbar: "#cbd5e1",
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  t: DARK_THEME,
});

const useTheme = () => useContext(ThemeContext);

// ===== Type Definitions =====
interface Event {
  id?: string;
  headline: string;
  detail?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type?: string;
  lat?: number;
  lng?: number;
  country?: string;
  region?: string;
  timeAgo?: string;
  source?: string;
  url?: string;
}
interface Hotspot { id: number; name: string; lat: number; lng: number; type: string; base: number; intensity?: number; }
interface NewsItem { title: string; source: string; url: string; time: string; pubDate?: string; pubDateMs?: number; image?: string | null; description?: string; }
interface VideoItem { videoId: string; title: string; channel: string; url: string; thumb?: string; }
interface CryptoCoin { id: string; name: string; symbol: string; color: string; price: number; change: number; marketCap: number; volume: number; }
interface Stock { id: string; name: string; color: string; sym: string; price: number; change: number; }
interface MarketAnalysis { ticker: string; direction: 'up' | 'down' | 'neutral'; summary: string; reasons: string[]; relatedNews: string[]; }

// ===== Constants =====
const SEV: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e", info: "#818cf8" };
const TICON: Record<string, string> = { missile: "[MSL]", nuclear: "[NUC]", cyber: "[CYB]", naval: "[NAV]", ground: "[GND]", air: "[AIR]", economic: "[ECO]", terror: "[TER]", protest: "[PRO]", default: "[EVT]" };
const TCOL: Record<string, string> = { missile: "#ef4444", nuclear: "#ef4444", naval: "#f97316", ground: "#eab308", cyber: "#22c55e", air: "#818cf8", economic: "#38bdf8", terror: "#fb923c", protest: "#86efac", default: "#64748b" };

const HOTSPOTS: Hotspot[] = [
  { id: 1, name: "Ukraine/Russia", lat: 49, lng: 32, type: "ground", base: 0.95 },
  { id: 2, name: "Taiwan Strait", lat: 24, lng: 121, type: "naval", base: 0.85 },
  { id: 3, name: "Gaza/Israel", lat: 31, lng: 34, type: "missile", base: 0.88 },
  { id: 4, name: "Korean Peninsula", lat: 37, lng: 127, type: "nuclear", base: 0.72 },
  { id: 5, name: "Strait of Hormuz", lat: 26, lng: 57, type: "naval", base: 0.68 },
  { id: 6, name: "Baltic Region", lat: 58, lng: 20, type: "cyber", base: 0.60 },
  { id: 7, name: "South China Sea", lat: 15, lng: 114, type: "naval", base: 0.80 },
  { id: 8, name: "Yemen", lat: 15, lng: 47, type: "missile", base: 0.70 },
];

const LAND = [
  "M130,60 L170,55 L200,70 L220,80 L230,100 L240,120 L235,145 L220,160 L210,180 L200,200 L190,220 L175,235 L160,245 L150,240 L140,225 L125,210 L115,195 L110,175 L108,155 L112,135 L115,115 L118,95 L122,75 Z",
  "M195,25 L225,20 L240,30 L245,45 L240,58 L225,62 L208,58 L198,45 Z",
  "M185,265 L210,260 L230,270 L245,290 L250,320 L248,350 L240,375 L225,390 L210,395 L195,385 L182,365 L175,340 L172,310 L175,285 Z",
  "M450,55 L490,50 L510,60 L525,75 L520,90 L510,100 L495,105 L480,100 L465,95 L455,85 L448,70 Z",
  "M435,60 L445,57 L448,68 L440,72 L433,68 Z",
  "M490,35 L510,30 L520,40 L515,55 L500,58 L488,50 Z",
  "M460,110 L510,105 L540,115 L560,130 L565,160 L560,195 L555,230 L545,265 L530,295 L515,320 L500,335 L485,330 L470,315 L458,290 L450,260 L445,230 L440,200 L438,170 L440,145 L445,125 Z",
  "M530,40 L620,30 L700,35 L750,45 L780,55 L800,65 L810,80 L800,95 L780,100 L750,100 L720,95 L690,90 L660,88 L630,85 L600,80 L570,78 L545,75 L530,65 Z",
  "M535,120 L565,115 L585,125 L590,145 L580,160 L560,165 L540,158 L530,142 Z",
  "M595,130 L625,125 L640,140 L645,165 L640,190 L628,205 L612,200 L600,185 L592,165 L590,145 Z",
  "M670,145 L700,140 L720,150 L725,165 L715,178 L700,180 L685,172 L672,160 Z",
  "M630,70 L690,65 L730,75 L755,90 L760,110 L750,130 L730,140 L700,138 L670,132 L645,120 L630,108 L625,90 Z",
  "M760,80 L770,75 L778,83 L775,92 L765,95 L758,87 Z",
  "M720,290 L770,280 L810,285 L835,305 L840,330 L830,355 L810,368 L785,370 L760,360 L740,340 L725,315 Z",
];

// ===== Responsive Hook =====
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ===== Utility Functions =====
function ll2xy(lat: number, lng: number) { return { x: (lng + 180) * (1000 / 360), y: (90 - lat) * (500 / 180) }; }

function decodeHtmlEntities(text: string): string {
  return text.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&nbsp;/g," ").replace(/&#(\d+);/g,(_,d)=>String.fromCharCode(Number(d))).replace(/&#x([0-9a-fA-F]+);/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
}

function formatAIText(raw: string): string {
  if (!raw) return "";
  let text = decodeHtmlEntities(raw);
  text = text.replace(/\*\*\*(.+?)\*\*\*/gs,"$1").replace(/\*\*(.+?)\*\*/gs,"$1").replace(/\*(.+?)\*/gs,"$1").replace(/__(.+?)__/gs,"$1").replace(/_(.+?)_/gs,"$1").replace(/^#{1,6}\s+/gm,"").replace(/^[\*\-]\s+/gm,"• ").replace(/\\n/g,"\n").replace(/\n{3,}/g,"\n\n");
  return text.trim();
}

function extractReadableText(raw: string): string {
  if (!raw || typeof raw !== "string") return "No response available.";
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      for (const k of ["summary","analysis","response","message","text","content","answer","result"]) {
        if (typeof parsed[k] === "string" && parsed[k].length > 0) return formatAIText(parsed[k]);
      }
      if (parsed?.events || parsed?.predictions || parsed?.nationThreats) {
        const parts = [];
        if (parsed.summary) parts.push(parsed.summary);
        if (parsed.globalThreatLevel) parts.push(`Global threat level: ${parsed.globalThreatLevel}%. DEFCON ${parsed.defcon ?? "?"}.`);
        if (parsed.events?.length) {
          const criticals = parsed.events.filter((e:any)=>e.severity==="critical"||e.severity==="high").slice(0,3);
          if (criticals.length) { parts.push("Key events:"); criticals.forEach((ev:any)=>parts.push(`• ${ev.headline}`)); }
        }
        return parts.join("\n\n") || "Intelligence data received.";
      }
    } catch {}
  }
  return formatAIText(trimmed);
}

// ===== NationThreatMatrix helpers =====
const NATION_KEYWORDS: Record<string,string[]> = {
  RU:["russia","russian","kremlin","moscow","putin"],UA:["ukraine","ukrainian","kyiv","zelensky"],
  IL:["israel","israeli","idf","tel aviv","netanyahu"],IR:["iran","iranian","tehran","irgc","khamenei"],
  CN:["china","chinese","pla","beijing","xi jinping"],TW:["taiwan","taiwanese","taipei"],
  KP:["north korea","dprk","pyongyang","kim jong"],US:["united states","usa","pentagon","washington dc"],
  SA:["saudi arabia","riyadh","houthi","yemen"],PK:["pakistan","islamabad"],
};
const NATION_LABELS: Record<string,string> = {
  RU:"Russia",UA:"Ukraine",IL:"Israel",IR:"Iran",CN:"China",TW:"Taiwan",KP:"North Korea",US:"United States",SA:"Saudi Arabia",PK:"Pakistan",
};
const SEV_WEIGHT: Record<string,number> = { critical:22,high:14,medium:7,low:3,info:1 };

function deriveThreatsFromEvents(events: Event[]): Record<string,number> {
  const scores: Record<string,number> = {};
  events.forEach(ev => {
    const text = `${ev.headline||""} ${ev.detail||""} ${ev.region||""} ${ev.country||""}`.toLowerCase();
    const weight = SEV_WEIGHT[ev.severity||"info"]??1;
    Object.entries(NATION_KEYWORDS).forEach(([code,kws])=>{ if(kws.some(k=>text.includes(k))) scores[code]=(scores[code]||0)+weight; });
  });
  const max = Math.max(...Object.values(scores),1);
  const normalized: Record<string,number> = {};
  Object.entries(scores).forEach(([code,score])=>{ normalized[code]=Math.min(100,Math.round((score/max)*100)); });
  return normalized;
}

function sanitizeThreat(v: unknown): number|null {
  const n = Number(v);
  if (!isFinite(n)||isNaN(n)) return null;
  return Math.max(0,Math.min(100,Math.round(n)));
}

function threatColor(t:number):string { return t>=85?"#ef4444":t>=70?"#f97316":t>=50?"#eab308":t>=30?"#22c55e":"#38bdf8"; }
function threatLabel(t:number):string { return t>=85?"CRITICAL":t>=70?"HIGH":t>=50?"ELEVATED":t>=30?"GUARDED":"LOW"; }

// ===== API Helpers =====
async function fetchCryptoPrices(): Promise<CryptoCoin[]> {
  const ids="bitcoin,ethereum,solana,binancecoin,ripple";
  const r=await fetch(`/api/crypto?path=simple/price&params=ids%3D${ids}%26vs_currencies%3Dusd%26include_24hr_change%3Dtrue%26include_market_cap%3Dtrue%26include_24hr_vol%3Dtrue`);
  const d=await r.json();
  const mapCG=(d:any)=>d?{price:d.usd,change:d.usd_24h_change||0,marketCap:d.usd_market_cap||0,volume:d.usd_24h_vol||0}:{price:0,change:0,marketCap:0,volume:0};
  return [
    {id:"BTC",name:"Bitcoin",symbol:"BTC",color:"#f97316",...mapCG(d.bitcoin)},
    {id:"ETH",name:"Ethereum",symbol:"ETH",color:"#818cf8",...mapCG(d.ethereum)},
    {id:"SOL",name:"Solana",symbol:"SOL",color:"#22c55e",...mapCG(d.solana)},
    {id:"BNB",name:"BNB",symbol:"BNB",color:"#eab308",...mapCG(d.binancecoin)},
    {id:"XRP",name:"Ripple",symbol:"XRP",color:"#38bdf8",...mapCG(d.ripple)},
  ];
}
const COIN_MAP: Record<string,string> = {BTC:"bitcoin",ETH:"ethereum",SOL:"solana",BNB:"binancecoin",XRP:"ripple"};
async function fetchCryptoChart(coinId:string,days=1):Promise<any[]> {
  try {
    const r=await fetch(`/api/crypto?path=coins%2F${coinId}%2Fmarket_chart&params=vs_currency%3Dusd%26days%3D${days}`);
    const d=await r.json();
    if(!d.prices)return[];
    return d.prices.map(([ts,price]:[number,number])=>({time:new Date(ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),price:Math.round(price*100)/100,ts})).filter((_:any,i:number,a:any[])=>i%Math.max(1,Math.floor(a.length/60))===0);
  } catch{return[];}
}
async function fetchStockPrice(symbol:string):Promise<{price:number;change:number}|null> {
  try {
    const r=await fetch(`/api/stock?symbol=${symbol}&interval=1d&range=1d`);
    const data=await r.json();
    const meta=data?.chart?.result?.[0]?.meta;
    if(!meta)return null;
    const price=meta.regularMarketPrice;
    const prev=meta.previousClose||meta.chartPreviousClose;
    return{price,change:prev?((price-prev)/prev)*100:0};
  }catch{return null;}
}
async function fetchAllStocks():Promise<Stock[]> {
  const symbols=[{id:"SPY",name:"S&P 500",color:"#22c55e",sym:"SPY"},{id:"QQQ",name:"NASDAQ",color:"#818cf8",sym:"QQQ"},{id:"GC=F",name:"Gold",color:"#eab308",sym:"GC%3DF"},{id:"CL=F",name:"Crude Oil",color:"#f97316",sym:"CL%3DF"},{id:"DX=F",name:"USD Index",color:"#64748b",sym:"DX%3DF"},{id:"TNX",name:"10Y Yield",color:"#38bdf8",sym:"^TNX"}];
  const results=await Promise.all(symbols.map(async s=>{const live=await fetchStockPrice(s.sym);return{...s,price:live?.price||0,change:live?.change||0};}));
  return results;
}
async function fetchStockChart(symbol:string):Promise<any[]> {
  try {
    const r=await fetch(`/api/stock?symbol=${symbol}&interval=5m&range=1d`);
    const data=await r.json();
    const result=data?.chart?.result?.[0];
    if(!result)return[];
    const ts=result.timestamp||[];
    const closes=result.indicators?.quote?.[0]?.close||[];
    return ts.map((t:number,i:number)=>({time:new Date(t*1000).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),price:closes[i]?Math.round(closes[i]*100)/100:null})).filter((d:any)=>d.price!=null).filter((_:any,i:number,a:any[])=>i%Math.max(1,Math.floor(a.length/60))===0);
  }catch{return[];}
}
async function fetchNewsHeadlines(topic="israel iran"):Promise<NewsItem[]> {
  try {
    const q=encodeURIComponent(topic);
    const feedUrl=`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
    const apiKey=process.env.NEXT_PUBLIC_RSS2JSON_KEY;
    if(!apiKey)return[];
    const apiUrl=`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=30&api_key=${apiKey}`;
    const r=await fetch(apiUrl);
    const d=await r.json();
    if(d.status==="ok"&&d.items?.length){
      return d.items.map((item:any)=>({title:item.title?.replace(/\s*-\s*[^-]+$/,""),source:item.author||item.title?.match(/ - ([^-]+)$/)?.[1]?.trim()||"News",url:item.link,time:new Date(item.pubDate).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}),pubDate:item.pubDate,pubDateMs:new Date(item.pubDate).getTime(),image:item.enclosure?.link||item.thumbnail||null,description:item.description?.replace(/<[^>]+>/g,"").slice(0,200)}));
    }
    return[];
  }catch{return[];}
}
async function fetchYouTubeVideos():Promise<VideoItem[]> {
  try {
    const channels=[{name:"Al Jazeera",id:"UCNye-wNBqNL5ZzHSJdYkfAA"},{name:"BBC News",id:"UC16niRr50-MSBwiO3He68sg"},{name:"DW News",id:"UCknLrEdhRCp1aegoMqRaCZg"},{name:"Sky News",id:"UCoMdktPbSTixAyNGwb-UYkQ"}];
    const videoLists=await Promise.all(channels.map(async ch=>{try{const r=await fetch(`/api/youtube?channelId=${ch.id}`);const d=await r.json();if(!d.items||!Array.isArray(d.items))return[];return d.items.map((v:any)=>({...v,channel:ch.name,url:v.link})).filter((v:any)=>v.videoId);}catch{return[];}}));
    const keywords=["israel","iran","ukraine","russia","war","conflict","missile","attack","military","nuclear","nato","hamas","houthi","gaza"];
    const all=videoLists.flat();
    const relevant=all.filter((v:any)=>keywords.some(k=>v.title?.toLowerCase().includes(k)));
    return [...relevant,...all.filter((v:any)=>!relevant.find((r:any)=>r.videoId===v.videoId))].slice(0,12);
  }catch{return[];}
}
async function fetchIntelligence(liveNews:NewsItem[]=[]):Promise<any> {
  const newsHeadlines=liveNews.slice(0,25).map(n=>`- ${n.title} (${n.source})`).join("\n");
  const response=await fetch("/api/intelligence",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({_t:Date.now(),newsHeadlines})});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const data=await response.json();
  const text=Array.isArray(data.content)?data.content.filter((b:any)=>b.type==="text").map((b:any)=>b.text).join(""):String(data.content??"");
  if(!text||text==="{}") throw new Error("Empty response");
  const clean=text.replace(/```json\s*/gi,"").replace(/```/g,"").trim();
  const s=clean.indexOf("{");const e=clean.lastIndexOf("}");
  if(s<0||e<0)throw new Error("No JSON");
  return JSON.parse(clean.slice(s,e+1));
}
async function callAI(messages:{role:string;content:string}[]):Promise<string> {
  const response=await fetch("/api/intelligence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat:true,context:"",messages})});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const data=await response.json();
  const text=Array.isArray(data.content)?data.content.filter((b:any)=>b.type==="text").map((b:any)=>b.text).join(""):data.content||"";
  return text||"No summary available.";
}
async function fetchNewsSummary(item:NewsItem):Promise<string> {
  const prompt=`You are a sharp geopolitical intelligence analyst. Summarize this news article in 3-4 concise sentences. Cover: what happened, where, key actors, and strategic significance. Be direct and factual. Use plain text only — no markdown, no asterisks, no hashtags, no bullet points, no special formatting.\n\nTitle: ${item.title}\nSource: ${item.source}\nDescription: ${item.description||"No description available"}\n\nRespond ONLY with the summary paragraph in plain text.`;
  return callAI([{role:"user",content:prompt}]);
}
async function fetchChatResponse(chatMessages:{role:string;content:string}[],newsContext:string,intelData?:any):Promise<string> {
  const contextParts:string[]=[];
  if(intelData){contextParts.push(`Global threat: ${intelData.globalThreatLevel}% | DEFCON ${intelData.defcon??""}`);if(intelData.summary)contextParts.push(`Situation: ${intelData.summary.slice(0,300)}`);const topEvents=(intelData.events??[]).filter((e:any)=>e.severity==="critical"||e.severity==="high").slice(0,5).map((e:any)=>`- ${e.headline} [${e.severity}]`).join("\n");if(topEvents)contextParts.push(`Top events:\n${topEvents}`);}
  if(newsContext)contextParts.push(`Live news:\n${newsContext.slice(0,600)}`);
  const response=await fetch("/api/intelligence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat:true,context:contextParts.join("\n\n"),messages:chatMessages})});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const data=await response.json();
  let rawText="";
  if(Array.isArray(data.content))rawText=data.content.filter((b:any)=>b.type==="text").map((b:any)=>b.text).join("");
  else if(typeof data.content==="string")rawText=data.content;
  if(!rawText?.trim())return"Analysis unavailable. Please try again.";
  return rawText.trim().replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/^#{1,6}\s+/gm,"").replace(/\\n/g,"\n").replace(/\n{3,}/g,"\n\n");
}

// ===== NEW: Market AI Analysis =====
async function fetchMarketAnalysis(ticker: string, name: string, price: number, change: number, news: NewsItem[]): Promise<MarketAnalysis> {
  const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral';
  const isUp = change >= 0;
  
  // Gather relevant news
  const relevantNews = news
    .filter(n => {
      const text = `${n.title} ${n.description || ""}`.toLowerCase();
      const nameWords = name.toLowerCase().split(" ");
      const tickerLower = ticker.toLowerCase();
      return [...nameWords, tickerLower, "market", "crypto", "bitcoin", "ethereum", "stock", "finance", "economy", "fed", "interest rate", "inflation"].some(k => k.length > 2 && text.includes(k));
    })
    .slice(0, 8)
    .map(n => `- ${n.title} (${n.source})`).join("\n");

  const prompt = `You are a financial intelligence analyst for WARROOM. Answer in plain text only — no JSON, no markdown, no asterisks.

${name} (${ticker}) is ${isUp ? "UP" : "DOWN"} ${Math.abs(change).toFixed(2)}% today, trading at $${price.toLocaleString()}.

${relevantNews ? `Relevant news:\n${relevantNews}` : "No specific news found."}

Explain why ${ticker} is moving ${direction} today in 3 parts:

SUMMARY: Write 2-3 plain sentences explaining the price movement based on current macro conditions, market sentiment, and any relevant news above.

FACTORS:
1. [first key factor]
2. [second key factor]  
3. [third key factor]

RELATED:
- [related news item or market factor 1]
- [related news item or market factor 2]`;

  try {
    const response = await fetch("/api/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: true,
        context: `Analyzing ${ticker} price movement of ${change.toFixed(2)}% today.`,
        messages: [{ role: "user", content: prompt }]
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    let raw = "";
    if (Array.isArray(data.content)) {
      raw = data.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    } else if (typeof data.content === "string") {
      raw = data.content;
    }
    
    if (!raw || raw.trim().length < 20) throw new Error("Empty response");
    
    // Parse the plain-text structured response
    const summaryMatch = raw.match(/SUMMARY[:\s]*([\s\S]*?)(?=FACTORS|$)/i);
    const factorsMatch = raw.match(/FACTORS[:\s]*([\s\S]*?)(?=RELATED|$)/i);
    const relatedMatch = raw.match(/RELATED[:\s]*([\s\S]*?)$/i);
    
    const summary = summaryMatch?.[1]?.trim() || raw.slice(0, 300).trim();
    
    const reasons = factorsMatch?.[1]
      ? factorsMatch[1].split("\n")
          .map(l => l.replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, "").trim())
          .filter(l => l.length > 5)
          .slice(0, 3)
      : [];
    
    const relatedNews = relatedMatch?.[1]
      ? relatedMatch[1].split("\n")
          .map(l => l.replace(/^[-•]\s*/, "").trim())
          .filter(l => l.length > 5)
          .slice(0, 3)
      : [];
    
    return {
      ticker,
      direction,
      summary: summary || `${name} moved ${Math.abs(change).toFixed(2)}% ${direction} amid current market conditions.`,
      reasons: reasons.length > 0 ? reasons : ["Broader market pressure", "Macro economic sentiment", "Sector rotation"],
      relatedNews,
    };
    
  } catch (err) {
    console.error("Market analysis error:", err);
    return {
      ticker,
      direction,
      summary: `${name} is ${direction === 'up' ? 'gaining' : 'declining'} ${Math.abs(change).toFixed(2)}% today. This may reflect broader market conditions or sector-specific movements. Check live news for breaking catalysts.`,
      reasons: ["Broader market sentiment shift", "Macro economic pressure", "Sector-level movement"],
      relatedNews: [],
    };
  }
}

const TOPIC_PATTERNS=[
  {id:"israel-iran",keywords:["israel","iran","iranian","israeli","mossad"],label:"Israel vs Iran",color:"#f97316",icon:"[ISR]",flag:"IL/IR"},
  {id:"russia-ukraine",keywords:["russia","ukraine","ukrainian","russian","kyiv"],label:"Russia-Ukraine",color:"#ef4444",icon:"[GND]",flag:"RU/UA"},
  {id:"china-taiwan",keywords:["china","taiwan","pla","taipei","beijing"],label:"China-Taiwan",color:"#22c55e",icon:"[NAV]",flag:"CN/TW"},
  {id:"north-korea",keywords:["north korea","dprk","kim jong","pyongyang"],label:"North Korea",color:"#818cf8",icon:"[NUC]",flag:"KP"},
  {id:"middle-east",keywords:["gaza","hamas","hezbollah","west bank","lebanon"],label:"Middle East",color:"#eab308",icon:"[TER]",flag:"ME"},
  {id:"cyber-warfare",keywords:["cyber","hack","ransomware","malware","breach"],label:"Cyber War",color:"#38bdf8",icon:"[CYB]",flag:"NET"},
  {id:"yemen-houthi",keywords:["yemen","houthi","red sea","shipping lane"],label:"Yemen/Red Sea",color:"#fb923c",icon:"[MSL]",flag:"YE"},
];
function extractTopics(events:Event[]):any[]{
  if(!events?.length)return[];
  const now=Date.now();
  return TOPIC_PATTERNS.map(p=>{
    const matched=events.filter(ev=>{const t=`${ev.headline||""} ${ev.detail||""} ${ev.region||""} ${ev.country||""}`.toLowerCase();return p.keywords.some(k=>t.includes(k));});
    const score=matched.reduce((s,ev)=>s+(ev.severity==="critical"?5:ev.severity==="high"?3:2),0);
    if(score<3||matched.length<2)return null;
    return{...p,score,eventCount:matched.length,events:matched,createdAt:now,lastSeen:now,heat:Math.min(100,score*8),isNew:true};
  }).filter((t):t is NonNullable<any>=>t!==null).sort((a,b)=>b.score-a.score).slice(0,5);
}
function mergeTopics(old:any[],fresh:any[],now=Date.now()):any[]{
  const fm:Record<string,any>={};fresh.forEach(t=>{fm[t.id]=t;});
  const upd=old.map(t=>{const f=fm[t.id];if(f)return{...t,...f,createdAt:t.createdAt,lastSeen:now,isNew:false};const cooled=Math.max(0,t.heat-15);if(now-t.lastSeen>86400000||cooled<10)return null;return{...t,heat:cooled,isNew:false};}).filter(Boolean);
  fresh.forEach(ft=>{if(!upd.find(t=>t.id===ft.id))upd.push({...ft,createdAt:now,isNew:true});});
  return upd;
}
const fmt=(n:number,dec=2):string=>n?.toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec})??"—";
const fmtB=(n:number):string=>n>=1e9?`$${(n/1e9).toFixed(1)}B`:n>=1e6?`$${(n/1e6).toFixed(0)}M`:`$${n}`;

// ===== Theme Toggle Button =====
function ThemeToggle() {
  const { isDark, toggleTheme, t } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        background: isDark ? "#111" : "#e2e8f0",
        border: `1px solid ${t.border}`,
        borderRadius: 4,
        cursor: "pointer",
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{isDark ? "☀️" : "🌙"}</span>
      <span style={{ fontSize: 8, color: t.textDim, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>
        {isDark ? "LIGHT" : "DARK"}
      </span>
    </button>
  );
}

// ===== Components =====
function AITextBlock({ text, fontSize=11 }: { text:string; fontSize?:number }) {
  const { t } = useTheme();
  const readable = extractReadableText(text);
  const paragraphs = readable.split(/\n\n+/);
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {paragraphs.map((para,i)=>{
        const lines = para.split("\n").filter(l=>l.trim()!=="");
        const isBulletBlock = lines.some(l=>l.startsWith("• "));
        if (isBulletBlock) return (
          <div key={i} style={{ display:"flex",flexDirection:"column",gap:5 }}>
            {lines.map((line,j)=>line.startsWith("• ")?(
              <div key={j} style={{ display:"flex",gap:8,alignItems:"flex-start" }}>
                <span style={{ color:"#ef4444",flexShrink:0,marginTop:1,fontSize:fontSize-1,fontFamily:"'Share Tech Mono',monospace" }}>▸</span>
                <span style={{ fontSize,color:t.textMuted,lineHeight:1.85,fontFamily:"'Share Tech Mono',monospace" }}>{line.replace(/^•\s*/,"")}</span>
              </div>
            ):(
              <p key={j} style={{ fontSize,color:t.textMuted,lineHeight:1.85,fontFamily:"'Share Tech Mono',monospace",margin:0 }}>{line}</p>
            ))}
          </div>
        );
        return (
          <p key={i} style={{ fontSize,color:t.textMuted,lineHeight:1.85,fontFamily:"'Share Tech Mono',monospace",margin:0 }}>
            {lines.map((line,j)=><span key={j}>{line}{j<lines.length-1&&<br/>}</span>)}
          </p>
        );
      })}
    </div>
  );
}

// ===== NationThreatMatrix =====
function NationThreatMatrix({ nationThreats=[], events=[] }: { nationThreats?:any[]; events?:Event[] }) {
  const isMobile = useIsMobile();
  const { t } = useTheme();
  const eventScores = useMemo(()=>deriveThreatsFromEvents(events),[events]);
  const nations = useMemo(()=>{
    const merged: Record<string,{name:string;code:string;threat:number}> = {};
    nationThreats.forEach(nt=>{
      const code = nt.code||nt.name?.slice(0,2).toUpperCase()||"??";
      const aiThreat = sanitizeThreat(nt.threat);
      if (aiThreat!==null&&aiThreat>0) merged[code]={name:nt.name||NATION_LABELS[code]||code,code,threat:aiThreat};
    });
    Object.entries(eventScores).forEach(([code,evScore])=>{
      if (merged[code]) merged[code].threat=Math.min(100,Math.round(merged[code].threat*0.6+evScore*0.4));
      else if (evScore>=20) merged[code]={name:NATION_LABELS[code]||code,code,threat:evScore};
    });
    const BASELINES: Record<string,number> = {RU:72,UA:68,IL:74,IR:71,CN:62,KP:55,US:40};
    Object.entries(BASELINES).forEach(([code,base])=>{
      if (!merged[code]) merged[code]={name:NATION_LABELS[code]||code,code,threat:base};
    });
    return Object.values(merged).sort((a,b)=>b.threat-a.threat).slice(0,10);
  },[nationThreats,eventScores]);

  const avgThreat = nations.length?Math.round(nations.reduce((s,n)=>s+n.threat,0)/nations.length):0;
  const critCount = nations.filter(n=>n.threat>=85).length;
  const highCount = nations.filter(n=>n.threat>=70&&n.threat<85).length;

  return (
    <div style={{ background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden",fontFamily:"'Share Tech Mono','Courier New',monospace" }}>
      <div style={{ padding:"10px 14px",borderBottom:`1px solid ${t.borderLight}`,background:t.bgSecondary,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:7,letterSpacing:5,color:t.textDim,marginBottom:3 }}>GLOBAL THREAT INDEX</div>
          <div style={{ fontSize:isMobile?9:11,fontWeight:700,color:t.textDim,letterSpacing:2 }}>NATION THREAT MATRIX</div>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
          <div style={{ width:5,height:5,background:"#ef4444",animation:"pulse 1.2s infinite" }}/>
          <span style={{ fontSize:7,color:"#ef4444",letterSpacing:3 }}>LIVE</span>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${t.borderLight}` }}>
        {[{label:"AVG THREAT",value:avgThreat,color:threatColor(avgThreat),suffix:"%"},{label:"CRITICAL",value:critCount,color:"#ef4444",suffix:" states"},{label:"HIGH ALERT",value:highCount,color:"#f97316",suffix:" states"}].map((s,i)=>(
          <div key={i} style={{ padding:isMobile?"7px 8px":"10px 14px",borderRight:i<2?`1px solid ${t.borderLight}`:"none",textAlign:"center" }}>
            <div style={{ fontSize:7,color:t.textDim,letterSpacing:3,marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:isMobile?16:20,fontWeight:900,color:s.color,lineHeight:1 }}>{s.value}<span style={{ fontSize:8,fontWeight:400,color:t.textDim }}>{s.suffix}</span></div>
          </div>
        ))}
      </div>
      <div>
        {nations.length===0?(
          <div style={{ padding:32,textAlign:"center",color:t.textDim,fontSize:9,letterSpacing:3 }}>LOADING...</div>
        ):nations.map((n,i)=>{
          const color = threatColor(n.threat);
          const label = threatLabel(n.threat);
          const isTop = i<3;
          return (
            <div key={n.code} style={{ display:"flex",alignItems:"center",gap:isMobile?8:12,padding:isMobile?"8px 10px":"10px 14px",background:isTop?`${color}08`:"transparent",borderBottom:`1px solid ${t.borderLight}`,borderLeft:`2px solid ${isTop?color:"transparent"}` }}>
              <div style={{ width:18,height:18,borderRadius:3,background:t.bgSecondary,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:i<=2?color:t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:900,flexShrink:0 }}>{i+1}</div>
              <div style={{ width:isMobile?24:30,height:isMobile?16:20,borderRadius:2,background:t.bgSecondary,border:`1px solid ${isTop?color+"44":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?6.5:7.5,color:isTop?color:t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,flexShrink:0,letterSpacing:0.5 }}>{n.code}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                  <span style={{ fontSize:isMobile?8.5:10,color:isTop?t.textSecondary:t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:6 }}>{n.name}</span>
                  {!isMobile&&<span style={{ fontSize:7,letterSpacing:2,color,padding:"1px 6px",background:`${color}11`,border:`1px solid ${color}33`,borderRadius:2,fontFamily:"'Share Tech Mono',monospace",flexShrink:0 }}>{label}</span>}
                </div>
                <div style={{ height:4,background:t.bgSecondary,borderRadius:2,overflow:"hidden",position:"relative" }}>
                  {[25,50,75].map(tick=>(<div key={tick} style={{ position:"absolute",top:0,left:`${tick}%`,width:1,height:"100%",background:t.border,zIndex:1 }}/>))}
                  <div style={{ height:"100%",width:`${n.threat}%`,background:`linear-gradient(90deg,${color}60,${color})`,borderRadius:2,transition:"width 1.4s cubic-bezier(.4,0,.2,1)",boxShadow:isTop?`0 0 8px ${color}40`:"none" }}/>
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0,minWidth:isMobile?28:36 }}>
                <div style={{ fontSize:isMobile?13:16,fontWeight:900,color,fontFamily:"'Share Tech Mono',monospace",lineHeight:1 }}>{n.threat}</div>
                <div style={{ fontSize:7,color:t.textDim,marginTop:1 }}>/100</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding:"7px 14px",borderTop:`1px solid ${t.borderLight}`,background:t.bgSecondary,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:7,color:t.textDim }}>Claude AI + Live Event Analysis</div>
        <div style={{ fontSize:7,color:t.textDim,letterSpacing:2 }}>{nations.length} MONITORED</div>
      </div>
    </div>
  );
}

// ===== Small Components =====
function ChartTip({active,payload,label}:{active?:boolean;payload?:any[];label?:string}){
  const { t } = useTheme();
  if(!active||!payload?.length)return null;
  return <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:3,padding:"7px 11px",fontSize:10,fontFamily:"'Share Tech Mono',monospace"}}><div style={{color:t.textDim,marginBottom:3}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color||t.text}}>${fmt(p.value)}</div>)}</div>;
}
function Sparkline({data,color,height=50,showArea=true}:{data:any[];color:string;height?:number;showArea?:boolean}){
  if(!data?.length)return<div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:9}}>...</div>;
  const min=Math.min(...data.map(d=>d.price));const max=Math.max(...data.map(d=>d.price));
  const c=color||(((data[data.length-1]?.price||0)>=(data[0]?.price||0))?"#22c55e":"#ef4444");
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{top:2,right:0,bottom:0,left:0}}><defs><linearGradient id={`sg${c.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.12}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient></defs><YAxis domain={[min*0.998,max*1.002]} hide/><XAxis dataKey="time" hide/><Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="price" stroke={c} strokeWidth={1.5} fill={showArea?`url(#sg${c.replace("#","")})`:"none"} dot={false} activeDot={{r:3,fill:c}}/></AreaChart></ResponsiveContainer>;
}

// ===== NEW: Market Analysis Panel =====
function MarketAnalysisPanel({ ticker, name, price, change, news, onClose }: {
  ticker: string; name: string; price: number; change: number; news: NewsItem[]; onClose: () => void;
}) {
  const { t, isDark } = useTheme();
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const isUp = change >= 0;
  const dirColor = isUp ? "#22c55e" : "#ef4444";

  useEffect(() => {
    setLoading(true);
    setAnalysis(null);
    fetchMarketAnalysis(ticker, name, price, change, news)
      .then(a => setAnalysis(a))
      .finally(() => setLoading(false));
  }, [ticker]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9990,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }} onClick={onClose}>
      <div style={{
        width: "min(620px,96vw)", background: t.cardBg, border: `1px solid ${dirColor}`,
        borderRadius: 4, overflow: "hidden", animation: "fadeUp .2s ease", maxHeight: "90vh", overflowY: "auto"
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, background: t.bgSecondary, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 4, background: isDark ? "#111" : "#f0f0f0", border: `2px solid ${dirColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: dirColor, fontWeight: 900, fontFamily: "'Share Tech Mono',monospace" }}>{ticker}</div>
            <div>
              <div style={{ fontSize: 7, color: dirColor, letterSpacing: 3, marginBottom: 3, fontFamily: "'Share Tech Mono',monospace" }}>AI MARKET ANALYSIS</div>
              <div style={{ fontSize: 14, color: t.text, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700 }}>{name}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 2, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: t.text, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700 }}>${fmt(price, price > 100 ? 0 : 2)}</span>
                <span style={{ fontSize: 11, color: dirColor }}>{isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.textDim, cursor: "pointer", fontSize: 12, padding: "3px 9px", borderRadius: 3, fontFamily: "'Share Tech Mono',monospace" }}>ESC</button>
        </div>

        {/* Analysis Body */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 7, color: dirColor, letterSpacing: 3, marginBottom: 12, fontFamily: "'Share Tech Mono',monospace", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 5, height: 5, background: dirColor, display: "inline-block", animation: loading ? "pulse 1s infinite" : "none" }} />
            WHY IS {ticker} {isUp ? "UP" : "DOWN"} TODAY?
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[100, 85, 70, 60].map((w, i) => (
                <div key={i} style={{ height: 10, background: t.bgSecondary, borderRadius: 2, width: `${w}%`, animation: "pulse 1.2s infinite", animationDelay: `${i * 0.15}s` }} />
              ))}
              <div style={{ fontSize: 10, color: t.textDim, marginTop: 8, fontFamily: "'Share Tech Mono',monospace" }}>Analyzing market conditions & news...</div>
            </div>
          ) : analysis ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Summary */}
              <div style={{ borderLeft: `3px solid ${dirColor}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 7, color: t.textDim, letterSpacing: 2, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>SUMMARY</div>
                <p style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.8, fontFamily: "'Share Tech Mono',monospace", margin: 0 }}>{analysis.summary}</p>
              </div>

              {/* Key Reasons */}
              {analysis.reasons.length > 0 && (
                <div style={{ background: t.bgSecondary, borderRadius: 3, padding: 12, border: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 7, color: t.textDim, letterSpacing: 2, marginBottom: 8, fontFamily: "'Share Tech Mono',monospace" }}>KEY FACTORS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {analysis.reasons.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: dirColor, flexShrink: 0, fontSize: 10, marginTop: 1, fontFamily: "'Share Tech Mono',monospace" }}>{i + 1}.</span>
                        <span style={{ fontSize: 10, color: t.textSecondary, lineHeight: 1.7, fontFamily: "'Share Tech Mono',monospace" }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related News/Factors */}
              {analysis.relatedNews.length > 0 && (
                <div>
                  <div style={{ fontSize: 7, color: t.textDim, letterSpacing: 2, marginBottom: 6, fontFamily: "'Share Tech Mono',monospace" }}>RELATED FACTORS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {analysis.relatedNews.map((r, i) => (
                      <div key={i} style={{ padding: "7px 10px", borderRadius: 3, background: t.bgSecondary, border: `1px solid ${t.border}`, fontSize: 9, color: t.textMuted, fontFamily: "'Share Tech Mono',monospace", lineHeight: 1.5 }}>
                        <span style={{ color: "#818cf8", marginRight: 6 }}>[NEWS]</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direction badge */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
                <div style={{ padding: "4px 14px", borderRadius: 3, background: `${dirColor}15`, border: `1px solid ${dirColor}44`, fontSize: 8, color: dirColor, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2, fontWeight: 700 }}>
                  {isUp ? "▲ BULLISH MOMENTUM" : "▼ BEARISH PRESSURE"} · {Math.abs(change).toFixed(2)}%
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 10, color: t.textDim, padding: 20, textAlign: "center" }}>Analysis unavailable.</div>
          )}
        </div>
        <div style={{ padding: "7px 16px", borderTop: `1px solid ${t.border}`, background: t.bgSecondary, fontSize: 7, color: t.textDim, fontFamily: "'Share Tech Mono',monospace" }}>
          Powered by WARROOM AI · Data may be delayed · Not financial advice
        </div>
      </div>
    </div>
  );
}

function CryptoCard({coin,chart,onClick,selected}:{coin:CryptoCoin;chart:any[];onClick:()=>void;selected:boolean}){
  const { t } = useTheme();
  const up=coin.change>=0;const c=coin.color;
  return <div onClick={onClick} style={{padding:"13px 15px",borderRadius:4,background:selected?t.bgSecondary:t.cardBg,border:`1px solid ${selected?c:t.border}`,cursor:"pointer",transition:"border-color .15s",position:"relative",overflow:"hidden"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=selected?c:t.border;}}>
    {selected&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c}}/>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:28,height:28,borderRadius:3,background:t.bgSecondary,border:`1px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:c,fontWeight:900,fontFamily:"'Share Tech Mono',monospace"}}>{coin.symbol}</div>
        <div><div style={{fontSize:11,fontWeight:700,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>{coin.id}</div><div style={{fontSize:8,color:t.textDim}}>{coin.name}</div></div>
      </div>
      <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>${fmt(coin.price,coin.price>100?0:2)}</div><div style={{fontSize:9,color:up?"#22c55e":"#ef4444"}}>{up?"+":"-"}{Math.abs(coin.change).toFixed(2)}%</div></div>
    </div>
    <Sparkline data={chart} color={c} height={42}/>
    {coin.marketCap>0&&<div style={{display:"flex",gap:12,marginTop:6}}><div style={{fontSize:7.5,color:t.textDim}}><span style={{color:t.textDim}}>MCap</span> {fmtB(coin.marketCap)}</div><div style={{fontSize:7.5,color:t.textDim}}><span style={{color:t.textDim}}>Vol</span> {fmtB(coin.volume)}</div></div>}
  </div>;
}

function StockRow({s, onAnalyze}:{s:Stock; onAnalyze?: (s:Stock) => void}){
  const { t } = useTheme();
  const up=s.change>=0;
  return <div style={{display:"flex",alignItems:"center",padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,transition:"background .12s",cursor:onAnalyze?"pointer":"default"}} onClick={()=>onAnalyze&&onAnalyze(s)} onMouseEnter={e=>e.currentTarget.style.background=t.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    <div style={{width:6,height:6,borderRadius:1,background:s.color,marginRight:10,flexShrink:0}}/>
    <div style={{flex:1}}><div style={{fontSize:10,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace"}}>{s.id}</div><div style={{fontSize:8,color:t.textDim}}>{s.name}</div></div>
    <div style={{textAlign:"right"}}>
      <div style={{fontSize:11,fontWeight:700,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>{s.price>0?`$${fmt(s.price,s.price>100?0:2)}`:"—"}</div>
      <div style={{fontSize:9,color:up?"#22c55e":"#ef4444"}}>{up?"+":"-"}{Math.abs(s.change).toFixed(2)}%</div>
    </div>
    {onAnalyze && <div style={{fontSize:7,color:"#818cf8",marginLeft:8,fontFamily:"'Share Tech Mono',monospace",padding:"2px 5px",border:"1px solid #818cf844",borderRadius:2}}>AI</div>}
  </div>;
}

function VideoCard({v,onPlay,playing}:{v:VideoItem;onPlay:(v:VideoItem)=>void;playing:boolean}){
  const { t } = useTheme();
  return <div onClick={()=>onPlay(v)} style={{borderRadius:4,overflow:"hidden",background:t.cardBg,border:`1px solid ${playing?"#ef4444":t.border}`,cursor:"pointer",transition:"border-color .15s",position:"relative",flexShrink:0}} onMouseEnter={e=>{if(!playing)e.currentTarget.style.borderColor=t.textDim;}} onMouseLeave={e=>{if(!playing)e.currentTarget.style.borderColor=t.border;}}>
    {playing&&<div style={{position:"absolute",inset:0,border:"2px solid #ef4444",borderRadius:4,zIndex:2,pointerEvents:"none"}}/>}
    <div style={{position:"relative",paddingBottom:"56.25%",background:t.bgSecondary}}>
      <img src={v.thumb} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.85}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {!playing&&<div style={{width:32,height:32,borderRadius:2,background:"rgba(0,0,0,0.8)",border:"1px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff"}}>&#9654;</div>}
        {playing&&<div style={{padding:"4px 8px",borderRadius:2,background:"#ef4444",fontSize:8,color:"white",fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>LIVE</div>}
      </div>
    </div>
    <div style={{padding:"8px 10px"}}><div style={{fontSize:9,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{v.title}</div><div style={{fontSize:7.5,color:t.textDim,marginTop:4}}>{v.channel}</div></div>
  </div>;
}

function NewsCard({item,big,onClick}:{item:NewsItem;big?:boolean;onClick?:(item:NewsItem)=>void}){
  const { t } = useTheme();
  return <div onClick={onClick?()=>onClick(item):undefined} style={{display:"block",textDecoration:"none",padding:"10px 12px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,marginBottom:6,transition:"border-color .15s",cursor:onClick?"pointer":"default"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=onClick?"#818cf8":t.textDim;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;}}>
    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
      {item.image&&<img src={item.image} alt="" style={{width:big?80:60,height:big?54:40,borderRadius:3,objectFit:"cover",flexShrink:0,border:`1px solid ${t.border}`}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:big?11:10,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.4,marginBottom:4}}>{item.title}</div>
        {big&&item.description&&<div style={{fontSize:8.5,color:t.textDim,lineHeight:1.5,marginBottom:4}}>{item.description}</div>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:7.5,color:"#22c55e",letterSpacing:0.5}}>{item.source}</span>
          <span style={{fontSize:7.5,color:t.textDim}}>{item.time}</span>
          {onClick&&<span style={{fontSize:7,color:"#818cf8",letterSpacing:1,marginLeft:"auto"}}>[AI SUMMARY]</span>}
        </div>
      </div>
    </div>
  </div>;
}

function EventCard({ev,isNew}:{ev:Event;isNew?:boolean}){
  const { t } = useTheme();
  const c=SEV[ev.severity]||"#64748b";
  return <div style={{padding:"8px 10px",marginBottom:5,borderRadius:3,background:t.cardBg,border:`1px solid ${isNew?t.border:t.borderLight}`,borderLeft:`3px solid ${c}`}}>
    <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
      <span style={{fontSize:8,flexShrink:0,marginTop:2,color:c,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{TICON[ev.type||"default"]||"[EVT]"}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:9.5,color:t.textSecondary,fontWeight:600,lineHeight:1.4,fontFamily:"'Share Tech Mono',monospace"}}>{ev.headline}</div>
        {ev.detail&&<div style={{fontSize:8.5,color:t.textDim,marginTop:2,lineHeight:1.6}}>{formatAIText(ev.detail)}</div>}
        <div style={{display:"flex",gap:8,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:7,color:c,letterSpacing:1.5,padding:"1px 5px",background:`${c}18`,borderRadius:2,border:`1px solid ${c}33`,fontFamily:"'Share Tech Mono',monospace"}}>{ev.severity?.toUpperCase()}</span>
          <span style={{fontSize:7.5,color:t.textDim}}>{ev.timeAgo}</span>
          {ev.source&&<span style={{fontSize:7.5,color:t.textDim}}>{ev.source}</span>}
          {ev.url&&<a href={ev.url} target="_blank" rel="noreferrer" style={{fontSize:7.5,color:"#38bdf8",textDecoration:"none"}}>link</a>}
        </div>
      </div>
    </div>
  </div>;
}

function DefconDisplay({level=3}:{level?:number}){
  const lvls=[{n:5,l:"NORMAL",c:"#22c55e"},{n:4,l:"ELEVATED",c:"#84cc16"},{n:3,l:"ROUND HOUSE",c:"#eab308"},{n:2,l:"FAST PACE",c:"#f97316"},{n:1,l:"COCKED PISTOL",c:"#ef4444"}];
  const cur=lvls.find(l=>l.n===level)||lvls[2];
  const isMobile=useIsMobile();
  const { t } = useTheme();
  return <div style={{padding:"12px 14px"}}>
    <div style={{fontSize:7,letterSpacing:4,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace",textAlign:"center"}}>DEFCON STATUS</div>
    <div style={{display:"flex",gap:isMobile?4:5,justifyContent:"center",marginBottom:10}}>
      {lvls.map(l=><div key={l.n} style={{width:isMobile?28:33,height:isMobile?28:33,borderRadius:3,background:t.bgSecondary,border:`1px solid ${l.n===level?l.c:t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?11:13,fontWeight:800,color:l.n===level?l.c:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>{l.n}</div>)}
    </div>
    <div style={{textAlign:"center",fontSize:8,fontWeight:700,letterSpacing:3,color:cur.c,fontFamily:"'Share Tech Mono',monospace",padding:"5px 8px",background:`${cur.c}14`,borderRadius:3,border:`1px solid ${cur.c}`}}>DEFCON {level} — {cur.l}</div>
  </div>;
}

function WorldMap({hotspots,events,selectedSpot,onSelect}:{hotspots:Hotspot[];events:Event[];selectedSpot:Hotspot|null;onSelect:(s:Hotspot|null)=>void}){
  const [tick,setTick]=useState(0);
  const [tip,setTip]=useState<{x:number;y:number;ev?:Event;spot?:Hotspot}|null>(null);
  const { isDark } = useTheme();
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),55);return()=>clearInterval(id);},[]);
  const dots=(events||[]).filter(e=>e.lat&&e.lng).map(e=>({...e,...ll2xy(e.lat!,e.lng!)}));
  const landFill = isDark ? "#141414" : "#c8d4e0";
  const landStroke = isDark ? "#252525" : "#a0b0c0";
  const mapBg = isDark ? "#050505" : "#dde6f0";
  const gridColor = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)";
  const tipBg = isDark ? "rgba(5,5,5,0.98)" : "rgba(240,245,252,0.98)";
  const tipStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)";

  return <div style={{position:"relative",width:"100%",height:"100%",background:mapBg}}>
    <svg viewBox="0 0 1000 500" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="mgrid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0L0 0 0 50" fill="none" stroke={gridColor} strokeWidth="0.5"/></pattern></defs>
      <rect width="1000" height="500" fill={mapBg}/><rect width="1000" height="500" fill="url(#mgrid)"/>
      {[-60,-30,0,30,60].map(lat=>{const y=(90-lat)*(500/180);return<line key={lat} x1={0} y1={y} x2={1000} y2={y} stroke={gridColor} strokeWidth="0.5" strokeDasharray="3,6"/>;})}{[-120,-60,0,60,120].map(lng=>{const x=(lng+180)*(1000/360);return<line key={lng} x1={x} y1={0} x2={x} y2={500} stroke={gridColor} strokeWidth="0.5" strokeDasharray="3,6"/>;})}<g fill={landFill} stroke={landStroke} strokeWidth="0.8">{LAND.map((d,i)=><path key={i} d={d}/>)}</g>
      {dots.map((ev,i)=>{const c=SEV[ev.severity]||"#64748b";const pulse=Math.sin(tick*0.08+i*0.7)*0.5+0.5;return<g key={ev.id||i} style={{cursor:"pointer"}} onMouseEnter={()=>setTip({x:ev.x,y:ev.y,ev})} onMouseLeave={()=>setTip(null)}><circle cx={ev.x} cy={ev.y} r={5+4*pulse} fill="none" stroke={c} strokeWidth="0.8" opacity={0.4-0.35*pulse}/><circle cx={ev.x} cy={ev.y} r={3} fill={c} filter="url(#glow)" opacity={0.9}/></g>;})}
      {hotspots.map(h=>{const{x,y}=ll2xy(h.lat,h.lng);const pulse=Math.sin(tick*0.05+h.id)*0.5+0.5;const c=TCOL[h.type]||"#ef4444";const sel=selectedSpot?.id===h.id;const int=h.intensity||h.base;return<g key={h.id} style={{cursor:"pointer"}} onClick={()=>onSelect(sel?null:h)} onMouseEnter={()=>setTip({x,y,spot:h})} onMouseLeave={()=>setTip(null)}><circle cx={x} cy={y} r={12+8*pulse*int} fill="none" stroke={c} strokeWidth="0.6" opacity={0.3-0.25*pulse}/><circle cx={x} cy={y} r={7} fill="none" stroke={c} strokeWidth={sel?1.5:1} opacity={0.7}/><circle cx={x} cy={y} r={sel?5:3} fill={c} filter="url(#glow)" opacity={0.95}/><text x={x+8} y={y+4} fontSize="7.5" fill={c} fontFamily="'Share Tech Mono',monospace" opacity={sel?1:0.65} style={{pointerEvents:"none"}}>{h.name}</text></g>;})}
      {tip&&<g><rect x={Math.min(tip.x+10,810)} y={Math.max(tip.y-28,5)} width={175} height={50} rx={3} fill={tipBg} stroke={tipStroke} strokeWidth="0.7"/>{tip.ev&&<><text x={Math.min(tip.x+18,818)} y={Math.max(tip.y-10,22)} fontSize="7.5" fill={isDark?"#d4e4f4":"#1e3a5f"} fontFamily="'Share Tech Mono',monospace" style={{pointerEvents:"none"}}>{tip.ev.headline?.slice(0,28)}</text><text x={Math.min(tip.x+18,818)} y={Math.max(tip.y+4,34)} fontSize="7" fill={isDark?"#444":"#64748b"} fontFamily="'Share Tech Mono',monospace" style={{pointerEvents:"none"}}>{tip.ev.country} · {tip.ev.timeAgo}</text></>}{tip.spot&&<><text x={Math.min(tip.x+18,818)} y={Math.max(tip.y-10,22)} fontSize="8" fill={TCOL[tip.spot.type]} fontFamily="'Share Tech Mono',monospace" style={{pointerEvents:"none"}}>{tip.spot.name}</text><text x={Math.min(tip.x+18,818)} y={Math.max(tip.y+4,34)} fontSize="7" fill={isDark?"#444":"#64748b"} fontFamily="'Share Tech Mono',monospace" style={{pointerEvents:"none"}}>Intensity: {Math.round((tip.spot.intensity||tip.spot.base)*100)}%</text></>}</g>}
    </svg>
  </div>;
}

function VideoModal({video,onClose}:{video:VideoItem|null;onClose:()=>void}){
  const { t } = useTheme();
  if(!video)return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:9990,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={onClose}>
    <div style={{width:"min(860px,96vw)",background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:`1px solid ${t.border}`}}>
        <div><div style={{fontSize:7,color:"#ef4444",letterSpacing:3,marginBottom:2,fontFamily:"'Share Tech Mono',monospace"}}>NOW PLAYING</div><div style={{fontSize:11,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace"}}>{video.title?.slice(0,70)}</div></div>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${t.border}`,color:t.textDim,cursor:"pointer",fontSize:14,lineHeight:1,padding:"3px 9px",borderRadius:3,fontFamily:"'Share Tech Mono',monospace"}}>ESC</button>
      </div>
      <div style={{position:"relative",paddingBottom:"56.25%"}}><iframe src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>
      <div style={{padding:"10px 14px",display:"flex",gap:12,alignItems:"center"}}><div style={{flex:1}}><div style={{fontSize:9,color:t.textDim}}>{video.channel}</div></div><a href={video.url} target="_blank" rel="noreferrer" style={{fontSize:8,color:"#38bdf8",textDecoration:"none",border:"1px solid #38bdf822",padding:"3px 10px",borderRadius:3,fontFamily:"'Share Tech Mono',monospace"}}>OPEN ON YOUTUBE</a></div>
    </div>
  </div>;
}

function NewsSummaryModal({item,onClose}:{item:NewsItem;onClose:()=>void}){
  const { t } = useTheme();
  const [summary,setSummary]=useState("");const[loading,setLoading]=useState(true);
  useEffect(()=>{setLoading(true);fetchNewsSummary(item).then(s=>setSummary(s)).catch(()=>setSummary("Unable to generate summary. Please try again.")).finally(()=>setLoading(false));},[item.url]);
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:9990,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div style={{width:"min(680px,95vw)",background:t.cardBg,border:"1px solid #818cf8",borderRadius:4,overflow:"hidden",animation:"fadeUp .2s ease",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",gap:10,alignItems:"flex-start",position:"sticky",top:0,background:t.cardBg,zIndex:1}}>
        <div style={{flex:1}}><div style={{fontSize:7,color:"#818cf8",letterSpacing:3,marginBottom:5,fontFamily:"'Share Tech Mono',monospace"}}>AI INTELLIGENCE BRIEF</div><div style={{fontSize:11,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.5}}>{item.title}</div><div style={{display:"flex",gap:8,marginTop:5,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:7.5,color:"#22c55e"}}>{item.source}</span><span style={{fontSize:7.5,color:t.textDim}}>{item.time}</span>{item.url&&<a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:7.5,color:"#38bdf8",textDecoration:"none"}}>read full article ↗</a>}</div></div>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${t.border}`,color:t.textDim,cursor:"pointer",fontSize:12,padding:"3px 9px",borderRadius:3,fontFamily:"'Share Tech Mono',monospace",flexShrink:0}}>ESC</button>
      </div>
      <div style={{padding:"16px"}}><div style={{fontSize:7,color:"#818cf8",letterSpacing:3,marginBottom:12,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:8}}><span style={{width:5,height:5,background:"#818cf8",display:"inline-block",animation:loading?"pulse 1s infinite":"none"}}/> WARROOM AI ANALYSIS</div>
        {loading?<div style={{display:"flex",flexDirection:"column",gap:6}}>{[100,85,70].map((w,i)=><div key={i} style={{height:8,background:t.bgSecondary,borderRadius:2,width:`${w}%`,animation:"pulse 1.2s infinite",animationDelay:`${i*0.15}s`}}/>)}<div style={{fontSize:9,color:t.textDim,marginTop:8,fontFamily:"'Share Tech Mono',monospace"}}>Analyzing intelligence...</div></div>:<div style={{borderLeft:"3px solid #818cf8",paddingLeft:14}}><AITextBlock text={summary} fontSize={11}/></div>}
      </div>
      {item.image&&<div style={{padding:"0 16px 16px"}}><img src={item.image} alt="" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:3,border:`1px solid ${t.border}`,opacity:0.8}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/></div>}
    </div>
  </div>;
}

// ===== IntelPage =====
function IntelPage({intel,news}:{intel:any;news:NewsItem[]}){
  const isMobile=useIsMobile();
  const { t } = useTheme();
  const [newsTab,setNewsTab]=useState<"latest"|"24hrs"|"hot">("latest");
  const [selectedNews,setSelectedNews]=useState<NewsItem|null>(null);
  const [chatMessages,setChatMessages]=useState<{role:string;content:string;id:number}[]>([]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const [searchQuery,setSearchQuery]=useState("");
  const [mobileView,setMobileView]=useState<"intel"|"news"|"chat">("intel");
  const chatEndRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[chatMessages]);
  const now=Date.now();
  const filteredNews=(()=>{
    if(newsTab==="latest")return[...news].sort((a,b)=>(b.pubDateMs||0)-(a.pubDateMs||0)).slice(0,15);
    if(newsTab==="24hrs")return news.filter(n=>{const age=now-(n.pubDateMs||0);return age<86400000;}).sort((a,b)=>(b.pubDateMs||0)-(a.pubDateMs||0));
    const keywords=["war","attack","missile","strike","nuclear","explosion","killed","troops","military","conflict","crisis"];
    return[...news].map(n=>{const text=`${n.title||""} ${n.description||""}`.toLowerCase();const score=keywords.reduce((s,k)=>s+(text.includes(k)?1:0),0);return{...n,_score:score};}).sort((a:any,b:any)=>b._score-a._score).slice(0,15);
  })();
  const displayNews=searchQuery?filteredNews.filter(n=>`${n.title||""} ${n.description||""} ${n.source||""}`.toLowerCase().includes(searchQuery.toLowerCase())):filteredNews;
  const newsContext=news.slice(0,10).map(n=>`- ${n.title} (${n.source})`).join("\n");
  const sendChat=async(text?:string)=>{
    const msg=text||chatInput.trim();if(!msg||chatLoading)return;
    setChatInput("");const userMsg={role:"user",content:msg,id:Date.now()};setChatMessages(prev=>[...prev,userMsg]);setChatLoading(true);
    try{const history=[...chatMessages,userMsg].map(m=>({role:m.role,content:m.content}));const reply=await fetchChatResponse(history,newsContext,intel);setChatMessages(prev=>[...prev,{role:"assistant",content:reply,id:Date.now()+1}]);}
    catch{setChatMessages(prev=>[...prev,{role:"assistant",content:"Analysis unavailable. Check connection.",id:Date.now()+1}]);}
    setChatLoading(false);
  };
  const QUICK_PROMPTS=["What's the biggest threat right now?","Summarize today's conflicts","How likely is escalation in Ukraine?","What's the status in Gaza?"];

  const tabBtn = (id: string, label: string, active: boolean, onClick: ()=>void) => (
    <button key={id} onClick={onClick} style={{background:active?t.bgSecondary:"transparent",border:`1px solid ${active?"#818cf8":t.border}`,borderRadius:3,color:active?"#818cf8":t.textDim,padding:"4px 12px",cursor:"pointer",fontSize:9,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>{label}</button>
  );

  if(isMobile){
    return <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{display:"flex",borderBottom:`1px solid ${t.borderLight}`,background:t.bgSecondary,flexShrink:0,position:"sticky",top:0,zIndex:10}}>
        {[["intel","INTEL"],["news","NEWS"],["chat","AI CHAT"]].map(([id,label])=>(
          <button key={id} onClick={()=>setMobileView(id as any)} style={{flex:1,padding:"11px 4px",background:mobileView===id?t.cardBg:"transparent",border:"none",borderBottom:`2px solid ${mobileView===id?"#818cf8":"transparent"}`,color:mobileView===id?"#818cf8":t.textDim,fontSize:11,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,cursor:"pointer"}}>
            {label}
          </button>
        ))}
      </div>

      {mobileView==="intel"&&<div style={{display:"flex",flexDirection:"column",gap:10,padding:"10px"}}>
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:14}}>
          <div style={{fontSize:8,letterSpacing:4,color:t.textDim,marginBottom:10,display:"flex",justifyContent:"space-between",fontFamily:"'Share Tech Mono',monospace"}}><span>AI SITUATION BRIEF</span><span style={{color:"#22c55e"}}>CLAUDE</span></div>
          <AITextBlock text={intel.summary} fontSize={12}/>
        </div>
        <NationThreatMatrix nationThreats={intel.nationThreats||[]} events={intel.events||[]}/>
        {intel.predictions&&<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:8,letterSpacing:3,color:t.textDim,display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Share Tech Mono',monospace"}}><span>ESCALATION FORECAST</span><div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:4,height:4,background:"#ef4444",animation:"pulse 1.5s infinite"}}/><span style={{fontSize:7,color:"#ef4444",letterSpacing:2}}>AI</span></div></div>
          <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
            {intel.predictions.map((p:any,i:number)=>{const c=p.probability>80?"#ef4444":p.probability>65?"#f97316":"#eab308";return<div key={i} style={{padding:"11px 13px",borderRadius:3,background:t.bgSecondary,border:`1px solid ${t.border}`,borderLeft:`3px solid ${c}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,color:t.text,fontWeight:700,fontFamily:"'Share Tech Mono',monospace"}}>{p.zone}</span><span style={{fontSize:16,fontWeight:900,color:c,fontFamily:"'Share Tech Mono',monospace"}}>{p.probability}%</span></div>
              <div style={{fontSize:8,color:t.textDim,marginBottom:4,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace"}}>WINDOW: {p.timeframe}</div>
              <div style={{fontSize:10,color:t.textDim,lineHeight:1.7}}>{formatAIText(p.scenario)}</div>
              <div style={{height:2,background:t.bgSecondary,borderRadius:1,marginTop:8}}><div style={{height:"100%",width:`${p.probability}%`,background:c,borderRadius:1}}/></div>
            </div>;})}
          </div>
        </div>}
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:12}}>
          <div style={{fontSize:8,letterSpacing:3,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>CRITICAL EVENTS</div>
          {(intel.events||[]).filter((e:any)=>e.severity==="critical").map((ev:any,i:number)=><EventCard key={ev.id||i} ev={ev} isNew={i===0}/>)}
          {(intel.events||[]).filter((e:any)=>e.severity==="critical").length===0&&<div style={{color:t.textDim,fontSize:11,padding:20,textAlign:"center",letterSpacing:2,fontFamily:"'Share Tech Mono',monospace"}}>NO CRITICAL EVENTS</div>}
        </div>
      </div>}

      {mobileView==="news"&&<div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:4}}>{([["latest","LATEST"],["24hrs","24H"],["hot","HOT"]] as [string,string][]).map(([id,label])=>tabBtn(id, label, newsTab===id, ()=>setNewsTab(id as any)))}</div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:8,color:t.textDim}}>{displayNews.length}</span><div style={{width:4,height:4,background:"#ef4444",animation:"pulse 1s infinite"}}/></div>
        </div>
        <div style={{padding:"6px 10px",borderBottom:`1px solid ${t.borderLight}`}}>
          <div style={{position:"relative"}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:t.textDim}}>⌕</span>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Filter news..." style={{width:"100%",background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:3,padding:"7px 8px 7px 22px",fontSize:12,color:t.textMuted,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}/>
            {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button>}
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"6px 8px",maxHeight:"70vh"}}>
          {displayNews.map((item,i)=><NewsCard key={i} item={item} big={newsTab==="latest"&&i<2} onClick={setSelectedNews}/>)}
        </div>
      </div>}

      {mobileView==="chat"&&<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 160px)"}}>
        <div style={{padding:"10px 12px",borderBottom:`1px solid ${t.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:8,color:"#818cf8",letterSpacing:3,marginBottom:2,fontFamily:"'Share Tech Mono',monospace"}}>WARROOM AI CHATBOT</div><div style={{fontSize:10,color:t.textDim}}>Ask about any conflict</div></div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:5,height:5,background:"#818cf8",animation:"pulse 1.5s infinite"}}/><span style={{fontSize:8,color:"#818cf8",letterSpacing:2}}>ONLINE</span></div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
          {chatMessages.length===0&&<div style={{padding:"8px 0"}}><div style={{fontSize:11,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.6}}>WARROOM AI ready. Ask me anything.</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{QUICK_PROMPTS.map((p,i)=><button key={i} onClick={()=>sendChat(p)} style={{background:t.bgSecondary,border:`1px solid ${t.border}`,color:t.textDim,padding:"6px 9px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:"'Share Tech Mono',monospace",textAlign:"left"}}>{p}</button>)}</div></div>}
          {chatMessages.map(m=><div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"92%",padding:"10px 13px",borderRadius:3,background:m.role==="user"?t.bgSecondary:t.cardBg,border:`1px solid ${t.border}`,borderLeft:m.role==="assistant"?"3px solid #818cf8":`1px solid ${t.border}`}}>{m.role==="assistant"&&<div style={{fontSize:8,color:"#818cf8",letterSpacing:2,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>WARROOM AI</div>}{m.role==="user"?<div style={{fontSize:12,color:t.text,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.7}}>{m.content}</div>:<AITextBlock text={m.content} fontSize={12}/>}</div></div>)}
          {chatLoading&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0"}}><div style={{width:6,height:6,background:"#818cf8",animation:"pulse 0.6s infinite"}}/><div style={{width:6,height:6,background:"#818cf8",animation:"pulse 0.6s infinite",animationDelay:"0.2s"}}/><div style={{width:6,height:6,background:"#818cf8",animation:"pulse 0.6s infinite",animationDelay:"0.4s"}}/><span style={{fontSize:10,color:t.textDim}}>Analyzing...</span></div>}
          <div ref={chatEndRef}/>
        </div>
        <div style={{padding:"8px 10px",borderTop:`1px solid ${t.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Ask anything..." disabled={chatLoading} style={{flex:1,background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:3,padding:"10px 10px",fontSize:13,color:t.textMuted,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}/>
            <button onClick={()=>sendChat()} disabled={chatLoading||!chatInput.trim()} style={{background:chatLoading||!chatInput.trim()?"transparent":"#818cf8",border:`1px solid ${chatLoading||!chatInput.trim()?t.border:"#818cf8"}`,color:chatLoading||!chatInput.trim()?t.textDim:"#000",padding:"10px 14px",borderRadius:3,cursor:chatLoading||!chatInput.trim()?"not-allowed":"pointer",fontSize:11,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,letterSpacing:1,flexShrink:0}}>SEND</button>
          </div>
          {chatMessages.length>0&&<button onClick={()=>setChatMessages([])} style={{marginTop:5,background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:9,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>CLEAR CHAT</button>}
        </div>
      </div>}
      {selectedNews&&<NewsSummaryModal item={selectedNews} onClose={()=>setSelectedNews(null)}/>}
    </div>;
  }

  // Desktop layout
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,height:"calc(100vh - 120px)"}}>
    <div style={{display:"flex",flexDirection:"column",gap:12,overflowY:"auto",paddingRight:2}}>
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:16}}>
        <div style={{fontSize:7,letterSpacing:4,color:t.textDim,marginBottom:10,display:"flex",justifyContent:"space-between",fontFamily:"'Share Tech Mono',monospace"}}><span>AI SITUATION BRIEF</span><span style={{color:"#22c55e"}}>CLAUDE</span></div>
        <AITextBlock text={intel.summary} fontSize={10}/>
        {intel.updated&&<div style={{fontSize:8,color:t.textDim,marginTop:10,fontFamily:"'Share Tech Mono',monospace"}}>Updated: {new Date(intel.updated).toLocaleString()}</div>}
      </div>
      <NationThreatMatrix nationThreats={intel.nationThreats||[]} events={intel.events||[]}/>
      {intel.predictions&&<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
        <div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Share Tech Mono',monospace"}}><span>ESCALATION FORECAST</span><div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:4,height:4,background:"#ef4444",animation:"pulse 1.5s infinite"}}/><span style={{fontSize:7,color:"#ef4444",letterSpacing:2}}>AI ANALYSIS</span></div></div>
        <div style={{padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {intel.predictions.map((p:any,i:number)=>{const c=p.probability>80?"#ef4444":p.probability>65?"#f97316":"#eab308";return<div key={i} style={{padding:"11px 13px",borderRadius:3,background:t.bgSecondary,border:`1px solid ${t.border}`,borderLeft:`3px solid ${c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:9,color:t.text,fontWeight:700,fontFamily:"'Share Tech Mono',monospace"}}>{p.zone}</span><span style={{fontSize:14,fontWeight:900,color:c,fontFamily:"'Share Tech Mono',monospace"}}>{p.probability}%</span></div>
            <div style={{fontSize:7,color:t.textDim,marginBottom:4,letterSpacing:1,fontFamily:"'Share Tech Mono',monospace"}}>WINDOW: {p.timeframe}</div>
            <div style={{fontSize:8.5,color:t.textDim,lineHeight:1.7}}>{formatAIText(p.scenario)}</div>
            <div style={{height:2,background:t.bgSecondary,borderRadius:1,marginTop:8}}><div style={{height:"100%",width:`${p.probability}%`,background:c,borderRadius:1}}/></div>
          </div>;})}
        </div>
      </div>}
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:12}}>
        <div style={{fontSize:7,letterSpacing:3,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>CRITICAL EVENTS LOG</div>
        {(intel.events||[]).filter((e:any)=>e.severity==="critical").map((ev:any,i:number)=><EventCard key={ev.id||i} ev={ev} isNew={i===0}/>)}
        {(intel.events||[]).filter((e:any)=>e.severity==="critical").length===0&&<div style={{color:t.textDim,fontSize:9,padding:20,textAlign:"center",letterSpacing:2,fontFamily:"'Share Tech Mono',monospace"}}>NO CRITICAL EVENTS DETECTED</div>}
      </div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10,overflow:"hidden"}}>
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden",display:"flex",flexDirection:"column",flex:"0 0 auto",maxHeight:"50%"}}>
        <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:0}}>{([["latest","LATEST"],["24hrs","24 HRS"],["hot","HOT"]] as [string,string][]).map(([id,label])=>tabBtn(id, label, newsTab===id, ()=>setNewsTab(id as any)))}</div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:7.5,color:t.textDim}}>{displayNews.length} articles</span><div style={{width:4,height:4,background:"#ef4444",animation:"pulse 1s infinite"}}/></div>
        </div>
        <div style={{padding:"6px 10px",borderBottom:`1px solid ${t.borderLight}`,flexShrink:0}}>
          <div style={{position:"relative"}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>⌕</span>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Filter news..." style={{width:"100%",background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:3,padding:"5px 8px 5px 22px",fontSize:9,color:t.textMuted,fontFamily:"'Share Tech Mono',monospace",outline:"none"}}/>
            {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:11,fontFamily:"monospace"}}>×</button>}
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"6px 8px"}}>
          {displayNews.map((item,i)=><NewsCard key={i} item={item} big={newsTab==="latest"&&i<2} onClick={setSelectedNews}/>)}
        </div>
      </div>
      <div style={{background:t.cardBg,border:"1px solid #818cf8",borderRadius:4,display:"flex",flexDirection:"column",flex:1,overflow:"hidden",minHeight:0}}>
        <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.border}`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:7,color:"#818cf8",letterSpacing:3,marginBottom:2,fontFamily:"'Share Tech Mono',monospace"}}>WARROOM AI — INTELLIGENCE CHATBOT</div><div style={{fontSize:8,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>Ask about conflicts, news, or get analysis</div></div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:5,height:5,background:"#818cf8",animation:"pulse 1.5s infinite"}}/><span style={{fontSize:7,color:"#818cf8",letterSpacing:2}}>ONLINE</span></div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8,minHeight:0}}>
          {chatMessages.length===0&&<div style={{padding:"8px 0"}}><div style={{fontSize:9,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.6}}>WARROOM AI ready. I have context on current global conflicts and live news. Ask me anything.</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{QUICK_PROMPTS.map((p,i)=><button key={i} onClick={()=>sendChat(p)} style={{background:t.bgSecondary,border:`1px solid ${t.border}`,color:t.textDim,padding:"4px 9px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"'Share Tech Mono',monospace",textAlign:"left"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#818cf8";e.currentTarget.style.color="#818cf8";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.textDim;}}>{p}</button>)}</div></div>}
          {chatMessages.map(m=><div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"88%",padding:"10px 13px",borderRadius:3,background:m.role==="user"?t.bgSecondary:t.cardBg,border:`1px solid ${t.border}`,borderLeft:m.role==="assistant"?"3px solid #818cf8":`1px solid ${t.border}`}}>{m.role==="assistant"&&<div style={{fontSize:7,color:"#818cf8",letterSpacing:2,marginBottom:8,fontFamily:"'Share Tech Mono',monospace"}}>WARROOM AI</div>}{m.role==="user"?<div style={{fontSize:10,color:t.text,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.7}}>{m.content}</div>:<AITextBlock text={m.content} fontSize={10}/>}</div></div>)}
          {chatLoading&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0"}}><div style={{width:5,height:5,background:"#818cf8",animation:"pulse 0.6s infinite"}}/><div style={{width:5,height:5,background:"#818cf8",animation:"pulse 0.6s infinite",animationDelay:"0.2s"}}/><div style={{width:5,height:5,background:"#818cf8",animation:"pulse 0.6s infinite",animationDelay:"0.4s"}}/><span style={{fontSize:8,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>Analyzing...</span></div>}
          <div ref={chatEndRef}/>
        </div>
        <div style={{padding:"8px 10px",borderTop:`1px solid ${t.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Ask about any conflict or news..." disabled={chatLoading} style={{flex:1,background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:3,padding:"7px 10px",fontSize:10,color:t.textMuted,fontFamily:"'Share Tech Mono',monospace",outline:"none"}} onFocus={e=>e.target.style.borderColor="#818cf8"} onBlur={e=>e.target.style.borderColor=t.border}/>
            <button onClick={()=>sendChat()} disabled={chatLoading||!chatInput.trim()} style={{background:chatLoading||!chatInput.trim()?"transparent":"#818cf8",border:`1px solid ${chatLoading||!chatInput.trim()?t.border:"#818cf8"}`,color:chatLoading||!chatInput.trim()?t.textDim:"#000",padding:"7px 14px",borderRadius:3,cursor:chatLoading||!chatInput.trim()?"not-allowed":"pointer",fontSize:9,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,letterSpacing:1}}>SEND</button>
          </div>
          {chatMessages.length>0&&<button onClick={()=>setChatMessages([])} style={{marginTop:5,background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:7.5,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>CLEAR CHAT</button>}
        </div>
      </div>
    </div>
    {selectedNews&&<NewsSummaryModal item={selectedNews} onClose={()=>setSelectedNews(null)}/>}
  </div>;
}

// ===== MarketsPage =====
function MarketsPage({crypto,stocks,cryptoCharts,stockCharts,loadingMarkets,selectedCoin,setSelectedCoin,news}:{crypto:CryptoCoin[];stocks:Stock[];cryptoCharts:Record<string,any[]>;stockCharts:Record<string,any[]>;loadingMarkets:boolean;selectedCoin:string;setSelectedCoin:(id:string)=>void;news:NewsItem[]}){
  const isMobile=useIsMobile();
  const { t } = useTheme();
  const [chartRange,setChartRange]=useState(1);
  const [activeChart,setActiveChart]=useState<any[]>([]);
  const [mobileTab,setMobileTab]=useState<"crypto"|"stocks"|"chart">("crypto");
  const [analysisTarget, setAnalysisTarget] = useState<{ticker:string;name:string;price:number;change:number}|null>(null);

  useEffect(()=>{const coinId=COIN_MAP[selectedCoin];if(!coinId)return;if(chartRange===1&&cryptoCharts[selectedCoin]?.length)setActiveChart(cryptoCharts[selectedCoin]);fetchCryptoChart(coinId,chartRange).then(data=>setActiveChart(data));},[selectedCoin,chartRange,cryptoCharts]);
  const coin=crypto.find(c=>c.id===selectedCoin)||crypto[0];
  const chart=activeChart.length?activeChart:cryptoCharts[selectedCoin]||[];
  const isUp=coin?.change>=0;

  const openCoinAnalysis = (c: CryptoCoin) => {
    setAnalysisTarget({ ticker: c.id, name: c.name, price: c.price, change: c.change });
  };
  const openStockAnalysis = (s: Stock) => {
    setAnalysisTarget({ ticker: s.id, name: s.name, price: s.price, change: s.change });
  };

  if(isMobile){
    return <div style={{display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",borderBottom:`1px solid ${t.borderLight}`,background:t.bgSecondary,flexShrink:0}}>
        {[["crypto","CRYPTO"],["chart","CHART"],["stocks","MARKETS"]].map(([id,label])=>(
          <button key={id} onClick={()=>setMobileTab(id as any)} style={{flex:1,padding:"11px 4px",background:mobileTab===id?t.cardBg:"transparent",border:"none",borderBottom:`2px solid ${mobileTab===id?"#22c55e":"transparent"}`,color:mobileTab===id?"#22c55e":t.textDim,fontSize:11,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,cursor:"pointer"}}>{label}</button>
        ))}
      </div>
      {mobileTab==="crypto"&&<div style={{padding:10}}>
        <div style={{fontSize:9,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",marginBottom:8,letterSpacing:2}}>TAP A COIN FOR AI ANALYSIS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {crypto.map(c=><div key={c.id} style={{position:"relative"}}>
            <CryptoCard coin={c} chart={cryptoCharts[c.id]||[]} selected={selectedCoin===c.id} onClick={()=>{setSelectedCoin(c.id);setMobileTab("chart");}}/>
            <button onClick={(e)=>{e.stopPropagation();openCoinAnalysis(c);}} style={{position:"absolute",top:6,right:6,background:"#818cf8",border:"none",borderRadius:2,color:"#fff",fontSize:7,fontFamily:"'Share Tech Mono',monospace",padding:"2px 6px",cursor:"pointer",fontWeight:700,letterSpacing:0.5}}>AI WHY?</button>
          </div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:12}}>
          {[{label:"BTC DOM",value:`${((crypto[0]?.marketCap/(crypto.reduce((a,c)=>a+(c.marketCap||0),0)||1))*100).toFixed(1)}%`,color:"#f97316"},{label:"TOTAL MCAP",value:fmtB(crypto.reduce((a,c)=>a+(c.marketCap||0),0)),color:"#22c55e"},{label:"24H VOL",value:fmtB(crypto.reduce((a,c)=>a+(c.volume||0),0)),color:"#818cf8"},{label:"MOOD",value:crypto.filter(c=>c.change>0).length>crypto.length/2?"BULLISH":"BEARISH",color:crypto.filter(c=>c.change>0).length>crypto.length/2?"#22c55e":"#ef4444"}].map((s,i)=>(
            <div key={i} style={{padding:"10px 12px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,borderTop:`2px solid ${s.color}`}}><div style={{fontSize:8,color:t.textDim,letterSpacing:2,marginBottom:5,fontFamily:"'Share Tech Mono',monospace"}}>{s.label}</div><div style={{fontSize:15,fontWeight:900,color:s.color,fontFamily:"'Share Tech Mono',monospace"}}>{s.value}</div></div>
          ))}
        </div>
      </div>}
      {mobileTab==="chart"&&coin&&<div style={{padding:10}}>
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:3,background:t.bgSecondary,border:`1px solid ${coin.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:coin.color,fontWeight:900,fontFamily:"'Share Tech Mono',monospace"}}>{coin.symbol}</div><div><div style={{fontSize:14,fontWeight:900,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>{coin.name}</div><div style={{fontSize:10,color:t.textDim}}>{coin.id} / USD</div></div></div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:900,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>${fmt(coin.price,coin.price>100?0:2)}</div>
              <div style={{fontSize:11,color:isUp?"#22c55e":"#ef4444"}}>{isUp?"+":"-"}{Math.abs(coin.change).toFixed(2)}%</div>
            </div>
          </div>
          <button onClick={()=>openCoinAnalysis(coin)} style={{width:"100%",marginBottom:12,padding:"8px",background:`${isUp?"#22c55e":"#ef4444"}15`,border:`1px solid ${isUp?"#22c55e44":"#ef444444"}`,borderRadius:3,color:isUp?"#22c55e":"#ef4444",fontSize:11,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",fontWeight:700,letterSpacing:1}}>
            🤖 AI ANALYSIS: WHY IS {coin.id} {isUp?"UP":"DOWN"}?
          </button>
          <div style={{display:"flex",gap:6,marginBottom:12}}>{[{v:1,l:"1D"},{v:7,l:"7D"},{v:30,l:"1M"}].map(r=><button key={r.v} onClick={()=>setChartRange(r.v)} style={{background:chartRange===r.v?t.bgSecondary:"transparent",border:`1px solid ${chartRange===r.v?coin.color:t.border}`,color:chartRange===r.v?coin.color:t.textDim,padding:"4px 14px",borderRadius:3,cursor:"pointer",fontSize:10,fontFamily:"'Share Tech Mono',monospace"}}>{r.l}</button>)}</div>
          <div style={{height:200}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{top:5,right:5,bottom:0,left:0}}><defs><linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={coin.color} stopOpacity={0.12}/><stop offset="95%" stopColor={coin.color} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" tick={{fontSize:8,fill:t.textDim}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:8,fill:t.textDim}} axisLine={false} tickLine={false} width={55} tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(1)+"k":v}`} domain={["auto","auto"]}/><Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="price" stroke={coin.color} strokeWidth={1.5} fill="url(#coinGrad)" dot={false} activeDot={{r:4,fill:coin.color}}/></AreaChart></ResponsiveContainer></div>
        </div>
      </div>}
      {mobileTab==="stocks"&&<div style={{padding:10}}>
        <div style={{fontSize:9,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",marginBottom:8,letterSpacing:2}}>TAP ANY ROW FOR AI ANALYSIS</div>
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden",marginBottom:12}}>
          <div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:8,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",display:"flex",justifyContent:"space-between"}}><span>INDICES & COMMODITIES</span><span style={{color:"#22c55e"}}>LIVE</span></div>
          {stocks.map(s=><StockRow key={s.id} s={s} onAnalyze={openStockAnalysis}/>)}
        </div>
      </div>}
      {analysisTarget && <MarketAnalysisPanel {...analysisTarget} news={news} onClose={()=>setAnalysisTarget(null)}/>}
    </div>;
  }

  return <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14}}>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div><div style={{fontSize:7,letterSpacing:4,color:t.textDim,marginBottom:8,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:8}}><span style={{width:5,height:5,background:"#22c55e",display:"inline-block"}}/>LIVE CRYPTO — COINGECKO{loadingMarkets&&<span style={{color:t.textDim}}>syncing...</span>}</div>
        <div style={{fontSize:8,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",marginBottom:6,letterSpacing:1}}>Click any card for AI analysis of price movement</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>{crypto.map(c=><div key={c.id} style={{position:"relative"}}>
          <CryptoCard coin={c} chart={cryptoCharts[c.id]||[]} selected={selectedCoin===c.id} onClick={()=>setSelectedCoin(c.id)}/>
          <button onClick={(e)=>{e.stopPropagation();openCoinAnalysis(c);}} style={{position:"absolute",top:6,right:6,background:"#818cf8",border:"none",borderRadius:2,color:"#fff",fontSize:6,fontFamily:"'Share Tech Mono',monospace",padding:"2px 5px",cursor:"pointer",fontWeight:700,opacity:0.85}} title="AI Price Analysis">WHY?</button>
        </div>)}</div>
      </div>
      {coin&&<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:3,background:t.bgSecondary,border:`1px solid ${coin.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:coin.color,fontWeight:900,fontFamily:"'Share Tech Mono',monospace"}}>{coin.symbol}</div><div><div style={{fontSize:14,fontWeight:900,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>{coin.name}</div><div style={{fontSize:9,color:t.textDim}}>{coin.id} / USD</div></div></div>
          <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>openCoinAnalysis(coin)} style={{padding:"5px 12px",background:`${isUp?"#22c55e":"#ef4444"}15`,border:`1px solid ${isUp?"#22c55e44":"#ef444444"}`,borderRadius:3,color:isUp?"#22c55e":"#ef4444",fontSize:8,fontFamily:"'Share Tech Mono',monospace",cursor:"pointer",fontWeight:700,letterSpacing:0.5}}>🤖 AI WHY {isUp?"UP":"DOWN"}?</button>
            <div>
              <div style={{fontSize:22,fontWeight:900,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>${fmt(coin.price,coin.price>100?0:2)}</div>
              <div style={{fontSize:11,color:isUp?"#22c55e":"#ef4444"}}>{isUp?"+":"-"}{Math.abs(coin.change).toFixed(2)}% (24h)</div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:12}}>{[{v:1,l:"1D"},{v:7,l:"7D"},{v:30,l:"1M"}].map(r=><button key={r.v} onClick={()=>setChartRange(r.v)} style={{background:chartRange===r.v?t.bgSecondary:"transparent",border:`1px solid ${chartRange===r.v?coin.color:t.border}`,color:chartRange===r.v?coin.color:t.textDim,padding:"3px 12px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>{r.l}</button>)}</div>
        <div style={{height:200}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{top:5,right:5,bottom:0,left:0}}><defs><linearGradient id="coinGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={coin.color} stopOpacity={0.12}/><stop offset="95%" stopColor={coin.color} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" tick={{fontSize:7,fill:t.textDim}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:7,fill:t.textDim}} axisLine={false} tickLine={false} width={55} tickFormatter={v=>`$${v>=1000?(v/1000).toFixed(1)+"k":v}`} domain={["auto","auto"]}/><Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="price" stroke={coin.color} strokeWidth={1.5} fill="url(#coinGrad2)" dot={false} activeDot={{r:4,fill:coin.color}}/></AreaChart></ResponsiveContainer></div>
      </div>}
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:"14px 16px"}}>
        <div style={{fontSize:7,letterSpacing:4,color:t.textDim,marginBottom:12,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:8}}><span style={{width:5,height:5,background:"#818cf8",display:"inline-block"}}/>GLOBAL MARKETS — LIVE<span style={{fontSize:7,color:t.textDim,marginLeft:"auto"}}>Click row for AI analysis</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{["SPY","QQQ","GC=F","CL=F"].map(sym=>{const s=stocks.find(st=>st.id===sym);const ch=stockCharts[sym]||[];if(!s)return null;const up=s.change>=0;return<div key={sym} style={{background:t.bgSecondary,border:`1px solid ${t.border}`,borderRadius:3,padding:"10px 12px",cursor:"pointer"}} onClick={()=>openStockAnalysis(s)} onMouseEnter={e=>e.currentTarget.style.borderColor="#818cf8"} onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:10,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{s.id}</div><div style={{fontSize:7.5,color:t.textDim}}>{s.name}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,color:t.text,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{s.price>0?`$${fmt(s.price,s.price>500?0:2)}`:"—"}</div><div style={{fontSize:9,color:up?"#22c55e":"#ef4444"}}>{up?"+":"-"}{Math.abs(s.change).toFixed(2)}%</div></div></div><Sparkline data={ch} color={s.color} height={50}/><div style={{fontSize:7,color:"#818cf8",marginTop:4,textAlign:"right",fontFamily:"'Share Tech Mono',monospace"}}>[AI ANALYSIS]</div></div>;})}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>{[{label:"BTC DOMINANCE",value:`${((crypto[0]?.marketCap/(crypto.reduce((a,c)=>a+(c.marketCap||0),0)||1))*100).toFixed(1)}%`,color:"#f97316"},{label:"TOTAL MCap",value:fmtB(crypto.reduce((a,c)=>a+(c.marketCap||0),0)),color:"#22c55e"},{label:"24H VOLUME",value:fmtB(crypto.reduce((a,c)=>a+(c.volume||0),0)),color:"#818cf8"},{label:"MARKET MOOD",value:crypto.filter(c=>c.change>0).length>crypto.length/2?"BULLISH":"BEARISH",color:crypto.filter(c=>c.change>0).length>crypto.length/2?"#22c55e":"#ef4444"}].map((s,i)=><div key={i} style={{padding:"11px 13px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,borderTop:`2px solid ${s.color}`}}><div style={{fontSize:7,color:t.textDim,letterSpacing:2,marginBottom:6,fontFamily:"'Share Tech Mono',monospace"}}>{s.label}</div><div style={{fontSize:15,fontWeight:900,color:s.color,fontFamily:"'Share Tech Mono',monospace"}}>{s.value}</div></div>)}</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}><div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>INDICES & COMMODITIES</span><span style={{fontSize:7,color:"#22c55e"}}>LIVE</span></div>{stocks.map(s=><StockRow key={s.id} s={s} onAnalyze={openStockAnalysis}/>)}</div>
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}><div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>TOP CRYPTO</div>{crypto.map(c=>{const up=c.change>=0;return<div key={c.id} onClick={()=>{setSelectedCoin(c.id);openCoinAnalysis(c);}} style={{display:"flex",alignItems:"center",padding:"8px 13px",borderBottom:`1px solid ${t.borderLight}`,cursor:"pointer",transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background=t.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:22,height:22,borderRadius:2,background:t.bgSecondary,border:`1px solid ${c.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:c.color,fontWeight:900,marginRight:9,flexShrink:0,fontFamily:"'Share Tech Mono',monospace"}}>{c.symbol}</div><div style={{flex:1}}><div style={{fontSize:10,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace"}}>{c.id}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:10,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>${fmt(c.price,c.price>100?0:2)}</div><div style={{fontSize:8,color:up?"#22c55e":"#ef4444"}}>{up?"+":"-"}{Math.abs(c.change).toFixed(2)}%</div></div></div>;})}</div>
      <div style={{padding:"12px 14px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,fontSize:8,color:t.textDim,lineHeight:1.7}}><div style={{color:t.textDim,marginBottom:4,letterSpacing:2,fontSize:7}}>DATA SOURCES</div>Crypto: CoinGecko API (real-time)<br/>Stocks: Yahoo Finance (15min delay)<br/>AI Analysis: Claude AI<br/>Auto-refresh every 60 seconds</div>
    </div>
    {analysisTarget && <MarketAnalysisPanel {...analysisTarget} news={news} onClose={()=>setAnalysisTarget(null)}/>}
  </div>;
}

// ===== VideosPage =====
function VideosPage({videos,news,loadingVideos,playingVideo,setPlayingVideo}:{videos:VideoItem[];news:NewsItem[];loadingVideos:boolean;playingVideo:VideoItem|null;setPlayingVideo:(v:VideoItem|null)=>void}){
  const isMobile=useIsMobile();
  const { t } = useTheme();
  const [topic,setTopic]=useState("israel iran");
  const topics=["israel iran","russia ukraine","china taiwan","north korea missile","cyber attack","houthi red sea","nato military"];
  const filteredVideos=videos.filter(v=>{const kws=topic.toLowerCase().split(" ");return kws.some(k=>v.title?.toLowerCase().includes(k)||v.channel?.toLowerCase().includes(k));}).concat(videos.filter(v=>{const kws=topic.toLowerCase().split(" ");return!kws.some(k=>v.title?.toLowerCase().includes(k));})).slice(0,12);

  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:8,color:t.textDim,letterSpacing:3,fontFamily:"'Share Tech Mono',monospace"}}>TOPIC:</span>{topics.map(tp=><button key={tp} onClick={()=>setTopic(tp)} style={{background:topic===tp?t.bgSecondary:"transparent",border:`1px solid ${topic===tp?"#ef4444":t.border}`,color:topic===tp?"#ef4444":t.textDim,padding:"3px 10px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"'Share Tech Mono',monospace",textTransform:"uppercase"}}>{tp}</button>)}</div>
    {playingVideo&&<div style={{background:t.bgSecondary,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}><div style={{position:"relative",paddingBottom:"56.25%"}}><iframe src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div><div style={{padding:"10px 14px",display:"flex",gap:10,alignItems:"center"}}><div style={{flex:1}}><div style={{fontSize:11,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace",marginBottom:3}}>{playingVideo.title}</div><div style={{fontSize:8,color:t.textDim}}>{playingVideo.channel}</div></div><a href={playingVideo.url} target="_blank" rel="noreferrer" style={{fontSize:8,color:"#38bdf8",textDecoration:"none",border:"1px solid #38bdf822",padding:"4px 12px",borderRadius:3,fontFamily:"'Share Tech Mono',monospace",flexShrink:0}}>YOUTUBE</a><button onClick={()=>setPlayingVideo(null)} style={{background:"transparent",border:`1px solid ${t.border}`,color:t.textDim,padding:"4px 10px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"'Share Tech Mono',monospace"}}>CLOSE</button></div></div>}
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 320px",gap:14}}>
      <div>
        <div style={{fontSize:7,letterSpacing:4,color:t.textDim,marginBottom:8,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:8}}><span style={{width:5,height:5,background:"#ef4444",display:"inline-block"}}/>LIVE NEWS VIDEOS{loadingVideos&&<span style={{color:t.textDim}}>loading...</span>}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>{filteredVideos.map((v,i)=><VideoCard key={v.videoId||i} v={v} onPlay={setPlayingVideo} playing={playingVideo?.videoId===v.videoId}/>)}</div>
      </div>
      {!isMobile&&<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden",flex:1}}><div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",display:"flex",justifyContent:"space-between"}}><span>LATEST NEWS</span><span style={{color:"#ef4444"}}>LIVE</span></div><div style={{padding:10,maxHeight:600,overflowY:"auto"}}>{news.map((item,i)=><NewsCard key={i} item={item} big={i<3}/>)}{news.length===0&&<div style={{padding:24,textAlign:"center",color:t.textDim,fontSize:9}}>Loading headlines...</div>}</div></div>}
    </div>
    {isMobile&&news.length>0&&<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}><div style={{padding:"9px 13px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>LATEST NEWS</div><div style={{padding:10}}>{news.slice(0,5).map((item,i)=><NewsCard key={i} item={item}/>)}</div></div>}
  </div>;
}

// ===== TrendingPage =====
function TrendingPage({tab,news,videos,setPlayingVideo}:{tab:any;news:NewsItem[];videos:VideoItem[];setPlayingVideo:(v:VideoItem|null)=>void}){
  const isMobile=useIsMobile();
  const { t } = useTheme();
  const [sub,setSub]=useState("feed");
  const ageH=Math.floor((Date.now()-(tab.createdAt||Date.now()))/3600000);
  const timeLeft=Math.max(0,24-ageH);
  const topicNews=news.filter(n=>{const tt=(n.title||"").toLowerCase();return tab.keywords?.some((k:string)=>tt.includes(k));});
  const topicVideos=videos.filter(v=>{const tt=(v.title||"").toLowerCase();return tab.keywords?.some((k:string)=>tt.includes(k));});
  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{padding:isMobile?"12px":"16px 20px",borderRadius:4,background:t.cardBg,border:`1px solid ${tab.color}`,borderLeft:`4px solid ${tab.color}`,display:"flex",alignItems:"center",gap:16}}>
      <div style={{fontSize:10,color:tab.color,fontFamily:"'Share Tech Mono',monospace",fontWeight:900}}>{tab.icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:7,color:tab.color,letterSpacing:4,marginBottom:4,fontFamily:"'Share Tech Mono',monospace"}}>TRENDING NOW — AUTO GENERATED TAB</div>
        <div style={{fontSize:isMobile?14:18,fontWeight:900,color:t.text,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2}}>[{tab.flag}] {tab.label}</div>
        <div style={{fontSize:8,color:t.textDim,marginTop:4}}>{tab.eventCount} events · {topicNews.length} articles · expires in {timeLeft}h</div>
      </div>
      <div style={{textAlign:"center",flexShrink:0}}>
        <div style={{fontSize:7,color:t.textDim,letterSpacing:2,marginBottom:6}}>HEAT</div>
        <div style={{position:"relative",width:52,height:52}}><svg viewBox="0 0 52 52" style={{transform:"rotate(-90deg)"}}><circle cx="26" cy="26" r="21" fill="none" stroke={t.border} strokeWidth="5"/><circle cx="26" cy="26" r="21" fill="none" stroke={tab.color} strokeWidth="5" strokeDasharray={`${(tab.heat/100)*131.9} 131.9`} strokeLinecap="round"/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:tab.color,fontFamily:"'Share Tech Mono',monospace"}}>{tab.heat}</div></div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["feed","INTEL"],["news","NEWS"],["videos","VIDEOS"],["map","MAP"]].map(([id,l])=><button key={id} onClick={()=>setSub(id)} style={{background:sub===id?t.bgSecondary:"transparent",border:`1px solid ${sub===id?tab.color:t.border}`,color:sub===id?tab.color:t.textDim,padding:"5px 14px",borderRadius:3,cursor:"pointer",fontSize:9,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>{l}</button>)}</div>
    {sub==="feed"&&<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}><div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:12}}><div style={{fontSize:7,letterSpacing:3,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>CONFLICT EVENTS</div>{tab.events?.map((ev:any,i:number)=><EventCard key={ev.id||i} ev={ev} isNew={i<2}/>)}</div><div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:12}}><div style={{fontSize:7,letterSpacing:3,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>SEVERITY BREAKDOWN</div>{["critical","high","medium","low"].map(s=>{const n=tab.events?.filter((e:any)=>e.severity===s).length||0;if(!n)return null;return<div key={s} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:SEV[s],textTransform:"uppercase",letterSpacing:1.5}}>{s}</span><span style={{fontSize:9,color:t.textDim}}>{n}</span></div><div style={{height:3,background:t.bgSecondary,borderRadius:1}}><div style={{height:"100%",width:`${(n/(tab.events?.length||1))*100}%`,background:SEV[s],borderRadius:1,transition:"width 1s"}}/></div></div>;})}</div></div>}
    {sub==="news"&&<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>{topicNews.length===0?<div style={{padding:32,textAlign:"center",color:t.textDim,fontSize:10}}>No news matching this topic</div>:topicNews.map((n,i)=><NewsCard key={i} item={n} big/>)}</div>}
    {sub==="videos"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>{topicVideos.length===0?<div style={{padding:32,textAlign:"center",color:t.textDim,fontSize:10,gridColumn:"1/-1"}}>No videos yet</div>:topicVideos.map((v,i)=><VideoCard key={v.videoId||i} v={v} onPlay={setPlayingVideo} playing={false}/>)}</div>}
    {sub==="map"&&<div style={{background:t.bgSecondary,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden",height:isMobile?220:380}}><WorldMap hotspots={HOTSPOTS} events={tab.events||[]} selectedSpot={null} onSelect={()=>{}}/></div>}
  </div>;
}

const STATIC_NAV=[{id:"dashboard",icon:"+",label:"Dashboard"},{id:"markets",icon:"$",label:"Markets"},{id:"videos",icon:">",label:"News Videos"},{id:"feed",icon:"~",label:"Live Feed"},{id:"intel",icon:"*",label:"Intel"}];

function MobileBottomNav({page,setPage,trendingTabs}:{page:string;setPage:(p:string)=>void;trendingTabs:any[]}){
  const { t } = useTheme();
  const navItems=[...STATIC_NAV.slice(0,5)];
  return <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:t.bgSecondary,borderTop:`1px solid ${t.border}`,display:"flex",height:60,paddingBottom:"env(safe-area-inset-bottom)"}}>
    {navItems.map(n=>{const isOn=page===n.id;return<button key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:"transparent",border:"none",borderTop:`2px solid ${isOn?"#ef4444":"transparent"}`,color:isOn?"#ef4444":t.textDim,cursor:"pointer",padding:"6px 0"}}>
      <span style={{fontSize:16,fontFamily:"'Share Tech Mono',monospace",fontWeight:900,lineHeight:1}}>{n.icon}</span>
      <span style={{fontSize:9,fontFamily:"'Share Tech Mono',monospace",letterSpacing:0.5}}>{n.label.split(" ")[0]}</span>
    </button>;})}
  </div>;
}

// ===== Main Component =====
export default function WarRoom(){
  const isMobile=useIsMobile();
  const [isDark, setIsDark] = useState(true);
  // Set default theme based on device
  useEffect(() => {
    setIsDark(!isMobile);
  }, []); // only on mount
  const t = isDark ? DARK_THEME : LIGHT_THEME;
  const toggleTheme = () => setIsDark(d => !d);

  const [page,setPage]=useState("dashboard");
  const [loading,setLoading]=useState(true);
  const [loadMsg,setLoadMsg]=useState("CONNECTING");
  const [intel,setIntel]=useState<any>(null);
  const [hotspots,setHotspots]=useState<Hotspot[]>(HOTSPOTS);
  const [selectedSpot,setSelectedSpot]=useState<Hotspot|null>(null);
  const [trendingTabs,setTrendingTabs]=useState<any[]>([]);
  const [alert,setAlert]=useState<any>(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [lastUpdated,setLastUpdated]=useState<Date|null>(null);
  const [refreshingIntel,setRefreshingIntel]=useState(false);
  const [crypto,setCrypto]=useState<CryptoCoin[]>([]);
  const [stocks,setStocks]=useState<Stock[]>([]);
  const [cryptoCharts,setCryptoCharts]=useState<Record<string,any[]>>({});
  const [stockCharts,setStockCharts]=useState<Record<string,any[]>>({});
  const [loadingMarkets,setLoadingMarkets]=useState(true);
  const [selectedCoin,setSelectedCoin]=useState("BTC");
  const [videos,setVideos]=useState<VideoItem[]>([]);
  const [news,setNews]=useState<NewsItem[]>([]);
  const [loadingVideos,setLoadingVideos]=useState(true);
  const [playingVideo,setPlayingVideo]=useState<VideoItem|null>(null);
  const [newsFilter,setNewsFilter]=useState("all");
  const [mobileSidebarOpen,setMobileSidebarOpen]=useState(false);
  const alertRef=useRef<NodeJS.Timeout|null>(null);

  const loadIntel=useCallback(async(freshNews?:NewsItem[],isRefresh=false)=>{
    try{
      if(isRefresh)setRefreshingIntel(true);else{setLoading(true);setLoadMsg("FETCHING INTELLIGENCE");}
      const newsToUse=freshNews&&freshNews.length>0?freshNews:news;
      const d=await fetchIntelligence(newsToUse);
      setIntel(d);setLastUpdated(new Date());
      if(d.hotspotIntensity)setHotspots(prev=>prev.map(h=>({...h,intensity:d.hotspotIntensity[h.name]??h.base})));
      const fresh=extractTopics(d.events||[]);setTrendingTabs(prev=>mergeTopics(prev,fresh));
      const crit=(d.events||[]).find((e:any)=>e.severity==="critical");
      if(crit){setAlert(crit);if(alertRef.current)clearTimeout(alertRef.current);alertRef.current=setTimeout(()=>setAlert(null),8000);}
    }catch(e){console.error("Intel:",e);}
    finally{setLoading(false);setRefreshingIntel(false);}
  },[news]);

  const loadMarkets=useCallback(async()=>{
    setLoadingMarkets(true);
    try{
      const [cryptoData,stockData]=await Promise.all([fetchCryptoPrices(),fetchAllStocks()]);
      setCrypto(cryptoData);setStocks(stockData);
      const chartEntries=await Promise.all(Object.entries(COIN_MAP).map(async([id,cid])=>{const ch=await fetchCryptoChart(cid,1);return[id,ch];}));
      setCryptoCharts(Object.fromEntries(chartEntries));
      const stockSyms=["SPY","QQQ","GC%3DF","CL%3DF"];
      const sCharts=await Promise.all(stockSyms.map(async sym=>{const ch=await fetchStockChart(sym);return[sym.replace("%3D","="),ch];}));
      setStockCharts(Object.fromEntries(sCharts));
    }catch(e){console.error("Markets:",e);}finally{setLoadingMarkets(false);}
  },[]);

  const loadVideosAndNews=useCallback(async():Promise<NewsItem[]>=>{
    setLoadingVideos(true);
    try{
      const [vids,headlines]=await Promise.all([fetchYouTubeVideos(),fetchNewsHeadlines("israel iran ukraine russia war conflict geopolitics")]);
      setVideos(vids);setNews(headlines);return headlines;
    }catch(e){console.error("Videos/News:",e);return[];}finally{setLoadingVideos(false);}
  },[]);

  useEffect(()=>{loadVideosAndNews().then(freshNews=>{loadIntel(freshNews);});loadMarkets();},[]);
  useEffect(()=>{const i=setInterval(async()=>{const freshNews=await loadVideosAndNews();loadIntel(freshNews,true);},5*60*1000);return()=>clearInterval(i);},[loadIntel,loadVideosAndNews]);
  useEffect(()=>{const i=setInterval(()=>loadMarkets(),60*1000);return()=>clearInterval(i);},[loadMarkets]);
  useEffect(()=>{const i=setInterval(()=>loadVideosAndNews(),10*60*1000);return()=>clearInterval(i);},[loadVideosAndNews]);
  useEffect(()=>{const tt=setTimeout(()=>setTrendingTabs(p=>p.map(tt=>({...tt,isNew:false}))),8000);return()=>clearTimeout(tt);},[trendingTabs.map(tt=>tt.id).join(",")]);

  const currentTrend=page.startsWith("trend:")?trendingTabs.find(tt=>`trend:${tt.id}`===page):null;
  const filteredEvents=(intel?.events||[]).filter((e:Event)=>newsFilter==="all"?true:e.type===newsFilter||e.severity===newsFilter);
  const btc=crypto.find(c=>c.id==="BTC");const eth=crypto.find(c=>c.id==="ETH");const sol=crypto.find(c=>c.id==="SOL");

  const themeValue = { isDark, toggleTheme, t };

  if(loading)return(
    <ThemeContext.Provider value={themeValue}>
    <div style={{position:"fixed",inset:0,background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Share Tech Mono',monospace",padding:20}}>
      <div style={{fontSize:7,letterSpacing:8,color:t.textDim,marginBottom:10,textAlign:"center"}}>GLOBAL INTELLIGENCE PLATFORM</div>
      <div style={{fontSize:isMobile?28:38,fontWeight:900,letterSpacing:8,color:t.text,marginBottom:6}}>WAR<span style={{color:"#ef4444"}}>ROOM</span></div>
      <div style={{width:"min(260px,80vw)",height:1,background:t.border,overflow:"hidden",marginBottom:20,marginTop:30}}><div style={{height:"100%",width:"85%",background:"#ef4444",animation:"loadBar 2s ease infinite"}}/></div>
      <div style={{fontSize:9,color:t.textDim,letterSpacing:4}}>{loadMsg}...</div>
      <style>{`@keyframes loadBar{0%{width:0%}100%{width:95%}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
    </ThemeContext.Provider>
  );

  return(
  <ThemeContext.Provider value={themeValue}>
  <div style={{background:t.bg,minHeight:"100vh",color:t.text,fontFamily:"'Share Tech Mono','Courier New',monospace",display:"flex",flexDirection:"column",fontSize:12,transition:"background 0.3s ease, color 0.3s ease"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @keyframes loadBar{0%{width:0%}100%{width:95%}}
      html{-webkit-text-size-adjust:100%;}
      input,button{-webkit-appearance:none;touch-action:manipulation;}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:${t.bg}}
      ::-webkit-scrollbar-thumb{background:${t.scrollbar};border-radius:2px}
    `}</style>

    {alert&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#ef4444",padding:"7px 16px",display:"flex",alignItems:"center",gap:10,animation:"fadeUp .2s ease"}}>
      <span style={{fontSize:8,fontWeight:700,letterSpacing:3,color:"#fff",flexShrink:0}}>BREAKING</span>
      <span style={{width:1,height:14,background:"rgba(255,255,255,.4)",flexShrink:0}}/>
      <span style={{fontSize:isMobile?10:10,color:"#fff",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{alert.headline}</span>
      <button onClick={()=>setAlert(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#fff",cursor:"pointer",fontSize:14,fontFamily:"'Share Tech Mono',monospace",flexShrink:0}}>✕</button>
    </div>}

    {/* Ticker */}
    <div style={{height:28,background:t.ticker,borderBottom:`1px solid ${t.border}`,overflow:"hidden",position:"relative",flexShrink:0}}>
      <div style={{display:"flex",animation:"ticker 40s linear infinite",whiteSpace:"nowrap",height:"100%",alignItems:"center"}}>
        {[...Array(2)].map((_,rep)=><span key={rep} style={{display:"flex",gap:0}}>
          {[...crypto,...stocks].filter(i=>i.price>0).map((item,i)=>{const up=item.change>=0;return<span key={`${rep}-${i}`} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"0 18px",borderRight:`1px solid ${t.border}`,fontSize:9,fontFamily:"'Share Tech Mono',monospace"}}><span style={{color:t.textDim}}>{item.id||item.name}</span><span style={{color:t.textSecondary,fontWeight:700}}>${fmt(item.price,item.price>100?0:2)}</span><span style={{color:up?"#22c55e":"#ef4444",fontSize:8}}>{up?"+":"-"}{Math.abs(item.change).toFixed(2)}%</span></span>;})}
          {intel&&<span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"0 18px",borderRight:`1px solid ${t.border}`,fontSize:9,color:"#ef4444"}}>[!] THREAT: {intel.globalThreatLevel}% | DEFCON {intel.defcon}</span>}
        </span>)}
      </div>
    </div>

    {/* Header */}
    <div style={{height:isMobile?48:50,background:t.header,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",padding:`0 ${isMobile?12:16}px`,gap:isMobile?8:12,position:"sticky",top:28,zIndex:100,flexShrink:0}}>
      <button onClick={()=>isMobile?setMobileSidebarOpen(o=>!o):setSidebarOpen(o=>!o)} style={{background:"transparent",border:"none",color:t.textDim,cursor:"pointer",fontSize:16,padding:3,lineHeight:1,fontFamily:"monospace",flexShrink:0}}>&#9776;</button>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:26,height:26,background:"#ef4444",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Share Tech Mono',monospace",flexShrink:0}}>W</div>
        <div style={{fontSize:isMobile?11:13,fontWeight:700,letterSpacing:isMobile?2:4,color:t.text,fontFamily:"'Share Tech Mono',monospace",whiteSpace:"nowrap"}}>WAR<span style={{color:"#ef4444"}}>ROOM</span></div>
      </div>
      {!isMobile&&<><div style={{width:1,height:20,background:t.border}}/><div style={{fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>GLOBAL INTELLIGENCE PLATFORM</div></>}
      {btc&&!isMobile&&<div style={{display:"flex",gap:6,marginLeft:8}}>
        {[btc,eth,sol].filter(Boolean).map(c=>{if(!c)return null;return<div key={c.id} onClick={()=>{setPage("markets");setSelectedCoin(c.id);}} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:3,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=t.textDim} onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}><span style={{fontSize:9,color:c.color,fontWeight:700,fontFamily:"'Share Tech Mono',monospace"}}>{c.id}</span><span style={{fontSize:9,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace"}}>${fmt(c.price,c.price>100?0:2)}</span><span style={{fontSize:8,color:c.change>=0?"#22c55e":"#ef4444"}}>{c.change>=0?"+":"-"}{Math.abs(c.change).toFixed(1)}%</span></div>;})}
      </div>}
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:isMobile?6:8}}>
        {intel&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 9px",background:t.cardBg,border:"1px solid #ef4444",borderRadius:3}}>
          {!isMobile&&<span style={{fontSize:8,color:"#ef4444",letterSpacing:2,fontFamily:"'Share Tech Mono',monospace"}}>THREAT</span>}
          <span style={{fontSize:isMobile?12:14,fontWeight:800,color:"#ef4444",fontFamily:"'Share Tech Mono',monospace"}}>{intel.globalThreatLevel}%</span>
        </div>}
        {/* THEME TOGGLE */}
        <ThemeToggle />
        <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 9px",background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:3}}>
          <div style={{width:5,height:5,background:"#22c55e",animation:"pulse 1.5s infinite"}}/>
          {!isMobile&&<span style={{fontSize:8,color:"#22c55e",letterSpacing:2,fontFamily:"'Share Tech Mono',monospace"}}>LIVE</span>}
        </div>
        {!isMobile&&<button onClick={()=>loadIntel(undefined,true)} disabled={refreshingIntel} style={{background:"transparent",border:`1px solid ${t.border}`,color:t.textDim,cursor:"pointer",fontSize:8,padding:"4px 10px",borderRadius:3,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>{refreshingIntel?"UPDATING...":"REFRESH"}</button>}
        {!isMobile&&lastUpdated&&<div style={{fontSize:8,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>{lastUpdated.toLocaleTimeString("en-US",{hour12:false})}</div>}
      </div>
    </div>

    {/* Mobile sidebar overlay */}
    {isMobile&&mobileSidebarOpen&&<div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}} onClick={()=>setMobileSidebarOpen(false)}>
      <div style={{width:"min(280px,85vw)",background:t.sidebar,borderRight:`1px solid ${t.border}`,height:"100%",overflowY:"auto",padding:"12px 0"}} onClick={e=>e.stopPropagation()}>
        <div style={{height:2,background:"linear-gradient(90deg,#ef4444 0%,#f97316 40%,#818cf8 75%,transparent 100%)",marginBottom:12}}/>
        {/* Mobile theme toggle in sidebar */}
        <div style={{padding:"6px 16px 10px",borderBottom:`1px solid ${t.border}`,marginBottom:6}}>
          <button onClick={toggleTheme} style={{width:"100%",padding:"8px 12px",background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:t.text,fontFamily:"'Share Tech Mono',monospace",fontSize:11}}>
            <span style={{fontSize:16}}>{isDark?"☀️":"🌙"}</span>
            <span>Switch to {isDark?"Light":"Dark"} Mode</span>
          </button>
        </div>
        {STATIC_NAV.map(n=>{const isOn=page===n.id;return<div key={n.id} onClick={()=>{setPage(n.id);setMobileSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",background:isOn?`${t.bgSecondary}`:"transparent",borderLeft:`3px solid ${isOn?"#ef4444":"transparent"}`}}>
          <div style={{width:34,height:34,borderRadius:4,background:isOn?"rgba(239,68,68,0.14)":t.cardBg,border:`1px solid ${isOn?"rgba(239,68,68,0.35)":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:isOn?"#ef4444":t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:900,flexShrink:0}}>{n.icon}</div>
          <span style={{fontSize:13,fontFamily:"'Share Tech Mono',monospace",color:isOn?t.text:t.textDim,letterSpacing:0.5}}>{n.label}</span>
        </div>;})}
        {trendingTabs.length>0&&<><div style={{height:1,background:t.border,margin:"8px 12px"}}/>
          <div style={{padding:"4px 18px 8px",fontSize:8,letterSpacing:5,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:7}}><span style={{width:5,height:5,background:"#f97316",display:"inline-block",borderRadius:1,animation:"pulse 1.5s infinite"}}/>TRENDING</div>
          {trendingTabs.map(tt=>{const tid=`trend:${tt.id}`;const on=page===tid;return<div key={tt.id} onClick={()=>{setPage(tid);setMobileSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer",background:on?`${tt.color}0d`:"transparent",borderLeft:`3px solid ${on?tt.color:"transparent"}`}}>
            <div style={{width:34,height:34,borderRadius:4,background:on?`${tt.color}18`:t.cardBg,border:`1px solid ${on?tt.color+"44":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:on?tt.color:t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:900,flexShrink:0}}>{tt.icon}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,color:on?t.text:t.textDim,fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>[{tt.flag}] {tt.label}</div><div style={{height:2,background:t.border,borderRadius:1,marginTop:4}}><div style={{height:"100%",width:`${tt.heat}%`,background:`linear-gradient(90deg,${tt.color}60,${tt.color})`,borderRadius:1}}/></div></div>
            {tt.isNew&&<span style={{fontSize:7,background:tt.color,color:"#000",padding:"2px 5px",borderRadius:2,fontWeight:900,flexShrink:0}}>NEW</span>}
          </div>;})}
        </>}
      </div>
      <div style={{flex:1,background:"rgba(0,0,0,0.6)"}}/>
    </div>}

    <div style={{display:"flex",flex:1,overflow:"hidden",height:`calc(100vh - ${isMobile?76:78}px)`}}>
      {/* Desktop Sidebar */}
      {!isMobile&&<div style={{width:sidebarOpen?220:50,minWidth:sidebarOpen?220:50,background:t.sidebar,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",transition:"width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)",overflow:"hidden",flexShrink:0}}>
        <div style={{height:2,background:"linear-gradient(90deg,#ef4444 0%,#f97316 40%,#818cf8 75%,transparent 100%)",flexShrink:0}}/>
        <div style={{flex:1,paddingTop:8,overflowY:"auto",overflowX:"hidden",scrollbarWidth:"none"}}>
          {sidebarOpen&&<div style={{padding:"6px 18px 5px",fontSize:7,letterSpacing:5,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>NAV</div>}
          {STATIC_NAV.map(n=>{const isOn=page===n.id;return<div key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:sidebarOpen?"8px 12px 8px 14px":"9px 0",justifyContent:sidebarOpen?"flex-start":"center",cursor:"pointer",margin:"1px 6px",borderRadius:4,background:isOn?"rgba(239,68,68,0.07)":"transparent",borderLeft:`2px solid ${isOn?"#ef4444":"transparent"}`,transition:"all .15s ease"}} onMouseEnter={e=>{if(!isOn){e.currentTarget.style.background=t.cardHover;}}} onMouseLeave={e=>{if(!isOn){e.currentTarget.style.background="transparent";}}}>
            <div style={{width:28,height:28,borderRadius:4,background:isOn?"rgba(239,68,68,0.14)":t.cardBg,border:`1px solid ${isOn?"rgba(239,68,68,0.35)":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:isOn?"#ef4444":t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:900,flexShrink:0,transition:"all .15s"}}>{n.icon}</div>
            {sidebarOpen&&<><span style={{fontSize:10,fontFamily:"'Share Tech Mono',monospace",color:isOn?t.textSecondary:t.textDim,letterSpacing:0.3,flex:1,transition:"color .15s"}}>{n.label}</span>{isOn&&<div style={{width:3,height:16,borderRadius:2,background:"#ef4444",opacity:0.7,flexShrink:0}}/>}</>}
          </div>;})}
          {trendingTabs.length>0&&<>
            <div style={{height:1,background:t.border,margin:"8px 12px"}}/>
            {sidebarOpen&&<div style={{padding:"4px 18px 6px",fontSize:7,letterSpacing:5,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:7}}><span style={{width:5,height:5,background:"#f97316",display:"inline-block",borderRadius:1,animation:"pulse 1.5s infinite"}}/>TRENDING</div>}
            {trendingTabs.map(tt=>{const tid=`trend:${tt.id}`;const on=page===tid;return<div key={tt.id} onClick={()=>setPage(tid)} style={{display:"flex",alignItems:"center",gap:9,padding:sidebarOpen?"8px 12px 8px 14px":"9px 0",justifyContent:sidebarOpen?"flex-start":"center",cursor:"pointer",margin:"1px 6px",borderRadius:4,background:on?`${tt.color}0d`:"transparent",borderLeft:`2px solid ${on?tt.color:"transparent"}`,transition:"all .15s ease"}} onMouseEnter={e=>{if(!on){e.currentTarget.style.background=t.cardHover;}}} onMouseLeave={e=>{if(!on){e.currentTarget.style.background="transparent";}}}>
              <div style={{width:28,height:28,borderRadius:4,background:on?`${tt.color}18`:t.cardBg,border:`1px solid ${on?tt.color+"44":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:on?tt.color:t.textDim,fontFamily:"'Share Tech Mono',monospace",fontWeight:900,flexShrink:0,transition:"all .15s"}}>{tt.icon}</div>
              {sidebarOpen&&<><div style={{flex:1,minWidth:0}}><div style={{fontSize:9,color:on?t.textSecondary:t.textDim,fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"color .15s"}}>[{tt.flag}] {tt.label}</div><div style={{height:2,background:t.border,borderRadius:1,marginTop:4,overflow:"hidden"}}><div style={{height:"100%",width:`${tt.heat}%`,background:`linear-gradient(90deg,${tt.color}60,${tt.color})`,borderRadius:1,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/></div></div>{tt.isNew&&<span style={{fontSize:6,background:tt.color,color:"#000",padding:"2px 5px",borderRadius:2,fontWeight:900,flexShrink:0,letterSpacing:0.5,fontFamily:"'Share Tech Mono',monospace"}}>NEW</span>}</>}
            </div>;})}
          </>}
          <div style={{height:12}}/>
        </div>
        {sidebarOpen&&<div style={{padding:"10px 8px 12px",borderTop:`1px solid ${t.border}`,background:t.bgSecondary,flexShrink:0}}>
          <div style={{fontSize:7,letterSpacing:4,color:t.textDim,marginBottom:8,paddingLeft:4,fontFamily:"'Share Tech Mono',monospace"}}>DATA SOURCES</div>
          {([["Intel","Claude AI + Web","#ef4444"],["Crypto","CoinGecko API","#f97316"],["Stocks","Yahoo Finance","#22c55e"],["News","Google News RSS","#818cf8"],["Videos","YouTube RSS","#38bdf8"]] as [string,string,string][]).map(([n,s,c])=><div key={n} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 9px",borderRadius:4,marginBottom:3,background:t.cardBg,border:`1px solid ${t.border}`}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c+"33";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;}}>
            <div style={{width:6,height:6,borderRadius:2,background:c,opacity:0.85,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:9,fontWeight:600,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>{n}</div><div style={{fontSize:7.5,color:t.textDim,marginTop:1,fontFamily:"'Share Tech Mono',monospace"}}>{s}</div></div>
          </div>)}
          {lastUpdated&&<div style={{marginTop:6,paddingLeft:4,fontSize:7.5,color:t.textDim,fontFamily:"'Share Tech Mono',monospace",display:"flex",alignItems:"center",gap:5}}><div style={{width:3,height:3,borderRadius:1,background:"#22c55e"}}/>{lastUpdated.toLocaleTimeString("en-US",{hour12:false})}</div>}
        </div>}
        {!sidebarOpen&&<div style={{padding:"10px 0 12px",borderTop:`1px solid ${t.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>{["#ef4444","#f97316","#22c55e","#818cf8","#38bdf8"].map((c,i)=><div key={i} style={{width:5,height:5,borderRadius:2,background:c,opacity:0.4}}/>)}</div>}
      </div>}

      {/* Main content */}
      <div style={{flex:1,overflow:"auto",padding:isMobile?"10px 10px 76px":"14px",scrollbarWidth:"thin",scrollbarColor:`${t.scrollbar} ${t.bg}`}}>
        {currentTrend&&<TrendingPage tab={currentTrend} news={news} videos={videos} setPlayingVideo={setPlayingVideo}/>}
        {page==="markets"&&<MarketsPage crypto={crypto} stocks={stocks} cryptoCharts={cryptoCharts} stockCharts={stockCharts} loadingMarkets={loadingMarkets} selectedCoin={selectedCoin} setSelectedCoin={setSelectedCoin} news={news}/>}
        {page==="videos"&&<VideosPage videos={videos} news={news} loadingVideos={loadingVideos} playingVideo={playingVideo} setPlayingVideo={setPlayingVideo}/>}

        {page==="feed"&&intel&&<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 260px",gap:14}}>
          <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
              <span style={{fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>ALL EVENTS ({filteredEvents.length})</span>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["all","critical","high","cyber","missile","naval","ground","economic"].map(f=><button key={f} onClick={()=>setNewsFilter(f)} style={{background:newsFilter===f?t.bgSecondary:"transparent",border:`1px solid ${newsFilter===f?"#ef4444":t.border}`,color:newsFilter===f?"#ef4444":t.textDim,padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:7,fontFamily:"'Share Tech Mono',monospace"}}>{f}</button>)}</div>
            </div>
            <div style={{padding:10,maxHeight:"calc(100vh - 200px)",overflowY:"auto"}}>{filteredEvents.map((ev:Event,i:number)=><EventCard key={ev.id||i} ev={ev} isNew={i<3}/>)}</div>
          </div>
          {!isMobile&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>BY SEVERITY</div>
              <div style={{padding:10}}>{["critical","high","medium","low","info"].map(s=>{const n=(intel.events||[]).filter((e:Event)=>e.severity===s).length;return<div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${t.borderLight}`}}><span style={{fontSize:9,color:SEV[s],display:"flex",alignItems:"center",gap:5,textTransform:"uppercase",letterSpacing:1}}><span style={{width:4,height:4,background:SEV[s],display:"inline-block"}}/>{s}</span><span style={{fontSize:16,fontWeight:900,color:SEV[s],fontFamily:"'Share Tech Mono',monospace"}}>{n}</span></div>;})}</div>
            </div>
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,padding:12,flex:1}}>
              <div style={{fontSize:7,letterSpacing:3,color:t.textDim,marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>TOP REGIONS</div>
              {(()=>{
                const regions=[...new Set((intel.events||[]).map((e:Event)=>e.region).filter(Boolean))] as string[];
                const counts=regions.map(r=>(intel.events||[]).filter((e:Event)=>e.region===r).length);
                const maxCount=Math.max(...counts,1);
                return regions.slice(0,8).map(r=>{const n=(intel.events||[]).filter((e:Event)=>e.region===r).length;return<div key={r} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>{r}</span><span style={{fontSize:9,color:t.textDim}}>{n}</span></div><div style={{height:2,background:t.bgSecondary,borderRadius:1}}><div style={{height:"100%",width:`${(n/maxCount)*100}%`,background:"#f97316",borderRadius:1,transition:"width 1s"}}/></div></div>;});
              })()}
            </div>
          </div>}
        </div>}

        {page==="intel"&&intel&&<IntelPage intel={intel} news={news}/>}

        {page==="dashboard"&&intel&&<div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 270px",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:8}}>
              {[{label:"ACTIVE EVENTS",value:(intel.events||[]).length,color:"#ef4444"},{label:"CRITICAL",value:(intel.events||[]).filter((e:Event)=>e.severity==="critical").length,color:"#f97316"},{label:"DEFCON",value:intel.defcon||3,color:"#eab308"},{label:"TRENDING",value:trendingTabs.length,color:"#f97316"}].map((s,i)=><div key={i} style={{padding:"12px 14px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,borderTop:`2px solid ${s.color}`}}><div style={{fontSize:7,color:t.textDim,letterSpacing:3,marginBottom:7,fontFamily:"'Share Tech Mono',monospace"}}>{s.label}</div><div style={{fontSize:isMobile?22:28,fontWeight:900,color:s.color,lineHeight:1,fontFamily:"'Share Tech Mono',monospace"}}>{s.value}</div></div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(3,1fr)":"repeat(5,1fr)",gap:8}}>
              {crypto.slice(0,isMobile?3:5).map(c=>{const up=c.change>=0;return<div key={c.id} onClick={()=>{setPage("markets");setSelectedCoin(c.id);}} style={{padding:"9px 11px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,fontWeight:700,color:c.color,fontFamily:"'Share Tech Mono',monospace"}}>{c.id}</span><span style={{fontSize:8,color:up?"#22c55e":"#ef4444"}}>{up?"+":"-"}</span></div>
                <div style={{fontSize:isMobile?10:12,fontWeight:800,color:t.textSecondary,fontFamily:"'Share Tech Mono',monospace",marginBottom:2}}>${fmt(c.price,c.price>100?0:2)}</div>
                <div style={{fontSize:8,color:up?"#22c55e":"#ef4444"}}>{Math.abs(c.change).toFixed(2)}%</div>
                <Sparkline data={cryptoCharts[c.id]||[]} color={c.color} height={28} showArea={false}/>
              </div>;})}
            </div>
            {intel.summary&&<div style={{padding:"11px 14px",borderRadius:4,background:t.cardBg,border:`1px solid ${t.border}`,borderLeft:"3px solid #f97316",display:"flex",gap:10}}>
              <span style={{fontSize:9,flexShrink:0,marginTop:1,color:"#f97316",fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>[SAT]</span>
              <div style={{flex:1}}><div style={{fontSize:7,letterSpacing:3,color:t.textDim,marginBottom:6,fontFamily:"'Share Tech Mono',monospace"}}>AI SITUATION ASSESSMENT</div><AITextBlock text={intel.summary} fontSize={isMobile?12:10}/></div>
            </div>}
            <div style={{background:t.bgSecondary,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden",minHeight:isMobile?220:320}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Share Tech Mono',monospace"}}>
                <span>REAL-TIME CONFLICT MAP</span>
                {!isMobile&&<div style={{display:"flex",gap:4}}>{["all","missile","cyber","naval","ground"].map(f=><button key={f} onClick={()=>setNewsFilter(newsFilter===f?"all":f)} style={{background:newsFilter===f?t.cardBg:"transparent",border:`1px solid ${newsFilter===f?"#ef4444":t.border}`,color:newsFilter===f?"#ef4444":t.textDim,padding:"2px 6px",borderRadius:3,cursor:"pointer",fontSize:7,fontFamily:"'Share Tech Mono',monospace"}}>{f}</button>)}</div>}
              </div>
              <div style={{height:isMobile?220:320,position:"relative"}}><WorldMap hotspots={hotspots} events={filteredEvents} selectedSpot={selectedSpot} onSelect={setSelectedSpot}/></div>
            </div>
            {trendingTabs.length>0&&<div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:"#f97316",display:"flex",justifyContent:"space-between",fontFamily:"'Share Tech Mono',monospace"}}><span>TRENDING — AUTO TABS</span><span style={{color:t.textDim}}>{trendingTabs.length} ACTIVE</span></div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(auto-fill,minmax(175px,1fr))",gap:0}}>
                {trendingTabs.map(tt=><div key={tt.id} onClick={()=>setPage(`trend:${tt.id}`)} style={{padding:"11px 13px",borderRight:`1px solid ${t.borderLight}`,borderBottom:`1px solid ${t.borderLight}`,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=t.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><span style={{fontSize:8,color:tt.color,fontFamily:"'Share Tech Mono',monospace",fontWeight:900}}>{tt.icon}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:9,color:tt.color,fontWeight:700,fontFamily:"'Share Tech Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>[{tt.flag}] {tt.label}</div><div style={{fontSize:7.5,color:t.textDim}}>{tt.eventCount} events</div></div>{tt.isNew&&<span style={{fontSize:6.5,background:tt.color,color:"#000",padding:"1px 4px",borderRadius:2,fontWeight:700,flexShrink:0}}>NEW</span>}</div>
                  <div style={{height:2,background:t.bgSecondary,borderRadius:1}}><div style={{height:"100%",width:`${tt.heat}%`,background:tt.color,borderRadius:1,transition:"width 1s"}}/></div>
                </div>)}
              </div>
            </div>}
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>LATEST NEWS HEADLINES</span><button onClick={()=>setPage("videos")} style={{fontSize:8,color:"#22c55e",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>VIEW ALL</button></div>
              <div style={{padding:10}}>{isMobile?news.slice(0,5).map((n,i)=><div key={i} style={{marginBottom:6}}><NewsCard item={n} big={i<1}/></div>):<div style={{columns:2,gap:10}}>{news.slice(0,8).map((n,i)=><div key={i} style={{breakInside:"avoid",marginBottom:6}}><NewsCard item={n} big={i<2}/></div>)}</div>}</div>
            </div>
          </div>
          <div style={{display:isMobile?"none":"flex",flexDirection:"column",gap:10,overflow:"hidden"}}>
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}><DefconDisplay level={intel.defcon||3}/></div>
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>MARKETS</span><button onClick={()=>setPage("markets")} style={{fontSize:8,color:"#22c55e",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>VIEW ALL</button></div>
              {stocks.slice(0,4).map(s=><StockRow key={s.id} s={s}/>)}
            </div>
            {intel.nationThreats&&<NationThreatMatrix nationThreats={intel.nationThreats||[]} events={intel.events||[]}/>}
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:7,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>NEWS VIDEOS</span><button onClick={()=>setPage("videos")} style={{fontSize:8,color:"#ef4444",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>ALL VIDEOS</button></div>
              <div style={{padding:8,display:"flex",flexDirection:"column",gap:6}}>
                {videos.slice(0,3).map((v,i)=><div key={v.videoId||i} onClick={()=>setPlayingVideo(v)} style={{display:"flex",gap:8,cursor:"pointer",padding:"5px 6px",borderRadius:3}} onMouseEnter={e=>e.currentTarget.style.background=t.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{position:"relative",width:64,height:42,borderRadius:3,overflow:"hidden",flexShrink:0,background:t.bgSecondary}}><img src={v.thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.4)"}}><div style={{width:14,height:14,borderRadius:2,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#fff"}}>&#9654;</div></div></div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:8.5,color:t.textSecondary,lineHeight:1.4,fontFamily:"'Share Tech Mono',monospace",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{v.title}</div><div style={{fontSize:7,color:t.textDim,marginTop:3}}>{v.channel}</div></div>
                </div>)}
                {videos.length===0&&<div style={{padding:16,textAlign:"center",color:t.textDim,fontSize:9,fontFamily:"'Share Tech Mono',monospace"}}>Loading videos...</div>}
              </div>
            </div>
            <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,display:"flex",flexDirection:"column",overflow:"hidden",flex:1,minHeight:200}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,fontSize:7,letterSpacing:3,color:t.textDim,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,fontFamily:"'Share Tech Mono',monospace"}}><span>LIVE EVENT FEED</span><div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:4,height:4,background:"#ef4444",animation:"pulse 1s infinite"}}/><span style={{fontSize:7,color:"#ef4444",letterSpacing:2}}>LIVE</span></div></div>
              <div style={{flex:1,padding:"6px 8px",overflowY:"auto"}}>{(intel.events||[]).slice(0,14).map((ev:Event,i:number)=><EventCard key={ev.id||i} ev={ev} isNew={i<2}/>)}</div>
            </div>
          </div>
        </div>}
        {/* Mobile dashboard secondary */}
        {page==="dashboard"&&intel&&isMobile&&<div style={{display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
          <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}><DefconDisplay level={intel.defcon||3}/></div>
          {intel.nationThreats&&<NationThreatMatrix nationThreats={intel.nationThreats||[]} events={intel.events||[]}/>}
          <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"8px 12px",borderBottom:`1px solid ${t.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:8,letterSpacing:3,color:t.textDim,fontFamily:"'Share Tech Mono',monospace"}}>MARKETS</span><button onClick={()=>setPage("markets")} style={{fontSize:9,color:"#22c55e",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>VIEW ALL</button></div>
            {stocks.slice(0,4).map(s=><StockRow key={s.id} s={s}/>)}
          </div>
          <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:4,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:200}}>
            <div style={{padding:"10px 12px",borderBottom:`1px solid ${t.borderLight}`,fontSize:8,letterSpacing:3,color:t.textDim,display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Share Tech Mono',monospace"}}><span>LIVE EVENT FEED</span><div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{width:4,height:4,background:"#ef4444",animation:"pulse 1s infinite"}}/><span style={{fontSize:8,color:"#ef4444",letterSpacing:2}}>LIVE</span></div></div>
            <div style={{padding:"6px 8px"}}>{(intel.events||[]).slice(0,8).map((ev:Event,i:number)=><EventCard key={ev.id||i} ev={ev} isNew={i<2}/>)}</div>
          </div>
        </div>}
      </div>
    </div>

    {isMobile&&<MobileBottomNav page={page} setPage={setPage} trendingTabs={trendingTabs}/>}

    {playingVideo&&page!=="videos"&&<VideoModal video={playingVideo} onClose={()=>setPlayingVideo(null)}/>}
    {trendingTabs.filter(tt=>tt.isNew).slice(0,1).map(tt=><div key={tt.id} style={{position:"fixed",bottom:isMobile?70:20,right:16,zIndex:9998,padding:"11px 14px",borderRadius:4,background:t.cardBg,border:`1px solid ${tt.color}`,borderLeft:`3px solid ${tt.color}`,animation:"fadeUp .3s ease",display:"flex",gap:10,alignItems:"center",maxWidth:280}}>
      <span style={{fontSize:9,color:tt.color,fontFamily:"'Share Tech Mono',monospace",fontWeight:900}}>{tt.icon}</span>
      <div><div style={{fontSize:7,color:tt.color,letterSpacing:3,marginBottom:2,fontFamily:"'Share Tech Mono',monospace"}}>NEW TRENDING TAB</div><div style={{fontSize:10,fontWeight:700,color:t.text,fontFamily:"'Share Tech Mono',monospace"}}>[{tt.flag}] {tt.label}</div><div style={{fontSize:8,color:t.textDim,marginTop:1}}>{tt.eventCount} events · 24h TTL</div></div>
    </div>)}
  </div>
  </ThemeContext.Provider>
  );
}