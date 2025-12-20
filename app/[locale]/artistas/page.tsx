import { createAdminClient } from '@/lib/supabase/server'
import ArtistCard from '@/components/ArtistCard'
import AuroraBackground from '@/components/AuroraBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

// Force dynamic rendering - REMOVED
// Force dynamic rendering to ensure fresh artist data from DB
export const dynamic = 'force-dynamic'

export default async function ArtistsPage() {
    let artists = null

    try {
        const supabaseAdmin = createAdminClient()
        const { data, error } = await supabaseAdmin
            .from('artists')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching artists:', error)
        } else {
            artists = data
        }
    } catch (e) {
        console.error('Exception fetching artists (likely missing env vars):', e)
    }

    return (
        <div className="min-h-screen bg-bg-dark text-white">
            <AuroraBackground />
            <Navbar />

            <div className="pt-32 pb-20 px-4">
                <div className="container mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
                            Nossos <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">Artistas</span>
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            Conheça nossa equipe de especialistas de classe mundial.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {artists?.map((artist) => (
                            <ArtistCard key={artist.id} artist={artist} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {(!artists || artists.length === 0) && (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 mx-auto max-w-xl">
                            <p className="text-text-muted text-lg mb-2">
                                No artists found.
                            </p>
                            <p className="text-xs text-red-400">
                                (System note: Check Supabase Environment Variables)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
