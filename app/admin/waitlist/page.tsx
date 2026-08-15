"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Mail,
    Search,
    Download,
    RefreshCcw,
    CheckCircle2,
    Clock,
    XCircle,
    UserCheck,
    Send,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";

export default function AdminWaitlistPage() {
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    const fetchWaitlist = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                query: searchQuery,
                status: statusFilter,
            });

            const res = await fetch(`/api/admin/waitlist?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load waitlist");
            const data = await res.json();
            setWaitlist(data.waitlist || []);
        } catch (error: any) {
            console.error("Fetch waitlist error:", error);
            addToast(error.message || "Failed to load waitlist", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitlist();
    }, [statusFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWaitlist();
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch("/api/admin/waitlist", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");
            addToast(`Lead status updated to ${newStatus}`, "success");
            fetchWaitlist();
        } catch (error: any) {
            addToast(error.message || "Failed to update status", "error");
        }
    };

    const exportToCSV = () => {
        if (waitlist.length === 0) {
            addToast("No leads to export", "error");
            return;
        }

        const headers = ["Full Name", "Email", "Market", "Status", "Date Submitted"];
        const rows = waitlist.map((w) => [
            `"${w.full_name}"`,
            `"${w.email}"`,
            `"${w.market || "General"}"`,
            `"${w.status}"`,
            `"${w.created_at ? format(new Date(w.created_at), "yyyy-MM-dd HH:mm") : ""}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `piptab_waitlist_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast("Exported waitlist leads to CSV!", "success");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Mail className="w-5 h-5 text-accent" />
                        Early Access Lead Manager
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Triage incoming waitlist registrations, approve beta traders, and export leads for email campaigns
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-border/40 text-xs font-semibold text-foreground transition-all shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={fetchWaitlist}
                        disabled={isLoading}
                        className="p-2 rounded-xl bg-white/5 border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Search & Status Filters */}
            <div className="p-4 rounded-2xl bg-card border border-border/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-border/50 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-all"
                    />
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                </form>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Status:</span>
                    {["all", "pending", "approved", "invited"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                                statusFilter === s
                                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                    : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Waitlist Table */}
            <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/30 bg-white/[0.01] text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                <th className="px-6 py-3.5">Lead Name</th>
                                <th className="px-4 py-3.5">Email</th>
                                <th className="px-4 py-3.5">Primary Market</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5">Registered</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-xs font-medium">
                            {waitlist.map((lead: any) => (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        {lead.full_name}
                                    </td>
                                    <td className="px-4 py-4 text-foreground/80 font-mono">
                                        {lead.email}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-semibold text-muted-foreground">
                                            {lead.market || "General"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                                lead.status === "approved" || lead.status === "invited"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}
                                        >
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {lead.created_at ? format(new Date(lead.created_at), "MMM d, yyyy") : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {lead.status === "pending" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(lead.id, "approved")}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {lead.status === "approved" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(lead.id, "invited")}
                                                    className="px-2.5 py-1 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 text-xs font-semibold transition-all"
                                                >
                                                    Mark Invited
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {waitlist.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                                        No waitlist leads found matching your criteria.
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
