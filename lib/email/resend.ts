import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

// Removed static initialization
// const resend = new Resend(process.env.RESEND_API_KEY);

type EmailType = 'welcome' | 'confirmation' | 'reminder';

type EmailData = {
    to: string;
    type: EmailType;
    variables: {
        name: string;
        artist?: string;
        date?: string;
        [key: string]: any;
    };
};

async function getResendClient() {
    let apiKey = process.env.RESEND_API_KEY;

    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('integrations')
            .select('config, is_active')
            .eq('service_id', 'resend')
            .single();

        if (data?.is_active && data.config) {
             // @ts-ignore
             if (data.config.apiKey) apiKey = data.config.apiKey;
        }
    } catch (e) {}

    // Fallback or Null
    if (!apiKey) return null;
    return new Resend(apiKey);
}

export async function sendEmail({ to, type, variables }: EmailData) {
    const supabase = await createClient();
    const resend = await getResendClient();

    if (!resend) {
        console.warn('⚠️ Resend Key missing. Email skipped.');
        return { success: false, error: 'Configuration missing' };
    }

    // 1. Fetch Template
    const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', type)
        .eq('active', true)
        .single();

    if (!template) {
        console.warn(`Email template '${type}' not found or inactive.`);
        return { success: false, error: 'Template missing' };
    }

    // 2. Replace Variables
    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
    });

    // 3. Send via Resend
    try {
        const { data, error } = await resend.emails.send({
            from: 'Altus Ink <noreply@altusink.com>', // Or config var
            to: [to],
            text: body.replace(/<[^>]*>?/gm, ''), // Simple strip tags for text version
            subject: subject,
            html: body,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Email Send Exception:', err);
        return { success: false, error: err };
    }
}
