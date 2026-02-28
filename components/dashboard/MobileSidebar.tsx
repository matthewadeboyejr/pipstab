"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, BookOpen, BarChart3, Globe2, Sparkles, Brain, Settings, Zap } from "lucide-react";

const navItems = [
    { href: "/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/macro", label: "Macro", icon: Globe2 },
    { href: "/fundamentals", label: "AI Fundamentals", icon: Sparkles },
    { href: "/psychology", label: "Psychology", icon: Brain },
    { href: "/settings", label: "Settings", icon: Settings },
];

interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    const pathname = usePathname();

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
                            <Link href="/overview" className="flex items-center gap-2" onClick={onClose}>
                                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-accent-foreground" />
                                </div>
                                <span className="text-lg font-bold text-sidebar-foreground font-['Montserrat']">pipTAB</span>
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
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                    ? "bg-accent/10 text-accent border border-accent/20"
                                                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-white/5"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* User */}
                        <div className="px-4 py-4 border-t border-sidebar-border">
                            <div className="flex items-center gap-3 px-3 py-2">
                                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                                    <span className="text-xs font-bold text-accent">T</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-sidebar-foreground">Trader</p>
                                    <p className="text-[11px] text-muted-foreground">Free Plan</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
