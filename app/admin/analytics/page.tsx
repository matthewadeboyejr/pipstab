"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    Layers,
    PieChart,
    Calendar,
    ArrowUpRight,
    Loader2,
    Flame,
    Zap,
    Shield,
} from "lucide-react";

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/admin/analytics");
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (e) {
            console.error("Failed to load platform analytics", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-xs font-mono">Aggregating platform trading telemetry...</p>
            </div>
        );
    }

    const { kpis, topPairs, brokerDistribution, recentGrowth } = analytics || {};

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-['Montserrat'] tracking-tight text-foreground flex items-center gap-2.5">
                        <BarChart3 className="w-6 h-6 text-accent" />
                        <span>Platform Trading Intelligence</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Macro platform telemetry, asset volume concentration, win rates, and trader cohort behavior.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-accent/10 border border-accent/20 text-xs font-mono font-bold text-accent">
                        Real-time Database Aggregates
                    </span>
                </div>
            </div>

            {/* KPI Overview Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold uppercase tracking-wider">Total Trades Logged</span>
                        <Activity className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-2xl font-black font-mono text-foreground">{kpis?.totalTradesCount || 0}</p>
                    <p className="text-[11px] text-emerald-500 font-medium">+{recentGrowth?.trades7d || 0} in past 7 days</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold uppercase tracking-wider">Platform Win Rate</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black font-mono text-foreground">{kpis?.winRate || 0}%</p>
                    <p className="text-[11px] text-muted-foreground">Across all registered trader accounts</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold uppercase tracking-wider">Active Traders</span>
                        <Users className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-2xl font-black font-mono text-foreground">{kpis?.totalTraders || 0}</p>
                    <p className="text-[11px] text-emerald-500 font-medium">+{recentGrowth?.newTraders7d || 0} new this week</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-bold uppercase tracking-wider">Cumulative PnL</span>
                        <Flame className="w-4 h-4 text-accent" />
                    </div>
                    <p className={`text-2xl font-black font-mono ${
                        (kpis?.totalPnL || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}>
                        ${(kpis?.totalPnL || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Combined recorded execution PnL</p>
                </div>
            </div>

            {/* Asset Pair Heatmap & Broker Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Most Traded Assets Heatmap */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Most Traded Asset Concentration
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">Top 5 Pairs</span>
                    </div>

                    {!topPairs || topPairs.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-8 text-center">
                            No trade pair statistics recorded yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {topPairs.map((pairItem: any, i: number) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                                                #{i + 1}
                                            </span>
                                            <strong className="text-foreground text-sm">{pairItem.pair}</strong>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground">{pairItem.count} trades</span>
                                            <span className="font-bold text-accent">{pairItem.percentage}%</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.max(5, pairItem.percentage)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Connected Broker & Integration Distribution */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Connected Broker Telemetry
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-foreground">Deriv WebSocket Broker Sync</h4>
                                <p className="text-[11px] text-muted-foreground">Automated API token accounts</p>
                            </div>
                            <span className="text-lg font-black font-mono text-emerald-400">
                                {brokerDistribution?.deriv || 0}
                            </span>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-foreground">Manual Journal Accounts</h4>
                                <p className="text-[11px] text-muted-foreground">Forex, Indices & Commodities</p>
                            </div>
                            <span className="text-lg font-black font-mono text-accent">
                                {brokerDistribution?.manual || 0}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300/90 leading-relaxed space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Telemetry Health Status</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            100% of accounts are securely partitioned with Supabase Row-Level Security (RLS).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
