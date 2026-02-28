"use client";

import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface InsightData {
    id: string;
    text: string;
    type: "positive" | "warning" | "neutral" | "timing";
    confidence: number; // 0-100
}

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
    positive: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
    neutral: { icon: Lightbulb, color: "text-accent", bg: "bg-accent/10" },
    timing: { icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
};

interface InsightCardProps {
    insight: InsightData;
    index?: number;
}

export default function InsightCard({ insight, index = 0 }: InsightCardProps) {
    const config = typeConfig[insight.type] || typeConfig.neutral;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-accent/20 transition-all duration-300 group"
        >
            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 flex-1 max-w-[60px] rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: config.color.includes("emerald") ? "#34d399" : config.color.includes("amber") ? "#fbbf24" : config.color.includes("blue") ? "#60a5fa" : "#e4e6c3" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.confidence}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{insight.confidence}% confidence</span>
                </div>
            </div>
        </motion.div>
    );
}
