'use client'

import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

interface LocationSelectorProps {
    countries: any[]
    selectedCountryId: string
    selectedCityId: string
    onSelectCountry: (id: string) => void
    onSelectCity: (id: string) => void
}

export default function LocationSelector({ 
    countries, 
    selectedCountryId, 
    selectedCityId, 
    onSelectCountry, 
    onSelectCity 
}: LocationSelectorProps) {

    const currentCountry = countries.find(c => c.id === selectedCountryId)
    const cities = currentCountry?.cities || []

    return (
        <div className="space-y-6">
            {/* Country Selection */}
            <div>
                 <label className="block text-sm text-text-muted mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neon-cyan" />
                    País / Região da Tour
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {countries.length === 0 && (
                         <div className="col-span-3 p-4 bg-white/5 rounded-xl text-center text-text-muted text-sm">
                             Carregando destinos...
                         </div>
                    )}
                    {countries.map((country) => {
                        const isSelected = selectedCountryId === country.id
                        return (
                            <motion.button
                                key={country.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectCountry(country.id)}
                                className={`
                                    relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                                    ${isSelected 
                                        ? 'bg-neon-cyan/10 border-neon-cyan text-white shadow-[0_0_15px_rgba(57,255,20,0.3)]' 
                                        : 'bg-bg-card border-white/10 text-text-muted hover:bg-white/5 hover:border-white/30'
                                    }
                                `}
                            >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-md relative bg-bg-dark">
                                        <img 
                                            src={`https://flagcdn.com/w80/${(() => {
                                                // Helper to map DB names/IDs to ISO codes
                                                const map: Record<string, string> = {
                                                    'brasil': 'br', 'brazil': 'br', 'br': 'br',
                                                    'holanda': 'nl', 'netherlands': 'nl', 'nl': 'nl',
                                                    'reino unido': 'gb', 'uk': 'gb', 'united kingdom': 'gb', 'gb': 'gb',
                                                    'frança': 'fr', 'france': 'fr', 'fr': 'fr',
                                                    'alemanha': 'de', 'germany': 'de', 'de': 'de',
                                                    'itália': 'it', 'italy': 'it', 'it': 'it',
                                                    'espanha': 'es', 'spain': 'es', 'es': 'es',
                                                    'portugal': 'pt', 'pt': 'pt',
                                                    'bélgica': 'be', 'belgium': 'be', 'be': 'be',
                                                    'luxemburgo': 'lu', 'luxembourg': 'lu', 'lu': 'lu',
                                                    'suíça': 'ch', 'switzerland': 'ch', 'ch': 'ch'
                                                }
                                                const key = (country.name || country.id || '').toLowerCase().trim()
                                                return map[key] || 'un' // 'un' for unknown/globe
                                            })()}.png`}
                                            alt={country.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails
                                                e.currentTarget.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                <span className="font-semibold text-sm">{country.name}</span>
                                {isSelected && (
                                    <motion.div 
                                        layoutId="country-highlight"
                                        className="absolute inset-0 border-2 border-neon-cyan rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* City Selection (Animate presence when Country selected) */}
            {selectedCountryId && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="animate-fade-in"
                >
                    <label className="block text-sm text-text-muted mb-3">Cidade</label>
                    <div className="flex flex-wrap gap-3">
                        {cities.map((city: any) => {
                            const isSelected = selectedCityId === city.id
                            return (
                                <button
                                    key={city.id}
                                    type="button"
                                    onClick={() => onSelectCity(city.id)}
                                    className={`
                                        px-6 py-2 rounded-full border text-sm font-semibold transition-all
                                        ${isSelected 
                                            ? 'bg-neon-blue text-bg-dark border-neon-blue shadow-[0_0_10px_rgba(0,245,255,0.4)]' 
                                            : 'bg-transparent border-white/20 text-white hover:border-neon-blue/50'
                                        }
                                    `}
                                >
                                    {city.name}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
