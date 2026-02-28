"use client";

import { motion } from "framer-motion";

interface EquityCurveProps {
    data: number[];
    height?: number;
}

export default function EquityCurve({ data, height = 200 }: EquityCurveProps) {
    if (!data.length) return null;

    const width = 600;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartWidth,
        y: padding.top + chartHeight - ((v - min) / range) * chartHeight,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    // Area fill path
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    // Y-axis labels
    const yLabels = Array.from({ length: 5 }, (_, i) => {
        const val = min + (range * i) / 4;
        return {
            value: val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}`,
            y: padding.top + chartHeight - (i / 4) * chartHeight,
        };
    });

    const isPositive = data[data.length - 1] >= data[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-card border border-border/50 p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Equity Curve</h3>
                    <p className="text-[11px] text-muted-foreground">Account balance over time</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${isPositive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                    {isPositive ? "+" : ""}{((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1)}%
                </div>
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "#34d399" : "#f87171"} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={isPositive ? "#34d399" : "#f87171"} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {yLabels.map((label, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={label.y}
                            x2={width - padding.right}
                            y2={label.y}
                            stroke="rgba(255,255,255,0.05)"
                            strokeDasharray="4 4"
                        />
                        <text
                            x={padding.left - 8}
                            y={label.y + 4}
                            textAnchor="end"
                            fill="#959595"
                            fontSize="10"
                            fontFamily="Montserrat"
                        >
                            {label.value}
                        </text>
                    </g>
                ))}

                {/* Area fill */}
                <motion.path
                    d={areaPath}
                    fill="url(#equityGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                />

                {/* Line */}
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke={isPositive ? "#34d399" : "#f87171"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                        filter: `drop-shadow(0 0 6px ${isPositive ? "#34d39940" : "#f8717140"})`,
                    }}
                />

                {/* End dot */}
                <motion.circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="4"
                    fill={isPositive ? "#34d399" : "#f87171"}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2, type: "spring" }}
                    style={{
                        filter: `drop-shadow(0 0 6px ${isPositive ? "#34d39980" : "#f8717180"})`,
                    }}
                />
            </svg>
        </motion.div>
    );
}
