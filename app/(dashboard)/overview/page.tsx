"use client";

import { motion } from "framer-motion";
import {
    Target,
    TrendingUp,
    BarChart3,
    Flame,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AlphaLeakageGauge from "@/components/dashboard/AlphaLeakageGauge";
import EquityCurve from "@/components/dashboard/EquityCurve";
import SessionCalendar from "@/components/dashboard/SessionCalendar";
import InsightCard from "@/components/dashboard/InsightCard";
import RecentTrades from "@/components/dashboard/RecentTrades";
import type { InsightData } from "@/components/dashboard/InsightCard";

// ─── Mock Data ──────────────────────────────────────────────
const equityData = [
    10000, 10250, 10120, 10400, 10380, 10600, 10550, 10800, 10750,
    11000, 10900, 11200, 11100, 11400, 11350, 11600, 11500, 11800,
    11750, 12000, 11900, 12200, 12100, 12450, 12350, 12600, 12500,
    12800, 12700, 13000,
];

const calendarData = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    const isWeekday = date.getDay() !== 0 && date.getDay() !== 6;
    const traded = isWeekday && Math.random() > 0.35;
    return {
        date: date.toISOString().split("T")[0],
        pnl: traded ? (Math.random() - 0.4) * 300 : 0,
        trades: traded ? Math.floor(Math.random() * 5) + 1 : 0,
    };
});

const recentTrades = [
    { id: "1", pair: "EUR/USD", direction: "long" as const, pnl: 245.5, rr: "1:2.5", setup: "OB + FVG", date: "Feb 28", emotion: "Confident" },
    { id: "2", pair: "GBP/JPY", direction: "short" as const, pnl: -120.0, rr: "1:1.5", setup: "BOS + Inducement", date: "Feb 27", emotion: "FOMO" },
    { id: "3", pair: "XAU/USD", direction: "long" as const, pnl: 380.0, rr: "1:3.0", setup: "HTF OB", date: "Feb 27", emotion: "Calm" },
    { id: "4", pair: "USD/CAD", direction: "short" as const, pnl: -85.0, rr: "1:2.0", setup: "Liquidity Sweep", date: "Feb 26", emotion: "Anxious" },
    { id: "5", pair: "NZD/USD", direction: "long" as const, pnl: 190.0, rr: "1:2.0", setup: "OB + BOS", date: "Feb 26", emotion: "Neutral" },
];

const insights: InsightData[] = [
    { id: "1", text: "Your win rate on Tuesdays is 73%, which is 23% above your average. Consider increasing position size on Tuesday setups.", type: "positive", confidence: 89 },
    { id: "2", text: "You've taken 4 revenge trades this week after losses. This pattern accounts for 40% of your Alpha Leakage.", type: "warning", confidence: 94 },
    { id: "3", text: "Your best performing session is London Open (7-9 AM GMT). 65% of your profit comes from this window.", type: "timing", confidence: 87 },
    { id: "4", text: "Order Block + FVG confluence setups have a 78% win rate over 50 trades. This is your strongest edge.", type: "positive", confidence: 92 },
];

const staggerContainer = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

export default function OverviewPage() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-[1400px] mx-auto"
        >
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Win Rate"
                    value="62.4%"
                    change="+4.2%"
                    trend="up"
                    icon={Target}
                    sparklineData={[55, 58, 56, 60, 59, 61, 62, 62.4]}
                />
                <StatCard
                    label="Profit Factor"
                    value="1.85"
                    change="+0.12"
                    trend="up"
                    icon={TrendingUp}
                    sparklineData={[1.5, 1.6, 1.55, 1.7, 1.65, 1.78, 1.82, 1.85]}
                />
                <StatCard
                    label="Avg R:R"
                    value="1:2.3"
                    change="-0.1"
                    trend="down"
                    icon={BarChart3}
                    sparklineData={[2.5, 2.4, 2.3, 2.4, 2.2, 2.3, 2.3, 2.3]}
                />
                <StatCard
                    label="Win Streak"
                    value="5"
                    change="+2"
                    trend="up"
                    icon={Flame}
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

            {/* Recent Trades */}
            <RecentTrades trades={recentTrades} />

            {/* Quick Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">AI Insights</h3>
                    <p className="text-[11px] text-muted-foreground">Pattern recognition from your trading data</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.map((insight, i) => (
                        <InsightCard key={insight.id} insight={insight} index={i} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
