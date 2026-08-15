export interface CentralBankInfo {
    code: string;
    name: string;
    currency: string;
    flag: string;
    rate: number; // e.g. 5.25
    rateDisplay: string; // e.g. "5.25%"
    bias: "Hawkish" | "Neutral" | "Dovish";
    trend: "Hiking" | "Holding" | "Cutting";
    nextMeeting: string;
    balanceSheet: "Quantitative Tightening (QT)" | "Neutral" | "Quantitative Easing (QE)";
    primaryDriver: string;
    lastAction: string;
}

export interface MacroIndicator {
    id: string;
    name: string;
    symbol: string;
    value: string;
    change: string;
    status: "Bullish" | "Bearish" | "Neutral" | "Risk-On" | "Risk-Off";
    description: string;
}

export interface MacroPreset {
    id: string;
    label: string;
    description: string;
    pairs: string[];
}

export const CENTRAL_BANKS: Record<string, CentralBankInfo> = {
    USD: {
        code: "FED",
        name: "Federal Reserve",
        currency: "USD",
        flag: "🇺🇸",
        rate: 5.25,
        rateDisplay: "5.25%",
        bias: "Neutral",
        trend: "Cutting",
        nextMeeting: "Sep 16, 2026",
        balanceSheet: "Quantitative Tightening (QT)",
        primaryDriver: "Core PCE & Non-Farm Payrolls health",
        lastAction: "25 bps cut delivered",
    },
    EUR: {
        code: "ECB",
        name: "European Central Bank",
        currency: "EUR",
        flag: "🇪🇺",
        rate: 3.75,
        rateDisplay: "3.75%",
        bias: "Dovish",
        trend: "Cutting",
        nextMeeting: "Sep 10, 2026",
        balanceSheet: "Quantitative Tightening (QT)",
        primaryDriver: "German industrial slowdown & sluggish Eurozone CPI",
        lastAction: "25 bps rate cut",
    },
    GBP: {
        code: "BOE",
        name: "Bank of England",
        currency: "GBP",
        flag: "🇬🇧",
        rate: 4.75,
        rateDisplay: "4.75%",
        bias: "Neutral",
        trend: "Cutting",
        nextMeeting: "Sep 17, 2026",
        balanceSheet: "Quantitative Tightening (QT)",
        primaryDriver: "Services inflation stickiness vs consumer demand",
        lastAction: "25 bps rate cut",
    },
    JPY: {
        code: "BOJ",
        name: "Bank of Japan",
        currency: "JPY",
        flag: "🇯🇵",
        rate: 0.50,
        rateDisplay: "0.50%",
        bias: "Hawkish",
        trend: "Hiking",
        nextMeeting: "Sep 18, 2026",
        balanceSheet: "Neutral",
        primaryDriver: "Sustained wage growth & normalization away from zero",
        lastAction: "15 bps rate hike",
    },
    AUD: {
        code: "RBA",
        name: "Reserve Bank of Australia",
        currency: "AUD",
        flag: "🇦🇺",
        rate: 4.10,
        rateDisplay: "4.10%",
        bias: "Hawkish",
        trend: "Holding",
        nextMeeting: "Sep 22, 2026",
        balanceSheet: "Neutral",
        primaryDriver: "Tight domestic labor market & persistent service prices",
        lastAction: "Rate paused at 4.10%",
    },
    CAD: {
        code: "BOC",
        name: "Bank of Canada",
        currency: "CAD",
        flag: "🇨🇦",
        rate: 4.25,
        rateDisplay: "4.25%",
        bias: "Dovish",
        trend: "Cutting",
        nextMeeting: "Sep 02, 2026",
        balanceSheet: "Quantitative Tightening (QT)",
        primaryDriver: "Household debt vulnerability & rising unemployment",
        lastAction: "25 bps rate cut",
    },
    CHF: {
        code: "SNB",
        name: "Swiss National Bank",
        currency: "CHF",
        flag: "🇨🇭",
        rate: 1.25,
        rateDisplay: "1.25%",
        bias: "Dovish",
        trend: "Cutting",
        nextMeeting: "Sep 24, 2026",
        balanceSheet: "Neutral",
        primaryDriver: "Franc overvaluation containment & low domestic CPI",
        lastAction: "25 bps rate cut",
    },
    NZD: {
        code: "RBNZ",
        name: "Reserve Bank of New Zealand",
        currency: "NZD",
        flag: "🇳🇿",
        rate: 4.50,
        rateDisplay: "4.50%",
        bias: "Dovish",
        trend: "Cutting",
        nextMeeting: "Oct 07, 2026",
        balanceSheet: "Neutral",
        primaryDriver: "Sharp domestic economic contraction & cooling inflation",
        lastAction: "25 bps rate cut",
    },
};

export const GLOBAL_MACRO_INDICATORS: MacroIndicator[] = [
    {
        id: "dxy",
        name: "US Dollar Index",
        symbol: "DXY",
        value: "103.85",
        change: "-0.32%",
        status: "Neutral",
        description: "Consolidating near 200-day EMA amid shifting rate-cut expectations.",
    },
    {
        id: "us10y",
        name: "US 10Y Benchmark Yield",
        symbol: "US10Y",
        value: "4.18%",
        change: "-4 bps",
        status: "Risk-On",
        description: "Yield easing provides tailwinds for high-beta equities & gold.",
    },
    {
        id: "yield_curve",
        name: "US 2Y/10Y Yield Spread",
        symbol: "2Y-10Y",
        value: "+8 bps",
        change: "+2 bps",
        status: "Bullish",
        description: "Curve un-inverting / steepening, signaling normalized monetary trajectory.",
    },
    {
        id: "vix",
        name: "CBOE Volatility Index",
        symbol: "VIX",
        value: "14.20",
        change: "-0.85",
        status: "Risk-On",
        description: "Low implied volatility regime favors trend continuation & carry trades.",
    },
    {
        id: "gold",
        name: "Spot Gold Benchmark",
        symbol: "XAU",
        value: "$2,485",
        change: "+0.65%",
        status: "Bullish",
        description: "Central bank accumulation & real yield compression support structural bids.",
    },
];

export const MACRO_PRESETS: MacroPreset[] = [
    {
        id: "majors",
        label: "Major FX",
        description: "Core G7 currency pairs with highest liquidity",
        pairs: ["EURUSD", "GBPUSD", "USDJPY", "USDCAD", "AUDUSD"],
    },
    {
        id: "safe_havens",
        label: "Safe Havens",
        description: "Defensive assets favored during risk-off or liquidity shocks",
        pairs: ["XAUUSD", "USDJPY", "USDCHF", "XAGUSD"],
    },
    {
        id: "high_carry",
        label: "High Yield & Carry",
        description: "Pairs driven by maximum central bank rate divergence",
        pairs: ["GBPJPY", "AUDJPY", "NZDJPY", "EURJPY"],
    },
    {
        id: "commodities",
        label: "Commodities & Indices",
        description: "Precious metals and institutional benchmark equity indices",
        pairs: ["XAUUSD", "XAGUSD", "SPX500", "NAS100", "US30"],
    },
    {
        id: "crypto",
        label: "Crypto & Digital Assets",
        description: "High-beta macro liquidity & risk-sentiment proxies",
        pairs: ["BTCUSD", "ETHUSD"],
    },
];

/**
 * Calculates rate differential between base and quote currencies in basis points.
 */
export function getRateDifferential(baseCurrency: string, quoteCurrency: string): {
    spreadBps: number;
    spreadDisplay: string;
    favor: string;
    baseRate: number | null;
    quoteRate: number | null;
} {
    const baseCb = CENTRAL_BANKS[baseCurrency];
    const quoteCb = CENTRAL_BANKS[quoteCurrency];

    if (!baseCb || !quoteCb) {
        return {
            spreadBps: 0,
            spreadDisplay: "N/A",
            favor: "N/A",
            baseRate: baseCb ? baseCb.rate : null,
            quoteRate: quoteCb ? quoteCb.rate : null,
        };
    }

    const spread = (baseCb.rate - quoteCb.rate) * 100;
    const spreadBps = Math.round(spread);
    const favor = spreadBps > 0 ? baseCurrency : spreadBps < 0 ? quoteCurrency : "Neutral";
    const spreadDisplay = `${spreadBps > 0 ? "+" : ""}${spreadBps} bps (${favor} Advantage)`;

    return {
        spreadBps,
        spreadDisplay,
        favor,
        baseRate: baseCb.rate,
        quoteRate: quoteCb.rate,
    };
}
