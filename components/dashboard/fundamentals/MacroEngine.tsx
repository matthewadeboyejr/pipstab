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
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

// ─── Available Pairs ────────────────────────────────────────
const allPairs = [
    { symbol: "EURUSD", category: "FX" },
    { symbol: "GBPUSD", category: "FX" },
    { symbol: "USDJPY", category: "FX" },
    { symbol: "USDCAD", category: "FX" },
    { symbol: "AUDUSD", category: "FX" },
    { symbol: "NZDUSD", category: "FX" },
    { symbol: "EURGBP", category: "FX" },
    { symbol: "GBPJPY", category: "FX" },
    { symbol: "XAUUSD", category: "Metals" },
    { symbol: "XAGUSD", category: "Metals" },
    { symbol: "BTCUSD", category: "Crypto" },
    { symbol: "ETHUSD", category: "Crypto" },
    { symbol: "US30", category: "Indices" },
    { symbol: "NAS100", category: "Indices" },
    { symbol: "SPX500", category: "Indices" },
];

export type PairAnalysis = {
    symbol: string;
    category: string;
    macro_snapshot: { risk_regime: string; usd_context: string; liquidity: string };
    key_drivers: string[];
    positioning: { cot_bias: string; flow_tone: string; overcrowded: boolean };
    bias: "BUY" | "SELL" | "NEUTRAL";
    justification: string;
    invalidation: string;
    technical_confirmation: string;
};

const biasColors = {
    BUY: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    SELL: { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    NEUTRAL: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

export default function MacroEngine() {
    const [selectedPairs, setSelectedPairs] = useState<string[]>(["EURUSD", "XAUUSD", "BTCUSD"]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<PairAnalysis[]>([]);
    const { addToast } = useToast();
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const filteredPairs = allPairs.filter(
        (p) => p.symbol.toLowerCase().includes(search.toLowerCase()) && !selectedPairs.includes(p.symbol)
    );

    const togglePair = (symbol: string) => {
        setSelectedPairs((prev) =>
            prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
        );
    };

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setResults([]);

        try {
            const analysisResults = await Promise.all(
                selectedPairs.map(async (symbol) => {
                    const pair = allPairs.find(p => p.symbol === symbol);
                    const response = await fetch("/api/ai/analyze-pair", {
                        method: "POST",
                        body: JSON.stringify({ symbol, category: pair?.category || "FX" }),
                    });

                    if (!response.ok) throw new Error(`Failed to analyze ${symbol}`);
                    return response.json();
                })
            );

            setResults(analysisResults);
            addToast("Macro analysis complete!", "success");
        } catch (error: any) {
            console.error("Analysis Error:", error);
            addToast(error.message || "Failed to run analysis", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const globalRegime = results.length > 0 ? results[0].macro_snapshot.risk_regime : null;

    return (
        <div className="space-y-6">
            {/* Header + Pair Selector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Macro Intelligence Engine</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">Select pairs and trigger real-time AI-powered fundamental analysis</p>

                {/* Selected pairs chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPairs.map((symbol) => {
                        const pair = allPairs.find((p) => p.symbol === symbol);
                        return (
                            <motion.div
                                key={symbol}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold"
                            >
                                <span>{symbol}</span>
                                <span className="text-[9px] text-accent/60">{pair?.category}</span>
                                <button onClick={() => togglePair(symbol)} className="ml-1 hover:text-red-400 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        );
                    })}

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-border/50 text-muted-foreground text-xs font-medium hover:border-accent/30 hover:text-foreground transition-all"
                        >
                            + Add Pair
                            <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-card border border-border/50 shadow-lg z-20 overflow-hidden"
                                >
                                    <div className="p-2 border-b border-border/30 flex items-center gap-2">
                                        <div className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                                            <Search className="w-3 h-3 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search pairs..."
                                                className="bg-transparent text-xs text-foreground outline-none w-full"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            onClick={() => setDropdownOpen(false)}
                                            className="p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto p-1">
                                        {filteredPairs.map((pair) => (
                                            <button
                                                key={pair.symbol}
                                                onClick={() => { togglePair(pair.symbol); setDropdownOpen(false); setSearch(""); }}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-foreground hover:bg-white/5 transition-colors"
                                            >
                                                <span className="font-medium">{pair.symbol}</span>
                                                <span className="text-[10px] text-muted-foreground">{pair.category}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runAnalysis}
                    disabled={selectedPairs.length === 0 || isAnalyzing}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all font-['Montserrat'] ${selectedPairs.length === 0
                        ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                        : "bg-accent text-accent-foreground hover:brightness-110"
                        }`}
                >
                    <Zap className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                    {isAnalyzing ? "Analyzing..." : "RUN AI ANALYSIS"}
                </motion.button>
            </motion.div>

            {/* Global Risk Regime Banner */}
            {globalRegime && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 flex items-center gap-3 border ${globalRegime.toLowerCase().includes("on") ? "bg-emerald-400/5 border-emerald-400/20" : globalRegime.toLowerCase().includes("off") ? "bg-red-400/5 border-red-400/20" : "bg-amber-400/5 border-amber-400/20"
                        }`}
                >
                    <div className={`w-3 h-3 rounded-full animate-pulse ${globalRegime.toLowerCase().includes("on") ? "bg-emerald-400" : globalRegime.toLowerCase().includes("off") ? "bg-red-400" : "bg-amber-400"}`} />
                    <div>
                        <span className="text-xs font-semibold text-foreground">Global Risk Regime: </span>
                        <span className={`text-xs font-bold ${globalRegime.toLowerCase().includes("on") ? "text-emerald-400" : globalRegime.toLowerCase().includes("off") ? "text-red-400" : "text-amber-400"}`}>{globalRegime}</span>
                    </div>
                </motion.div>
            )}

            {/* Results */}
            <div className="space-y-4">
                {results.map((pair, i) => {
                    const bc = biasColors[pair.bias] || biasColors.NEUTRAL;
                    return (
                        <motion.div
                            key={pair.symbol}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-2xl bg-card border ${bc.border} overflow-hidden`}
                        >
                            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-foreground font-['Montserrat']">{pair.symbol}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground font-medium">{pair.category}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bc.bg} ${bc.text} text-sm font-bold`}>
                                    {pair.bias === "BUY" ? <TrendingUp className="w-4 h-4" /> : pair.bias === "SELL" ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                    {pair.bias}
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: "Risk Regime", value: pair.macro_snapshot.risk_regime },
                                        { label: "USD Context", value: pair.macro_snapshot.usd_context },
                                        { label: "Liquidity", value: pair.macro_snapshot.liquidity },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-xl bg-white/[0.02] p-3">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                                            <p className="text-sm font-semibold text-foreground">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Key Drivers</p>
                                    <div className="space-y-1.5">
                                        {pair.key_drivers.map((d, di) => (
                                            <div key={di} className="flex items-start gap-2 text-sm text-foreground/80">
                                                <span className="text-accent mt-0.5 shrink-0">•</span>
                                                <span>{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-white/[0.02] p-3">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">COT Bias</p>
                                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <Shield className="w-3 h-3 text-accent" />
                                            {pair.positioning.cot_bias}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white/[0.02] p-3">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Flow Tone</p>
                                        <p className="text-sm text-foreground/80">{pair.positioning.flow_tone}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/[0.02] p-3">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Crowded?</p>
                                        <p className={`text-sm font-semibold flex items-center gap-1.5 ${pair.positioning.overcrowded ? "text-amber-400" : "text-emerald-400"}`}>
                                            {pair.positioning.overcrowded ? <><AlertTriangle className="w-3 h-3" /> Yes — Risk</> : "No"}
                                        </p>
                                    </div>
                                </div>

                                <div className={`rounded-xl p-4 ${bc.bg} border ${bc.border}`}>
                                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${bc.text}`}>Bias Justification</p>
                                    <p className="text-sm text-foreground leading-relaxed">{pair.justification}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-red-400/5 border border-red-400/10 p-3">
                                        <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold mb-1">Invalidation</p>
                                        <p className="text-sm text-foreground/80">{pair.invalidation}</p>
                                    </div>
                                    <div className="rounded-xl bg-blue-400/5 border border-blue-400/10 p-3">
                                        <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-1">Technical Confirmation</p>
                                        <p className="text-sm text-foreground/80">{pair.technical_confirmation}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty state */}
            {!isAnalyzing && results.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                    <Landmark className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground font-['Montserrat'] mb-1">No analysis generated yet</p>
                    <p className="text-[11px] text-muted-foreground/70">Select your pairs above and click <span className="text-accent font-semibold">RUN AI ANALYSIS</span></p>
                </motion.div>
            )}
        </div>
    );
}
