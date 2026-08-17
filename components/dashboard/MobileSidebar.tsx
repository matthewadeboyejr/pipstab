"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, BookOpen, BarChart3, Globe2, Sparkles, Brain, Settings, Zap, Compass, ListChecks } from "lucide-react";

const navItems = [
    { href: "/performance", label: "Performance", icon: BarChart3 },
    { href: "/outlooks", label: "Outlooks", icon: Compass },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/setups", label: "Setups & Rules", icon: ListChecks },
    { href: "/macro", label: "Macro & Intel", icon: Globe2 },
    { href: "/psychology", label: "Psychology", icon: Brain },
    { href: "/settings", label: "Settings", icon: Settings },
];

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    const pathname = usePathname();
    const supabase = createClient();
    const [hasCheckedIn, setHasCheckedIn] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const todayStr = new Date().toISOString().split('T')[0];
                const { data } = await supabase
                    .from('checkins')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('date', todayStr)
                    .limit(1);

                setHasCheckedIn(!!data && data.length > 0);
            }
        };
        checkStatus();
    }, [pathname]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between h-16 px-4">
                            <Link href="/performance" className="flex items-center gap-2" onClick={onClose}>
                                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-accent-foreground" />
                                </div>
                                <span className="text-lg font-black text-sidebar-foreground font-['Montserrat'] tracking-tighter">PIPSTAB<span className="text-accent">.</span></span>
                                <span className="px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-mono font-black text-accent">
                                    v2.4.0-beta
                                </span>
                            </Link>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            <ul className="space-y-1">
                                {navItems.map((item, i) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    const isPsychologyMissing = item.href === "/psychology" && !hasCheckedIn;

                                    return (
                                        <motion.li
                                            key={item.href}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                    ? "bg-accent/10 text-accent border border-accent/20"
                                                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-white/5"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5" />
                                                    <span>{item.label}</span>
                                                </div>
                                                {isPsychologyMissing && (
                                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Daily check-in pending" />
                                                )}
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* User */}
                        <div className="px-4 py-4 border-t border-sidebar-border">
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                                        <span className="text-xs font-bold text-accent">T</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-sidebar-foreground">Trader</p>
                                        <p className="text-[11px] text-muted-foreground">Free Plan</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-accent/80">v2.4.0-beta</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
