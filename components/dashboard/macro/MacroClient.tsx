"use client";

import { motion } from "framer-motion";
import {
    Globe2,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Newspaper,
    Gauge,
    Clock,
    ExternalLink,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format, isFuture, isPast, isToday, parseISO } from "date-fns";

interface CalendarEvent {
    title: string;
    country: string;
    date: string;
    impact: string;
    forecast: string;
    previous: string;
}

interface NewsItem {
    headline: string;
    link: string;
    pubDate: string;
    source: string;
}

interface MacroClientProps {
    calendarData: CalendarEvent[];
    newsData: NewsItem[];
}

const impactColors: Record<string, string> = { 
    high: "text-red-400 bg-red-400/10", 
    medium: "text-amber-400 bg-amber-400/10", 
    low: "text-blue-400 bg-blue-400/10" 
};

// --- Sentiment Keywords ---
const BULLISH_KEYWORDS = ["rally", "gain", "up", "growth", "high", "surpasses", "strong", "bullish", "jump", "cut", "easing", "dovish"];
const BEARISH_KEYWORDS = ["fall", "drop", "down", "low", "weak", "bearish", "slump", "inflation", "hawkish", "hike", "recession", "war", "fears"];

export default function MacroClient({ calendarData, newsData }: MacroClientProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- News Sentiment Algorithm ---
    const analyzedNews = useMemo(() => {
        return newsData.map(item => {
            const headline = item.headline.toLowerCase();
            let score = 0;
            
            BULLISH_KEYWORDS.forEach(kw => { if (headline.includes(kw)) score++; });
            BEARISH_KEYWORDS.forEach(kw => { if (headline.includes(kw)) score--; });

            const sentiment = score > 0 ? "bullish" : score < 0 ? "bearish" : "neutral";
            return { ...item, sentiment };
        });
    }, [newsData]);

    // --- Session Detection Algorithm ---
    // Session times in UTC (simplified for UI)
    const sessions = useMemo(() => {
        const hour = currentTime.getUTCHours();
        
        const isTokyo = hour >= 0 && hour < 9;
        const isLondon = hour >= 8 && hour < 17;
        const isNewYork = hour >= 13 && hour < 22;

        return [
            { 
                session: "London", 
                status: isLondon ? "Live" : "Upcoming", 
                bias: "Neutral", 
                dir: "neutral" as const, 
                sentiment: 50, 
                levels: ["1.0920 (R)", "1.0850 (S)"], 
                pairs: ["EUR/USD", "GBP/USD"] 
            },
            { 
                session: "New York", 
                status: isNewYork ? "Live" : "Upcoming", 
                bias: "Neutral", 
                dir: "neutral" as const, 
                sentiment: 50, 
                levels: ["151.20 (R)", "149.80 (S)"], 
                pairs: ["USD/JPY", "USD/CAD"] 
            },
            { 
                session: "Tokyo", 
                status: isTokyo ? "Live" : "Closed", 
                bias: "Neutral", 
                dir: "neutral" as const, 
                sentiment: 50, 
                levels: ["0.6520 (R)", "0.6480 (S)"], 
                pairs: ["AUD/USD", "NZD/USD"] 
            },
        ];
    }, [currentTime]);

    // --- Confluence Meter Calculation ---
    const confluenceStats = useMemo(() => {
        const factors = [
            { factor: "Session Active", aligned: sessions.some(s => s.status === "Live") },
            { factor: "High Impact News Clear", aligned: !calendarData.some(ev => 
                ev.impact === "high" && 
                isToday(parseISO(ev.date)) && 
                Math.abs(new Date(ev.date).getTime() - currentTime.getTime()) < 3600000 * 2 // within 2 hours
            )},
            { factor: "Sentiment Polarity", aligned: analyzedNews.filter(n => n.sentiment !== "neutral").length > 5 },
            { factor: "Bullish Dominance", aligned: analyzedNews.filter(n => n.sentiment === "bullish").length > analyzedNews.filter(n => n.sentiment === "bearish").length },
            { factor: "Calendar Liquidity", aligned: calendarData.length > 3 },
        ];

        const alignedCount = factors.filter(f => f.aligned).length;
        const score = Math.round((alignedCount / factors.length) * 100);

        return { score, factors };
    }, [calendarData, sessions, analyzedNews, currentTime]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Confluence Meter */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Gauge className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Algorithmic Confluence</h3>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-[140px] h-[140px]">
                            <svg viewBox="0 0 140 140" className="-rotate-90 w-full h-full">
                                <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                <motion.circle 
                                    cx="70" cy="70" r="55" 
                                    fill="none" 
                                    stroke={confluenceStats.score >= 70 ? "#34d399" : confluenceStats.score >= 40 ? "#facc15" : "#f87171"} 
                                    strokeWidth="10" 
                                    strokeLinecap="round" 
                                    strokeDasharray={2 * Math.PI * 55} 
                                    initial={{ strokeDashoffset: 2 * Math.PI * 55 }} 
                                    animate={{ strokeDashoffset: (1 - confluenceStats.score / 100) * 2 * Math.PI * 55 }} 
                                    transition={{ duration: 1.5, ease: "easeOut" }} 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-foreground font-['Montserrat']">{confluenceStats.score}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Score</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {confluenceStats.factors.map((f, i) => (
                            <motion.div key={f.factor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                                <span className="text-[11px] text-muted-foreground">{f.factor}</span>
                                <span className={`text-[11px] font-bold ${f.aligned ? "text-emerald-400" : "text-red-400"}`}>
                                    {f.aligned ? "SURE" : "AVOID"}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Economic Calendar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">This Week's High Impact Events</h3>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Live Feed — ForexFactory</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-border/30">
                                {["Time", "Event", "Cur.", "Impact", "Forecast", "Prev."].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {calendarData.length > 0 ? (
                                    calendarData.slice(0, 10).map((ev, i) => {
                                        const eventDate = parseISO(ev.date);
                                        return (
                                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="border-b border-border/20 last:border-0 hover:bg-white/2 transition-colors group">
                                                <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                                    <div className="flex flex-col">
                                                        <span className="text-foreground group-hover:text-accent font-medium">{format(eventDate, "HH:mm")}</span>
                                                        <span className="text-[10px] opacity-70">{format(eventDate, "EEE d")}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-medium text-foreground max-w-[200px] truncate">{ev.title}</td>
                                                <td className="px-5 py-3.5"><span className="text-xs font-bold text-accent">{ev.country}</span></td>
                                                <td className="px-5 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${impactColors[ev.impact] || "bg-white/10"}`}>{ev.impact}</span></td>
                                                <td className="px-5 py-3.5 text-[11px] text-foreground font-mono">{ev.forecast}</td>
                                                <td className="px-5 py-3.5 text-[11px] text-muted-foreground font-mono">{ev.previous}</td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={6} className="px-5 py-10 text-center text-xs text-muted-foreground">No events found for this week.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Session Bias Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessions.map((s, i) => (
                    <motion.div key={s.session} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-2xl bg-card border border-border/50 p-5 hover:border-accent/20 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-accent" /><h4 className="text-sm font-semibold text-foreground font-['Montserrat']">{s.session}</h4></div>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${s.status === "Live" ? "text-emerald-400 bg-emerald-400/10 animate-pulse border border-emerald-400/20" : "text-muted-foreground bg-white/5 border border-white/5"}`}>{s.status}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            {s.status === "Live" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                            <span className={`text-sm font-bold ${s.status === "Live" ? "text-emerald-400" : "text-muted-foreground"}`}>{s.status === "Live" ? "VOLATILE" : "QUIET"}</span>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider"><span>Inactivity</span><span>Hot</span></div>
                            <div className="h-2 bg-white/3 rounded-full overflow-hidden border border-border/10">
                                <motion.div className={`h-full rounded-full bg-accent/60`} initial={{ width: 0 }} animate={{ width: s.status === "Live" ? "90%" : "15%" }} transition={{ duration: 1.5, delay: 0.5 }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1 opacity-50">Volume Focus</p>
                            {s.pairs.map((p) => (<span key={p} className="inline-block text-[11px] px-2 py-1 rounded-md bg-white/5 text-foreground/70 font-mono mr-2">{p}</span>))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* News Feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Live Market Intelligence</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] text-muted-foreground font-bold uppercase">Bullish</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[10px] text-muted-foreground font-bold uppercase">Bearish</span></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyzedNews.slice(0, 10).map((n, i) => (
                        <motion.a 
                            key={i} 
                            href={n.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: 0.5 + i * 0.05 }} 
                            className="flex items-start gap-4 p-4 rounded-xl bg-white/1 border border-border/20 hover:bg-white/4 hover:border-accent/30 transition-all cursor-pointer group"
                        >
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 shadow-[0_0_8px] ${n.sentiment === "bullish" ? "bg-emerald-400 shadow-emerald-400/50" : n.sentiment === "bearish" ? "bg-red-400 shadow-red-400/50" : "bg-white/20 shadow-white/10"}`} />
                            <div className="flex-1">
                                <p className="text-sm text-foreground/90 leading-snug group-hover:text-foreground transition-colors font-medium">{n.headline}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[10px] text-accent font-bold uppercase tracking-widest">{n.source}</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(n.pubDate), "HH:mm")}</span>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
