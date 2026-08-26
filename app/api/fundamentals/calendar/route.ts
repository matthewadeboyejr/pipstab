import { NextResponse } from "next/server";
import { format, addDays, parseISO, isValid } from "date-fns";
import { generateContentWithFallback } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface EconomicCalendarEvent {
    id: string;
    time: string; // ISO or YYYY-MM-DD HH:mm
    event: string;
    country: string; // USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD
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
            return ["Global FX"];
    }
}

function generateDefaultPlaybook(event: string, country: string) {
    const c = country.toUpperCase();
    const ev = event.toLowerCase();

    if (ev.includes("cpi") || ev.includes("inflation") || ev.includes("pce")) {
        return {
            beat_consensus: `Higher inflation prints signal hawkish rate retention. Fosters immediate ${c} strength and yield spikes; bearish for gold and equities.`,
            miss_consensus: `Cooling inflation accelerates rate cut expectations. Triggers ${c} softening and strong relief bids in precious metals and high-beta equities.`,
        };
    } else if (ev.includes("payroll") || ev.includes("employment") || ev.includes("labor") || ev.includes("jobs") || ev.includes("claims")) {
        return {
            beat_consensus: `Strong labor momentum dampens easing urgency. Drives ${c} bid and pushes sovereign benchmark yields higher.`,
            miss_consensus: `Labor softening triggers immediate growth concerns. Rapid downside pressure on ${c}; safe-haven bid in sovereign debt.`,
        };
    } else if (ev.includes("rate") || ev.includes("fomc") || ev.includes("monetary") || ev.includes("ecb") || ev.includes("boe")) {
        return {
            beat_consensus: `Hawkish rate guidance or unexpected pause triggers aggressive ${c} impulse and carry-trade inflows.`,
            miss_consensus: `Dovish guidance or outsized cuts prompts immediate ${c} liquidation towards higher-yielding peers.`,
        };
    } else if (ev.includes("pmi") || ev.includes("gdp") || ev.includes("sales") || ev.includes("confidence") || ev.includes("manufacturing")) {
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

// In-memory cache for resolved actuals to avoid duplicate AI requests
const actualsCache = new Map<string, { actual: string; resolvedAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function resolvePastEventsActuals(events: EconomicCalendarEvent[]) {
    const now = new Date();
    // Filter events that have passed their release time within the last 48 hours and have no actual
    const pastEvents = events.filter((ev) => {
        const evDate = new Date(ev.time);
        const diffHours = (now.getTime() - evDate.getTime()) / (1000 * 60 * 60);
        return evDate <= now && diffHours <= 48 && !ev.actual;
    });

    if (pastEvents.length === 0) return;

    // Check in-memory cache first
    const unCachedEvents: EconomicCalendarEvent[] = [];
    pastEvents.forEach((ev) => {
        const cached = actualsCache.get(ev.id);
        if (cached && (now.getTime() - cached.resolvedAt) < CACHE_TTL_MS) {
            ev.actual = cached.actual;
        } else {
            unCachedEvents.push(ev);
        }
    });

    if (unCachedEvents.length === 0) return;

    // Resolve up to 30 passed events with Gemini
    const targetEvents = unCachedEvents.slice(0, 30);
    const eventSummaries = targetEvents.map(e => ({
        id: e.id,
        event: e.event,
        country: e.country,
        time: e.time,
        forecast: e.estimate,
        previous: e.prev
    }));

    try {
        const prompt = `You are an institutional economic release data feed with live web search capabilities.
Search the live macroeconomic releases for today/this week across ForexFactory, Bloomberg, Reuters, and official statistical agencies (e.g. ABS for Australia, BEA/BLS for US).
Find the EXACT official released 'actual' values for the following events that have already been released:

Events to resolve:
${JSON.stringify(eventSummaries, null, 2)}

Return a JSON array containing the exact official actual number for each event:
[
  {
    "id": string,
    "actual": string // e.g. "1.0%", "3.5%", "0.5%", "0.2%", "1.5%"
  }
]
Return ONLY the JSON array (inside \`\`\`json markdown block or raw text).`;

        const res = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are an institutional live economic release synchronizer. Use Google Search to look up the exact live release numbers from official sources and ForexFactory.",
                tools: [{ googleSearch: {} }],
            }
        });

        if (res && res.text) {
            let jsonText = res.text.trim();
            const match = jsonText.match(/\[[\s\S]*\]/);
            if (match) {
                jsonText = match[0];
            }
            const resolvedList = JSON.parse(jsonText);
            if (Array.isArray(resolvedList)) {
                resolvedList.forEach((r: { id: string; actual: string }) => {
                    if (r.id && r.actual) {
                        const target = events.find(e => e.id === r.id);
                        if (target) {
                            target.actual = r.actual;
                            actualsCache.set(r.id, { actual: r.actual, resolvedAt: Date.now() });
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.warn("Could not resolve live actuals with Google Search:", err);
    }
}

export async function GET() {
    let calendarEvents: EconomicCalendarEvent[] = [];

    // 1. Try fetching real-world live ForexFactory feed with no-store
    try {
        const ffRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
            cache: "no-store",
        });

        if (ffRes.ok) {
            const raw = await ffRes.json();
            if (Array.isArray(raw) && raw.length > 0) {
                calendarEvents = raw
                    .filter((ev: any) => {
                        const d = new Date(ev.date);
                        return isValid(d);
                    })
                    .map((ev: any, idx: number) => {
                        const country = ev.country || "USD";
                        const impact = (ev.impact || "medium").toLowerCase();
                        const impactFormatted: "High" | "Medium" | "Low" =
                            impact === "high" ? "High" : impact === "low" ? "Low" : "Medium";
                        const playbook = generateDefaultPlaybook(ev.title, country);

                        const id = `ff-${idx}-${country}-${ev.title.replace(/[^a-zA-Z0-9]/g, "_")}`;

                        return {
                            id,
                            time: ev.date,
                            event: ev.title,
                            country: country,
                            impact: impactFormatted,
                            actual: ev.actual !== undefined && ev.actual !== "" ? ev.actual : null,
                            prev: ev.previous || "—",
                            estimate: ev.forecast || "—",
                            unit: "",
                            commentary: `${ev.title} for ${country}. Prior: ${ev.previous || "N/A"}, Consensus: ${ev.forecast || "N/A"}.`,
                            deviation_playbook: playbook,
                            affected_pairs: getAffectedPairs(country),
                        };
                    });
            }
        }
    } catch (e) {
        console.warn("ForexFactory live calendar fetch error, falling back to AI synthesis:", e);
    }

    // 2. If live feed returned empty or failed, use AI synthesis with multi-model failover
    if (calendarEvents.length === 0) {
        try {
            const today = format(new Date(), "EEEE, MMMM do, yyyy");
            const prompt = `Generate a high-fidelity institutional economic calendar for the week starting from ${today}.
Return a JSON array of 15 major global economic events (US, EU, UK, JPY, AUD, CAD, CHF).
Strict JSON structure:
[
  {
    "id": string,
    "time": "YYYY-MM-DDTHH:mm:ssZ",
    "event": string,
    "country": "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF",
    "impact": "High" | "Medium" | "Low",
    "actual": string | null,
    "prev": string,
    "estimate": string,
    "unit": string,
    "commentary": string,
    "deviation_playbook": {
      "beat_consensus": string,
      "miss_consensus": string
    },
    "affected_pairs": string[]
  }
]
Return ONLY raw JSON.`;

            const aiRes = await generateContentWithFallback({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });

            if (aiRes && aiRes.text) {
                calendarEvents = JSON.parse(aiRes.text);
            }
        } catch (e) {
            console.error("AI Calendar synthesis failed, using static institutional baseline:", e);
            const now = new Date();
            calendarEvents = [
                {
                    id: "base-1",
                    time: addDays(now, 1).toISOString(),
                    event: "US Core PCE Price Index MoM",
                    country: "USD",
                    impact: "High",
                    actual: null,
                    prev: "0.2%",
                    estimate: "0.2%",
                    unit: "%",
                    commentary: "The Fed's primary benchmark for inflation trajectory.",
                    deviation_playbook: {
                        beat_consensus: "Surprise upside accelerates USD buying and yields; negative for Gold.",
                        miss_consensus: "Softening PCE confirms rate-cut timeline, sparking broad USD selloff.",
                    },
                    affected_pairs: ["EURUSD", "USDJPY", "XAUUSD", "US30"],
                },
                {
                    id: "base-2",
                    time: addDays(now, 2).toISOString(),
                    event: "Eurozone Flash Manufacturing PMI",
                    country: "EUR",
                    impact: "High",
                    actual: null,
                    prev: "45.8",
                    estimate: "46.2",
                    unit: "Index",
                    commentary: "Leading indicator of European industrial and export momentum.",
                    deviation_playbook: {
                        beat_consensus: "Signals European stabilization, providing relief bids for EUR pairs.",
                        miss_consensus: "Deeper contraction reinforces ECB dovish easing path.",
                    },
                    affected_pairs: ["EURUSD", "EURGBP", "EURJPY"],
                },
            ];
        }
    }

    // 3. Resolve live actuals for all passed events
    await resolvePastEventsActuals(calendarEvents);

    // Sort ascending by time
    calendarEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return NextResponse.json(calendarEvents, {
        headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
    });
}
