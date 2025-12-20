import { createClient as createAdminClient } from '@supabase/supabase-js'

// Use Service Role for background tasks (like Webhooks/API)
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type BookingData = {
    email: string
    name: string
    phone: string
    bookingDate: string
    price: number
}

// 1. Auto-Sync System (Called by Booking API)
export async function syncClientFromBooking(data: BookingData) {
    console.log('🔄 CRM: Syncing client...', data.email)
    
    // Check if client exists
    const { data: existing } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('email', data.email)
        .single()

    if (existing) {
        // Update stats
        const { error } = await supabaseAdmin
            .from('clients')
            .update({
                total_bookings: (existing.total_bookings || 0) + 1,
                total_spent: (existing.total_spent || 0) + data.price,
                last_visit: data.bookingDate,
                phone: data.phone || existing.phone, // Update phone if provided
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            
        if (error) console.error('CRM Update Error:', error)
    } else {
        // Create new
        const { error } = await supabaseAdmin
            .from('clients')
            .insert({
                email: data.email,
                name: data.name,
                phone: data.phone,
                total_bookings: 1,
                total_spent: data.price,
                last_visit: data.bookingDate,
                whatsapp_status: 'untouched',
                tags: ['new']
            })
            
        if (error) console.error('CRM Insert Error:', error)
    }
}
