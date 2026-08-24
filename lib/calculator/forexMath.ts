export interface InstrumentConfig {
    symbol: string;
    name: string;
    category: "forex_major" | "forex_cross" | "forex_jpy" | "metals" | "indices" | "crypto";
    base: string;
    quote: string;
    pipSize: number; // 0.0001 for standard, 0.01 for JPY, 0.1 for Gold, 1 for Indices
    contractSize: number; // 100,000 for standard FX, 100 for Gold, 1 for Indices/Crypto
    defaultRate: number;
}

export const INSTRUMENTS: InstrumentConfig[] = [
    // Forex Majors
    { symbol: "EUR/USD", name: "Euro / US Dollar", category: "forex_major", base: "EUR", quote: "USD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.0850 },
    { symbol: "GBP/USD", name: "British Pound / US Dollar", category: "forex_major", base: "GBP", quote: "USD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.2850 },
    { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", category: "forex_jpy", base: "USD", quote: "JPY", pipSize: 0.01, contractSize: 100000, defaultRate: 154.50 },
    { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", category: "forex_major", base: "USD", quote: "CAD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.3650 },
    { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", category: "forex_major", base: "USD", quote: "CHF", pipSize: 0.0001, contractSize: 100000, defaultRate: 0.9020 },
    { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", category: "forex_major", base: "AUD", quote: "USD", pipSize: 0.0001, contractSize: 100000, defaultRate: 0.6650 },
    { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", category: "forex_major", base: "NZD", quote: "USD", pipSize: 0.0001, contractSize: 100000, defaultRate: 0.6120 },

    // Crosses
    { symbol: "EUR/GBP", name: "Euro / British Pound", category: "forex_cross", base: "EUR", quote: "GBP", pipSize: 0.0001, contractSize: 100000, defaultRate: 0.8450 },
    { symbol: "EUR/JPY", name: "Euro / Japanese Yen", category: "forex_jpy", base: "EUR", quote: "JPY", pipSize: 0.01, contractSize: 100000, defaultRate: 167.60 },
    { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", category: "forex_jpy", base: "GBP", quote: "JPY", pipSize: 0.01, contractSize: 100000, defaultRate: 198.50 },
    { symbol: "AUD/JPY", name: "Australian Dollar / Japanese Yen", category: "forex_jpy", base: "AUD", quote: "JPY", pipSize: 0.01, contractSize: 100000, defaultRate: 102.70 },
    { symbol: "CAD/JPY", name: "Canadian Dollar / Japanese Yen", category: "forex_jpy", base: "CAD", quote: "JPY", pipSize: 0.01, contractSize: 100000, defaultRate: 113.20 },
    { symbol: "CHF/JPY", name: "Swiss Franc / Japanese Yen", category: "forex_jpy", base: "CHF", quote: "JPY", pipSize: 0.01, contractSize: 100000, defaultRate: 171.20 },
    { symbol: "EUR/AUD", name: "Euro / Australian Dollar", category: "forex_cross", base: "EUR", quote: "AUD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.6320 },
    { symbol: "EUR/CAD", name: "Euro / Canadian Dollar", category: "forex_cross", base: "EUR", quote: "CAD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.4810 },
    { symbol: "GBP/AUD", name: "British Pound / Australian Dollar", category: "forex_cross", base: "GBP", quote: "AUD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.9320 },
    { symbol: "GBP/CAD", name: "British Pound / Canadian Dollar", category: "forex_cross", base: "GBP", quote: "CAD", pipSize: 0.0001, contractSize: 100000, defaultRate: 1.7540 },

    // Metals & Commodities
    { symbol: "XAU/USD", name: "Gold / US Dollar", category: "metals", base: "XAU", quote: "USD", pipSize: 0.1, contractSize: 100, defaultRate: 2420.00 },
    { symbol: "XAG/USD", name: "Silver / US Dollar", category: "metals", base: "XAG", quote: "USD", pipSize: 0.01, contractSize: 5000, defaultRate: 29.50 },
    { symbol: "USOIL", name: "WTI Crude Oil", category: "metals", base: "USOIL", quote: "USD", pipSize: 0.01, contractSize: 1000, defaultRate: 78.50 },

    // Indices
    { symbol: "US30", name: "Dow Jones Industrial Average", category: "indices", base: "US30", quote: "USD", pipSize: 1.0, contractSize: 1, defaultRate: 39800.00 },
    { symbol: "NAS100", name: "Nasdaq 100 Index", category: "indices", base: "NAS100", quote: "USD", pipSize: 1.0, contractSize: 1, defaultRate: 18900.00 },
    { symbol: "SPX500", name: "S&P 500 Index", category: "indices", base: "SPX500", quote: "USD", pipSize: 0.1, contractSize: 10, defaultRate: 5450.00 },
    { symbol: "GER40", name: "German DAX 40", category: "indices", base: "GER40", quote: "EUR", pipSize: 1.0, contractSize: 1, defaultRate: 18200.00 },

    // Crypto
    { symbol: "BTC/USD", name: "Bitcoin / US Dollar", category: "crypto", base: "BTC", quote: "USD", pipSize: 1.0, contractSize: 1, defaultRate: 64500.00 },
    { symbol: "ETH/USD", name: "Ethereum / US Dollar", category: "crypto", base: "ETH", quote: "USD", pipSize: 0.1, contractSize: 1, defaultRate: 3450.00 },
];

export const ACCOUNT_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "NZD"];

// Default rates relative to USD (USD = 1.0)
export const USD_EXCHANGE_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 1.0850,
    GBP: 1.2850,
    JPY: 0.00647, // 1 JPY = ~0.00647 USD (or 154.5 JPY/USD)
    CAD: 0.7326,  // 1 CAD = ~0.7326 USD (or 1.365 CAD/USD)
    AUD: 0.6650,
    NZD: 0.6120,
    CHF: 1.1086,  // 1 CHF = ~1.1086 USD (or 0.902 CHF/USD)
};

/**
 * Calculates the pip value per standard lot (100k or contract size) in the selected Account Currency.
 */
export function calculatePipValuePerLot(
    instrument: InstrumentConfig,
    accountCurrency: string,
    marketRate: number = instrument.defaultRate
): number {
    const { quote, pipSize, contractSize } = instrument;

    // Value of 1 pip in quote currency = contractSize * pipSize
    const pipValueInQuote = contractSize * pipSize;

    // If Quote currency matches Account Currency:
    if (quote === accountCurrency) {
        return pipValueInQuote;
    }

    // If Account Currency is USD:
    if (accountCurrency === "USD") {
        if (quote === "USD") return pipValueInQuote;
        const quoteRateInUsd = USD_EXCHANGE_RATES[quote] || 1.0;
        return pipValueInQuote * quoteRateInUsd;
    }

    // Convert from Quote Currency -> USD -> Account Currency
    const quoteInUsd = quote === "USD" ? pipValueInQuote : pipValueInQuote * (USD_EXCHANGE_RATES[quote] || 1.0);
    const usdInAccount = accountCurrency === "USD" ? 1.0 : 1.0 / (USD_EXCHANGE_RATES[accountCurrency] || 1.0);

    return quoteInUsd * usdInAccount;
}

export interface PositionSizeResult {
    cashRisk: number;
    standardLots: number;
    miniLots: number;
    microLots: number;
    units: number;
    pipValue: number;
    stopLossPips: number;
    pipValuePerLot: number;
}

export function calculatePositionSize(
    accountBalance: number,
    riskInput: number,
    isRiskPercentage: boolean,
    stopLossPips: number,
    instrument: InstrumentConfig,
    accountCurrency: string,
    marketRate?: number
): PositionSizeResult {
    if (accountBalance <= 0 || stopLossPips <= 0) {
        return {
            cashRisk: 0,
            standardLots: 0,
            miniLots: 0,
            microLots: 0,
            units: 0,
            pipValue: 0,
            stopLossPips: Math.max(0, stopLossPips),
            pipValuePerLot: 0,
        };
    }

    const cashRisk = isRiskPercentage ? (accountBalance * riskInput) / 100 : riskInput;
    const pipValuePerLot = calculatePipValuePerLot(instrument, accountCurrency, marketRate);

    if (pipValuePerLot <= 0) {
        return {
            cashRisk,
            standardLots: 0,
            miniLots: 0,
            microLots: 0,
            units: 0,
            pipValue: 0,
            stopLossPips,
            pipValuePerLot: 0,
        };
    }

    const standardLots = cashRisk / (stopLossPips * pipValuePerLot);
    const miniLots = standardLots * 10;
    const microLots = standardLots * 100;
    const units = standardLots * instrument.contractSize;
    const pipValue = standardLots * pipValuePerLot;

    return {
        cashRisk: Number(cashRisk.toFixed(2)),
        standardLots: Number(standardLots.toFixed(2)),
        miniLots: Number(miniLots.toFixed(2)),
        microLots: Number(microLots.toFixed(2)),
        units: Math.round(units),
        pipValue: Number(pipValue.toFixed(2)),
        stopLossPips,
        pipValuePerLot: Number(pipValuePerLot.toFixed(2)),
    };
}

export interface MarginResult {
    requiredMargin: number;
    notionalValue: number;
    effectiveLeverage: number;
}

export function calculateMargin(
    lots: number,
    leverage: number,
    instrument: InstrumentConfig,
    accountCurrency: string,
    marketRate: number = instrument.defaultRate
): MarginResult {
    const units = lots * instrument.contractSize;
    // Value of base currency in USD:
    const baseInUsd = USD_EXCHANGE_RATES[instrument.base] || marketRate;
    const notionalInUsd = units * (instrument.base === "USD" ? 1.0 : baseInUsd);
    
    const notionalInAccount = accountCurrency === "USD" 
        ? notionalInUsd 
        : notionalInUsd / (USD_EXCHANGE_RATES[accountCurrency] || 1.0);

    const requiredMargin = leverage > 0 ? notionalInAccount / leverage : 0;

    return {
        requiredMargin: Number(requiredMargin.toFixed(2)),
        notionalValue: Number(notionalInAccount.toFixed(2)),
        effectiveLeverage: leverage,
    };
}
