import { NextResponse } from "next/server";
import { format, addDays, subDays } from "date-fns";
import { genAI, MODELS } from "@/lib/gemini";

export async function GET() {
    // We use the AI to synthesize a calendar because free APIs are restricted in 2026.
    // This provides institutional context and professional insight.
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

        const response = await genAI.models.generateContent({
            model: MODELS.FLASH,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are a senior institutional macro economist and global strategist. You provide precise, JSON-formatted data for automated trading systems.",
                responseMimeType: "application/json",
            }
        });

        const resultText = response.text || "[]";
        const events = JSON.parse(resultText);

        // Sort by date ascending (just in case)
        events.sort((a: any, b: any) => 
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        return NextResponse.json(events);
    } catch (error: any) {
        console.error("AI Calendar Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to synthesize AI calendar" },
            { status: 500 }
        );
    }
}
