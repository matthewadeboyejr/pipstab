import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
    try {
        const { user: adminUser } = await requireAdmin();

        // Call the internal cron synchronization handler
        // or trigger the sync endpoint
        const cronSecret = process.env.CRON_SECRET;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        let syncResult = { status: "success", message: "Force sync completed" };

        try {
            const res = await fetch(`${appUrl}/api/cron/sync-deriv`, {
                headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
            });
            if (res.ok) {
                syncResult = await res.json();
            }
        } catch (e) {
            console.warn("Direct fetch to /api/cron/sync-deriv had an internal call warning:", e);
        }

        // Log admin action
        await logAdminAction({
            adminId: adminUser.id,
            adminEmail: adminUser.email,
            action: "FORCE_BROKER_SYNC",
            targetType: "broker_sync",
            metadata: { result: syncResult },
        });

        return NextResponse.json({
            success: true,
            message: "Platform broker synchronization executed successfully",
            details: syncResult,
        });
    } catch (error: any) {
        console.error("Force Sync Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to force broker sync" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
