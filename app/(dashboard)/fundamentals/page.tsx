"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Landmark,
    Globe,
    Calendar,
    ShieldCheck,
    Zap,
    LayoutDashboard,
} from "lucide-react";
import MacroEngine from "@/components/dashboard/fundamentals/MacroEngine";
import NewsPulse from "@/components/dashboard/fundamentals/NewsPulse";
import EconomicCalendar from "@/components/dashboard/fundamentals/EconomicCalendar";
import JournalAuditor from "@/components/dashboard/fundamentals/JournalAuditor";
import { useSearchParams, useRouter } from "next/navigation";

const tabs = [
    { id: "macro", label: "Macro Engine", icon: Zap, color: "text-accent" },
    { id: "news", label: "Sentiment Pulse", icon: Globe, color: "text-blue-400" },
    { id: "calendar", label: "Economic Calendar", icon: Calendar, color: "text-amber-400" },
    { id: "auditor", label: "Journal Auditor", icon: ShieldCheck, color: "text-emerald-400" },
];

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function FundamentalsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "macro");

    // Sync tab with URL for deep linking
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (id: string) => {
        setActiveTab(id);
        router.push(`/fundamentals?tab=${id}`, { scroll: false });
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-accent" />
                        Intelligence Center
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Institutional-grade fundamental tools powered by Gemini 2.0</p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-border/50 rounded-2xl overflow-x-auto max-w-full no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/10 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : "opacity-70"}`} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === "macro" && <MacroEngine />}
                        {activeTab === "news" && <NewsPulse />}
                        {activeTab === "calendar" && <EconomicCalendar />}
                        {activeTab === "auditor" && <JournalAuditor />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function FundamentalsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        }>
            <FundamentalsContent />
        </Suspense>
    );
}
