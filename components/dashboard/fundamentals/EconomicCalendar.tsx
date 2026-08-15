"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
    Calendar as CalendarIcon,
    RefreshCcw,
    Info,
    ShieldAlert,
    ChevronDown,
    ChevronUp,
    Zap,
    Clock,
    Flame,
    Target,
    Copy,
    Check,
    Layers,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO, isValid, differenceInSeconds } from "date-fns";
import { useToast } from "@/context/ToastContext";
import { EconomicCalendarEvent } from "@/app/api/fundamentals/calendar/route";

const CURRENCIES = ["ALL", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

const countryFlags: Record<string, string> = {
    USD: "🇺🇸",
    EUR: "🇪🇺",
    GBP: "🇬🇧",
    JPY: "🇯🇵",
    AUD: "🇦🇺",
    CAD: "🇨🇦",
    CHF: "🇨🇭",
    NZD: "🇳🇿",
};

export default function EconomicCalendar() {
    const [events, setEvents] = useState<EconomicCalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
    const [impactFilter, setImpactFilter] = useState<"ALL" | "HIGH" | "MED_HIGH">("MED_HIGH");
    const [selectedCurrency, setSelectedCurrency] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "TOMORROW">("ALL");
    const [copiedSchedule, setCopiedSchedule] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { addToast } = useToast();

    // Clock ticker for live countdown
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
            addToast("Failed to fetch live economic calendar", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendar();
    }, []);

    // Filtered events
    const filteredEvents = useMemo(() => {
        return events.filter((ev) => {
            // Impact filter
            if (impactFilter === "HIGH" && ev.impact !== "High") return false;
            if (impactFilter === "MED_HIGH" && ev.impact === "Low") return false;

            // Currency filter
            if (selectedCurrency !== "ALL" && ev.country.toUpperCase() !== selectedCurrency) return false;

            // Date filter
            if (dateFilter !== "ALL") {
                const d = parseISO(ev.time);
                if (isValid(d)) {
                    if (dateFilter === "TODAY" && !isToday(d)) return false;
                    if (dateFilter === "TOMORROW" && !isTomorrow(d)) return false;
                }
            }

            return true;
        });
    }, [events, impactFilter, selectedCurrency, dateFilter]);

    // Next High-Impact Event
    const nextHighImpactEvent = useMemo(() => {
        const now = currentTime.getTime();
        return events.find((ev) => {
            if (ev.impact !== "High") return false;
            const evTime = new Date(ev.time).getTime();
            return evTime > now;
        });
    }, [events, currentTime]);

    // Calculate countdown string
    const countdownString = useMemo(() => {
        if (!nextHighImpactEvent) return null;
        const diffSeconds = differenceInSeconds(new Date(nextHighImpactEvent.time), currentTime);
        if (diffSeconds <= 0) return "Releasing Now";

        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        return `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
    }, [nextHighImpactEvent, currentTime]);

    const getImpactStyle = (impact: string) => {
        const i = impact.toLowerCase();
        if (i === "high") return "bg-red-500/10 text-red-400 border-red-500/20";
        if (i === "medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    };

    const formatDateLabel = (dateStr: string) => {
        try {
            const date = parseISO(dateStr);
            if (!isValid(date)) return dateStr;
            if (isToday(date)) return "Today";
            if (isTomorrow(date)) return "Tomorrow";
            return format(date, "EEEE, MMMM do");
        } catch {
            return dateStr;
        }
    };

    const groupedEvents = useMemo(() => {
        return filteredEvents.reduce((acc: Record<string, EconomicCalendarEvent[]>, event) => {
            const datePart = event.time.includes("T") ? event.time.split("T")[0] : event.time.split(" ")[0];
            if (!acc[datePart]) acc[datePart] = [];
            acc[datePart].push(event);
            return acc;
        }, {});
    }, [filteredEvents]);

    const copyCalendarSchedule = () => {
        if (filteredEvents.length === 0) return;
        const text = `📅 [PIPTAB INSTITUTIONAL ECONOMIC SCHEDULE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Filter: ${impactFilter === "HIGH" ? "High Impact Only" : "High & Medium"} | Currency: ${selectedCurrency}

${filteredEvents.slice(0, 15).map((ev) => {
    const timeStr = ev.time.includes("T") ? format(parseISO(ev.time), "EEE, MMM d @ HH:mm") : ev.time;
    return `• [${ev.impact.toUpperCase()}] ${ev.country} - ${ev.event} (${timeStr})
  Consensus: ${ev.estimate} | Prior: ${ev.prev}
  Affected Pairs: ${ev.affected_pairs?.join(", ") || "General"}`;
}).join("\n\n")}

⚠️ DISCLAIMER:
Economic release projections and deviation guidelines are for educational and risk preparation purposes only.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        navigator.clipboard.writeText(text);
        setCopiedSchedule(true);
        addToast("Copied Economic Calendar Schedule to clipboard!", "success");
        setTimeout(() => setCopiedSchedule(false), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                            Institutional Economic Calendar
                        </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Live high-impact releases, deviation reaction matrices, and consensus forecasts
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyCalendarSchedule}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                    >
                        {copiedSchedule ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied Schedule</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Schedule</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={fetchCalendar}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all font-['Montserrat']"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Syncing..." : "Refresh Feed"}
                    </button>
                </div>
            </div>

            {/* Next High-Impact Event Live Countdown Banner */}
            {nextHighImpactEvent && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-card to-card border border-red-500/20 shadow-md space-y-3"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                        Next High-Impact Event
                                    </span>
                                    <span className="text-xs font-bold text-foreground">
                                        {countryFlags[nextHighImpactEvent.country] || "🌐"} {nextHighImpactEvent.country}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-foreground mt-0.5 font-['Montserrat']">
                                    {nextHighImpactEvent.event}
                                </h4>
                            </div>
                        </div>

                        {/* Live Countdown Display */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-red-500/30 w-fit">
                            <Clock className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-sm font-extrabold font-mono text-foreground tracking-wider">
                                {countdownString}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-border/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 text-muted-foreground font-mono text-[11px]">
                            <span>Consensus: <strong className="text-foreground">{nextHighImpactEvent.estimate}</strong></span>
                            <span>Prior: <strong className="text-foreground">{nextHighImpactEvent.prev}</strong></span>
                        </div>
                        <div className="text-[11px] text-muted-foreground/90 max-w-xl">
                            <span className="text-accent font-semibold">Deviation Rule: </span>
                            {nextHighImpactEvent.deviation_playbook?.beat_consensus || "Monitor volatility impulse at release."}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Filter Matrix Controls */}
            <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Impact Level Pills */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 flex items-center gap-1">
                            <Filter className="w-3 h-3 text-accent" /> Impact:
                        </span>
                        {[
                            { id: "HIGH", label: "🔴 High Impact Only" },
                            { id: "MED_HIGH", label: "🟡 High & Medium" },
                            { id: "ALL", label: "All Releases" },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setImpactFilter(btn.id as any)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                                    impactFilter === btn.id
                                        ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                        : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Selector */}
                    <div className="flex items-center gap-1.5">
                        {[
                            { id: "ALL", label: "This Week" },
                            { id: "TODAY", label: "Today" },
                            { id: "TOMORROW", label: "Tomorrow" },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setDateFilter(btn.id as any)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                                    dateFilter === btn.id
                                        ? "bg-white/10 text-foreground border-border/60"
                                        : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Currency Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-border/20 no-scrollbar">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Currency:</span>
                    {CURRENCIES.map((curr) => (
                        <button
                            key={curr}
                            onClick={() => setSelectedCurrency(curr)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                                selectedCurrency === curr
                                    ? "bg-accent/20 text-accent border-accent/40"
                                    : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {countryFlags[curr] ? `${countryFlags[curr]} ${curr}` : curr}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events List Grouped By Date */}
            <div className="space-y-6">
                {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/10 rounded-full font-['Montserrat']">
                                {formatDateLabel(date)}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-semibold">
                                ({dayEvents.length} events)
                            </span>
                            <div className="h-px flex-1 bg-border/20" />
                        </div>

                        <div className="grid gap-2.5">
                            {dayEvents.map((event, i) => {
                                const eventKey = `${date}-${event.id || i}`;
                                const isExpanded = expandedEvent === eventKey;
                                const evTimeFormatted = event.time.includes("T")
                                    ? format(parseISO(event.time), "HH:mm")
                                    : event.time.split(" ")[1] || event.time;

                                return (
                                    <div key={eventKey} className="space-y-1">
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.2) }}
                                            onClick={() => setExpandedEvent(isExpanded ? null : eventKey)}
                                            className={`cursor-pointer group rounded-2xl bg-card border ${
                                                isExpanded
                                                    ? "border-accent/40 bg-accent/[0.02]"
                                                    : "border-border/30 hover:border-accent/30"
                                            } p-4 transition-all shadow-sm`}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                                                {/* Time & Country */}
                                                <div className="md:col-span-2 flex items-center gap-2.5">
                                                    <span className="text-lg">
                                                        {countryFlags[event.country] || "🌐"}
                                                    </span>
                                                    <div>
                                                        <span className="text-xs font-bold text-foreground font-mono">
                                                            {evTimeFormatted}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-bold ml-1.5">
                                                            {event.country}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Event Name */}
                                                <div className="md:col-span-5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors font-['Montserrat']">
                                                            {event.event}
                                                        </h4>
                                                        <span
                                                            className={`px-2 py-0.2 rounded text-[9px] font-extrabold uppercase border ${getImpactStyle(
                                                                event.impact
                                                            )}`}
                                                        >
                                                            {event.impact}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Consensus / Prev / Actual */}
                                                <div className="md:col-span-5 flex items-center justify-between gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">
                                                            Prior
                                                        </p>
                                                        <p className="text-xs font-semibold text-foreground font-mono">
                                                            {event.prev || "—"}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">
                                                            Forecast
                                                        </p>
                                                        <p className="text-xs font-bold text-foreground font-mono">
                                                            {event.estimate || "—"}
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">
                                                            Actual
                                                        </p>
                                                        <p
                                                            className={`text-xs font-extrabold font-mono ${
                                                                event.actual !== null
                                                                    ? "text-accent"
                                                                    : "text-muted-foreground/60 italic"
                                                            }`}
                                                        >
                                                            {event.actual !== null ? event.actual : "Pending"}
                                                        </p>
                                                    </div>
                                                    <div className="pl-2 border-l border-border/20 text-muted-foreground group-hover:text-foreground">
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Institutional Deep-Dive */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
                                                            {/* Commentary */}
                                                            <div className="flex items-start gap-2.5 bg-white/[0.02] rounded-xl p-3.5 border border-border/20 text-xs">
                                                                <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-0.5">
                                                                        Institutional Context
                                                                    </p>
                                                                    <p className="text-foreground/90 leading-relaxed">
                                                                        {event.commentary}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Deviation Playbook Reaction Matrix */}
                                                            {event.deviation_playbook && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
                                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                                                                            <ArrowUpRight className="w-3 h-3" /> If Actual Beats Consensus:
                                                                        </span>
                                                                        <p className="text-foreground/90 leading-relaxed">
                                                                            {event.deviation_playbook.beat_consensus}
                                                                        </p>
                                                                    </div>
                                                                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs space-y-1">
                                                                        <span className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
                                                                            <ArrowDownRight className="w-3 h-3" /> If Actual Misses Consensus:
                                                                        </span>
                                                                        <p className="text-foreground/90 leading-relaxed">
                                                                            {event.deviation_playbook.miss_consensus}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Correlated Assets */}
                                                            {event.affected_pairs && (
                                                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                                                        Correlated Assets:
                                                                    </span>
                                                                    {event.affected_pairs.map((pair) => (
                                                                        <span
                                                                            key={pair}
                                                                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-foreground/80 font-mono font-semibold"
                                                                        >
                                                                            {pair}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {filteredEvents.length === 0 && !isLoading && (
                <div className="py-20 text-center bg-card border border-dashed border-border/30 rounded-2xl space-y-2">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                    <p className="text-sm font-bold text-foreground font-['Montserrat']">No economic events found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your impact, currency, or date filters above.</p>
                </div>
            )}

            {/* Regulatory Disclaimer */}
            <div className="p-4 rounded-2xl bg-white/[0.015] border border-border/30 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span>Economic Calendar & Deviation Disclaimer</span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                    Times, forecasts, and deviation rules are compiled from institutional feeds for risk preparation and trade planning. Unforeseen data revisions and slippage may occur during high-impact market releases.
                </p>
            </div>
        </div>
    );
}
