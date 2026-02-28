"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, Shield, Brain, Clock } from "lucide-react";

interface AlphaLeakageGaugeProps {
    score: number; // 0-100
    label?: string;
}

const LEAKAGE_SOURCES = [
    { label: "Revenge Trading", value: 40, icon: AlertTriangle },
    { label: "Early Exits", value: 25, icon: Clock },
    { label: "Over-Leveraging", value: 20, icon: Shield },
    { label: "Off-Plan Entries", value: 15, icon: Brain },
];

export default function AlphaLeakageGauge({ score, label = "Alpha Leakage" }: AlphaLeakageGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setAnimatedScore(score), 300);
        return () => clearTimeout(timeout);
    }, [score]);

    const radius = 60;
    const strokeWidth = 9;
    const circumference = 2 * Math.PI * radius;
    const progress = ((100 - animatedScore) / 100) * circumference;

    const getColor = (s: number) => {
        if (s <= 20) return "#34d399";
        if (s <= 40) return "#a3e635";
        if (s <= 60) return "#facc15";
        if (s <= 80) return "#fb923c";
        return "#f87171";
    };

    const color = getColor(animatedScore);
    const grade =
        animatedScore <= 20 ? "Excellent" :
            animatedScore <= 40 ? "Good" :
                animatedScore <= 60 ? "Fair" :
                    animatedScore <= 80 ? "Poor" : "Critical";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col h-full rounded-2xl bg-card border border-border/50 p-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">{label}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Behavioral edge analysis</p>
                </div>
                <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: `${color}15`, color }}
                >
                    {grade}
                </div>
            </div>

            {/* Gauge */}
            <div className="flex items-center justify-center flex-1 min-h-0">
                <div className="relative w-[140px] h-[140px]">
                    <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                        <circle
                            cx="70" cy="70" r={radius}
                            fill="none"
                            className="stroke-border/20"
                            strokeWidth={strokeWidth}
                        />
                        <motion.circle
                            cx="70" cy="70" r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: progress }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            key={animatedScore}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-2xl font-bold font-['Montserrat']"
                            style={{ color }}
                        >
                            {animatedScore}%
                        </motion.span>
                        <span className="text-[10px] text-muted-foreground">leaked</span>
                    </div>
                </div>
            </div>

            {/* Leakage breakdown */}
            <div className="mt-3 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Top Leakage Sources</p>
                {LEAKAGE_SOURCES.map((src) => {
                    const Icon = src.icon;
                    return (
                        <div key={src.label} className="flex items-center gap-2.5">
                            <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[11px] text-foreground truncate">{src.label}</span>
                                    <span className="text-[10px] text-muted-foreground font-semibold ml-2">{src.value}%</span>
                                </div>
                                <div className="w-full h-1 rounded-full bg-border/30 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${src.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edge retained footer */}
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Edge Retained</span>
                <span className="text-sm font-bold font-['Montserrat']" style={{ color: getColor(100 - (100 - animatedScore)) }}>
                    {100 - animatedScore}%
                </span>
            </div>
        </motion.div>
    );
}
