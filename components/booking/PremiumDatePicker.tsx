'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'

interface PremiumDatePickerProps {
    dates: Date[]
    selectedDateStr: string
    onSelectDate: (dateStr: string) => void
    isLoading?: boolean
}

export default function PremiumDatePicker({ dates, selectedDateStr, onSelectDate, isLoading }: PremiumDatePickerProps) {

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10" />
                ))}
            </div>
        )
    }

    if (dates.length === 0) {
        return (
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-text-muted italic">
                    Nenhuma data disponível para esta cidade no momento.<br/>
                    Tente outra localidade ou entre em contato.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {dates.map((date, index) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const isSelected = selectedDateStr === dateStr
                
                // Formatting
                const dayAndMonth = format(date, 'dd MMM', { locale: ptBR })
                const weekDay = format(date, 'EEE', { locale: ptBR })
                const weekDayCapitalized = weekDay.charAt(0).toUpperCase() + weekDay.slice(1)

                return (
                    <motion.button
                        key={dateStr}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectDate(dateStr)}
                        className={`
                            relative h-24 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all
                            ${isSelected 
                                ? 'bg-neon-cyan text-bg-dark border-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.4)]' 
                                : 'bg-bg-card border-white/10 text-white hover:bg-white/5 hover:border-white/30'
                            }
                        `}
                    >
                        {/* Status Indicator (Available) - Centered */}
                        <div className="absolute top-2 w-full flex justify-center">
                             <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-bg-dark' : 'bg-neon-cyan animate-pulse'}`} />
                        </div>

                        <span className="text-[0.65rem] font-bold uppercase tracking-widest opacity-80">
                            {weekDayCapitalized}
                        </span>
                        <span className="text-xl font-bold font-heading">
                            {dayAndMonth}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}
