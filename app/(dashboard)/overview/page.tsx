import { createClient } from "@/utils/supabase/server";
import OverviewClient from "@/components/dashboard/OverviewClient";
import { InsightData } from "@/components/dashboard/InsightCard";

export default async function OverviewPage() {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please sign in to view your dashboard.</div>;
    }

    // Fetch trades and accounts
    const [tradesRes, accountsRes] = await Promise.all([
        supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: true }),
        supabase.from('trading_accounts').select('*').eq('user_id', user.id).limit(1)
    ]);

    const trades = tradesRes.data || [];
    const primaryAccount = accountsRes.data?.[0];
    const initialBalance = Number(primaryAccount?.initial_balance) || 0;

    // --- 1. Calculate KPIs ---
    const totalTrades = trades.length;
    const wins = trades.filter(t => Number(t.pnl) > 0);
    const losses = trades.filter(t => Number(t.pnl) < 0);
    
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    
    const grossProfit = wins.reduce((acc, t) => acc + Number(t.pnl), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + Number(t.pnl), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 9.99 : 0);

    const validRRs = trades.filter(t => !isNaN(parseFloat(t.rr))).map(t => parseFloat(t.rr));
    const avgRR = validRRs.length > 0 ? validRRs.reduce((acc, r) => acc + r, 0) / validRRs.length : 0;

    // Current Win Streak
    let winStreak = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
        if (Number(trades[i].pnl) > 0) winStreak++;
        else break;
    }

    // --- 2. Calculate Equity Curve ---
    let currentBalance = initialBalance;
    const equityData = [initialBalance];
    trades.forEach(t => {
        currentBalance += Number(t.pnl);
        equityData.push(currentBalance);
    });

    // --- 3. Calculate Calendar Data (Last 90 Days) ---
    const calendarMap = new Map();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
    
    // Initialize map with zeros for last 90 days
    for (let i = 0; i < 90; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (89 - i));
        calendarMap.set(d.toISOString().split('T')[0], { pnl: 0, trades: 0 });
    }

    // Fill with real trade data
    trades.forEach(t => {
        const dateKey = t.date?.split('T')[0];
        if (calendarMap.has(dateKey)) {
            const entry = calendarMap.get(dateKey);
            entry.pnl += Number(t.pnl);
            entry.trades += 1;
        }
    });

    const calendarData = Array.from(calendarMap.entries()).map(([date, data]) => ({
        date,
        ...data
    }));

    // --- 4. Dynamic Insights ---
    const insights: InsightData[] = [];
    if (winRate > 60) {
        insights.push({ id: "1", text: `Your win rate of ${winRate.toFixed(1)}% is exceptional. Current risk settings are protecting your edge well.`, type: "positive", confidence: 92 });
    } else if (winRate < 40 && totalTrades > 5) {
        insights.push({ id: "1", text: "Your win rate has dropped below 40%. Consider reviewing your setup checklists before the next session.", type: "warning", confidence: 85 });
    }

    if (winStreak >= 3) {
        insights.push({ id: "2", text: `You are on a ${winStreak}-trade win streak. Avoid "overconfidence bias" — maintain strict lot sizing.`, type: "timing", confidence: 95 });
    }

    if (profitFactor < 1.2 && totalTrades > 5) {
        insights.push({ id: "3", text: "Your Profit Factor is leaning towards neutral. Focus on 'letting winners run' to improve your expectancy.", type: "warning", confidence: 88 });
    } else {
        insights.push({ id: "3", text: `${trades.length > 0 ? trades[trades.length-1].pair : "Market"} performance is consistent with your historical peak volatility windows.`, type: "neutral", confidence: 70 });
    }

    // Format trades for the list
    const formattedTrades = trades.reverse().map((t) => ({
        id: t.id,
        pair: t.pair || "Unknown",
        direction: (t.direction || "long").toLowerCase(),
        pnl: Number(t.pnl) || 0,
        rr: t.rr || "-",
        setup: t.setup || "None",
        date: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A",
        emotion: t.emotion || "Neutral",
        account_id: t.account_id || null
    }));

    const kpiStats = {
        winRate: winRate.toFixed(1),
        profitFactor: profitFactor.toFixed(2),
        avgRR: `1:${avgRR.toFixed(1)}`,
        winStreak: winStreak.toString()
    };

    return (
        <OverviewClient 
            initialTrades={formattedTrades}
            equityData={equityData}
            calendarData={calendarData}
            insights={insights}
            kpiStats={kpiStats}
        />
    );
}
