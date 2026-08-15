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
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";

export default function AdminSystemPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingKey, setTogglingKey] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchSystemData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/settings");
            if (!res.ok) throw new Error("Failed to load system settings");
            const data = await res.json();
            setSettings(data.settings || []);
            setAuditLogs(data.audit_logs || []);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-accent" />
                        System Operations & Audit Logs
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage platform feature flags, emergency killswitches, and inspect immutable audit trails
                    </p>
                </div>

                <button
                    onClick={fetchSystemData}
                    disabled={isLoading}
                    className="p-2 rounded-xl bg-white/5 border border-border/40 text-muted-foreground hover:text-foreground transition-all w-fit"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Feature Flags Grid */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-['Montserrat']">
                    Dynamic Feature Flags & Killswitches
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {settings.map((s) => {
                        const isEnabled = s.value === true || s.value === "true";
                        const isToggling = togglingKey === s.key;

                        return (
                            <div
                                key={s.key}
                                className="p-5 rounded-2xl bg-card border border-border/40 space-y-4 shadow-sm flex flex-col justify-between"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground font-mono">
                                            {s.key}
                                        </span>
                                        <span
                                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                                isEnabled
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                            }`}
                                        >
                                            {isEnabled ? "Active" : "Disabled"}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {s.description || "Platform operational flag"}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleToggleSetting(s.key, isEnabled)}
                                    disabled={isToggling}
                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${
                                        isEnabled
                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    } disabled:opacity-50`}
                                >
                                    {isToggling ? "Updating..." : isEnabled ? "Disable Flag" : "Enable Flag"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Audit Logs Stream */}
            <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm space-y-0">
                <div className="p-4 border-b border-border/30 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-['Montserrat']">
                            Administrative Audit Trail
                        </h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">Last 25 Events</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/30 bg-white/[0.01] text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                <th className="px-6 py-3.5">Timestamp</th>
                                <th className="px-4 py-3.5">Admin</th>
                                <th className="px-4 py-3.5">Action</th>
                                <th className="px-4 py-3.5">Target Type</th>
                                <th className="px-6 py-3.5 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-xs font-medium">
                            {auditLogs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
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
