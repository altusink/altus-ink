// Server Component
// Force dynamic rendering - REMOVED
// export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getTranslations } from 'next-intl/server'

export default async function SobrePage() {
    // Implicit locale
    const t = await getTranslations('About')

    return (
        <div className="min-h-screen">
            <Navbar />

            <div className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-center">
                        {t('title_start')}{' '}
                        <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            {t('title_highlight')}
                        </span>
                    </h1>

                    <div className="prose prose-invert max-w-none">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                            <h2 className="text-2xl font-heading font-bold text-white mb-4">{t('history_title')}</h2>
                            <p className="text-text-secondary leading-relaxed">
                                {t('history_text')}
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <h2 className="text-2xl font-heading font-bold text-white mb-4">{t('mission_title')}</h2>
                            <p className="text-text-secondary leading-relaxed">
                                {t('mission_text')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
