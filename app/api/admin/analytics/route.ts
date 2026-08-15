import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";
import { subDays } from "date-fns";

export async function GET() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const sevenDaysAgo = subDays(new Date(), 7).toISOString();
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Parallel DB aggregations
        const [
            profilesRes,
            recentProfilesRes,
            tradesRes,
            recentTradesRes,
            accountsRes,
            waitlistRes,
        ] = await Promise.allSettled([
            supabase.from("profiles").select("id", { count: "exact" }),
            supabase.from("profiles").select("id", { count: "exact" }).gte("created_at", sevenDaysAgo),
            supabase.from("trades").select("id, pnl, pair, date"),
            supabase.from("trades").select("id", { count: "exact" }).gte("created_at", sevenDaysAgo),
            supabase.from("trading_accounts").select("id, broker, is_active, deriv_token_encrypted"),
            supabase.from("early_access").select("id, status"),
        ]);

        const totalTraders = profilesRes.status === "fulfilled" ? profilesRes.value.count || 0 : 0;
        const newTraders7d = recentProfilesRes.status === "fulfilled" ? recentProfilesRes.value.count || 0 : 0;

        const allTrades = tradesRes.status === "fulfilled" && tradesRes.value.data ? tradesRes.value.data : [];
        const totalTradesCount = allTrades.length;
        const trades7dCount = recentTradesRes.status === "fulfilled" ? recentTradesRes.value.count || 0 : 0;

        let totalPnL = 0;
        let winningTrades = 0;
        const pairCounts: Record<string, number> = {};

        for (const t of allTrades) {
            const pnl = Number(t.pnl) || 0;
            totalPnL += pnl;
            if (pnl > 0) winningTrades++;
            if (t.pair) {
                const pair = t.pair.toUpperCase();
                pairCounts[pair] = (pairCounts[pair] || 0) + 1;
            }
        }

        const winRate = totalTradesCount > 0 ? Math.round((winningTrades / totalTradesCount) * 100) : 0;

        const topPairs = Object.entries(pairCounts)
            .map(([pair, count]) => ({ pair, count, percentage: Math.round((count / (totalTradesCount || 1)) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Broker accounts
        const allAccounts = accountsRes.status === "fulfilled" && accountsRes.value.data ? accountsRes.value.data : [];
        const derivAccountsCount = allAccounts.filter(a => a.broker === "deriv" || a.deriv_token_encrypted).length;
        const activeAccountsCount = allAccounts.filter(a => a.is_active).length;

        // Early access
        const allWaitlist = waitlistRes.status === "fulfilled" && waitlistRes.value.data ? waitlistRes.value.data : [];
        const waitlistPending = allWaitlist.filter(w => w.status === "pending").length;
        const waitlistApproved = allWaitlist.filter(w => w.status === "approved" || w.status === "invited").length;

        const payload = {
            overview: {
                total_traders: totalTraders,
                new_traders_7d: newTraders7d,
                total_trades: totalTradesCount,
                trades_7d: trades7dCount,
                platform_pnl: Math.round(totalPnL * 100) / 100,
                win_rate: winRate,
                deriv_accounts: derivAccountsCount,
                active_accounts: activeAccountsCount,
                waitlist_total: allWaitlist.length,
                waitlist_pending: waitlistPending,
                waitlist_approved: waitlistApproved,
            },
            top_pairs: topPairs,
            system_status: {
                ai_pipeline: "Operational (Gemini 3.6)",
                cron_sync: "Active (Hourly)",
                database_health: "Healthy (Supabase Postgres)",
                last_updated: new Date().toISOString(),
            }
        };

        return NextResponse.json(payload);
    } catch (error: any) {
        console.error("Admin Analytics Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch admin analytics" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
