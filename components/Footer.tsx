'use client'

import { Link } from '@/navigation'
import Image from 'next/image'
import { Instagram, Facebook, Mail, Phone, MapPin, Shield, Lock, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const t = useTranslations('Footer')
    const tNav = useTranslations('Navbar')

    return (
        <footer className="bg-bg-card border-t border-white/10">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Brand */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 mb-8 lg:mb-0">
                    <Link href="/" className="inline-block mb-6">
                        <div className="relative w-64 h-24">
                            <Image 
                                src="/images/brand-logo.png" 
                                alt="Altus Ink International" 
                                fill
                                className="object-contain object-left"
                                quality={100}
                                priority
                            />
                        </div>
                    </Link>
                    <p className="text-text-secondary max-w-sm text-sm leading-relaxed">
                        Elevando a arte da tatuagem a um nível global. Experiências exclusivas com os maiores artistas do mundo.
                    </p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <Shield className="w-4 h-4 text-neon-green" />
                                <span className="text-xs text-text-muted">Certificado</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <Lock className="w-4 h-4 text-neon-blue" />
                                <span className="text-xs text-text-muted">SSL Seguro</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <CheckCircle className="w-4 h-4 text-neon-purple" />
                                <span className="text-xs text-text-muted">Verificado</span>
                            </div>
                        </div>
                    </div>


                    {/* Links Rápidos */}
                    <div>
                        <h4 className="text-lg font-heading text-text-primary mb-4 bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            {t('quick_links')}
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/artistas" className="text-text-muted hover:text-neon-green transition-colors text-sm">
                                    {tNav('artists')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/sobre" className="text-text-muted hover:text-neon-green transition-colors text-sm">
                                    {tNav('about')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-text-muted hover:text-neon-green transition-colors text-sm">
                                    {tNav('faq')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/contato" className="text-text-muted hover:text-neon-green transition-colors text-sm">
                                    {tNav('contact')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/agendar" className="text-text-muted hover:text-neon-green transition-colors text-sm">
                                    {tNav('book')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contato */}
                    <div>
                        <h4 className="text-lg font-heading text-text-primary mb-4 bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            {t('contact')}
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-text-muted text-sm">
                                <Phone size={16} className="text-neon-green flex-shrink-0" />
                                <span>+55 11 98765-4321</span>
                            </li>
                            <li className="flex items-center space-x-2 text-text-muted text-sm">
                                <Mail size={16} className="text-neon-green flex-shrink-0" />
                                <span>contato@altusink.com</span>
                            </li>
                            <li className="flex items-start space-x-2 text-text-muted text-sm">
                                <MapPin size={16} className="text-neon-green mt-1 flex-shrink-0" />
                                <span>São Paulo, Brasil</span>
                            </li>
                        </ul>
                    </div>

                    {/* Redes Sociais */}
                    <div>
                        <h4 className="text-lg font-heading text-text-primary mb-4 bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            {t('follow_us')}
                        </h4>
                        <div className="flex space-x-4 mb-6">
                            <a
                                href="https://instagram.com/danilosantos.tattoo"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30 flex items-center justify-center hover:scale-110 transition-transform duration-300"
                            >
                                <Instagram size={20} className="text-neon-pink" />
                            </a>
                            <a
                                href="https://facebook.com/altusink"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 flex items-center justify-center hover:scale-110 transition-transform duration-300"
                            >
                                <Facebook size={20} className="text-neon-blue" />
                            </a>
                        </div>
                        <div className="text-text-muted text-xs space-y-1">
                            <p className="font-semibold text-text-secondary">Atendimento:</p>
                            <p className="flex items-center gap-2 text-neon-green"><CheckCircle size={12} /> Suporte 24h</p>
                            <p>Seg-Dom: Aberto</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-text-muted text-sm text-center md:text-left">
                            &copy; {currentYear} Altus Ink International. {t('rights')}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                            <Link href="/politica-privacidade" className="hover:text-neon-green transition-colors">
                                {t('privacy')}
                            </Link>
                            <span>•</span>
                            <Link href="/termos-uso" className="hover:text-neon-green transition-colors">
                                {t('terms')}
                            </Link>
                        </div>
                    </div>
                    <p className="text-text-muted text-xs mt-4 text-center">
                        {t('made_with')} <span className="text-neon-green">❤️</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}
