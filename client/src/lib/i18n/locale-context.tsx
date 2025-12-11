import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translations, languages, defaultLocale, type Locale, type Translations } from "./translations";

const LOCALE_STORAGE_KEY = "altusink_locale";

interface LocaleContextType {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  t: Translations;
  languages: typeof languages;
  currentLanguage: typeof languages[number];
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && Object.keys(translations).includes(saved)) {
        return saved as Locale;
      }
    }
    return defaultLocale;
  });

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!saved) {
        setShowLanguageSelector(true);
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setShowLanguageSelector(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = translations[locale];
  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  return (
    <LocaleContext.Provider value={{ 
      locale, 
      setLocale, 
      t, 
      languages, 
      currentLanguage, 
      showLanguageSelector, 
      setShowLanguageSelector 
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocaleContext must be used within a LocaleProvider");
  }
  return context;
}
