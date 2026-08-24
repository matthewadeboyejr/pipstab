"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Volume2,
    VolumeX,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    RefreshCw,
    Quote,
    Activity,
    Radio,
    Clock,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

const DEFAULT_AXIOMS = [
    "A missed trade costs $0. An impulsive FOMO trade costs real capital.",
    "My edge is statistical over 100 trades, not emotional over the next 5 minutes.",
    "I do not move my stop-loss into wider territory once entered.",
    "After two consecutive losses in a session, I close my charts and step away.",
    "I accept that uncertainty is the prerequisite for profit. Every outcome is probabilistic.",
    "I trade what I see on the charts, not what I hope or wish to happen.",
    "Capital preservation is my primary job. Profitability is a byproduct of disciplined risk management.",
];

export default function DailyMindsetWidget() {
    const [axioms, setAxioms] = useState<string[]>(DEFAULT_AXIOMS);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isCommittedToday, setIsCommittedToday] = useState(false);
    const [lastMood, setLastMood] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const saved = localStorage.getItem("piptab_trader_axioms");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAxioms(parsed);
                }
            } catch (e) {}
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        const lastSession = localStorage.getItem("piptab_mindset_session_date");
        if (lastSession === todayKey) {
            setIsCommittedToday(true);
            setLastMood(localStorage.getItem("piptab_mindset_last_mood") || "Focused");
        }

        const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
        );
        setActiveIndex(dayOfYear % DEFAULT_AXIOMS.length);
    }, []);

    const speakCurrent = useCallback(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            addToast("Voice synthesis not supported in this browser.", "info");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();
        const currentAxiom = axioms[activeIndex] || DEFAULT_AXIOMS[0];
        const utterance = new SpeechSynthesisUtterance(currentAxiom);
        utterance.rate = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) =>
                (v.name.includes("Natural") ||
                    v.name.includes("Samantha") ||
                    v.name.includes("Daniel") ||
                    v.name.includes("Google") ||
                    v.name.includes("Premium")) &&
                v.lang.startsWith("en")
        ) || voices.find((v) => v.lang.startsWith("en"));

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [axioms, activeIndex, isSpeaking, addToast]);

    const handleNextAxiom = () => {
        setActiveIndex((prev) => (prev + 1) % axioms.length);
    };

    const handleOpenModal = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-mindset-ritual"));
        }
    };

    const currentAxiom = axioms[activeIndex] || DEFAULT_AXIOMS[0];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/95 to-accent/[0.04] border border-accent/20 hover:border-accent/35 transition-all p-5 shadow-lg shadow-black/20 group">
            {/* Ambient Background Watermark and Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <Quote className="absolute right-4 bottom-2 w-28 h-28 text-white/[0.02] pointer-events-none select-none" />

            <div className="flex flex-col gap-3 relative z-10">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-inner">
                                <Brain className="w-4 h-4" />
                            </div>
                            {isSpeaking && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
                                </span>
                            )}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-bold text-foreground font-['Montserrat'] tracking-wide">
                                    Daily Trading Mindset & Non-Negotiable
                                </h3>
                                {isCommittedToday ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shadow-sm">
                                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                        <span>Session Cleared {lastMood ? `• ${lastMood}` : ""}</span>
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                                        <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
                                        <span>Pre-Session Check Pending</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono">
                                Rule #{activeIndex + 1} of {axioms.length} • Mental calibration for today&apos;s session
                            </p>
                        </div>
                    </div>

                    {/* Controls Strip */}
                    <div className="flex items-center gap-2">
                        {/* Audio Wave Visualizer & Listen Button */}
                        <button
                            onClick={speakCurrent}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
                                isSpeaking
                                    ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/25"
                                    : "bg-white/5 border-border/40 hover:border-accent/40 text-foreground hover:bg-white/10"
                            }`}
                            title={isSpeaking ? "Stop Voice Audio" : "Listen to Mantra (Text-to-Speech)"}
                        >
                            {isSpeaking ? (
                                <>
                                    <div className="flex items-end gap-0.5 h-3.5">
                                        <span className="w-0.5 bg-black h-3 animate-pulse" />
                                        <span className="w-0.5 bg-black h-2 animate-pulse delay-75" />
                                        <span className="w-0.5 bg-black h-3.5 animate-pulse delay-150" />
                                    </div>
                                    <VolumeX className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Stop</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-3.5 h-3.5 text-accent" />
                                    <span className="text-[11px]">Read Out Loud</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleNextAxiom}
                            className="p-2 rounded-xl bg-white/5 border border-border/40 hover:border-border/70 text-muted-foreground hover:text-foreground transition-all"
                            title="Rotate to Next Axiom"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={handleOpenModal}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent/15 border border-accent/35 text-accent hover:bg-accent hover:text-accent-foreground text-xs font-bold font-['Montserrat'] transition-all shadow-sm group/btn"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Mindset Ritual</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                    </div>
                </div>

                {/* Axiom Content Box */}
                <div className="relative rounded-xl bg-black/25 border border-white/5 p-4 sm:p-5 backdrop-blur-sm">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={activeIndex}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                            className="text-sm sm:text-base font-semibold text-foreground/95 leading-relaxed italic font-['Montserrat'] pl-2 border-l-2 border-accent/60"
                        >
                            &ldquo;{currentAxiom}&rdquo;
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
