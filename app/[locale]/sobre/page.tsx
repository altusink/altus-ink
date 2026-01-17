// Server Component
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getTranslations } from 'next-intl/server'
import { ShieldCheck, Heart, Globe, Award, Zap, Users } from 'lucide-react'

export default async function SobrePage() {
    // Implicit locale
    const t = await getTranslations('About')

    const values = [
        {
            icon: <Globe className="w-8 h-8 text-neon-blue" />,
            title: t('history_title'),
            text: t('history_text'),
            gradient: "from-neon-blue/20 to-purple-500/20",
            border: "border-neon-blue/30"
        },
        {
            icon: <Heart className="w-8 h-8 text-neon-pink" />,
            title: t('mission_title'),
            text: t('mission_text'),
            gradient: "from-neon-pink/20 to-red-500/20",
            border: "border-neon-pink/30"
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-neon-green" />,
            title: t('security_title'),
            text: t('security_text'),
            gradient: "from-neon-green/20 to-emerald-500/20",
            border: "border-neon-green/30"
        },
         {
            icon: <Zap className="w-8 h-8 text-yellow-400" />,
            title: t('process_title'),
            text: t('process_text'),
            gradient: "from-yellow-400/20 to-orange-500/20",
            border: "border-yellow-400/30"
        }
    ]

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-black pointer-events-none" />
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Award className="w-4 h-4 text-neon-green" />
                        <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">Desde 2017</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-heading font-bold mb-8 leading-tight">
                        {t('title_start')}{' '}
                        <span className="bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple bg-clip-text text-transparent transform hover:scale-105 transition-transform inline-block cursor-default">
                            {t('title_highlight')}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                        Redefinindo o padrão da tatuagem artística com biossegurança hospitalar e curadoria internacional.
                    </p>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-20 px-4 bg-bg-card/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((val, idx) => (
                            <div 
                                key={idx}
                                className={`group p-10 rounded-[2rem] bg-gradient-to-br ${val.gradient} border ${val.border} backdrop-blur-xl hover:scale-[1.02] transition-all duration-300`}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-bg-dark/50 border border-white/10 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                                    {val.icon}
                                </div>
                                <h3 className="text-3xl font-heading font-bold text-white mb-4">{val.title}</h3>
                                <p className="text-lg text-text-secondary leading-relaxed">
                                    {val.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Timeline / Journey Teaser */}
            <section className="py-20 px-4 relative">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl font-bold mb-12">Nossa Jornada</h2>
                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                        
                        {/* Item 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 bg-bg-dark shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all">
                                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-white">Fundação</div>
                                    <time className="font-mono italic text-neon-green">2017</time>
                                </div>
                                <div className="text-text-secondary text-sm">Início das operações em Minas Gerais com foco em realismo.</div>
                            </div>
                        </div>

                         {/* Item 2 */}
                         <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 bg-bg-dark shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all">
                                <div className="w-3 h-3 bg-neon-blue rounded-full" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-white">Expansão Internacional</div>
                                    <time className="font-mono italic text-neon-blue">2022</time>
                                </div>
                                <div className="text-text-secondary text-sm">Primeira Guest Tour na Europa e reconhecimento global.</div>
                            </div>
                        </div>

                         {/* Item 3 */}
                         <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 bg-bg-dark shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all">
                                <div className="w-3 h-3 bg-neon-purple rounded-full" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-white">Altus Ink 2.0</div>
                                    <time className="font-mono italic text-neon-purple">2025</time>
                                </div>
                                <div className="text-text-secondary text-sm">Lançamento da plataforma digital e expansão da equipe.</div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
