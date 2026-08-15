"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Shield,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    UserCheck,
    UserX,
    Activity,
    BookOpen,
    Clock,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/context/ToastContext";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const { addToast } = useToast();

    const fetchUsers = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: "20",
                query: searchQuery,
                role: roleFilter,
            });

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load user directory");
            const data = await res.json();

            setUsers(data.users || []);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error("Fetch users error:", error);
            addToast(error.message || "Failed to load users", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, [roleFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const handleRoleChange = async (userId: string, newRole: "admin" | "trader") => {
        setIsUpdatingRole(true);
        try {
            const res = await fetch("/api/admin/users/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role: newRole }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update role");

            addToast(`Updated user role to ${newRole}`, "success");
            setSelectedUser(null);
            fetchUsers(pagination.page);
        } catch (error: any) {
            addToast(error.message || "Failed to update role", "error");
        } finally {
            setIsUpdatingRole(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" />
                        Trader Directory
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage platform members, inspect trade counts, and configure administrative roles
                    </p>
                </div>

                <button
                    onClick={() => fetchUsers(pagination.page)}
                    disabled={isLoading}
                    className="p-2 rounded-xl bg-white/5 border border-border/40 text-muted-foreground hover:text-foreground transition-all w-fit"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Search & Filters */}
            <div className="p-4 rounded-2xl bg-card border border-border/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by display name..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-border/50 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-all"
                    />
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                </form>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Role:</span>
                    {["all", "admin", "trader"].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                                roleFilter === r
                                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                    : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/30 bg-white/[0.01] text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                                <th className="px-6 py-3.5">Trader</th>
                                <th className="px-4 py-3.5">Role</th>
                                <th className="px-4 py-3.5">Logged Trades</th>
                                <th className="px-4 py-3.5">Broker Sync</th>
                                <th className="px-4 py-3.5">Joined</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-xs font-medium">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                                            {u.display_name[0]?.toUpperCase() || "T"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{u.display_name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                                                {u.id}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                                u.role === "admin"
                                                    ? "bg-accent/20 text-accent border-accent/40"
                                                    : "bg-white/5 text-muted-foreground border-border/40"
                                            }`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 font-mono font-bold text-foreground">
                                        {u.total_trades}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`text-[10px] font-semibold flex items-center gap-1.5 ${
                                                u.deriv_connected ? "text-emerald-400" : "text-muted-foreground"
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    u.deriv_connected ? "bg-emerald-400" : "bg-muted-foreground/40"
                                                }`}
                                            />
                                            {u.deriv_connected ? "Deriv Linked" : "Manual Only"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedUser(u)}
                                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-foreground border border-border/30 transition-all"
                                        >
                                            Inspect
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {users.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                                        No traders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                        Showing {users.length} of {pagination.total} registered traders
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchUsers(pagination.page - 1)}
                            disabled={pagination.page <= 1 || isLoading}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-border/30 disabled:opacity-40 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-foreground">
                            {pagination.page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => fetchUsers(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-border/30 disabled:opacity-40 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Inspect User Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg rounded-2xl bg-card border border-border/50 shadow-2xl p-6 space-y-5"
                        >
                            <div className="flex items-center justify-between border-b border-border/30 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                                        {selectedUser.display_name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                            {selectedUser.display_name}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground font-mono">{selectedUser.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-border/20">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Current Role</span>
                                    <p className="font-extrabold text-foreground mt-0.5 uppercase">{selectedUser.role}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-border/20">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Trades Logged</span>
                                    <p className="font-extrabold text-foreground mt-0.5 font-mono">{selectedUser.total_trades}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-border/20">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Broker Connections</span>
                                    <p className="font-extrabold text-foreground mt-0.5">
                                        {selectedUser.deriv_connected ? "Deriv OAuth Linked" : "No Linked Broker"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-border/20">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Registered Date</span>
                                    <p className="font-extrabold text-foreground mt-0.5">
                                        {selectedUser.created_at ? format(new Date(selectedUser.created_at), "MMM d, yyyy") : "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Role Toggle Action */}
                            <div className="pt-2 border-t border-border/30 space-y-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                    Administrative Role Assignment
                                </span>
                                <div className="flex items-center gap-2">
                                    {selectedUser.role === "admin" ? (
                                        <button
                                            onClick={() => handleRoleChange(selectedUser.id, "trader")}
                                            disabled={isUpdatingRole}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            <UserX className="w-4 h-4" />
                                            Demote to Standard Trader
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRoleChange(selectedUser.id, "admin")}
                                            disabled={isUpdatingRole}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            Promote to Administrator
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
