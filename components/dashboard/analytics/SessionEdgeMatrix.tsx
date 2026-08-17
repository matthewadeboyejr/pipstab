"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Compass, TrendingUp, TrendingDown } from "lucide-react";

interface SessionEdgeMatrixProps {
    trades: any[];
}

export default function SessionEdgeMatrix({ trades }: SessionEdgeMatrixProps) {
    const { sessionStats, dayStats, directionalStats } = useMemo(() => {
        // 1. Session Breakdown
        const sessions: Record<string, { wins: number; total: number; pnl: number }> = {
            London: { wins: 0, total: 0, pnl: 0 },
            "New York": { wins: 0, total: 0, pnl: 0 },
            Asian: { wins: 0, total: 0, pnl: 0 },
            Overlap: { wins: 0, total: 0, pnl: 0 },
        };

        // 2. Day of week
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayMap: Record<string, { wins: number; total: number; pnl: number }> = {
            Monday: { wins: 0, total: 0, pnl: 0 },
            Tuesday: { wins: 0, total: 0, pnl: 0 },
            Wednesday: { wins: 0, total: 0, pnl: 0 },
            Thursday: { wins: 0, total: 0, pnl: 0 },
            Friday: { wins: 0, total: 0, pnl: 0 },
        };

        // 3. Directional
        const dir = {
            long: { wins: 0, total: 0, pnl: 0 },
            short: { wins: 0, total: 0, pnl: 0 },
        };

        trades.forEach((t) => {
            const pnl = Number(t.raw_pnl) || 0;
            const isWin = pnl > 0;

            // Session mapping
            let sName = t.session || "New York";
            if (sName.toLowerCase().includes("london") && sName.toLowerCase().includes("ny")) sName = "Overlap";
            else if (sName.toLowerCase().includes("london")) sName = "London";
            else if (sName.toLowerCase().includes("new york") || sName.toLowerCase().includes("ny")) sName = "New York";
            else if (sName.toLowerCase().includes("asia") || sName.toLowerCase().includes("tokyo")) sName = "Asian";
            else sName = "New York";

            if (!sessions[sName]) sessions[sName] = { wins: 0, total: 0, pnl: 0 };
            sessions[sName].total += 1;
            sessions[sName].pnl += pnl;
            if (isWin) sessions[sName].wins += 1;

            // Day of week mapping
            const d = new Date(t.date);
            const dayName = days[d.getDay()];
            if (dayMap[dayName]) {
                dayMap[dayName].total += 1;
                dayMap[dayName].pnl += pnl;
                if (isWin) dayMap[dayName].wins += 1;
            }

            // Direction
            const direction = (t.direction || "long").toLowerCase();
            if (direction === "short") {
                dir.short.total += 1;
                dir.short.pnl += pnl;
                if (isWin) dir.short.wins += 1;
            } else {
                dir.long.total += 1;
                dir.long.pnl += pnl;
                if (isWin) dir.long.wins += 1;
            }
        });

        const formattedSessions = Object.entries(sessions)
            .map(([name, data]) => ({
                name,
                trades: data.total,
                winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
                pnl: Number(data.pnl.toFixed(2)),
            }))
            .filter((s) => s.trades > 0)
            .sort((a, b) => b.pnl - a.pnl);

        const formattedDays = Object.entries(dayMap).map(([name, data]) => ({
            name: name.slice(0, 3), // Mon, Tue...
            fullName: name,
            trades: data.total,
            winRate: data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0,
            pnl: Number(data.pnl.toFixed(2)),
        }));

        const formattedDir = {
            long: {
                trades: dir.long.total,
                winRate: dir.long.total > 0 ? Math.round((dir.long.wins / dir.long.total) * 100) : 0,
                pnl: Number(dir.long.pnl.toFixed(2)),
            },
            short: {
                trades: dir.short.total,
                winRate: dir.short.total > 0 ? Math.round((dir.short.wins / dir.short.total) * 100) : 0,
                pnl: Number(dir.short.pnl.toFixed(2)),
            },
        };

        return {
            sessionStats: formattedSessions,
            dayStats: formattedDays,
            directionalStats: formattedDir,
        };
    }, [trades]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Session Edge Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-card border border-border/50 space-y-4 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5 text-accent" />
                            Session Alpha Distribution
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Win rate and PnL per trading window</p>
                    </div>
                </div>

                <div className="space-y-2.5">
                    {sessionStats.length > 0 ? (
                        sessionStats.map((s) => (
                            <div
                                key={s.name}
                                className="p-3 rounded-xl bg-white/[0.02] border border-border/30 hover:border-accent/30 transition-all space-y-1.5"
                            >
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-foreground font-mono">{s.name} Session</span>
                                    <span
                                        className={`font-mono font-bold ${
                                            s.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                                        }`}
                                    >
                                        {s.pnl >= 0 ? "+" : ""}${s.pnl.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                s.winRate >= 60
                                                    ? "bg-emerald-500"
                                                    : s.winRate >= 45
                                                        ? "bg-amber-500"
                                                        : "bg-red-500"
                                            }`}
                                            style={{ width: `${s.winRate}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                        {s.winRate}% WR ({s.trades} trades)
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">No session data recorded.</p>
                    )}
                </div>
            </motion.div>

            {/* 2. Day of Week Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-2xl bg-card border border-border/50 space-y-4 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            Day-of-Week Edge
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Performance mapped across the trading week</p>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-1">
                    {dayStats.map((d) => {
                        const isProfitable = d.pnl > 0;
                        const isLosing = d.pnl < 0;

                        return (
                            <div
                                key={d.name}
                                className={`p-2.5 rounded-xl border text-center flex flex-col justify-between min-h-[95px] transition-all ${
                                    isProfitable
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : isLosing
                                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                                            : "bg-white/[0.02] border-border/30 text-muted-foreground"
                                }`}
                            >
                                <span className="text-[10px] font-mono font-bold uppercase">{d.name}</span>
                                <div className="my-1">
                                    <div className="text-xs font-black font-['Montserrat']">
                                        {d.pnl !== 0 ? `${d.pnl >= 0 ? "+" : ""}$${d.pnl.toFixed(0)}` : "$0"}
                                    </div>
                                    <div className="text-[9px] opacity-80 font-mono">{d.winRate}% WR</div>
                                </div>
                                <span className="text-[8px] opacity-70 font-mono">{d.trades}t</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* 3. Directional Edge (Long vs Short) */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl bg-card border border-border/50 space-y-4 shadow-sm"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                            <Compass className="w-3.5 h-3.5 text-accent" />
                            Directional Edge (Long vs Short)
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Identify psychological directional bias</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Long Card */}
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                            <span className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> Longs
                            </span>
                            <span className="font-mono text-foreground font-black">
                                {directionalStats.long.winRate}% WR
                            </span>
                        </div>
                        <div className="text-base font-black font-mono text-emerald-400">
                            {directionalStats.long.pnl >= 0 ? "+" : ""}${directionalStats.long.pnl.toFixed(2)}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono block">
                            {directionalStats.long.trades} Executed Trades
                        </span>
                    </div>

                    {/* Short Card */}
                    <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-red-400">
                            <span className="flex items-center gap-1">
                                <TrendingDown className="w-3.5 h-3.5" /> Shorts
                            </span>
                            <span className="font-mono text-foreground font-black">
                                {directionalStats.short.winRate}% WR
                            </span>
                        </div>
                        <div className="text-base font-black font-mono text-red-400">
                            {directionalStats.short.pnl >= 0 ? "+" : ""}${directionalStats.short.pnl.toFixed(2)}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono block">
                            {directionalStats.short.trades} Executed Trades
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
