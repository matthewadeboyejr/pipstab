"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Users,
    TrendingUp,
    BarChart3,
    Activity,
    Mail,
    Shield,
    RefreshCcw,
    Zap,
    Scale,
    Layers,
    ArrowUpRight,
    CheckCircle2,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function AdminOverviewPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const { addToast } = useToast();

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/analytics");
            if (!res.ok) throw new Error("Failed to load analytics");
            const json = await res.json();
            setData(json);
        } catch (error: any) {
            console.error("Fetch analytics error:", error);
            addToast(error.message || "Failed to load admin analytics", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForceSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/brokers/force-sync", { method: "POST" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Force sync failed");
            addToast("Platform Broker Sync triggered successfully!", "success");
            fetchAnalytics();
        } catch (error: any) {
            addToast(error.message || "Failed to trigger sync", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const overview = data?.overview;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Platform Command Center
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Real-time business telemetry, trader activity, and broker synchronization health
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleForceSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all font-['Montserrat'] shadow-lg shadow-accent/20 disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing Brokers..." : "Force Broker Sync"}
                    </button>

                    <button
                        onClick={fetchAnalytics}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-white/5 border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Traders */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Total Registered Traders
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-foreground font-['Montserrat']">
                            {overview?.total_traders ?? "—"}
                        </span>
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> +{overview?.new_traders_7d ?? 0} in last 7 days
                        </p>
                    </div>
                </motion.div>

                {/* Total Trades Logged */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-5 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Total Logged Trades
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-foreground font-['Montserrat']">
                            {overview?.total_trades ?? "—"}
                        </span>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            {overview?.trades_7d ?? 0} trades logged this week
                        </p>
                    </div>
                </motion.div>

                {/* Platform Aggregate Win Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Platform Avg Win Rate
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-foreground font-['Montserrat']">
                            {overview?.win_rate ?? 0}%
                        </span>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                            Aggregated across all journal entries
                        </p>
                    </div>
                </motion.div>

                {/* Early Access Leads */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-5 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            Early Access Waitlist
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Mail className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-foreground font-['Montserrat']">
                            {overview?.waitlist_total ?? 0}
                        </span>
                        <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                            {overview?.waitlist_pending ?? 0} pending review
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Middle Section: Top Pairs + System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Traded Assets */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/40 space-y-4 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Most Traded Assets on PipTab
                            </h3>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Platform Volume Share
                        </span>
                    </div>

                    <div className="space-y-3">
                        {(data?.top_pairs || []).map((item: any) => (
                            <div key={item.pair} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold font-mono text-foreground">{item.pair}</span>
                                    <span className="text-muted-foreground font-mono">
                                        {item.count} trades ({item.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-border/20">
                                    <div
                                        style={{ width: `${item.percentage}%` }}
                                        className="h-full bg-accent rounded-full transition-all duration-700"
                                    />
                                </div>
                            </div>
                        ))}

                        {(!data?.top_pairs || data?.top_pairs.length === 0) && (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                No trades logged on platform yet.
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* System Telemetry & Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-6 rounded-2xl bg-card border border-border/40 space-y-5 shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Service Infrastructure Status
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/20">
                                <span className="text-muted-foreground">AI Pipeline</span>
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Gemini 3.6 Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/20">
                                <span className="text-muted-foreground">Broker Sync Cron</span>
                                <span className="font-bold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Vercel Cron Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/20">
                                <span className="text-muted-foreground">Connected Deriv Accounts</span>
                                <span className="font-bold text-foreground font-mono">
                                    {overview?.deriv_accounts ?? 0} Accounts
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/20 space-y-2">
                        <Link
                            href="/admin/users"
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-foreground transition-all"
                        >
                            <span>Inspect Trader Directory</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
                        </Link>
                        <Link
                            href="/admin/waitlist"
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-foreground transition-all"
                        >
                            <span>Triage Early Access Leads</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
