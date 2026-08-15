import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const query = searchParams.get("query") || "";
        const role = searchParams.get("role") || "all";

        const offset = (page - 1) * limit;

        let dbQuery = supabase
            .from("profiles")
            .select("id, display_name, timezone, base_currency, role, created_at, updated_at", { count: "exact" });

        if (query) {
            dbQuery = dbQuery.ilike("display_name", `%${query}%`);
        }

        if (role !== "all") {
            dbQuery = dbQuery.eq("role", role);
        }

        const { data: profiles, count, error } = await dbQuery
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Fetch auxiliary stats (trades count & trading accounts) for these users
        const userIds = (profiles || []).map((p) => p.id);

        let tradeCounts: Record<string, number> = {};
        let accountSummaries: Record<string, { total: number; derivConnected: boolean }> = {};

        if (userIds.length > 0) {
            const [tradesRes, accountsRes] = await Promise.allSettled([
                supabase.from("trades").select("user_id").in("user_id", userIds),
                supabase.from("trading_accounts").select("user_id, broker, is_active").in("user_id", userIds),
            ]);

            if (tradesRes.status === "fulfilled" && tradesRes.value.data) {
                for (const t of tradesRes.value.data) {
                    tradeCounts[t.user_id] = (tradeCounts[t.user_id] || 0) + 1;
                }
            }

            if (accountsRes.status === "fulfilled" && accountsRes.value.data) {
                for (const a of accountsRes.value.data) {
                    if (!accountSummaries[a.user_id]) {
                        accountSummaries[a.user_id] = { total: 0, derivConnected: false };
                    }
                    accountSummaries[a.user_id].total++;
                    if (a.broker === "deriv") {
                        accountSummaries[a.user_id].derivConnected = true;
                    }
                }
            }
        }

        const enrichedUsers = (profiles || []).map((p) => ({
            id: p.id,
            display_name: p.display_name || "Anonymous Trader",
            role: p.role || "trader",
            timezone: p.timezone,
            base_currency: p.base_currency,
            created_at: p.created_at,
            total_trades: tradeCounts[p.id] || 0,
            linked_accounts: accountSummaries[p.id]?.total || 0,
            deriv_connected: !!accountSummaries[p.id]?.derivConnected,
        }));

        return NextResponse.json({
            users: enrichedUsers,
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error: any) {
        console.error("Admin Users Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch user directory" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
