import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale, type Locale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

const flagImages: Record<string, string> = {
  'BR': 'https://flagcdn.com/w40/br.png',
  'PT': 'https://flagcdn.com/w40/pt.png',
  'GB': 'https://flagcdn.com/w40/gb.png',
  'DE': 'https://flagcdn.com/w40/de.png',
  'ES': 'https://flagcdn.com/w40/es.png',
  'FR': 'https://flagcdn.com/w40/fr.png',
  'IT': 'https://flagcdn.com/w40/it.png',
  'NL': 'https://flagcdn.com/w40/nl.png',
};

export function LanguageSwitcher() {
  const { locale, setLocale, languages, currentLanguage } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
        data-testid="language-switcher-button"
      >
        <img 
          src={flagImages[currentLanguage.flag]} 
          alt={currentLanguage.name}
          className="w-5 h-4 object-cover rounded-sm"
        />
        <ChevronDown className={cn(
          "w-4 h-4 text-zinc-400 transition-transform",
          open && "rotate-180"
        )} />
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 py-2
            bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code as Locale);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-left",
                  locale === lang.code && "bg-gold/10 text-gold"
                )}
                data-testid={`language-switch-${lang.code}`}
              >
                <img 
                  src={flagImages[lang.flag]} 
                  alt={lang.name}
                  className="w-5 h-4 object-cover rounded-sm"
                />
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
