'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Cookie, X } from 'lucide-react'

export default function CookieConsent() {
    // Default to false to avoid hydration mismatch, then check on mount
    const [isVisible, setIsVisible] = useState(false)
    const t = useTranslations('CookieConsent') // Assuming you have or will add this namespace, or we can hardcode for now if translation key missing

    useEffect(() => {
        const consent = localStorage.getItem('altus-ink-cookie-consent')
        if (!consent) {
            setIsVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('altus-ink-cookie-consent', 'accepted')
        setIsVisible(false)
        // Here you would trigger analytics initialization
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[60] max-w-md"
                >
                    <div className="bg-bg-dark/95 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-2xl relative overflow-hidden">
                        {/* Neon Glow */}
                        <div className="absolute -left-10 -top-10 w-20 h-20 bg-neon-cyan/20 blur-3xl rounded-full" />

                        <div className="relative z-10">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-full bg-white/5 border border-white/10">
                                    <Cookie className="w-5 h-5 text-neon-cyan" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-white mb-1">Cookies 🍪</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Usamos cookies para melhorar sua experiência e analisar o tráfego.
                                        Ao continuar, você aceita nossa política de privacidade.
                                    </p>
                                </div>
                                <button
                                    onClick={handleAccept}
                                    className="p-1 text-text-muted hover:text-white transition-colors"
                                    aria-label="Fechar aviso de cookies"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 py-2.5 bg-neon-cyan text-bg-dark font-bold rounded-xl hover:shadow-neon-cyan transition-all hover:scale-[1.02]"
                                >
                                    Aceitar Tudo
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.setItem('altus-ink-cookie-consent', 'declined')
                                        setIsVisible(false)
                                    }}
                                    className="px-4 py-2.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Recusar
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
