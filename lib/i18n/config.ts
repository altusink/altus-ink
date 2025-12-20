export const languages = {
    'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷' },
    'pt-PT': { name: 'Português (Portugal)', flag: '🇵🇹' },
    'en': { name: 'English', flag: '🇬🇧' },
    'es': { name: 'Español', flag: '🇪🇸' },
    'fr': { name: 'Français', flag: '🇫🇷' },
    'de': { name: 'Deutsch', flag: '🇩🇪' },
    'it': { name: 'Italiano', flag: '🇮🇹' },
    'nl': { name: 'Nederlands', flag: '🇳🇱' },
    'pl': { name: 'Polski', flag: '🇵🇱' },
    'ro': { name: 'Română', flag: '🇷🇴' },
    'el': { name: 'Ελληνικά', flag: '🇬🇷' },
    'sv': { name: 'Svenska', flag: '🇸🇪' },
    'da': { name: 'Dansk', flag: '🇩🇰' },
    'no': { name: 'Norsk', flag: '🇳🇴' },
    'fi': { name: 'Suomi', flag: '🇫🇮' },
} as const

export type Language = keyof typeof languages

export const defaultLanguage: Language = 'pt-BR'
