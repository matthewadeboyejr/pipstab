import { createClient } from "@/utils/supabase/server";
import AnalyticsClient from "@/components/dashboard/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
    const supabase = await createClient();

    // Fetch trades for the authenticated user
    const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .order('date', { ascending: false });

    // Format the trades for the client (similar to JournalPage)
    const formattedTrades = (trades || []).map((t) => ({
        id: t.id || Math.random().toString(),
        pair: t.pair || "Unknown",
        direction: (t.direction || "long").toLowerCase(),
        entry: t.entry_price ? t.entry_price.toString() : "-",
        exit: t.exit_price ? t.exit_price.toString() : "-",
        sl: t.stop_loss ? t.stop_loss.toString() : "-",
        lot_size: t.lot_size ? t.lot_size.toString() : "-",
        raw_pnl: Number(t.pnl) || 0,
        rr: t.rr || "-",
        setup: t.setup || "None",
        session: t.session || "Unknown",
        date: t.date || new Date().toISOString(),
        emotion: t.emotion || "Neutral",
        checklist_results: t.checklist_results || {},
    }));

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground font-['Montserrat']">Analytics & Edge Verification</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Objective feedback based on your actual log data to analyze your trading edge and find Alpha Leakage.
                </p>
            </div>
            <AnalyticsClient trades={formattedTrades} />
        </div>
    );
}
