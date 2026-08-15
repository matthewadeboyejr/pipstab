"use client";

import { Shield, Sparkles, Activity, Bell } from "lucide-react";

export default function AdminTopBar() {
    return (
        <header className="h-16 border-b border-border/40 bg-[#090D14]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SYSTEM LIVE</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                    PostgreSQL RLS Active • Next.js 16 Production Runtime
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-foreground">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span>Admin Mode</span>
                </div>
            </div>
        </header>
    );
}
