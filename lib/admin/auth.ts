import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * Checks if a user has administrator privileges.
 * Validates against both database role and ADMIN_EMAILS environment variable.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;

    // 1. Check ADMIN_EMAILS environment variable
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsEnv
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        return true;
    }

    // 2. Check public.profiles role in Supabase
    try {
        const supabase = await createClient();
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role === "admin") {
            return true;
        }
    } catch (e) {
        console.error("Error checking admin profile status:", e);
    }

    return false;
}

/**
 * Server-side guard: Ensures the calling user is an authenticated administrator.
 * Throws an Error or returns user & admin status.
 */
export async function requireAdmin(): Promise<{ user: User; isAdmin: boolean }> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized: Authentication required");
    }

    const isAdmin = await checkIsAdmin(user);
    if (!isAdmin) {
        throw new Error("Forbidden: Administrator privileges required");
    }

    return { user, isAdmin: true };
}

/**
 * Records an administrative action in the audit log for compliance.
 */
export async function logAdminAction({
    adminId,
    adminEmail,
    action,
    targetType,
    targetId,
    metadata = {},
}: {
    adminId?: string;
    adminEmail?: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, any>;
}) {
    try {
        const supabase = await createClient();
        await supabase.from("admin_audit_logs").insert({
            admin_id: adminId,
            admin_email: adminEmail,
            action,
            target_type: targetType,
            target_id: targetId,
            metadata,
        });
    } catch (e) {
        console.error("Failed to log admin action:", e);
    }
}
