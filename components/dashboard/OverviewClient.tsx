"use client";

import { useAccounts } from "@/context/AccountContext";
import {
    Target,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Flame,
    Layers,
    LayoutDashboard,
    ShieldAlert,
    AlertTriangle,
    Zap,
    Scale,
    Activity,
    DollarSign,
    Sparkles,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AlphaLeakageGauge from "@/components/dashboard/AlphaLeakageGauge";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import InsightCard, { type InsightData } from "@/components/dashboard/InsightCard";
import RecentTrades from "@/components/dashboard/RecentTrades";
import CumulativeEquityChart from "@/components/dashboard/analytics/CumulativeEquityChart";
import SessionEdgeMatrix from "@/components/dashboard/analytics/SessionEdgeMatrix";
import AiEdgeDiagnosticModal from "@/components/dashboard/analytics/AiEdgeDiagnosticModal";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface OverviewClientProps {
    initialTrades: any[];
    equityData: number[];
    calendarData: any[];
    insights: InsightData[];
    kpiStats: {
        winRate: string;
        profitFactor: string;
        avgRR: string;
        winStreak: string;
    };
}

const severityColors: Record<string, string> = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10",
};

function OverviewContent({
    initialTrades,
    calendarData: serverCalendarData,
    insights: serverInsights,
}: OverviewClientProps) {
    const { activeAccount } = useAccounts();
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialTabParam = searchParams.get("tab");
    const resolvedInitialTab = initialTabParam === "analytics" || initialTabParam === "quant" ? "quant" : "overview";
    const [activeTab, setActiveTab] = useState<"overview" | "quant" | "violations">(resolvedInitialTab as any);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "analytics" || tab === "quant") {
            setActiveTab("quant");
        } else if (tab === "violations") {
            setActiveTab("violations");
        } else if (tab === "overview") {
            setActiveTab("overview");
        }
    }, [searchParams]);

    const handleTabChange = (tab: "overview" | "quant" | "violations") => {
        setActiveTab(tab);
        router.push(`/performance?tab=${tab}`, { scroll: false });
    };

    // 1. Filter trades reactively based on activeAccount
    const filteredTrades = useMemo(() => {
        if (!activeAccount) return initialTrades;
        return initialTrades.filter((t) => t.account_id === activeAccount.id);
    }, [initialTrades, activeAccount]);

    // 2. Comprehensive Data Aggregation Engine
    const stats = useMemo(() => {
        const total = filteredTrades.length;
        const wins = filteredTrades.filter((t) => Number(t.pnl || t.raw_pnl) > 0);
        const losses = filteredTrades.filter((t) => Number(t.pnl || t.raw_pnl) < 0);
        const breakevens = filteredTrades.filter((t) => Number(t.pnl || t.raw_pnl) === 0);

        const winRate = total > 0 ? ((wins.length / total) * 100).toFixed(1) : "0.0";
        const grossProfit = wins.reduce((acc, t) => acc + Number(t.pnl || t.raw_pnl), 0);
        const grossLoss = Math.abs(losses.reduce((acc, t) => acc + Number(t.pnl || t.raw_pnl), 0));
        const netPnl = Number((grossProfit - grossLoss).toFixed(2));
        const profitFactor =
            grossLoss > 0
                ? (grossProfit / grossLoss).toFixed(2)
                : grossProfit > 0
                    ? "9.99"
                    : "0.00";

        const validRRs = filteredTrades
            .filter((t) => t.rr && !isNaN(parseFloat(t.rr)))
            .map((t) => parseFloat(t.rr));
        const avgRR = validRRs.length > 0 ? (validRRs.reduce((acc, r) => acc + r, 0) / validRRs.length).toFixed(1) : "0.0";

        const avgWin = wins.length > 0 ? Number((grossProfit / wins.length).toFixed(2)) : 0;
        const avgLoss = losses.length > 0 ? Number((grossLoss / losses.length).toFixed(2)) : 0;
        const winLossRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : avgWin > 0 ? "Infinite" : "0.00";

        const winPct = Number(winRate) / 100;
        const lossPct = total > 0 ? losses.length / total : 0;
        const expectancy = Number((winPct * avgWin - lossPct * avgLoss).toFixed(2));

        // Streaks and Max Drawdown
        const chronTrades = [...filteredTrades].sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date).getTime();
            const dateB = new Date(b.rawDate || b.date).getTime();
            return dateA - dateB;
        });

        let currentWinStreak = 0;
        let maxWinStreak = 0;
        let currentLossStreak = 0;
        let maxLossStreak = 0;
        let runningPnl = 0;
        let peakPnl = 0;
        let maxDrawdownDollar = 0;
        let maxDrawdownPct = 0;

        chronTrades.forEach((t) => {
            const pnl = Number(t.pnl || t.raw_pnl) || 0;
            if (pnl > 0) {
                currentWinStreak++;
                currentLossStreak = 0;
                if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
            } else if (pnl < 0) {
                currentLossStreak++;
                currentWinStreak = 0;
                if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
            }

            runningPnl += pnl;
            if (runningPnl > peakPnl) peakPnl = runningPnl;
            const ddDollar = peakPnl > 0 ? peakPnl - runningPnl : 0;
            const ddPct = peakPnl > 0 ? (ddDollar / peakPnl) * 100 : 0;

            if (ddDollar > maxDrawdownDollar) maxDrawdownDollar = ddDollar;
            if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;
        });

        // Setups Edge
        const setupStats: Record<string, { wins: number; total: number; pnl: number }> = {};
        filteredTrades.forEach((t) => {
            const setupName = t.setup || "None";
            if (!setupStats[setupName]) setupStats[setupName] = { wins: 0, total: 0, pnl: 0 };
            setupStats[setupName].total += 1;
            setupStats[setupName].pnl += Number(t.pnl || t.raw_pnl);
            if (Number(t.pnl || t.raw_pnl) > 0) setupStats[setupName].wins += 1;
        });

        const edgeBySetup = Object.entries(setupStats)
            .map(([setup, data]) => ({
                setup,
                rate: Math.round((data.wins / data.total) * 100),
                trades: data.total,
                pnl: Number(data.pnl.toFixed(2)),
            }))
            .sort((a, b) => b.rate - a.rate);

        // Alpha Leakage
        let totalLeakageAmount = 0;
        const ruleViolations: any[] = [];

        filteredTrades.forEach((t) => {
            if (!t.checklist_results) return;
            const brokenRules = Object.entries(t.checklist_results).filter(([_, passed]) => !passed);

            if (brokenRules.length > 0) {
                const pnl = Number(t.pnl || t.raw_pnl);
                if (pnl < 0) {
                    totalLeakageAmount += Math.abs(pnl);
                }

                brokenRules.forEach(([ruleName]) => {
                    ruleViolations.push({
                        id: `${t.id}-${ruleName}`,
                        date: new Date(t.rawDate || t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        pair: t.pair,
                        rule: ruleName,
                        severity: pnl < 0 ? "high" : "low",
                        pnlLost: pnl < 0 ? Math.abs(pnl) : 0,
                    });
                });
            }
        });

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
            totalTrades: total,
            winningTrades: wins.length,
            losingTrades: losses.length,
            breakevenTrades: breakevens.length,
            winRate,
            profitFactor,
            avgRR: `1:${avgRR}`,
            winStreak: currentWinStreak.toString(),
            maxWinStreak,
            maxLossStreak,
            netPnl,
            avgWin,
            avgLoss,
            winLossRatio,
            expectancy,
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

    // 3. Dynamically recompute 90-Day Session Calendar for active account
    const dynamicCalendarData = useMemo(() => {
        const calendarMap = new Map();
        for (let i = 0; i < 90; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (89 - i));
            calendarMap.set(d.toISOString().split("T")[0], { pnl: 0, trades: 0 });
        }

        filteredTrades.forEach((t) => {
            const rawDateStr = t.rawDate || t.date;
            if (!rawDateStr) return;
            const dateKey = rawDateStr.includes("T") ? rawDateStr.split("T")[0] : rawDateStr;
            if (calendarMap.has(dateKey)) {
                const entry = calendarMap.get(dateKey);
                entry.pnl += Number(t.pnl || t.raw_pnl);
                entry.trades += 1;
            }
        });

        return Array.from(calendarMap.entries()).map(([date, data]) => ({
            date,
            ...data,
        }));
    }, [filteredTrades]);

    // 4. Dynamic AI Insights
    const dynamicInsights = useMemo(() => {
        const winRateNum = parseFloat(stats.winRate);
        const profitFactorNum = parseFloat(stats.profitFactor);
        const total = filteredTrades.length;
        const insightsList: InsightData[] = [];

        const accountLabel = activeAccount ? `on "${activeAccount.name}"` : "across all accounts";

        if (winRateNum > 60) {
            insightsList.push({
                id: "1",
                text: `Your win rate of ${winRateNum}% ${accountLabel} is exceptional. Risk parameters are protecting your edge.`,
                type: "positive",
                confidence: 92,
            });
        } else if (winRateNum < 40 && total > 3) {
            insightsList.push({
                id: "1",
                text: `Win rate is currently ${winRateNum}% ${accountLabel}. Review your setup checklist to filter low-probability entries.`,
                type: "warning",
                confidence: 85,
            });
        }

        if (parseInt(stats.winStreak) >= 3) {
            insightsList.push({
                id: "2",
                text: `You are on a ${stats.winStreak}-trade win streak ${accountLabel}. Maintain strict position sizing.`,
                type: "timing",
                confidence: 95,
            });
        }

        if (profitFactorNum < 1.2 && total > 3) {
            insightsList.push({
                id: "3",
                text: `Profit factor is ${profitFactorNum} ${accountLabel}. Focus on letting high-conviction trades reach full target.`,
                type: "warning",
                confidence: 88,
            });
        } else if (filteredTrades.length > 0) {
            insightsList.push({
                id: "3",
                text: `${filteredTrades[0].pair} execution ${accountLabel} aligns with historical high-probability market sessions.`,
                type: "neutral",
                confidence: 70,
            });
        }

        return insightsList.length > 0 ? insightsList : serverInsights;
    }, [filteredTrades, stats, activeAccount, serverInsights]);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* Header Switcher & AI Diagnostic Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                {/* View Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-border/30 text-xs font-bold">
                    <button
                        onClick={() => handleTabChange("overview")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                            activeTab === "overview"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Mission Control
                    </button>
                    <button
                        onClick={() => handleTabChange("quant")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                            activeTab === "quant"
                                ? "bg-accent text-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Quant & Edge Lab
                    </button>
                    <button
                        onClick={() => handleTabChange("violations")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                            activeTab === "violations"
                                ? "bg-red-500 text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Violations ({stats.ruleViolations.length})
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Active Account Filter Indicator */}
                    {activeAccount && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent font-semibold">
                            <Layers className="w-3.5 h-3.5" />
                            <span>
                                <strong>{activeAccount.name}</strong> ({activeAccount.broker.toUpperCase()})
                            </span>
                        </div>
                    )}

                    {/* AI Edge Diagnostic Modal */}
                    <AiEdgeDiagnosticModal stats={stats} trades={filteredTrades} />
                </div>
            </div>

            {/* TAB 1: MISSION CONTROL (OVERVIEW) */}
            {activeTab === "overview" && (
                <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* KPI Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Net P&L"
                            value={`${stats.netPnl >= 0 ? "+" : "-"}$${Math.abs(stats.netPnl).toFixed(2)}`}
                            change={`Expectancy: $${stats.expectancy}/trade`}
                            trend={stats.netPnl >= 0 ? "up" : "down"}
                            icon={<DollarSign className="w-4 h-4 text-accent" />}
                        />
                        <StatCard
                            label="Win Rate"
                            value={`${stats.winRate}%`}
                            change={`${stats.winningTrades}W / ${stats.losingTrades}L`}
                            trend="neutral"
                            icon={<Target className="w-4 h-4 text-accent" />}
                        />
                        <StatCard
                            label="Profit Factor"
                            value={stats.profitFactor}
                            change={`R:R ${stats.winLossRatio}:1`}
                            trend="neutral"
                            icon={<TrendingUp className="w-4 h-4 text-accent" />}
                        />
                        <StatCard
                            label="Active Streak"
                            value={`${stats.winStreak}W`}
                            change={`Max: ${stats.maxWinStreak}W / ${stats.maxLossStreak}L`}
                            trend="neutral"
                            icon={<Flame className="w-4 h-4 text-accent" />}
                        />
                    </div>

                    {/* Interactive Cumulative Equity & Underwater Drawdown Curve */}
                    <CumulativeEquityChart trades={filteredTrades} />

                    {/* Session Calendar (Left 2 cols) & Alpha Leakage + AI Insights (Right 1 col) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="lg:col-span-2">
                            <SessionCalendar data={dynamicCalendarData} />
                        </div>
                        <div className="lg:col-span-1 flex flex-col gap-4">
                            <AlphaLeakageGauge
                                score={Math.max(10, Math.min(90, Math.round(100 - parseFloat(stats.winRate) || 32)))}
                            />

                            {/* AI Edge Insights neatly filling the vertical height */}
                            <div className="flex-1 rounded-2xl bg-card border border-border/50 p-5 space-y-3 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                                        AI Edge Insights
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-mono">Live Pulse</span>
                                </div>
                                <div className="space-y-2.5">
                                    {dynamicInsights.slice(0, 2).map((insight, i) => (
                                        <InsightCard key={insight.id || i} insight={insight} index={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT TRADES */}
                    <RecentTrades trades={filteredTrades.slice(0, 5)} />
                </motion.div>
            )}

            {/* TAB 2: QUANT & EDGE LAB (ANALYTICS) */}
            {activeTab === "quant" && (
                <motion.div
                    key="quant"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* 8-Card Institutional Metric Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <DollarSign className="w-3.5 h-3.5 text-accent" /> Net P&L
                            </span>
                            <span className={`text-2xl font-black font-mono ${stats.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {stats.netPnl >= 0 ? "+" : "-"}${Math.abs(stats.netPnl).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-1">Profit Factor: {stats.profitFactor}</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <Target className="w-3.5 h-3.5 text-accent" /> Win Rate
                            </span>
                            <span className="text-2xl font-black font-mono text-foreground">{stats.winRate}%</span>
                            <span className="text-[10px] text-muted-foreground mt-1 font-mono">{stats.winningTrades}W / {stats.losingTrades}L</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <Zap className="w-3.5 h-3.5 text-accent" /> Expectancy / Trade
                            </span>
                            <span className={`text-2xl font-black font-mono ${stats.expectancy >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {stats.expectancy >= 0 ? "+" : "-"}${Math.abs(stats.expectancy).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-1 font-mono">Mathematical Edge</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <Scale className="w-3.5 h-3.5 text-accent" /> Win/Loss Ratio
                            </span>
                            <span className="text-2xl font-black font-mono text-foreground">{stats.winLossRatio}:1</span>
                            <span className="text-[10px] text-muted-foreground mt-1 font-mono">Avg +${stats.avgWin} / -${stats.avgLoss}</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Max Drawdown
                            </span>
                            <span className="text-2xl font-black font-mono text-red-400">-{stats.maxDrawdownPct}%</span>
                            <span className="text-[10px] text-muted-foreground mt-1 font-mono">Peak Drop: -${stats.maxDrawdown}</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <Flame className="w-3.5 h-3.5 text-amber-400" /> Max Streaks
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black font-mono text-emerald-400">{stats.maxWinStreak}W</span>
                                <span className="text-sm font-mono text-muted-foreground">/</span>
                                <span className="text-xl font-bold font-mono text-red-400">{stats.maxLossStreak}L</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1">Discipline consistency</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Alpha Leakage
                            </span>
                            <span className="text-2xl font-black font-mono text-red-400">-${stats.totalLeakageAmount}</span>
                            <span className="text-[10px] text-muted-foreground mt-1">Loss from broken rules</span>
                        </div>

                        <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                <Activity className="w-3.5 h-3.5 text-accent" /> Total Executions
                            </span>
                            <span className="text-2xl font-black font-mono text-foreground">{stats.totalTrades}</span>
                            <span className="text-[10px] text-muted-foreground mt-1 font-mono">Verified Sample</span>
                        </div>
                    </div>

                    {/* Session & Day-of-Week Edge Matrix */}
                    <SessionEdgeMatrix trades={filteredTrades} />

                    {/* Setup Edge & Alpha Leakage Donut Impact */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Win Rate by Setup */}
                        <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 shadow-sm">
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
                                        <div key={s.setup} className="flex items-center gap-3">
                                            <div className="w-36 shrink-0">
                                                <span className="text-xs text-foreground font-bold font-mono truncate block">
                                                    {s.setup}
                                                </span>
                                                <span className={`text-[10px] font-mono font-semibold ${s.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                    {s.pnl >= 0 ? "+" : ""}${s.pnl.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex-1 h-8 bg-white/5 rounded-xl overflow-hidden relative border border-border/20">
                                                <div
                                                    className={`h-full rounded-xl ${
                                                        s.rate >= 70
                                                            ? "bg-emerald-500/40"
                                                            : s.rate >= 50
                                                                ? "bg-accent/30"
                                                                : "bg-red-500/30"
                                                    }`}
                                                    style={{ width: `${s.rate}%` }}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-foreground">
                                                    {s.rate}% <span className="text-muted-foreground font-normal text-[10px]">({s.trades} trades)</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-6">No setup data logged.</p>
                            )}
                        </div>

                        {/* Alpha Leakage (Donut Chart) */}
                        <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 shadow-sm">
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
                                                return stats.leakageSources.map((source) => {
                                                    const dashArray = (source.pct / 100) * circumference;
                                                    const dashOffset = -offset;
                                                    offset += dashArray;
                                                    return (
                                                        <circle
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
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB 3: RULE VIOLATIONS LOG */}
            {activeTab === "violations" && (
                <motion.div
                    key="violations"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                                    stats.ruleViolations.map((v: any) => (
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
                                                <span
                                                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full capitalize border ${
                                                        severityColors[v.severity] || severityColors.low
                                                    }`}
                                                >
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
            )}
        </div>
    );
}

export default function OverviewClient(props: OverviewClientProps) {
    return (
        <Suspense fallback={<div className="p-10 text-center text-muted-foreground text-sm">Loading Dashboard...</div>}>
            <OverviewContent {...props} />
        </Suspense>
    );
}
