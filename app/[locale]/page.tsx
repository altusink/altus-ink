import { Link } from '@/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Star, Calendar, Award, Users, Sparkles, Zap, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Force dynamic rendering - REMOVED
// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export default function HomePage() {
    const tHero = useTranslations('Hero')
    const tArtists = useTranslations('ArtistsSection')
    const tFeatures = useTranslations('Features')
    const tCTA = useTranslations('CTA')

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4">
                {/* Animated Grid Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-dark/50 to-bg-dark" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto max-w-6xl text-center">
                    <div className="animate-fade-in">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 md:mb-8">
                            <Sparkles className="w-4 h-4 text-neon-green" />
                            <span className="text-xs md:text-sm text-text-secondary">{tHero('badge')}</span>
                        </div>

                        {/* Logo Image with Gradient Mask */}
                        <div className="relative w-full max-w-[500px] h-[80px] md:h-[140px] mx-auto mb-6">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-neon-green via-neon-blue to-neon-green mask-brand-logo"
                            />
                        </div>

                        <p className="text-xl sm:text-2xl md:text-3xl text-white mb-3 md:mb-4 max-w-4xl mx-auto leading-tight font-semibold px-4">
                            {tHero('title_start')}{' '}
                            <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                                {tHero('title_highlight')}
                            </span>
                        </p>

                        <p className="text-base md:text-lg text-text-secondary mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                            {tHero('subtitle')}
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-16 px-4">
                            <Link
                                href="/agendar"
                                className="w-full sm:w-auto group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark rounded-xl font-semibold text-base md:text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-neon-green"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                                    {tHero('cta_book')}
                                </span>
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto px-4">
                            {[
                                { value: '15K+', label: tHero('stats.tattoos'), gradient: 'from-neon-green to-neon-blue' },
                                { value: '5.0', label: tHero('stats.rating'), gradient: 'from-neon-blue to-neon-purple' },
                                { value: '7+', label: tHero('stats.years'), gradient: 'from-neon-purple to-neon-pink' },
                                { value: '1', label: tHero('stats.artists'), gradient: 'from-neon-pink to-neon-green' },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="group relative p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-neon-green transition-all duration-300 hover:scale-105"
                                >
                                    <div className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 md:mb-2`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-xs md:text-sm text-text-muted">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Artist Section */}
            <section id="artists" className="py-16 md:py-32 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent" />

                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="text-center mb-12 md:mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4 md:mb-6">
                            <Award className="w-4 h-4 text-neon-green" />
                            <span className="text-xs md:text-sm text-text-secondary">{tArtists('badge')}</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 px-4">
                            <span className="bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                                {tArtists('title_start')} {tArtists('title_highlight')}
                            </span>
                        </h2>
                        <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto px-4">
                            {tArtists('subtitle')}
                        </p>
                    </div>

                    {/* Danilo Santos Card */}
                    <Link
                        href="/artistas/danilo-santos"
                        className="block group relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-blue opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-500" />

                        <div className="relative aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 mb-6 overflow-hidden border border-neon-green/30">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Users className="w-32 h-32 md:w-48 md:h-48 text-neon-green opacity-50 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2 text-center">
                            Danilo Santos
                        </h3>
                        <p className="text-sm md:text-base font-semibold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent mb-4 text-center">
                            {tArtists('card.specialty')}
                        </p>
                        <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-6 text-center px-4">
                            {tArtists('card.description')}
                        </p>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                <div className="text-2xl md:text-3xl font-bold text-neon-green mb-1">7+</div>
                                <div className="text-xs md:text-sm text-text-muted">{tHero('stats.years')}</div>
                            </div>
                            <div className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                <div className="text-2xl md:text-3xl font-bold text-neon-blue mb-1">15K+</div>
                                <div className="text-xs md:text-sm text-text-muted">{tHero('stats.tattoos')}</div>
                            </div>
                        </div>

                        <div className="w-full py-3 md:py-4 rounded-xl bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark font-semibold text-center hover:shadow-lg transition-all duration-300 text-sm md:text-base">
                            {tArtists('card.view_portfolio')}
                        </div>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-32 px-4 relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 px-4">
                            <span className="bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                                {tFeatures('title_start')} {tFeatures('title_highlight')}
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
                                title: tFeatures('items.smart_booking.title'),
                                description: tFeatures('items.smart_booking.description'),
                                gradient: 'from-neon-green to-neon-blue',
                            },
                            {
                                icon: <Shield className="w-6 h-6 md:w-8 md:h-8" />,
                                title: tFeatures('items.secure_payment.title'),
                                description: tFeatures('items.secure_payment.description'),
                                gradient: 'from-neon-blue to-neon-purple',
                            },
                            {
                                icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8" />,
                                title: tFeatures('items.full_support.title'),
                                description: tFeatures('items.full_support.description'),
                                gradient: 'from-neon-purple to-neon-pink',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                            >
                                <div className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-3 md:mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-32 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent" />

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-neon-green/10 via-neon-blue/10 to-neon-purple/10 border border-white/10 backdrop-blur-xl">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 px-4">
                            <span className="bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                                {tCTA('title_start')} {tCTA('title_highlight')}
                            </span>
                        </h2>
                        <p className="text-base md:text-xl text-text-secondary mb-8 md:mb-12 max-w-2xl mx-auto px-4">
                            {tCTA('subtitle')}
                        </p>
                        <Link
                            href="/agendar"
                            className="inline-flex group relative px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-neon-green to-neon-blue text-bg-dark rounded-xl font-bold text-base md:text-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-neon-green"
                        >
                            <span className="relative z-10 flex items-center gap-2 justify-center">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                                {tCTA('button')}
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
