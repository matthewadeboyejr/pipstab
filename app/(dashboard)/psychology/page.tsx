"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Shield, MessageSquare, Activity } from "lucide-react";

const emotionLog = [
    { date: "Feb 28", before: "Confident", after: "Calm", pnl: 245.5, pair: "EUR/USD" },
    { date: "Feb 27", before: "Anxious", after: "Frustrated", pnl: -120, pair: "GBP/JPY" },
    { date: "Feb 27", before: "Calm", after: "Euphoric", pnl: 380, pair: "XAU/USD" },
    { date: "Feb 26", before: "Neutral", after: "Anxious", pnl: -85, pair: "USD/CAD" },
    { date: "Feb 26", before: "Confident", after: "Calm", pnl: 190, pair: "NZD/USD" },
];

const biases = [
    { name: "Confirmation Bias", score: 72 },
    { name: "Recency Bias", score: 58 },
    { name: "Loss Aversion", score: 85 },
    { name: "Overconfidence", score: 45 },
    { name: "Anchoring", score: 38 },
    { name: "FOMO", score: 65 },
];

const tiltTimeline = [
    { time: "09:00", state: 85, label: "Calm start" },
    { time: "10:30", state: 70, label: "First loss" },
    { time: "11:00", state: 40, label: "Revenge trade" },
    { time: "12:30", state: 35, label: "Second loss" },
    { time: "14:00", state: 55, label: "Break taken" },
    { time: "15:30", state: 75, label: "Winning trade" },
];

const prompts = [
    "What was your emotional state before entering the GBP/JPY trade? Did FOMO influence timing?",
    "Review your 3 revenge trades this week. What triggered each one?",
    "Your win rate drops 40% after back-to-back losses. How can you build a circuit breaker?",
];

const emotionColors: Record<string, string> = {
    Confident: "text-emerald-400", Calm: "text-teal-400", Anxious: "text-amber-400",
    Frustrated: "text-red-400", Euphoric: "text-purple-400", Neutral: "text-blue-400",
};

export default function PsychologyPage() {
    const behaviorScore = 68;
    const maxBias = Math.max(...biases.map(b => b.score));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Top row: Behavior Score + Bias Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Behavior Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-5 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 self-start">
                        <Shield className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Discipline Score</h3>
                    </div>
                    <div className="relative w-[160px] h-[160px] mb-3">
                        <svg viewBox="0 0 160 160" className="-rotate-90">
                            <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                            <motion.circle cx="80" cy="80" r="60" fill="none" stroke={behaviorScore >= 70 ? "#34d399" : behaviorScore >= 40 ? "#facc15" : "#f87171"} strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 60} initial={{ strokeDashoffset: 2 * Math.PI * 60 }} animate={{ strokeDashoffset: (1 - behaviorScore / 100) * 2 * Math.PI * 60 }} transition={{ duration: 1.5 }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-foreground font-['Montserrat']">{behaviorScore}</span>
                            <span className="text-[10px] text-muted-foreground">/100</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center">Your overall trading discipline based on rule adherence and emotional control</p>
                </motion.div>

                {/* Cognitive Bias Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl bg-card border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Cognitive Bias Profile</h3>
                    </div>
                    <div className="space-y-3">
                        {biases.map((b, i) => (
                            <motion.div key={b.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-32 font-medium">{b.name}</span>
                                <div className="flex-1 h-7 bg-white/[0.03] rounded-lg overflow-hidden relative">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${b.score}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className={`h-full rounded-lg ${b.score >= 70 ? "bg-red-500/40" : b.score >= 50 ? "bg-amber-500/30" : "bg-emerald-500/30"}`} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground">{b.score}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3">Higher scores indicate stronger bias detection. Work on reducing red-zone biases.</p>
                </motion.div>
            </div>

            {/* Emotion Tracker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Emotion Tracker</h3>
                </div>
                <table className="w-full">
                    <thead><tr className="border-b border-border/30">
                        {["Date", "Pair", "Before Trade", "After Trade", "P&L"].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody>
                        {emotionLog.map((e, i) => (
                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className="border-b border-border/20 last:border-0 hover:bg-white/[0.02]">
                                <td className="px-5 py-3.5 text-xs text-muted-foreground">{e.date}</td>
                                <td className="px-5 py-3.5 text-sm font-semibold text-foreground">{e.pair}</td>
                                <td className="px-5 py-3.5"><span className={`text-xs font-medium ${emotionColors[e.before] || "text-muted-foreground"}`}>{e.before}</span></td>
                                <td className="px-5 py-3.5"><span className={`text-xs font-medium ${emotionColors[e.after] || "text-muted-foreground"}`}>{e.after}</span></td>
                                <td className="px-5 py-3.5"><span className={`text-sm font-semibold ${e.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{e.pnl >= 0 ? "+" : ""}${e.pnl}</span></td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Tilt Detection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-card border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Tilt Detection Timeline</h3>
                </div>
                <div className="flex items-end gap-4 h-[120px]">
                    {tiltTimeline.map((t, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${t.state}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full rounded-t-lg ${t.state >= 70 ? "bg-emerald-500/40" : t.state >= 40 ? "bg-amber-500/40" : "bg-red-500/40"}`} style={{ height: "100%" }} />
                            <span className="text-[9px] text-muted-foreground mt-1 whitespace-nowrap">{t.time}</span>
                        </motion.div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/40" /> Calm</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500/40" /> Elevated</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/40" /> Tilted</span>
                </div>
            </motion.div>

            {/* Journal Prompts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Reflection Prompts</h3>
                </div>
                <div className="space-y-3">
                    {prompts.map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="p-4 rounded-xl bg-accent/5 border border-accent/10 hover:border-accent/20 transition-all">
                            <p className="text-sm text-foreground leading-relaxed">{p}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
