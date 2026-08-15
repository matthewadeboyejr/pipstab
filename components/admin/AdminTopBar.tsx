"use client";

import { Shield, Sparkles, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function AdminTopBar() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="h-16 border-b border-border/40 bg-[#090D14]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SYSTEM OPERATIONAL</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                    PipTab Platform Operations & Management
                </span>
            </div>

            <div className="flex items-center gap-3">
                {currentTime && (
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-border/30 text-xs text-muted-foreground font-mono">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>{format(currentTime, "HH:mm:ss")} UTC</span>
                    </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/30 text-xs font-semibold text-accent">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Administrator</span>
                </div>
            </div>
        </header>
    );
}
