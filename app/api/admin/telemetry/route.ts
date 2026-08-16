import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";
import { getBrevoAccountInfo } from "@/lib/email/brevo";
import { generateContentWithFallback } from "@/lib/gemini";

export async function GET() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        // 1. Measure Gemini AI Latency & Status
        const startGemini = Date.now();
        let geminiStatus = "OPERATIONAL";
        let geminiLatencyMs = 0;
        let geminiError = null;

        try {
            const res = await generateContentWithFallback({
                contents: [{ role: "user", parts: [{ text: "Ping. Reply with PONG only." }] }],
                config: { temperature: 0.1, maxOutputTokens: 5 },
            });
            geminiLatencyMs = Date.now() - startGemini;
            if (!res.text) geminiStatus = "DEGRADED";
        } catch (e: any) {
            geminiLatencyMs = Date.now() - startGemini;
            geminiStatus = "OFFLINE";
            geminiError = e.message;
        }

        // 2. Fetch Brevo Email Quota
        const brevoInfo = await getBrevoAccountInfo();

        // 3. Supabase Storage Stats (trade-images bucket)
        let storageFileCount = 0;
        let storageStatus = "OPERATIONAL";
        try {
            const { data: files, error: storageErr } = await supabase.storage
                .from("trade-images")
                .list("", { limit: 100 });
            if (storageErr) {
                storageStatus = "WARNING";
            } else {
                storageFileCount = files?.length || 0;
            }
        } catch (e) {
            storageStatus = "UNKNOWN";
        }

        // 4. Database Ping
        const dbStart = Date.now();
        const { count: profileCount } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true });
        const dbLatencyMs = Date.now() - dbStart;

        // 5. Total Trades & Outlooks count
        const [tradesRes, outlooksRes] = await Promise.allSettled([
            supabase.from("trades").select("id", { count: "exact", head: true }),
            supabase.from("outlooks").select("id", { count: "exact", head: true }),
        ]);

        const totalTrades = tradesRes.status === "fulfilled" ? tradesRes.value.count || 0 : 0;
        const totalOutlooks = outlooksRes.status === "fulfilled" ? outlooksRes.value.count || 0 : 0;

        return NextResponse.json({
            gemini: {
                status: geminiStatus,
                latencyMs: geminiLatencyMs,
                model: "gemini-2.5-flash (primary) / gemini-1.5-pro (failover)",
                error: geminiError,
            },
            brevo: {
                status: brevoInfo.error ? "CONFIG_REQUIRED" : "OPERATIONAL",
                plan: brevoInfo.plan || "Free (300 emails/day)",
                creditsRemaining: brevoInfo.creditsRemaining ?? 300,
                creditsTotal: 300,
                error: brevoInfo.error,
            },
            supabase: {
                databaseStatus: "OPERATIONAL",
                databaseLatencyMs: dbLatencyMs,
                storageStatus,
                storageBucket: "trade-images",
                trackedFiles: storageFileCount,
            },
            platformTotals: {
                registeredTraders: profileCount || 0,
                totalTradesLogged: totalTrades,
                totalOutlooksCreated: totalOutlooks,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Admin Telemetry Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch telemetry" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
