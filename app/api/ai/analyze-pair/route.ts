import { NextResponse } from "next/server";
import { genAI, MODELS } from "@/lib/gemini";

export async function POST(req: Request) {
    const { symbol, category } = await req.json();

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    try {
        const prompt = `Analyze the current fundamental outlook for ${symbol} (${category}).
Return a JSON object matching this TypeScript interface:
{
    symbol: string;
    category: string;
    macro_snapshot: { risk_regime: string; usd_context: string; liquidity: string };
    key_drivers: string[];
    positioning: { cot_bias: string; flow_tone: string; overcrowded: boolean };
    bias: "BUY" | "SELL" | "NEUTRAL";
    justification: string;
    invalidation: string;
    technical_confirmation: string;
}

Guidelines:
1. Provide realistic institutional-level macro context.
2. Ensure the justification matches the bias.
3. Key drivers should be specific and relevant.
4. Return ONLY the JSON object, no markdown formatting.`;

        const response = await genAI.models.generateContent({
            model: MODELS.FLASH,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are a senior institutional macro strategist and fundamental analyst. You provide deep, technical insights into global markets based on current trends.",
                responseMimeType: "application/json",
            }
        });

        const resultText = response.text || "";
        if (!resultText) {
            throw new Error("AI returned no analysis data.");
        }
        const analysis = JSON.parse(resultText);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze pair" },
            { status: 500 }
        );
    }
}
