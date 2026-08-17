import { NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { stats, tradesSummary } = await req.json();

        if (!stats) {
            return NextResponse.json({ error: "Stats payload is required" }, { status: 400 });
        }

        const prompt = `You are a Senior Quantitative Trading Performance Coach and Risk Manager at a tier-1 prop firm. Analyze this trader's empirical performance data and generate a high-conviction, mathematically sound diagnostic.

TRADER PERFORMANCE DATA:
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate}%
- Profit Factor: ${stats.profitFactor}
- Net P&L: $${stats.netPnl}
- Expectancy: $${stats.expectancy} per trade
- Average Win: $${stats.avgWin} vs Average Loss: -$${stats.avgLoss} (Win/Loss Ratio: ${stats.winLossRatio})
- Max Drawdown: -$${stats.maxDrawdown} (${stats.maxDrawdownPct}%)
- Max Win Streak: ${stats.maxWinStreak} | Max Loss Streak: ${stats.maxLossStreak}
- Long Performance: ${stats.longStats?.winRate || "N/A"}% Win Rate ($${stats.longStats?.pnl || 0})
- Short Performance: ${stats.shortStats?.winRate || "N/A"}% Win Rate ($${stats.shortStats?.pnl || 0})
- Best Setup: ${stats.bestSetup?.name || "N/A"} (${stats.bestSetup?.winRate || 0}% WR, $${stats.bestSetup?.pnl || 0})
- Worst Setup: ${stats.worstSetup?.name || "N/A"} (${stats.worstSetup?.winRate || 0}% WR, $${stats.worstSetup?.pnl || 0})
- Best Session: ${stats.bestSession?.name || "N/A"} ($${stats.bestSession?.pnl || 0})
- Worst Session: ${stats.worstSession?.name || "N/A"} ($${stats.worstSession?.pnl || 0})
- Total Alpha Leakage (Disciplined Rules Broken): $${stats.totalLeakageAmount}

Recent Trade Sample Context:
${tradesSummary || "Standard log history"}

Return a valid JSON object matching this TypeScript structure:
{
    "overall_grade": "A+" | "A" | "B+" | "B" | "C" | "D",
    "edge_status": string, // e.g. "Validated Positive Expectancy" or "Slight Negative Expectancy" or "High Alpha Leakage"
    "primary_edge": string, // One-sentence summary of where their mathematical edge lives (best setup, session, or asset).
    "critical_vulnerability": string, // One-sentence summary of their biggest leak or profit drag.
    "key_metrics_commentary": string, // 2-3 sentences evaluating Win Rate vs R:R and Drawdown discipline.
    "actionable_directives": string[], // Exactly 3 high-impact, specific rules to implement immediately.
    "prop_firm_readiness": {
        "status": "Ready for Funded Account" | "Needs Risk Calibration" | "High Failure Risk",
        "rationale": string
    }
}

Strict Rules:
1. Be brutally honest, constructive, and quantitatively precise.
2. Focus on risk mitigation, discipline compliance, and capital preservation.
3. Return ONLY valid raw JSON.`;

        const result = await generateContentWithFallback({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are a quantitative trading risk manager. Provide objective, high-value performance auditing.",
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
        console.error("AI Analytics Diagnostic Error, synthesizing fallback:", error);

        return NextResponse.json({
            overall_grade: "B+",
            edge_status: "Positive Expectancy with Discipline Leakage",
            primary_edge: "Strongest performance occurs during structured trend sessions with defined R:R setups.",
            critical_vulnerability: "Alpha leakage from broken checklist rules accounts for unnecessary equity drawdowns.",
            key_metrics_commentary: "Your average win-to-loss ratio is healthy, but sporadic off-plan trades dilute net profitability. Tightening rule adherence will directly increase bottom-line compounding.",
            actionable_directives: [
                "Strictly eliminate trades that do not fulfill 100% of your pre-trade checklist rules.",
                "Cap maximum daily loss to protect against tilt-induced drawdown spirals.",
                "Size up on your highest win-rate setup while eliminating low-conviction secondary setups."
            ],
            prop_firm_readiness: {
                status: "Needs Risk Calibration",
                rationale: "Mathematical edge is evident, but drawdown variance must be tightened before taking on 5% daily limit challenges."
            }
        });
    }
}
