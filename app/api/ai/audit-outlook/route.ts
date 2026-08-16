import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, isConfigured } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!isConfigured) {
            return NextResponse.json({
                error: "AI engine is not configured with GEMINI_API_KEY",
            }, { status: 500 });
        }

        const body = await req.json();
        const {
            pair,
            direction,
            title,
            htf_narrative,
            itf_narrative,
            ltf_narrative,
            poi_narrative,
        } = body;

        if (!pair || !direction) {
            return NextResponse.json({ error: "Pair and direction are required" }, { status: 400 });
        }

        const prompt = `You are a Senior Quantitative & Institutional Market Structure Risk Auditor for PipTab Analytics.
You evaluate multi-timeframe top-down trading playbooks (Smart Money Concepts / ICT / Classical Supply & Demand / Macro liquidity).

Your objective is to provide an objective, high-conviction audit of the trader's Top-Down Market Outlook to maximize trade quality and mitigate uncalculated risk.

══════════════════════════════════════
TRADER'S TOP-DOWN OUTLOOK
══════════════════════════════════════
Outlook Title: ${title || "Untitled Outlook"}
Asset Pair: ${pair}
Directional Bias: ${direction}

STAGE 1 — Higher Timeframe (HTF - Macro Context & Draw on Liquidity):
${htf_narrative || "No narrative provided."}

STAGE 2 — Intermediate Timeframe (ITF - Structure Shift & CISD):
${itf_narrative || "No narrative provided."}

STAGE 3 — Lower Timeframe (LTF - Displacement & Pullback Range):
${ltf_narrative || "No narrative provided."}

STAGE 4 — Point of Interest (POI - Entry Trigger & Invalidation):
${poi_narrative || "No narrative provided."}
══════════════════════════════════════

TASK:
Analyze the thesis across:
1. Timeframe Confluence: Does the HTF Draw on Liquidity logically lead into the ITF structure shift and LTF execution?
2. Potential Traps & Blind Spots: What could go wrong? (e.g. unmitigated supply/demand against the trade, session timing risks, liquidity sweeps before expansion).
3. Risk & Invalidation Assessment: Is the invalidation structural or arbitrary?
4. Executive Action Directive: Direct, high-impact advice on execution timing and discipline.

Return ONLY a valid JSON object matching this EXACT schema (do not wrap in markdown quotes if possible, or return clean JSON):
{
  "confluenceScore": number (integer between 0 and 100),
  "confluenceRating": "HIGH CONFLUENCE" | "MODERATE CONFLUENCE" | "HIGH RISK" | "CONFLICTED BIAS",
  "timeframeAlignmentSummary": "Concise 1-2 sentence assessment of multi-timeframe structural cohesion.",
  "alignmentStrengths": [
    "Key structural strength point 1",
    "Key structural strength point 2"
  ],
  "blindSpots": [
    "Critical risk factor or liquidity trap warning 1",
    "Critical risk factor or liquidity trap warning 2"
  ],
  "riskInvalidationCheck": "1-2 sentences verifying invalidation logic and stop loss protection.",
  "executiveDirective": "Direct 2-3 sentence institutional guidance for the execution phase."
}`;

        const result = await generateContentWithFallback({
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
            },
        });

        const rawText = result.text.trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

        return NextResponse.json({
            success: true,
            audit: parsed,
            model: result.usedModel,
        });
    } catch (error: any) {
        console.error("AI Outlook Audit Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to audit market outlook" },
            { status: 500 }
        );
    }
}
