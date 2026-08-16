/**
 * Global 24-Hour Trading Session Radar Engine
 * Calculates real-time active market sessions, overlap liquidity windows,
 * expected volatility multipliers, and Average Daily Range (ADR) targets.
 */

export interface MarketSession {
    id: "sydney" | "tokyo" | "london" | "newyork";
    name: string;
    city: string;
    flag: string;
    openUtc: number; // UTC hour (0-23)
    closeUtc: number; // UTC hour (0-23)
    status: "Live" | "Upcoming" | "Closed";
    volatility: "Peak Liquidity" | "High Volatility" | "Moderate" | "Quiet/Ranging";
    volatilityScore: number; // 0 - 100
    expectedAdr: number; // Expected pips move
    primaryPairs: string[];
    nextEventText: string;
}

export interface SessionOverlap {
    name: string;
    isActive: boolean;
    hoursUtc: string;
    description: string;
    volatilityImpact: "Extreme / Peak Volume" | "Moderate Transition";
}

export function calculateSessionRadar(currentTime: Date = new Date()): {
    sessions: MarketSession[];
    overlaps: SessionOverlap[];
    activeOverlap: SessionOverlap | null;
    utcTimeString: string;
} {
    const utcHours = currentTime.getUTCHours();
    const utcMinutes = currentTime.getUTCMinutes();
    const currentDecimalTime = utcHours + utcMinutes / 60;

    // Helper to check if current time is within open/close range (handling day wraps)
    const isSessionActive = (open: number, close: number) => {
        if (open < close) {
            return currentDecimalTime >= open && currentDecimalTime < close;
        } else {
            // Wraps over midnight (e.g. Sydney 22:00 to 07:00)
            return currentDecimalTime >= open || currentDecimalTime < close;
        }
    };

    const isSydney = isSessionActive(22, 7);
    const isTokyo = isSessionActive(0, 9);
    const isLondon = isSessionActive(8, 17);
    const isNewYork = isSessionActive(13, 22);

    // Overlaps
    const isLondonNyOverlap = currentDecimalTime >= 13 && currentDecimalTime < 17;
    const isAsiaLondonOverlap = currentDecimalTime >= 8 && currentDecimalTime < 9;

    const sessions: MarketSession[] = [
        {
            id: "london",
            name: "London Session",
            city: "London",
            flag: "🇬🇧",
            openUtc: 8,
            closeUtc: 17,
            status: isLondon ? "Live" : currentDecimalTime < 8 ? "Upcoming" : "Closed",
            volatility: isLondonNyOverlap ? "Peak Liquidity" : isLondon ? "High Volatility" : "Quiet/Ranging",
            volatilityScore: isLondonNyOverlap ? 98 : isLondon ? 85 : 20,
            expectedAdr: 95,
            primaryPairs: ["EUR/USD", "GBP/USD", "EUR/GBP", "GBP/JPY"],
            nextEventText: isLondon ? "Closes at 17:00 UTC" : "Opens at 08:00 UTC",
        },
        {
            id: "newyork",
            name: "New York Session",
            city: "New York",
            flag: "🇺🇸",
            openUtc: 13,
            closeUtc: 22,
            status: isNewYork ? "Live" : currentDecimalTime < 13 ? "Upcoming" : "Closed",
            volatility: isLondonNyOverlap ? "Peak Liquidity" : isNewYork ? "High Volatility" : "Quiet/Ranging",
            volatilityScore: isLondonNyOverlap ? 98 : isNewYork ? 80 : 15,
            expectedAdr: 110,
            primaryPairs: ["USD/JPY", "EUR/USD", "USD/CAD", "XAU/USD", "US30"],
            nextEventText: isNewYork ? "Closes at 22:00 UTC" : "Opens at 13:00 UTC",
        },
        {
            id: "tokyo",
            name: "Tokyo Session",
            city: "Tokyo",
            flag: "🇯🇵",
            openUtc: 0,
            closeUtc: 9,
            status: isTokyo ? "Live" : currentDecimalTime < 0 ? "Upcoming" : "Closed",
            volatility: isAsiaLondonOverlap ? "Moderate" : isTokyo ? "Moderate" : "Quiet/Ranging",
            volatilityScore: isTokyo ? 55 : 10,
            expectedAdr: 65,
            primaryPairs: ["USD/JPY", "AUD/JPY", "EUR/JPY", "NZD/JPY"],
            nextEventText: isTokyo ? "Closes at 09:00 UTC" : "Opens at 00:00 UTC",
        },
        {
            id: "sydney",
            name: "Sydney Session",
            city: "Sydney",
            flag: "🇦🇺",
            openUtc: 22,
            closeUtc: 7,
            status: isSydney ? "Live" : "Closed",
            volatility: "Quiet/Ranging",
            volatilityScore: isSydney ? 40 : 10,
            expectedAdr: 50,
            primaryPairs: ["AUD/USD", "NZD/USD", "AUD/NZD"],
            nextEventText: isSydney ? "Closes at 07:00 UTC" : "Opens at 22:00 UTC",
        },
    ];

    const overlaps: SessionOverlap[] = [
        {
            name: "London / New York Overlap",
            isActive: isLondonNyOverlap,
            hoursUtc: "13:00 - 17:00 UTC",
            description: "Accounts for over 55% of total daily global forex turnover. Maximum volatility & tightest spreads.",
            volatilityImpact: "Extreme / Peak Volume",
        },
        {
            name: "Tokyo / London Crossover",
            isActive: isAsiaLondonOverlap,
            hoursUtc: "08:00 - 09:00 UTC",
            description: "Transition window where European institutional order flow enters while Asian desks square positions.",
            volatilityImpact: "Moderate Transition",
        },
    ];

    const activeOverlap = overlaps.find((o) => o.isActive) || null;
    const utcTimeString = `${String(utcHours).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")} UTC`;

    return {
        sessions,
        overlaps,
        activeOverlap,
        utcTimeString,
    };
}
