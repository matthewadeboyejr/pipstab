"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator,
    DollarSign,
    Percent,
    Shield,
    Target,
    Scale,
    TrendingUp,
    Copy,
    Check,
    ArrowRight,
    Zap,
    RefreshCw,
    Sliders,
    Layers,
    Info,
    ChevronDown,
} from "lucide-react";
import {
    INSTRUMENTS,
    ACCOUNT_CURRENCIES,
    calculatePositionSize,
    calculatePipValuePerLot,
    calculateMargin,
    InstrumentConfig,
} from "@/lib/calculator/forexMath";
import { useToast } from "@/context/ToastContext";

type CalculatorTab = "position_size" | "pip_value" | "risk_reward" | "margin" | "compound";

export default function ForexCalculatorSuite() {
    const [activeTab, setActiveTab] = useState<CalculatorTab>("position_size");
    const { addToast } = useToast();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Global Settings
    const [accountCurrency, setAccountCurrency] = useState("USD");
    const [selectedSymbol, setSelectedSymbol] = useState("EUR/USD");

    // 1. Position Size State
    const [balance, setBalance] = useState<string>("10000");
    const [riskMode, setRiskMode] = useState<"percent" | "cash">("percent");
    const [riskValue, setRiskValue] = useState<string>("1");
    const [slMode, setSlMode] = useState<"pips" | "price">("pips");
    const [stopLossPipsInput, setStopLossPipsInput] = useState<string>("20");
    const [entryPriceInput, setEntryPriceInput] = useState<string>("1.0850");
    const [slPriceInput, setSlPriceInput] = useState<string>("1.0830");

    // 2. Pip Value State
    const [pipValLots, setPipValLots] = useState<string>("1.0");

    // 3. Risk/Reward State
    const [rrTradeType, setRrTradeType] = useState<"BUY" | "SELL">("BUY");
    const [rrEntry, setRrEntry] = useState<string>("1.08500");
    const [rrStopLoss, setRrStopLoss] = useState<string>("1.08250");
    const [rrTakeProfit, setRrTakeProfit] = useState<string>("1.09250");
    const [rrLots, setRrLots] = useState<string>("1.0");

    // 4. Margin State
    const [marginLots, setMarginLots] = useState<string>("1.0");
    const [leverage, setLeverage] = useState<string>("100");

    // 5. Compounding State
    const [startingBalance, setStartingBalance] = useState<string>("5000");
    const [compoundingMonths, setCompoundingMonths] = useState<string>("12");
    const [monthlyReturnPct, setMonthlyReturnPct] = useState<string>("8");
    const [monthlyContribution, setMonthlyContribution] = useState<string>("0");

    const currentInstrument = useMemo(() => {
        return INSTRUMENTS.find((i) => i.symbol === selectedSymbol) || INSTRUMENTS[0];
    }, [selectedSymbol]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        addToast(`Copied ${text} to clipboard!`, "success");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Calculate Stop Loss Pips (handles both direct pip input & price input)
    const effectiveSlPips = useMemo(() => {
        if (slMode === "pips") {
            return parseFloat(stopLossPipsInput) || 0;
        }
        const entry = parseFloat(entryPriceInput) || 0;
        const sl = parseFloat(slPriceInput) || 0;
        if (entry === 0 || sl === 0 || currentInstrument.pipSize === 0) return 0;
        const diff = Math.abs(entry - sl);
        return Number((diff / currentInstrument.pipSize).toFixed(1));
    }, [slMode, stopLossPipsInput, entryPriceInput, slPriceInput, currentInstrument]);

    // Position Size Output Calculation
    const positionSizeResult = useMemo(() => {
        const bal = parseFloat(balance) || 0;
        const risk = parseFloat(riskValue) || 0;
        return calculatePositionSize(
            bal,
            risk,
            riskMode === "percent",
            effectiveSlPips,
            currentInstrument,
            accountCurrency
        );
    }, [balance, riskValue, riskMode, effectiveSlPips, currentInstrument, accountCurrency]);

    // Pip Value Output Calculation
    const pipValuePerLot = useMemo(() => {
        return calculatePipValuePerLot(currentInstrument, accountCurrency);
    }, [currentInstrument, accountCurrency]);

    const totalPipValueResult = useMemo(() => {
        const lots = parseFloat(pipValLots) || 0;
        return Number((lots * pipValuePerLot).toFixed(2));
    }, [pipValLots, pipValuePerLot]);

    // Risk / Reward Output Calculation
    const rrCalculations = useMemo(() => {
        const entry = parseFloat(rrEntry) || 0;
        const sl = parseFloat(rrStopLoss) || 0;
        const tp = parseFloat(rrTakeProfit) || 0;
        const lots = parseFloat(rrLots) || 0;
        const pipSize = currentInstrument.pipSize || 0.0001;

        if (entry === 0 || sl === 0 || tp === 0) {
            return { slPips: 0, tpPips: 0, rrRatio: 0, riskCash: 0, profitCash: 0, isValid: false };
        }

        const slPips = Number((Math.abs(entry - sl) / pipSize).toFixed(1));
        const tpPips = Number((Math.abs(tp - entry) / pipSize).toFixed(1));
        const rrRatio = slPips > 0 ? Number((tpPips / slPips).toFixed(2)) : 0;

        const riskCash = Number((lots * slPips * pipValuePerLot).toFixed(2));
        const profitCash = Number((lots * tpPips * pipValuePerLot).toFixed(2));

        return { slPips, tpPips, rrRatio, riskCash, profitCash, isValid: true };
    }, [rrEntry, rrStopLoss, rrTakeProfit, rrLots, currentInstrument, pipValuePerLot]);

    // Margin Output Calculation
    const marginResult = useMemo(() => {
        const lots = parseFloat(marginLots) || 0;
        const lev = parseFloat(leverage) || 100;
        return calculateMargin(lots, lev, currentInstrument, accountCurrency);
    }, [marginLots, leverage, currentInstrument, accountCurrency]);

    // Compounding Output Simulation
    const compoundingResults = useMemo(() => {
        let current = parseFloat(startingBalance) || 0;
        const months = parseInt(compoundingMonths) || 12;
        const rate = (parseFloat(monthlyReturnPct) || 0) / 100;
        const deposit = parseFloat(monthlyContribution) || 0;

        const timeline: { month: number; balance: number; profit: number }[] = [];

        for (let m = 1; m <= months; m++) {
            const gain = current * rate;
            current = current + gain + deposit;
            timeline.push({
                month: m,
                balance: Math.round(current),
                profit: Math.round(current - (parseFloat(startingBalance) || 0) - deposit * m),
            });
        }

        const endingBalance = timeline[timeline.length - 1]?.balance || current;
        const totalProfit = endingBalance - (parseFloat(startingBalance) || 0) - deposit * months;
        const totalGainPct = (parseFloat(startingBalance) || 0) > 0 ? Number(((totalProfit / (parseFloat(startingBalance) || 1)) * 100).toFixed(1)) : 0;

        return { timeline, endingBalance, totalProfit, totalGainPct };
    }, [startingBalance, compoundingMonths, monthlyReturnPct, monthlyContribution]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-card border border-border/50 backdrop-blur-xl no-scrollbar">
                {[
                    { id: "position_size", label: "Position / Lot Size", icon: <Calculator className="w-4 h-4" /> },
                    { id: "pip_value", label: "Pip Value", icon: <DollarSign className="w-4 h-4" /> },
                    { id: "risk_reward", label: "Risk : Reward & TP", icon: <Target className="w-4 h-4" /> },
                    { id: "margin", label: "Margin & Leverage", icon: <Scale className="w-4 h-4" /> },
                    { id: "compound", label: "Compound Growth", icon: <TrendingUp className="w-4 h-4" /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as CalculatorTab)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all font-['Montserrat'] whitespace-nowrap ${
                            activeTab === tab.id
                                ? "bg-accent text-accent-foreground font-bold shadow-md shadow-accent/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Global Settings Strip (Currency & Pair Selector) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-border/40 backdrop-blur-md">
                {/* Currency Pair Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground font-mono uppercase flex items-center justify-between">
                        <span>Trading Asset / Currency Pair</span>
                        <span className="text-[10px] text-accent font-normal">1 Pip = {currentInstrument.pipSize}</span>
                    </label>
                    <div className="relative">
                        <select
                            value={selectedSymbol}
                            onChange={(e) => setSelectedSymbol(e.target.value)}
                            className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono appearance-none focus:outline-none focus:border-accent cursor-pointer"
                        >
                            {INSTRUMENTS.map((inst) => (
                                <option key={inst.symbol} value={inst.symbol} className="bg-[#0E131F] text-foreground">
                                    {inst.symbol} — {inst.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Account Currency Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground font-mono uppercase">
                        Account Base Currency
                    </label>
                    <div className="relative">
                        <select
                            value={accountCurrency}
                            onChange={(e) => setAccountCurrency(e.target.value)}
                            className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono appearance-none focus:outline-none focus:border-accent cursor-pointer"
                        >
                            {ACCOUNT_CURRENCIES.map((curr) => (
                                <option key={curr} value={curr} className="bg-[#0E131F] text-foreground">
                                    {curr} ({curr === "USD" ? "Default $" : curr})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* TAB 1: POSITION SIZE CALCULATOR */}
            {activeTab === "position_size" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                    {/* Inputs Column */}
                    <div className="lg:col-span-6 rounded-3xl bg-card border border-border/50 p-6 space-y-5 shadow-lg">
                        <div className="flex items-center justify-between pb-3 border-b border-border/30">
                            <h3 className="text-base font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-accent" />
                                Position Size Parameters
                            </h3>
                            <span className="text-xs font-mono text-accent font-bold">Standard Formula</span>
                        </div>

                        {/* Account Balance */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">
                                Account Balance ({accountCurrency})
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-xs text-muted-foreground font-mono">{accountCurrency}</span>
                                <input
                                    type="number"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    placeholder="10000"
                                    className="w-full bg-secondary/40 border border-border/60 rounded-xl pl-16 pr-4 py-3 text-sm font-bold text-foreground font-mono focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Risk Type & Amount */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground font-mono uppercase">
                                    Risk Exposure
                                </label>
                                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-border/40 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setRiskMode("percent")}
                                        className={`px-2.5 py-0.5 rounded-md transition-all font-mono font-bold ${
                                            riskMode === "percent" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        % Percent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRiskMode("cash")}
                                        className={`px-2.5 py-0.5 rounded-md transition-all font-mono font-bold ${
                                            riskMode === "cash" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        $ Cash Risk
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={riskValue}
                                    onChange={(e) => setRiskValue(e.target.value)}
                                    placeholder={riskMode === "percent" ? "1.0" : "100"}
                                    className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono focus:outline-none focus:border-accent"
                                />
                                <span className="absolute right-4 top-3.5 text-xs text-muted-foreground font-mono">
                                    {riskMode === "percent" ? "% of balance" : accountCurrency}
                                </span>
                            </div>
                        </div>

                        {/* Stop Loss (Pips or Price Mode) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground font-mono uppercase">
                                    Stop Loss Measurement
                                </label>
                                <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-border/40 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setSlMode("pips")}
                                        className={`px-2.5 py-0.5 rounded-md transition-all font-mono font-bold ${
                                            slMode === "pips" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Pips
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSlMode("price")}
                                        className={`px-2.5 py-0.5 rounded-md transition-all font-mono font-bold ${
                                            slMode === "price" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Price Levels
                                    </button>
                                </div>
                            </div>

                            {slMode === "pips" ? (
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={stopLossPipsInput}
                                        onChange={(e) => setStopLossPipsInput(e.target.value)}
                                        placeholder="20"
                                        className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono focus:outline-none focus:border-accent"
                                    />
                                    <span className="absolute right-4 top-3.5 text-xs text-muted-foreground font-mono">Pips</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">Entry Price</span>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={entryPriceInput}
                                            onChange={(e) => setEntryPriceInput(e.target.value)}
                                            placeholder="1.0850"
                                            className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground font-mono focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">Stop Loss Price</span>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={slPriceInput}
                                            onChange={(e) => setSlPriceInput(e.target.value)}
                                            placeholder="1.0830"
                                            className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground font-mono focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Output Results Card */}
                    <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-card via-card to-accent/[0.05] border border-accent/30 p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between pb-3 border-b border-border/30 relative z-10">
                            <div>
                                <h4 className="text-sm font-bold text-foreground font-['Montserrat'] uppercase tracking-wider">
                                    Recommended Position Sizing
                                </h4>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                    Risk: {positionSizeResult.cashRisk} {accountCurrency} ({effectiveSlPips} pips SL)
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-accent/15 border border-accent/30 text-accent">
                                {currentSymbolClean(selectedSymbol)}
                            </span>
                        </div>

                        {/* Highlighted Standard Lot Size Banner */}
                        <div className="p-5 rounded-2xl bg-black/40 border border-accent/30 relative z-10 space-y-2">
                            <span className="text-[11px] uppercase font-bold text-muted-foreground font-mono">
                                Standard Lots (100k Units)
                            </span>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl sm:text-4xl font-extrabold text-accent font-mono tracking-tight">
                                    {positionSizeResult.standardLots} <span className="text-sm font-normal text-muted-foreground font-sans">Lots</span>
                                </span>
                                <button
                                    onClick={() => handleCopy(String(positionSizeResult.standardLots), "lots")}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold font-mono hover:brightness-110 transition-all shadow-md"
                                >
                                    {copiedKey === "lots" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedKey === "lots" ? "Copied!" : "Copy Size"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Breakdown Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Mini Lots (10k)</span>
                                <p className="text-sm font-bold text-foreground font-mono">{positionSizeResult.miniLots}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Micro Lots (1k)</span>
                                <p className="text-sm font-bold text-foreground font-mono">{positionSizeResult.microLots}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Total Units</span>
                                <p className="text-sm font-bold text-foreground font-mono">{positionSizeResult.units.toLocaleString()}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Cash At Risk</span>
                                <p className="text-sm font-bold text-red-400 font-mono">
                                    -${positionSizeResult.cashRisk} {accountCurrency}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Pip Value</span>
                                <p className="text-sm font-bold text-foreground font-mono">
                                    ${positionSizeResult.pipValue}/{accountCurrency}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Stop Distance</span>
                                <p className="text-sm font-bold text-foreground font-mono">{positionSizeResult.stopLossPips} Pips</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB 2: PIP VALUE CALCULATOR */}
            {activeTab === "pip_value" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    <div className="lg:col-span-5 rounded-3xl bg-card border border-border/50 p-6 space-y-5 shadow-lg">
                        <div className="pb-3 border-b border-border/30">
                            <h3 className="text-base font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-accent" />
                                Pip Value Inputs
                            </h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">
                                Trade Size (Lots)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={pipValLots}
                                onChange={(e) => setPipValLots(e.target.value)}
                                placeholder="1.0"
                                className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-card to-accent/[0.05] border border-accent/30 p-6 space-y-6 shadow-xl">
                        <div className="pb-3 border-b border-border/30 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-foreground font-['Montserrat'] uppercase">
                                Pip Value Breakdown
                            </h4>
                            <span className="text-xs font-mono text-accent font-bold">
                                1 Pip on {pipValLots || 1} Lot(s)
                            </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/40 border border-border/40 space-y-1">
                            <span className="text-[11px] uppercase font-bold text-muted-foreground font-mono">
                                Monetary Value Per Pip
                            </span>
                            <p className="text-3xl sm:text-4xl font-extrabold text-accent font-mono">
                                ${totalPipValueResult} <span className="text-sm font-normal text-muted-foreground">{accountCurrency}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[1, 10, 50, 100].map((pips) => (
                                <div key={pips} className="p-3 rounded-xl bg-white/[0.02] border border-border/30 text-center space-y-1">
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{pips} Pips Move</span>
                                    <p className="text-sm font-bold text-emerald-400 font-mono">
                                        +${(totalPipValueResult * pips).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB 3: RISK/REWARD & TP PROFIT TARGETS */}
            {activeTab === "risk_reward" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    <div className="lg:col-span-6 rounded-3xl bg-card border border-border/50 p-6 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between pb-3 border-b border-border/30">
                            <h3 className="text-base font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                <Target className="w-5 h-5 text-accent" />
                                Order Levels
                            </h3>
                            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-border/40 text-xs">
                                <button
                                    onClick={() => setRrTradeType("BUY")}
                                    className={`px-3 py-1 rounded-md font-mono font-bold ${
                                        rrTradeType === "BUY" ? "bg-emerald-500 text-black" : "text-muted-foreground"
                                    }`}
                                >
                                    BUY / LONG
                                </button>
                                <button
                                    onClick={() => setRrTradeType("SELL")}
                                    className={`px-3 py-1 rounded-md font-mono font-bold ${
                                        rrTradeType === "SELL" ? "bg-red-500 text-white" : "text-muted-foreground"
                                    }`}
                                >
                                    SELL / SHORT
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground font-mono uppercase">Entry Price</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={rrEntry}
                                    onChange={(e) => setRrEntry(e.target.value)}
                                    className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground font-mono uppercase">Trade Lots</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rrLots}
                                    onChange={(e) => setRrLots(e.target.value)}
                                    className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-red-400 font-mono uppercase">Stop Loss</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={rrStopLoss}
                                    onChange={(e) => setRrStopLoss(e.target.value)}
                                    className="w-full bg-red-500/5 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs font-bold text-red-400 font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-emerald-400 font-mono uppercase">Take Profit</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={rrTakeProfit}
                                    onChange={(e) => setRrTakeProfit(e.target.value)}
                                    className="w-full bg-emerald-500/5 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-400 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-card to-accent/[0.05] border border-accent/30 p-6 space-y-6 shadow-xl">
                        <div className="pb-3 border-b border-border/30 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-foreground font-['Montserrat'] uppercase">
                                Trade Asymmetry Matrix
                            </h4>
                            <span className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono font-bold text-xs">
                                1 : {rrCalculations.rrRatio} R:R
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-red-400 font-mono">Max Risk (Loss)</span>
                                <p className="text-2xl font-bold text-red-400 font-mono">-${rrCalculations.riskCash}</p>
                                <span className="text-[10px] text-muted-foreground font-mono">{rrCalculations.slPips} Pips Distance</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">Target Profit</span>
                                <p className="text-2xl font-bold text-emerald-400 font-mono">+${rrCalculations.profitCash}</p>
                                <span className="text-[10px] text-muted-foreground font-mono">{rrCalculations.tpPips} Pips Target</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB 4: MARGIN & LEVERAGE CALCULATOR */}
            {activeTab === "margin" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    <div className="lg:col-span-5 rounded-3xl bg-card border border-border/50 p-6 space-y-5 shadow-lg">
                        <div className="pb-3 border-b border-border/30">
                            <h3 className="text-base font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                <Scale className="w-5 h-5 text-accent" />
                                Margin Parameters
                            </h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">Position Lots</label>
                            <input
                                type="number"
                                step="0.1"
                                value={marginLots}
                                onChange={(e) => setMarginLots(e.target.value)}
                                className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">Broker Leverage</label>
                            <select
                                value={leverage}
                                onChange={(e) => setLeverage(e.target.value)}
                                className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground font-mono appearance-none"
                            >
                                {["30", "50", "100", "200", "500", "1000"].map((lev) => (
                                    <option key={lev} value={lev} className="bg-[#0E131F] text-foreground">
                                        1:{lev}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-card to-accent/[0.05] border border-accent/30 p-6 space-y-6 shadow-xl">
                        <div className="pb-3 border-b border-border/30">
                            <h4 className="text-sm font-bold text-foreground font-['Montserrat'] uppercase">
                                Required Margin Exposure
                            </h4>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/40 border border-border/40 space-y-1">
                            <span className="text-[11px] uppercase font-bold text-muted-foreground font-mono">
                                Required Margin (Deposit Needed)
                            </span>
                            <p className="text-3xl sm:text-4xl font-extrabold text-accent font-mono">
                                ${marginResult.requiredMargin} <span className="text-sm font-normal text-muted-foreground">{accountCurrency}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Notional Value</span>
                                <p className="text-sm font-bold text-foreground font-mono">${marginResult.notionalValue.toLocaleString()} {accountCurrency}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border/30 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Leverage Tier</span>
                                <p className="text-sm font-bold text-accent font-mono">1 : {leverage}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB 5: COMPOUNDING SIMULATOR */}
            {activeTab === "compound" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    <div className="lg:col-span-5 rounded-3xl bg-card border border-border/50 p-6 space-y-4 shadow-lg">
                        <div className="pb-3 border-b border-border/30">
                            <h3 className="text-base font-bold text-foreground font-['Montserrat'] flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                Growth Assumptions
                            </h3>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">Starting Capital ($)</label>
                            <input
                                type="number"
                                value={startingBalance}
                                onChange={(e) => setStartingBalance(e.target.value)}
                                className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">Monthly Expected Return (%)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={monthlyReturnPct}
                                onChange={(e) => setMonthlyReturnPct(e.target.value)}
                                className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground font-mono uppercase">Simulation Period (Months)</label>
                            <input
                                type="number"
                                value={compoundingMonths}
                                onChange={(e) => setCompoundingMonths(e.target.value)}
                                className="w-full bg-secondary/40 border border-border/60 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground font-mono"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-card to-accent/[0.05] border border-accent/30 p-6 space-y-5 shadow-xl">
                        <div className="pb-3 border-b border-border/30 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-foreground font-['Montserrat'] uppercase">
                                Projected Compounded Equity
                            </h4>
                            <span className="text-xs font-mono text-emerald-400 font-bold">
                                +{compoundingResults.totalGainPct}% Total ROI
                            </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/40 border border-border/40 space-y-1">
                            <span className="text-[11px] uppercase font-bold text-muted-foreground font-mono">
                                Projected Ending Balance
                            </span>
                            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                                ${compoundingResults.endingBalance.toLocaleString()}{" "}
                                <span className="text-sm font-normal text-muted-foreground font-sans">
                                    (+${compoundingResults.totalProfit.toLocaleString()} profit)
                                </span>
                            </p>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {compoundingResults.timeline.slice(0, 12).map((item) => (
                                <div key={item.month} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/30 text-xs font-mono">
                                    <span className="text-muted-foreground">Month {item.month}</span>
                                    <span className="font-bold text-foreground">${item.balance.toLocaleString()}</span>
                                    <span className="text-emerald-400 font-semibold">+${item.profit.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function currentSymbolClean(s: string) {
    return s.replace("/", "");
}
