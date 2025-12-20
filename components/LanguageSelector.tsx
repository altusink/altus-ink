'use client'

import { useState, useEffect, useTransition } from 'react'
import { usePathname, useRouter } from '@/navigation'
import { useLocale } from 'next-intl'
import { Globe, Check } from 'lucide-react'

// Map locales to display data
const languages = {
    pt: { name: 'Português', flag: '🇧🇷' },
    en: { name: 'English', flag: '🇺🇸' },
    nl: { name: 'Nederlands', flag: '🇳🇱' },
    fr: { name: 'Français', flag: '🇫🇷' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    es: { name: 'Español', flag: '🇪🇸' },
} as const;

type Language = keyof typeof languages;

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const locale = useLocale() as Language
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const setLanguage = (nextLocale: Language) => {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
            setIsOpen(false);
        });
    }

    if (!mounted) {
        return (
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Globe className="w-4 h-4 text-neon-green" />
                <span className="text-sm font-medium">Wait...</span>
            </button>
        )
    }

    const currentLanguage = languages[locale] || languages.pt

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-green transition-all duration-300 disabled:opacity-50"
            >
                <span className="text-xl">{currentLanguage.flag}</span>
                <Globe className="w-4 h-4 text-neon-green" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto rounded-2xl bg-bg-card border border-white/10 backdrop-blur-xl shadow-2xl z-50 animate-slide-up">
                        <div className="p-2">
                            {Object.entries(languages).map(([code, { name, flag }]) => (
                                <button
                                    key={code}
                                    onClick={() => setLanguage(code as Language)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${locale === code
                                        ? 'bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{flag}</span>
                                        <span className="text-sm font-medium text-text-primary">
                                            {name}
                                        </span>
                                    </div>
                                    {locale === code && (
                                        <Check className="w-4 h-4 text-neon-green" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
