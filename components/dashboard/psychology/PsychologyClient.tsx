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
    ChevronRight,
    Zap
} from "lucide-react";

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
}

const moods = ["Focused", "Neutral", "Anxious", "Euphoric", "Tired", "Frustrated"];

export default function PsychologyClient({ initialCheckins, hasCheckedInToday }: PsychologyClientProps) {
    const supabase = createClient();
    const router = useRouter();
    const { addToast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [sleep, setSleep] = useState<string>("7");
    const [mood, setMood] = useState<string>("Focused");
    const [bias, setBias] = useState<string>("Neutral");
    const [distractions, setDistractions] = useState<string>("");
    const [macroChecked, setMacroChecked] = useState(false);

    // --- Readiness Algorithm ---
    const readiness = useMemo(() => {
        let score = 0;
        const s = parseFloat(sleep);

        // 1. Sleep (30 pts)
        if (s >= 8) score += 30;
        else if (s >= 7) score += 25;
        else if (s >= 6) score += 15;
        else score += 0;

        // 2. Mood (30 pts)
        if (mood === "Focused") score += 30;
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
        let verdict = "Optimal";
        let color = "text-emerald-400";
        if (score < 70) {
            verdict = "Risk Warning";
            color = "text-red-400";
        } else if (score < 90) {
            verdict = "Caution Advised";
            color = "text-amber-400";
        }

        return { score, verdict, color };
    }, [sleep, mood, bias, distractions]);

    const latestCheckin = initialCheckins[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!macroChecked) {
            addToast("You must confirm you've checked macroeconomic news.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const payload = {
                user_id: user.id,
                date: new Date().toISOString().split('T')[0],
                sleep_hours: parseFloat(sleep),
                mood,
                distractions,
                market_bias: bias,
                preparedness_score: readiness.score,
            };

            const { error } = await supabase.from("checkins").insert(payload);
            if (error) throw error;

            addToast("Readiness analysis complete. Trade accordingly.", "success");
            router.refresh();
        } catch (err: any) {
            addToast(err.message || "Failed to submit check-in", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1400px] animate-in fade-in duration-500 pb-10">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-6">
                {!hasCheckedInToday ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        <div className="mb-8 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-accent" />
                                    Cognitive Readiness Analysis
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Our engine will calculate your trading readiness score based on your inputs.</p>
                            </div>

                            {/* Live Score Dial */}
                            <div className="hidden sm:flex flex-col items-center">
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                        <motion.circle
                                            cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                                            className={readiness.color}
                                            strokeDasharray={2 * Math.PI * 28}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                            animate={{ strokeDashoffset: (1 - readiness.score / 100) * 2 * Math.PI * 28 }}
                                        />
                                    </svg>
                                    <span className={`absolute text-xs font-bold ${readiness.color}`}>{readiness.score}%</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Live Readiness</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <BatteryCharging className="w-3.5 h-3.5" /> Sleep (Hours)
                                    </label>
                                    <input
                                        type="number" step="0.5" min="0" max="24"
                                        value={sleep}
                                        onChange={e => setSleep(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Smile className="w-3.5 h-3.5" /> Core Emotion
                                    </label>
                                    <select
                                        value={mood}
                                        onChange={e => setMood(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none"
                                    >
                                        {moods.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        Current Bias
                                    </label>
                                    <select
                                        value={bias}
                                        onChange={e => setBias(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none"
                                    >
                                        <option value="Neutral">Neutral (Best)</option>
                                        <option value="Long">Strong Long Bias</option>
                                        <option value="Short">Strong Short Bias</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> External Distractions
                                </label>
                                <textarea
                                    value={distractions}
                                    onChange={e => setDistractions(e.target.value)}
                                    placeholder="Any stress outside of trading? Leave blank if none."
                                    rows={2}
                                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-white/2 border border-border/30 rounded-xl p-5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 ${readiness.color}`}>
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Algorithmic Verdict</p>
                                            <p className={`text-lg font-bold font-['Montserrat'] ${readiness.color}`}>{readiness.verdict}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 border-t md:border-t-0 md:border-l border-border/30 pt-4 md:pt-0 md:pl-6 w-full">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={macroChecked}
                                                onChange={e => setMacroChecked(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 rounded border-2 border-border/50 peer-checked:bg-accent peer-checked:border-accent transition-all flex items-center justify-center bg-background group-hover:border-accent/50">
                                                <ShieldCheck className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug select-none">
                                            I have checked macro high-impact events today.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !macroChecked}
                                    className="px-8 py-4 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:shadow-[0_0_25px_rgba(var(--accent),0.4)] hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Finalize Analysis & Open Terminal
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] relative overflow-hidden"
                    >
                        <div className={`absolute top-0 inset-x-0 h-1 ${latestCheckin?.preparedness_score >= 90 ? "bg-emerald-400" : latestCheckin?.preparedness_score >= 70 ? "bg-amber-400" : "bg-red-400"}`} />

                        <div className="mb-8">
                            {latestCheckin?.preparedness_score >= 90 ? (
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                    <TrendingUp className="w-10 h-10 text-emerald-400" />
                                </div>
                            ) : latestCheckin?.preparedness_score >= 70 ? (
                                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                                    <Activity className="w-10 h-10 text-amber-400" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                    <Ban className="w-10 h-10 text-red-400" />
                                </div>
                            )}

                            <h2 className="text-2xl font-bold text-foreground font-['Montserrat'] mb-2">
                                {latestCheckin?.preparedness_score >= 90 ? "Optimal Trading State" :
                                    latestCheckin?.preparedness_score >= 70 ? "Caution: Compromised Edge" :
                                        "Session Violation Risk"}
                            </h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {latestCheckin?.preparedness_score >= 90 ? "You are physically and mentally cleared for full risk execution. Stick to the plan." :
                                    latestCheckin?.preparedness_score >= 70 ? "Your cognitive load is high. Consider 0.5% risk or skipping the session if volume is low." :
                                        "Our algorithm advises against trading today. High likelihood of emotional decision making."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-lg mt-4">
                            {[
                                { label: "Sleep", value: `${latestCheckin?.sleep_hours}h` },
                                { label: "Emotion", value: latestCheckin?.mood },
                                { label: "Bias", value: latestCheckin?.market_bias },
                                { label: "Score", value: `${latestCheckin?.preparedness_score}%` }
                            ].map(at => (
                                <div key={at.label} className="bg-white/2 rounded-xl p-3 border border-border/20">
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{at.label}</p>
                                    <p className="text-sm font-semibold text-foreground">{at.value}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1 border border-border/50 bg-card rounded-2xl p-5 flex flex-col h-[700px] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent" />
                        Performance Readiness Log
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {initialCheckins.length > 0 ? (
                        initialCheckins.map(c => (
                            <div key={c.id} className="group relative p-4 rounded-xl border border-border/30 bg-secondary/20 hover:bg-white/2 transition-all">
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${c.preparedness_score >= 90 ? "bg-emerald-400" : c.preparedness_score >= 70 ? "bg-amber-400" : "bg-red-400"}`} />
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase">{c.date}</span>
                                    <div className="flex items-center gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.preparedness_score >= 90 ? "text-emerald-400 bg-emerald-400/10" : c.preparedness_score >= 70 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10"}`}>
                                            {c.preparedness_score}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                                        <BatteryCharging className="w-3 h-3 text-accent" /> {c.sleep_hours}h
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                                        <Smile className="w-3 h-3 text-accent" /> {c.mood}
                                    </div>
                                </div>
                                {c.distractions && (
                                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-1 italic tracking-tight opacity-60">"{c.distractions}"</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Brain className="w-10 h-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground/50">Establish your baseline.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

