"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Target,
    BarChart3,
    DollarSign,
    Layers,
    Scale,
    Flame,
    Zap,
    Calendar,
    Activity,
} from "lucide-react";
import { useAccounts } from "@/context/AccountContext";
import CumulativeEquityChart from "@/components/dashboard/analytics/CumulativeEquityChart";
import SessionEdgeMatrix from "@/components/dashboard/analytics/SessionEdgeMatrix";
import AiEdgeDiagnosticModal from "@/components/dashboard/analytics/AiEdgeDiagnosticModal";

interface AnalyticsClientProps {
    trades: any[];
}

const severityColors: Record<string, string> = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10",
};

export default function AnalyticsClient({ trades }: AnalyticsClientProps) {
    const { activeAccount } = useAccounts();
    const [timeRange, setTimeRange] = useState<"all" | "month" | "week" | "30d" | "90d">("all");

    // Filter trades by active account & time horizon
    const filteredTrades = useMemo(() => {
        let list = trades;

        // Account filter
        if (activeAccount) {
            list = list.filter((t) => t.account_id === activeAccount.id);
        }

        // Time horizon filter
        if (timeRange !== "all") {
            const now = new Date();
            let cutoff = new Date();

            if (timeRange === "week") {
                cutoff.setDate(now.getDate() - 7);
            } else if (timeRange === "month") {
                cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (timeRange === "30d") {
                cutoff.setDate(now.getDate() - 30);
            } else if (timeRange === "90d") {
                cutoff.setDate(now.getDate() - 90);
            }

            list = list.filter((t) => new Date(t.date) >= cutoff);
        }

        return list;
    }, [trades, activeAccount, timeRange]);

    // --- Institutional Data Aggregation Engine ---
    const stats = useMemo(() => {
        if (!filteredTrades || filteredTrades.length === 0) return null;

        const totalTrades = filteredTrades.length;
        const winningTrades = filteredTrades.filter((t) => Number(t.raw_pnl) > 0);
        const losingTrades = filteredTrades.filter((t) => Number(t.raw_pnl) < 0);
        const breakevenTrades = filteredTrades.filter((t) => Number(t.raw_pnl) === 0);

        const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(1) : "0.0";

        const grossProfit = winningTrades.reduce((sum, t) => sum + Number(t.raw_pnl), 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.raw_pnl), 0));
        const netPnl = Number((grossProfit - grossLoss).toFixed(2));
        const profitFactor =
            grossLoss > 0
                ? (grossProfit / grossLoss).toFixed(2)
                : grossProfit > 0
                    ? "Infinite"
                    : "0.00";

        const avgWin = winningTrades.length > 0 ? Number((grossProfit / winningTrades.length).toFixed(2)) : 0;
        const avgLoss = losingTrades.length > 0 ? Number((grossLoss / losingTrades.length).toFixed(2)) : 0;
        const winLossRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : avgWin > 0 ? "Infinite" : "0.00";

        // Mathematical Expectancy per trade: (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
        const winPct = Number(winRate) / 100;
        const lossPct = totalTrades > 0 ? losingTrades.length / totalTrades : 0;
        const expectancy = Number((winPct * avgWin - lossPct * avgLoss).toFixed(2));

        // Streaks and Max Drawdown calculation
        const sorted = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentWinStreak = 0;
        let maxWinStreak = 0;
        let currentLossStreak = 0;
        let maxLossStreak = 0;

        let runningEquity = 0;
        let peakEquity = 0;
        let maxDrawdownDollar = 0;
        let maxDrawdownPct = 0;

        sorted.forEach((t) => {
            const pnl = Number(t.raw_pnl) || 0;

            // Streaks
            if (pnl > 0) {
                currentWinStreak++;
                currentLossStreak = 0;
                if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
            } else if (pnl < 0) {
                currentLossStreak++;
                currentWinStreak = 0;
                if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
            }

            // Drawdown
            runningEquity += pnl;
            if (runningEquity > peakEquity) peakEquity = runningEquity;
            const ddDollar = peakEquity > 0 ? peakEquity - runningEquity : 0;
            const ddPct = peakEquity > 0 ? (ddDollar / peakEquity) * 100 : 0;

            if (ddDollar > maxDrawdownDollar) maxDrawdownDollar = ddDollar;
            if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;
        });

        // Performance by Setup
        const setupStats: Record<string, { wins: number; total: number; pnl: number }> = {};
        filteredTrades.forEach((t) => {
            const setupName = t.setup || "None";
            if (!setupStats[setupName]) setupStats[setupName] = { wins: 0, total: 0, pnl: 0 };
            setupStats[setupName].total += 1;
            setupStats[setupName].pnl += Number(t.raw_pnl);
            if (Number(t.raw_pnl) > 0) setupStats[setupName].wins += 1;
        });

        const edgeBySetup = Object.entries(setupStats)
            .map(([setup, data]) => ({
                setup,
                rate: Math.round((data.wins / data.total) * 100),
                trades: data.total,
                pnl: Number(data.pnl.toFixed(2)),
            }))
            .sort((a, b) => b.rate - a.rate);

        // Alpha Leakage (Trades where checklist rules were violated)
        let totalLeakageAmount = 0;
        const ruleViolations: any[] = [];

        filteredTrades.forEach((t) => {
            if (!t.checklist_results) return;
            const brokenRules = Object.entries(t.checklist_results).filter(([_, passed]) => !passed);

            if (brokenRules.length > 0) {
                if (Number(t.raw_pnl) < 0) {
                    totalLeakageAmount += Math.abs(Number(t.raw_pnl));
                }

                brokenRules.forEach(([ruleName]) => {
                    ruleViolations.push({
                        id: `${t.id}-${ruleName}`,
                        date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        pair: t.pair,
                        rule: ruleName,
                        severity: Number(t.raw_pnl) < 0 ? "high" : "low",
                        pnlLost: Number(t.raw_pnl) < 0 ? Math.abs(Number(t.raw_pnl)) : 0,
                    });
                });
            }
        });

        // Group Leakage by Rule
        const leakageGrouped: Record<string, number> = {};
        ruleViolations.forEach((v) => {
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
                    amount: Number(amount.toFixed(2)),
                    pct: totalLeakageAmount > 0 ? Math.round((amount / totalLeakageAmount) * 100) : 0,
                    color: colors[i % colors.length],
                };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        return {
            totalTrades,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            breakevenTrades: breakevenTrades.length,
            winRate,
            netPnl,
            profitFactor,
            avgWin,
            avgLoss,
            winLossRatio,
            expectancy,
            maxWinStreak,
            maxLossStreak,
            maxDrawdown: Number(maxDrawdownDollar.toFixed(2)),
            maxDrawdownPct: Number(maxDrawdownPct.toFixed(1)),
            edgeBySetup,
            ruleViolations,
            totalLeakageAmount: Number(totalLeakageAmount.toFixed(2)),
            leakageSources,
            bestSetup: edgeBySetup[0] ? { name: edgeBySetup[0].setup, winRate: edgeBySetup[0].rate, pnl: edgeBySetup[0].pnl } : null,
            worstSetup: edgeBySetup[edgeBySetup.length - 1] ? { name: edgeBySetup[edgeBySetup.length - 1].setup, winRate: edgeBySetup[edgeBySetup.length - 1].rate, pnl: edgeBySetup[edgeBySetup.length - 1].pnl } : null,
        };
    }, [filteredTrades]);

    if (!stats) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-2xl bg-card p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-base font-bold text-foreground font-['Montserrat']">Not Enough Log Data</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                    Log trades in your <strong>Trading Journal</strong> or import a CSV statement to unlock full institutional analytics.
                </p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Top Controls Bar: Account Filter + Time Range + AI Diagnostic */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                <div className="flex items-center gap-3">
                    {activeAccount ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent font-semibold">
                            <Layers className="w-4 h-4" />
                            <span>
                                Account: <strong>{activeAccount.name}</strong> ({activeAccount.broker.toUpperCase()})
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs text-muted-foreground font-semibold">
                            <Layers className="w-4 h-4" />
                            <span>All Combined Accounts</span>
                        </div>
                    )}
                    <span className="text-xs font-mono text-muted-foreground hidden md:inline-block">
                        ({filteredTrades.length} Trades Analyzed)
                    </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Time Range Pills */}
                    <div className="flex items-center p-1 rounded-xl bg-white/5 border border-border/30 text-xs font-semibold">
                        {[
                            { id: "all", label: "All Time" },
                            { id: "month", label: "This Month" },
                            { id: "30d", label: "30D" },
                            { id: "week", label: "7D" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTimeRange(t.id as any)}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    timeRange === t.id
                                        ? "bg-accent text-accent-foreground font-bold shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* AI Edge Diagnostic Modal Trigger */}
                    <AiEdgeDiagnosticModal stats={stats} trades={filteredTrades} />
                </div>
            </div>

            {/* 8-Card Institutional KPI & Risk Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Net P&L */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <DollarSign className="w-3.5 h-3.5 text-accent" /> Net P&L
                    </span>
                    <span className={`text-2xl font-black font-mono ${stats.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stats.netPnl >= 0 ? "+" : "-"}${Math.abs(stats.netPnl).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                        Gross Profit: ${stats.avgWin > 0 ? (stats.avgWin * stats.winningTrades).toFixed(0) : "0"}
                    </span>
                </motion.div>

                {/* 2. Win Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <Target className="w-3.5 h-3.5 text-accent" /> Win Rate
                    </span>
                    <span className="text-2xl font-black font-mono text-foreground">{stats.winRate}%</span>
                    <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {stats.winningTrades}W / {stats.losingTrades}L ({stats.breakevenTrades}BE)
                    </span>
                </motion.div>

                {/* 3. Expectancy */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <Zap className="w-3.5 h-3.5 text-accent" /> Expectancy / Trade
                    </span>
                    <span className={`text-2xl font-black font-mono ${stats.expectancy >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stats.expectancy >= 0 ? "+" : "-"}${Math.abs(stats.expectancy).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Profit Factor: {stats.profitFactor}
                    </span>
                </motion.div>

                {/* 4. Win/Loss Ratio */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <Scale className="w-3.5 h-3.5 text-accent" /> Win/Loss Ratio
                    </span>
                    <span className="text-2xl font-black font-mono text-foreground">{stats.winLossRatio}:1</span>
                    <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Avg +${stats.avgWin} / -${stats.avgLoss}
                    </span>
                </motion.div>

                {/* 5. Max Drawdown */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Max Drawdown
                    </span>
                    <span className="text-2xl font-black font-mono text-red-400">
                        -{stats.maxDrawdownPct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Peak Drop: -${stats.maxDrawdown}
                    </span>
                </motion.div>

                {/* 6. Consecutive Streaks */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Max Streaks
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-emerald-400">
                            {stats.maxWinStreak}W
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">/</span>
                        <span className="text-xl font-bold font-mono text-red-400">
                            {stats.maxLossStreak}L
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">Discipline consistency</span>
                </motion.div>

                {/* 7. Alpha Leakage Lost */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Alpha Leakage
                    </span>
                    <span className="text-2xl font-black font-mono text-red-400">
                        -${stats.totalLeakageAmount}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">Loss from broken rules</span>
                </motion.div>

                {/* 8. Total Sample */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between"
                >
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                        <Activity className="w-3.5 h-3.5 text-accent" /> Total Executions
                    </span>
                    <span className="text-2xl font-black font-mono text-foreground">{stats.totalTrades}</span>
                    <span className="text-[10px] text-muted-foreground mt-1 font-mono">Sample Size Verified</span>
                </motion.div>
            </div>

            {/* Interactive Cumulative Equity & Drawdown Curve */}
            <CumulativeEquityChart trades={filteredTrades} />

            {/* Session, Day of Week, and Directional Breakdown Matrix */}
            <SessionEdgeMatrix trades={filteredTrades} />

            {/* Setup Edge & Alpha Leakage Donut Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Win Rate by Setup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 shadow-sm"
                >
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-accent" />
                            Statistical Edge by Playbook Setup
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Win rate and profitability per strategy</p>
                    </div>

                    {stats.edgeBySetup.length > 0 ? (
                        <div className="space-y-3">
                            {stats.edgeBySetup.map((s, i) => (
                                <motion.div
                                    key={s.setup}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-36 shrink-0">
                                        <span className="text-xs text-foreground font-bold font-mono truncate block">
                                            {s.setup}
                                        </span>
                                        <span className={`text-[10px] font-mono font-semibold ${s.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            {s.pnl >= 0 ? "+" : ""}${s.pnl.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-8 bg-white/5 rounded-xl overflow-hidden relative border border-border/20">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.rate}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                                            className={`h-full rounded-xl ${
                                                s.rate >= 70
                                                    ? "bg-emerald-500/40"
                                                    : s.rate >= 50
                                                        ? "bg-accent/30"
                                                        : "bg-red-500/30"
                                            }`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-foreground">
                                            {s.rate}% <span className="text-muted-foreground font-normal text-[10px]">({s.trades} trades)</span>
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-6">No setup data logged.</p>
                    )}
                </motion.div>

                {/* Alpha Leakage (Donut Chart) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 shadow-sm"
                >
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Alpha Leakage Impact & Rule Drag
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Dollar losses from broken pre-trade checklist rules</p>
                    </div>

                    {stats.leakageSources.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-8 pt-2">
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
                                                    transition={{ delay: 0.4 + i * 0.1 }}
                                                />
                                            );
                                        });
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-red-400 font-mono">
                                        -${stats.totalLeakageAmount.toFixed(0)}
                                    </span>
                                    <span className="text-[9px] uppercase font-mono font-bold text-muted-foreground">
                                        Total Leaked
                                    </span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 grid grid-cols-1 gap-2.5 w-full">
                                {stats.leakageSources.map((source) => (
                                    <div
                                        key={source.label}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-border/30 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-foreground truncate font-medium">{source.label}</p>
                                        </div>
                                        <span className="text-xs font-bold font-mono text-red-400">
                                            -${source.amount.toFixed(0)} ({source.pct}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-[180px] flex flex-col items-center justify-center text-center space-y-1">
                            <span className="text-base font-bold text-emerald-400 font-['Montserrat']">Zero Alpha Leakage!</span>
                            <p className="text-xs text-muted-foreground">You adhered to 100% of your pre-trade checklist rules.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Rule Violations Log Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm"
            >
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-400" />
                            Rule Violations & Indiscipline Audit Log
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Empirical log of broken risk rules and dollar impact</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        {stats.ruleViolations.length} Violations
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/30 bg-white/[0.01]">
                                {["Date", "Pair", "Violated Rule", "PnL Drag", "Severity"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-xs">
                            {stats.ruleViolations.length > 0 ? (
                                stats.ruleViolations.map((v: any, i: number) => (
                                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-3.5 font-mono text-muted-foreground">{v.date}</td>
                                        <td className="px-6 py-3.5 font-bold font-mono text-foreground">{v.pair}</td>
                                        <td className="px-6 py-3.5 text-foreground/90 line-through decoration-red-500/60 font-medium">
                                            {v.rule}
                                        </td>
                                        <td className="px-6 py-3.5 font-bold font-mono text-red-400">
                                            {v.pnlLost > 0 ? `-$${v.pnlLost.toFixed(2)}` : "-"}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full capitalize border ${severityColors[v.severity] || severityColors.low}`}>
                                                {v.severity}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-xs text-muted-foreground">
                                        No violations recorded. Impeccable trading discipline!
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
