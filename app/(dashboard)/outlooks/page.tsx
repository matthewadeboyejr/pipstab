import { createClient } from "@/utils/supabase/server";
import OutlooksClient from "@/components/dashboard/outlooks/OutlooksClient";

export const revalidate = 0; // Dynamic server fetch

export default async function OutlooksPage() {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground">
                Please sign in to view your Top-Down Market Outlooks.
            </div>
        );
    }

    // Fetch user outlooks
    const { data: outlooks, error } = await supabase
        .from("outlooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching outlooks:", error);
    }

    return <OutlooksClient initialOutlooks={outlooks || []} />;
}
