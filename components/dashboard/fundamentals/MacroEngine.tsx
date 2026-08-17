"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
    Landmark,
    TrendingUp,
    TrendingDown,
    Minus,
    Shield,
    Zap,
    AlertTriangle,
    ChevronDown,
    X,
    Search,
    Copy,
    Check,
    Globe2,
    Activity,
    Target,
    Clock,
    Scale,
    Layers,
    SlidersHorizontal,
    Sparkles,
    BarChart3,
    ChevronUp,
    Plus,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
    CENTRAL_BANKS,
    GLOBAL_MACRO_INDICATORS,
    MACRO_PRESETS,
    CentralBankInfo,
    MacroPreset,
} from "@/lib/macro/centralBanks";

import InstitutionalPressureRadar from "@/components/dashboard/fundamentals/InstitutionalPressureRadar";
import MultiTimeframeFlowMatrix from "@/components/dashboard/fundamentals/MultiTimeframeFlowMatrix";

// ─── Available Pairs & Supported Assets ────────────────────────
const DEFAULT_PAIRS = [
    // Space & Tech Equities
    { symbol: "SPCX", name: "SpaceX / Space Exploration Index", category: "Space & Equities" },
    { symbol: "TSLA", name: "Tesla Inc.", category: "Equities" },
    { symbol: "NVDA", name: "Nvidia Corp.", category: "Equities" },
    { symbol: "AAPL", name: "Apple Inc.", category: "Equities" },
    { symbol: "PLTR", name: "Palantir Technologies", category: "Equities" },
    { symbol: "AMZN", name: "Amazon.com Inc.", category: "Equities" },
    { symbol: "MSFT", name: "Microsoft Corp.", category: "Equities" },
    { symbol: "META", name: "Meta Platforms", category: "Equities" },

    // Indices
    { symbol: "SPX500", name: "S&P 500 Index", category: "Indices" },
    { symbol: "NAS100", name: "Nasdaq 100 Index", category: "Indices" },
    { symbol: "US30", name: "Dow Jones Industrial", category: "Indices" },
    { symbol: "GER40", name: "DAX 40 Index", category: "Indices" },
    { symbol: "UK100", name: "FTSE 100 Index", category: "Indices" },
    { symbol: "JPN225", name: "Nikkei 225 Index", category: "Indices" },

    // Deriv Synthetics
    { symbol: "VOL75", name: "Volatility 75 Index", category: "Synthetics" },
    { symbol: "VOL100", name: "Volatility 100 Index", category: "Synthetics" },
    { symbol: "CRASH1000", name: "Crash 1000 Index", category: "Synthetics" },
    { symbol: "BOOM1000", name: "Boom 1000 Index", category: "Synthetics" },

    // Forex Majors & Crosses
    { symbol: "EURUSD", name: "Euro / US Dollar", category: "FX Majors" },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", category: "FX Majors" },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", category: "FX Majors" },
    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", category: "FX Majors" },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", category: "FX Majors" },
    { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", category: "FX Majors" },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc", category: "FX Majors" },
    { symbol: "EURGBP", name: "Euro / British Pound", category: "FX Crosses" },
    { symbol: "GBPJPY", name: "British Pound / Japanese Yen", category: "FX Crosses" },
    { symbol: "AUDJPY", name: "Australian Dollar / Japanese Yen", category: "FX Crosses" },
    { symbol: "EURJPY", name: "Euro / Japanese Yen", category: "FX Crosses" },
    { symbol: "GBPAUD", name: "British Pound / Australian Dollar", category: "FX Crosses" },
    { symbol: "USDMXN", name: "US Dollar / Mexican Peso", category: "Exotics" },
    { symbol: "USDZAR", name: "US Dollar / South African Rand", category: "Exotics" },

    // Commodities & Metals
    { symbol: "XAUUSD", name: "Gold / US Dollar", category: "Metals" },
    { symbol: "XAGUSD", name: "Silver / US Dollar", category: "Metals" },
    { symbol: "USOIL", name: "WTI Crude Oil", category: "Commodities" },
    { symbol: "UKOIL", name: "Brent Crude Oil", category: "Commodities" },
    { symbol: "NATGAS", name: "Natural Gas", category: "Commodities" },

    // Crypto
    { symbol: "BTCUSD", name: "Bitcoin / USD", category: "Crypto" },
    { symbol: "ETHUSD", name: "Ethereum / USD", category: "Crypto" },
    { symbol: "SOLUSD", name: "Solana / USD", category: "Crypto" },
    { symbol: "XRPUSD", name: "XRP / USD", category: "Crypto" },
];

export type AdvancedPairAnalysis = {
    symbol: string;
    category: string;
    macro_score: number;
    bias: "BUY" | "SELL" | "NEUTRAL";
    conviction: "High" | "Medium" | "Low";
    tactical_headline?: string;
    executive_summary?: string;
    market_regimes?: {
        trending: boolean;
        vol_expansion: boolean;
        range_bound: boolean;
        regime_label: string;
    };
    intraday_flow?: {
        flow_4h: { supporting_pct: number; opposing_pct: number; timing: string; edge: string };
        flow_1h: { supporting_pct: number; opposing_pct: number; timing: string; edge: string };
        flow_15m: { supporting_pct: number; opposing_pct: number; timing: string; edge: string };
    };
    radar_pressure?: {
        axes: Array<{
            label: string;
            score: number;
            current_value: string;
        }>;
    };
    macro_snapshot: {
        risk_regime: string;
        usd_context: string;
        liquidity: string;
        rate_differential: string;
    };
    key_drivers: string[];
    positioning: {
        cot_bias: string;
        cot_detail: string;
        flow_tone: string;
        overcrowded: boolean;
        retail_sentiment: string;
    };
    central_bank_divergence: {
        base_cb: string;
        quote_cb: string;
        verdict: string;
    };
    playbook: {
        strategy: string;
        key_resistance: string;
        key_support: string;
        invalidation: string;
        optimal_session: string;
    };
    scenarios: {
        bull_case: string;
        bear_case: string;
    };
    catalyst_radar: {
        upcoming_event: string;
        expected_impact: string;
        deviation_trigger: string;
    };
    institutional_brief: string;
};

const biasColors = {
    BUY: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    SELL: { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    NEUTRAL: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

const convictionBadges = {
    High: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    Medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    Low: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

interface MacroEngineProps {
    mode?: "all" | "pairs" | "central_banks";
}

export default function MacroEngine({ mode = "all" }: MacroEngineProps) {
    const [selectedPairs, setSelectedPairs] = useState<string[]>(["EURUSD", "XAUUSD", "USDJPY"]);
    const [activePreset, setActivePreset] = useState<string>("majors");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showCentralBanks, setShowCentralBanks] = useState(true);
    const [search, setSearch] = useState("");
    const [customPairs, setCustomPairs] = useState<Array<{ symbol: string; name?: string; category: string }>>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; currentSymbol: string }>({
        current: 0,
        total: 0,
        currentSymbol: "",
    });
    const [results, setResults] = useState<AdvancedPairAnalysis[]>([]);
    const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
    const { addToast } = useToast();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const allPairs = [...DEFAULT_PAIRS, ...customPairs];

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const cleanSearchSymbol = search.trim().toUpperCase().replace(/[^A-Z0-9/]/g, "");

    const filteredPairs = allPairs.filter(
        (p) =>
            (p.symbol.toLowerCase().includes(search.toLowerCase()) ||
                (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
                p.category.toLowerCase().includes(search.toLowerCase())) &&
            !selectedPairs.includes(p.symbol)
    );

    const addCustomPair = (symbolToAdd: string) => {
        const clean = symbolToAdd.trim().toUpperCase().replace(/[^A-Z0-9/]/g, "");
        if (!clean) return;

        if (!allPairs.some((p) => p.symbol === clean)) {
            let autoCategory = "Custom Asset";
            if (clean.includes("USD") || clean.length === 6) autoCategory = "FX / Commodity";
            if (["TSLA", "NVDA", "AAPL", "PLTR", "SPCX", "SPACEX"].includes(clean)) autoCategory = "Equities";
            if (clean.startsWith("VOL") || clean.startsWith("CRASH") || clean.startsWith("BOOM")) autoCategory = "Synthetics";

            setCustomPairs((prev) => [...prev, { symbol: clean, category: autoCategory }]);
        }

        if (!selectedPairs.includes(clean)) {
            setSelectedPairs((prev) => [...prev, clean]);
            setActivePreset("custom");
            addToast(`Added ${clean} to analysis list`, "success");
        }
        setSearch("");
        setDropdownOpen(false);
    };

    const togglePair = (symbol: string) => {
        setSelectedPairs((prev) =>
            prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
        );
        setActivePreset("custom");
    };

    const applyPreset = (preset: MacroPreset) => {
        setSelectedPairs(preset.pairs);
        setActivePreset(preset.id);
        addToast(`Loaded ${preset.label} preset`, "info");
    };

    const runAnalysis = async () => {
        if (selectedPairs.length === 0) return;
        setIsAnalyzing(true);
        setResults([]);
        setAnalysisProgress({ current: 0, total: selectedPairs.length, currentSymbol: selectedPairs[0] });

        const gatheredResults: AdvancedPairAnalysis[] = [];

        try {
            for (let i = 0; i < selectedPairs.length; i++) {
                const symbol = selectedPairs[i];
                const pair = allPairs.find((p) => p.symbol === symbol);
                setAnalysisProgress({ current: i + 1, total: selectedPairs.length, currentSymbol: symbol });

                const response = await fetch("/api/ai/analyze-pair", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ symbol, category: pair?.category || "FX" }),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `Failed to analyze ${symbol}`);
                }

                const data: AdvancedPairAnalysis = await response.json();
                gatheredResults.push(data);
                setResults([...gatheredResults]);
            }

            addToast("Institutional Macro Analysis Complete!", "success");
        } catch (error: any) {
            console.error("Analysis Error:", error);
            addToast(error.message || "Failed to run analysis", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyInstitutionalBrief = (pair: AdvancedPairAnalysis) => {
        const text = `📊 [PIPTAB INSTITUTIONAL MACRO BRIEF]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Asset: ${pair.symbol} (${pair.category})
Bias: ${pair.bias} | Conviction: ${pair.conviction} | Macro Score: ${pair.macro_score}/100

🏛️ CENTRAL BANK POLICY DIVERGENCE:
• Base Policy: ${pair.central_bank_divergence.base_cb}
• Quote Policy: ${pair.central_bank_divergence.quote_cb}
• Differential Verdict: ${pair.central_bank_divergence.verdict}

🎯 MACRO REGIME & FLOW:
• Regime: ${pair.macro_snapshot.risk_regime}
• USD Context: ${pair.macro_snapshot.usd_context}
• Rate Spread: ${pair.macro_snapshot.rate_differential}
• COT Positioning: ${pair.positioning.cot_bias} (${pair.positioning.cot_detail})
• Retail Sentiment: ${pair.positioning.retail_sentiment}

⚡ KEY DRIVERS:
${pair.key_drivers.map((d) => `• ${d}`).join("\n")}

⚔️ EXECUTION PLAYBOOK:
• Strategy: ${pair.playbook.strategy}
• Macro Resistance: ${pair.playbook.key_resistance}
• Macro Support: ${pair.playbook.key_support}
• Invalidation: ${pair.playbook.invalidation}
• Optimal Session: ${pair.playbook.optimal_session}

🚨 CATALYST RADAR:
• Event: ${pair.catalyst_radar.upcoming_event} (${pair.catalyst_radar.expected_impact} Impact)
• Deviation Trigger: ${pair.catalyst_radar.deviation_trigger}

📝 INSTITUTIONAL SUMMARY:
${pair.institutional_brief}

⚠️ RISK & COMPLIANCE DISCLAIMER:
This analysis is generated for educational, informational, and research purposes only and does not constitute financial, investment, or trading advice. Trading foreign exchange, commodities, equity indices, and digital assets involves significant risk of capital loss. PipTab does not guarantee future market outcomes. Always apply strict risk management.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        navigator.clipboard.writeText(text);
        setCopiedSymbol(pair.symbol);
        addToast(`Copied ${pair.symbol} Macro Brief to clipboard!`, "success");
        setTimeout(() => setCopiedSymbol(null), 3000);
    };

    const globalRegime = results.length > 0 ? results[0].macro_snapshot.risk_regime : "Neutral Liquidity Environment";

    return (
        <div className="space-y-6">
            {/* Central Bank Matrix & Global Barometer (Shown if mode !== 'pairs') */}
            {mode !== "pairs" && (
                <>
                    {/* Global Macro Barometer */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm space-y-4"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                        Global Macro & Cross-Asset Barometer
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Real-time baseline macroeconomic anchors and liquidity conditions
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/5 border border-accent/20 w-fit">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-bold text-foreground">
                                    Regime: <span className="text-accent">{globalRegime}</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                            {GLOBAL_MACRO_INDICATORS.map((ind) => (
                                <div
                                    key={ind.id}
                                    className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 hover:border-accent/20 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                            {ind.symbol}
                                        </span>
                                        <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ind.status === "Bullish" || ind.status === "Risk-On"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : ind.status === "Bearish" || ind.status === "Risk-Off"
                                                        ? "bg-red-500/10 text-red-400"
                                                        : "bg-white/5 text-muted-foreground"
                                                }`}
                                        >
                                            {ind.status}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-base font-bold text-foreground font-['Montserrat']">
                                            {ind.value}
                                        </span>
                                        <span
                                            className={`text-[10px] font-semibold ${ind.change.startsWith("+")
                                                    ? "text-emerald-400"
                                                    : ind.change.startsWith("-")
                                                        ? "text-blue-400"
                                                        : "text-muted-foreground"
                                                }`}
                                        >
                                            {ind.change}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                                        {ind.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Central Bank Policy Matrix */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm"
                    >
                        <button
                            onClick={() => setShowCentralBanks(!showCentralBanks)}
                            className="w-full px-5 py-4 flex items-center justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-b border-border/30 text-left"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Scale className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                            Global Central Bank Policy Matrix
                                        </h3>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground font-semibold">
                                            G8 Economies
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Benchmark interest rates, policy bias, and rate divergence differentials
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <span>{showCentralBanks ? "Hide Matrix" : "View Matrix"}</span>
                                {showCentralBanks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {showCentralBanks && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-x-auto"
                                >
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border/20 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider bg-white/[0.01]">
                                                <th className="px-5 py-3">Central Bank</th>
                                                <th className="px-4 py-3">Policy Rate</th>
                                                <th className="px-4 py-3">Bias / Stance</th>
                                                <th className="px-4 py-3">Trend</th>
                                                <th className="px-4 py-3">Next Decision</th>
                                                <th className="px-5 py-3">Key Focus Driver</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/20 text-xs font-medium">
                                            {Object.entries(CENTRAL_BANKS).map(([curr, cb]) => (
                                                <tr key={curr} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-5 py-3 flex items-center gap-2.5">
                                                        <span className="text-base">{cb.flag}</span>
                                                        <div>
                                                            <span className="font-bold text-foreground">{cb.code}</span>
                                                            <span className="text-[10px] text-muted-foreground ml-1.5">
                                                                ({cb.currency})
                                                            </span>
                                                            <p className="text-[10px] text-muted-foreground/80">{cb.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-accent font-mono text-sm">
                                                            {cb.rateDisplay}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cb.bias === "Hawkish"
                                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                    : cb.bias === "Dovish"
                                                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                }`}
                                                        >
                                                            {cb.bias}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-[11px] text-foreground font-semibold">
                                                            {cb.trend}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                                                        {cb.nextMeeting}
                                                    </td>
                                                    <td className="px-5 py-3 text-[11px] text-foreground/80 max-w-[280px]">
                                                        {cb.primaryDriver}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}

            {/* Pair Analysis Engine & Quantitative Multi-Factor Audit (Shown if mode !== 'central_banks') */}
            {mode !== "central_banks" && (
                <>
                    {/* Analysis Control Bar & Presets */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl bg-card border border-border/50 p-6 space-y-5"
                    >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-bold text-foreground font-['Montserrat']">
                                Pair Analysis Engine
                            </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Select macro presets or customize your watchlist for multi-factor quantitative audit
                        </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {MACRO_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => applyPreset(preset)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${activePreset === preset.id
                                        ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                        : "bg-white/[0.02] border-border/50 text-muted-foreground hover:text-foreground hover:border-accent/30"
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pair selector chips & Add Button */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/20">
                    {selectedPairs.map((symbol) => {
                        const pair = allPairs.find((p) => p.symbol === symbol);
                        return (
                            <motion.div
                                key={symbol}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-border/50 text-foreground text-xs font-bold font-mono"
                            >
                                <span>{symbol}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-muted-foreground font-sans font-semibold">
                                    {pair?.category}
                                </span>
                                <button
                                    onClick={() => togglePair(symbol)}
                                    className="ml-1 hover:text-red-400 text-muted-foreground transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}

                    {/* Add Pair Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-all"
                        >
                            + Add Asset
                            <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-card border border-border/50 shadow-2xl z-30 overflow-hidden p-2 space-y-1.5"
                                >
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-border/30">
                                        <Search className="w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && cleanSearchSymbol) {
                                                    e.preventDefault();
                                                    addCustomPair(cleanSearchSymbol);
                                                }
                                            }}
                                            placeholder="Search or enter symbol (e.g. SPCX)..."
                                            className="bg-transparent text-xs text-foreground outline-none w-full"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Direct Add Custom Asset Button */}
                                    {cleanSearchSymbol && !selectedPairs.includes(cleanSearchSymbol) && (
                                        <button
                                            onClick={() => addCustomPair(cleanSearchSymbol)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-all text-left group"
                                        >
                                            <span className="font-mono flex items-center gap-1.5">
                                                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                                                <span>Add &quot;{cleanSearchSymbol}&quot;</span>
                                            </span>
                                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
                                                Enter ↵
                                            </span>
                                        </button>
                                    )}

                                    <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5">
                                        {filteredPairs.map((pair) => (
                                            <button
                                                key={pair.symbol}
                                                onClick={() => {
                                                    togglePair(pair.symbol);
                                                    setDropdownOpen(false);
                                                    setSearch("");
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-foreground hover:bg-white/5 transition-colors text-left"
                                            >
                                                <div>
                                                    <div className="font-bold font-mono text-foreground">{pair.symbol}</div>
                                                    {pair.name && (
                                                        <div className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                                                            {pair.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground font-semibold px-2 py-0.5 rounded bg-white/5 whitespace-nowrap ml-2">
                                                    {pair.category}
                                                </span>
                                            </button>
                                        ))}
                                        {filteredPairs.length === 0 && !cleanSearchSymbol && (
                                            <p className="text-[11px] text-muted-foreground text-center py-3">
                                                All matching pairs selected
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Run AI Analysis Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <button
                        onClick={runAnalysis}
                        disabled={selectedPairs.length === 0 || isAnalyzing}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all font-['Montserrat'] ${selectedPairs.length === 0
                                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                : "bg-accent text-accent-foreground hover:brightness-110 shadow-lg shadow-accent/20 active:scale-[0.98]"
                            }`}
                    >
                        <Zap className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                        {isAnalyzing
                            ? `Auditing ${analysisProgress.currentSymbol} (${analysisProgress.current}/${analysisProgress.total})...`
                            : `Run Institutional Audit (${selectedPairs.length} Pairs)`}
                    </button>

                    {isAnalyzing && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                Step {analysisProgress.current} of {analysisProgress.total}
                            </span>
                            <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-border/30">
                                <motion.div
                                    className="h-full bg-accent"
                                    animate={{
                                        width: `${(analysisProgress.current / analysisProgress.total) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Analysis Results Display */}
            <div className="space-y-6">
                {results.map((pair, i) => {
                    const bc = biasColors[pair.bias] || biasColors.NEUTRAL;
                    const isCopied = copiedSymbol === pair.symbol;

                    return (
                        <motion.div
                            key={pair.symbol}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`rounded-2xl bg-card border ${bc.border} shadow-xl overflow-hidden`}
                        >
                            {/* Card Header & Tactical Directive Banner */}
                            <div className="p-6 border-b border-border/30 bg-gradient-to-b from-white/[0.02] to-transparent space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-foreground font-mono tracking-tight">
                                            {pair.symbol}
                                        </span>
                                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-muted-foreground font-semibold uppercase font-mono">
                                            {pair.category}
                                        </span>
                                        <span
                                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${convictionBadges[pair.conviction] || convictionBadges.Medium
                                                }`}
                                        >
                                            {pair.conviction} Conviction
                                        </span>
                                        {pair.market_regimes?.regime_label && (
                                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-mono hidden sm:inline-block">
                                                {pair.market_regimes.regime_label}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Macro Score Pill */}
                                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-border/40">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                                                Macro Score
                                            </span>
                                            <span className="text-base font-black text-foreground font-['Montserrat']">
                                                {pair.macro_score}
                                                <span className="text-[10px] text-muted-foreground font-normal">/100</span>
                                            </span>
                                        </div>

                                        {/* Bias Badge */}
                                        <div
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl ${bc.bg} ${bc.text} text-sm font-extrabold font-['Montserrat'] border ${bc.border}`}
                                        >
                                            {pair.bias === "BUY" ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : pair.bias === "SELL" ? (
                                                <TrendingDown className="w-4 h-4" />
                                            ) : (
                                                <Minus className="w-4 h-4" />
                                            )}
                                            {pair.bias}
                                        </div>

                                        {/* Copy Brief Button */}
                                        <button
                                            onClick={() => copyInstitutionalBrief(pair)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all border border-border/40"
                                            title="Copy Institutional Macro Brief"
                                        >
                                            {isCopied ? (
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Punchy Executive Directive Headline */}
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-border/40 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-accent shrink-0" />
                                        <h3 className="text-sm sm:text-base font-extrabold text-foreground font-['Montserrat'] tracking-tight">
                                            {pair.tactical_headline || (pair.bias === "BUY" ? "Lean long on structure — but size for volatility" : pair.bias === "SELL" ? "Fade rallies into macro resistance" : "Maintain neutral posture — await expansion")}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                        {pair.executive_summary || pair.institutional_brief}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* TWO-COLUMN INSTITUTIONAL TERMINAL: Flow Matrix + Pressure Radar */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                    {/* Left: Multi-Timeframe Intraday Flow (7 Cols) */}
                                    <div className="lg:col-span-7">
                                        <MultiTimeframeFlowMatrix
                                            symbol={pair.symbol}
                                            flow_4h={pair.intraday_flow?.flow_4h}
                                            flow_1h={pair.intraday_flow?.flow_1h}
                                            flow_15m={pair.intraday_flow?.flow_15m}
                                            market_regimes={pair.market_regimes}
                                            bias={pair.bias}
                                        />
                                    </div>

                                    {/* Right: Institutional Pressure Radar Spider Chart (5 Cols) */}
                                    <div className="lg:col-span-5 p-4 rounded-2xl bg-white/[0.015] border border-border/40 flex flex-col items-center justify-center space-y-2">
                                        <div className="w-full flex items-center justify-between px-2 text-xs">
                                            <span className="font-bold text-foreground font-mono flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                {pair.symbol} PRESSURE RADAR
                                            </span>
                                            <span className="text-[10px] font-bold text-accent font-mono">LIVE MATRIX</span>
                                        </div>
                                        <InstitutionalPressureRadar
                                            axes={pair.radar_pressure?.axes || []}
                                            score={pair.macro_score}
                                            bias={pair.bias}
                                            symbol={pair.symbol}
                                        />
                                    </div>
                                </div>

                                {/* 4 Macro Context Tiles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/20 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                            <span>Central Bank Spread</span>
                                            <Scale className="w-3 h-3 text-accent" />
                                        </div>
                                        <p className="text-xs font-bold text-foreground">
                                            {pair.macro_snapshot.rate_differential}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80">
                                            {pair.central_bank_divergence.verdict}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/20 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                            <span>Risk Regime</span>
                                            <Globe2 className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        <p className="text-xs font-bold text-foreground">
                                            {pair.macro_snapshot.risk_regime}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80">
                                            Liquidity: {pair.macro_snapshot.liquidity}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/20 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                            <span>COT Smart Money</span>
                                            <Shield className="w-3 h-3 text-accent" />
                                        </div>
                                        <p className="text-xs font-bold text-foreground">
                                            {pair.positioning.cot_bias}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80 line-clamp-1">
                                            {pair.positioning.cot_detail}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/20 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                            <span>Crowded Trade?</span>
                                            <AlertTriangle
                                                className={`w-3 h-3 ${pair.positioning.overcrowded ? "text-amber-400" : "text-emerald-400"
                                                    }`}
                                            />
                                        </div>
                                        <p
                                            className={`text-xs font-bold ${pair.positioning.overcrowded ? "text-amber-400" : "text-emerald-400"
                                                }`}
                                        >
                                            {pair.positioning.overcrowded
                                                ? "Squeeze Risk (Extreme Positioning)"
                                                : "Balanced / Trend Room"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80">
                                            Retail: {pair.positioning.retail_sentiment}
                                        </p>
                                    </div>
                                </div>

                                {/* Key Macro Drivers */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers className="w-3 h-3 text-accent" />
                                        Core Institutional Macro Drivers
                                    </span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {pair.key_drivers.map((driver, di) => (
                                            <div
                                                key={di}
                                                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-border/20 text-xs text-foreground/90 leading-relaxed"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                                <span>{driver}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actionable Playbook & Key Macro Levels */}
                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-border/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Target className="w-3.5 h-3.5 text-accent" />
                                            Actionable Execution Playbook
                                        </span>
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                                            Setup: {pair.playbook.strategy}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="p-3 rounded-xl bg-white/5 border border-border/20">
                                            <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">
                                                Macro Resistance / Ceiling
                                            </p>
                                            <p className="text-xs font-bold text-foreground font-mono">
                                                {pair.playbook.key_resistance}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-border/20">
                                            <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">
                                                Macro Support / Floor
                                            </p>
                                            <p className="text-xs font-bold text-foreground font-mono">
                                                {pair.playbook.key_support}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                            <p className="text-[9px] uppercase font-bold text-red-400 mb-0.5">
                                                Hard Invalidation Trigger
                                            </p>
                                            <p className="text-xs font-bold text-foreground">
                                                {pair.playbook.invalidation}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-border/20">
                                            <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Optimal Timing
                                            </p>
                                            <p className="text-xs font-bold text-foreground">
                                                {pair.playbook.optimal_session}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scenarios & Catalyst Radar */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Bull & Bear Scenarios */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/20 space-y-3">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Scenario Matrix
                                        </span>
                                        <div className="space-y-2 text-xs">
                                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                                                    Bull Trajectory:
                                                </span>
                                                <p className="text-foreground/90 leading-relaxed">
                                                    {pair.scenarios.bull_case}
                                                </p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                                                <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">
                                                    Bear Trajectory:
                                                </span>
                                                <p className="text-foreground/90 leading-relaxed">
                                                    {pair.scenarios.bear_case}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catalyst Radar */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-border/20 space-y-3 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    Upcoming Catalyst Radar
                                                </span>
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    {pair.catalyst_radar.expected_impact} Impact
                                                </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-foreground">
                                                {pair.catalyst_radar.upcoming_event}
                                            </h5>
                                            <p className="text-xs text-foreground/80 mt-2 leading-relaxed">
                                                <span className="text-accent font-semibold">Deviation Rule: </span>
                                                {pair.catalyst_radar.deviation_trigger}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>Institutional Memo Attached</span>
                                            <button
                                                onClick={() => copyInstitutionalBrief(pair)}
                                                className="text-accent font-semibold hover:underline flex items-center gap-1"
                                            >
                                                {isCopied ? "Copied Brief!" : "Copy Full Note"}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimer on Card */}
                                <div className="pt-3 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground/80 bg-white/[0.015] px-3.5 py-2 rounded-xl">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                                    <span>
                                        <strong>Risk Disclaimer:</strong> Macro score, conviction bias, and playbook scenarios are AI-generated for educational and research purposes only. Not financial or trading advice.
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty state */}
            {!isAnalyzing && results.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-card border border-border/30 p-8 space-y-4"
                >
                    <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Landmark className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-foreground font-['Montserrat']">
                            No Macro Audit Generated Yet
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                            Choose a preset above (e.g. Major FX, High-Yield Carry, Safe Havens) or add custom assets,
                            then click <span className="text-accent font-semibold">RUN INSTITUTIONAL AUDIT</span>.
                        </p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 shadow-lg shadow-accent/20 transition-all font-['Montserrat']"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Audit Default Preset ({selectedPairs.length} Pairs)
                    </button>
                </motion.div>
            )}
                </>
            )}

            {/* Global Regulatory & Risk Disclosure Banner */}
            <div className="p-4 rounded-2xl bg-white/[0.015] border border-border/30 text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span>Institutional Research & Risk Disclaimer</span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                    All macroeconomic intelligence, central bank rate matrices, COT positioning statistics, and AI trade biases provided by PipTab are strictly for educational, analytical, and journaling purposes. Financial market speculation involves substantial risk of loss. PipTab is not a registered financial advisor or broker.
                </p>
            </div>
        </div>
    );
}
