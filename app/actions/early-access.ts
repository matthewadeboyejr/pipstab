"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { sendWaitlistConfirmationEmail } from "@/lib/email/brevo";

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
        
        await logger.error("Early Access Failed", `Failed to register ${formData.email}`, { error, formData });

        // Handle unique constraint error (already registered)
        if (error.code === '23505') {
            return { success: false, error: 'This email is already on the waitlist.' };
        }
        
        // Return specific error message for debugging
        return { success: false, error: error.message || 'Something went wrong. Please try again.' };
    }

    // Dispatch automated waitlist confirmation email via Brevo
    try {
        await sendWaitlistConfirmationEmail({
            email: formData.email,
            fullName: formData.full_name,
        });
    } catch (emailErr) {
        console.warn("Could not dispatch waitlist confirmation email:", emailErr);
    }

    await logger.info("New Early Access Signup", `${formData.full_name} (${formData.email}) joined the ${formData.market} waitlist.`, { market: formData.market });

    return { success: true, data };
}

