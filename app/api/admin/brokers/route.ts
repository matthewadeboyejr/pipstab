import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { data: accounts, error } = await supabase
            .from("trading_accounts")
            .select(`
                id,
                user_id,
                account_name,
                broker,
                account_number,
                currency,
                is_active,
                deriv_app_id,
                created_at,
                updated_at,
                profiles:user_id (
                    display_name
                )
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const enriched = (accounts || []).map((acc: any) => ({
            id: acc.id,
            user_id: acc.user_id,
            user_name: acc.profiles?.display_name || "Trader",
            account_name: acc.account_name,
            broker: acc.broker || "manual",
            account_number: acc.account_number || "—",
            currency: acc.currency || "USD",
            is_active: acc.is_active,
            is_oauth: !!acc.deriv_app_id,
            created_at: acc.created_at,
            updated_at: acc.updated_at,
        }));

        const totalAccounts = enriched.length;
        const activeAccounts = enriched.filter(a => a.is_active).length;
        const derivAccounts = enriched.filter(a => a.broker === "deriv").length;

        return NextResponse.json({
            stats: {
                total_accounts: totalAccounts,
                active_accounts: activeAccounts,
                deriv_accounts: derivAccounts,
                manual_accounts: totalAccounts - derivAccounts,
            },
            accounts: enriched,
        });
    } catch (error: any) {
        console.error("Admin Brokers Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch broker accounts" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
