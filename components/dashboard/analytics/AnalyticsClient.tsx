"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Target,
    Lightbulb,
    BarChart3,
    DollarSign,
} from "lucide-react";
import { useMemo } from "react";

interface AnalyticsClientProps {
    trades: any[];
}

const severityColors: Record<string, string> = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10",
};

export default function AnalyticsClient({ trades }: AnalyticsClientProps) {
    
    // --- Data Aggregation Engine ---
    const stats = useMemo(() => {
        if (!trades || trades.length === 0) return null;

        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => t.raw_pnl > 0);
        const losingTrades = trades.filter(t => t.raw_pnl < 0);
        
        const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : "0.0";
        
        const grossProfit = winningTrades.reduce((sum, t) => sum + t.raw_pnl, 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.raw_pnl, 0));
        const netPnl = grossProfit - grossLoss;
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? "Infinite" : "0.00";

        // Performance by Setup
        const setupStats: Record<string, { wins: number, total: number, pnl: number }> = {};
        trades.forEach(t => {
            const setupName = t.setup || "None";
            if (!setupStats[setupName]) setupStats[setupName] = { wins: 0, total: 0, pnl: 0 };
            setupStats[setupName].total += 1;
            setupStats[setupName].pnl += t.raw_pnl;
            if (t.raw_pnl > 0) setupStats[setupName].wins += 1;
        });

        const edgeBySetup = Object.entries(setupStats).map(([setup, data]) => ({
            setup,
            rate: Math.round((data.wins / data.total) * 100),
            trades: data.total,
            pnl: data.pnl
        })).sort((a, b) => b.rate - a.rate); // Highest win rate first

        // Alpha Leakage (Trades where at least one checklist rule was false)
        let totalLeakageAmount = 0;
        const ruleViolations: any[] = [];
        
        trades.forEach(t => {
            if (!t.checklist_results) return;
            const brokenRules = Object.entries(t.checklist_results).filter(([_, passed]) => !passed);
            
            if (brokenRules.length > 0) {
                // If it's a losing trade where rules were broken, we consider it leakage.
                if (t.raw_pnl < 0) {
                    totalLeakageAmount += Math.abs(t.raw_pnl);
                }

                brokenRules.forEach(([ruleName]) => {
                    ruleViolations.push({
                        id: `${t.id}-${ruleName}`,
                        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        pair: t.pair,
                        rule: ruleName,
                        severity: t.raw_pnl < 0 ? "high" : "low", // Broken rule + loss = high severity
                        pnlLost: t.raw_pnl < 0 ? Math.abs(t.raw_pnl) : 0
                    });
                });
            }
        });

        // Leakage Sources (Group by Rule)
        const leakageGrouped: Record<string, number> = {};
        ruleViolations.forEach(v => {
            if (v.pnlLost > 0) {
                if (!leakageGrouped[v.rule]) leakageGrouped[v.rule] = 0;
                leakageGrouped[v.rule] += v.pnlLost;
            }
        });

        const leakageSources = Object.entries(leakageGrouped)
            .map(([label, amount], i) => {
                const colors = ["#f87171", "#fb923c", "#facc15", "#a78bfa", "#60a5fa"];
                return {
                    label,
                    amount,
                    pct: totalLeakageAmount > 0 ? Math.round((amount / totalLeakageAmount) * 100) : 0,
                    color: colors[i % colors.length]
                };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5

        return {
            totalTrades,
            winRate,
            netPnl,
            profitFactor,
            edgeBySetup,
            ruleViolations,
            totalLeakageAmount,
            leakageSources
        };
    }, [trades]);

    if (!stats) {
        return (
            <div className="w-full h-40 flex flex-col items-center justify-center border border-dashed border-border/30 rounded-xl bg-card">
                <BarChart3 className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-foreground font-semibold">Not enough data.</p>
                <p className="text-xs text-muted-foreground mt-1">Log some trades in the Journal to see your analytics.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 max-w-[1400px] mx-auto"
        >
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> Net P&L</span>
                    <span className={`text-2xl font-bold ${stats.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stats.netPnl >= 0 ? "+" : "-"}${Math.abs(stats.netPnl).toFixed(2)}
                    </span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> Win Rate</span>
                    <span className="text-2xl font-bold text-foreground">{stats.winRate}%</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/> Profit Factor</span>
                    <span className="text-2xl font-bold text-foreground">{stats.profitFactor}</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5"/> Total Trades</span>
                    <span className="text-2xl font-bold text-foreground">{stats.totalTrades}</span>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Win Rate by Setup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl bg-card border border-border/50 p-5"
                >
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-accent" />
                            Edge by Setup Type
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">Your statistical edge per trade setup</p>
                    </div>
                    {stats.edgeBySetup.length > 0 ? (
                        <div className="space-y-3">
                            {stats.edgeBySetup.map((s, i) => (
                                <motion.div
                                    key={s.setup}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-32">
                                        <span className="text-xs text-foreground font-medium line-clamp-1">{s.setup}</span>
                                        <span className={`text-[10px] font-semibold ${s.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            {s.pnl >= 0 ? "+" : "-"}${Math.abs(s.pnl).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-8 bg-white/3 rounded-lg overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.rate}%` }}
                                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                            className={`h-full rounded-lg ${s.rate >= 70 ? "bg-emerald-500/40" : s.rate >= 50 ? "bg-accent/30" : "bg-red-500/30"
                                                }`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground">
                                            {s.rate}% <span className="text-muted-foreground font-normal">({s.trades})</span>
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">No setup data logged.</p>
                    )}
                </motion.div>

                {/* Alpha Leakage (Donut) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl bg-card border border-border/50 p-5"
                >
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Alpha Leakage Impact
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-1">Dollar losses purely from broken checklist rules</p>
                    </div>
                    {stats.leakageSources.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Donut chart */}
                            <div className="relative w-[180px] h-[180px] shrink-0">
                                <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                                    {(() => {
                                        let offset = 0;
                                        const radius = 70;
                                        const circumference = 2 * Math.PI * radius;
                                        return stats.leakageSources.map((source, i) => {
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
                                    <span className="text-2xl font-bold text-red-400 font-['Montserrat']">-${stats.totalLeakageAmount.toFixed(0)}</span>
                                    <span className="text-[10px] text-muted-foreground">Total Leaked</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                {stats.leakageSources.map((source, i) => (
                                    <motion.div
                                        key={source.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-border/30 hover:bg-white/4 transition-colors"
                                    >
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-foreground truncate">{source.label}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-red-400">-${source.amount.toFixed(0)}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-[180px] flex items-center justify-center">
                            <p className="text-sm font-semibold text-emerald-400">Zero Alpha Leakage found! You are following all your rules.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Rule Violations Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-card border border-border/50 overflow-hidden"
            >
                <div className="px-5 py-4 border-b border-border/50">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        Rule Violations Log
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Specific occurrences of indiscipline</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/30">
                                {["Date", "Pair", "Rule Broken", "PnL Impact", "Severity"].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.ruleViolations.length > 0 ? (
                                stats.ruleViolations.map((v, i) => (
                                    <motion.tr
                                        key={v.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 + i * 0.05 }}
                                        className="border-b border-border/20 last:border-0 hover:bg-white/2 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{v.date}</td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{v.pair}</td>
                                        <td className="px-5 py-3.5 text-sm text-foreground/80 line-through decoration-red-500/50">{v.rule}</td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-red-400">
                                            {v.pnlLost > 0 ? `-$${v.pnlLost.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[11px] font-medium px-2 py-1 rounded-full capitalize ${severityColors[v.severity]}`}>
                                                {v.severity}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-6 text-center text-xs text-muted-foreground">
                                        No violations recorded yet. Good job remaining disciplined!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
