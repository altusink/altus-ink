
import { createAdminClient } from '@/lib/supabase/server';

type WhatsAppMessage = {
    phone: string;
    text: string;
}

async function getEvolutionClient() {
    const supabase = createAdminClient();
    try {
        const { data } = await supabase.from('integrations').select('config').eq('service_id', 'evolution_api').single();
        if (data?.config) {
             // @ts-ignore
             return data.config as { baseUrl: string, token: string, instanceName: string };
        }
    } catch(e) {}
    return null;
}

export async function sendWhatsApp({ phone, text }: WhatsAppMessage) {
    const config = await getEvolutionClient();
    if (!config || !config.baseUrl || !config.token) {
        console.warn('⚠️ Evolution API Config missing. WhatsApp skipped.');
        return { success: false };
    }

    // Format Phone (Ensure DDI, remove chars)
    const cleanPhone = phone.replace(/\D/g, ''); 
    // Evolution usually expects number@s.whatsapp.net
    
    try {
        const url = `${config.baseUrl}/message/sendText/${config.instanceName}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.token
            },
            body: JSON.stringify({
                number: cleanPhone,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                },
                textMessage: {
                    text: text
                }
            })
        });
        
        const json = await res.json();
        console.log('📱 WhatsApp Sent:', json);
        return { success: true, data: json };
    } catch (error) {
        console.error('WhatsApp Error:', error);
        return { success: false, error };
    }
}
