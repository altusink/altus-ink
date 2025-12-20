import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

// Dynamic Stripe Constructor
// Usage: const stripe = await getStripe()
export async function getStripe() {
    let secretKey = process.env.STRIPE_SECRET_KEY;

    // Try fetching from DB if not in Env (or to override)
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'stripe_secret_key')
            .single();
        
        if (data?.value) {
            secretKey = data.value;
        }
    } catch (e) {
        // Fallback to env or fail gracefully
        console.warn('Failed to fetch Stripe key from DB, using Env fallback.');
    }

    if (!secretKey) {
        throw new Error('Stripe Secret Key not configured (DB or Env).');
    }

    return new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia',
        typescript: true,
    })
}

// Keep the static one for edge cases (optional, but better to migrate all usage)
// export const stripe = ... (Removed to force usage of async getStripe)
