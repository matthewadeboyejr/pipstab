"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

interface DayData {
    date: string; // YYYY-MM-DD
    pnl: number;
    trades: number;
}

interface SessionCalendarProps {
    data: DayData[];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function SessionCalendar({ data }: SessionCalendarProps) {
    const today = new Date();
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    const dataMap = new Map(data.map((d) => [d.date, d]));

    // Navigate months
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    };

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday=0 alignment
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const calendarCells: (DayData | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < startDow; i++) calendarCells.push(null);
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayData = dataMap.get(dateStr) || { date: dateStr, pnl: 0, trades: 0 };
        calendarCells.push(dayData);
    }
    // Trailing empty cells
    while (calendarCells.length % 7 !== 0) calendarCells.push(null);

    const weeks: (DayData | null)[][] = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
        weeks.push(calendarCells.slice(i, i + 7));
    }

    // Month stats
    const monthData = data.filter((d) => {
        const date = new Date(d.date);
        return date.getMonth() === viewMonth && date.getFullYear() === viewYear && d.trades > 0;
    });
    const totalPnl = monthData.reduce((sum, d) => sum + d.pnl, 0);
    const totalTrades = monthData.reduce((sum, d) => sum + d.trades, 0);
    const winDays = monthData.filter((d) => d.pnl > 0).length;
    const lossDays = monthData.filter((d) => d.pnl < 0).length;

    const isToday = (day: DayData) => {
        const t = today.toISOString().split("T")[0];
        return day.date === t;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-card border border-border/50 p-5"
        >
            {/* Header — Month nav + stats */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Trading Calendar</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Daily P&L overview</p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-foreground font-['Montserrat'] min-w-[140px] text-center">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Monthly stats bar */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                    { label: "Trades", value: totalTrades.toString() },
                    { label: "P&L", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`, color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Win Days", value: winDays.toString(), color: "text-emerald-400" },
                    { label: "Loss Days", value: lossDays.toString(), color: "text-red-400" },
                ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-secondary/50 px-2.5 py-2 text-center">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                        <p className={`text-sm font-bold font-['Montserrat'] ${s.color || "text-foreground"}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center">
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{d}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1">
                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                        {week.map((day, di) => {
                            if (!day) {
                                return <div key={`${wi}-${di}`} className="aspect-square rounded-lg" />;
                            }

                            const dayNum = parseInt(day.date.split("-")[2]);
                            const hasTrades = day.trades > 0;
                            const isWin = day.pnl > 0;
                            const isLoss = day.pnl < 0;
                            const todayCell = isToday(day);

                            return (
                                <motion.div
                                    key={`${wi}-${di}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (wi * 7 + di) * 0.01, duration: 0.15 }}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 relative cursor-pointer transition-all group
                                        ${todayCell ? "ring-1.5 ring-accent" : ""}
                                        ${hasTrades && isWin ? "bg-emerald-500/10 hover:bg-emerald-500/20" : ""}
                                        ${hasTrades && isLoss ? "bg-red-500/10 hover:bg-red-500/20" : ""}
                                        ${!hasTrades ? "bg-secondary/30 hover:bg-secondary/60" : ""}
                                    `}
                                    title={hasTrades ? `${day.date}: ${day.trades} trade${day.trades > 1 ? "s" : ""}, ${day.pnl >= 0 ? "+" : ""}$${day.pnl.toFixed(0)}` : day.date}
                                >
                                    {/* Day number */}
                                    <span className={`text-[11px] font-semibold font-['Montserrat'] ${todayCell ? "text-accent" : "text-foreground/70"}`}>
                                        {dayNum}
                                    </span>

                                    {/* P&L indicator */}
                                    {hasTrades && (
                                        <div className="flex items-center gap-0.5">
                                            {isWin ? (
                                                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                                            ) : (
                                                <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                                            )}
                                            <span className={`text-[8px] font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                                                {day.pnl >= 0 ? "+" : ""}${Math.abs(day.pnl) >= 1000 ? `${(day.pnl / 1000).toFixed(1)}k` : day.pnl.toFixed(0)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Trade count dot */}
                                    {hasTrades && (
                                        <div className="absolute top-1 right-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isWin ? "bg-emerald-400" : "bg-red-400"}`} />
                                        </div>
                                    )}

                                    {/* Tooltip on hover */}
                                    {hasTrades && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-popover border border-border text-[9px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                            {day.trades} trade{day.trades > 1 ? "s" : ""} · {day.pnl >= 0 ? "+" : ""}${day.pnl.toFixed(0)}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30" />
                    <span className="text-[9px] text-muted-foreground">Profit Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/30" />
                    <span className="text-[9px] text-muted-foreground">Loss Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-secondary/50 border border-border/30" />
                    <span className="text-[9px] text-muted-foreground">No Trades</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded border border-accent" />
                    <span className="text-[9px] text-muted-foreground">Today</span>
                </div>
            </div>
        </motion.div>
    );
}
