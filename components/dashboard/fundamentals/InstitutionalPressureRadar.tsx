"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface RadarAxis {
    label: string;
    score: number; // 0 to 100
    current_value: string;
}

interface InstitutionalPressureRadarProps {
    axes: RadarAxis[];
    score: number;
    bias: "BUY" | "SELL" | "NEUTRAL";
    symbol: string;
}

export default function InstitutionalPressureRadar({
    axes,
    score,
    bias,
    symbol,
}: InstitutionalPressureRadarProps) {
    const size = 340;
    const center = size / 2;
    const radius = 105;

    // Default to 5 standardized axes if less than 5 provided
    const safeAxes = useMemo(() => {
        if (!axes || axes.length === 0) {
            return [
                { label: "Rate Spread / CB", score: 70, current_value: "+125 bps" },
                { label: "Real Yields / DXY", score: 65, current_value: "2.39%" },
                { label: "COT Positioning", score: 80, current_value: "Net Long" },
                { label: "Vol Regime (VIX)", score: 60, current_value: "18.4 Norm" },
                { label: "Multi-TF Structure", score: 75, current_value: "Bullish" },
            ];
        }
        return axes.slice(0, 5);
    }, [axes]);

    const numPoints = safeAxes.length;

    // Calculate grid ring polygons (20%, 40%, 60%, 80%, 100%)
    const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
        const ringRadius = radius * level;
        const points = safeAxes.map((_, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numPoints;
            const x = center + ringRadius * Math.cos(angle);
            const y = center + ringRadius * Math.sin(angle);
            return `${x},${y}`;
        });
        return points.join(" ");
    });

    // Calculate data polygon coordinates
    const dataPoints = safeAxes.map((axis, i) => {
        const normalized = Math.max(15, Math.min(100, axis.score || 50)) / 100;
        const currentRadius = radius * normalized;
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numPoints;
        const x = center + currentRadius * Math.cos(angle);
        const y = center + currentRadius * Math.sin(angle);
        return { x, y, angle, label: axis.label, value: axis.current_value, score: axis.score };
    });

    const polygonPointsString = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

    // Theme color based on bias
    const themeColor =
        bias === "BUY"
            ? { stroke: "#10B981", fill: "rgba(16, 185, 129, 0.22)", glow: "#10B981" }
            : bias === "SELL"
                ? { stroke: "#EF4444", fill: "rgba(239, 68, 68, 0.22)", glow: "#EF4444" }
                : { stroke: "#F59E0B", fill: "rgba(245, 158, 11, 0.22)", glow: "#F59E0B" };

    return (
        <div className="flex flex-col items-center justify-center relative select-none w-full">
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="w-full h-full overflow-visible"
                >
                    <defs>
                        {/* Radial Glow Filter */}
                        <filter id={`radar-glow-${symbol}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <radialGradient id={`radar-grad-${symbol}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={themeColor.glow} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={themeColor.glow} stopOpacity="0.05" />
                        </radialGradient>
                    </defs>

                    {/* Concentric Background Grid Rings */}
                    {gridRings.map((points, idx) => (
                        <polygon
                            key={idx}
                            points={points}
                            fill="none"
                            stroke="currentColor"
                            className="text-border/40"
                            strokeWidth={idx === 4 ? "1.5" : "1"}
                            strokeDasharray={idx < 4 ? "3 3" : undefined}
                        />
                    ))}

                    {/* Radial Spoke Lines from Center to Outer Vertex */}
                    {safeAxes.map((_, i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numPoints;
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        return (
                            <line
                                key={i}
                                x1={center}
                                y1={center}
                                x2={x}
                                y2={y}
                                stroke="currentColor"
                                className="text-border/40"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Filled Radar Data Polygon */}
                    <motion.polygon
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ transformOrigin: `${center}px ${center}px` }}
                        points={polygonPointsString}
                        fill={`url(#radar-grad-${symbol})`}
                        stroke={themeColor.stroke}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        filter={`url(#radar-glow-${symbol})`}
                    />

                    {/* Data Point Markers on Vertices */}
                    {dataPoints.map((p, idx) => (
                        <g key={idx}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="4.5"
                                fill={themeColor.stroke}
                                className="drop-shadow-md"
                            />
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="7"
                                fill="none"
                                stroke={themeColor.stroke}
                                strokeWidth="1.5"
                                opacity="0.6"
                            />
                        </g>
                    ))}
                </svg>

                {/* Central Score Hub Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-background/90 backdrop-blur-md border border-border/80 shadow-2xl flex flex-col items-center justify-center">
                        <span className="text-[9px] uppercase font-mono font-bold text-muted-foreground tracking-wider">
                            Score
                        </span>
                        <span className="text-lg font-black font-['Montserrat'] text-foreground leading-none">
                            {score}
                        </span>
                        <span className="text-[8px] font-bold text-accent font-mono mt-0.5">
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Axis Labels Positioned Outside Vertices */}
                {dataPoints.map((p, idx) => {
                    const labelDist = radius + 32;
                    const lx = center + labelDist * Math.cos(p.angle);
                    const ly = center + labelDist * Math.sin(p.angle);

                    // Text anchor alignment based on angle
                    const isTop = Math.abs(p.angle + Math.PI / 2) < 0.2;
                    const isBottom = Math.abs(p.angle - Math.PI / 2) < 0.2;
                    const isRight = Math.cos(p.angle) > 0.3;

                    return (
                        <div
                            key={idx}
                            style={{
                                position: "absolute",
                                left: `${(lx / size) * 100}%`,
                                top: `${(ly / size) * 100}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                            className={`flex flex-col text-center pointer-events-none whitespace-nowrap ${
                                isTop ? "items-center" : isBottom ? "items-center" : isRight ? "items-start" : "items-end"
                            }`}
                        >
                            <span className="text-[10px] font-bold text-foreground/90 font-['Montserrat'] uppercase tracking-tight">
                                {p.label}
                            </span>
                            <span className="text-[9px] font-mono text-accent font-semibold px-1.5 py-0.2 rounded bg-accent/10 border border-accent/20 w-fit">
                                {p.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
