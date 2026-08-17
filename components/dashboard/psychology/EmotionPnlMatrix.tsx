"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Smile, Frown, Meh, Sparkles, Flame, AlertTriangle, TrendingUp, TrendingDown, Shield } from "lucide-react";

interface EmotionPnlMatrixProps {
    trades: any[];
}

const emotionConfigs: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    focused: { label: "Focused", icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    calm: { label: "Calm", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    neutral: { label: "Neutral", icon: Meh, color: "text-muted-foreground", bg: "bg-white/5", border: "border-border/30" },
    confident: { label: "Confident", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    euphoric: { label: "Euphoric", icon: Flame, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    anxious: { label: "Anxious / Fear", icon: Frown, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
    frustrated: { label: "Frustrated / Tilt", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    revenge: { label: "Revenge", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default function EmotionPnlMatrix({ trades }: EmotionPnlMatrixProps) {
    const { emotionList, bestEmotion, worstEmotion } = useMemo(() => {
        if (!trades || trades.length === 0) {
            return { emotionList: [], bestEmotion: null, worstEmotion: null };
        }

        const map: Record<string, { wins: number; total: number; pnl: number }> = {};

        trades.forEach((t) => {
            const rawEmotion = (t.emotion || "Neutral").toLowerCase();
            let key = "neutral";
            if (rawEmotion.includes("focus")) key = "focused";
            else if (rawEmotion.includes("calm")) key = "calm";
            else if (rawEmotion.includes("confid")) key = "confident";
            else if (rawEmotion.includes("euphor") || rawEmotion.includes("greed")) key = "euphoric";
            else if (rawEmotion.includes("anxi") || rawEmotion.includes("fear") || rawEmotion.includes("hesit")) key = "anxious";
            else if (rawEmotion.includes("frust") || rawEmotion.includes("tilt") || rawEmotion.includes("ang")) key = "frustrated";
            else if (rawEmotion.includes("reveng")) key = "revenge";
            else key = "neutral";

            if (!map[key]) map[key] = { wins: 0, total: 0, pnl: 0 };
            const pnl = Number(t.pnl || t.raw_pnl) || 0;
            map[key].total += 1;
            map[key].pnl += pnl;
            if (pnl > 0) map[key].wins += 1;
        });

        const list = Object.entries(map)
            .map(([key, data]) => {
                const config = emotionConfigs[key] || emotionConfigs.neutral;
                return {
                    key,
                    label: config.label,
                    icon: config.icon,
                    color: config.color,
                    bg: config.bg,
                    border: config.border,
                    trades: data.total,
                    winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
                    pnl: Number(data.pnl.toFixed(2)),
                    avgPnl: data.total > 0 ? Number((data.pnl / data.total).toFixed(2)) : 0,
                };
            })
            .sort((a, b) => b.pnl - a.pnl);

        const best = list.find((e) => e.pnl > 0) || list[0] || null;
        const worst = [...list].reverse().find((e) => e.pnl < 0) || null;

        return {
            emotionList: list,
            bestEmotion: best,
            worstEmotion: worst,
        };
    }, [trades]);

    return (
        <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                        <Smile className="w-4 h-4 text-accent" />
                        Empirical Emotion-to-PnL Matrix
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Quantitative correlation between your psychological mindset and bottom-line dollar profitability
                    </p>
                </div>

                {/* Quick High-Impact Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    {bestEmotion && (
                        <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono font-bold text-emerald-400">
                            Peak Alpha: {bestEmotion.label} (+${bestEmotion.pnl.toFixed(0)})
                        </div>
                    )}
                    {worstEmotion && (
                        <div className="px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] font-mono font-bold text-red-400">
                            Tilt Leak: {worstEmotion.label} (-${Math.abs(worstEmotion.pnl).toFixed(0)})
                        </div>
                    )}
                </div>
            </div>

            {/* Matrix Cards Grid */}
            {emotionList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {emotionList.map((item, i) => {
                        const Icon = item.icon;
                        const isProfitable = item.pnl >= 0;

                        return (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-4 rounded-2xl bg-white/[0.015] border ${item.border} space-y-3 flex flex-col justify-between hover:bg-white/[0.03] transition-all`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-xl ${item.bg} flex items-center justify-center`}>
                                            <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                                        </div>
                                        <span className="text-xs font-bold text-foreground font-['Montserrat']">
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        {item.trades} {item.trades === 1 ? "trade" : "trades"}
                                    </span>
                                </div>

                                <div>
                                    <div className={`text-xl font-black font-mono ${isProfitable ? "text-emerald-400" : "text-red-400"}`}>
                                        {isProfitable ? "+" : "-"}${Math.abs(item.pnl).toFixed(2)}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                                        <span>Win Rate: <strong className="text-foreground">{item.winRate}%</strong></span>
                                        <span>Avg: <strong className={item.avgPnl >= 0 ? "text-emerald-400" : "text-red-400"}>{item.avgPnl >= 0 ? "+" : ""}${item.avgPnl}</strong></span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            item.winRate >= 65
                                                ? "bg-emerald-400"
                                                : item.winRate >= 45
                                                    ? "bg-amber-400"
                                                    : "bg-red-400"
                                        }`}
                                        style={{ width: `${item.winRate}%` }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-8 text-center border border-dashed border-border/30 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-foreground">No Emotion Logs Yet</p>
                    <p className="text-[11px] text-muted-foreground">
                        Select an emotion when logging trades in your Journal to populate your psychological matrix.
                    </p>
                </div>
            )}
        </div>
    );
}
