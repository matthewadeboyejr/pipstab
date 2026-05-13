"use client";

import { useAccounts } from "@/context/AccountContext";
import { Target, TrendingUp, BarChart3, Flame } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AlphaLeakageGauge from "@/components/dashboard/AlphaLeakageGauge";
import EquityCurve from "@/components/dashboard/EquityCurve";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import InsightCard, { type InsightData } from "@/components/dashboard/InsightCard";
import RecentTrades from "@/components/dashboard/RecentTrades";
import { motion } from "framer-motion";

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
    equityData, 
    calendarData, 
    insights,
    kpiStats
}: OverviewClientProps) {
    const { activeAccount } = useAccounts();

    // Filter recent trades by account if selected
    const filteredTrades = activeAccount 
        ? initialTrades.filter(t => t.account_id === activeAccount.id)
        : initialTrades;

    // In a full implementation, we would also filter analytics, equity curve, etc.
    // For now, we are focusing on the Account system integration.

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Win Rate"
                    value={`${kpiStats.winRate}%`}
                    change="+0.0%"
                    trend="neutral"
                    icon={<Target className="w-4 h-4 text-accent" />}
                />
                <StatCard
                    label="Profit Factor"
                    value={kpiStats.profitFactor}
                    change="+0.00"
                    trend="neutral"
                    icon={<TrendingUp className="w-4 h-4 text-accent" />}
                />
                <StatCard
                    label="Avg R:R"
                    value={kpiStats.avgRR}
                    change="0.0"
                    trend="neutral"
                    icon={<BarChart3 className="w-4 h-4 text-accent" />}
                />
                <StatCard
                    label="Win Streak"
                    value={kpiStats.winStreak}
                    change="+0"
                    trend="neutral"
                    icon={<Flame className="w-4 h-4 text-accent" />}
                />
            </div>

            {/* Middle row: Equity Curve + Alpha Leakage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <EquityCurve data={equityData} height={240} />
                </div>
                <div>
                    <AlphaLeakageGauge score={32} />
                </div>
            </div>

            {/* Session Calendar */}
            <SessionCalendar data={calendarData} />

            {/* RECENT TRADES */}
            <RecentTrades trades={filteredTrades.slice(0, 5)} />

            {/* Quick Insights */}
            <div>
                <div className="mb-3 mt-6">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">AI Insights</h3>
                    <p className="text-[11px] text-muted-foreground">Pattern recognition from your trading data</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.map((insight, i) => (
                        <InsightCard key={insight.id} insight={insight} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
