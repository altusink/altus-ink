'use client'

import { useState, useEffect } from 'react'
import { languages, Language, defaultLanguage } from '@/lib/i18n/config'
import { X } from 'lucide-react'

export default function LanguageModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const hasSelected = localStorage.getItem('language')
        if (!hasSelected) {
            setIsOpen(true)
        }
        setMounted(true)
    }, [])

    const handleSelectLanguage = (lang: Language) => {
        localStorage.setItem('language', lang)
        setIsOpen(false)
        window.location.reload()
    }

    const getFlagCode = (langCode: string) => {
        const mapping: Record<string, string> = {
            'pt-BR': 'br',
            'pt-PT': 'pt',
            'en': 'gb',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'nl': 'nl',
            'pl': 'pl',
            'ro': 'ro',
            'el': 'gr',
            'sv': 'se',
            'da': 'dk',
            'no': 'no',
            'fi': 'fi'
        }
        return mapping[langCode] || langCode
    }

    if (!mounted || !isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl mx-4 p-8 rounded-3xl bg-gradient-to-br from-bg-card/90 to-bg-dark/90 border border-white/10 backdrop-blur-xl animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                        <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                            Select Your Language
                        </span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Choose your preferred language / Escolha seu idioma preferido
                    </p>
                </div>

                {/* Language Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {Object.entries(languages).map(([code, { name }]) => (
                        <button
                            key={code}
                            onClick={() => handleSelectLanguage(code as Language)}
                            className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-green transition-all duration-300 hover:scale-105"
                        >
                            <div className="mb-3 relative w-16 h-12 rounded-lg overflow-hidden shadow-lg group-hover:shadow-neon-green/50 transition-all">
                                <img 
                                    src={`https://flagcdn.com/w160/${getFlagCode(code)}.png`} 
                                    alt={name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-sm font-medium text-text-secondary group-hover:text-neon-green transition-colors">
                                {name}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/0 to-neon-blue/0 group-hover:from-neon-green/10 group-hover:to-neon-blue/10 rounded-2xl transition-all duration-300" />
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <p className="text-center text-text-muted text-sm relative z-10">
                    You can change the language anytime from the menu <span className="text-[10px] opacity-20">v3.0 (Altus OS Alpha)</span>
                </p>
            </div>
        </div>
    )
}
