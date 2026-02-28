"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Target,
    Lightbulb,
} from "lucide-react";

// ─── Mock chart data ────────────────────────────────────────
const winRateByDay = [
    { day: "Mon", rate: 58 },
    { day: "Tue", rate: 73 },
    { day: "Wed", rate: 55 },
    { day: "Thu", rate: 62 },
    { day: "Fri", rate: 48 },
];

const winRateBySetup = [
    { setup: "OB + FVG", rate: 78, trades: 50 },
    { setup: "BOS + Inducement", rate: 62, trades: 35 },
    { setup: "HTF OB", rate: 70, trades: 28 },
    { setup: "Liquidity Sweep", rate: 55, trades: 42 },
    { setup: "Supply Zone", rate: 65, trades: 22 },
];

const leakageSources = [
    { label: "Revenge Trading", pct: 35, color: "#f87171" },
    { label: "FOMO Entries", pct: 25, color: "#fb923c" },
    { label: "Oversizing", pct: 18, color: "#facc15" },
    { label: "No Stop Loss", pct: 12, color: "#a78bfa" },
    { label: "Off-Schedule", pct: 10, color: "#60a5fa" },
];

const ruleViolations = [
    { id: "1", date: "Feb 28", pair: "GBP/JPY", rule: "No trading during news", severity: "high" },
    { id: "2", date: "Feb 27", pair: "AUD/USD", rule: "Max 3 trades per day exceeded", severity: "medium" },
    { id: "3", date: "Feb 25", pair: "EUR/USD", rule: "Position size > 2% of account", severity: "high" },
    { id: "4", date: "Feb 24", pair: "USD/CAD", rule: "Trading outside session hours", severity: "low" },
    { id: "5", date: "Feb 23", pair: "XAU/USD", rule: "Re-entry after stop loss hit", severity: "high" },
];

const recommendations = [
    { text: "Avoid trading GBP/JPY during Asian session — your win rate drops to 28% in this combination.", type: "warning" as const },
    { text: "Increase allocation to OB + FVG setups during London Open. This is your highest probability combo.", type: "positive" as const },
    { text: "Implement a mandatory 30-minute cooldown after any losing trade to reduce revenge trading by ~60%.", type: "action" as const },
];

const severityColors: Record<string, string> = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10",
};

export default function AnalyticsPage() {
    const maxRate = Math.max(...winRateByDay.map((d) => d.rate));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-[1400px] mx-auto"
        >
            {/* Edge Profile: Win Rate by Day */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-card border border-border/50 p-5"
                >
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <Target className="w-4 h-4 text-accent" />
                            Win Rate by Day
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">Identify your highest probability trading days</p>
                    </div>
                    <div className="space-y-3">
                        {winRateByDay.map((d, i) => (
                            <motion.div
                                key={d.day}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-xs text-muted-foreground w-8 font-medium">{d.day}</span>
                                <div className="flex-1 h-8 bg-white/[0.03] rounded-lg overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.rate}%` }}
                                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                                        className={`h-full rounded-lg ${d.rate >= 65 ? "bg-emerald-500/40" : d.rate >= 50 ? "bg-accent/30" : "bg-red-500/30"
                                            }`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground">
                                        {d.rate}%
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Win Rate by Setup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-card border border-border/50 p-5"
                >
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-accent" />
                            Edge by Setup Type
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">Your statistical edge per trade setup</p>
                    </div>
                    <div className="space-y-3">
                        {winRateBySetup.map((s, i) => (
                            <motion.div
                                key={s.setup}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-xs text-muted-foreground w-32 font-medium truncate">{s.setup}</span>
                                <div className="flex-1 h-8 bg-white/[0.03] rounded-lg overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.rate}%` }}
                                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                        className={`h-full rounded-lg ${s.rate >= 70 ? "bg-emerald-500/40" : s.rate >= 55 ? "bg-accent/30" : "bg-red-500/30"
                                            }`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground">
                                        {s.rate}% <span className="text-muted-foreground font-normal">({s.trades})</span>
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Leakage Breakdown (Donut) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-card border border-border/50 p-5"
            >
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Alpha Leakage Sources
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Where your edge is being lost</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Donut chart */}
                    <div className="relative w-[180px] h-[180px] shrink-0">
                        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                            {(() => {
                                let offset = 0;
                                const radius = 70;
                                const circumference = 2 * Math.PI * radius;
                                return leakageSources.map((source, i) => {
                                    const dashArray = (source.pct / 100) * circumference;
                                    const dashOffset = -offset;
                                    offset += dashArray;
                                    return (
                                        <motion.circle
                                            key={source.label}
                                            cx="90"
                                            cy="90"
                                            r={radius}
                                            fill="none"
                                            stroke={source.color}
                                            strokeWidth="16"
                                            strokeLinecap="round"
                                            strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                                            strokeDashoffset={dashOffset}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 + i * 0.15 }}
                                        />
                                    );
                                });
                            })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-foreground font-['Montserrat']">32%</span>
                            <span className="text-[10px] text-muted-foreground">Total Leakage</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {leakageSources.map((source, i) => (
                            <motion.div
                                key={source.label}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">{source.label}</p>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{source.pct}%</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Rule Violations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-card border border-border/50 overflow-hidden"
            >
                <div className="px-5 py-4 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        Rule Violations
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Trades that broke your own rules</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/30">
                                {["Date", "Pair", "Rule Violated", "Severity"].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ruleViolations.map((v, i) => (
                                <motion.tr
                                    key={v.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="border-b border-border/20 last:border-0 hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{v.date}</td>
                                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{v.pair}</td>
                                    <td className="px-5 py-3.5 text-sm text-foreground/80">{v.rule}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[11px] font-medium px-2 py-1 rounded-full capitalize ${severityColors[v.severity]}`}>
                                            {v.severity}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-accent" />
                        Prescriptive Recommendations
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">AI-generated actions to reduce Alpha Leakage</p>
                </div>
                <div className="space-y-3">
                    {recommendations.map((rec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className={`p-4 rounded-xl border flex items-start gap-3 ${rec.type === "warning"
                                    ? "bg-amber-400/5 border-amber-400/20"
                                    : rec.type === "positive"
                                        ? "bg-emerald-400/5 border-emerald-400/20"
                                        : "bg-accent/5 border-accent/20"
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${rec.type === "warning"
                                    ? "bg-amber-400/20"
                                    : rec.type === "positive"
                                        ? "bg-emerald-400/20"
                                        : "bg-accent/20"
                                }`}>
                                {rec.type === "warning" ? (
                                    <TrendingDown className="w-3 h-3 text-amber-400" />
                                ) : rec.type === "positive" ? (
                                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <Lightbulb className="w-3 h-3 text-accent" />
                                )}
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{rec.text}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
