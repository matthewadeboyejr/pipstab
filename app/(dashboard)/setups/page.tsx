import { createClient } from "@/utils/supabase/server";
import SetupsClient from "@/components/dashboard/setups/SetupsClient";

export default async function SetupsPage() {
    const supabase = await createClient();

    // Fetch user's custom setups
    const { data: setups, error } = await supabase
        .from("setups")
        .select("*")
        .order("created_at", { ascending: true });

    const formattedSetups = (setups || []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        checklist: s.checklist || [],
    }));

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground font-['Montserrat']">Setups & Rules</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Define your trading edges and their mandatory checklists.
                </p>
            </div>
            <SetupsClient initialSetups={formattedSetups} />
        </div>
    );
}
