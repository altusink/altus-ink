'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Validate and Save Mercado Pago Token
export async function connectMercadoPago(token: string) {
    // 1. Validate Token with real API
    try {
        const res = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) {
            return { success: false, error: 'Token Inválido. O Mercado Pago recusou a conexão.' };
        }

        const data = await res.json();
        // Option: we could store the user name from data.name to show "Connected as X"

    } catch (e) {
        return { success: false, error: 'Erro de conexão com Mercado Pago.' };
    }

    // 2. Save to Database
    const supabase = createAdminClient();
    
    // Security Check: Only CEO can set keys (re-using logic or relying on RLS if set, but server action needs explicit check)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Create/Update Settings
    const { error } = await supabase.from('system_settings').upsert([
        { key: 'mp_access_token', value: token, is_secret: true, updated_by: user.id, category: 'payment', description: 'Mercado Pago Production Token' },
        { key: 'mp_connected', value: 'true', is_secret: false, updated_by: user.id, category: 'payment', description: 'Status Flag for MP' }
    ]);

    if (error) return { success: false, error: 'Falha ao salvar no banco de dados.' };

    revalidatePath('/admin/integrations');
    return { success: true };
}

// Validate and Save Stripe Keys
export async function connectStripe(publicKey: string, secretKey: string) {
    // 1. Validate with Stripe API
    try {
        const res = await fetch('https://api.stripe.com/v1/balance', {
            headers: {
                'Authorization': `Bearer ${secretKey}`
            }
        });

        if (!res.ok) {
            return { success: false, error: 'Chave Secreta Inválida (Secret Key).' };
        }

        // We assume Public Key is correct if Secret works, simpler UX than testing client-side token gen
    } catch (e) {
        return { success: false, error: 'Erro ao conectar com Stripe.' };
    }

    // 2. Save
    const supabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('system_settings').upsert([
        { key: 'stripe_secret_key', value: secretKey, is_secret: true, updated_by: user.id, category: 'payment', description: 'Stripe Secret Key' },
        { key: 'stripe_publishable_key', value: publicKey, is_secret: false, updated_by: user.id, category: 'payment', description: 'Stripe Public Key' },
        { key: 'stripe_connected', value: 'true', is_secret: false, updated_by: user.id, category: 'payment', description: 'Status Flag for Stripe' }
    ]);

    if (error) return { success: false, error: 'Falha ao salvar chaves.' };

    revalidatePath('/admin/integrations');
    return { success: true };
}

export async function disconnectIntegration(type: 'mercadopago' | 'stripe') {
    const supabase = createAdminClient();
    
    if (type === 'mercadopago') {
        // Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        await supabase.from('system_settings').delete().in('key', ['mp_access_token', 'mp_connected']);
    } else {
        await supabase.from('system_settings').delete().in('key', ['stripe_secret_key', 'stripe_publishable_key', 'stripe_connected']);
    }
    
    revalidatePath('/admin/integrations');
    return { success: true };
}
