import { createClient } from "@/utils/supabase/server";
import JournalClient from "@/components/dashboard/journal/JournalClient";

export default async function JournalPage() {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please sign in to view your journal.</div>;
    }

    // Fetch trades for the authenticated user, newest first
    const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

    // Safely map data from DB to the Trade interface
    const formattedTrades = (trades || []).map((t) => ({
        id: t.id || Math.random().toString(),
        pair: t.pair || "Unknown",
        direction: (t.direction || "long").toLowerCase(),
        entry: t.entry_price ? t.entry_price.toString() : "-",
        exit: t.exit_price ? t.exit_price.toString() : "-",
        sl: t.stop_loss ? t.stop_loss.toString() : "-",
        lot_size: t.lot_size ? t.lot_size.toString() : "-",
        pnl: Number(t.pnl) || 0,
        rr: t.rr || "-",
        setup: t.setup || "None",
        session: t.session || "Unknown",
        rawDate: t.date || new Date().toISOString(),
        date: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
        emotion: t.emotion || "Neutral",
        notes: t.notes || "",
        image_before: t.image_before || null,
        image_after: t.image_after || null,
        broker: t.broker || "Manual",
        account_id: t.account_id || null,
        checklist_results: t.checklist_results || {},
    }));

    return (
        <div className="w-full">
            <JournalClient trades={formattedTrades} />
        </div>
    );
}

