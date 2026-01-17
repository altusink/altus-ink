
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setResendKey() {
    console.log("Setting Resend Key...");
    const key = "re_7z1NqRbY_F2y2vS57mRSMmR2RTB7otTTR";
    
    // Check if integration exists
    const { data: existing } = await supabase.from('integrations').select('*').eq('service_id', 'resend').single();
    
    if (existing) {
        const { error } = await supabase
            .from('integrations')
            .update({ 
                config: { apiKey: key },
                is_active: true,
                status: 'connected',
                updated_at: new Date().toISOString()
            })
            .eq('service_id', 'resend');
        if (error) console.error("Update Error:", error);
        else console.log("✅ Resend Key Updated!");
    } else {
        const { error } = await supabase
            .from('integrations')
            .insert({
                service_id: 'resend',
                name: 'Resend Email',
                type: 'communication',
                config: { apiKey: key },
                is_active: true,
                status: 'connected'
            });
        if (error) console.error("Insert Error:", error);
        else console.log("✅ Resend Integration Created & Key Set!");
    }
}

setResendKey();
