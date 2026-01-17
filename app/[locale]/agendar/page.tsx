import BookingForm from '@/components/BookingForm'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { getSystemSettings } from '@/app/actions/settings'
import { Calendar, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function BookingPage() {
    let artists = []

    try {
        const supabase = createClient()
        const { data } = await supabase.from('artists').select('*')
        artists = data || []
    } catch (e) {
        console.error('Exception fetching artists for booking:', e)
        artists = []
    }

    return (
        <div className="min-h-screen bg-bg-dark relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent pointer-events-none" />

            <Navbar />

            <div className="pt-32 pb-20 px-4 relative z-10">
                <div className="container mx-auto">
                    {/* Header logic moved to BookingForm or removed for simplicity/cleanliness, let BookingForm handle its own title if needed, or pass simple string */}
                    <div className="min-h-[600px] flex items-center justify-center">
                        <Suspense fallback={<div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-neon-green w-10 h-10" /></div>}>
                            <BookingForm 
                                artists={artists || []} 
                                stripePublicKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
