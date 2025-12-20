'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSystemSettings() {
    const supabase = createAdminClient()

    // Fetch all public settings
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_secret', false)

    if (error) {
        console.error('Error fetching settings:', error)
        return []
    }

    return data
}

export async function updateSystemSetting(key: string, value: string) {
    const supabase = createAdminClient()

    // Verify CEO Role (Security Double Check)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify Role Query
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'CEO') {
        return { error: 'Unauthorized: CEO Only' }
    }

    const { error } = await supabase
        .from('system_settings')
        .upsert({
            key,
            value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        })

    if (error) {
        console.error('Error updating setting:', error)
        return { error: 'Failed to update' }
    }

    revalidatePath('/admin/settings')
    revalidatePath('/admin/sales')
    revalidatePath('/admin/integrations')

    return { success: true }
}

export async function getSalesGoal() {
    const settings = await getSystemSettings()
    const goal = settings.find(s => s.key === 'monthly_sales_goal')
    return Number(goal?.value) || 50000 // Default 50k
}
