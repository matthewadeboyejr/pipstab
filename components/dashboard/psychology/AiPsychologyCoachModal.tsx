"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, Brain, ShieldAlert, Zap, BookMarked, Target } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AiPsychologyCoachModalProps {
    checkins: any[];
    trades: any[];
}

export default function AiPsychologyCoachModal({ checkins, trades }: AiPsychologyCoachModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audit, setAudit] = useState<any>(null);
    const { addToast } = useToast();

    const runCoachAudit = async () => {
        setIsLoading(true);
        setIsOpen(true);

        try {
            // Group trade emotions for context
            const emotionMap: Record<string, { wins: number; total: number; pnl: number }> = {};
            trades.forEach((t) => {
                const em = t.emotion || "Neutral";
                if (!emotionMap[em]) emotionMap[em] = { wins: 0, total: 0, pnl: 0 };
                const pnl = Number(t.pnl || t.raw_pnl) || 0;
                emotionMap[em].total += 1;
                emotionMap[em].pnl += pnl;
                if (pnl > 0) emotionMap[em].wins += 1;
            });

            const res = await fetch("/api/ai/psychology-coach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    checkins: checkins.slice(0, 7),
                    emotionStats: emotionMap,
                    recentTrades: trades.slice(0, 10),
                }),
            });

            if (!res.ok) throw new Error("Failed to audit psychological patterns");

            const data = await res.json();
            setAudit(data);
            addToast("Mental Game Audit Ready!", "success");
        } catch (e: any) {
            console.error("Psychology Coach error:", e);
            addToast(e.message || "Failed to generate mental audit", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={runCoachAudit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:brightness-110 shadow-lg shadow-accent/20 transition-all font-['Montserrat'] active:scale-[0.98]"
            >
                <Sparkles className="w-3.5 h-3.5" />
                Run Mental Game Audit
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl rounded-3xl bg-card border border-border/60 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground font-['Montserrat']">
                                        AI Mental Game & Tilt Audit
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Cognitive pattern recognition and behavioral coaching
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
                                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                    <p className="text-sm font-bold text-foreground">
                                        Auditing Behavioral Tendencies & Emotional Leaks...
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Analyzing check-in scores against trade outcome correlations.
                                    </p>
                                </div>
                            ) : audit ? (
                                <div className="space-y-6">
                                    {/* Tilt Status Banner */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-accent/15 via-white/[0.02] to-transparent border border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                                                Tilt Risk Status
                                            </span>
                                            <h4 className="text-base font-extrabold text-foreground font-['Montserrat']">
                                                {audit.tilt_risk_level}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {audit.readiness_verdict}
                                            </p>
                                        </div>

                                        <div className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-xs font-mono shrink-0">
                                            CALIBRATED
                                        </div>
                                    </div>

                                    {/* Primary Cognitive Leak */}
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 font-mono">
                                            <ShieldAlert className="w-3.5 h-3.5" /> Primary Cognitive Leak
                                        </div>
                                        <p className="text-xs text-foreground/90 leading-relaxed">
                                            {audit.primary_cognitive_leak}
                                        </p>
                                    </div>

                                    {/* Emotional Expectancy */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/40 space-y-1.5">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                                            Emotional Expectancy Analysis
                                        </span>
                                        <p className="text-xs text-foreground/90 leading-relaxed">
                                            {audit.emotional_expectancy_summary}
                                        </p>
                                    </div>

                                    {/* Mental Rules to Enforce */}
                                    <div className="space-y-2.5">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-accent" />
                                            Top 3 Psychological Rules to Enforce
                                        </span>
                                        <div className="space-y-2">
                                            {audit.mental_rules_to_enforce?.map((rule: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-border/30 text-xs text-foreground/90"
                                                >
                                                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                                                        {i + 1}
                                                    </span>
                                                    <span className="leading-relaxed">{rule}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pre-Market Anchor */}
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                                            <BookMarked className="w-3.5 h-3.5" /> Pre-Session Mental Anchor
                                        </div>
                                        <p className="text-xs font-bold text-foreground italic leading-relaxed">
                                            "{audit.pre_market_anchor}"
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
