import { NextResponse } from "next/server";
import { genAI, MODELS } from "@/lib/gemini";
import { CENTRAL_BANKS, getRateDifferential, GLOBAL_MACRO_INDICATORS } from "@/lib/macro/centralBanks";

export async function POST(req: Request) {
    const { symbol, category } = await req.json();

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    try {
        // Derive base and quote currency for FX pairs
        let baseCurr = "";
        let quoteCurr = "";
        let rateDiffContext = "Not applicable (Commodity/Index/Crypto)";
        
        if (symbol.length === 6 && !["BTCUSD", "ETHUSD", "XAUUSD", "XAGUSD"].includes(symbol)) {
            baseCurr = symbol.substring(0, 3);
            quoteCurr = symbol.substring(3, 6);
            const rateDiff = getRateDifferential(baseCurr, quoteCurr);
            if (rateDiff.baseRate !== null && rateDiff.quoteRate !== null) {
                rateDiffContext = `Base (${baseCurr}): ${rateDiff.baseRate}% vs Quote (${quoteCurr}): ${rateDiff.quoteRate}%. Spread: ${rateDiff.spreadDisplay}`;
            }
        } else if (symbol.endsWith("USD")) {
            baseCurr = symbol.replace("USD", "");
            quoteCurr = "USD";
            const rateDiff = getRateDifferential(baseCurr, quoteCurr);
            if (rateDiff.baseRate !== null) {
                rateDiffContext = `Base (${baseCurr}): ${rateDiff.baseRate}% vs USD: 5.25%. Spread: ${rateDiff.spreadDisplay}`;
            }
        }

        const globalMacroContext = GLOBAL_MACRO_INDICATORS.map(
            ind => `${ind.name} (${ind.symbol}): ${ind.value} (${ind.change}) - Status: ${ind.status}. ${ind.description}`
        ).join("\n");

        const prompt = `Perform a high-conviction, quantitative macroeconomic and fundamental analysis for ${symbol} (Asset Class: ${category || "General"}).

Current Live Global Macro Indicators:
${globalMacroContext}

Central Bank Policy Context:
${rateDiffContext}

Return a valid JSON object strictly matching this TypeScript structure:
{
    "symbol": "${symbol}",
    "category": "${category || "FX"}",
    "macro_score": number, // 0 to 100 confidence score
    "bias": "BUY" | "SELL" | "NEUTRAL",
    "conviction": "High" | "Medium" | "Low",
    "macro_snapshot": {
        "risk_regime": string, // e.g. "Risk-On Liquidity Expansion" or "Defensive Risk-Off"
        "usd_context": string, // e.g. "DXY Pullback supporting non-USD assets"
        "liquidity": string,   // e.g. "Ample global liquidity / easing financial conditions"
        "rate_differential": string // e.g. "-150 bps (Fed rate advantage)"
    },
    "key_drivers": string[], // Exactly 3-4 concise, institutional macro bullet points
    "positioning": {
        "cot_bias": "Net Long (Heavy)" | "Net Long (Moderate)" | "Net Short (Heavy)" | "Net Short (Moderate)" | "Neutral/Balanced",
        "cot_detail": string, // Brief summary of institutional non-commercial positioning & weekly shift
        "flow_tone": string, // Institutional execution flow & options gamma tone
        "overcrowded": boolean, // Whether current positioning is at historical extremes presenting squeeze risk
        "retail_sentiment": string // e.g. "68% Short (Contrarian Long Bias)"
    },
    "central_bank_divergence": {
        "base_cb": string, // e.g. "ECB: 3.75% (Dovish / Cutting)"
        "quote_cb": string, // e.g. "Fed: 5.25% (Neutral / Cutting)"
        "verdict": string // High-level divergence impact
    },
    "playbook": {
        "strategy": "Pullback to Value" | "Breakout Momentum" | "Range Fade" | "Wait for Confirmation",
        "key_resistance": string, // Key macro price ceiling level
        "key_support": string, // Key macro price floor level
        "invalidation": string, // Exact macro or technical invalidation condition
        "optimal_session": string // e.g. "London/New York Overlap (13:00 - 17:00 UTC)"
    },
    "scenarios": {
        "bull_case": string, // Concrete upside fundamental trigger and trajectory
        "bear_case": string  // Concrete downside fundamental trigger and trajectory
    },
    "catalyst_radar": {
        "upcoming_event": string, // Most critical upcoming data release or central bank speech
        "expected_impact": string, // "High" | "Medium"
        "deviation_trigger": string // e.g. "If Core PCE prints > 0.3% MoM, expect rapid dollar strength"
    },
    "institutional_brief": string // A 2-paragraph professional hedge-fund memo synthesizing this entire trade thesis.
}

Strict Rules:
1. Ensure the 'bias', 'macro_score', and 'justification' are strictly logical and mathematically coherent with the central bank rate spread and global macro regime.
2. The commentary must be crisp, analytical, and professional—worthy of a senior macro portfolio manager.
3. Return ONLY valid raw JSON. No markdown code blocks, no trailing comments.`;

        const response = await genAI.models.generateContent({
            model: MODELS.FLASH,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are a Chief Global Macro Strategist at a tier-1 macro hedge fund. You produce mathematically sound, data-backed institutional trade intelligence.",
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
