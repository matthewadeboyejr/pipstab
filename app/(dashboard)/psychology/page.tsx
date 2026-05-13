import { createClient } from "@/utils/supabase/server";
import PsychologyClient from "@/components/dashboard/psychology/PsychologyClient";

export default async function PsychologyPage() {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please sign in to view your mindset logs.</div>;
    }

    // Fetch user's historical check-ins
    const { data: checkins, error } = await supabase
        .from("checkins")
        .select("*")
        .eq('user_id', user.id)
        .order("created_at", { ascending: false });

    // Format for the client
    const formattedCheckins = (checkins || []).map(c => ({
        id: c.id,
        date: new Date(c.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        rawDate: c.date,
        sleep_hours: Number(c.sleep_hours),
        mood: c.mood,
        distractions: c.distractions || "None",
        market_bias: c.market_bias,
        preparedness_score: Number(c.preparedness_score),
    }));

    // Determine if user has already checked in today
    const todayStr = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = formattedCheckins.some(c => c.rawDate === todayStr);

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground font-['Montserrat']">Cognitive Check-in</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Your edge requires peak performance. Log your mental state before every session to prevent tilt.
                </p>
            </div>
            
            <PsychologyClient 
                initialCheckins={formattedCheckins} 
                hasCheckedInToday={hasCheckedInToday} 
            />
        </div>
    );
}
