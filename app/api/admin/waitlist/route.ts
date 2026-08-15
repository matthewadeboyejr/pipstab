import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "";
        const status = searchParams.get("status") || "all";

        let dbQuery = supabase
            .from("early_access")
            .select("*")
            .order("created_at", { ascending: false });

        if (query) {
            dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
        }

        if (status !== "all") {
            dbQuery = dbQuery.eq("status", status);
        }

        const { data: waitlist, error } = await dbQuery;

        if (error) throw error;

        return NextResponse.json({ waitlist: waitlist || [] });
    } catch (error: any) {
        console.error("Admin Waitlist Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch waitlist" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const { user: adminUser } = await requireAdmin();
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "id and status are required" }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("early_access")
            .update({ status })
            .eq("id", id);

        if (error) throw error;

        // Log audit trail
        await logAdminAction({
            adminId: adminUser.id,
            adminEmail: adminUser.email,
            action: "UPDATE_WAITLIST_STATUS",
            targetType: "early_access",
            targetId: id,
            metadata: { new_status: status },
        });

        return NextResponse.json({ success: true, message: `Waitlist entry updated to ${status}` });
    } catch (error: any) {
        console.error("Update Waitlist Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update waitlist entry" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
