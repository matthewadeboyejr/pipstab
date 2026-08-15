"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
    Send,
    Bot,
    User,
    ShieldCheck,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Sparkles,
    Copy,
    Check,
    Quote,
    Flame,
    Target,
    Zap,
    Scale,
    Shield,
    ChevronDown,
    HeartHandshake,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { AuditReportData } from "@/app/api/ai/audit/route";

type Message = {
    id: string;
    role: "user" | "assistant";
    content?: string;
    report?: AuditReportData;
    timestamp: Date;
};

type AuditorTone = "brutal" | "constructive" | "supportive";

const TONE_OPTIONS: Array<{
    id: AuditorTone;
    label: string;
    subtitle: string;
    badgeStyle: string;
    icon: typeof AlertTriangle;
    accentColor: string;
}> = [
    {
        id: "brutal",
        label: "Zero Sugar-Coating",
        subtitle: "Brutally honest prop firm risk director",
        badgeStyle: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
        icon: AlertTriangle,
        accentColor: "text-red-400",
    },
    {
        id: "constructive",
        label: "Constructive & Analytical",
        subtitle: "Balanced senior quantitative strategy coach",
        badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
        icon: Scale,
        accentColor: "text-amber-400",
    },
    {
        id: "supportive",
        label: "Supportive & Mentoring",
        subtitle: "Encouraging psychology & habit mentor",
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
        icon: HeartHandshake,
        accentColor: "text-emerald-400",
    },
];

const PROMPT_STARTERS = [
    { label: "🔍 Full Performance Audit", prompt: "Conduct a full performance audit on my recent trade logs." },
    { label: "⚠️ Find My Biggest Risk Leak", prompt: "What is the single biggest risk management leak or bad habit in my journal?" },
    { label: "🧠 Check for Revenge Trading", prompt: "Analyze my trade timing and emotional notes: Am I revenge trading or forcing setups?" },
    { label: "🎯 Review Discipline & R:R", prompt: "Audit my Risk-to-Reward discipline and adherence to trade plans." },
];

export default function JournalAuditor() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            report: {
                type: "structured",
                verdict_headline: "Performance Auditor Standing By",
                summary: "I have direct access to your recent trade journal logs. Select your coaching mode on the top-right to adjust my feedback style, and let's address your execution discipline.",
                leaks_found: [],
                directives: [
                    "Ask for a full audit of your latest trades",
                    "Target specific setups or emotional logs for deep-dive analysis",
                ],
                coaching_tip: "Elite trading is not about being right—it is about rigorous execution and capital survival.",
            },
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTone, setSelectedTone] = useState<AuditorTone>("brutal");
    const [toneDropdownOpen, setToneDropdownOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const toneDropdownRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const currentToneConfig = TONE_OPTIONS.find((t) => t.id === selectedTone) || TONE_OPTIONS[0];
    const ToneIcon = currentToneConfig.icon;

    // Close tone dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (toneDropdownRef.current && !toneDropdownRef.current.contains(event.target as Node)) {
                setToneDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (userPrompt?: string) => {
        const textToSend = userPrompt || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!userPrompt) setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: textToSend, tone: selectedTone }),
            });

            if (!response.ok) throw new Error("Auditor failed to respond");

            const data: AuditReportData = await response.json();

            const assistMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                report: data,
                content: data.raw_text || data.summary,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistMsg]);
        } catch (error: any) {
            addToast(error.message || "Failed to contact auditor", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const copyAuditReport = (report: AuditReportData, msgId: string) => {
        const text = `📋 [PIPTAB TRADING PERFORMANCE AUDIT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode: ${currentToneConfig.label}
Verdict: ${report.verdict_headline}
Summary: ${report.summary}

⚠️ IDENTIFIED PERFORMANCE LEAKS:
${report.leaks_found.map((l) => `• [${l.severity.toUpperCase()}] ${l.title}
  Reference: "${l.trade_reference || 'Trade log baseline'}"
  Diagnosis: ${l.breakdown}`).join("\n\n")}

⚔️ NON-NEGOTIABLE DIRECTIVES:
${report.directives.map((d) => `• ${d}`).join("\n")}

💡 COACHING PRINCIPLE:
"${report.coaching_tip}"

⚠️ DISCLAIMER:
Performance audits are strictly for self-reflection and risk awareness. Not financial advice.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        navigator.clipboard.writeText(text);
        setCopiedId(msgId);
        addToast("Copied Performance Audit to clipboard!", "success");
        setTimeout(() => setCopiedId(null), 3000);
    };

    return (
        <div className="flex flex-col h-[750px] rounded-2xl bg-card border border-border/50 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 bg-emerald-500/[0.03] flex items-center justify-between relative z-20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Performance Auditor & Risk Director
                            </h3>
                            <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                                Active Journal Sync
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Objective analysis of discipline, risk of ruin, and behavioral psychology
                        </p>
                    </div>
                </div>

                {/* Interactive Coaching Mode Selector */}
                <div className="relative" ref={toneDropdownRef}>
                    <button
                        onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${currentToneConfig.badgeStyle}`}
                    >
                        <ToneIcon className="w-3.5 h-3.5" />
                        <span>{currentToneConfig.label}</span>
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                toneDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <AnimatePresence>
                        {toneDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-card border border-border/50 shadow-2xl p-2 z-50 space-y-1"
                            >
                                <div className="px-3 py-1.5 border-b border-border/20 mb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                        Select Coaching Style
                                    </span>
                                </div>

                                {TONE_OPTIONS.map((tone) => {
                                    const Icon = tone.icon;
                                    const isSelected = selectedTone === tone.id;
                                    return (
                                        <button
                                            key={tone.id}
                                            onClick={() => {
                                                setSelectedTone(tone.id);
                                                setToneDropdownOpen(false);
                                                addToast(`Auditor Mode: ${tone.label}`, "info");
                                            }}
                                            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                                                isSelected
                                                    ? "bg-white/10 border border-border/50 text-foreground"
                                                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <div className={`p-1.5 rounded-lg bg-white/5 ${tone.accentColor} mt-0.5`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-foreground">
                                                        {tone.label}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className="w-3.5 h-3.5 text-accent" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                                    {tone.subtitle}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-black/20">
                {messages.map((m) => (
                    <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {m.role === "user" ? (
                            // User Message Bubble
                            <div className="max-w-[80%] flex items-start gap-2.5 flex-row-reverse">
                                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-accent text-accent-foreground font-bold text-xs shadow-md">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="p-4 rounded-2xl bg-accent text-accent-foreground text-xs font-semibold leading-relaxed rounded-tr-none shadow-md">
                                    {m.content}
                                </div>
                            </div>
                        ) : (
                            // Auditor Structured Response
                            <div className="max-w-[95%] w-full flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-1">
                                    <Bot className="w-4 h-4" />
                                </div>

                                <div className="flex-1 space-y-4">
                                    {m.report ? (
                                        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg space-y-5">
                                            {/* Top Verdict Bar */}
                                            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border/30">
                                                <div className="space-y-1 max-w-2xl">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                                            <ShieldAlert className="w-3 h-3" /> Audit Verdict
                                                        </span>
                                                    </div>
                                                    <h4 className="text-base font-extrabold text-foreground leading-snug font-['Montserrat']">
                                                        {m.report.verdict_headline}
                                                    </h4>
                                                    <p className="text-xs text-foreground/80 leading-relaxed pt-1">
                                                        {m.report.summary}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => copyAuditReport(m.report!, m.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                                                >
                                                    {copiedId === m.id ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            <span className="text-emerald-400 text-[11px]">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span className="text-[11px]">Copy Memo</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Leak Cards */}
                                            {m.report.leaks_found && m.report.leaks_found.length > 0 && (
                                                <div className="space-y-3">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                        <Flame className="w-3.5 h-3.5 text-red-400" />
                                                        Flagged Execution & Risk Leaks
                                                    </span>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        {m.report.leaks_found.map((leak, li) => (
                                                            <div
                                                                key={li}
                                                                className="p-4 rounded-xl bg-white/[0.015] border border-border/30 hover:border-red-500/30 transition-all space-y-2.5"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-foreground font-['Montserrat']">
                                                                            {li + 1}. {leak.title}
                                                                        </span>
                                                                    </div>
                                                                    <span
                                                                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                                                            leak.severity === "Critical"
                                                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                                : leak.severity === "Warning"
                                                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                        }`}
                                                                    >
                                                                        {leak.severity}
                                                                    </span>
                                                                </div>

                                                                {leak.trade_reference && (
                                                                    <div className="p-2.5 rounded-lg bg-black/40 border border-border/20 text-xs text-accent/90 italic flex items-start gap-2">
                                                                        <Quote className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                                                                        <span>{leak.trade_reference}</span>
                                                                    </div>
                                                                )}

                                                                <p className="text-xs text-foreground/90 leading-relaxed">
                                                                    {leak.breakdown}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actionable Directives */}
                                            {m.report.directives && m.report.directives.length > 0 && (
                                                <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-2.5">
                                                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-['Montserrat']">
                                                        <Target className="w-3.5 h-3.5" />
                                                        Actionable Directives for Next Session
                                                    </span>

                                                    <div className="space-y-2">
                                                        {m.report.directives.map((dir, di) => (
                                                            <div
                                                                key={di}
                                                                className="flex items-start gap-2.5 text-xs text-foreground font-medium"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                                                <span>{dir}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Coaching Principle Quote */}
                                            {m.report.coaching_tip && (
                                                <div className="pt-2 border-t border-border/20 flex items-center gap-2 text-xs text-muted-foreground italic">
                                                    <span className="text-accent font-semibold font-sans not-italic">
                                                        Risk Director Note:
                                                    </span>
                                                    <span>"{m.report.coaching_tip}"</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-card border border-border/50 text-xs leading-relaxed text-foreground">
                                            {m.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border/50 text-xs text-muted-foreground">
                            <Zap className="w-3.5 h-3.5 text-accent animate-spin" />
                            <span className="font-['Montserrat']">Auditor is cross-referencing journal logs & risk ratios...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Quick Prompt Starters */}
            <div className="px-6 py-2 bg-black/40 border-t border-border/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent" /> Quick Audit:
                </span>
                {PROMPT_STARTERS.map((starter) => (
                    <button
                        key={starter.label}
                        onClick={() => handleSend(starter.prompt)}
                        disabled={isLoading}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-accent/10 hover:border-accent/30 border border-border/30 text-xs font-semibold text-foreground/80 hover:text-accent transition-all whitespace-nowrap"
                    >
                        {starter.label}
                    </button>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-card border-t border-border/30 space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask the Auditor (${currentToneConfig.label} mode)...`}
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/[0.03] border border-border/50 text-xs focus:border-accent/40 outline-none transition-all placeholder:text-muted-foreground text-foreground"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1.5 p-2 rounded-lg bg-accent text-accent-foreground hover:brightness-110 transition-all disabled:opacity-40"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                    <span>AI Auditor cross-references your live trade logs automatically in {currentToneConfig.label} mode.</span>
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-accent" /> For educational self-audit only.
                    </span>
                </div>
            </form>
        </div>
    );
}
