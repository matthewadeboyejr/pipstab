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
    Globe,
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO, isValid, differenceInSeconds } from "date-fns";
import { useToast } from "@/context/ToastContext";
import { EconomicCalendarEvent } from "@/app/api/fundamentals/calendar/route";
import {
    POPULAR_TIMEZONES,
    formatTimeInTz,
    getDatePartInTz,
    getShortTzAbbreviation,
    getClientTimezone,
} from "@/lib/macro/timezones";

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
    const [dateFilter, setDateFilter] = useState<"TODAY" | "TOMORROW" | "YESTERDAY" | "ALL">("TODAY");
    const [selectedTimezone, setSelectedTimezone] = useState<string>("LOCAL");
    const [copiedSchedule, setCopiedSchedule] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { addToast } = useToast();

    // Load saved timezone or default to LOCAL (user browser timezone)
    useEffect(() => {
        const savedTz = localStorage.getItem("piptab_macro_timezone");
        if (savedTz) {
            setSelectedTimezone(savedTz);
        }
    }, []);

    const handleTimezoneChange = (tzId: string) => {
        setSelectedTimezone(tzId);
        localStorage.setItem("piptab_macro_timezone", tzId);
        const tzObj = POPULAR_TIMEZONES.find((t) => t.id === tzId);
        const name = tzObj?.label || tzId;
        addToast(`Timezone switched to ${name}`, "success");
    };

    // Clock ticker for live countdown
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchCalendar = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/fundamentals/calendar", {
                cache: "no-store",
            });
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

    const activeTzLabel = useMemo(() => {
        const tz = POPULAR_TIMEZONES.find((t) => t.id === selectedTimezone);
        if (selectedTimezone === "LOCAL") {
            const detected = getClientTimezone();
            return `Local (${detected.split("/").pop()?.replace(/_/g, " ") || detected})`;
        }
        return tz?.city || tz?.label || selectedTimezone;
    }, [selectedTimezone]);

    const activeTzAbbr = useMemo(() => {
        return getShortTzAbbreviation(selectedTimezone);
    }, [selectedTimezone]);

    // Filtered events
    const filteredEvents = useMemo(() => {
        const todayStr = getDatePartInTz(currentTime.toISOString(), selectedTimezone);

        const yesterdayDate = new Date(currentTime);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = getDatePartInTz(yesterdayDate.toISOString(), selectedTimezone);

        const tomorrowDate = new Date(currentTime);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = getDatePartInTz(tomorrowDate.toISOString(), selectedTimezone);

        return events.filter((ev) => {
            // Impact filter
            if (impactFilter === "HIGH" && ev.impact !== "High") return false;
            if (impactFilter === "MED_HIGH" && ev.impact === "Low") return false;

            // Currency filter
            if (selectedCurrency !== "ALL" && ev.country.toUpperCase() !== selectedCurrency) return false;

            // Date filter based on selected timezone
            if (dateFilter !== "ALL") {
                const evDateStr = getDatePartInTz(ev.time, selectedTimezone);
                if (dateFilter === "YESTERDAY" && evDateStr !== yesterdayStr) return false;
                if (dateFilter === "TODAY" && evDateStr !== todayStr) return false;
                if (dateFilter === "TOMORROW" && evDateStr !== tomorrowStr) return false;
            }

            return true;
        });
    }, [events, impactFilter, selectedCurrency, dateFilter, selectedTimezone, currentTime]);

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

    const getActualHighlight = (actual: string | null, estimate: string, prev: string) => {
        if (!actual || actual === "Pending") return "text-muted-foreground/60 italic";
        const actNum = parseFloat(actual.replace(/[^0-9.-]/g, ""));
        const estNum = parseFloat((estimate || prev || "").replace(/[^0-9.-]/g, ""));
        if (!isNaN(actNum) && !isNaN(estNum) && estNum !== 0) {
            if (actNum > estNum) return "text-emerald-400 font-black";
            if (actNum < estNum) return "text-red-400 font-black";
        }
        return "text-accent font-black";
    };

    const formatDateLabel = (dateStr: string) => {
        try {
            const todayStr = getDatePartInTz(currentTime.toISOString(), selectedTimezone);
            const yesterdayDate = new Date(currentTime);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = getDatePartInTz(yesterdayDate.toISOString(), selectedTimezone);
            const tomorrowDate = new Date(currentTime);
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrowStr = getDatePartInTz(tomorrowDate.toISOString(), selectedTimezone);

            if (dateStr === todayStr) return "Today";
            if (dateStr === yesterdayStr) return "Yesterday";
            if (dateStr === tomorrowStr) return "Tomorrow";

            const parts = dateStr.split("-");
            if (parts.length === 3) {
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return format(d, "EEEE, MMMM do");
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    const groupedEvents = useMemo(() => {
        return filteredEvents.reduce((acc: Record<string, EconomicCalendarEvent[]>, event) => {
            const datePart = getDatePartInTz(event.time, selectedTimezone);
            if (!acc[datePart]) acc[datePart] = [];
            acc[datePart].push(event);
            return acc;
        }, {});
    }, [filteredEvents, selectedTimezone]);

    const copyCalendarSchedule = () => {
        if (filteredEvents.length === 0) return;
        const text = `📅 [PIPTAB INSTITUTIONAL ECONOMIC SCHEDULE - ${activeTzLabel.toUpperCase()}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timezone: ${activeTzLabel} (${activeTzAbbr}) | Filter: ${impactFilter === "HIGH" ? "High Impact Only" : "High & Medium"} | Currency: ${selectedCurrency}

${filteredEvents.slice(0, 15).map((ev) => {
            const timeStr = formatTimeInTz(ev.time, selectedTimezone);
            return `• [${ev.impact.toUpperCase()}] ${ev.country} - ${ev.event} (${timeStr} ${activeTzAbbr})
  Consensus: ${ev.estimate} | Prior: ${ev.prev} | Actual: ${ev.actual || "Pending"}
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
            {/* Header with Timezone Selector */}
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

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Timezone Selector Dropdown */}
                    <div className="relative flex items-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-foreground hover:bg-white/10 transition-all cursor-pointer">
                            <Globe className="w-3.5 h-3.5 text-accent" />
                            <select
                                value={selectedTimezone}
                                onChange={(e) => handleTimezoneChange(e.target.value)}
                                className="bg-transparent text-xs font-bold text-foreground font-mono outline-none cursor-pointer appearance-none pr-4"
                            >
                                {POPULAR_TIMEZONES.map((tz) => (
                                    <option key={tz.id} value={tz.id} className="bg-[#0E131F] text-foreground">
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-muted-foreground pointer-events-none -ml-3" />
                        </div>
                    </div>

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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 shadow-sm transition-all font-['Montserrat'] disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        <span>Refresh Feed</span>
                    </button>
                </div>
            </div>

            {/* Next Major Catalyst Alert Card */}
            {nextHighImpactEvent && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-card to-card border border-red-500/30 shadow-md space-y-3 relative overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <Flame className="w-5 h-5 text-red-400 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
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
                            <span>Time: <strong className="text-accent">{formatTimeInTz(nextHighImpactEvent.time, selectedTimezone)} {activeTzAbbr}</strong></span>
                        </div>
                        <div className="text-[11px] text-muted-foreground/90 max-w-xl">
                            <span className="text-accent font-semibold">Deviation Rule: </span>
                            {nextHighImpactEvent.deviation_playbook?.beat_consensus || "Monitor volatility impulse at release."}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Filter Matrix Controls */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/40 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Impact Level Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-0.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
                            <Filter className="w-3 h-3 text-accent" /> Impact:
                        </span>
                        {[
                            { id: "HIGH", label: "High Impact", color: "bg-red-500" },
                            { id: "MED_HIGH", label: "High & Med", color: "bg-amber-500" },
                            { id: "ALL", label: "All Releases", color: "bg-blue-400" },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setImpactFilter(btn.id as any)}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap shrink-0 ${impactFilter === btn.id
                                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                    : "bg-white/[0.02] border-border/40 text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${btn.color}`} />
                                <span>{btn.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Date Selector */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                        {[
                            { id: "YESTERDAY", label: "Yesterday" },
                            { id: "TODAY", label: "Today" },
                            { id: "TOMORROW", label: "Tomorrow" },
                            { id: "ALL", label: "Whole Week" },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setDateFilter(btn.id as any)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border shrink-0 ${dateFilter === btn.id
                                    ? "bg-accent/20 text-accent border-accent/50 font-bold shadow-sm"
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${selectedCurrency === curr
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
                                const evTimeFormatted = formatTimeInTz(event.time, selectedTimezone);

                                return (
                                    <div key={eventKey} className="space-y-1">
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.2) }}
                                            onClick={() => setExpandedEvent(isExpanded ? null : eventKey)}
                                            className={`cursor-pointer group rounded-2xl bg-card border ${isExpanded
                                                ? "border-accent/40 bg-accent/[0.02]"
                                                : "border-border/30 hover:border-accent/30"
                                                } p-4 transition-all shadow-sm`}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                                                {/* Time & Country with Timezone Tag */}
                                                <div className="md:col-span-2 flex items-center gap-2.5">
                                                    <span className="text-lg">
                                                        {countryFlags[event.country] || "🌐"}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs font-bold text-foreground font-mono">
                                                                {evTimeFormatted}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-muted-foreground/80">
                                                                {activeTzAbbr}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground font-bold">
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
                                                        <p className={`text-xs font-mono ${getActualHighlight(event.actual, event.estimate, event.prev)}`}>
                                                            {event.actual !== null && event.actual !== "" ? event.actual : "Pending"}
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
                                                        transition={{ duration: 0.2 }}
                                                        className="mt-4 pt-4 border-t border-border/30 space-y-4 overflow-hidden"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Commentary & Overview */}
                                                            <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.015] border border-border/20">
                                                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono flex items-center gap-1.5">
                                                                    <Info className="w-3.5 h-3.5 text-accent" /> Institutional Overview
                                                                </span>
                                                                <p className="text-xs text-foreground/90 leading-relaxed">
                                                                    {event.commentary}
                                                                </p>
                                                            </div>

                                                            {/* Affected Currency Pairs & Assets */}
                                                            <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.015] border border-border/20">
                                                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono flex items-center gap-1.5">
                                                                    <Target className="w-3.5 h-3.5 text-accent" /> High-Beta Correlated Assets
                                                                </span>
                                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                                    {event.affected_pairs?.map((pair) => (
                                                                        <span
                                                                            key={pair}
                                                                            className="px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent font-mono font-bold text-[10px]"
                                                                        >
                                                                            {pair}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Deviation Reaction Playbook */}
                                                        {event.deviation_playbook && (
                                                            <div className="p-4 rounded-xl bg-black/40 border border-border/40 space-y-3">
                                                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono flex items-center gap-1.5">
                                                                    <Shield className="w-3.5 h-3.5 text-accent" /> Algorithmic Deviation Playbook
                                                                </span>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                                                                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                                            <span>Beat Consensus (+Deviation)</span>
                                                                        </div>
                                                                        <p className="text-xs text-foreground/80 leading-relaxed">
                                                                            {event.deviation_playbook.beat_consensus}
                                                                        </p>
                                                                    </div>

                                                                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 space-y-1">
                                                                        <div className="flex items-center gap-1.5 text-red-400 font-bold text-[11px]">
                                                                            <ArrowDownRight className="w-3.5 h-3.5" />
                                                                            <span>Miss Consensus (-Deviation)</span>
                                                                        </div>
                                                                        <p className="text-xs text-foreground/80 leading-relaxed">
                                                                            {event.deviation_playbook.miss_consensus}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
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

                {filteredEvents.length === 0 && !isLoading && (
                    <div className="p-12 text-center rounded-2xl bg-card border border-border/30 space-y-3">
                        <CalendarIcon className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm font-bold text-foreground">
                            No events found for {dateFilter === "TODAY" ? "Today" : dateFilter === "TOMORROW" ? "Tomorrow" : dateFilter === "YESTERDAY" ? "Yesterday" : "this period"}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            {dateFilter !== "ALL"
                                ? "There are no scheduled releases matching your filters on this day. You can view the whole week's schedule."
                                : "Try adjusting your impact level or currency filter."}
                        </p>
                        {dateFilter !== "ALL" && (
                            <button
                                onClick={() => setDateFilter("ALL")}
                                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-bold hover:bg-accent/20 transition-all font-['Montserrat']"
                            >
                                <span>View Whole Week</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
