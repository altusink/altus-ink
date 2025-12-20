import { Language } from './config'

// Base translations object
const baseTranslations = {
    // Navigation
    'nav.home': { 'pt-BR': 'Início', 'pt-PT': 'Início', 'en': 'Home', 'es': 'Inicio', 'fr': 'Accueil', 'de': 'Startseite', 'it': 'Home', 'nl': 'Home', 'pl': 'Strona główna', 'ro': 'Acasă', 'el': 'Αρχική', 'sv': 'Hem', 'da': 'Hjem', 'no': 'Hjem', 'fi': 'Koti' },
    'nav.artists': { 'pt-BR': 'Artistas', 'pt-PT': 'Artistas', 'en': 'Artists', 'es': 'Artistas', 'fr': 'Artistes', 'de': 'Künstler', 'it': 'Artisti', 'nl': 'Artiesten', 'pl': 'Artyści', 'ro': 'Artiști', 'el': 'Καλλιτέχνες', 'sv': 'Artister', 'da': 'Kunstnere', 'no': 'Artister', 'fi': 'Taiteilijat' },
    'nav.about': { 'pt-BR': 'Sobre', 'pt-PT': 'Sobre', 'en': 'About', 'es': 'Acerca de', 'fr': 'À propos', 'de': 'Über uns', 'it': 'Chi siamo', 'nl': 'Over ons', 'pl': 'O nas', 'ro': 'Despre', 'el': 'Σχετικά', 'sv': 'Om oss', 'da': 'Om os', 'no': 'Om oss', 'fi': 'Tietoa' },
    'nav.contact': { 'pt-BR': 'Contato', 'pt-PT': 'Contacto', 'en': 'Contact', 'es': 'Contacto', 'fr': 'Contact', 'de': 'Kontakt', 'it': 'Contatto', 'nl': 'Contact', 'pl': 'Kontakt', 'ro': 'Contact', 'el': 'Επικοινωνία', 'sv': 'Kontakt', 'da': 'Kontakt', 'no': 'Kontakt', 'fi': 'Yhteystiedot' },
    'nav.faq': { 'pt-BR': 'FAQ', 'pt-PT': 'FAQ', 'en': 'FAQ', 'es': 'FAQ', 'fr': 'FAQ', 'de': 'FAQ', 'it': 'FAQ', 'nl': 'FAQ', 'pl': 'FAQ', 'ro': 'FAQ', 'el': 'FAQ', 'sv': 'FAQ', 'da': 'FAQ', 'no': 'FAQ', 'fi': 'FAQ' },
    'nav.book': { 'pt-BR': 'Agendar', 'pt-PT': 'Agendar', 'en': 'Book', 'es': 'Reservar', 'fr': 'Réserver', 'de': 'Buchen', 'it': 'Prenota', 'nl': 'Boeken', 'pl': 'Zarezerwuj', 'ro': 'Rezervă', 'el': 'Κράτηση', 'sv': 'Boka', 'da': 'Book', 'no': 'Bestill', 'fi': 'Varaa' },
    'nav.login': { 'pt-BR': 'Login', 'pt-PT': 'Entrar', 'en': 'Login', 'es': 'Iniciar sesión', 'fr': 'Connexion', 'de': 'Anmelden', 'it': 'Accedi', 'nl': 'Inloggen', 'pl': 'Zaloguj', 'ro': 'Autentificare', 'el': 'Σύνδεση', 'sv': 'Logga in', 'da': 'Log ind', 'no': 'Logg inn', 'fi': 'Kirjaudu' },

    // Hero
    'hero.title': { 'pt-BR': 'ALTUS INK', 'pt-PT': 'ALTUS INK', 'en': 'ALTUS INK', 'es': 'ALTUS INK', 'fr': 'ALTUS INK', 'de': 'ALTUS INK', 'it': 'ALTUS INK', 'nl': 'ALTUS INK', 'pl': 'ALTUS INK', 'ro': 'ALTUS INK', 'el': 'ALTUS INK', 'sv': 'ALTUS INK', 'da': 'ALTUS INK', 'no': 'ALTUS INK', 'fi': 'ALTUS INK' },
    'hero.subtitle': { 'pt-BR': 'Transforme sua pele em', 'pt-PT': 'Transforme a sua pele em', 'en': 'Transform your skin into', 'es': 'Transforma tu piel en', 'fr': 'Transformez votre peau en', 'de': 'Verwandeln Sie Ihre Haut in', 'it': 'Trasforma la tua pelle in', 'nl': 'Transformeer je huid in', 'pl': 'Przekształć swoją skórę w', 'ro': 'Transformă-ți pielea în', 'el': 'Μετατρέψτε το δέρμα σας σε', 'sv': 'Förvandla din hud till', 'da': 'Forvandl din hud til', 'no': 'Forvandle huden din til', 'fi': 'Muuta ihosi' },
    'hero.subtitle.highlight': { 'pt-BR': 'obra de arte', 'pt-PT': 'obra de arte', 'en': 'artwork', 'es': 'obra de arte', 'fr': "œuvre d'art", 'de': 'Kunstwerk', 'it': "opera d'arte", 'nl': 'kunstwerk', 'pl': 'dzieło sztuki', 'ro': 'operă de artă', 'el': 'έργο τέχνης', 'sv': 'konstverk', 'da': 'kunstværk', 'no': 'kunstverk', 'fi': 'taideteokseksi' },

    // Stats
    'stats.tattoos': { 'pt-BR': 'Tatuagens', 'pt-PT': 'Tatuagens', 'en': 'Tattoos', 'es': 'Tatuajes', 'fr': 'Tatouages', 'de': 'Tattoos', 'it': 'Tatuaggi', 'nl': 'Tatoeages', 'pl': 'Tatuaże', 'ro': 'Tatuaje', 'el': 'Τατουάζ', 'sv': 'Tatueringar', 'da': 'Tatoveringer', 'no': 'Tatoveringer', 'fi': 'Tatuoinnit' },
    'stats.rating': { 'pt-BR': 'Avaliação', 'pt-PT': 'Avaliação', 'en': 'Rating', 'es': 'Valoración', 'fr': 'Évaluation', 'de': 'Bewertung', 'it': 'Valutazione', 'nl': 'Beoordeling', 'pl': 'Ocena', 'ro': 'Evaluare', 'el': 'Αξιολόγηση', 'sv': 'Betyg', 'da': 'Vurdering', 'no': 'Vurdering', 'fi': 'Arvostelu' },
    'stats.years': { 'pt-BR': 'Anos', 'pt-PT': 'Anos', 'en': 'Years', 'es': 'Años', 'fr': 'Ans', 'de': 'Jahre', 'it': 'Anni', 'nl': 'Jaren', 'pl': 'Lat', 'ro': 'Ani', 'el': 'Έτη', 'sv': 'År', 'da': 'År', 'no': 'År', 'fi': 'Vuotta' },
    'stats.artists': { 'pt-BR': 'Artistas', 'pt-PT': 'Artistas', 'en': 'Artists', 'es': 'Artistas', 'fr': 'Artistes', 'de': 'Künstler', 'it': 'Artisti', 'nl': 'Artiesten', 'pl': 'Artyści', 'ro': 'Artiști', 'el': 'Καλλιτέχνες', 'sv': 'Artister', 'da': 'Kunstnere', 'no': 'Artister', 'fi': 'Taiteilijat' },

    // Artists
    'artists.title': { 'pt-BR': 'Conheça os Artistas', 'pt-PT': 'Conheça os Artistas', 'en': 'Meet the Artists', 'es': 'Conoce a los Artistas', 'fr': 'Rencontrez les Artistes', 'de': 'Lernen Sie die Künstler kennen', 'it': 'Incontra gli Artisti', 'nl': 'Ontmoet de Artiesten', 'pl': 'Poznaj Artystów', 'ro': 'Cunoaște Artiștii', 'el': 'Γνωρίστε τους Καλλιτέχνες', 'sv': 'Möt Artisterna', 'da': 'Mød Kunstnerne', 'no': 'Møt Artistene', 'fi': 'Tapaa Taiteilijat' },
    'artists.portfolio': { 'pt-BR': 'Ver Portfólio', 'pt-PT': 'Ver Portfólio', 'en': 'View Portfolio', 'es': 'Ver Portafolio', 'fr': 'Voir le Portfolio', 'de': 'Portfolio ansehen', 'it': 'Vedi Portfolio', 'nl': 'Bekijk Portfolio', 'pl': 'Zobacz Portfolio', 'ro': 'Vezi Portofoliul', 'el': 'Δείτε το Χαρτοφυλάκιο', 'sv': 'Visa Portfolio', 'da': 'Se Portfolio', 'no': 'Se Portfolio', 'fi': 'Katso Portfolio' },

    // Danilo
    'danilo.name': { 'pt-BR': 'Danilo Santos', 'pt-PT': 'Danilo Santos', 'en': 'Danilo Santos', 'es': 'Danilo Santos', 'fr': 'Danilo Santos', 'de': 'Danilo Santos', 'it': 'Danilo Santos', 'nl': 'Danilo Santos', 'pl': 'Danilo Santos', 'ro': 'Danilo Santos', 'el': 'Danilo Santos', 'sv': 'Danilo Santos', 'da': 'Danilo Santos', 'no': 'Danilo Santos', 'fi': 'Danilo Santos' },
    'danilo.bio': {
        'pt-BR': 'Ex-policial da menor cidade do Brasil, Danilo Santos deixou a farda para seguir seu sonho de ser artista. Com mais de 7 anos de experiência e 15.000+ tatuagens realizadas, hoje é referência internacional em excelência artística, levando sua arte pelo Brasil e pelo mundo.',
        'pt-PT': 'Ex-polícia da menor cidade do Brasil, Danilo Santos deixou a farda para seguir o seu sonho de ser artista. Com mais de 7 anos de experiência e 15.000+ tatuagens realizadas, hoje é referência internacional em excelência artística, levando a sua arte pelo Brasil e pelo mundo.',
        'en': 'Former police officer from the smallest city in Brazil, Danilo Santos left his uniform to follow his dream of being an artist. With over 7 years of experience and 15,000+ tattoos completed, he is now an international reference in artistic excellence, taking his art throughout Brazil and the world.',
        'es': 'Ex policía de la ciudad más pequeña de Brasil, Danilo Santos dejó el uniforme para seguir su sueño de ser artista. Con más de 7 años de experiencia y 15.000+ tatuajes realizados, hoy es una referencia internacional en excelencia artística, llevando su arte por Brasil y el mundo.',
        'fr': 'Ancien policier de la plus petite ville du Brésil, Danilo Santos a quitté son uniforme pour suivre son rêve de devenir artiste. Avec plus de 7 ans d\'expérience et 15 000+ tatouages réalisés, il est aujourd\'hui une référence internationale en excellence artistique, portant son art à travers le Brésil et le monde.',
        'de': 'Ehemaliger Polizist aus der kleinsten Stadt Brasiliens, Danilo Santos verließ seine Uniform, um seinen Traum zu verfolgen, Künstler zu werden. Mit über 7 Jahren Erfahrung und 15.000+ abgeschlossenen Tattoos ist er heute eine internationale Referenz für künstlerische Exzellenz und bringt seine Kunst durch Brasilien und die Welt.',
        'it': 'Ex poliziotto della città più piccola del Brasile, Danilo Santos ha lasciato l\'uniforme per seguire il suo sogno di diventare artista. Con oltre 7 anni di esperienza e 15.000+ tatuaggi realizzati, oggi è un riferimento internazionale per l\'eccellenza artistica, portando la sua arte in Brasile e nel mondo.',
        'nl': 'Voormalig politieagent uit de kleinste stad van Brazilië, Danilo Santos verliet zijn uniform om zijn droom te volgen om kunstenaar te worden. Met meer dan 7 jaar ervaring en 15.000+ voltooide tatoeages is hij nu een internationale referentie in artistieke uitmuntendheid, die zijn kunst door Brazilië en de wereld brengt.',
        'pl': 'Były policjant z najmniejszego miasta w Brazylii, Danilo Santos porzucił mundur, aby podążać za swoim marzeniem zostania artystą. Z ponad 7-letnim doświadczeniem i 15 000+ wykonanych tatuaży, jest teraz międzynarodowym punktem odniesienia w doskonałości artystycznej, niosąc swoją sztukę przez Brazylię i świat.',
        'ro': 'Fost ofițer de poliție din cel mai mic oraș din Brazilia, Danilo Santos și-a lăsat uniforma pentru a-și urma visul de a deveni artist. Cu peste 7 ani de experiență și 15.000+ tatuaje realizate, este acum o referință internațională în excelență artistică, ducând arta sa prin Brazilia și lumea.',
        'el': 'Πρώην αστυνομικός από τη μικρότερη πόλη της Βραζιλίας, ο Danilo Santos άφησε τη στολή του για να ακολουθήσει το όνειρό του να γίνει καλλιτέχνης. Με πάνω από 7 χρόνια εμπειρίας και 15.000+ ολοκληρωμένα τατουάζ, είναι τώρα διεθνής αναφορά στην καλλιτεχνική αριστεία, φέρνοντας την τέχνη του σε όλη τη Βραζιλία και τον κόσμο.',
        'sv': 'Före detta polis från den minsta staden i Brasilien, Danilo Santos lämnade sin uniform för att följa sin dröm att bli konstnär. Med över 7 års erfarenhet och 15 000+ genomförda tatueringar är han nu en internationell referens inom konstnärlig excellens och tar sin konst genom Brasilien och världen.',
        'da': 'Tidligere politibetjent fra den mindste by i Brasilien, Danilo Santos forlod sin uniform for at følge sin drøm om at blive kunstner. Med over 7 års erfaring og 15.000+ gennemførte tatoveringer er han nu en international reference i kunstnerisk excellence og bringer sin kunst gennem Brasilien og verden.',
        'no': 'Tidligere politimann fra den minste byen i Brasil, Danilo Santos forlot uniformen for å følge drømmen om å bli kunstner. Med over 7 års erfaring og 15 000+ fullførte tatoveringer er han nå en internasjonal referanse i kunstnerisk fortreffelighet, og tar kunsten sin gjennom Brasil og verden.',
        'fi': 'Entinen poliisi Brasilian pienimmästä kaupungista, Danilo Santos jätti univormunsa seuratakseen unelmaansa tulla taiteilijaksi. Yli 7 vuoden kokemuksella ja 15 000+ valmistuneella tatuoinnilla hän on nyt kansainvälinen viite taiteellisessa erinomaisuudessa, vieden taidettaan Brasilian ja maailman halki.'
    },

    // Footer
    'footer.rights': { 'pt-BR': 'Todos os direitos reservados', 'pt-PT': 'Todos os direitos reservados', 'en': 'All rights reserved', 'es': 'Todos los derechos reservados', 'fr': 'Tous droits réservés', 'de': 'Alle Rechte vorbehalten', 'it': 'Tutti i diritti riservati', 'nl': 'Alle rechten voorbehouden', 'pl': 'Wszelkie prawa zastrzeżone', 'ro': 'Toate drepturile rezervate', 'el': 'Όλα τα δικαιώματα διατηρούνται', 'sv': 'Alla rättigheter förbehållna', 'da': 'Alle rettigheder forbeholdes', 'no': 'Alle rettigheter reservert', 'fi': 'Kaikki oikeudet pidätetään' },
    'footer.made': { 'pt-BR': 'Feito com', 'pt-PT': 'Feito com', 'en': 'Made with', 'es': 'Hecho con', 'fr': 'Fait avec', 'de': 'Gemacht mit', 'it': 'Fatto con', 'nl': 'Gemaakt met', 'pl': 'Wykonane z', 'ro': 'Făcut cu', 'el': 'Φτιαγμένο με', 'sv': 'Gjord med', 'da': 'Lavet med', 'no': 'Laget med', 'fi': 'Tehty' },
    'footer.and': { 'pt-BR': 'e muito neon', 'pt-PT': 'e muito neon', 'en': 'and lots of neon', 'es': 'y mucho neón', 'fr': 'et beaucoup de néon', 'de': 'und viel Neon', 'it': 'e tanto neon', 'nl': 'en veel neon', 'pl': 'i dużo neonu', 'ro': 'și mult neon', 'el': 'και πολύ νέον', 'sv': 'och mycket neon', 'da': 'og meget neon', 'no': 'og mye neon', 'fi': 'ja paljon neonia' },
}

// Build translations object
export const translations: Record<Language, Record<string, string>> = {} as any

// Populate all languages
const langs: Language[] = ['pt-BR', 'pt-PT', 'en', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ro', 'el', 'sv', 'da', 'no', 'fi']

langs.forEach(lang => {
    translations[lang] = {}
    Object.keys(baseTranslations).forEach(key => {
        translations[lang][key] = baseTranslations[key as keyof typeof baseTranslations][lang]
    })
})

export function t(key: string, lang: Language): string {
    return translations[lang]?.[key] || translations['pt-BR']?.[key] || key
}
