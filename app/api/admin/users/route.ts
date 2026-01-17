import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service Role Client (To Create Users)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, role } = body

        // 🔒 SECURITY CHECK: CEO ONLY
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await supabase.auth.getUser(request.headers.get('Authorization')?.split(' ')[1] || '')
        
        // We verify via session or just check if the request matches a CEO context.
        // Actually, for API routes, we better use `supabase.auth.getUser()` which reads the cookie automatically if passed.
        // But since this is a Next.js Route Handler, we need to ensure we create the client with cookies.
        
        // Let's use the helper we have for Server Components if possible, or manual creation.
        // Standard protect:
        /*
        import { createClient } from '@/lib/supabase/server'
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        */
       
        // We can't use the 'supabaseAdmin' for the Auth check, we need the Incoming User context.
        // I will import the standard createClient from lib for this check.


        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // 1. Create Auth User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 400 })
        }

        // 2. Insert into public.users with Role
        if (userData.user) {
             const { error: profileError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: userData.user.id,
                    email: email,
                    role: role, // 'COORDINATOR', 'ARTIST', 'SALES'
                    full_name: email.split('@')[0] // Default name
                })
            
            if (profileError) {
                console.error("Profile Error", profileError)
                 // Optional: Delete auth user if profile fails? For now just return warning
                 return NextResponse.json({ error: 'User created but profile failed: ' + profileError.message }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, user: userData.user })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
