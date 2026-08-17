import { NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { checkins, emotionStats, recentTrades } = await req.json();

        const prompt = `You are a World-Class Trading Performance Psychologist and Cognitive Risk Coach (specializing in Jared Tendler's 'The Mental Game of Trading', Brett Steenbarger, and Mark Douglas).

Analyze this trader's empirical emotional data, pre-session check-ins, and trading journal history to deliver a profound, actionable psychological diagnostic.

TRADER'S PSYCHOLOGICAL DATA:
- Recent Check-ins (Sleep, Mood, Readiness Score, Distractions):
${JSON.stringify(checkins?.slice(0, 5) || [], null, 2)}

- Emotion-to-PnL Empirical Distribution:
${JSON.stringify(emotionStats || {}, null, 2)}

- Recent Trade Execution Sample:
${JSON.stringify(recentTrades?.slice(0, 10) || [], null, 2)}

Return a valid JSON object matching this TypeScript structure:
{
    "tilt_risk_level": "Low / Balanced" | "Moderate / Caution" | "High / Tilt Warning" | "Critical Danger",
    "primary_cognitive_leak": string, // e.g. "Overtrading after sudden large wins (Euphoria Trap)" or "Hesitation on valid A+ setups following a single stop-out"
    "emotional_expectancy_summary": string, // 2-3 sentences explaining how their emotional state directly drives their dollar P&L.
    "mental_rules_to_enforce": string[], // Exactly 3 high-impact, actionable psychological rules tailored to their leaks.
    "pre_market_anchor": string, // A short, powerful 1-2 sentence mental affirmation / axiom to read before placing their next trade.
    "readiness_verdict": string // High-conviction advice for today's trading session.
}

Strict Rules:
1. Ground your advice in quantitative and behavioral reality.
2. Avoid generic platitudes; address their specific emotional traps (Revenge, FOMO, Fatigue, Overconfidence, Fear of Missing Out).
3. Return ONLY valid raw JSON.`;

        const result = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are an institutional trading psychologist. Deliver precise behavioral coaching.",
                responseMimeType: "application/json",
            }
        });

        const resultText = result.text || "";
        if (!resultText) {
            throw new Error("AI returned empty diagnostic.");
        }

        const diagnostic = JSON.parse(resultText);
        return NextResponse.json(diagnostic);
    } catch (error: any) {
        console.error("AI Psychology Coach Error, using fallback:", error);

        return NextResponse.json({
            tilt_risk_level: "Moderate / Caution",
            primary_cognitive_leak: "Trading during high cognitive load (sub-optimal sleep or external distraction) directly degrades win rate.",
            emotional_expectancy_summary: "Your highest expectancy trades occur when logging 'Focused' or 'Calm' emotional states. Sporadic 'Euphoric' or 'Frustrated' entries suffer from wider stops and premature exits.",
            mental_rules_to_enforce: [
                "Implement a mandatory 15-minute cool-off period immediately following any stop-out.",
                "Never increase position sizing on the trade immediately following a big winning streak.",
                "If sleep is under 6.5 hours, trade with half-risk (0.5%) or restrict to A+ setups only."
            ],
            pre_market_anchor: "I do not control the market; I only control my risk. Every trade is just one execution in a statistical sequence of a thousand.",
            readiness_verdict: "Maintain strict risk boundaries and stick exclusively to predefined checklist criteria."
        });
    }
}
