import { NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";
import { sendEarlyAccessInviteEmail } from "@/lib/email/brevo";

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
        const { id, status, sendEmail = false } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "id and status are required" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Fetch lead details
        const { data: lead, error: fetchErr } = await supabase
            .from("early_access")
            .select("id, full_name, email, market")
            .eq("id", id)
            .single();

        if (fetchErr || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // 2. Update status in database
        const { error: updateErr } = await supabase
            .from("early_access")
            .update({ status })
            .eq("id", id);

        if (updateErr) throw updateErr;

        let emailResult: { success: boolean; messageId?: string; error?: string } = {
            success: false,
            error: "Email not requested",
        };

        // 3. Send automated Brevo email if requested or if status is 'invited' / 'approved'
        if (sendEmail) {
            emailResult = await sendEarlyAccessInviteEmail({
                email: lead.email,
                fullName: lead.full_name || "Trader",
            });
        }

        // 4. Log audit trail
        await logAdminAction({
            adminId: adminUser.id,
            adminEmail: adminUser.email,
            action: sendEmail ? "APPROVE_AND_SEND_INVITE_EMAIL" : "UPDATE_WAITLIST_STATUS",
            targetType: "early_access",
            targetId: id,
            metadata: {
                new_status: status,
                email_sent: emailResult.success,
                email_error: emailResult.error,
                lead_email: lead.email,
            },
        });

        return NextResponse.json({
            success: true,
            message: sendEmail && emailResult.success
                ? `Lead status updated to ${status} and invitation email dispatched via Brevo!`
                : `Lead status updated to ${status}.${emailResult.error ? ` (Email notice: ${emailResult.error})` : ""}`,
            emailResult,
        });
    } catch (error: any) {
        console.error("Update Waitlist Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update waitlist entry" },
            { status: error.message?.includes("Forbidden") ? 403 : 500 }
        );
    }
}
