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
}

export default function OverviewClient({ 
    initialTrades, 
    equityData, 
    calendarData, 
    insights 
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
                    value="62.4%"
                    change="+4.2%"
                    trend="up"
                    icon={<Target className="w-4 h-4 text-accent" />}
                    sparklineData={[55, 58, 56, 60, 59, 61, 62, 62.4]}
                />
                <StatCard
                    label="Profit Factor"
                    value="1.85"
                    change="+0.12"
                    trend="up"
                    icon={<TrendingUp className="w-4 h-4 text-accent" />}
                    sparklineData={[1.5, 1.6, 1.55, 1.7, 1.65, 1.78, 1.82, 1.85]}
                />
                <StatCard
                    label="Avg R:R"
                    value="1:2.3"
                    change="-0.1"
                    trend="down"
                    icon={<BarChart3 className="w-4 h-4 text-accent" />}
                    sparklineData={[2.5, 2.4, 2.3, 2.4, 2.2, 2.3, 2.3, 2.3]}
                />
                <StatCard
                    label="Win Streak"
                    value="5"
                    change="+2"
                    trend="up"
                    icon={<Flame className="w-4 h-4 text-accent" />}
                    sparklineData={[1, 0, 2, 1, 3, 2, 4, 5]}
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
