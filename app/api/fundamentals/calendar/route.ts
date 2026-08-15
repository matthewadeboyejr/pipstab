import { NextResponse } from "next/server";
import { format, addDays } from "date-fns";
import { generateContentWithFallback } from "@/lib/gemini";

export async function GET() {
    try {
        const today = format(new Date(), "EEEE, MMMM do, yyyy");
        
        const prompt = `Generate a high-fidelity institutional economic calendar for the week starting from ${today}.
Return a JSON array of 15 major global economic events (US, EU, UK, JPY, AUD).

Each event object must match this TypeScript interface:
{
    time: string; // ISO 8601 string or clear "YYYY-MM-DD HH:mm"
    event: string; // Name of the release (e.g., "CPI m/m", "Non-Farm Payrolls")
    country: string; // ISO code (USD, EUR, GBP, JPY, etc.)
    impact: "High" | "Medium" | "Low";
    actual: string | null; // Leave as null for future events
    prev: string; // Realistic previous value
    estimate: string; // Realistic market consensus
    unit: string; // %, K, B, etc.
    commentary: string; // A strict, brutally honest institutional brief on WHY this matters and the risk of a deviation.
}

Guidelines:
1. Focus on HIGH impact events.
2. Be realistic about the current 2026 macro environment (e.g. AI-driven productivity shifts, debt cycles).
3. Ensure the 'commentary' is professional, direct, and slightly cynical—typical of a top-tier macro hedge fund strategist.
4. Return ONLY the JSON array, no markdown.`;

        const result = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are a senior institutional macro economist and global strategist. You provide precise, JSON-formatted data for automated trading systems.",
                responseMimeType: "application/json",
            }
        });

        const resultText = result.text || "[]";
        const events = JSON.parse(resultText);

        // Sort by date ascending
        events.sort((a: any, b: any) => 
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        return NextResponse.json(events);
    } catch (error: any) {
        console.error("AI Calendar Error across fallback models, generating institutional baseline calendar:", error);
        
        const now = new Date();
        const fallbackEvents = [
            {
                time: addDays(now, 1).toISOString(),
                event: "US Core PCE Price Index MoM",
                country: "USD",
                impact: "High",
                actual: null,
                prev: "0.2%",
                estimate: "0.2%",
                unit: "%",
                commentary: "The Fed's favorite inflation gauge. Any print above 0.3% disrupts expected rate cut cadence.",
            },
            {
                time: addDays(now, 2).toISOString(),
                event: "Eurozone Flash Manufacturing PMI",
                country: "EUR",
                impact: "High",
                actual: null,
                prev: "45.8",
                estimate: "46.2",
                unit: "Index",
                commentary: "German industrial weakness continues to anchor Eurozone growth expectations.",
            },
            {
                time: addDays(now, 3).toISOString(),
                event: "Bank of England Monetary Policy Decision",
                country: "GBP",
                impact: "High",
                actual: null,
                prev: "4.75%",
                estimate: "4.75%",
                unit: "%",
                commentary: "Services inflation remains sticky, forcing MPC to maintain a cautious easing trajectory.",
            },
            {
                time: addDays(now, 4).toISOString(),
                event: "Japan National Core CPI YoY",
                country: "JPY",
                impact: "High",
                actual: null,
                prev: "2.5%",
                estimate: "2.4%",
                unit: "%",
                commentary: "Crucial benchmark dictating Bank of Japan's rate normalization timetable.",
            },
            {
                time: addDays(now, 5).toISOString(),
                event: "US Non-Farm Payrolls & Unemployment Rate",
                country: "USD",
                impact: "High",
                actual: null,
                prev: "165K",
                estimate: "150K",
                unit: "K",
                commentary: "Labor market balance is the primary determinant for the magnitude of upcoming Fed rate actions.",
            },
        ];

        return NextResponse.json(fallbackEvents);
    }
}
