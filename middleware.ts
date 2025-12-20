import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Create the Intl Middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // 1. Update Supabase Session
    const response = await updateSession(request);

    // 2. Run Intl Middleware (passing the response/request)
    const intlResponse = intlMiddleware(request);

    // Merge cookies from Supabase response to Intl response
    if (response?.headers.has('set-cookie')) {
        const cookies = response.headers.getSetCookie();
        cookies.forEach(cookie => {
            intlResponse.headers.append('set-cookie', cookie);
        })
    }

    return intlResponse;
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(pt|en|nl|fr|ru|de|it|es)/:path*']
};
