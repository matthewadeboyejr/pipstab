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
} from "lucide-react";

const upcomingEvents = [
    { time: "08:30", event: "US Non-Farm Payrolls", impact: "high", currency: "USD", forecast: "185K", previous: "227K" },
    { time: "10:00", event: "ISM Manufacturing PMI", impact: "high", currency: "USD", forecast: "49.5", previous: "49.3" },
    { time: "13:00", event: "FOMC Member Speaks", impact: "medium", currency: "USD", forecast: "—", previous: "—" },
    { time: "15:30", event: "ECB Rate Decision", impact: "high", currency: "EUR", forecast: "2.65%", previous: "2.90%" },
    { time: "19:00", event: "BOC Rate Statement", impact: "medium", currency: "CAD", forecast: "—", previous: "—" },
];

const sessionBias = [
    { session: "London", status: "Live", bias: "Bullish", dir: "up" as const, sentiment: 72, levels: ["1.0880 (R)", "1.0845 (S)"], pairs: ["EUR/USD", "GBP/USD"] },
    { session: "New York", status: "Upcoming", bias: "Bearish", dir: "down" as const, sentiment: 38, levels: ["150.80 (R)", "149.50 (S)"], pairs: ["USD/JPY", "USD/CAD"] },
    { session: "Tokyo", status: "Closed", bias: "Neutral", dir: "neutral" as const, sentiment: 50, levels: ["0.6440 (R)", "0.6400 (S)"], pairs: ["AUD/USD", "NZD/USD"] },
];

const confluenceFactors = [
    { factor: "Trend Direction", aligned: true },
    { factor: "Session Bias", aligned: true },
    { factor: "Key Level Proximity", aligned: true },
    { factor: "News Calendar Clear", aligned: false },
    { factor: "DXY Alignment", aligned: true },
    { factor: "Sentiment Divergence", aligned: false },
];

const newsItems = [
    { time: "14:32", headline: "Fed Chair Powell signals patience on rate cuts amid persistent inflation", source: "Reuters", sentiment: "bearish" },
    { time: "13:15", headline: "EUR/USD rallies as ECB hints at slower easing pace", source: "Bloomberg", sentiment: "bullish" },
    { time: "12:00", headline: "Gold hits new highs as geopolitical tensions escalate", source: "CNBC", sentiment: "bullish" },
    { time: "10:45", headline: "UK GDP grows 0.3% in Q4, beating expectations", source: "FT", sentiment: "bullish" },
];

const impactColors: Record<string, string> = { high: "text-red-400 bg-red-400/10", medium: "text-amber-400 bg-amber-400/10", low: "text-blue-400 bg-blue-400/10" };

export default function MacroPage() {
    const aligned = confluenceFactors.filter((f) => f.aligned).length;
    const score = Math.round((aligned / confluenceFactors.length) * 100);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Confluence Meter */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Gauge className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Confluence Meter</h3>
                    </div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-[140px] h-[140px]">
                            <svg viewBox="0 0 140 140" className="-rotate-90">
                                <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                <motion.circle cx="70" cy="70" r="55" fill="none" stroke={score >= 70 ? "#34d399" : score >= 40 ? "#facc15" : "#f87171"} strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 55} initial={{ strokeDashoffset: 2 * Math.PI * 55 }} animate={{ strokeDashoffset: (1 - score / 100) * 2 * Math.PI * 55 }} transition={{ duration: 1.5, ease: "easeOut" }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-foreground font-['Montserrat']">{score}%</span>
                                <span className="text-[10px] text-muted-foreground">Confluence</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {confluenceFactors.map((f, i) => (
                            <motion.div key={f.factor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between py-1.5">
                                <span className="text-xs text-muted-foreground">{f.factor}</span>
                                <span className={`text-xs font-semibold ${f.aligned ? "text-emerald-400" : "text-red-400"}`}>{f.aligned ? "✓ Aligned" : "✗ Misaligned"}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Economic Calendar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl bg-card border border-border/50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Economic Calendar</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-border/30">
                                {["Time", "Event", "Currency", "Impact", "Forecast", "Previous"].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {upcomingEvents.map((ev, i) => (
                                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="border-b border-border/20 last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" />{ev.time}</td>
                                        <td className="px-5 py-3.5 text-sm text-foreground">{ev.event}</td>
                                        <td className="px-5 py-3.5"><span className="text-xs font-semibold text-accent">{ev.currency}</span></td>
                                        <td className="px-5 py-3.5"><span className={`text-[11px] font-medium px-2 py-1 rounded-full capitalize ${impactColors[ev.impact]}`}>{ev.impact}</span></td>
                                        <td className="px-5 py-3.5 text-sm text-foreground">{ev.forecast}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{ev.previous}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Session Bias Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessionBias.map((s, i) => (
                    <motion.div key={s.session} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-2xl bg-card border border-border/50 p-5 hover:border-accent/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-accent" /><h4 className="text-sm font-semibold text-foreground font-['Montserrat']">{s.session}</h4></div>
                            <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${s.status === "Live" ? "text-emerald-400 bg-emerald-400/10 animate-pulse" : s.status === "Upcoming" ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground bg-white/5"}`}>{s.status}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            {s.dir === "up" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : s.dir === "down" ? <TrendingDown className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                            <span className={`text-sm font-semibold ${s.dir === "up" ? "text-emerald-400" : s.dir === "down" ? "text-red-400" : "text-muted-foreground"}`}>{s.bias}</span>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Bearish</span><span>Bullish</span></div>
                            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
                                <motion.div className={`h-full rounded-full ${s.sentiment >= 60 ? "bg-emerald-500/60" : s.sentiment <= 40 ? "bg-red-500/60" : "bg-accent/40"}`} initial={{ width: 0 }} animate={{ width: `${s.sentiment}%` }} transition={{ duration: 1, delay: 0.5 }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {s.levels.map((l) => (<p key={l} className="text-[11px] text-muted-foreground font-mono">{l}</p>))}
                        </div>
                        <div className="flex gap-2 mt-3">
                            {s.pairs.map((p) => (<span key={p} className="text-[11px] px-2 py-1 rounded-md bg-white/5 text-foreground/70 font-mono">{p}</span>))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* News Feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl bg-card border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4"><Newspaper className="w-4 h-4 text-accent" /><h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Market News</h3></div>
                <div className="space-y-3">
                    {newsItems.map((n, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${n.sentiment === "bullish" ? "bg-emerald-400" : "bg-red-400"}`} />
                            <div className="flex-1">
                                <p className="text-sm text-foreground leading-relaxed">{n.headline}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                    <span className="text-[10px] text-accent">{n.source}</span>
                                    <span className={`text-[10px] font-medium capitalize ${n.sentiment === "bullish" ? "text-emerald-400" : "text-red-400"}`}>{n.sentiment}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
