import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
    return NextResponse.json({ error: 'Setup is disabled in production.' }, { status: 403 })

    /* DISABLED FOR PRODUCTION SAFETY
    const supabaseAdmin = createAdminClient()
    try {
        const results = {
            artist: null as any,
            admin: null as any,
            error: null as any
        }

        // 1. Create Artist 'Danilo Santos'
        const { data: artist, error: artistError } = await supabaseAdmin
            .from('artists')
            .upsert({
                stage_name: 'Danilo Santos',
                bio: 'Especialista em Realismo e Fineline. CEO da Altus Ink.',
                specialties: ['Realismo', 'Fineline', 'Blackwork'],
                is_active: true,
                slug: 'danilo-santos', // IMPORTANT for the URL
                // Using a placeholder UUID if you want to enforce one, or let DB generate
                // For "Agendar com Danilo" consistency, we might want to capture this ID
            }, { onConflict: 'slug' })
            .select()
            .single()

        results.artist = artist || artistError

        // 2. Create Admin User
        // Note: createUser only works if you have service_role key
        const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: 'admin@altusink.com', // Using a formal email
            email_confirm: true,
            password: 'jander123',
            user_metadata: {
                role: 'CEO',
                full_name: 'Jander (Admin)'
            }
        })

        if (userError?.message?.includes('already has been registered')) {
            results.admin = 'User already exists'
        } else {
            results.admin = user || userError
        }

        return NextResponse.json({ success: true, details: results })
        }
    */
    /* DISABLED FOR PRODUCTION SAFETY
    // ... (code)
    */
    /*
    } catch (error) {
        return NextResponse.json({ success: false, error: error }, { status: 500 })
    }
    */
}
