export type Locale = 'en' | 'pt-BR' | 'pt-PT' | 'es' | 'fr' | 'de' | 'it' | 'nl';

export interface Translations {
  common: {
    home: string;
    bookNow: string;
    viewPortfolio: string;
    artists: string;
    about: string;
    contact: string;
    login: string;
    logout: string;
    dashboard: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineHighlight: string;
    headlineEnd: string;
    subheadline: string;
    cta: string;
    secondary: string;
    securePayment: string;
    reviews: string;
    locations: string;
  };
  booking: {
    selectService: string;
    selectDate: string;
    selectTime: string;
    yourDetails: string;
    payment: string;
    confirmation: string;
    tattoo: string;
    coverup: string;
    small: string;
    medium: string;
    large: string;
    xl: string;
    talkOnWhatsApp: string;
    deposit: string;
    duration: string;
    continue: string;
    back: string;
    slotReserved: string;
  };
  footer: {
    securePayment: string;
    certifications: string;
    navigation: string;
    legal: string;
    privacy: string;
    terms: string;
    cancellation: string;
    cookies: string;
    copyright: string;
    madeWith: string;
  };
  language: {
    selectLanguage: string;
    selectYourLanguage: string;
  };
}

export const translations: Record<Locale, Translations> = {
  'en': {
    common: {
      home: 'Home',
      bookNow: 'Book Now',
      viewPortfolio: 'View Portfolio',
      artists: 'Artists',
      about: 'About Us',
      contact: 'Contact',
      login: 'Login',
      logout: 'Logout',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'Limited Spots in December',
      headline: 'Art that ',
      headlineHighlight: 'Marks',
      headlineEnd: ' Forever',
      subheadline: 'Internationally awarded tattoo artists. Book your session now.',
      cta: 'Book My Session',
      secondary: 'View Portfolio',
      securePayment: 'Secure Payment',
      reviews: '4.9 (230+ reviews)',
      locations: 'Berlin • Lisbon • Sao Paulo',
    },
    booking: {
      selectService: 'Select Your Service',
      selectDate: 'Select a Date',
      selectTime: 'Select a Time',
      yourDetails: 'Your Details',
      payment: 'Payment',
      confirmation: 'Confirmation',
      tattoo: 'Tattoo',
      coverup: 'Cover-up',
      small: 'Small (1h - 1:30h)',
      medium: 'Medium (2h - 3h)',
      large: 'Large (3h - 5h)',
      xl: 'Extra Large (5h - 8h)',
      talkOnWhatsApp: 'Talk on WhatsApp',
      deposit: 'deposit',
      duration: 'session',
      continue: 'Continue',
      back: 'Back',
      slotReserved: 'Slot reserved for',
    },
    footer: {
      securePayment: 'Secure Payment',
      certifications: 'Certifications',
      navigation: 'Navigation',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms of Use',
      cancellation: 'Cancellation',
      cookies: 'Cookies (GDPR)',
      copyright: '2024 Altus Ink. All rights reserved.',
      madeWith: 'Made with love in Berlin',
    },
    language: {
      selectLanguage: 'Select Language',
      selectYourLanguage: 'Select your language',
    },
  },
  'pt-BR': {
    common: {
      home: 'Inicio',
      bookNow: 'Agendar Agora',
      viewPortfolio: 'Ver Portfolio',
      artists: 'Artistas',
      about: 'Sobre Nos',
      contact: 'Contato',
      login: 'Entrar',
      logout: 'Sair',
      dashboard: 'Painel',
    },
    hero: {
      badge: 'Vagas Limitadas em Dezembro',
      headline: 'Arte que ',
      headlineHighlight: 'Marca',
      headlineEnd: ' para Sempre',
      subheadline: 'Tatuadores premiados internacionalmente. Reserve sua sessao agora.',
      cta: 'Agendar Minha Sessao',
      secondary: 'Ver Portfolio',
      securePayment: 'Pagamento Seguro',
      reviews: '4.9 (230+ avaliacoes)',
      locations: 'Berlin • Lisboa • Sao Paulo',
    },
    booking: {
      selectService: 'Selecione o Servico',
      selectDate: 'Escolha a Data',
      selectTime: 'Escolha o Horario',
      yourDetails: 'Seus Dados',
      payment: 'Pagamento',
      confirmation: 'Confirmacao',
      tattoo: 'Tatuagem',
      coverup: 'Cobertura',
      small: 'Pequena (1h - 1:30h)',
      medium: 'Media (2h - 3h)',
      large: 'Grande (3h - 5h)',
      xl: 'Extra Grande (5h - 8h)',
      talkOnWhatsApp: 'Falar no WhatsApp',
      deposit: 'sinal',
      duration: 'sessao',
      continue: 'Continuar',
      back: 'Voltar',
      slotReserved: 'Vaga reservada por',
    },
    footer: {
      securePayment: 'Pagamento Seguro',
      certifications: 'Certificacoes',
      navigation: 'Navegacao',
      legal: 'Legal',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      cancellation: 'Cancelamento',
      cookies: 'Cookies (GDPR)',
      copyright: '2024 Altus Ink. Todos os direitos reservados.',
      madeWith: 'Feito com amor em Berlin',
    },
    language: {
      selectLanguage: 'Selecionar Idioma',
      selectYourLanguage: 'Selecione seu idioma',
    },
  },
  'pt-PT': {
    common: {
      home: 'Inicio',
      bookNow: 'Agendar Agora',
      viewPortfolio: 'Ver Portfolio',
      artists: 'Artistas',
      about: 'Sobre Nos',
      contact: 'Contacto',
      login: 'Entrar',
      logout: 'Sair',
      dashboard: 'Painel',
    },
    hero: {
      badge: 'Vagas Limitadas em Dezembro',
      headline: 'Arte que ',
      headlineHighlight: 'Marca',
      headlineEnd: ' para Sempre',
      subheadline: 'Tatuadores premiados internacionalmente. Reserve a sua sessao agora.',
      cta: 'Agendar a Minha Sessao',
      secondary: 'Ver Portfolio',
      securePayment: 'Pagamento Seguro',
      reviews: '4.9 (230+ avaliacoes)',
      locations: 'Berlin • Lisboa • Sao Paulo',
    },
    booking: {
      selectService: 'Selecione o Servico',
      selectDate: 'Escolha a Data',
      selectTime: 'Escolha o Horario',
      yourDetails: 'Os Seus Dados',
      payment: 'Pagamento',
      confirmation: 'Confirmacao',
      tattoo: 'Tatuagem',
      coverup: 'Cobertura',
      small: 'Pequena (1h - 1:30h)',
      medium: 'Media (2h - 3h)',
      large: 'Grande (3h - 5h)',
      xl: 'Extra Grande (5h - 8h)',
      talkOnWhatsApp: 'Falar no WhatsApp',
      deposit: 'sinal',
      duration: 'sessao',
      continue: 'Continuar',
      back: 'Voltar',
      slotReserved: 'Vaga reservada por',
    },
    footer: {
      securePayment: 'Pagamento Seguro',
      certifications: 'Certificacoes',
      navigation: 'Navegacao',
      legal: 'Legal',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
      cancellation: 'Cancelamento',
      cookies: 'Cookies (GDPR)',
      copyright: '2024 Altus Ink. Todos os direitos reservados.',
      madeWith: 'Feito com amor em Berlin',
    },
    language: {
      selectLanguage: 'Selecionar Idioma',
      selectYourLanguage: 'Selecione o seu idioma',
    },
  },
  'es': {
    common: {
      home: 'Inicio',
      bookNow: 'Reservar Ahora',
      viewPortfolio: 'Ver Portafolio',
      artists: 'Artistas',
      about: 'Sobre Nosotros',
      contact: 'Contacto',
      login: 'Iniciar Sesion',
      logout: 'Cerrar Sesion',
      dashboard: 'Panel',
    },
    hero: {
      badge: 'Plazas Limitadas en Diciembre',
      headline: 'Arte que ',
      headlineHighlight: 'Marca',
      headlineEnd: ' para Siempre',
      subheadline: 'Tatuadores premiados internacionalmente. Reserva tu sesion ahora.',
      cta: 'Reservar Mi Sesion',
      secondary: 'Ver Portafolio',
      securePayment: 'Pago Seguro',
      reviews: '4.9 (230+ resenas)',
      locations: 'Berlin • Lisboa • Sao Paulo',
    },
    booking: {
      selectService: 'Selecciona el Servicio',
      selectDate: 'Elige la Fecha',
      selectTime: 'Elige la Hora',
      yourDetails: 'Tus Datos',
      payment: 'Pago',
      confirmation: 'Confirmacion',
      tattoo: 'Tatuaje',
      coverup: 'Cobertura',
      small: 'Pequeno (1h - 1:30h)',
      medium: 'Mediano (2h - 3h)',
      large: 'Grande (3h - 5h)',
      xl: 'Extra Grande (5h - 8h)',
      talkOnWhatsApp: 'Hablar en WhatsApp',
      deposit: 'deposito',
      duration: 'sesion',
      continue: 'Continuar',
      back: 'Atras',
      slotReserved: 'Plaza reservada por',
    },
    footer: {
      securePayment: 'Pago Seguro',
      certifications: 'Certificaciones',
      navigation: 'Navegacion',
      legal: 'Legal',
      privacy: 'Privacidad',
      terms: 'Terminos de Uso',
      cancellation: 'Cancelacion',
      cookies: 'Cookies (GDPR)',
      copyright: '2024 Altus Ink. Todos los derechos reservados.',
      madeWith: 'Hecho con amor en Berlin',
    },
    language: {
      selectLanguage: 'Seleccionar Idioma',
      selectYourLanguage: 'Selecciona tu idioma',
    },
  },
  'fr': {
    common: {
      home: 'Accueil',
      bookNow: 'Reserver Maintenant',
      viewPortfolio: 'Voir Portfolio',
      artists: 'Artistes',
      about: 'A Propos',
      contact: 'Contact',
      login: 'Connexion',
      logout: 'Deconnexion',
      dashboard: 'Tableau de Bord',
    },
    hero: {
      badge: 'Places Limitees en Decembre',
      headline: 'Art qui ',
      headlineHighlight: 'Marque',
      headlineEnd: ' pour Toujours',
      subheadline: 'Tatoueurs primes internationalement. Reservez votre seance maintenant.',
      cta: 'Reserver Ma Seance',
      secondary: 'Voir Portfolio',
      securePayment: 'Paiement Securise',
      reviews: '4.9 (230+ avis)',
      locations: 'Berlin • Lisbonne • Sao Paulo',
    },
    booking: {
      selectService: 'Selectionnez le Service',
      selectDate: 'Choisissez la Date',
      selectTime: 'Choisissez lHeure',
      yourDetails: 'Vos Coordonnees',
      payment: 'Paiement',
      confirmation: 'Confirmation',
      tattoo: 'Tatouage',
      coverup: 'Couverture',
      small: 'Petit (1h - 1:30h)',
      medium: 'Moyen (2h - 3h)',
      large: 'Grand (3h - 5h)',
      xl: 'Tres Grand (5h - 8h)',
      talkOnWhatsApp: 'Parler sur WhatsApp',
      deposit: 'acompte',
      duration: 'seance',
      continue: 'Continuer',
      back: 'Retour',
      slotReserved: 'Creneau reserve pour',
    },
    footer: {
      securePayment: 'Paiement Securise',
      certifications: 'Certifications',
      navigation: 'Navigation',
      legal: 'Mentions Legales',
      privacy: 'Confidentialite',
      terms: 'Conditions dUtilisation',
      cancellation: 'Annulation',
      cookies: 'Cookies (RGPD)',
      copyright: '2024 Altus Ink. Tous droits reserves.',
      madeWith: 'Fait avec amour a Berlin',
    },
    language: {
      selectLanguage: 'Choisir la Langue',
      selectYourLanguage: 'Choisissez votre langue',
    },
  },
  'de': {
    common: {
      home: 'Startseite',
      bookNow: 'Jetzt Buchen',
      viewPortfolio: 'Portfolio Ansehen',
      artists: 'Kunstler',
      about: 'Uber Uns',
      contact: 'Kontakt',
      login: 'Anmelden',
      logout: 'Abmelden',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'Begrenzte Platze im Dezember',
      headline: 'Kunst die ',
      headlineHighlight: 'Zeichen',
      headlineEnd: ' fur Immer',
      subheadline: 'International ausgezeichnete Tatowierer. Buchen Sie jetzt Ihre Sitzung.',
      cta: 'Meine Sitzung Buchen',
      secondary: 'Portfolio Ansehen',
      securePayment: 'Sichere Zahlung',
      reviews: '4.9 (230+ Bewertungen)',
      locations: 'Berlin • Lissabon • Sao Paulo',
    },
    booking: {
      selectService: 'Wahlen Sie den Service',
      selectDate: 'Datum Wahlen',
      selectTime: 'Uhrzeit Wahlen',
      yourDetails: 'Ihre Daten',
      payment: 'Zahlung',
      confirmation: 'Bestatigung',
      tattoo: 'Tatowierung',
      coverup: 'Cover-up',
      small: 'Klein (1h - 1:30h)',
      medium: 'Mittel (2h - 3h)',
      large: 'Gross (3h - 5h)',
      xl: 'Extra Gross (5h - 8h)',
      talkOnWhatsApp: 'Auf WhatsApp Sprechen',
      deposit: 'Anzahlung',
      duration: 'Sitzung',
      continue: 'Weiter',
      back: 'Zuruck',
      slotReserved: 'Platz reserviert fur',
    },
    footer: {
      securePayment: 'Sichere Zahlung',
      certifications: 'Zertifizierungen',
      navigation: 'Navigation',
      legal: 'Rechtliches',
      privacy: 'Datenschutz',
      terms: 'Nutzungsbedingungen',
      cancellation: 'Stornierung',
      cookies: 'Cookies (DSGVO)',
      copyright: '2024 Altus Ink. Alle Rechte vorbehalten.',
      madeWith: 'Mit Liebe in Berlin gemacht',
    },
    language: {
      selectLanguage: 'Sprache Wahlen',
      selectYourLanguage: 'Wahlen Sie Ihre Sprache',
    },
  },
  'it': {
    common: {
      home: 'Home',
      bookNow: 'Prenota Ora',
      viewPortfolio: 'Vedi Portfolio',
      artists: 'Artisti',
      about: 'Chi Siamo',
      contact: 'Contatto',
      login: 'Accedi',
      logout: 'Esci',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'Posti Limitati a Dicembre',
      headline: 'Arte che ',
      headlineHighlight: 'Segna',
      headlineEnd: ' per Sempre',
      subheadline: 'Tatuatori premiati a livello internazionale. Prenota ora la tua sessione.',
      cta: 'Prenota la Mia Sessione',
      secondary: 'Vedi Portfolio',
      securePayment: 'Pagamento Sicuro',
      reviews: '4.9 (230+ recensioni)',
      locations: 'Berlino • Lisbona • San Paolo',
    },
    booking: {
      selectService: 'Seleziona il Servizio',
      selectDate: 'Scegli la Data',
      selectTime: 'Scegli lOrario',
      yourDetails: 'I Tuoi Dati',
      payment: 'Pagamento',
      confirmation: 'Conferma',
      tattoo: 'Tatuaggio',
      coverup: 'Copertura',
      small: 'Piccolo (1h - 1:30h)',
      medium: 'Medio (2h - 3h)',
      large: 'Grande (3h - 5h)',
      xl: 'Extra Grande (5h - 8h)',
      talkOnWhatsApp: 'Parla su WhatsApp',
      deposit: 'acconto',
      duration: 'sessione',
      continue: 'Continua',
      back: 'Indietro',
      slotReserved: 'Posto riservato per',
    },
    footer: {
      securePayment: 'Pagamento Sicuro',
      certifications: 'Certificazioni',
      navigation: 'Navigazione',
      legal: 'Legale',
      privacy: 'Privacy',
      terms: 'Termini dUso',
      cancellation: 'Cancellazione',
      cookies: 'Cookie (GDPR)',
      copyright: '2024 Altus Ink. Tutti i diritti riservati.',
      madeWith: 'Fatto con amore a Berlino',
    },
    language: {
      selectLanguage: 'Seleziona Lingua',
      selectYourLanguage: 'Seleziona la tua lingua',
    },
  },
  'nl': {
    common: {
      home: 'Home',
      bookNow: 'Nu Boeken',
      viewPortfolio: 'Portfolio Bekijken',
      artists: 'Artiesten',
      about: 'Over Ons',
      contact: 'Contact',
      login: 'Inloggen',
      logout: 'Uitloggen',
      dashboard: 'Dashboard',
    },
    hero: {
      badge: 'Beperkte Plaatsen in December',
      headline: 'Kunst die ',
      headlineHighlight: 'Markeert',
      headlineEnd: ' voor Altijd',
      subheadline: 'Internationaal bekroonde tatoeeerders. Boek nu je sessie.',
      cta: 'Mijn Sessie Boeken',
      secondary: 'Portfolio Bekijken',
      securePayment: 'Veilige Betaling',
      reviews: '4.9 (230+ beoordelingen)',
      locations: 'Berlijn • Lissabon • Sao Paulo',
    },
    booking: {
      selectService: 'Selecteer de Service',
      selectDate: 'Kies de Datum',
      selectTime: 'Kies de Tijd',
      yourDetails: 'Jouw Gegevens',
      payment: 'Betaling',
      confirmation: 'Bevestiging',
      tattoo: 'Tatoeage',
      coverup: 'Cover-up',
      small: 'Klein (1u - 1:30u)',
      medium: 'Medium (2u - 3u)',
      large: 'Groot (3u - 5u)',
      xl: 'Extra Groot (5u - 8u)',
      talkOnWhatsApp: 'Praat op WhatsApp',
      deposit: 'aanbetaling',
      duration: 'sessie',
      continue: 'Doorgaan',
      back: 'Terug',
      slotReserved: 'Plek gereserveerd voor',
    },
    footer: {
      securePayment: 'Veilige Betaling',
      certifications: 'Certificeringen',
      navigation: 'Navigatie',
      legal: 'Juridisch',
      privacy: 'Privacy',
      terms: 'Gebruiksvoorwaarden',
      cancellation: 'Annulering',
      cookies: 'Cookies (AVG)',
      copyright: '2024 Altus Ink. Alle rechten voorbehouden.',
      madeWith: 'Gemaakt met liefde in Berlijn',
    },
    language: {
      selectLanguage: 'Taal Selecteren',
      selectYourLanguage: 'Selecteer je taal',
    },
  },
};

export const languages = [
  { code: 'pt-BR' as Locale, name: 'Portugues (Brasil)', flag: 'BR' },
  { code: 'pt-PT' as Locale, name: 'Portugues (Portugal)', flag: 'PT' },
  { code: 'en' as Locale, name: 'English', flag: 'GB' },
  { code: 'de' as Locale, name: 'Deutsch', flag: 'DE' },
  { code: 'es' as Locale, name: 'Espanol', flag: 'ES' },
  { code: 'fr' as Locale, name: 'Francais', flag: 'FR' },
  { code: 'it' as Locale, name: 'Italiano', flag: 'IT' },
  { code: 'nl' as Locale, name: 'Nederlands', flag: 'NL' },
];

export const defaultLocale: Locale = 'en';
