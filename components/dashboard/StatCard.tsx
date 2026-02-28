"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    sparklineData?: number[];
}

export default function StatCard({ label, value, change, trend = "neutral", icon: Icon, sparklineData }: StatCardProps) {
    const trendColors = {
        up: "text-emerald-400",
        down: "text-red-400",
        neutral: "text-muted-foreground",
    };

    const trendBgColors = {
        up: "bg-emerald-400/10",
        down: "bg-red-400/10",
        neutral: "bg-white/5",
    };

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

    // Generate sparkline SVG path
    const sparklinePath = sparklineData
        ? (() => {
            const width = 80;
            const height = 32;
            const max = Math.max(...sparklineData);
            const min = Math.min(...sparklineData);
            const range = max - min || 1;
            const points = sparklineData.map((v, i) => ({
                x: (i / (sparklineData.length - 1)) * width,
                y: height - ((v - min) / range) * height,
            }));
            return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        })()
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 hover:border-accent/20 transition-all duration-300 group"
        >
            {/* Subtle gradient glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                    </div>
                    {sparklineData && sparklinePath && (
                        <svg width="80" height="32" className="opacity-40 group-hover:opacity-70 transition-opacity">
                            <path
                                d={sparklinePath}
                                fill="none"
                                stroke={trend === "up" ? "#34d399" : trend === "down" ? "#f87171" : "#e4e6c3"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>

                {/* Value */}
                <p className="text-2xl font-bold text-foreground font-['Montserrat'] mb-1">{value}</p>

                {/* Change indicator */}
                {change && (
                    <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${trendColors[trend]} ${trendBgColors[trend]}`}>
                            <TrendIcon className="w-3 h-3" />
                            {change}
                        </span>
                        <span className="text-[11px] text-muted-foreground">vs last week</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
