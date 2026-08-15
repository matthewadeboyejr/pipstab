import { NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";

export interface AuditReportData {
    type: "structured" | "chat";
    verdict_headline: string;
    summary: string;
    leaks_found: Array<{
        title: string;
        severity: "Critical" | "Warning" | "Notice";
        trade_reference?: string;
        breakdown: string;
    }>;
    directives: string[];
    coaching_tip: string;
    raw_text?: string;
}

export async function POST(req: Request) {
    const { message, tone = "brutal" } = await req.json();

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user's recent 20 trades for context
        const { data: trades } = await supabase
            .from("trades")
            .select("*")
            .order("date", { ascending: false })
            .limit(20);

        const tradeDataFormatted = trades && trades.length > 0
            ? JSON.stringify(trades.map(t => ({
                pair: t.pair,
                direction: t.direction,
                pnl: t.pnl,
                setup: t.setup,
                emotion: t.emotion,
                rr: t.rr,
                notes: t.notes
            })), null, 2)
            : "No trade logs found.";

        let toneInstruction = "You are a **Strict, Brutally Honest Prop Firm Risk Director**. Zero sugar-coating, zero tolerance for gambler mentality, revenge trading, or sloppy execution. Be direct, sharp, and uncompromising.";
        if (tone === "constructive") {
            toneInstruction = "You are a **Constructive & Analytical Senior Strategy Coach**. Deliver objective, data-backed analysis, balancing critique of leaks with clear strategic optimization.";
        } else if (tone === "supportive") {
            toneInstruction = "You are an **Encouraging, Growth-Mindset Trading Psychology Mentor**. Emphasize emotional regulation, positive habit reinforcement, and constructive step-by-step progress.";
        }

        const prompt = `User Message: "${message}"
Auditor Tone Mode: ${tone.toUpperCase()}

Recent 20 Trade Logs for Context:
${tradeDataFormatted}

Instructions:
1. ${toneInstruction}
2. Never output a raw, chaotic wall of text. Always structure your findings into crisp, clean, digestible visual sections.
3. If the user asks a greeting, casual question, or requests a trade audit, respond with appropriate persona authority. Focus on capital preservation, risk of ruin, psychology, and execution discipline.
4. Extract specific trade quotes/notes from their logs to address real habits.

Return a valid JSON object strictly matching this format:
{
    "type": "structured",
    "verdict_headline": string, // Short punchy headline reflecting the audit tone
    "summary": string, // 1-2 sentences with an executive audit verdict
    "leaks_found": [
        {
            "title": string, // Short bold issue title (e.g. "Gambler's Mindset on V10")
            "severity": "Critical" | "Warning" | "Notice",
            "trade_reference": string, // Quote from trade logs or specific pair reference
            "breakdown": string // Analytical explanation matching the chosen tone
        }
    ],
    "directives": string[], // Exactly 2-3 actionable guidelines for their next session
    "coaching_tip": string // One final powerful parting coaching principle
}
Return ONLY raw JSON.`;

        const result = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: toneInstruction,
                responseMimeType: "application/json",
            }
        });

        const resultText = result.text || "";
        let structuredData: AuditReportData;

        try {
            structuredData = JSON.parse(resultText);
        } catch {
            structuredData = {
                type: "chat",
                verdict_headline: "Performance Auditor Brief",
                summary: resultText,
                leaks_found: [],
                directives: ["Maintain strict risk discipline", "Stick to A+ setups only"],
                coaching_tip: "Trade the market in front of you, not your emotions.",
                raw_text: resultText,
            };
        }

        return NextResponse.json(structuredData);
    } catch (error: any) {
        console.error("AI Audit Error across fallback models:", error);
        return NextResponse.json({
            type: "structured",
            verdict_headline: "Risk Protocol Alert",
            summary: "Maintain strict capital preservation rules while the real-time AI pipeline resets.",
            leaks_found: [
                {
                    title: "Risk-Per-Trade Rule",
                    severity: "Critical",
                    trade_reference: "General Journal Baseline",
                    breakdown: "Never exceed 1.0% account risk on any single trade setup.",
                }
            ],
            directives: [
                "Cap maximum daily drawdown at 2.0%",
                "Zero tolerance for revenge trading after a stopped-out position",
            ],
            coaching_tip: "Professional traders manage risk; amateurs chase profits.",
        });
    }
}
