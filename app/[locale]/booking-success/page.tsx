import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, MapPin, ExternalLink, Info } from 'lucide-react'
import { Link } from '@/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/client'

// Since this is a server component handling dynamic data, we re-instantiate supabase for server context if needed,
// but for simplicity in this specific "page" environment without complex auth wrappers, 
// we can use client-side fetching or standard server fetching.
// Given it's marked 'use client' or default server? It's server by default.
// We'll use the server client.
import { createClient as createServerClient } from '@/lib/supabase/server'

export default async function BookingSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ bookingId: string }>
}) {
    const { bookingId } = await searchParams
    const t = await getTranslations('Booking.success')
    const supabase = await createServerClient()

    // 1. Fetch Booking to get City
    let cityName = ''
    if (bookingId) {
        const { data: booking } = await supabase
            .from('bookings')
            .select('city_id, city_name') // Assuming city_name is stored or derived
            .eq('id', bookingId)
            .single()
        
        // Fallback: If city_name not stored directly, might need to infer from tour_segments logic or just use what we have.
        // Assuming 'city_name' or 'city_id' stores the name (as per BookingForm logic).
        if (booking) {
            cityName = booking.city_name || booking.city_id
        }
    }

    // 2. Fetch Location Info
    let locationInfo = null
    if (cityName) {
        const { data } = await supabase
            .from('tour_locations')
            .select('*')
            .eq('city_name', cityName)
            .single()
        locationInfo = data
    }

    return (
        <div className="min-h-screen bg-bg-dark">
            <Navbar />
            <div className="pt-40 pb-20 px-4 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center backdrop-blur-xl shadow-2xl">
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-neon-green/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,157,0.3)]">
                            <CheckCircle className="w-12 h-12 text-neon-green" />
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-heading font-bold text-white mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-text-muted mb-8 max-w-md mx-auto">
                        {t('text')}
                    </p>

                    {/* LOCATION CARD */}
                    {locationInfo && (
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 text-left animate-fade-in relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 select-none pointer-events-none">
                                <MapPin className="w-24 h-24 text-white/5" />
                            </div>
                            
                            <h3 className="text-neon-green font-bold text-lg mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" /> Local do Procedimento
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-sm text-text-muted uppercase font-bold tracking-wider">Cidade</p>
                                    <p className="text-white text-lg font-medium">{locationInfo.city_name}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-text-muted uppercase font-bold tracking-wider">Endereço</p>
                                    <p className="text-white text-lg">{locationInfo.address_line1}</p>
                                    {locationInfo.address_line2 && (
                                        <p className="text-text-secondary">{locationInfo.address_line2}</p>
                                    )}
                                </div>

                                {locationInfo.instructions && (
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-sm text-text-muted uppercase font-bold tracking-wider flex items-center gap-2 mb-1">
                                            <Info className="w-3 h-3" /> Instruções
                                        </p>
                                        <p className="text-white/80 text-sm whitespace-pre-wrap">{locationInfo.instructions}</p>
                                    </div>
                                )}

                                {locationInfo.maps_link && (
                                    <a 
                                        href={locationInfo.maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-neon-blue hover:text-white transition-colors text-sm font-bold mt-2"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Abrir no Google Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {!locationInfo && bookingId && (
                         <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-sm text-text-muted">
                            Os detalhes do endereço serão enviados para seu e-mail e WhatsApp em breve.
                         </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-neon-green text-bg-dark font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-neon-green/20"
                        >
                            {t('return_home')}
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
