// Server Component
// export const dynamic = 'force-dynamic'

import { Link } from '@/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { TOUR_SCHEDULE } from '@/config/tour-schedule'

// ...

export default function DaniloSantosPage() {
    // Determine current location
    const today = new Date().toISOString().split('T')[0]
    const currentSegment = TOUR_SCHEDULE.find(s => today >= s.start_date && today <= s.end_date)
    const currentLocation = currentSegment 
        ? `${currentSegment.city_name}, ${currentSegment.country_code}` 
        : 'São Paulo, BR'

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 via-transparent to-neon-blue/5 pointer-events-none" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* ... Artist Info (Unchanged lines 29-71) ... */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30 mb-6">
                                <Award className="w-4 h-4 text-neon-green" />
                                <span className="text-sm font-medium text-neon-green">Artista Principal</span>
                            </div>

                            <h1 className="text-6xl md:text-7xl font-heading font-bold mb-6">
                                <span className="bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent">
                                    Danilo Santos
                                </span>
                            </h1>

                            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                                Ex-policial da menor cidade do Brasil, Danilo Santos deixou a farda para seguir seu sonho de ser artista. Com mais de 7 anos de experiência e 15.000+ tatuagens realizadas, hoje é referência internacional em excelência artística, levando sua arte pelo Brasil e pelo mundo.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                    <div className="text-3xl font-bold text-neon-green mb-1">7+</div>
                                    <div className="text-sm text-text-muted">Anos</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                    <div className="text-3xl font-bold text-neon-blue mb-1">15K+</div>
                                    <div className="text-sm text-text-muted">Tatuagens</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <span className="text-3xl font-bold text-neon-purple">5.0</span>
                                        <Star className="w-5 h-5 text-neon-purple fill-neon-purple" />
                                    </div>
                                    <div className="text-sm text-text-muted">Avaliação</div>
                                </div>
                            </div>

                            <Link
                                href="/agendar"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark font-bold text-lg hover:shadow-neon-green transition-all duration-300 hover:scale-105"
                            >
                                <Calendar className="w-5 h-5" />
                                Agendar com Danilo
                            </Link>
                        </div>

                        {/* Artist Photo Placeholder */}
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border border-white/10 backdrop-blur-xl overflow-hidden flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-neon-green/30 to-neon-blue/30 border-4 border-neon-green/50 flex items-center justify-center">
                                        <span className="text-6xl font-heading font-bold text-neon-green">DS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 p-6 rounded-2xl bg-bg-card border border-white/10 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-neon-green" />
                                    <div>
                                        <div className="text-sm text-text-muted">Localização Atual</div>
                                        <div className="font-bold text-text-primary">{currentLocation}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolio Section (Client Component) */}
            <ArtistPortfolio />

            <Footer />
        </div>
    )
}
