import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, type Locale } from '@/hooks/useLocale';
import { LogoCompact } from './logo';

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

export function LanguageSelector() {
  const { showLanguageSelector, setLocale, languages, t } = useLocale();

  if (!showLanguageSelector) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center px-6"
        data-testid="language-selector-modal"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
          className="max-w-lg w-full"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <LogoCompact className="h-20 w-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {t.language.selectYourLanguage}
            </h2>
            <p className="text-zinc-400 mt-2">Select your language</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocale(lang.code as Locale)}
                className="flex items-center gap-4 p-4 rounded-xl
                  bg-zinc-900 border border-zinc-800
                  hover:border-gold/50 hover:bg-zinc-800
                  transition-all duration-200"
                data-testid={`language-option-${lang.code}`}
              >
                <img 
                  src={flagImages[lang.flag]} 
                  alt={lang.name} 
                  className="w-8 h-6 object-cover rounded"
                />
                <span className="text-white font-medium text-sm">{lang.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
