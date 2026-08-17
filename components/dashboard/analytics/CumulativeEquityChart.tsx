"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

interface EquityPoint {
    tradeIndex: number;
    id: string;
    date: string;
    pair: string;
    pnl: number;
    cumulativePnl: number;
    peakPnl: number;
    drawdownDollar: number;
    drawdownPct: number;
}

interface CumulativeEquityChartProps {
    trades: any[];
}

export default function CumulativeEquityChart({ trades }: CumulativeEquityChartProps) {
    const [viewMode, setViewMode] = useState<"equity" | "drawdown">("equity");
    const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);

    // Build chronological equity progression
    const equityData: EquityPoint[] = useMemo(() => {
        if (!trades || trades.length === 0) return [];

        // Sort ascending by date for cumulative calculation
        const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningPnl = 0;
        let peak = 0;

        return sorted.map((t, idx) => {
            const pnl = Number(t.raw_pnl) || 0;
            runningPnl += pnl;
            if (runningPnl > peak) peak = runningPnl;

            const drawdownDollar = peak > 0 ? Math.max(0, peak - runningPnl) : 0;
            const drawdownPct = peak > 0 ? (drawdownDollar / peak) * 100 : 0;

            return {
                tradeIndex: idx + 1,
                id: t.id,
                date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                pair: t.pair,
                pnl,
                cumulativePnl: Number(runningPnl.toFixed(2)),
                peakPnl: Number(peak.toFixed(2)),
                drawdownDollar: Number(drawdownDollar.toFixed(2)),
                drawdownPct: Number(drawdownPct.toFixed(1)),
            };
        });
    }, [trades]);

    // Chart dimensions
    const width = 800;
    const height = 260;
    const padding = { top: 20, right: 30, bottom: 35, left: 55 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scales for Equity View
    const equityValues = equityData.map((d) => d.cumulativePnl);
    const minEquity = Math.min(0, ...equityValues);
    const maxEquity = Math.max(10, ...equityValues);
    const equityRange = maxEquity - minEquity || 1;

    const getEquityX = (index: number) => {
        if (equityData.length <= 1) return padding.left + chartWidth / 2;
        return padding.left + (index / (equityData.length - 1)) * chartWidth;
    };

    const getEquityY = (val: number) => {
        return padding.top + chartHeight - ((val - minEquity) / equityRange) * chartHeight;
    };

    // Scales for Drawdown View (0% at top, max DD at bottom)
    const maxDrawdownPct = Math.max(5, ...equityData.map((d) => d.drawdownPct));
    const getDrawdownY = (val: number) => {
        return padding.top + (val / maxDrawdownPct) * chartHeight;
    };

    // Generate Path Strings
    const equityPath = useMemo(() => {
        if (equityData.length === 0) return "";
        return equityData
            .map((d, i) => `${i === 0 ? "M" : "L"} ${getEquityX(i)} ${getEquityY(d.cumulativePnl)}`)
            .join(" ");
    }, [equityData, minEquity, maxEquity]);

    const zeroLineY = getEquityY(0);

    const equityAreaPath = useMemo(() => {
        if (equityData.length === 0) return "";
        const firstX = getEquityX(0);
        const lastX = getEquityX(equityData.length - 1);
        return `${equityPath} L ${lastX} ${zeroLineY} L ${firstX} ${zeroLineY} Z`;
    }, [equityPath, zeroLineY]);

    const drawdownPath = useMemo(() => {
        if (equityData.length === 0) return "";
        return equityData
            .map((d, i) => `${i === 0 ? "M" : "L"} ${getEquityX(i)} ${getDrawdownY(d.drawdownPct)}`)
            .join(" ");
    }, [equityData, maxDrawdownPct]);

    const drawdownAreaPath = useMemo(() => {
        if (equityData.length === 0) return "";
        const firstX = getEquityX(0);
        const lastX = getEquityX(equityData.length - 1);
        return `M ${firstX} ${padding.top} L ${firstX} ${getDrawdownY(equityData[0].drawdownPct)} ${equityData
            .map((d, i) => `L ${getEquityX(i)} ${getDrawdownY(d.drawdownPct)}`)
            .join(" ")} L ${lastX} ${padding.top} Z`;
    }, [equityData, maxDrawdownPct]);

    const finalPnl = equityData.length > 0 ? equityData[equityData.length - 1].cumulativePnl : 0;
    const peakEquity = equityData.length > 0 ? Math.max(...equityData.map((d) => d.cumulativePnl)) : 0;
    const maxDD = equityData.length > 0 ? Math.max(...equityData.map((d) => d.drawdownPct)) : 0;

    return (
        <div className="rounded-2xl bg-card border border-border/50 p-6 space-y-4 shadow-xl">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Cumulative Equity & Drawdown Curve
                        </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Track mathematical capital growth, peak equity, and risk drawdowns
                    </p>
                </div>

                {/* View Toggles & Summary Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-border/40 text-xs font-mono">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">Peak:</span>
                        <span className="font-bold text-emerald-400">+${peakEquity.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-border/40 text-xs font-mono">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">Max DD:</span>
                        <span className="font-bold text-red-400">{maxDD.toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center p-1 rounded-xl bg-white/5 border border-border/30">
                        <button
                            onClick={() => setViewMode("equity")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                viewMode === "equity"
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Equity ($)
                        </button>
                        <button
                            onClick={() => setViewMode("drawdown")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                viewMode === "drawdown"
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Underwater DD (%)
                        </button>
                    </div>
                </div>
            </div>

            {/* SVG Chart Canvas */}
            <div className="relative w-full overflow-hidden">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto overflow-visible select-none"
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <defs>
                        {/* Equity Area Gradient */}
                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Drawdown Area Gradient */}
                        <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.0" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.35" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines & Y-Axis values */}
                    {viewMode === "equity" ? (
                        <>
                            {/* Horizontal Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                                const val = minEquity + pct * equityRange;
                                const y = getEquityY(val);
                                return (
                                    <g key={i}>
                                        <line
                                            x1={padding.left}
                                            y1={y}
                                            x2={width - padding.right}
                                            y2={y}
                                            stroke="currentColor"
                                            className="text-border/20"
                                            strokeDasharray="3 3"
                                        />
                                        <text
                                            x={padding.left - 8}
                                            y={y + 3}
                                            textAnchor="end"
                                            className="text-[9px] fill-muted-foreground font-mono"
                                        >
                                            {val >= 0 ? "+" : ""}${val.toFixed(0)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Zero Baseline */}
                            <line
                                x1={padding.left}
                                y1={zeroLineY}
                                x2={width - padding.right}
                                y2={zeroLineY}
                                stroke="currentColor"
                                className="text-border/60"
                                strokeWidth="1.5"
                            />

                            {/* Area & Line */}
                            <path d={equityAreaPath} fill="url(#equityGradient)" />
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                d={equityPath}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        </>
                    ) : (
                        <>
                            {/* Drawdown Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                                const val = pct * maxDrawdownPct;
                                const y = getDrawdownY(val);
                                return (
                                    <g key={i}>
                                        <line
                                            x1={padding.left}
                                            y1={y}
                                            x2={width - padding.right}
                                            y2={y}
                                            stroke="currentColor"
                                            className="text-border/20"
                                            strokeDasharray="3 3"
                                        />
                                        <text
                                            x={padding.left - 8}
                                            y={y + 3}
                                            textAnchor="end"
                                            className="text-[9px] fill-muted-foreground font-mono"
                                        >
                                            -{val.toFixed(0)}%
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Drawdown Area & Line */}
                            <path d={drawdownAreaPath} fill="url(#drawdownGradient)" />
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                d={drawdownPath}
                                fill="none"
                                stroke="#EF4444"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        </>
                    )}

                    {/* Interactive Points on Hover */}
                    {equityData.map((d, i) => {
                        const cx = getEquityX(i);
                        const cy = viewMode === "equity" ? getEquityY(d.cumulativePnl) : getDrawdownY(d.drawdownPct);
                        const isHovered = hoveredPoint?.id === d.id;

                        return (
                            <g key={d.id} className="cursor-pointer">
                                {/* Invisible wide touch target */}
                                <rect
                                    x={cx - 10}
                                    y={padding.top}
                                    width={20}
                                    height={chartHeight}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredPoint(d)}
                                />
                                {isHovered && (
                                    <>
                                        <line
                                            x1={cx}
                                            y1={padding.top}
                                            x2={cx}
                                            y2={height - padding.bottom}
                                            stroke="currentColor"
                                            className="text-accent/60"
                                            strokeDasharray="2 2"
                                        />
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r="6"
                                            fill={viewMode === "equity" ? "#10B981" : "#EF4444"}
                                            className="drop-shadow-lg"
                                        />
                                    </>
                                )}
                            </g>
                        );
                    })}

                    {/* X-Axis Labels (Trade Dates) */}
                    {equityData
                        .filter((_, idx) => idx % Math.max(1, Math.floor(equityData.length / 6)) === 0 || idx === equityData.length - 1)
                        .map((d, _, arr) => {
                            const originalIdx = equityData.findIndex((p) => p.id === d.id);
                            return (
                                <text
                                    key={d.id}
                                    x={getEquityX(originalIdx)}
                                    y={height - 10}
                                    textAnchor="middle"
                                    className="text-[9px] fill-muted-foreground font-mono"
                                >
                                    {d.date}
                                </text>
                            );
                        })}
                </svg>

                {/* Floating Tooltip */}
                <AnimatePresence>
                    {hoveredPoint && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4 right-4 p-3.5 rounded-xl bg-popover/95 backdrop-blur-md border border-border/60 shadow-2xl space-y-1.5 min-w-[180px] pointer-events-none"
                        >
                            <div className="flex items-center justify-between border-b border-border/30 pb-1 text-xs">
                                <span className="font-bold text-foreground font-mono">
                                    Trade #{hoveredPoint.tradeIndex} ({hoveredPoint.pair})
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {hoveredPoint.date}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Trade PnL:</span>
                                <span
                                    className={`font-bold font-mono ${
                                        hoveredPoint.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                                    }`}
                                >
                                    {hoveredPoint.pnl >= 0 ? "+" : ""}${hoveredPoint.pnl.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Cumulative:</span>
                                <span className="font-bold font-mono text-foreground">
                                    ${hoveredPoint.cumulativePnl.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Drawdown:</span>
                                <span className="font-bold font-mono text-red-400">
                                    -{hoveredPoint.drawdownPct.toFixed(1)}% (${hoveredPoint.drawdownDollar.toFixed(2)})
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
