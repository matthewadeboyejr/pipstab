import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";
import { sendCustomBroadcastEmail } from "@/lib/email/brevo";

export async function GET() {
    try {
        await requireAdmin();
        const supabase = await createClient();

        const { data: settings } = await supabase
            .from("system_settings")
            .select("*")
            .in("key", ["active_broadcast", "broadcast_history"]);

        const activeBroadcast = settings?.find((s) => s.key === "active_broadcast")?.value || null;
        const history = settings?.find((s) => s.key === "broadcast_history")?.value || [];

        return NextResponse.json({
            active_broadcast: activeBroadcast,
            history: Array.isArray(history) ? history : [],
        });
    } catch (error: any) {
        console.error("Admin Broadcast GET Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch broadcasts" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { user: adminUser } = await requireAdmin();
        const body = await req.json();
        const { action, title, message, type = "announcement", link_url, target = "all", send_email = false } = body;

        const supabase = await createClient();

        if (action === "DISMISS_IN_APP") {
            // Dismiss active in-app banner
            await supabase.from("system_settings").upsert({
                key: "active_broadcast",
                value: { is_active: false },
                updated_at: new Date().toISOString(),
            });

            await logAdminAction({
                adminId: adminUser.id,
                adminEmail: adminUser.email,
                action: "DISMISS_IN_APP_BROADCAST",
                targetType: "broadcast",
                targetId: "active_broadcast",
            });

            return NextResponse.json({ success: true, message: "In-app broadcast dismissed" });
        }

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        const broadcastId = `bc_${Date.now()}`;
        const newBroadcast = {
            id: broadcastId,
            title,
            message,
            type, // "announcement" | "maintenance" | "feature" | "alert"
            link_url: link_url || "",
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: adminUser.email,
        };

        // 1. Update active broadcast in-app
        await supabase.from("system_settings").upsert({
            key: "active_broadcast",
            value: newBroadcast,
            updated_at: new Date().toISOString(),
        });

        // 2. Append to broadcast history
        const { data: histSetting } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "broadcast_history")
            .single();

        const currentHistory = Array.isArray(histSetting?.value) ? histSetting.value : [];
        const updatedHistory = [newBroadcast, ...currentHistory.slice(0, 49)];

        await supabase.from("system_settings").upsert({
            key: "broadcast_history",
            value: updatedHistory,
            updated_at: new Date().toISOString(),
        });

        let emailResult = null;

        // 3. If send_email is true, dispatch via Brevo
        if (send_email) {
            let recipients: Array<{ email: string; name?: string }> = [];

            if (target === "waitlist") {
                const { data: waitlist } = await supabase
                    .from("early_access")
                    .select("email, full_name");
                recipients = (waitlist || []).map((w) => ({ email: w.email, name: w.full_name }));
            } else {
                // All active profiles
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("email, full_name");
                recipients = (profiles || [])
                    .filter((p) => !!p.email)
                    .map((p) => ({ email: p.email, name: p.full_name || undefined }));
            }

            if (recipients.length > 0) {
                emailResult = await sendCustomBroadcastEmail({
                    recipients,
                    subject: `[PipTab Update] ${title}`,
                    headline: title,
                    messageBody: message,
                    actionUrl: link_url || "https://piptab.com",
                    actionLabel: "Open Platform",
                });
            }
        }

        // Log audit trail
        await logAdminAction({
            adminId: adminUser.id,
            adminEmail: adminUser.email,
            action: "PUBLISH_BROADCAST",
            targetType: "broadcast",
            targetId: broadcastId,
            metadata: { title, type, send_email, target, emailResult },
        });

        return NextResponse.json({
            success: true,
            broadcast: newBroadcast,
            emailResult,
        });
    } catch (error: any) {
        console.error("Admin Broadcast POST Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to publish broadcast" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
