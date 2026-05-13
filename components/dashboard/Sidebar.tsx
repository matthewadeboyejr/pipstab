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
} from "lucide-react";

const navSections = [
    {
        label: "Core",
        items: [
            { href: "/overview", label: "Overview", icon: LayoutDashboard },
            { href: "/journal", label: "Journal", icon: BookOpen },
            { href: "/setups", label: "Setups & Rules", icon: ListChecks },
            { href: "/analytics", label: "Analytics", icon: BarChart3 },
            { href: "/macro", label: "Macro", icon: Globe2 },
            { href: "/fundamentals", label: "AI Fundamentals", icon: Sparkles },
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

    useEffect(() => {
        const fetchUserAndStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
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
                <Link href="/overview" className="flex items-center gap-2 overflow-hidden">
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

                {/* Missing Check-in Warning */}
                <AnimatePresence>
                    {!hasCheckedIn && pathname !== "/psychology" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: "auto", scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className="mb-6"
                        >
                            <Link href="/psychology" className="block p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 transition-colors group relative overflow-hidden">
                                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex flex-col items-center justify-center shrink-0">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 mb-0.5" />
                                    </div>
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <p className="text-xs font-bold text-amber-500 font-['Montserrat'] mb-0.5">Missing Check-in</p>
                                                <p className="text-[10px] text-amber-500/80 leading-tight">Complete your daily psychology log to trade safely.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-accent/10 text-accent"
                                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-white/5"
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute inset-0 rounded-xl bg-accent/10 border border-accent/20"
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                            <Icon
                                                className={`w-5 h-5 shrink-0 relative z-10 transition-colors ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-sidebar-foreground"
                                                    }`}
                                            />
                                            <AnimatePresence>
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="relative z-10 whitespace-nowrap overflow-hidden"
                                                    >
                                                        {item.label}
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
