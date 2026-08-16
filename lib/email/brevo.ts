/**
 * Brevo (Sendinblue) Transactional Email Dispatcher
 */

export interface SendInviteParams {
    email: string;
    fullName: string;
    appUrl?: string;
}

export async function sendEarlyAccessInviteEmail({
    email,
    fullName,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://piptab.com",
}: SendInviteParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@pipstab.com";
    const senderName = process.env.BREVO_SENDER_NAME || "PipTab Team";

    if (!apiKey) {
        console.warn("BREVO_API_KEY is not configured in environment variables.");
        return {
            success: false,
            error: "BREVO_API_KEY not configured. Add it to .env.local to enable live email delivery.",
        };
    }

    const signUpUrl = `${appUrl}/auth/sign-up?email=${encodeURIComponent(email)}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PipTab Early Access</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070A0F; color: #E5E7EB; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #0E131F; border: 1px solid #1E293B; border-radius: 16px; padding: 36px 30px; }
    .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.1); color: #10B981; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: 20px; }
    h1 { color: #FFFFFF; font-size: 22px; font-weight: 800; margin-top: 0; line-height: 1.3; }
    p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 16px 0; }
    .feature-box { background-color: #141B2D; border: 1px solid #1E293B; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .feature-item { color: #E2E8F0; font-size: 13px; margin: 10px 0; display: flex; align-items: center; }
    .btn { display: inline-block; background-color: #10B981; color: #070A0F; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin: 24px 0 16px 0; text-align: center; }
    .footer { color: #64748B; font-size: 11px; text-align: center; margin-top: 24px; }
    .highlight { color: #10B981; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <span class="badge">🚀 Early Access Approved</span>
      <h1>Welcome to PipTab, ${fullName}!</h1>
      <p>
        Thank you for being one of our earliest supporters. Your request for early access has been approved, and your private beta access is now active.
      </p>
      
      <div class="feature-box">
        <p style="margin-top:0; color:#FFFFFF; font-weight:700; font-size:13px;">What you can explore in this early release:</p>
        <div class="feature-item">📖 <strong>Trade Journaling & Analytics</strong>: Structured logging of setups, execution rules, emotions, and risk-to-reward ratios to find your true edge.</div>
        <div class="feature-item">🌐 <strong>Global Macro Outlook & Calendar</strong>: Real-time central bank policy matrices, rate spreads, news sentiment, and economic release deviation playbooks.</div>
        <div class="feature-item">🧠 <strong>AI Performance Auditor</strong>: Objective performance audits analyzing your trade history to expose discipline leaks and risk mismanagement.</div>
        <div class="feature-item">🎯 <strong>Psychology & Mindset Check-in</strong>: Daily pre-session routines and rule tracking to eliminate tilt and protect your capital.</div>
      </div>

      <p style="font-size:12px; color:#F59E0B; background-color: rgba(245, 158, 11, 0.08); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2);">
        ⚠️ <strong>Early Access Preview</strong>: PipTab is currently in active early beta development. If you experience any quirks or have feature requests, you can submit feedback directly in the app to help shape the platform.
      </p>

      <center>
        <a href="${signUpUrl}" class="btn">Claim Beta Access & Create Account →</a>
      </center>

      <p style="font-size:12px; color:#64748B; text-align:center;">
        Direct link: <a href="${signUpUrl}" style="color:#10B981; text-decoration:none;">${signUpUrl}</a>
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} PipTab Analytics. All rights reserved.<br>Built for disciplined, data-driven traders.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail,
                },
                to: [
                    {
                        email: email,
                        name: fullName,
                    },
                ],
                subject: "You're Invited: Exclusive Early Access to PipTab 🚀",
                htmlContent: htmlContent,
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Brevo API Error:", errData);
            return {
                success: false,
                error: errData.message || `Brevo returned status ${response.status}`,
            };
        }

        const data = await response.json();
        return {
            success: true,
            messageId: data.messageId,
        };
    } catch (e: any) {
        console.error("Brevo Dispatch Network Error:", e);
        return {
            success: false,
            error: e.message || "Failed to contact Brevo SMTP API",
        };
    }
}

export interface BroadcastEmailParams {
    recipients: Array<{ email: string; name?: string }>;
    subject: string;
    headline: string;
    messageBody: string;
    actionUrl?: string;
    actionLabel?: string;
}

export async function sendCustomBroadcastEmail({
    recipients,
    subject,
    headline,
    messageBody,
    actionUrl = "https://piptab.com",
    actionLabel = "Open PipTab Platform",
}: BroadcastEmailParams): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@pipstab.com";
    const senderName = process.env.BREVO_SENDER_NAME || "PipTab Announcements";

    if (!apiKey) {
        return {
            success: false,
            sentCount: 0,
            errors: ["BREVO_API_KEY is not configured in .env.local"],
        };
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Format HTML email
    const generateHtml = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070A0F; color: #E5E7EB; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #0E131F; border: 1px solid #1E293B; border-radius: 16px; padding: 36px 30px; }
    .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.1); color: #10B981; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: 20px; }
    h1 { color: #FFFFFF; font-size: 22px; font-weight: 800; margin-top: 0; line-height: 1.3; }
    p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 16px 0; }
    .content-box { background-color: #141B2D; border: 1px solid #1E293B; border-radius: 12px; padding: 20px; margin: 20px 0; font-size: 14px; color: #E2E8F0; line-height: 1.6; white-space: pre-line; }
    .btn { display: inline-block; background-color: #10B981; color: #070A0F; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin: 20px 0; text-align: center; }
    .footer { color: #64748B; font-size: 11px; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <span class="badge">📢 PipTab Platform Update</span>
      <h1>${headline}</h1>
      <p>Hello ${name || "Trader"},</p>
      
      <div class="content-box">
        ${messageBody}
      </div>

      <div style="text-align: center;">
        <a href="${actionUrl}" class="btn">${actionLabel} &rarr;</a>
      </div>

      <div class="footer">
        <p>Sent by PipTab Institutional Trading Analytics</p>
        <p>© ${new Date().getFullYear()} PipTab. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Process in batches
    for (const recipient of recipients) {
        try {
            const res = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": apiKey,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    sender: { name: senderName, email: senderEmail },
                    to: [{ email: recipient.email, name: recipient.name || "Trader" }],
                    subject: subject,
                    htmlContent: generateHtml(recipient.name || "Trader"),
                }),
            });

            if (res.ok) {
                sentCount++;
            } else {
                const err = await res.json();
                errors.push(`${recipient.email}: ${err.message || res.statusText}`);
            }
        } catch (err: any) {
            errors.push(`${recipient.email}: ${err.message}`);
        }
    }

    return {
        success: sentCount > 0,
        sentCount,
        errors,
    };
}

export async function getBrevoAccountInfo(): Promise<{ plan?: string; creditsRemaining?: number; creditsTotal?: number; error?: string }> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return { error: "BREVO_API_KEY not configured" };

    try {
        const res = await fetch("https://api.brevo.com/v3/account", {
            headers: {
                "api-key": apiKey,
                "Accept": "application/json",
            },
        });
        if (!res.ok) return { error: `Brevo returned status ${res.status}` };
        const data = await res.json();
        const plan = data.plan?.[0];
        return {
            plan: plan?.type || "Free Tier",
            creditsRemaining: plan?.credits || 300,
            creditsTotal: 300,
        };
    } catch (e: any) {
        return { error: e.message };
    }
}
