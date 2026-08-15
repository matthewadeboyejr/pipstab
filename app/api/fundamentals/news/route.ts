import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { generateContentWithFallback } from "@/lib/gemini";

export interface EnrichedNewsItem {
    id: string;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
    category: "Central Banks" | "Forex" | "Commodities" | "Indices" | "Crypto" | "General";
    sentiment: "Bullish" | "Bearish" | "Neutral";
    impact: "High" | "Medium" | "Low";
    relatedAsset?: string;
}

export interface NewsPulseResponse {
    items: EnrichedNewsItem[];
    executive_brief: {
        headline: string;
        takeaways: string[];
        risk_tone: "Risk-On" | "Risk-Off" | "Mixed/Cautious";
        market_bias: string;
    };
    sentiment_stats: {
        bullish_pct: number;
        bearish_pct: number;
        neutral_pct: number;
        total_analyzed: number;
    };
}

function categorizeHeadline(title: string, summary: string): {
    category: EnrichedNewsItem["category"];
    relatedAsset?: string;
    sentiment: EnrichedNewsItem["sentiment"];
    impact: EnrichedNewsItem["impact"];
} {
    const text = `${title} ${summary}`.toLowerCase();
    
    // Category detection
    let category: EnrichedNewsItem["category"] = "General";
    let relatedAsset = undefined;

    if (text.includes("fed") || text.includes("powell") || text.includes("rate cut") || text.includes("rate hike") || text.includes("ecb") || text.includes("inflation") || text.includes("cpi") || text.includes("pce") || text.includes("central bank") || text.includes("fomc")) {
        category = "Central Banks";
        relatedAsset = "USD / Rates";
    } else if (text.includes("dollar") || text.includes("euro") || text.includes("yen") || text.includes("gbp") || text.includes("pound") || text.includes("eur/usd") || text.includes("usd/jpy") || text.includes("forex") || text.includes("currency")) {
        category = "Forex";
        relatedAsset = "Major FX";
    } else if (text.includes("gold") || text.includes("oil") || text.includes("crude") || text.includes("silver") || text.includes("opec") || text.includes("metal") || text.includes("commodity")) {
        category = "Commodities";
        relatedAsset = text.includes("gold") ? "XAU/USD" : text.includes("oil") ? "Crude Oil" : "Commodities";
    } else if (text.includes("s&p") || text.includes("nasdaq") || text.includes("dow") || text.includes("wall street") || text.includes("stocks") || text.includes("equities") || text.includes("tech shares")) {
        category = "Indices";
        relatedAsset = "Global Indices";
    } else if (text.includes("bitcoin") || text.includes("crypto") || text.includes("ethereum") || text.includes("btc") || text.includes("eth") || text.includes("etf")) {
        category = "Crypto";
        relatedAsset = "Digital Assets";
    }

    // Sentiment detection
    const bullishWords = ["rally", "gains", "jump", "surges", "soars", "boost", "optimism", "growth", "highs", "rebound", "bullish", "eases", "cooling"];
    const bearishWords = ["plunges", "slumps", "falls", "drops", "fears", "warning", "recession", "hawkish", "hike", "collapse", "crisis", "pressure", "weak"];

    let bullishCount = 0;
    let bearishCount = 0;

    bullishWords.forEach(w => { if (text.includes(w)) bullishCount++; });
    bearishWords.forEach(w => { if (text.includes(w)) bearishCount++; });

    const sentiment: EnrichedNewsItem["sentiment"] = bullishCount > bearishCount ? "Bullish" : bearishCount > bullishCount ? "Bearish" : "Neutral";
    
    // Impact estimation
    const isHighImpact = text.includes("breaking") || text.includes("urgent") || text.includes("fomc") || text.includes("cpi") || text.includes("war") || text.includes("emergency") || text.includes("surge") || text.includes("plunge");
    const impact: EnrichedNewsItem["impact"] = isHighImpact ? "High" : (bullishCount > 0 || bearishCount > 0) ? "Medium" : "Low";

    return { category, relatedAsset, sentiment, impact };
}

export async function GET() {
    const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
    const rawItems: any[] = [];

    // 1. Fetch from Finnhub (General + Forex) if available
    if (FINNHUB_API_KEY) {
        try {
            const [generalRes, forexRes] = await Promise.allSettled([
                fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`, { next: { revalidate: 300 } }),
                fetch(`https://finnhub.io/api/v1/news?category=forex&token=${FINNHUB_API_KEY}`, { next: { revalidate: 300 } }),
            ]);

            if (generalRes.status === "fulfilled" && generalRes.value.ok) {
                const data = await generalRes.value.json();
                if (Array.isArray(data)) rawItems.push(...data.slice(0, 20));
            }
            if (forexRes.status === "fulfilled" && forexRes.value.ok) {
                const data = await forexRes.value.json();
                if (Array.isArray(data)) rawItems.push(...data.slice(0, 15));
            }
        } catch (e) {
            console.error("Finnhub fetch error:", e);
        }
    }

    // 2. Fetch from Yahoo Finance RSS Feed for redundancy
    try {
        const parser = new Parser();
        const feed = await parser.parseURL("https://finance.yahoo.com/news/rss");
        if (feed && feed.items) {
            const rssItems = feed.items.slice(0, 20).map((item, idx) => ({
                id: `rss-${idx}-${Date.now()}`,
                headline: item.title || "Market Update",
                summary: item.contentSnippet || item.title || "",
                source: "Yahoo Finance",
                url: item.link || "#",
                datetime: item.pubDate ? Math.floor(new Date(item.pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
            }));
            rawItems.push(...rssItems);
        }
    } catch (e) {
        console.error("RSS fetch error:", e);
    }

    // Deduplicate items by headline
    const seenHeadlines = new Set<string>();
    const deduplicated: EnrichedNewsItem[] = [];

    for (const item of rawItems) {
        const title = (item.headline || item.title || "").trim();
        if (!title || seenHeadlines.has(title.toLowerCase())) continue;
        seenHeadlines.add(title.toLowerCase());

        const summary = item.summary || item.headline || "";
        const meta = categorizeHeadline(title, summary);

        deduplicated.push({
            id: String(item.id || Math.random()),
            headline: title,
            summary: summary,
            source: item.source || "Market Wire",
            url: item.url || "#",
            datetime: item.datetime || Math.floor(Date.now() / 1000),
            category: meta.category,
            sentiment: meta.sentiment,
            impact: meta.impact,
            relatedAsset: meta.relatedAsset,
        });
    }

    // Sort by latest datetime
    deduplicated.sort((a, b) => b.datetime - a.datetime);
    const finalItems = deduplicated.slice(0, 40);

    // Compute sentiment statistics
    const bullishCount = finalItems.filter(i => i.sentiment === "Bullish").length;
    const bearishCount = finalItems.filter(i => i.sentiment === "Bearish").length;
    const totalCount = finalItems.length || 1;

    const bullishPct = Math.round((bullishCount / totalCount) * 100);
    const bearishPct = Math.round((bearishCount / totalCount) * 100);
    const neutralPct = 100 - bullishPct - bearishPct;

    // AI Executive Market Briefing
    const topHeadlines = finalItems.slice(0, 8).map(i => `• ${i.headline} (${i.source})`).join("\n");
    let executiveBrief = {
        headline: "Global Central Bank Easing Expectations Anchor Risk Appetite",
        takeaways: [
            "Interest rate repricing across G7 central banks continues to dictate cross-asset capital allocation.",
            "Equity indices and precious metals see sustained structural bids amid softening sovereign bond yields.",
            "Traders maintain cautious risk exposure ahead of key incoming macroeconomic data releases.",
        ],
        risk_tone: (bullishPct >= 50 ? "Risk-On" : bearishPct >= 45 ? "Risk-Off" : "Mixed/Cautious") as "Risk-On" | "Risk-Off" | "Mixed/Cautious",
        market_bias: bullishPct >= 50 ? "Bullish Risk Continuation" : bearishPct >= 45 ? "Defensive Capital Preservation" : "Selective Tactical Alpha",
    };

    try {
        const prompt = `Analyze these top financial market headlines from today:
${topHeadlines}

Return a valid JSON object strictly matching this format:
{
    "headline": string, // High-impact 1-sentence institutional market summary title
    "takeaways": string[], // Exactly 3 crisp, analytical macro takeaways for professional traders
    "risk_tone": "Risk-On" | "Risk-Off" | "Mixed/Cautious",
    "market_bias": string // e.g. "Bullish Growth Momentum" or "Defensive Yield Seeking"
}
Return ONLY raw JSON.`;

        const aiRes = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });

        if (aiRes && aiRes.text) {
            executiveBrief = JSON.parse(aiRes.text);
        }
    } catch (e) {
        console.warn("AI Executive Brief synthesis fallback utilized:", e);
    }

    const payload: NewsPulseResponse = {
        items: finalItems,
        executive_brief: executiveBrief,
        sentiment_stats: {
            bullish_pct: bullishPct,
            bearish_pct: bearishPct,
            neutral_pct: neutralPct,
            total_analyzed: finalItems.length,
        },
    };

    return NextResponse.json(payload);
}
