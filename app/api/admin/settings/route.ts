import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const [settingsRes, auditRes] = await Promise.allSettled([
            supabase.from("system_settings").select("*").order("key"),
            supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(25),
        ]);

        const settings = settingsRes.status === "fulfilled" && settingsRes.value.data ? settingsRes.value.data : [];
        const auditLogs = auditRes.status === "fulfilled" && auditRes.value.data ? auditRes.value.data : [];

        return NextResponse.json({
            settings,
            audit_logs: auditLogs,
        });
    } catch (error: any) {
        console.error("Admin Settings Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch settings" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { user: adminUser } = await requireAdmin();
        const { key, value } = await req.json();

        if (!key || value === undefined) {
            return NextResponse.json({ error: "key and value are required" }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("system_settings")
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;

        // Log audit trail
        await logAdminAction({
            adminId: adminUser.id,
            adminEmail: adminUser.email,
            action: "UPDATE_SYSTEM_SETTING",
            targetType: "setting",
            targetId: key,
            metadata: { value },
        });

        return NextResponse.json({ success: true, message: `Setting ${key} updated` });
    } catch (error: any) {
        console.error("Update Setting Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update setting" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
