import { Resend } from 'resend';

// Helper to get client (checks API Key first)
// User must provide RESEND_API_KEY in .env.local
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ RESEND_API_KEY missing. Emails will not be sent.');
        return null;
    }
    return new Resend(apiKey);
}

export async function sendEmail({
    to,
    subject,
    html
}: {
    to: string;
    subject: string;
    html: string;
}) {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'missing_api_key' };

    try {
        const data = await resend.emails.send({
            from: 'Altus Ink <booking@altusink.com>', // User needs to verify domain or use 'onboarding@resend.dev' for testing
            to: [to],
            subject: subject,
            html: html,
        });
        console.log(`📧 Email sent to ${to}:`, data.id);
        return { success: true, id: data.id };
    } catch (error) {
        console.error('❌ Email Failed:', error);
        return { success: false, error };
    }
}
