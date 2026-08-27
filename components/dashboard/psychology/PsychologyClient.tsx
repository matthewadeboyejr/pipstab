"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import {
    Brain,
    BatteryCharging,
    Smile,
    ShieldCheck,
    AlertCircle,
    Loader2,
    TrendingUp,
    Activity,
    Ban,
    Zap,
    Clock,
    Sparkles,
    CheckCircle2,
} from "lucide-react";
import EmotionPnlMatrix from "@/components/dashboard/psychology/EmotionPnlMatrix";
import TiltCircuitBreakerModal from "@/components/dashboard/psychology/TiltCircuitBreakerModal";
import TraderAxioms from "@/components/dashboard/psychology/TraderAxioms";
import AiPsychologyCoachModal from "@/components/dashboard/psychology/AiPsychologyCoachModal";

interface Checkin {
    id: string;
    date: string;
    rawDate: string;
    sleep_hours: number;
    mood: string;
    distractions: string;
    market_bias: string;
    preparedness_score: number;
}

interface PsychologyClientProps {
    initialCheckins: Checkin[];
    hasCheckedInToday: boolean;
    trades?: any[];
}

const moods = ["Focused", "Calm", "Neutral", "Anxious", "Euphoric", "Tired", "Frustrated"];

export default function PsychologyClient({
    initialCheckins,
    hasCheckedInToday,
    trades = [],
}: PsychologyClientProps) {
    const supabase = createClient();
    const router = useRouter();
    const { addToast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [sleep, setSleep] = useState<string>("7.5");
    const [mood, setMood] = useState<string>("Focused");
    const [bias, setBias] = useState<string>("Neutral");
    const [distractions, setDistractions] = useState<string>("");
    const [macroChecked, setMacroChecked] = useState(false);

    // --- Readiness Algorithm ---
    const readiness = useMemo(() => {
        let score = 0;
        const s = parseFloat(sleep) || 0;

        // 1. Sleep (30 pts)
        if (s >= 8) score += 30;
        else if (s >= 7) score += 25;
        else if (s >= 6) score += 15;
        else score += 0;

        // 2. Mood (30 pts)
        if (mood === "Focused" || mood === "Calm") score += 30;
        else if (mood === "Neutral") score += 25;
        else if (mood === "Anxious" || mood === "Euphoric") score += 12;
        else score += 0;

        // 3. Bias (20 pts)
        if (bias === "Neutral") score += 20;
        else score += 8;

        // 4. Distractions (20 pts)
        const d = distractions.trim();
        if (d.length === 0 || d.toLowerCase() === "none") score += 20;
        else if (d.length < 25) score += 10;
        else score += 0;

        // Verdict
        let verdict = "Optimal Trading Clearance";
        let color = "text-emerald-400";
        if (score < 70) {
            verdict = "Session Violation Risk";
            color = "text-red-400";
        } else if (score < 90) {
            verdict = "Caution Advised (Compromised Edge)";
            color = "text-amber-400";
        }

        return { score, verdict, color };
    }, [sleep, mood, bias, distractions]);

    const latestCheckin = initialCheckins[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!macroChecked) {
            addToast("Please confirm you've checked macroeconomic calendar events.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const payload = {
                user_id: user.id,
                date: new Date().toISOString().split("T")[0],
                sleep_hours: parseFloat(sleep),
                mood,
                distractions,
                market_bias: bias,
                preparedness_score: readiness.score,
            };

            const { error } = await supabase.from("checkins").insert(payload);
            if (error) throw error;

            addToast("Cognitive readiness logged. Trade with strict risk parameters.", "success");
            router.refresh();
        } catch (err: any) {
            addToast(err.message || "Failed to submit check-in", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
            {/* Top Tactical Control Bar: AI Coach + Circuit Breaker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Cognitive Shield & Mindset Hub
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            {initialCheckins.length} Total Check-ins Recorded
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Emergency Tilt Reset */}
                    <TiltCircuitBreakerModal />

                    {/* AI Mental Game Audit */}
                    <AiPsychologyCoachModal checkins={initialCheckins} trades={trades} />
                </div>
            </div>

            {/* Main Cognitive Readiness & History Log Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Form or Clearance Card (2 Cols) */}
                <div id="tour-readiness-card" className="lg:col-span-2">
                    {!hasCheckedInToday ? (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full bg-card border border-border/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                            <div>
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-accent" />
                                            Daily Pre-Session Readiness Audit
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Calculate your live cognitive clearance before entering live market orders.
                                        </p>
                                    </div>

                                    {/* Live Dial */}
                                    <div className="hidden sm:flex flex-col items-center shrink-0">
                                        <div className="relative w-14 h-14 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                                <motion.circle
                                                    cx="28"
                                                    cy="28"
                                                    r="24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    strokeLinecap="round"
                                                    className={readiness.color}
                                                    strokeDasharray={2 * Math.PI * 24}
                                                    initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                                                    animate={{ strokeDashoffset: (1 - readiness.score / 100) * 2 * Math.PI * 24 }}
                                                />
                                            </svg>
                                            <span className={`absolute text-xs font-black font-mono ${readiness.color}`}>
                                                {readiness.score}%
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                                            Readiness
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                                <BatteryCharging className="w-3.5 h-3.5 text-accent" /> Sleep Duration
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="24"
                                                value={sleep}
                                                onChange={(e) => setSleep(e.target.value)}
                                                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent font-mono"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                                <Smile className="w-3.5 h-3.5 text-accent" /> Core Emotion
                                            </label>
                                            <select
                                                value={mood}
                                                onChange={(e) => setMood(e.target.value)}
                                                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                                            >
                                                {moods.map((m) => (
                                                    <option key={m} value={m}>
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                                Directional Bias
                                            </label>
                                            <select
                                                value={bias}
                                                onChange={(e) => setBias(e.target.value)}
                                                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                                            >
                                                <option value="Neutral">Neutral / Reactive (Best)</option>
                                                <option value="Long">Strong Long Bias</option>
                                                <option value="Short">Strong Short Bias</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                                            <AlertCircle className="w-3.5 h-3.5 text-accent" /> External Distractions or Stress
                                        </label>
                                        <input
                                            type="text"
                                            value={distractions}
                                            onChange={(e) => setDistractions(e.target.value)}
                                            placeholder="e.g. None, or slight fatigue from travel..."
                                            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white/[0.015] border border-border/30 rounded-xl p-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] text-muted-foreground font-mono font-bold uppercase">
                                                Projected Clearance
                                            </p>
                                            <p className={`text-sm font-black font-['Montserrat'] ${readiness.color}`}>
                                                {readiness.verdict} ({readiness.score}/100)
                                            </p>
                                        </div>

                                        <div className="flex-1 border-t md:border-t-0 md:border-l border-border/30 pt-3 md:pt-0 md:pl-4 w-full">
                                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={macroChecked}
                                                    onChange={(e) => setMacroChecked(e.target.checked)}
                                                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent"
                                                />
                                                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                    I have verified the economic calendar for high-impact releases.
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !macroChecked}
                                            className="px-6 py-3 bg-accent text-accent-foreground rounded-xl text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed font-['Montserrat'] shadow-lg shadow-accent/20"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            Log Clearance & Unlock Session
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[380px] relative overflow-hidden shadow-sm"
                        >
                            <div
                                className={`absolute top-0 inset-x-0 h-1.5 ${
                                    latestCheckin?.preparedness_score >= 90
                                        ? "bg-emerald-400"
                                        : latestCheckin?.preparedness_score >= 70
                                            ? "bg-amber-400"
                                            : "bg-red-400"
                                }`}
                            />

                            <div className="mb-6">
                                {latestCheckin?.preparedness_score >= 90 ? (
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20 text-emerald-400">
                                        <TrendingUp className="w-8 h-8" />
                                    </div>
                                ) : latestCheckin?.preparedness_score >= 70 ? (
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3 border border-amber-500/20 text-amber-400">
                                        <Activity className="w-8 h-8" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3 border border-red-500/20 text-red-400">
                                        <Ban className="w-8 h-8" />
                                    </div>
                                )}

                                <h2 className="text-xl font-black text-foreground font-['Montserrat'] mb-1">
                                    {latestCheckin?.preparedness_score >= 90
                                        ? "Optimal Trading State"
                                        : latestCheckin?.preparedness_score >= 70
                                            ? "Caution: Compromised Edge"
                                            : "Session Violation Risk"}
                                </h2>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    {latestCheckin?.preparedness_score >= 90
                                        ? "You are physically and mentally cleared for disciplined risk execution. Stick strictly to your checklist."
                                        : latestCheckin?.preparedness_score >= 70
                                            ? "Your cognitive load is elevated. Reduce position sizing to 0.5% risk and trade only A+ setups."
                                            : "High likelihood of emotional decision making. Step away or restrict strictly to paper trading."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
                                {[
                                    { label: "Sleep", value: `${latestCheckin?.sleep_hours}h` },
                                    { label: "Emotion", value: latestCheckin?.mood },
                                    { label: "Bias", value: latestCheckin?.market_bias },
                                    { label: "Readiness", value: `${latestCheckin?.preparedness_score}%` },
                                ].map((at) => (
                                    <div key={at.label} className="bg-white/[0.02] rounded-xl p-2.5 border border-border/20">
                                        <p className="text-[9px] text-muted-foreground font-mono font-bold uppercase">{at.label}</p>
                                        <p className="text-xs font-bold text-foreground font-mono mt-0.5">{at.value}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* History Sidebar (1 Col) */}
                <div className="lg:col-span-1 border border-border/50 bg-card rounded-2xl p-5 flex flex-col h-[400px] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-accent" />
                            Readiness History Log
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {initialCheckins.length} logged
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        {initialCheckins.length > 0 ? (
                            initialCheckins.map((c) => (
                                <div
                                    key={c.id}
                                    className="p-3 rounded-xl border border-border/30 bg-white/[0.015] hover:bg-white/[0.03] transition-all space-y-2"
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                                            {c.date}
                                        </span>
                                        <span
                                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                                                c.preparedness_score >= 90
                                                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                                    : c.preparedness_score >= 70
                                                        ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                                                        : "text-red-400 bg-red-500/10 border border-red-500/20"
                                            }`}
                                        >
                                            {c.preparedness_score}%
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                                        <span className="flex items-center gap-1">
                                            <BatteryCharging className="w-3 h-3 text-accent" /> {c.sleep_hours}h
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Smile className="w-3 h-3 text-accent" /> {c.mood}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <Brain className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                <p className="text-xs text-muted-foreground">No check-ins yet. Establish your baseline.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Empirical Emotion-to-PnL Matrix */}
            <div id="tour-emotion-matrix-card">
                <EmotionPnlMatrix trades={trades} />
            </div>

            {/* Trader's Core Mental Axioms & Non-Negotiables */}
            <TraderAxioms />
        </div>
    );
}
