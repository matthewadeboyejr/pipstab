"use client";

import { useAccounts } from "@/context/AccountContext";
import { Target, TrendingUp, BarChart3, Flame, Layers } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AlphaLeakageGauge from "@/components/dashboard/AlphaLeakageGauge";
import EquityCurve from "@/components/dashboard/EquityCurve";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import InsightCard, { type InsightData } from "@/components/dashboard/InsightCard";
import RecentTrades from "@/components/dashboard/RecentTrades";
import { useMemo } from "react";

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

export default function OverviewClient({ 
    initialTrades, 
    equityData: serverEquityData, 
    calendarData: serverCalendarData, 
    insights: serverInsights,
    kpiStats: serverKpiStats
}: OverviewClientProps) {
    const { activeAccount } = useAccounts();

    // 1. Filter trades reactively based on activeAccount
    const filteredTrades = useMemo(() => {
        if (!activeAccount) return initialTrades;
        return initialTrades.filter((t) => t.account_id === activeAccount.id);
    }, [initialTrades, activeAccount]);

    // 2. Dynamically recompute KPI stats for the active account
    const dynamicKPIs = useMemo(() => {
        const total = filteredTrades.length;
        const wins = filteredTrades.filter((t) => Number(t.pnl) > 0);
        const losses = filteredTrades.filter((t) => Number(t.pnl) < 0);

        const winRate = total > 0 ? ((wins.length / total) * 100).toFixed(1) : "0.0";
        const grossProfit = wins.reduce((acc, t) => acc + Number(t.pnl), 0);
        const grossLoss = Math.abs(losses.reduce((acc, t) => acc + Number(t.pnl), 0));
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? "9.99" : "0.00");

        const validRRs = filteredTrades.filter((t) => t.rr && !isNaN(parseFloat(t.rr))).map((t) => parseFloat(t.rr));
        const avgRR = validRRs.length > 0 ? (validRRs.reduce((acc, r) => acc + r, 0) / validRRs.length).toFixed(1) : "0.0";

        let winStreak = 0;
        for (let i = 0; i < filteredTrades.length; i++) {
            if (Number(filteredTrades[i].pnl) > 0) winStreak++;
            else break;
        }

        return {
            winRate,
            profitFactor,
            avgRR: `1:${avgRR}`,
            winStreak: winStreak.toString(),
            totalTrades: total,
            netPnl: grossProfit - grossLoss,
        };
    }, [filteredTrades]);

    // 3. Dynamically recompute Equity Curve for the active account
    const dynamicEquityData = useMemo(() => {
        const initialBalance = activeAccount ? Number(activeAccount.initial_balance) || 0 : 0;
        let currentBalance = initialBalance;
        const points = [initialBalance];

        // Sort trades ascending for equity progression
        const chronTrades = [...filteredTrades].sort((a, b) => {
            const dateA = new Date(a.rawDate || a.date).getTime();
            const dateB = new Date(b.rawDate || b.date).getTime();
            return dateA - dateB;
        });

        chronTrades.forEach((t) => {
            currentBalance += Number(t.pnl);
            points.push(currentBalance);
        });

        return points.length > 1 ? points : [initialBalance, initialBalance];
    }, [filteredTrades, activeAccount]);

    // 4. Dynamically recompute 90-Day Session Calendar for active account
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
                entry.pnl += Number(t.pnl);
                entry.trades += 1;
            }
        });

        return Array.from(calendarMap.entries()).map(([date, data]) => ({
            date,
            ...data,
        }));
    }, [filteredTrades]);

    // 5. Dynamically recompute AI insights for the active account
    const dynamicInsights = useMemo(() => {
        const winRateNum = parseFloat(dynamicKPIs.winRate);
        const profitFactorNum = parseFloat(dynamicKPIs.profitFactor);
        const total = filteredTrades.length;
        const insightsList: InsightData[] = [];

        const accountLabel = activeAccount ? `on "${activeAccount.name}"` : "across all accounts";

        if (winRateNum > 60) {
            insightsList.push({
                id: "1",
                text: `Your win rate of ${winRateNum}% ${accountLabel} is exceptional. Risk parameters are protecting your edge.`,
                type: "positive",
                confidence: 92
            });
        } else if (winRateNum < 40 && total > 3) {
            insightsList.push({
                id: "1",
                text: `Win rate is currently ${winRateNum}% ${accountLabel}. Review your setup checklist to filter low-probability entries.`,
                type: "warning",
                confidence: 85
            });
        }

        if (parseInt(dynamicKPIs.winStreak) >= 3) {
            insightsList.push({
                id: "2",
                text: `You are on a ${dynamicKPIs.winStreak}-trade win streak ${accountLabel}. Maintain strict position sizing.`,
                type: "timing",
                confidence: 95
            });
        }

        if (profitFactorNum < 1.2 && total > 3) {
            insightsList.push({
                id: "3",
                text: `Profit factor is ${profitFactorNum} ${accountLabel}. Focus on letting high-conviction trades reach full target.`,
                type: "warning",
                confidence: 88
            });
        } else if (filteredTrades.length > 0) {
            insightsList.push({
                id: "3",
                text: `${filteredTrades[0].pair} execution ${accountLabel} aligns with historical high-probability market sessions.`,
                type: "neutral",
                confidence: 70
            });
        }

        return insightsList.length > 0 ? insightsList : serverInsights;
    }, [filteredTrades, dynamicKPIs, activeAccount, serverInsights]);

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* Active Account Filter Indicator */}
            {activeAccount && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-xs text-accent font-semibold">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>
                            Displaying metrics filtered specifically for: <strong>{activeAccount.name}</strong> ({activeAccount.broker.toUpperCase()})
                        </span>
                    </div>
                    <span className="font-mono text-[11px]">
                        {filteredTrades.length} Trades Filtered
                    </span>
                </div>
            )}

            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Win Rate"
                    value={`${dynamicKPIs.winRate}%`}
                    change="+0.0%"
                    trend="neutral"
                    icon={<Target className="w-4 h-4 text-accent" />}
                />
                <StatCard
                    label="Profit Factor"
                    value={dynamicKPIs.profitFactor}
                    change="+0.00"
                    trend="neutral"
                    icon={<TrendingUp className="w-4 h-4 text-accent" />}
                />
                <StatCard
                    label="Avg R:R"
                    value={dynamicKPIs.avgRR}
                    change="0.0"
                    trend="neutral"
                    icon={<BarChart3 className="w-4 h-4 text-accent" />}
                />
                <StatCard
                    label="Win Streak"
                    value={dynamicKPIs.winStreak}
                    change="+0"
                    trend="neutral"
                    icon={<Flame className="w-4 h-4 text-accent" />}
                />
            </div>

            {/* Middle row: Equity Curve + Alpha Leakage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <EquityCurve data={dynamicEquityData} height={240} />
                </div>
                <div>
                    <AlphaLeakageGauge score={Math.max(10, Math.min(90, Math.round(100 - parseFloat(dynamicKPIs.winRate) || 32)))} />
                </div>
            </div>

            {/* Session Calendar */}
            <SessionCalendar data={dynamicCalendarData} />

            {/* RECENT TRADES */}
            <RecentTrades trades={filteredTrades.slice(0, 5)} />

            {/* Quick Insights */}
            <div>
                <div className="mb-3 mt-6">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">AI Insights</h3>
                    <p className="text-[11px] text-muted-foreground">Pattern recognition from your trading data</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dynamicInsights.map((insight, i) => (
                        <InsightCard key={insight.id || i} insight={insight} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
