"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Globe2, Brain, Plus, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import LogTradeModal from "@/components/dashboard/LogTradeModal";

export default function BottomNavBar() {
    const pathname = usePathname();
    const supabase = createClient();
    const [hasCheckedIn, setHasCheckedIn] = useState(true);
    const [logTradeOpen, setLogTradeOpen] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const todayStr = new Date().toISOString().split("T")[0];
                const { data } = await supabase
                    .from("checkins")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("date", todayStr)
                    .limit(1);

                setHasCheckedIn(!!data && data.length > 0);
            }
        };
        checkStatus();
    }, [pathname]);

    const navItems = [
        { href: "/performance", label: "Performance", icon: BarChart3 },
        { href: "/journal", label: "Journal", icon: BookOpen },
        { id: "quick_log", label: "Log Trade", isAction: true },
        { href: "/macro", label: "Macro", icon: Globe2 },
        { href: "/psychology", label: "Psychology", icon: Brain, badge: !hasCheckedIn },
    ];

    return (
        <>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070A0F]/90 backdrop-blur-xl border-t border-border/40 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
                <nav className="flex items-center justify-around max-w-md mx-auto">
                    {navItems.map((item) => {
                        if (item.isAction) {
                            return (
                                <button
                                    key="quick_log"
                                    onClick={() => setLogTradeOpen(true)}
                                    aria-label="Quick Log Trade"
                                    className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg shadow-accent/30 border-2 border-background group-active:scale-95 transition-all">
                                        <Plus className="w-6 h-6 stroke-[2.5]" />
                                    </div>
                                    <span className="text-[10px] font-bold text-accent mt-0.5 font-['Montserrat']">
                                        Log Trade
                                    </span>
                                </button>
                            );
                        }

                        const Icon = item.icon!;
                        const isActive = pathname === item.href || (item.href === "/performance" && pathname === "/overview");

                        return (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "text-accent"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active-pill"
                                        className="absolute inset-0 bg-accent/10 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <div className="relative">
                                    <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
                                    )}
                                </div>
                                <span className={`text-[10px] mt-1 font-['Montserrat'] font-semibold tracking-tight ${isActive ? "font-bold text-accent" : ""}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Log Trade Modal triggered from Mobile Floating Button */}
            <LogTradeModal
                open={logTradeOpen}
                onClose={() => setLogTradeOpen(false)}
            />
        </>
    );
}
