"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Bell, Plus, Menu, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import LogTradeModal from "@/components/dashboard/LogTradeModal";
import { createClient } from "@/utils/supabase/client";
import AccountSelector from "@/components/dashboard/AccountSelector";

const routeTitles: Record<string, string> = {
    "/overview": "Overview",
    "/journal": "Trade Journal",
    "/analytics": "Analytics & Alpha Leakage",
    "/macro": "Macro Confluence",
    "/fundamentals": "AI Fundamental Analysis",
    "/psychology": "Psychology Profile",
    "/settings": "Settings",
};

interface TopBarProps {
    onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
    const pathname = usePathname();
    const title = routeTitles[pathname] || "Dashboard";
    const { theme, toggleTheme } = useTheme();
    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const supabase = createClient();
    const [firstName, setFirstName] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.first_name) {
                setFirstName(user.user_metadata.first_name);
            }
        }
        fetchUser();
    }, []);

    // Create a personalized title if on overview
    const displayTitle = (pathname === "/overview" && firstName) ? `Welcome back, ${firstName}` : title;

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl"
        >
            {/* Left: Menu + Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground font-['Montserrat']">{displayTitle}</h1>
                    <p className="text-[11px] text-muted-foreground hidden sm:block">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {/* Right: Account Selector, Search, Theme Toggle, Notifications, Quick Add */}
            <div className="flex items-center gap-2">
                {/* Account Selector */}
                <AccountSelector />

                {/* Search */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-border/50 w-64 ml-2">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Search trades, insights..."
                        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full font-['Montserrat']"
                    />
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors"
                    aria-label="Toggle theme"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {theme === "dark" ? (
                            <motion.div
                                key="sun"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sun className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="moon"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Moon className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* Notification bell */}
                <button className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
                </button>

                {/* Quick add trade */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTradeModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all font-['Montserrat']"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Log Trade</span>
                </motion.button>
            </div>

            {/* Log Trade Modal */}
            <LogTradeModal open={tradeModalOpen} onClose={() => setTradeModalOpen(false)} />
        </motion.header>
    );
}

