import { NextResponse } from "next/server";
import { genAI, MODELS } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    const { message } = await req.json();

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

        const promptTemplate = `
User Query: "${message}"

Context (Recent 20 Trades):
${trades ? JSON.stringify(trades.map(t => ({
    pair: t.pair,
    direction: t.direction,
    pnl: t.pnl,
    setup: t.setup,
    emotion: t.emotion,
    rr: t.rr,
    notes: t.notes
})), null, 2) : "No trade history found."}

Instructions:
1. You are a **Strict and Brutally Honest** Trading Performance Auditor.
2. Your goal is to improve the user's edge by pointing out flaws in their discipline, risk management, and psychology.
3. If the data shows bad habits (e.g., revenge trading, inconsistent R:R), call them out sharply. Do NOT sugar-coat.
4. If the user asks for advice, give them actionable, high-performance coaching tips.
5. Use a direct, no-nonsense tone. Be short but impactful.
`;

        const response = await genAI.models.generateContent({
            model: MODELS.FLASH,
            contents: [{ role: "user", parts: [{ text: promptTemplate }] }],
            config: {
                systemInstruction: "You are a professional prop firm risk manager who rejects weak traders. You are strict, brutally honest, and focused entirely on data-backed discipline.",
            }
        });

        return NextResponse.json({ text: response.text || "The auditor is momentarily speechless. Try again." });
    } catch (error: any) {
        console.error("AI Audit Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to audit journal" },
            { status: 500 }
        );
    }
}
