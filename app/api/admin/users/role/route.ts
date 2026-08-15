import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { user: adminUser } = await requireAdmin();
        const { userId, role } = await req.json();

        if (!userId || !role) {
            return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
        }

        if (!["admin", "trader"].includes(role)) {
            return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("profiles")
            .update({ role, updated_at: new Date().toISOString() })
            .eq("id", userId);

        if (error) throw error;

        // Log audit trail
        await logAdminAction({
            adminId: adminUser.id,
            adminEmail: adminUser.email,
            action: "UPDATE_USER_ROLE",
            targetType: "user",
            targetId: userId,
            metadata: { new_role: role },
        });

        return NextResponse.json({ success: true, message: `User role updated to ${role}` });
    } catch (error: any) {
        console.error("Update Role Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update user role" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
