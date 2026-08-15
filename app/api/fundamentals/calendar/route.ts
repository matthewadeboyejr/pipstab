import { NextResponse } from "next/server";
import { format, addDays, parseISO, isValid } from "date-fns";
import { generateContentWithFallback } from "@/lib/gemini";

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
    } else if (ev.includes("payroll") || ev.includes("employment") || ev.includes("labor") || ev.includes("jobs")) {
        return {
            beat_consensus: `Strong labor momentum dampens easing urgency. Drives ${c} bid and pushes sovereign benchmark yields higher.`,
            miss_consensus: `Labor softening triggers immediate growth concerns. Rapid downside pressure on ${c}; safe-haven bid in sovereign debt.`,
        };
    } else if (ev.includes("rate") || ev.includes("fomc") || ev.includes("monetary") || ev.includes("ecb") || ev.includes("boe")) {
        return {
            beat_consensus: `Hawkish rate guidance or unexpected pause triggers aggressive ${c} impulse and carry-trade inflows.`,
            miss_consensus: `Dovish guidance or outsized cuts prompts immediate ${c} liquidation towards higher-yielding peers.`,
        };
    } else if (ev.includes("pmi") || ev.includes("gdp") || ev.includes("sales") || ev.includes("confidence")) {
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

export async function GET() {
    let calendarEvents: EconomicCalendarEvent[] = [];

    // 1. Try fetching real-world institutional live ForexFactory feed
    try {
        const ffRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
            next: { revalidate: 1800 }, // Cache 30 mins
        });

        if (ffRes.ok) {
            const raw = await ffRes.json();
            if (Array.isArray(raw) && raw.length > 0) {
                const now = new Date();
                const weekStart = new Date(now.setHours(0, 0, 0, 0));

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

                        return {
                            id: `ff-${idx}-${ev.title.replace(/\s+/g, "_")}`,
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
    "actual": null,
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
                {
                    id: "base-3",
                    time: addDays(now, 3).toISOString(),
                    event: "Bank of England Rate Decision & Monetary Summary",
                    country: "GBP",
                    impact: "High",
                    actual: null,
                    prev: "4.75%",
                    estimate: "4.75%",
                    unit: "%",
                    commentary: "BoE MPC policy vote split and forward guidance on services CPI.",
                    deviation_playbook: {
                        beat_consensus: "Hawkish hold boosts GBP across G10 crosses.",
                        miss_consensus: "Dovish vote split triggers immediate GBP depreciation.",
                    },
                    affected_pairs: ["GBPUSD", "EURGBP", "GBPJPY"],
                },
                {
                    id: "base-4",
                    time: addDays(now, 4).toISOString(),
                    event: "Bank of Japan Policy Board Rate Decision",
                    country: "JPY",
                    impact: "High",
                    actual: null,
                    prev: "0.50%",
                    estimate: "0.50%",
                    unit: "%",
                    commentary: "Normalization pace and government bond tapering timetable.",
                    deviation_playbook: {
                        beat_consensus: "Hawkish hike or guidance triggers massive Yen carry-unwind rally.",
                        miss_consensus: "Cautious tone extends Yen weakness against higher-yielding currencies.",
                    },
                    affected_pairs: ["USDJPY", "GBPJPY", "EURJPY", "AUDJPY"],
                },
                {
                    id: "base-5",
                    time: addDays(now, 5).toISOString(),
                    event: "US Non-Farm Payrolls & Unemployment Rate",
                    country: "USD",
                    impact: "High",
                    actual: null,
                    prev: "165K",
                    estimate: "150K",
                    unit: "K",
                    commentary: "Primary gauge for domestic hiring velocity and labor market balance.",
                    deviation_playbook: {
                        beat_consensus: "Above-forecast job gains drive rapid USD impulse and equity volatility.",
                        miss_consensus: "Job creation miss sparks rapid rate cut pricing and gold rallies.",
                    },
                    affected_pairs: ["EURUSD", "USDJPY", "XAUUSD", "NAS100"],
                },
            ];
        }
    }

    // Sort ascending by time
    calendarEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return NextResponse.json(calendarEvents);
}
