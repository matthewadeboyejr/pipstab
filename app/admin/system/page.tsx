"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Sliders,
    Shield,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Activity,
    AlertTriangle,
    Zap,
    Cpu,
    Clock,
    Mail,
    HardDrive,
    Database,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";

const DEFAULT_FLAGS = [
    { key: "ai_tools_enabled", label: "AI Strategy & Performance Auditor", desc: "Enables Gemini AI trade auditing and confluence scoring across Journal and Outlooks" },
    { key: "deriv_sync_enabled", label: "Deriv WebSocket Broker Sync", desc: "Automated account balance and trade sync with Deriv API tokens" },
    { key: "outlooks_enabled", label: "Top-Down Strategy Dossiers", desc: "Multi-timeframe 4-stage market outlook creator and PDF/PNG export engine" },
    { key: "public_registration", label: "Public Registration Gate", desc: "When active, any trader can register; when disabled, waitlist invite code is required" },
    { key: "maintenance_mode", label: "Emergency Maintenance Mode", desc: "Puts platform in read-only mode during major database upgrades" },
];

export default function AdminSystemPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingKey, setTogglingKey] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchSystemData = async () => {
        setIsLoading(true);
        try {
            const [settingsRes, telemetryRes] = await Promise.allSettled([
                fetch("/api/admin/settings"),
                fetch("/api/admin/telemetry"),
            ]);

            if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
                const data = await settingsRes.value.json();
                setSettings(data.settings || []);
                setAuditLogs(data.audit_logs || []);
            }

            if (telemetryRes.status === "fulfilled" && telemetryRes.value.ok) {
                const tData = await telemetryRes.value.json();
                setTelemetry(tData);
            }
        } catch (error: any) {
            console.error("Fetch settings error:", error);
            addToast(error.message || "Failed to load system settings", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemData();
    }, []);

    const handleToggleSetting = async (key: string, currentValue: boolean) => {
        setTogglingKey(key);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value: !currentValue }),
            });

            if (!res.ok) throw new Error("Failed to update setting");
            addToast(`Updated feature flag: ${key}`, "success");
            fetchSystemData();
        } catch (error: any) {
            addToast(error.message || "Failed to update setting", "error");
        } finally {
            setTogglingKey(null);
        }
    };

    // Merge default flags with DB settings
    const displayFlags = DEFAULT_FLAGS.map((def) => {
        const found = settings.find((s) => s.key === def.key);
        return {
            key: def.key,
            label: def.label,
            desc: def.desc,
            value: found ? (found.value === true || found.value === "true") : true,
        };
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black font-['Montserrat'] tracking-tight text-foreground flex items-center gap-2.5">
                        <Sliders className="w-6 h-6 text-accent" />
                        <span>System Operations, Telemetry & Flags</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Live API quota meters, emergency killswitches, and immutable administrator audit logs.
                    </p>
                </div>

                <button
                    onClick={fetchSystemData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border/50 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all shadow-sm"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    <span>Refresh Telemetry</span>
                </button>
            </div>

            {/* Live API Health & Quota Telemetry Strip */}
            {telemetry && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gemini AI */}
                    <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-emerald-400" />
                                <span>Google Gemini AI</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {telemetry.gemini?.status}
                            </span>
                        </div>
                        <p className="text-xl font-mono font-black text-foreground">
                            {telemetry.gemini?.latencyMs}ms <span className="text-xs text-muted-foreground font-normal">latency</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{telemetry.gemini?.model}</p>
                    </div>

                    {/* Brevo Email Quota */}
                    <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-accent" />
                                <span>Brevo Email Quota</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-accent/10 text-accent border border-accent/20">
                                {telemetry.brevo?.creditsRemaining} / 300 left
                            </span>
                        </div>
                        <p className="text-xl font-mono font-black text-foreground">
                            {Math.round(((telemetry.brevo?.creditsRemaining || 300) / 300) * 100)}% <span className="text-xs text-muted-foreground font-normal">credits</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">Free Tier (300 transactional emails/day)</p>
                    </div>

                    {/* Supabase Database */}
                    <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Database className="w-4 h-4 text-blue-400" />
                                <span>Supabase Database</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {telemetry.supabase?.databaseStatus}
                            </span>
                        </div>
                        <p className="text-xl font-mono font-black text-foreground">
                            {telemetry.supabase?.databaseLatencyMs}ms <span className="text-xs text-muted-foreground font-normal">ping</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">PostgreSQL with Row Level Security (RLS)</p>
                    </div>

                    {/* Supabase Storage */}
                    <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <HardDrive className="w-4 h-4 text-purple-400" />
                                <span>Storage Bucket</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {telemetry.supabase?.storageStatus}
                            </span>
                        </div>
                        <p className="text-xl font-mono font-black text-foreground">
                            {telemetry.supabase?.trackedFiles} <span className="text-xs text-muted-foreground font-normal">chart screenshots</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">Bucket: {telemetry.supabase?.storageBucket}</p>
                    </div>
                </div>
            )}

            {/* Dynamic Feature Flags & Killswitches */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-foreground font-['Montserrat']">
                            Dynamic Feature Flags & Master Killswitches
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Toggle features instantly across the platform without redeploying code.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayFlags.map((flag) => {
                        const isToggling = togglingKey === flag.key;

                        return (
                            <div
                                key={flag.key}
                                className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between space-y-4 hover:border-accent/30 transition-all"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-foreground">{flag.label}</h3>
                                        <span
                                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                                flag.value
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                                    : "bg-red-500/10 text-red-500 border-red-500/30"
                                            }`}
                                        >
                                            {flag.value ? "Active" : "Disabled"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{flag.desc}</p>
                                    <span className="text-[10px] font-mono text-muted-foreground/70 block">
                                        Key: {flag.key}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleToggleSetting(flag.key, flag.value)}
                                    disabled={isToggling}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                                        flag.value
                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
                                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                    } disabled:opacity-50 flex items-center justify-center gap-2`}
                                >
                                    {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{isToggling ? "Updating..." : flag.value ? "Disable Killswitch" : "Enable Feature"}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Admin Audit Trail */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden space-y-0">
                <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Administrative Audit Trail ({auditLogs.length})
                        </h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">Immutable Security Log</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/30 bg-muted/20 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                <th className="px-6 py-3.5">Timestamp</th>
                                <th className="px-4 py-3.5">Admin Email</th>
                                <th className="px-4 py-3.5">Action Executed</th>
                                <th className="px-4 py-3.5">Target</th>
                                <th className="px-6 py-3.5 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-xs font-medium">
                            {auditLogs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground font-mono">
                                        {log.created_at ? format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss") : "—"}
                                    </td>
                                    <td className="px-4 py-4 text-foreground font-semibold">
                                        {log.admin_email || "System"}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent font-mono font-bold">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {log.target_type || "general"} {log.target_id ? `(${log.target_id})` : ""}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                                        {JSON.stringify(log.metadata || {})}
                                    </td>
                                </tr>
                            ))}

                            {auditLogs.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                                        No administrative events recorded yet.
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
