export type Term = {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
}

export type City = {
    id: string;
    name: string;
    terms: Term[]; // When the artist is in this city
}

export type Country = {
    id: string;
    name: string;
    flag: string; // Emoji or Image URL
    cities: City[];
}

export const TOUR_SCHEDULE: Country[] = [
    {
        id: 'br',
        name: 'Brasil',
        flag: '🇧🇷',
        cities: [
            {
                id: 'sp',
                name: 'São Paulo',
                terms: [{ start: '2026-01-01', end: '2026-01-31' }]
            }
        ]
    },
    {
        id: 'nl',
        name: 'Holanda',
        flag: '🇳🇱',
        cities: [
            {
                id: 'ams',
                name: 'Amsterdam',
                terms: [{ start: '2026-02-01', end: '2026-02-05' }]
            }
        ]
    },
    {
        id: 'it',
        name: 'Itália',
        flag: '🇮🇹',
        cities: [
            {
                id: 'mil',
                name: 'Milão',
                terms: [{ start: '2026-02-06', end: '2026-02-10' }]
            }
        ]
    },
    {
        id: 'fr',
        name: 'França',
        flag: '🇫🇷',
        cities: [
            {
                id: 'par',
                name: 'Paris',
                terms: [{ start: '2026-02-11', end: '2026-02-15' }]
            }
        ]
    },
    {
        id: 'lu',
        name: 'Luxemburgo',
        flag: '🇱🇺',
        cities: [
            {
                id: 'lux',
                name: 'Luxemburgo',
                terms: [{ start: '2026-02-16', end: '2026-02-20' }]
            }
        ]
    },
    {
        id: 'be',
        name: 'Bélgica',
        flag: '🇧🇪',
        cities: [
            {
                id: 'bru',
                name: 'Bruxelas',
                terms: [{ start: '2026-02-21', end: '2026-02-28' }]
            }
        ]
    }
]

export const PRICING_RULES = {
    small: { label: 'Pequena (1h - 1h30)', price: 40, currency: 'EUR' },
    medium: { label: 'Média (2h - 3h)', price: 60, currency: 'EUR' },
    large: { label: 'Grande (3h - 5h)', price: 100, currency: 'EUR' },
    xl: { label: 'Extra Grande (> 5h)', price: null, action: 'whatsapp' },
    coverup: { label: 'Reforma / Cobertura', price: null, action: 'whatsapp' }
}
