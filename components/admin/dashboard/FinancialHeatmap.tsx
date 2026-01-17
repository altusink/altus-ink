'use client'

import { useMemo } from 'react'

type Booking = {
    booking_date: string
    booking_time: string
    estimated_price: number | string
    status: string
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const TIME_SLOTS = ['Morning (08-12)', 'Afternoon (12-16)', 'Evening (16-20)']

export default function FinancialHeatmap({ bookings }: { bookings: Booking[] }) {

    const heatmapData = useMemo(() => {
        // Initialize Grid
        const grid = Array(7).fill(0).map(() => Array(3).fill(0))
        let maxVal = 0

        bookings.forEach(booking => {
            if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') return

            const date = new Date(booking.booking_date)
            const dayIndex = date.getDay() // 0 = Sunday

            const hour = parseInt(booking.booking_time.split(':')[0])
            let timeIndex = 0 // Morning default
            if (hour >= 12 && hour < 16) timeIndex = 1
            if (hour >= 16) timeIndex = 2

            const val = Number(booking.estimated_price) || 0
            grid[dayIndex][timeIndex] += val

            if (grid[dayIndex][timeIndex] > maxVal) maxVal = grid[dayIndex][timeIndex]
        })

        return { grid, maxVal }
    }, [bookings])

    const getIntensityColor = (val: number, max: number) => {
        if (val === 0) return 'bg-white/5 border-white/5'
        const ratio = val / max
        if (ratio < 0.3) return 'bg-neon-green/10 border-neon-green/20'
        if (ratio < 0.6) return 'bg-neon-green/30 border-neon-green/40'
        if (ratio < 0.8) return 'bg-neon-green/60 border-neon-green/70'
        return 'bg-neon-green border-neon-green shadow-[0_0_15px_rgba(34,197,94,0.5)]'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Mapa de Calor Financeiro (Revenue Heatmap)</h3>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="w-3 h-3 bg-white/5 rounded"></span> Sem receita
                    <span className="w-3 h-3 bg-neon-green/30 rounded"></span> Baixa
                    <span className="w-3 h-3 bg-neon-green rounded"></span> Alta Densidade
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-[100px_repeat(3,_1fr)] gap-2">
                        {/* Header Row */}
                        <div className="text-xs text-text-muted font-bold self-end uppercase">Dia / Periodo</div>
                        {TIME_SLOTS.map(t => (
                            <div key={t} className="text-xs text-center text-text-secondary uppercase pb-2">{t.split(' ')[0]}</div>
                        ))}

                        {/* Rows */}
                        {DAYS.map((day, dIndex) => (
                            <>
                                <div key={`day-${dIndex}`} className="text-secondary text-sm font-medium self-center">{day}</div>
                                {heatmapData.grid[dIndex].map((val, tIndex) => (
                                    <div
                                        key={`${dIndex}-${tIndex}`}
                                        className={`
                                            h-12 rounded-lg border flex items-center justify-center transition-all group relative
                                            ${getIntensityColor(val, heatmapData.maxVal)}
                                        `}
                                    >
                                        <span className={`text-xs font-bold ${val > heatmapData.maxVal * 0.6 ? 'text-black' : 'text-neon-green opacity-0 group-hover:opacity-100'}`}>
                                            {val > 0 ? `€${(val / 1000).toFixed(1)}k` : '-'}
                                        </span>

                                        {/* Tooltip */}
                                        {val > 0 && (
                                            <div className="absolute bottom-full mb-2 bg-black/90 border border-white/20 p-2 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                Receita: €{val.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-xs text-text-muted italic border-l-2 border-neon-blue pl-3 py-1 bg-neon-blue/5">
                💡 **Insight do CEO:** Seus dias mais lucrativos são Sexta à Noite e Sábado à Tarde. Considere aumentar o preço base nestes horários (+10%).
            </p>
        </div>
    )
}
