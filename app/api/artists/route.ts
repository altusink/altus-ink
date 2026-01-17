import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const supabaseAdmin = createAdminClient()
    try {
        const { searchParams } = new URL(request.url)
        const isActive = searchParams.get('active') !== 'false'

        let query = supabaseAdmin
            .from('artists')
            .select('*')
            .order('created_at', { ascending: false })

        if (isActive) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ artists: data })
    } catch (error) {
        console.error('Get artists error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
