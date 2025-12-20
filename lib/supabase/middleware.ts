import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        // Create client exclusively to check/refresh session
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Protected Routes Logic
        // Protected Routes Logic
        const path = request.nextUrl.pathname
        const isAdminRoute = path.includes('/admin')

        if (isAdminRoute) {
            // 1. Auth Check
            if (!user) {
                const locale = path.split('/')[1]?.length === 2 ? path.split('/')[1] : 'pt'
                const url = request.nextUrl.clone()
                url.pathname = `/${locale}/login`
                return NextResponse.redirect(url)
            }

            // 2. Role Check (Fetch from public.users - using same client)
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role?.toUpperCase() || 'USER'

            // 3. Permission Logic
            // CEO Only Routes
            if (path.includes('/admin/integrations') || path.includes('/admin/settings')) {
                if (role !== 'CEO') {
                    const url = request.nextUrl.clone()
                    // Redirect to safe admin root
                    const locale = path.split('/')[1]?.length === 2 ? path.split('/')[1] : 'pt'
                    url.pathname = `/${locale}/admin`
                    return NextResponse.redirect(url)
                }
            }
        }

    } catch (e) {
        // If Supabase fails (e.g. missing env vars), allow request to proceed
        // The page component will handle the error or show content
        console.error('Middleware Supabase Error:', e)
    }


    return supabaseResponse
}
