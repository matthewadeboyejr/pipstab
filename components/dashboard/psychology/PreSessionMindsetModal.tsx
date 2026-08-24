"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Volume2,
    VolumeX,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    X,
    ChevronRight,
    ChevronLeft,
    Lock,
    Plus,
    Play,
    Pause,
    Target,
    Compass,
    Zap,
    AlertTriangle,
    BookOpen,
    SlidersHorizontal,
    Activity,
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

const PRE_SESSION_PLEDGES = [
    { id: "risk", text: "I have predefined my maximum risk per trade and daily loss limit." },
    { id: "edge", text: "I will only execute setups that strictly meet my documented playbook criteria." },
    { id: "mind", text: "I am emotionally detached from individual trade outcomes and accept all probabilities." },
];

export default function PreSessionMindsetModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [axioms, setAxioms] = useState<string[]>(DEFAULT_AXIOMS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [isSpeakingAll, setIsSpeakingAll] = useState(false);
    const [pledgesChecked, setPledgesChecked] = useState<Record<string, boolean>>({});
    const [selectedMood, setSelectedMood] = useState<string>("Laser-Focused");
    const [autoPromptEnabled, setAutoPromptEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState<"ritual" | "axioms">("ritual");
    const [newAxiomInput, setNewAxiomInput] = useState("");
    const { addToast } = useToast();

    useEffect(() => {
        const savedAxioms = localStorage.getItem("piptab_trader_axioms");
        if (savedAxioms) {
            try {
                const parsed = JSON.parse(savedAxioms);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAxioms(parsed);
                }
            } catch (e) {
                console.error("Failed to parse axioms:", e);
            }
        }

        const autoPref = localStorage.getItem("piptab_mindset_autoprompt");
        if (autoPref !== null) {
            setAutoPromptEnabled(autoPref === "true");
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        const lastSessionDate = localStorage.getItem("piptab_mindset_session_date");
        if (lastSessionDate !== todayKey && autoPref !== "false") {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setCurrentIndex(0);
            setPledgesChecked({});
        };
        window.addEventListener("open-mindset-ritual", handleOpen);
        return () => window.removeEventListener("open-mindset-ritual", handleOpen);
    }, []);

    useEffect(() => {
        if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setIsPlayingVoice(false);
            setIsSpeakingAll(false);
        }
    }, [isOpen]);

    const speakText = useCallback((text: string, onEndCallback?: () => void) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            addToast("Voice synthesis not supported in this browser.", "info");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

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

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsPlayingVoice(true);
        utterance.onend = () => {
            setIsPlayingVoice(false);
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
            setIsPlayingVoice(false);
            setIsSpeakingAll(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [addToast]);

    const handleToggleVoiceCurrent = () => {
        if (isPlayingVoice) {
            window.speechSynthesis.cancel();
            setIsPlayingVoice(false);
            setIsSpeakingAll(false);
        } else {
            speakText(axioms[currentIndex]);
        }
    };

    const handleSpeakAllSequence = () => {
        if (isSpeakingAll || isPlayingVoice) {
            window.speechSynthesis.cancel();
            setIsPlayingVoice(false);
            setIsSpeakingAll(false);
            return;
        }

        setIsSpeakingAll(true);
        let index = 0;

        const speakNext = () => {
            if (index < axioms.length) {
                setCurrentIndex(index);
                speakText(axioms[index], () => {
                    index++;
                    setTimeout(speakNext, 600);
                });
            } else {
                setIsSpeakingAll(false);
                addToast("All axioms recited. Mindset focused.", "success");
            }
        };

        speakNext();
    };

    const handlePledgeToggle = (id: string) => {
        setPledgesChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const allPledgesConfirmed = PRE_SESSION_PLEDGES.every((p) => pledgesChecked[p.id]);

    const handleCommitSession = () => {
        const todayKey = new Date().toISOString().slice(0, 10);
        localStorage.setItem("piptab_mindset_session_date", todayKey);
        localStorage.setItem("piptab_mindset_last_mood", selectedMood);
        setIsOpen(false);
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        addToast(`Session mindset locked! Status: ${selectedMood}. Execute with discipline.`, "success");
    };

    const toggleAutoPrompt = () => {
        const next = !autoPromptEnabled;
        setAutoPromptEnabled(next);
        localStorage.setItem("piptab_mindset_autoprompt", String(next));
        addToast(next ? "Daily mindset auto-prompt enabled" : "Daily mindset auto-prompt disabled", "info");
    };

    const handleAddCustomAxiom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAxiomInput.trim()) return;
        const updated = [...axioms, newAxiomInput.trim()];
        setAxioms(updated);
        localStorage.setItem("piptab_trader_axioms", JSON.stringify(updated));
        setNewAxiomInput("");
        addToast("Custom mental rule saved!", "success");
    };

    const handleDeleteAxiom = (idx: number) => {
        const updated = axioms.filter((_, i) => i !== idx);
        setAxioms(updated);
        localStorage.setItem("piptab_trader_axioms", JSON.stringify(updated));
        if (currentIndex >= updated.length) {
            setCurrentIndex(Math.max(0, updated.length - 1));
        }
        addToast("Rule removed", "info");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-5 bg-background/85 backdrop-blur-xl flex items-center justify-center min-h-screen">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 15 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="relative w-full max-w-2xl rounded-3xl bg-card border border-accent/30 shadow-2xl shadow-black/60 overflow-hidden flex flex-col my-auto max-h-[92vh]"
                    >
                        {/* Ambient Glows */}
                        <div className="absolute -top-24 -left-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between relative z-10 bg-card/85 backdrop-blur-md shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-inner">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm sm:text-base font-bold text-foreground font-['Montserrat']">
                                            Pre-Session Psychology Ritual
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/10 border border-accent/30 text-accent flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-accent" /> Clearance
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Calibrate your mental edge & non-negotiables before risking capital
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Navigation Tabs & Voice Audio Sequence Button */}
                        <div className="flex items-center justify-between px-6 py-2.5 border-b border-border/20 text-xs font-semibold shrink-0 bg-white/[0.015]">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTab("ritual")}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all text-xs font-['Montserrat'] ${
                                        activeTab === "ritual"
                                            ? "bg-accent text-accent-foreground font-bold shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Brain className="w-3.5 h-3.5" />
                                    <span>Mindset Alignment</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("axioms")}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all text-xs font-['Montserrat'] ${
                                        activeTab === "axioms"
                                            ? "bg-accent text-accent-foreground font-bold shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Playbook Rules ({axioms.length})</span>
                                </button>
                            </div>

                            <button
                                onClick={handleSpeakAllSequence}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                                    isSpeakingAll
                                        ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                        : "bg-white/5 border-border/40 text-muted-foreground hover:text-foreground hover:bg-white/10"
                                }`}
                                title="Recite all axioms in sequence"
                            >
                                {isSpeakingAll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-accent" />}
                                <span>{isSpeakingAll ? "Pause Sequence" : "Listen All (Audio)"}</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-5 relative z-10 flex-1 no-scrollbar">
                            {activeTab === "ritual" ? (
                                <>
                                    {/* Step 1: Axiom Carousel Card */}
                                    <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-border/40 p-5 space-y-3.5 shadow-lg overflow-hidden group">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                            <span className="flex items-center gap-1.5 text-accent font-bold">
                                                <Sparkles className="w-3 h-3" /> AXIOM #{currentIndex + 1} OF {axioms.length}
                                            </span>

                                            <button
                                                onClick={handleToggleVoiceCurrent}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                                                    isPlayingVoice && !isSpeakingAll
                                                        ? "bg-accent/20 border-accent text-accent shadow-sm"
                                                        : "bg-white/5 border-border/30 hover:border-accent/40 text-foreground"
                                                }`}
                                            >
                                                {isPlayingVoice && !isSpeakingAll ? (
                                                    <>
                                                        <div className="flex items-end gap-0.5 h-3">
                                                            <span className="w-0.5 bg-accent h-2.5 animate-pulse" />
                                                            <span className="w-0.5 bg-accent h-1.5 animate-pulse delay-75" />
                                                            <span className="w-0.5 bg-accent h-3 animate-pulse delay-150" />
                                                        </div>
                                                        <VolumeX className="w-3 h-3" /> Stop Voice
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="w-3 h-3 text-accent" /> Read Aloud
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Axiom Text */}
                                        <div className="min-h-[70px] flex items-center justify-center text-center px-4">
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={currentIndex}
                                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    transition={{ duration: 0.18 }}
                                                    className="text-base sm:text-lg font-bold text-foreground leading-relaxed font-['Montserrat'] italic"
                                                >
                                                    &ldquo;{axioms[currentIndex]}&rdquo;
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>

                                        {/* Navigation Dots & Buttons */}
                                        <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                            <button
                                                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : axioms.length - 1))}
                                                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                {axioms.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentIndex(i)}
                                                        className={`h-1.5 rounded-full transition-all ${
                                                            i === currentIndex ? "w-6 bg-accent" : "w-1.5 bg-border/60 hover:bg-muted-foreground"
                                                        }`}
                                                        aria-label={`Jump to axiom ${i + 1}`}
                                                    />
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setCurrentIndex((prev) => (prev < axioms.length - 1 ? prev + 1 : 0))}
                                                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                                            >
                                                Next <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 2: Readiness Mood Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-foreground font-mono uppercase flex items-center gap-1.5">
                                            <SlidersHorizontal className="w-3.5 h-3.5 text-accent" /> 1. Current Emotional & Mental State:
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {[
                                                {
                                                    id: "Laser-Focused",
                                                    label: "Laser-Focused",
                                                    desc: "100% Edge Clearance",
                                                    border: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                                                    icon: <Target className="w-4 h-4 text-emerald-400" />,
                                                },
                                                {
                                                    id: "Calm & Centered",
                                                    label: "Calm & Detached",
                                                    desc: "Patient Observer",
                                                    border: "border-sky-500/40 bg-sky-500/10 text-sky-300",
                                                    icon: <Compass className="w-4 h-4 text-sky-400" />,
                                                },
                                                {
                                                    id: "Slightly Distracted",
                                                    label: "Distracted",
                                                    desc: "Size Down 50%",
                                                    border: "border-amber-500/40 bg-amber-500/10 text-amber-300",
                                                    icon: <Zap className="w-4 h-4 text-amber-400" />,
                                                },
                                                {
                                                    id: "Emotional / Impatient",
                                                    label: "Tilted / Anxious",
                                                    desc: "Do Not Trade",
                                                    border: "border-red-500/40 bg-red-500/10 text-red-300",
                                                    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
                                                },
                                            ].map((m) => {
                                                const isSelected = selectedMood === m.id;
                                                return (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => setSelectedMood(m.id)}
                                                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                                                            isSelected
                                                                ? `${m.border} shadow-md scale-[1.02]`
                                                                : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            {m.icon}
                                                            <span className="text-xs font-bold text-foreground font-['Montserrat']">{m.label}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{m.desc}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Step 3: Execution Pledges */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-foreground font-mono uppercase flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-accent" /> 2. Non-Negotiable Execution Pledges:
                                        </label>
                                        <div className="space-y-2">
                                            {PRE_SESSION_PLEDGES.map((pledge) => {
                                                const isChecked = !!pledgesChecked[pledge.id];
                                                return (
                                                    <div
                                                        key={pledge.id}
                                                        onClick={() => handlePledgeToggle(pledge.id)}
                                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                                                            isChecked
                                                                ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm"
                                                                : "bg-white/[0.02] border-border/30 hover:border-border/60 text-muted-foreground"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                                                isChecked
                                                                    ? "bg-emerald-500 text-black font-bold shadow-sm"
                                                                    : "border border-border/60 bg-white/5"
                                                            }`}
                                                        >
                                                            {isChecked && <CheckCircle2 className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-xs font-semibold flex-1 leading-snug">
                                                            {pledge.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Axioms Management Tab */
                                <div className="space-y-3.5">
                                    <form onSubmit={handleAddCustomAxiom} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newAxiomInput}
                                            onChange={(e) => setNewAxiomInput(e.target.value)}
                                            placeholder="Add custom rule (e.g., 'Never add to a losing trade')..."
                                            className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2.5 bg-accent text-accent-foreground font-bold text-xs rounded-xl flex items-center gap-1.5 hover:brightness-110 transition-all font-['Montserrat']"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add Rule
                                        </button>
                                    </form>

                                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                        {axioms.map((ax, idx) => (
                                            <div
                                                key={idx}
                                                className="group p-3 rounded-xl bg-white/[0.02] border border-border/30 hover:border-accent/30 transition-all flex items-start justify-between gap-3"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <span className="w-5 h-5 rounded-md bg-accent/10 text-accent font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-xs text-foreground/90 leading-relaxed">{ax}</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => speakText(ax)}
                                                        className="p-1 rounded text-muted-foreground hover:text-accent transition-colors"
                                                        title="Read aloud"
                                                    >
                                                        <Volume2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAxiom(idx)}
                                                        className="p-1 rounded text-muted-foreground hover:text-red-400 transition-colors"
                                                        title="Delete axiom"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border/40 bg-card/85 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 shrink-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                    type="checkbox"
                                    id="autoPromptToggle"
                                    checked={autoPromptEnabled}
                                    onChange={toggleAutoPrompt}
                                    className="rounded border-border/60 text-accent focus:ring-accent cursor-pointer accent-accent"
                                />
                                <label htmlFor="autoPromptToggle" className="cursor-pointer text-[11px]">
                                    Auto-prompt when opening PipTab daily
                                </label>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={handleCommitSession}
                                    disabled={!allPledgesConfirmed}
                                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold font-['Montserrat'] transition-all shadow-lg ${
                                        allPledgesConfirmed
                                            ? "bg-accent text-accent-foreground hover:brightness-110 shadow-accent/25 cursor-pointer"
                                            : "bg-accent/30 text-accent-foreground/50 cursor-not-allowed border border-accent/20"
                                    }`}
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    {allPledgesConfirmed ? "I Commit To My Rules — Enter Session" : "Confirm Pledges to Commit"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
