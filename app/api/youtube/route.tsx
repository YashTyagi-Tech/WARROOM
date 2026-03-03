import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId") || "";
  
  try {
    const r = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { "Accept": "application/xml, text/xml, */*" } }
    );
    const xml = await r.text();
    
    // Parse XML manually — no libraries needed for this simple format
    const entries: any[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const get = (tag: string) => entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim() || "";
      const videoId = entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)?.[1]?.trim() || "";
      entries.push({
        videoId,
        title: get("title").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">"),
        link: `https://www.youtube.com/watch?v=${videoId}`,
        pubDate: get("published"),
        thumb: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      });
    }
    return NextResponse.json({ status: "ok", items: entries });
  } catch (e) {
    console.error("YouTube RSS error:", e);
    return NextResponse.json({ status: "error", items: [] });
  }
}