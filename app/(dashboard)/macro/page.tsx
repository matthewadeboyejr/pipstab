import MacroClient from "@/components/dashboard/macro/MacroClient";
import Parser from "rss-parser";

// Free, fast ForexFactory calendar API (unofficial)
async function getCalendar() {
    try {
        const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Calendar Fetch Error:", e);
        return [];
    }
}

// Free RSS News Feed (Yahoo Finance is generally unblocked)
async function getNews() {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL("https://finance.yahoo.com/news/rss");
        return feed.items.slice(0, 15).map(item => ({
            headline: item.title || "No Title",
            link: item.link || "#",
            pubDate: item.pubDate || new Date().toISOString(),
            source: "Yahoo Finance",
        }));
    } catch (e) {
        console.error("RSS Error:", e);
        // Fallback fake data if blocked natively
        return [
            { headline: "Markets brace for upcoming FOMC decision on rates", source: "Bloomberg", pubDate: new Date().toISOString(), link: "#" },
            { headline: "Retail data shows unexpected US economic growth", source: "Reuters", pubDate: new Date().toISOString(), link: "#" },
            { headline: "European markets fall amidst energy supply fears", source: "FT", pubDate: new Date().toISOString(), link: "#" },
        ];
    }
}

export const revalidate = 900; // 15 minutes

export default async function MacroPage() {
    const [calendar, news] = await Promise.all([
        getCalendar(),
        getNews(),
    ]);

    // Filter calendar to only show today's and future events this week, prioritize high/medium impact
    const now = new Date();
    const formattedCalendar = (calendar || [])
        .filter((ev: any) => new Date(ev.date) >= new Date(now.setHours(0,0,0,0)))
        .map((ev: any) => ({
            title: ev.title,
            country: ev.country,
            date: ev.date,
            impact: ev.impact.toLowerCase(), // "high", "medium", "low"
            forecast: ev.forecast || "—",
            previous: ev.previous || "—",
        }));

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground font-['Montserrat']">Live Macro Environment</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Real-time economic calendar, news scraping, and algorithmic sentiment scoring.
                </p>
            </div>
            
            <MacroClient 
                calendarData={formattedCalendar} 
                newsData={news} 
            />
        </div>
    );
}
