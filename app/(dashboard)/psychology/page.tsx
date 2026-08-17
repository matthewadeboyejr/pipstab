import { createClient } from "@/utils/supabase/server";
import PsychologyClient from "@/components/dashboard/psychology/PsychologyClient";

export default async function PsychologyPage() {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please sign in to view your mindset logs.</div>;
    }

    // Fetch user's historical check-ins and trades in parallel
    const [checkinsRes, tradesRes] = await Promise.all([
        supabase
            .from("checkins")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        supabase
            .from("trades")
            .select("id, pair, direction, pnl, emotion, setup, date, session, checklist_results, account_id")
            .eq("user_id", user.id)
            .order("date", { ascending: false }),
    ]);

    const checkins = checkinsRes.data || [];
    const trades = tradesRes.data || [];

    // Format checkins for the client
    const formattedCheckins = checkins.map((c) => ({
        id: c.id,
        date: new Date(c.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        rawDate: c.date,
        sleep_hours: Number(c.sleep_hours),
        mood: c.mood,
        distractions: c.distractions || "None",
        market_bias: c.market_bias,
        preparedness_score: Number(c.preparedness_score),
    }));

    // Format trades for the client
    const formattedTrades = trades.map((t) => ({
        id: t.id,
        pair: t.pair || "Unknown",
        direction: (t.direction || "long").toLowerCase(),
        pnl: Number(t.pnl) || 0,
        raw_pnl: Number(t.pnl) || 0,
        emotion: t.emotion || "Neutral",
        setup: t.setup || "None",
        session: t.session || "New York",
        date: t.date || new Date().toISOString(),
        account_id: t.account_id || null,
    }));

    // Determine if user has already checked in today
    const todayStr = new Date().toISOString().split("T")[0];
    const hasCheckedInToday = formattedCheckins.some((c) => c.rawDate === todayStr);

    return (
        <div className="w-full space-y-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-foreground font-['Montserrat']">Psychology & Tilt Shield</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Master your emotional capital, eliminate revenge trading, and align cognitive readiness with statistical execution.
                </p>
            </div>

            <PsychologyClient
                initialCheckins={formattedCheckins}
                hasCheckedInToday={hasCheckedInToday}
                trades={formattedTrades}
            />
        </div>
    );
}
