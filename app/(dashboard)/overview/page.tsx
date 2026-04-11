import { createClient } from "@/utils/supabase/server";
import OverviewClient from "@/components/dashboard/OverviewClient";

// ─── Mock Data (Pending Full DB Integration) ─────────────────
const equityData = [
    10000, 10250, 10120, 10400, 10380, 10600, 10550, 10800, 10750,
    11000, 10900, 11200, 11100, 11400, 11350, 11600, 11500, 11800,
    11750, 12000, 11900, 12200, 12100, 12450, 12350, 12600, 12500,
    12800, 12700, 13000,
];

const calendarData = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    const isWeekday = date.getDay() !== 0 && date.getDay() !== 6;
    const traded = isWeekday && Math.random() > 0.35;
    return {
        date: date.toISOString().split("T")[0],
        pnl: traded ? (Math.random() - 0.4) * 300 : 0,
        trades: traded ? Math.floor(Math.random() * 5) + 1 : 0,
    };
});

const insights: any[] = [
    { id: "1", text: "Your win rate on Tuesdays is 73%, which is 23% above your average. Consider increasing position size on Tuesday setups.", type: "positive", confidence: 89 },
    { id: "2", text: "You've taken 4 revenge trades this week after losses. This pattern accounts for 40% of your Alpha Leakage.", type: "warning", confidence: 94 },
    { id: "3", text: "Your best performing session is London Open (7-9 AM GMT). 65% of your profit comes from this window.", type: "timing", confidence: 87 },
    { id: "4", text: "Order Block + FVG confluence setups have a 78% win rate over 50 trades. This is your strongest edge.", type: "positive", confidence: 92 },
];


export default async function OverviewPage() {
    const supabase = await createClient();

    // Fetch trades for this user!
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .order('date', { ascending: false });

    // Provide a fallback in case there is no data or an error
    const formattedTrades = (trades || []).map((t) => ({
        id: t.id || Math.random().toString(),
        pair: t.pair || "Unknown",
        direction: (t.direction || "long").toLowerCase(),
        pnl: Number(t.pnl) || 0,
        rr: t.rr || "-",
        setup: t.setup || "None",
        date: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A",
        emotion: t.emotion || "Neutral",
        account_id: t.account_id || null
    }));

    return (
        <OverviewClient 
            initialTrades={formattedTrades}
            equityData={equityData}
            calendarData={calendarData}
            insights={insights}
        />
    );
}
