"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Globe2,
    Sparkles,
    Brain,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Zap,
    ListChecks,
    AlertTriangle,
    Shield,
    Compass,
} from "lucide-react";

const navSections = [
    {
        label: "Core",
        items: [
            { href: "/performance", label: "Performance", icon: BarChart3 },
            { href: "/outlooks", label: "Outlooks", icon: Compass },
            { href: "/journal", label: "Journal", icon: BookOpen },
            { href: "/setups", label: "Setups & Rules", icon: ListChecks },
            { href: "/macro", label: "Macro & Intel", icon: Globe2 },
        ],
    },
    {
        label: "You",
        items: [
            { href: "/psychology", label: "Psychology", icon: Brain },
            { href: "/settings", label: "Settings", icon: Settings },
        ],
    },
];

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { addToast } = useToast();
    const supabase = createClient();
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(true); // Default true to prevent flash
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserAndStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Check if admin role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'admin') {
                    setIsAdmin(true);
                }

                // Check if they have a check-in for today
                const todayStr = new Date().toISOString().split('T')[0];
                const { data } = await supabase
                    .from('checkins')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('date', todayStr)
                    .limit(1);

                if (!data || data.length === 0) {
                    setHasCheckedIn(false);
                } else {
                    setHasCheckedIn(true);
                }
            }
        }
        fetchUserAndStatus();
    }, [pathname]); // Re-run when pathname changes so it updates after they check in!

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            addToast(error.message, "error");
            return;
        }
        router.push("/auth/sign-in");
    };

    // Calculate initials
    const firstName = user?.user_metadata?.first_name || "";
    const lastName = user?.user_metadata?.last_name || "";
    const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "T";
    const displayName = firstName ? `${firstName} ${lastName}` : "Trader";

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 shrink-0">
                <Link href="/performance" className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-lg font-black text-sidebar-foreground whitespace-nowrap font-['Montserrat'] tracking-tighter"
                            >
                                PIPSTAB<span className="text-accent text-3xl">.</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6">
                {navSections.map((section) => (
                    <div key={section.label}>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
                                >
                                    {section.label}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                const isPsychologyMissing = item.href === "/psychology" && !hasCheckedIn;

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-accent/10 text-accent"
                                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted/70 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 rounded-xl bg-accent/10 border border-accent/20"
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                            <div className="relative">
                                                <Icon
                                                    className={`w-5 h-5 shrink-0 relative z-10 transition-colors ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-sidebar-foreground"
                                                        }`}
                                                />
                                                {collapsed && isPsychologyMissing && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse z-20" />
                                                )}
                                            </div>
                                            <AnimatePresence>
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="relative z-10 whitespace-nowrap overflow-hidden flex-1 flex items-center justify-between"
                                                    >
                                                        <span>{item.label}</span>
                                                        {isPsychologyMissing && (
                                                            <span
                                                                className="flex items-center gap-1 text-[10px] font-bold text-amber-400 font-mono"
                                                                title="Daily readiness check-in pending"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                            </span>
                                                        )}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {isAdmin && (
                    <div className="pt-2">
                        <Link
                            href="/admin"
                            className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-all shadow-sm"
                        >
                            <Shield className="w-4 h-4 shrink-0 text-accent" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative z-10 whitespace-nowrap overflow-hidden"
                                    >
                                        Command Center
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
                {/* User avatar */}
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent">{initials}</span>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <p className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">{displayName}</p>
                                <p className="text-[11px] text-muted-foreground whitespace-nowrap">Free Plan</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Log Out button */}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all group"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                Log Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-white/5 transition-all"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 shrink-0" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 shrink-0" />
                    )}
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                Collapse
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
