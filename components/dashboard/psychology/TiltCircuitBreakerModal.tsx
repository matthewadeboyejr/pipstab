"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Heart, CheckCircle2, RotateCcw, Zap, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function TiltCircuitBreakerModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Hold ">("Inhale");
    const [secondsLeft, setSecondsLeft] = useState(180); // 3-minute timer
    const [timerActive, setTimerActive] = useState(false);
    const [checks, setChecks] = useState<Record<number, boolean>>({});
    const { addToast } = useToast();

    // Box Breathing Cycle: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
    useEffect(() => {
        if (!isOpen || !timerActive) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setTimerActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, timerActive]);

    useEffect(() => {
        if (!isOpen || !timerActive) return;

        const cycleInterval = setInterval(() => {
            setPhase((prev) => {
                if (prev === "Inhale") return "Hold";
                if (prev === "Hold") return "Exhale";
                if (prev === "Exhale") return "Hold ";
                return "Inhale";
            });
        }, 4000);

        return () => clearInterval(cycleInterval);
    }, [isOpen, timerActive]);

    const startCircuitBreaker = () => {
        setIsOpen(true);
        setSecondsLeft(180);
        setTimerActive(true);
        setChecks({});
        setPhase("Inhale");
    };

    const toggleCheck = (idx: number) => {
        setChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    const allChecked = checks[0] && checks[1] && checks[2];

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                id="tour-tilt-reset"
                onClick={startCircuitBreaker}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-all font-['Montserrat'] shadow-lg shadow-red-500/5 active:scale-[0.98]"
            >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                Emergency Tilt Reset
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-red-500/30 shadow-2xl p-5 sm:p-8 space-y-5 sm:space-y-6"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground font-['Montserrat']">
                                        Session Tilt Circuit Breaker
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Disengage sympathetic nervous system and reset emotional composure
                                    </p>
                                </div>
                            </div>

                            {/* Box Breathing Visual Engine */}
                            <div className="p-6 rounded-2xl bg-white/[0.015] border border-border/40 flex flex-col items-center justify-center space-y-4 text-center relative overflow-hidden">
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    {/* Pulsing Breathing Ring */}
                                    <motion.div
                                        animate={{
                                            scale: phase === "Inhale" ? [1, 1.3] : phase === "Hold" ? 1.3 : phase === "Exhale" ? [1.3, 1] : 1,
                                            borderColor: phase === "Inhale" || phase === "Exhale" ? "#10B981" : "#F59E0B",
                                        }}
                                        transition={{ duration: 4, ease: "easeInOut" }}
                                        className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-400/40"
                                    />
                                    <div className="flex flex-col items-center justify-center z-10">
                                        <span className="text-sm font-black uppercase tracking-widest text-foreground font-mono">
                                            {phase.trim()}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-accent">
                                            {formatTime(secondsLeft)}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                    Breathe in sync with the circle (4s Inhale, 4s Hold, 4s Exhale, 4s Hold). Lower your heart rate before making any trading decision.
                                </p>
                            </div>

                            {/* 3 Hard Sanity Checks */}
                            <div className="space-y-2.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                    Pre-Execution Sanity Filter
                                </span>

                                {[
                                    "Did my pre-defined playbook setup trigger, or am I reacting to recent candlestick velocity?",
                                    "Am I increasing risk beyond my 1% limit to aggressively recover a previous stop-loss?",
                                    "If I step away from the charts for 20 minutes, will this trade still be valid under cold logic?",
                                ].map((q, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleCheck(idx)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                            checks[idx]
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                                                : "bg-white/[0.02] border-border/30 text-muted-foreground hover:bg-white/5"
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                                                checks[idx]
                                                    ? "bg-emerald-500 border-emerald-500 text-black"
                                                    : "border-border/60 bg-white/5"
                                            }`}
                                        >
                                            {checks[idx] && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-xs leading-relaxed">{q}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Dismiss Action */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    onClick={() => setTimerActive(!timerActive)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                                >
                                    <RotateCcw className="w-3 h-3" /> {timerActive ? "Pause Timer" : "Resume Timer"}
                                </button>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        addToast("Circuit breaker complete. Trade with disciplined size.", "success");
                                    }}
                                    disabled={!allChecked}
                                    className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-['Montserrat']"
                                >
                                    {allChecked ? "Composure Restored — Unlock Terminal" : "Complete 3 Checks Above"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
