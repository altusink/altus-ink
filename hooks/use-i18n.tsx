'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, defaultLanguage } from '@/lib/i18n/config'
import { translations } from '@/lib/i18n/translations'

interface I18nContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(defaultLanguage)
    const [mounted, setMounted] = useState(false)

    // Load language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('language') as Language
        if (saved && translations[saved]) {
            setLanguageState(saved)
        }
        setMounted(true)
    }, [])

    // Save language to localStorage when it changes
    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
        // Force page reload to ensure all components update
        window.location.reload()
    }

    const t = (key: string): string => {
        return translations[language]?.[key] || translations[defaultLanguage]?.[key] || key
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (context === undefined) {
        throw new Error('useI18n must be used within I18nProvider')
    }
    return context
}
