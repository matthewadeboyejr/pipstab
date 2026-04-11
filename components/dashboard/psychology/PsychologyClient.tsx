"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { Brain, BatteryCharging, Frown, Smile, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

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
    const [prepScore, setPrepScore] = useState<string>("8");
    const [macroChecked, setMacroChecked] = useState(false);

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
                preparedness_score: parseInt(prepScore),
            };

            const { error } = await supabase.from("checkins").insert(payload);
            if (error) throw error;

            addToast("Pre-session check-in complete. Stay disciplined.", "success");
            router.refresh(); // Refresh to update the `hasCheckedInToday` server prop and list
        } catch (err: any) {
            addToast(err.message || "Failed to submit check-in", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1400px] animate-in fade-in duration-500">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-6">
                {!hasCheckedInToday ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 relative overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-accent" />
                                    Pre-Session Check-in
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Answer honestly before looking at the charts.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            {/* Grid 1: Sleep, Mood, Bias */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <BatteryCharging className="w-3.5 h-3.5" /> Sleep (Hours)
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.5" 
                                        min="0"
                                        max="24"
                                        value={sleep}
                                        onChange={e => setSleep(e.target.value)}
                                        className="w-full bg-secondary border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors"
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
                                        className="w-full bg-secondary border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none"
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
                                        className="w-full bg-secondary border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50 transition-colors appearance-none"
                                    >
                                        <option value="Neutral">Neutral (Best)</option>
                                        <option value="Long">Strong Long Bias</option>
                                        <option value="Short">Strong Short Bias</option>
                                    </select>
                                </div>
                            </div>

                            {/* Distractions */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> External Distractions
                                </label>
                                <textarea
                                    value={distractions}
                                    onChange={e => setDistractions(e.target.value)}
                                    placeholder="Any stress outside of trading? Arguments, bills, illnesses? Leave blank if none."
                                    rows={2}
                                    className="w-full bg-secondary border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors resize-none"
                                />
                            </div>

                            {/* Score & Acknowledgment */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-white/2 border border-border/30 rounded-xl p-4">
                                <div className="flex-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                        Preparedness Score (1-10)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="10" 
                                            value={prepScore}
                                            onChange={e => setPrepScore(e.target.value)}
                                            className="w-full accent-accent"
                                        />
                                        <span className={`text-lg font-bold w-6 text-center ${parseInt(prepScore) >= 7 ? "text-emerald-400" : parseInt(prepScore) >= 4 ? "text-amber-400" : "text-red-400"}`}>
                                            {prepScore}
                                        </span>
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
                                            I have checked ForexFactory / macro news for high-impact events today.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || !macroChecked}
                                    className="px-8 py-3 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(var(--accent),0.4)] hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                    Start Trading Session
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
                    >
                        <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
                        <h2 className="text-xl font-bold text-foreground font-['Montserrat'] mb-2">You are cleared to trade.</h2>
                        <p className="text-sm text-emerald-400/80 max-w-sm">
                            You have completed your cognitive check-in for today. Stick to your setups, follow your rules, and manage risk perfectly.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1 border border-border/50 bg-card rounded-2xl p-5 flex flex-col h-[600px]">
                <h3 className="text-sm font-semibold text-foreground font-['Montserrat'] mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Cognitive Log History
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {initialCheckins.length > 0 ? (
                        initialCheckins.map(c => (
                            <div key={c.id} className="p-3.5 rounded-xl border border-border/30 bg-background/50 hover:bg-white/2 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-foreground">{c.date}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.preparedness_score >= 7 ? "bg-emerald-500/20 text-emerald-400" : c.preparedness_score >= 4 ? "bg-amber-400/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                                        Score: {c.preparedness_score}/10
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <BatteryCharging className="w-3 h-3" /> {c.sleep_hours}h
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Smile className="w-3 h-3" /> {c.mood}
                                    </div>
                                </div>
                                {c.distractions && (
                                    <div className="mt-2 pt-2 border-t border-border/20">
                                        <p className="text-[10px] text-muted-foreground/80 font-medium uppercase tracking-wider mb-1">Distractions</p>
                                        <p className="text-xs text-foreground/80 leading-snug line-clamp-2" title={c.distractions}>{c.distractions}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-70">
                            <Brain className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">No check-ins recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
