"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Clock, ShieldCheck } from "lucide-react";

interface FlowLevel {
    supporting_pct: number;
    opposing_pct: number;
    timing: string;
    edge: string;
}

interface MultiTimeframeFlowMatrixProps {
    symbol: string;
    flow_4h?: FlowLevel;
    flow_1h?: FlowLevel;
    flow_15m?: FlowLevel;
    market_regimes?: {
        trending: boolean;
        vol_expansion: boolean;
        range_bound: boolean;
        regime_label: string;
    };
    bias: "BUY" | "SELL" | "NEUTRAL";
}

export default function MultiTimeframeFlowMatrix({
    symbol,
    flow_4h = { supporting_pct: 92, opposing_pct: 8, timing: "TIMING - BULLISH", edge: "+84.0 pt edge" },
    flow_1h = { supporting_pct: 86, opposing_pct: 14, timing: "TIMING - BULLISH", edge: "+72.0 pt edge" },
    flow_15m = { supporting_pct: 80, opposing_pct: 20, timing: "TIMING - ACCELERATING", edge: "+60.0 pt edge" },
    market_regimes = { trending: true, vol_expansion: true, range_bound: false, regime_label: "Elevated Volatility — Lean Long" },
    bias,
}: MultiTimeframeFlowMatrixProps) {
    const isBull = bias === "BUY";
    const isBear = bias === "SELL";

    const flowItems = [
        { label: "Intraday Flow (4H)", data: flow_4h, tag: "HTF Direction" },
        { label: "Intraday Flow (1H)", data: flow_1h, tag: "ITF Momentum" },
        { label: "Fast Intraday Flow (15M)", data: flow_15m, tag: "LTF Execution" },
    ];

    return (
        <div className="space-y-4 w-full">
            {/* Flow Bars */}
            <div className="space-y-3.5">
                {flowItems.map((item, idx) => {
                    const supp = Math.round(item.data.supporting_pct);
                    const opp = Math.round(item.data.opposing_pct);
                    const isSupportingHigh = supp >= 50;

                    return (
                        <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white/[0.02] border border-border/40 hover:border-accent/30 transition-all space-y-2"
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground font-mono text-[11px] uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-muted-foreground font-semibold">
                                        {item.tag}
                                    </span>
                                </div>

                                {/* Timing & Edge Pill */}
                                <div
                                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold font-mono border ${
                                        isSupportingHigh
                                            ? isBull
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}
                                >
                                    {item.data.timing} ({item.data.edge})
                                </div>
                            </div>

                            {/* Dual Percentage Numbers */}
                            <div className="flex items-center justify-between text-xs font-mono font-extrabold">
                                <div className="flex items-baseline gap-1.5 text-emerald-400">
                                    <span className="text-base font-black font-['Montserrat']">{supp}.0%</span>
                                    <span className="text-[9px] uppercase font-sans text-muted-foreground font-semibold">
                                        Supporting {symbol}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1.5 text-red-400">
                                    <span className="text-[9px] uppercase font-sans text-muted-foreground font-semibold">
                                        Opposing {symbol}
                                    </span>
                                    <span className="text-base font-black font-['Montserrat']">{opp}.0%</span>
                                </div>
                            </div>

                            {/* Dual Progress Meter Bar */}
                            <div className="w-full h-2 rounded-full bg-red-500/20 overflow-hidden flex">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${supp}%` }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Market Regime Matrix Selector / Badges */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                        Market Regime State
                    </span>
                    <span className="text-[10px] font-bold text-accent font-mono px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                        {market_regimes.regime_label}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                            market_regimes.range_bound
                                ? "bg-accent/10 border-accent text-accent font-bold shadow-sm"
                                : "bg-white/[0.01] border-border/30 text-muted-foreground"
                        }`}
                    >
                        <div className="text-[11px] font-bold font-mono">↔ RANGE</div>
                        <div className="text-[9px] text-muted-foreground/80 mt-0.5">Mean Reverting</div>
                    </div>

                    <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                            market_regimes.trending
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-sm"
                                : "bg-white/[0.01] border-border/30 text-muted-foreground"
                        }`}
                    >
                        <div className="text-[11px] font-bold font-mono">↗ TRENDING</div>
                        <div className="text-[9px] text-muted-foreground/80 mt-0.5">Directional Impulse</div>
                    </div>

                    <div
                        className={`p-2 rounded-lg border text-center transition-all ${
                            market_regimes.vol_expansion
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold shadow-sm"
                                : "bg-white/[0.01] border-border/30 text-muted-foreground"
                        }`}
                    >
                        <div className="text-[11px] font-bold font-mono">⚡ VOL EXP</div>
                        <div className="text-[9px] text-muted-foreground/80 mt-0.5">Expansion Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
