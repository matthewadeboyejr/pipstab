import { NextResponse } from "next/server";
import { isValid } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface EconomicCalendarEvent {
    id: string;
    time: string; // ISO-8601 UTC string
    event: string;
    country: string; // USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD, GLOBAL
    impact: "High" | "Medium" | "Low";
    actual: string | null;
    prev: string;
    estimate: string;
    unit: string;
    commentary: string;
    deviation_playbook: {
        beat_consensus: string;
        miss_consensus: string;
    };
    affected_pairs: string[];
}

function getAffectedPairs(country: string): string[] {
    switch (country.toUpperCase()) {
        case "USD":
            return ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "US30", "NAS100"];
        case "EUR":
            return ["EURUSD", "EURGBP", "EURJPY", "EURCHF"];
        case "GBP":
            return ["GBPUSD", "EURGBP", "GBPJPY", "GBPAUD"];
        case "JPY":
            return ["USDJPY", "GBPJPY", "EURJPY", "AUDJPY"];
        case "AUD":
            return ["AUDUSD", "AUDJPY", "EURAUD", "GBPAUD"];
        case "CAD":
            return ["USDCAD", "CADJPY", "EURCAD"];
        case "CHF":
            return ["USDCHF", "EURCHF", "GBPCHF"];
        case "NZD":
            return ["NZDUSD", "NZDJPY", "EURNZD", "AUDNZD"];
        default:
            return ["Global FX", "XAUUSD"];
    }
}

function generateDefaultPlaybook(event: string, country: string) {
    const c = country.toUpperCase();
    const ev = event.toLowerCase();

    if (ev.includes("cpi") || ev.includes("inflation") || ev.includes("pce")) {
        return {
            beat_consensus: `Higher inflation prints signal hawkish central bank rate retention. Fosters immediate ${c} strength and yield spikes; bearish for Gold and Equities.`,
            miss_consensus: `Cooling inflation accelerates rate cut expectations. Triggers ${c} softening and strong relief bids in precious metals and high-beta equities.`,
        };
    } else if (
        ev.includes("payroll") ||
        ev.includes("employment") ||
        ev.includes("labor") ||
        ev.includes("jobs") ||
        ev.includes("claims") ||
        ev.includes("unemployment")
    ) {
        return {
            beat_consensus: `Strong labor momentum dampens easing urgency. Drives ${c} bid and pushes sovereign benchmark yields higher.`,
            miss_consensus: `Labor softening triggers immediate growth concerns. Rapid downside pressure on ${c}; safe-haven bid in sovereign debt.`,
        };
    } else if (
        ev.includes("rate") ||
        ev.includes("fomc") ||
        ev.includes("monetary") ||
        ev.includes("ecb") ||
        ev.includes("boe") ||
        ev.includes("rba") ||
        ev.includes("boj")
    ) {
        return {
            beat_consensus: `Hawkish rate guidance or unexpected pause triggers aggressive ${c} impulse and carry-trade inflows.`,
            miss_consensus: `Dovish guidance or outsized cuts prompts immediate ${c} liquidation towards higher-yielding peers.`,
        };
    } else if (
        ev.includes("pmi") ||
        ev.includes("gdp") ||
        ev.includes("sales") ||
        ev.includes("confidence") ||
        ev.includes("manufacturing") ||
        ev.includes("services")
    ) {
        return {
            beat_consensus: `Solid macroeconomic expansion signals economic resilience, supporting ${c} cross-asset momentum.`,
            miss_consensus: `Contractionary print underscores stagnation risks, limiting ${c} appreciation.`,
        };
    }

    return {
        beat_consensus: `Data beat exceeds market consensus, creating tactical buying momentum for ${c}.`,
        miss_consensus: `Data disappointment misses estimates, prompting defensive positioning against ${c}.`,
    };
}

// In-memory persistent cache for high-availability
interface CalendarCache {
    events: EconomicCalendarEvent[];
    timestamp: number;
}

let memoryCache: CalendarCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    const now = Date.now();

    // Check memory cache first
    if (memoryCache && (now - memoryCache.timestamp) < CACHE_TTL_MS && memoryCache.events.length > 0) {
        return NextResponse.json(memoryCache.events, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
            },
        });
    }

    let calendarEvents: EconomicCalendarEvent[] = [];

    // 1. Fetch live ForexFactory official feed with browser headers
    try {
        const ffRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://www.forexfactory.com/",
            },
            cache: "no-store",
        });

        if (ffRes.ok) {
            const raw = await ffRes.json();
            if (Array.isArray(raw) && raw.length > 0) {
                calendarEvents = raw
                    .filter((ev: any) => {
                        if (!ev || !ev.date || !ev.title) return false;
                        const d = new Date(ev.date);
                        return isValid(d);
                    })
                    .map((ev: any, idx: number) => {
                        const rawCountry = (ev.country || "USD").toUpperCase();
                        const country = rawCountry === "ALL" ? "GLOBAL" : rawCountry;
                        const rawImpact = (ev.impact || "medium").toLowerCase();
                        const impactFormatted: "High" | "Medium" | "Low" =
                            rawImpact === "high" ? "High" : rawImpact === "low" ? "Low" : "Medium";
                        const playbook = generateDefaultPlaybook(ev.title, country);

                        // Strict ISO-8601 UTC normalization
                        const isoTime = new Date(ev.date).toISOString();
                        const id = `ff-${idx}-${country}-${ev.title.replace(/[^a-zA-Z0-9]/g, "_")}-${isoTime.split("T")[0]}`;

                        return {
                            id,
                            time: isoTime,
                            event: ev.title.trim(),
                            country: country,
                            impact: impactFormatted,
                            actual: ev.actual !== undefined && ev.actual !== "" ? ev.actual : null,
                            prev: ev.previous && ev.previous.trim() !== "" ? ev.previous.trim() : "—",
                            estimate: ev.forecast && ev.forecast.trim() !== "" ? ev.forecast.trim() : "—",
                            unit: "",
                            commentary: `${ev.title} for ${country}. Prior print: ${ev.previous || "N/A"}, Consensus forecast: ${ev.forecast || "N/A"}.`,
                            deviation_playbook: playbook,
                            affected_pairs: getAffectedPairs(country),
                        };
                    });
            }
        }
    } catch (err) {
        console.warn("ForexFactory live calendar direct fetch error:", err);
    }

    // 2. If successfully fetched, update cache
    if (calendarEvents.length > 0) {
        // Sort ascending by time
        calendarEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        memoryCache = {
            events: calendarEvents,
            timestamp: now,
        };

        return NextResponse.json(calendarEvents, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
            },
        });
    }

    // 3. If live fetch failed but we have previous cached data, serve the cached snapshot
    if (memoryCache && memoryCache.events.length > 0) {
        return NextResponse.json(memoryCache.events, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
            },
        });
    }

    // 4. Return empty fallback rather than hallucinating fake events
    return NextResponse.json([], {
        headers: {
            "Cache-Control": "no-store, max-age=0",
        },
    });
}
