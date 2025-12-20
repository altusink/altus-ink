// Server Component
// Force dynamic rendering - REMOVED
// export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, Instagram } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function ContatoPage() {
    // Implicit locale
    const t = await getTranslations('Contact')

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-12 text-center">
                        <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            {t('title')}
                        </span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center hover:bg-white/10 transition-all duration-300">
                            <Phone className="w-8 h-8 text-neon-green mx-auto mb-4" />
                            <h3 className="text-lg font-heading font-bold text-white mb-2">{t('phone')}</h3>
                            <p className="text-text-secondary text-sm">+55 11 98765-4321</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center hover:bg-white/10 transition-all duration-300">
                            <Mail className="w-8 h-8 text-neon-blue mx-auto mb-4" />
                            <h3 className="text-lg font-heading font-bold text-white mb-2">{t('email')}</h3>
                            <p className="text-text-secondary text-sm">contato@altusink.com</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center hover:bg-white/10 transition-all duration-300">
                            <MapPin className="w-8 h-8 text-neon-purple mx-auto mb-4" />
                            <h3 className="text-lg font-heading font-bold text-white mb-2">{t('location')}</h3>
                            <p className="text-text-secondary text-sm">{t('location_value')}</p>
                        </div>

                        <a
                            href="https://instagram.com/danilosantos.tattoo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-6 rounded-3xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30 backdrop-blur-xl text-center hover:scale-105 transition-all duration-300 group"
                        >
                            <Instagram className="w-8 h-8 text-neon-pink mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-heading font-bold text-white mb-2">{t('instagram')}</h3>
                            <p className="text-text-secondary text-sm">@danilosantos.tattoo</p>
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
