'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 2. Admin Actions (Called by UI)
export async function updateClientStatus(clientId: string, status: string) {
    const supabase = await createClient()
    
    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('clients')
        .update({ whatsapp_status: status })
        .eq('id', clientId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/admin/clients')
    return { success: true }
}

export async function updateClientNotes(clientId: string, notes: string) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('clients')
        .update({ notes })
        .eq('id', clientId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/admin/clients')
    return { success: true }
}

// New: Update Tags
export async function updateClientTags(clientId: string, tags: string[]) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('clients')
        .update({ tags })
        .eq('id', clientId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/admin/clients')
    return { success: true }
}
