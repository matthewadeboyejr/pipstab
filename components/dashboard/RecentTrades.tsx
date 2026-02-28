"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Trade {
    id: string;
    pair: string;
    direction: "long" | "short";
    pnl: number;
    rr: string;
    setup: string;
    date: string;
    emotion: string;
}

interface RecentTradesProps {
    trades: Trade[];
}

export default function RecentTrades({ trades }: RecentTradesProps) {
    const emotionColors: Record<string, string> = {
        Confident: "text-emerald-400 bg-emerald-400/10",
        Neutral: "text-blue-400 bg-blue-400/10",
        Anxious: "text-amber-400 bg-amber-400/10",
        FOMO: "text-red-400 bg-red-400/10",
        Revenge: "text-red-500 bg-red-500/10",
        Calm: "text-teal-400 bg-teal-400/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl bg-card border border-border/50 overflow-hidden"
        >
            <div className="px-5 py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Recent Trades</h3>
                        <p className="text-[11px] text-muted-foreground">Last 5 executed trades</p>
                    </div>
                    <button className="text-[11px] text-accent hover:text-accent/80 font-medium transition-colors">
                        View All →
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/30">
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pair</th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Direction</th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">P&L</th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">R:R</th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Setup</th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Emotion</th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade, i) => (
                            <motion.tr
                                key={trade.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                className="border-b border-border/20 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                                <td className="px-5 py-3.5">
                                    <span className="text-sm font-semibold text-foreground">{trade.pair}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${trade.direction === "long" ? "text-emerald-400" : "text-red-400"
                                        }`}>
                                        {trade.direction === "long" ? (
                                            <ArrowUpRight className="w-3 h-3" />
                                        ) : (
                                            <ArrowDownRight className="w-3 h-3" />
                                        )}
                                        {trade.direction.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-sm font-semibold ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-sm text-muted-foreground">{trade.rr}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-xs text-foreground/70 px-2 py-1 rounded-md bg-white/5">{trade.setup}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${emotionColors[trade.emotion] || "text-muted-foreground bg-white/5"}`}>
                                        {trade.emotion}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-xs text-muted-foreground">{trade.date}</span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
