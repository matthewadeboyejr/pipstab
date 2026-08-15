"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Activity,
    RefreshCcw,
    Shield,
    Zap,
    CheckCircle2,
    Clock,
    AlertCircle,
    Layers,
    Cpu,
    ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";

export default function AdminBrokersPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const { addToast } = useToast();

    const fetchBrokers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/brokers");
            if (!res.ok) throw new Error("Failed to load broker accounts");
            const json = await res.json();
            setData(json);
        } catch (error: any) {
            console.error("Fetch brokers error:", error);
            addToast(error.message || "Failed to load brokers", "error");
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
            addToast("Triggered platform-wide broker synchronization", "success");
            fetchBrokers();
        } catch (error: any) {
            addToast(error.message || "Failed to trigger sync", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchBrokers();
    }, []);

    const stats = data?.stats;
    const accounts = data?.accounts || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        Broker Sync & Telemetry Center
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Monitor Deriv OAuth connections, automated background crons, and manual synchronization triggers
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleForceSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all font-['Montserrat'] shadow-lg shadow-accent/20 disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing All Accounts..." : "Trigger Force Sync"}
                    </button>
                    <button
                        onClick={fetchBrokers}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-white/5 border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Metric Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Trading Accounts</span>
                    <p className="text-2xl font-extrabold text-foreground font-mono">{stats?.total_accounts ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">{stats?.active_accounts ?? 0} active in system</p>
                </div>
                <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Deriv OAuth Connections</span>
                    <p className="text-2xl font-extrabold text-accent font-mono">{stats?.deriv_accounts ?? 0}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Live Background Sync Enabled
                    </p>
                </div>
                <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Manual Trading Accounts</span>
                    <p className="text-2xl font-extrabold text-foreground font-mono">{stats?.manual_accounts ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">Logged manually via journal</p>
                </div>
            </div>

            {/* Accounts Telemetry Table */}
            <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border/30 bg-white/[0.01] flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-['Montserrat']">
                        Connected Broker Accounts & Telemetry
                    </h3>
                    <span className="text-[11px] text-muted-foreground font-mono">{accounts.length} Total Accounts</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/30 bg-white/[0.01] text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                <th className="px-6 py-3.5">Trader</th>
                                <th className="px-4 py-3.5">Account Name</th>
                                <th className="px-4 py-3.5">Broker</th>
                                <th className="px-4 py-3.5">Account ID</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-xs font-medium">
                            {accounts.map((acc: any) => (
                                <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        {acc.user_name}
                                    </td>
                                    <td className="px-4 py-4 text-foreground/90 font-semibold">
                                        {acc.account_name}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                                acc.broker === "deriv"
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-white/5 text-muted-foreground border-border/40"
                                            }`}
                                        >
                                            {acc.broker}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 font-mono text-muted-foreground">
                                        {acc.account_number}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`text-[10px] font-semibold flex items-center gap-1.5 ${
                                                acc.is_active ? "text-emerald-400" : "text-muted-foreground"
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    acc.is_active ? "bg-emerald-400" : "bg-muted-foreground/40"
                                                }`}
                                            />
                                            {acc.is_active ? "Active" : "Archived"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">
                                        {acc.created_at ? format(new Date(acc.created_at), "MMM d, yyyy") : "—"}
                                    </td>
                                </tr>
                            ))}

                            {accounts.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                                        No broker accounts linked in system yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
