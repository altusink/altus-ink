'use server'

import { createClient } from '@/lib/supabase/server' // Public Client (RLS managed)
import { createAdminClient } from '@/lib/supabase/server' // Admin Client
import { revalidatePath } from 'next/cache'

export async function getBookingForConsent(bookingId: string) {
    const supabase = createAdminClient()
    
    // Fetch Booking + Artist info
    const { data: booking, error } = await supabase
        .from('bookings')
        .select('*, artist:artist_id(name)') // Join artist name? simpler to just get booking
        .eq('id', bookingId)
        .single()
    
    if (error || !booking) return null

    // Check if already signed
    const { data: existing } = await supabase
        .from('consent_forms')
        .select('id, signed_at')
        .eq('booking_id', bookingId)
        .single()

    return {
        booking,
        isSigned: !!existing,
        signedAt: existing?.signed_at
    }
}

export async function saveConsentSignature(
    bookingId: string, 
    signatureBase64: string, 
    healthData: any,
    metadata: { ip: string, userAgent: string }
) {
    const supabase = createAdminClient() // Needed for insert if RLS is strict public

    const { error } = await supabase.from('consent_forms').insert({
        booking_id: bookingId,
        signature_base64: signatureBase64,
        health_data: healthData,
        ip_address: metadata.ip,
        user_agent: metadata.userAgent,
        signed_at: new Date().toISOString()
    })

    if (error) {
        console.error('Consent Save Error:', error)
        return { success: false, error: 'Database Error' }
    }
    
    // Update Booking Status ? Optional, maybe just keep it confirmed.
    // Ensure booking is confirmed if not?
    
    revalidatePath(`/consent/${bookingId}`)
    return { success: true }
}
