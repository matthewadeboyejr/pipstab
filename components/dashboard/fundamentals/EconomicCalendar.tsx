"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    RefreshCcw,
    Info,
    ShieldAlert,
    ChevronDown,
    ChevronUp,
    Zap
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO, isValid } from "date-fns";

type EconomicEvent = {
    time: string;
    event: string;
    country: string;
    impact: "High" | "Medium" | "Low" | string;
    prev: string | number;
    estimate: string | number;
    actual: string | number | null;
    unit: string;
    commentary?: string;
};

export default function EconomicCalendar() {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    const fetchCalendar = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/fundamentals/calendar");
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch calendar:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendar();
    }, []);

    const getImpactStyle = (impact: string) => {
        const i = impact.toLowerCase();
        if (i === "high") return "bg-red-400/10 text-red-400 border-red-400/20";
        if (i === "medium") return "bg-amber-400/10 text-amber-400 border-amber-400/20";
        if (i === "low") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
        return "bg-white/5 text-muted-foreground border-border/50";
    };

    const formatDateLabel = (dateStr: string) => {
        try {
            const date = parseISO(dateStr);
            if (!isValid(date)) return dateStr;
            if (isToday(date)) return "Today";
            if (isTomorrow(date)) return "Tomorrow";
            return format(date, "EEEE, MMM d");
        } catch {
            return dateStr;
        }
    };

    const groupedEvents = events.reduce((acc: Record<string, EconomicEvent[]>, event) => {
        const datePart = event.time.includes("T") ? event.time.split("T")[0] : event.time.split(" ")[0];
        if (!acc[datePart]) acc[datePart] = [];
        acc[datePart].push(event);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Synthetic Global Calendar</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] text-muted-foreground">High-impact global economic releases with institutional AI commentary</p>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent uppercase animate-pulse">
                            <Zap className="w-2 h-2" /> AI Powered
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => fetchCalendar()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                    <RefreshCcw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Synthesizing..." : "Refresh"}
                </button>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                    <div key={date} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">{formatDateLabel(date)}</span>
                            <div className="h-px flex-1 bg-border/20" />
                        </div>

                        <div className="grid gap-3">
                            {dayEvents.map((event, i) => {
                                const eventKey = `${date}-${i}`;
                                const isExpanded = expandedEvent === eventKey;
                                return (
                                    <div key={eventKey} className="space-y-1">
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setExpandedEvent(isExpanded ? null : eventKey)}
                                            className={`cursor-pointer group rounded-xl bg-card border ${isExpanded ? "border-accent/40 bg-accent/[0.02]" : "border-border/30"} p-4 hover:border-accent/20 transition-all`}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                                                <div className="md:col-span-1 flex flex-col items-center">
                                                    <span className="text-[11px] font-bold text-foreground">
                                                        {event.time.includes("T") ? format(parseISO(event.time), "HH:mm") : event.time.split(" ")[1] || "—"}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{event.country}</span>
                                                </div>

                                                <div className="md:col-span-5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{event.event}</h4>
                                                        {event.commentary && <Info className="w-3 h-3 text-accent/50" />}
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 flex justify-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getImpactStyle(event.impact)}`}>
                                                        {event.impact}
                                                    </span>
                                                </div>

                                                <div className="md:col-span-4 flex items-center justify-between gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Prev</p>
                                                        <p className="text-[11px] font-medium text-foreground">{event.prev ?? "-"}{event.unit}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-muted-foreground uppercase mb-0.5">EST</p>
                                                        <p className="text-[11px] font-medium text-foreground">{event.estimate ?? "-"}{event.unit}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-muted-foreground uppercase mb-0.5">Actual</p>
                                                        <p className={`text-[11px] font-bold ${event.actual !== null ? "text-accent" : "text-muted-foreground"}`}>
                                                            {event.actual !== null ? `${event.actual}${event.unit}` : "Pending"}
                                                        </p>
                                                    </div>
                                                    <div className="pl-2 border-l border-border/20">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && event.commentary ? (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 pt-4 border-t border-border/20">
                                                            <div className="flex items-start gap-2 bg-accent/5 rounded-lg p-3 border border-accent/10">
                                                                <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Institutional Brief</p>
                                                                    <p className="text-[12px] text-foreground/90 leading-relaxed italic">
                                                                        {event.commentary}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : null}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && !isLoading && (
                <div className="py-20 text-center bg-card border border-dashed border-border/30 rounded-2xl">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground italic">AI strategist is currently compiling the macro schedule...</p>
                </div>
            )}

            {isLoading && (
                <div className="py-20 space-y-4 text-center">
                    <RefreshCcw className="w-6 h-6 text-accent animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground font-['Montserrat']">Running institutional macro scan...</p>
                    <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto">This takes a few seconds as the AI cross-references global liquidity schedules.</p>
                </div>
            )}
        </div>
    );
}
