"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitEarlyAccess(formData: {
    full_name: string;
    email: string;
    market: string;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('early_access')
        .insert([
            {
                full_name: formData.full_name,
                email: formData.email,
                market: formData.market,
            }
        ]);

    if (error) {
        console.error('Early Access Submission Error:', error);
        
        // Handle unique constraint error (already registered)
        if (error.code === '23505') {
            return { success: false, error: 'This email is already on the waitlist.' };
        }
        
        // Return specific error message for debugging
        return { success: false, error: error.message || 'Something went wrong. Please try again.' };
    }

    return { success: true, data };
}
