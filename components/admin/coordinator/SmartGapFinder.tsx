'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, isSameDay, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Sparkles, Calendar, ArrowRight, Phone } from 'lucide-react'

type Gap = {
    date: Date
    city: string
    reason: string
    priority: 'high' | 'medium' | 'low'
}

export default function SmartGapFinder() {
    const [gaps, setGaps] = useState<Gap[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        findGaps()
    }, [])

    async function findGaps() {
        setLoading(true)
        // 1. Fetch Tour Segments (Where SHOULD we have bookings?)
        const { data: tours } = await supabase.from('tour_segments').select('*')

        // 2. Fetch Existing Bookings (Where DO we have bookings?)
        const { data: bookings } = await supabase.from('bookings').select('booking_date')

        if (!tours || !bookings) {
            setLoading(false)
            return
        }

        const foundGaps: Gap[] = []
        const today = startOfDay(new Date())

        // simple algorithm: Check next 30 days against tours
        tours.forEach(tour => {
            const start = parseISO(tour.start_date)
            const end = parseISO(tour.end_date)
            let current = start

            // If tour is in the past, skip
            if (end < today) return

            // Iterate days of the tour
            while (current <= end) {
                // If day is before today, skip
                if (current < today) {
                    current = addDays(current, 1)
                    continue
                }

                // Check if fully booked (simplified: is there ANY booking?)
                // Ideally we check time slots, but for now, checking if day has < 2 bookings
                const dayBookings = bookings.filter(b => isSameDay(parseISO(b.booking_date), current))

                if (dayBookings.length === 0) {
                    foundGaps.push({
                        date: current,
                        city: tour.city_name,
                        reason: 'Dia totalmente livre em Turnê',
                        priority: 'high'
                    })
                } else if (dayBookings.length === 1) {
                    foundGaps.push({
                        date: current,
                        city: tour.city_name,
                        reason: 'Tarde livre (apenas 1 agendamento)',
                        priority: 'medium'
                    })
                }

                current = addDays(current, 1)
            }
        })

        setGaps(foundGaps.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5)) // Top 5
        setLoading(false)
    }

    if (loading) return <div className="animate-pulse h-32 bg-white/5 rounded-xl block" />

    if (gaps.length === 0) return (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
            <Sparkles className="w-8 h-8 text-neon-green mx-auto mb-2" />
            <h3 className="text-white font-bold">Agenda Otimizada!</h3>
            <p className="text-sm text-text-muted">Nenhum buraco crítico encontrado nos próximos dias.</p>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-neon-purple/10 rounded-lg text-neon-purple">
                    <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-white font-bold text-lg">Oportunidades (Gap Finder)</h3>
            </div>

            <div className="grid gap-3">
                {gaps.map((gap, i) => (
                    <div key={i} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple/50 p-4 rounded-xl transition-all flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-black/40 rounded-lg border border-white/10 text-white">
                                <span className="text-xs uppercase font-bold text-white/50">{format(gap.date, 'EEE', { locale: ptBR })}</span>
                                <span className="text-lg font-bold">{format(gap.date, 'dd')}</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold flex items-center gap-2">
                                    {gap.city}
                                    {gap.priority === 'high' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">CRÍTICO</span>}
                                </h4>
                                <p className="text-sm text-text-muted">{gap.reason}</p>
                            </div>
                        </div>

                        <button className="p-2 rounded-full bg-neon-purple/10 text-neon-purple hover:bg-neon-purple hover:text-black transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <p className="text-xs text-center text-text-muted mt-2">
                *Sugestão: Verifique a lista de espera para preencher estas datas.
            </p>
        </div>
    )
}
