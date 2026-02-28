"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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

// ─── Mock Fundamental Data ──────────────────────────────────
type PairAnalysis = {
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

const mockAnalysis: Record<string, PairAnalysis> = {
    EURUSD: {
        symbol: "EURUSD", category: "FX",
        macro_snapshot: { risk_regime: "Risk-On", usd_context: "Weak", liquidity: "Expanding" },
        key_drivers: [
            "ECB holding rates at 2.65%, hawkish tilt vs. Fed easing expectations",
            "EUR-USD 2Y yield spread narrowing (+15bps this month)",
            "Eurozone PMI surprised to upside (52.3 vs 50.8 expected)",
            "FOMC minutes showed growing dovish consensus",
        ],
        positioning: { cot_bias: "Net Long EUR", flow_tone: "Bullish EUR flows from Asian reserve managers", overcrowded: false },
        bias: "BUY",
        justification: "ECB-Fed policy divergence favors EUR strength. Yield spread compression + positive Eurozone data surprises create a bullish fundamental backdrop. USD weakness broad-based.",
        invalidation: "Hot US CPI print above 3.5% or ECB emergency rate cut would invalidate.",
        technical_confirmation: "Watch for break above 1.0900 resistance with volume. BOS on H4 confirms.",
    },
    GBPUSD: {
        symbol: "GBPUSD", category: "FX",
        macro_snapshot: { risk_regime: "Risk-On", usd_context: "Weak", liquidity: "Expanding" },
        key_drivers: [
            "BOE maintaining restrictive stance, rates at 4.5%",
            "UK GDP beat expectations: 0.3% Q4 growth",
            "UK labor market resilient, wage growth at 5.8%",
            "Fed-BOE divergence widening in favor of GBP",
        ],
        positioning: { cot_bias: "Net Long GBP", flow_tone: "Moderate institutional buying", overcrowded: false },
        bias: "BUY",
        justification: "BOE's higher-for-longer stance vs Fed's dovish pivot creates persistent yield advantage. UK data resilience supports. USD weakness provides tailwind.",
        invalidation: "BOE surprise cut or UK recession signal would reverse bias.",
        technical_confirmation: "1.2700 key resistance level. Look for daily close above for confirmation.",
    },
    USDJPY: {
        symbol: "USDJPY", category: "FX",
        macro_snapshot: { risk_regime: "Risk-On", usd_context: "Weak", liquidity: "Expanding" },
        key_drivers: [
            "BOJ signaling rate normalization, potential exit from NIRP",
            "US-Japan 10Y yield spread compressing",
            "Japanese inflation proving sticky at 2.8%",
            "MOF intervention risk elevated above 152.00",
        ],
        positioning: { cot_bias: "Net Short JPY (unwinding)", flow_tone: "JPY repatriation flows increasing", overcrowded: true },
        bias: "SELL",
        justification: "BOJ policy normalization + Fed easing = structural USD/JPY bearish shift. Extreme positioning unwinding adds downward pressure. Intervention risk caps upside.",
        invalidation: "BOJ delays normalization or US yields spike above 5% on 10Y.",
        technical_confirmation: "Break below 149.50 support triggers acceleration. Watch for BOS on daily.",
    },
    XAUUSD: {
        symbol: "XAUUSD", category: "Metals",
        macro_snapshot: { risk_regime: "Risk-On", usd_context: "Weak", liquidity: "Expanding" },
        key_drivers: [
            "US real yields declining (-0.5% on 10Y TIPS)",
            "Central bank gold buying remains elevated (China, India, Turkey)",
            "Geopolitical tensions: Middle East escalation + US election uncertainty",
            "Inflation expectations rising, breakevens widening",
        ],
        positioning: { cot_bias: "Net Long", flow_tone: "Strong institutional and central bank accumulation", overcrowded: false },
        bias: "BUY",
        justification: "Falling real yields + USD weakness + central bank buying = triple bullish catalyst. Geopolitical hedge demand provides floor. No signs of overcrowded positioning yet.",
        invalidation: "Sharp USD rally on surprise hawkish Fed pivot. Real yields turning positive.",
        technical_confirmation: "All-time highs above $2,685. Breakout confirmation needs daily close above with momentum.",
    },
    BTCUSD: {
        symbol: "BTCUSD", category: "Crypto",
        macro_snapshot: { risk_regime: "Risk-On", usd_context: "Weak", liquidity: "Expanding" },
        key_drivers: [
            "Spot Bitcoin ETF net inflows: +$1.2B this week (BlackRock leading)",
            "Global liquidity cycle turning expansionary (M2 growing)",
            "No adverse regulatory developments post-ETF approval",
            "Correlation to NAS100 remains elevated (0.72)",
        ],
        positioning: { cot_bias: "Net Long", flow_tone: "Institutional accumulation via ETFs", overcrowded: false },
        bias: "BUY",
        justification: "ETF-driven demand creates persistent bid. Expanding global liquidity cycle historically bullish for BTC. Risk-on environment supports. No regulatory headwinds.",
        invalidation: "Major ETF outflows sustained over 5 days. SEC enforcement action. Risk-off event.",
        technical_confirmation: "Watch for reclaim of $70K psychological level. Volume confirmation essential.",
    },
    NAS100: {
        symbol: "NAS100", category: "Indices",
        macro_snapshot: { risk_regime: "Risk-On", usd_context: "Weak", liquidity: "Expanding" },
        key_drivers: [
            "AI capex cycle driving mega-cap earnings beats",
            "Fed easing expectations supporting growth multiples",
            "Bond yields stabilizing, reducing equity discount rate pressure",
            "Liquidity conditions improving, QT tapering expected",
        ],
        positioning: { cot_bias: "Net Long", flow_tone: "Strong systematic and discretionary buying", overcrowded: true },
        bias: "BUY",
        justification: "Earnings momentum + easing Fed cycle = bullish growth equity environment. AI structural theme provides fundamental floor. Caution on overcrowded positioning.",
        invalidation: "10Y yield above 5%. Mega-cap earnings miss. Sudden liquidity tightening.",
        technical_confirmation: "Watch for pullback to 20-day EMA as buy zone. New ATH breakout with breadth confirmation.",
    },
};

const biasColors = {
    BUY: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    SELL: { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    NEUTRAL: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

export default function FundamentalsPage() {
    const [selectedPairs, setSelectedPairs] = useState<string[]>(["EURUSD", "XAUUSD", "BTCUSD"]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<PairAnalysis[]>([]);

    const filteredPairs = allPairs.filter(
        (p) => p.symbol.toLowerCase().includes(search.toLowerCase()) && !selectedPairs.includes(p.symbol)
    );

    const togglePair = (symbol: string) => {
        setSelectedPairs((prev) =>
            prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
        );
    };

    const runAnalysis = () => {
        setIsAnalyzing(true);
        // Simulate AI processing delay
        setTimeout(() => {
            setResults(selectedPairs.map((s) => mockAnalysis[s]).filter(Boolean));
            setIsAnalyzing(false);
        }, 1500);
    };

    const globalRegime = results.length > 0 ? results[0].macro_snapshot.risk_regime : null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header + Pair Selector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-1">
                    <Landmark className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground font-['Montserrat']">Macro Intelligence Engine</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">Select pairs and trigger real-time institutional-grade fundamental analysis</p>

                {/* Selected pairs chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPairs.map((symbol) => {
                        const pair = allPairs.find((p) => p.symbol === symbol);
                        return (
                            <motion.div
                                key={symbol}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
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

                    {/* Add pair dropdown */}
                    <div className="relative">
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
                                    <div className="p-2 border-b border-border/30">
                                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                                            <Search className="w-3 h-3 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search pairs..."
                                                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto p-1">
                                        {filteredPairs.length === 0 ? (
                                            <p className="text-[11px] text-muted-foreground text-center py-3">No pairs found</p>
                                        ) : (
                                            filteredPairs.map((pair) => (
                                                <button
                                                    key={pair.symbol}
                                                    onClick={() => { togglePair(pair.symbol); setSearch(""); }}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-foreground hover:bg-white/5 transition-colors"
                                                >
                                                    <span className="font-medium">{pair.symbol}</span>
                                                    <span className="text-[10px] text-muted-foreground">{pair.category}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Trigger button */}
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
                    {isAnalyzing ? "Analyzing..." : "FUNDAMENTAL"}
                </motion.button>
            </motion.div>

            {/* Global Risk Regime Banner */}
            {globalRegime && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 flex items-center gap-3 border ${globalRegime === "Risk-On" ? "bg-emerald-400/5 border-emerald-400/20" : globalRegime === "Risk-Off" ? "bg-red-400/5 border-red-400/20" : "bg-amber-400/5 border-amber-400/20"
                        }`}
                >
                    <div className={`w-3 h-3 rounded-full animate-pulse ${globalRegime === "Risk-On" ? "bg-emerald-400" : globalRegime === "Risk-Off" ? "bg-red-400" : "bg-amber-400"}`} />
                    <div>
                        <span className="text-xs font-semibold text-foreground">Global Risk Regime: </span>
                        <span className={`text-xs font-bold ${globalRegime === "Risk-On" ? "text-emerald-400" : globalRegime === "Risk-Off" ? "text-red-400" : "text-amber-400"}`}>{globalRegime}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })} UTC
                    </span>
                </motion.div>
            )}

            {/* Loading */}
            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                        <p className="text-sm text-muted-foreground font-['Montserrat']">Fetching macro intelligence for {selectedPairs.length} pair{selectedPairs.length > 1 ? "s" : ""}...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {!isAnalyzing && results.length > 0 && (
                <div className="space-y-4">
                    {results.map((pair, i) => {
                        const bc = biasColors[pair.bias];
                        return (
                            <motion.div
                                key={pair.symbol}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`rounded-2xl bg-card border ${bc.border} overflow-hidden`}
                            >
                                {/* Pair Header */}
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
                                    {/* Macro Snapshot */}
                                    <div className="grid grid-cols-3 gap-3">
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

                                    {/* Key Drivers */}
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

                                    {/* Positioning */}
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

                                    {/* Justification */}
                                    <div className={`rounded-xl p-4 ${bc.bg} border ${bc.border}`}>
                                        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${bc.text}`}>Bias Justification</p>
                                        <p className="text-sm text-foreground leading-relaxed">{pair.justification}</p>
                                    </div>

                                    {/* Invalidation + Technical */}
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
            )}

            {/* Empty state */}
            {!isAnalyzing && results.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                    <Landmark className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground font-['Montserrat'] mb-1">No analysis generated yet</p>
                    <p className="text-[11px] text-muted-foreground/70">Select your pairs above and click <span className="text-accent font-semibold">FUNDAMENTAL</span> to generate institutional-grade analysis</p>
                </motion.div>
            )}
        </motion.div>
    );
}
