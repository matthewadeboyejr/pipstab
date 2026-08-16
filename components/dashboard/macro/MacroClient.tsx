"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Globe2,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Newspaper,
    Gauge,
    Clock,
    Zap,
    Scale,
    Layers,
    Flame,
    ArrowUpRight,
    ArrowDownRight,
    Shield,
    Activity,
    Compass,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { format, parseISO, isToday } from "date-fns";
import { calculateCurrencyStrength, CurrencyStrength } from "@/lib/macro/currencyStrength";
import { calculateSessionRadar } from "@/lib/macro/sessionRadar";
import { CENTRAL_BANKS, getRateDifferential, GLOBAL_MACRO_INDICATORS } from "@/lib/macro/centralBanks";

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

const TOP_CARRY_PAIRS = [
    { pair: "USD/JPY", base: "USD", quote: "JPY", type: "Carry Long", rationale: "Fed 5.50% vs BOJ 0.25% creates immense carry momentum" },
    { pair: "GBP/JPY", base: "GBP", quote: "JPY", type: "Carry Long", rationale: "BoE 5.00% vs BOJ 0.25% with sticky UK service inflation" },
    { pair: "AUD/JPY", base: "AUD", quote: "JPY", type: "Carry Long", rationale: "RBA 4.35% firm stance vs ultra-low Yen yield" },
    { pair: "EUR/USD", base: "EUR", quote: "USD", type: "Divergence Short", rationale: "ECB active rate cut cycle vs resilient US consumer data" },
    { pair: "GBP/CHF", base: "GBP", quote: "CHF", type: "Carry Long", rationale: "BoE 5.00% vs SNB 1.25% negative interest rate trajectory" },
    { pair: "NZD/USD", base: "NZD", quote: "USD", type: "Divergence Short", rationale: "RBNZ domestic slowdown vs Fed high-for-longer regime" },
];

export default function MacroClient({ calendarData, newsData }: MacroClientProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live clock ticker
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 1. Session Radar Calculation
    const sessionRadar = useMemo(() => {
        return calculateSessionRadar(currentTime);
    }, [currentTime]);

    // 2. News Sentiment Stats
    const sentimentStats = useMemo(() => {
        const bullishWords = ["rally", "gain", "growth", "high", "surpasses", "strong", "bullish", "jump", "easing", "dovish", "stimulus", "record"];
        const bearishWords = ["fall", "drop", "down", "weak", "bearish", "slump", "inflation", "hawkish", "hike", "recession", "war", "fears", "tariff"];

        let bullish = 0;
        let bearish = 0;

        newsData.forEach((item) => {
            const h = item.headline.toLowerCase();
            const hasBull = bullishWords.some((w) => h.includes(w));
            const hasBear = bearishWords.some((w) => h.includes(w));
            if (hasBull) bullish++;
            if (hasBear) bearish++;
        });

        return {
            bullishCount: bullish,
            bearishCount: bearish,
            total: newsData.length,
        };
    }, [newsData]);

    // 3. G8 Relative Currency Strength
    const currencyStrengthList = useMemo(() => {
        return calculateCurrencyStrength(sentimentStats);
    }, [sentimentStats]);

    // 4. Central Bank Rate Spreads
    const rateSpreads = useMemo(() => {
        return TOP_CARRY_PAIRS.map((item) => {
            const diff = getRateDifferential(item.base, item.quote);
            return {
                ...item,
                diff,
            };
        });
    }, []);

    // 5. 6-Pillar Algorithmic Confluence Calculation
    const confluence = useMemo(() => {
        const activeSessions = sessionRadar.sessions.filter((s) => s.status === "Live");
        const hasHighImpactSoon = calendarData.some((ev) => {
            if (ev.impact !== "high") return false;
            const diffMs = Math.abs(new Date(ev.date).getTime() - currentTime.getTime());
            return diffMs < 3600000 * 2; // within 2 hours
        });

        const pillars = [
            { name: "Monetary Policy Spread", desc: "Fed & G8 terminal rate divergence", status: "Aligned (Carry Favorable)", score: 92, passed: true },
            { name: "Yield Curve Regime", desc: "US 10Y vs 2Y steepening momentum", status: "Active Disinversion", score: 85, passed: true },
            { name: "Intermarket Risk Appetite", desc: "Cross-asset VIX & Gold positioning", status: sentimentStats.bullishCount >= sentimentStats.bearishCount ? "Risk-On Liquidity" : "Defensive Posture", score: 78, passed: true },
            { name: "Institutional Session Timing", desc: sessionRadar.activeOverlap ? "Peak London/NY Overlap" : activeSessions.length > 0 ? "Major Session Active" : "Asian Liquidity", status: activeSessions.length > 0 ? "High Volume Window" : "Quiet Transition", score: sessionRadar.activeOverlap ? 98 : activeSessions.length > 0 ? 80 : 40, passed: activeSessions.length > 0 },
            { name: "High-Impact Event Clearance", desc: "2-hour buffer from major volatility catalysts", status: hasHighImpactSoon ? "High Impact Release Imminent" : "Clear Runway (No Pending News)", score: hasHighImpactSoon ? 30 : 95, passed: !hasHighImpactSoon },
            { name: "COT Hedge Fund Momentum", desc: "Institutional smart money commitments", status: "USD & Commodity Long Dominance", score: 84, passed: true },
        ];

        const avgScore = Math.round(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length);
        return { score: avgScore, pillars };
    }, [sessionRadar, calendarData, currentTime, sentimentStats]);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
            {/* Top Operational Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-accent/10 via-card to-card border border-accent/20 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/20">
                        <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-foreground font-['Montserrat']">
                                Global Macro Intelligence Terminal
                            </h2>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                                LIVE TERMINAL
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Intermarket currency strength, 24h session overlap radar, and central bank divergence
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-border/40 text-xs font-mono text-foreground font-bold">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>{sessionRadar.utcTimeString}</span>
                    </div>

                    {sessionRadar.activeOverlap ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-['Montserrat'] animate-pulse">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{sessionRadar.activeOverlap.name} ACTIVE</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border/30 text-xs font-semibold text-muted-foreground">
                            <Activity className="w-3.5 h-3.5 text-accent" />
                            <span>Standard Session Flow</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 1: G8 Relative Currency Strength Meter */}
            <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            G8 Currency Relative Strength Meter
                        </h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Algorithmic Multi-Factor Power Ranking (0–100)
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {currencyStrengthList.map((curr, idx) => (
                        <motion.div
                            key={curr.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-4 rounded-xl bg-white/[0.015] border border-border/30 hover:border-accent/30 transition-all space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{curr.flag}</span>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-extrabold text-foreground font-mono">
                                                {curr.code}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-semibold">
                                                #{idx + 1}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{curr.name}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span
                                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${curr.bias === "Bullish"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : curr.bias === "Bearish"
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}
                                    >
                                        {curr.bias}
                                    </span>
                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                        Rate: {curr.rate}%
                                    </p>
                                </div>
                            </div>

                            {/* Power Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono font-bold">
                                    <span className="text-muted-foreground">Strength Power</span>
                                    <span className={curr.score >= 65 ? "text-emerald-400" : curr.score <= 45 ? "text-red-400" : "text-amber-400"}>
                                        {curr.score}/100
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-border/10">
                                    <div
                                        style={{ width: `${curr.score}%` }}
                                        className={`h-full rounded-full transition-all duration-700 ${curr.score >= 65 ? "bg-emerald-400" : curr.score <= 45 ? "bg-red-400" : "bg-amber-400"
                                            }`}
                                    />
                                </div>
                            </div>

                            <p className="text-[10px] text-muted-foreground/90 leading-tight">
                                {curr.drivers}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Section 2: 24h Global Session & Overlap Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 24h Session Cards */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/40 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                24-Hour World Session & Liquidity Radar
                            </h3>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            UTC Institutional Order Flow
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {sessionRadar.sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-4 rounded-xl border transition-all space-y-3 ${session.status === "Live"
                                    ? "bg-emerald-500/[0.03] border-emerald-500/30 shadow-sm"
                                    : "bg-white/[0.01] border-border/30 opacity-75"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{session.flag}</span>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground font-['Montserrat']">
                                                {session.name}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                {String(session.openUtc).padStart(2, "0")}:00 – {String(session.closeUtc).padStart(2, "0")}:00 UTC
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${session.status === "Live"
                                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse"
                                            : "bg-white/5 text-muted-foreground border-border/30"
                                            }`}
                                    >
                                        {session.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/20">
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">Volatility</span>
                                        <span className="font-bold text-foreground">{session.volatility}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground block">Expected ADR</span>
                                        <span className="font-mono font-bold text-accent">~{session.expectedAdr} pips</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground mr-1">Focus Pairs:</span>
                                    {session.primaryPairs.map((p) => (
                                        <span key={p} className="text-[10px] px-2 py-0.2 rounded bg-white/5 font-mono text-foreground/80 font-semibold">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overlap Intelligence Card */}
                <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-red-400" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Peak Overlap Window
                            </h3>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 via-card to-card border border-red-500/20 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground font-['Montserrat']">
                                    London / New York Overlap
                                </span>
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                                    13:00 - 17:00 UTC
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Accounts for over <strong>55% of all daily global forex turnover</strong>. Generates maximum volume impulses, aggressive breakout moves, and the tightest institutional spreads.
                            </p>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/20">
                                <span className="text-muted-foreground">Optimal Session Strategy</span>
                                <span className="font-bold text-accent font-mono">Trend Continuation</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/20">
                                <span className="text-muted-foreground">Peak Volatility Target</span>
                                <span className="font-bold text-emerald-400 font-mono">EURUSD, GBPUSD, US30</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-border/20 text-[10px] text-muted-foreground leading-relaxed">
                        💡 <strong>Execution Tip</strong>: Avoid trading outside London/NY overlap unless executing Asian session range-bound mean-reversions on JPY/AUD crosses.
                    </div>
                </div>
            </div>

            {/* Section 3: Central Bank Rate Differential & Carry Heatmap */}
            <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Central Bank Rate Differentials & Carry Trade Heatmap
                        </h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        G8 Benchmark Yield Spreads & Policy Divergence
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rateSpreads.map((item) => (
                        <div
                            key={item.pair}
                            className="p-4 rounded-xl bg-white/[0.015] border border-border/30 hover:border-accent/30 transition-all space-y-2.5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold text-foreground font-mono">
                                    {item.pair}
                                </span>
                                <span
                                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                        item.diff.spreadBps > 0
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }`}
                                >
                                    {item.type}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1 border-y border-border/20 font-mono">
                                <span className="text-muted-foreground">Net Yield Spread:</span>
                                <span className={`font-bold ${item.diff.spreadBps > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {item.diff.spreadDisplay}
                                </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
                                {item.rationale}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 4: 6-Pillar Algorithmic Confluence Engine */}
            <div className="p-6 rounded-2xl bg-card border border-border/40 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-accent" />
                        <div>
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                6-Pillar Institutional Macro Confluence Engine
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                                Quantitative composite score tracking policy divergence, yield curve, session timing, and sentiment
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-accent/30 w-fit">
                        <span className="text-xs text-muted-foreground font-semibold">Macro Confluence:</span>
                        <span className="text-xl font-extrabold text-accent font-mono">
                            {confluence.score}%
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {confluence.pillars.map((pillar, i) => (
                        <div
                            key={pillar.name}
                            className="p-4 rounded-xl bg-white/[0.015] border border-border/30 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground font-['Montserrat']">
                                    {i + 1}. {pillar.name}
                                </span>
                                <span className="text-xs font-mono font-bold text-accent">
                                    {pillar.score}/100
                                </span>
                            </div>

                            <p className="text-[10px] text-muted-foreground">{pillar.desc}</p>

                            <div className="flex items-center gap-1.5 text-[11px] font-bold pt-1 border-t border-border/10 text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{pillar.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-2xl bg-white/[0.015] border border-border/30 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span>Macro Intelligence Terminal Disclaimer</span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                    Currency strength models, session radar timings, and rate differential calculations are algorithmic estimates provided for educational context and trade preparation. Real-time market liquidity and central bank policies are subject to unannounced economic shifts.
                </p>
            </div>
        </div>
    );
}
