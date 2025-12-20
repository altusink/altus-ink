'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, List, Search, Clock, MapPin, X, TrendingUp, Filter, ShieldCheck, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'
import { format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Booking = {
    id: string
    booking_date: string
    booking_time: string
    client_name: string
    client_email: string
    status: string
    tattoo_type: string
    deposit_amount: number
    estimated_price: number
    tattoo_description?: string
    body_location?: string
    duration_hours?: number
    reference_images?: string[]
    artists: {
        stage_name: string
    } | null
}

export default function BookingsManager({ bookings, userRole }: { bookings: Booking[], userRole: string }) {
    const [view, setView] = useState<'list' | 'calendar'>('list')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.client_email.toLowerCase().includes(searchTerm.toLowerCase())

        const bookingDate = parseISO(booking.booking_date)
        const matchesDate = selectedDate ? isSameDay(bookingDate, selectedDate) : true

        return matchesSearch && matchesDate
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-neon-green/20 text-neon-green border-neon-green/30'
            case 'PENDING': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            case 'COMPLETED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            default: return 'bg-white/10 text-white border-white/20'
        }
    }

    // Days with bookings for calendar highlights
    const bookedDays = bookings.map(b => parseISO(b.booking_date))

    // Date Quick Filters
    const handleQuickFilter = (range: 'today' | 'week' | 'month' | 'all') => {
        const today = new Date()
        if (range === 'all') {
            setSelectedDate(undefined)
        } else if (range === 'today') {
            setSelectedDate(today)
        } else {
            // Logic for week/month can be more complex, but for now we set a flag or just reset selectedDate (simplification)
            // For true range filtering, we would need start/end date state. 
            // Let's implement active Range filtering logic here.
            setSelectedDate(undefined) // Reset specific date
        }
    }

    // Financial calculations based on filteredBookings
    const totalRevenue = filteredBookings.reduce((acc, curr) => acc + (Number(curr.estimated_price) || 0), 0)
    const totalDeposits = filteredBookings.reduce((acc, curr) => acc + (Number(curr.deposit_amount) || 0), 0)

    return (
        <div className="space-y-6">
            {/* Financial Stats Bar (Hidden for Coordinators) */}
            {userRole !== 'COORDINATOR' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col">
                        <span className="text-xs text-text-muted uppercase font-bold">Valor Total (Visível)</span>
                        <span className="text-2xl font-bold text-white">€{totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col">
                        <span className="text-xs text-text-muted uppercase font-bold">Entrada (Sinais)</span>
                        <span className="text-2xl font-bold text-neon-green">€{totalDeposits.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:col-span-2 justify-center">
                        <span className="text-xs text-text-muted uppercase font-bold mb-2">Filtros Rápidos</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleQuickFilter('today')} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white border border-white/10 transition-colors">Hoje</button>
                            <button onClick={() => handleQuickFilter('all')} className="px-3 py-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg text-xs border border-neon-green/30 transition-colors">Todos</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* ... existing toolbar code ... */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'
                            }`}
                    >
                        <List size={16} /> Lista
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'
                            }`}
                    >
                        <CalendarIcon size={16} /> Calendário
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Location Filter */}
                    <div className="relative w-full md:w-48">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <select 
                            aria-label="Filtrar por Localização"
                            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm focus:border-neon-green/50 outline-none transition-colors appearance-none text-text-muted"
                        >
                            <option value="">Todas Localizações</option>
                            <option value="lisboa">🇵🇹 Lisboa, Portugal</option>
                            <option value="paris">🇫🇷 Paris, França</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm focus:border-neon-green/50 outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Active Date Filter Chip */}
            {selectedDate && (
                <div className="flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 px-3 py-1.5 rounded-full w-fit animate-fade-in">
                    <span className="text-neon-green text-sm font-medium">
                        Filtrando: {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <button onClick={() => setSelectedDate(undefined)} aria-label="Limpar filtro de data" className="text-neon-green hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className={view === 'calendar' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-text-secondary text-xs uppercase tracking-wider bg-white/5">
                                        <th className="p-4 font-medium">Cliente</th>
                                        <th className="p-4 font-medium">Artista</th>
                                        <th className="p-4 font-medium">Data</th>
                                        <th className="p-4 font-medium">Status</th>
                                        {userRole !== 'COORDINATOR' && <th className="p-4 font-medium text-right">Valor</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredBookings.map((booking) => (
                                        <tr
                                            key={booking.id}
                                            onClick={() => setSelectedBooking(booking)}
                                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm">{booking.client_name}</span>
                                                    <span className="text-xs text-text-muted">{booking.client_email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-white">{booking.artists?.stage_name}</span>
                                                <span className="text-xs text-text-muted block">{booking.tattoo_type}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-white">
                                                        <CalendarIcon className="w-3 h-3 text-neon-green" />
                                                        {format(parseISO(booking.booking_date), 'dd/MM/yyyy')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            {userRole !== 'COORDINATOR' && (
                                                <td className="p-4 text-right">
                                                    <span className="font-bold text-white text-sm">
                                                        €{booking.estimated_price}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {filteredBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-text-muted">
                                                Nenhum agendamento encontrado para este filtro.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Calendar Sidebar */}
                {view === 'calendar' && (
                    <div className="bg-bg-card border border-white/10 rounded-3xl p-6 h-fit animate-fade-in">
                        <h3 className="text-lg font-bold text-white mb-4">Calendário</h3>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={ptBR}
                            modifiers={{
                                booked: bookedDays
                            }}
                            modifiersClassNames={{
                                booked: 'bg-white/10 font-bold text-neon-green',
                                selected: 'bg-neon-green text-bg-dark font-bold rounded-full'
                            }}
                            classNames={{
                                root: 'w-full',
                                caption: 'flex justify-center relative items-center pt-1 mb-4 text-white',
                                day: 'w-10 h-10 p-0 font-normal hover:bg-white/10 rounded-full transition-colors text-white',
                            }}
                        />
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-white mb-3">Legenda</h4>
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                                Dia com agendamento
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-bg-card border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedBooking.client_name}</h2>
                                <p className="text-text-muted">{selectedBooking.client_email}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} aria-label="Fechar modal" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {/* Consent Form Link */}
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-white">
                                        <ShieldCheck className="w-5 h-5 text-neon-blue" />
                                        <span className="text-sm font-bold">Termo de Consentimento</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.open(`/consent/${selectedBooking.id}`, '_blank')}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                        >
                                            <LinkIcon size={12} /> Abrir
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/consent/${selectedBooking.id}`
                                                navigator.clipboard.writeText(link)
                                                toast.success('Link copiado!')
                                            }}
                                            className="px-3 py-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                        >
                                            Copiar Link
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Detalhes da Sessão</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-white">
                                            <CalendarIcon className="w-4 h-4 text-neon-green" />
                                            <span>{format(parseISO(selectedBooking.booking_date), 'dd ')} de {format(parseISO(selectedBooking.booking_date), 'MMMM, yyyy', { locale: ptBR })}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white">
                                            <Clock className="w-4 h-4 text-neon-green" />
                                            <span>{selectedBooking.booking_time} ({selectedBooking.duration_hours || 4}h)</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white">
                                            <MapPin className="w-4 h-4 text-neon-green" />
                                            <span>Estúdio Principal (Lisboa)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Financeiro</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">Valor Total Estimado</span>
                                            <span className="text-white font-bold">€{selectedBooking.estimated_price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">Sinal Pago</span>
                                            <span className="text-neon-green font-bold">€{selectedBooking.deposit_amount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-text-secondary uppercase mb-2">Ideia da Tatuagem</h3>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white">
                                        <p className="mb-2"><strong className="text-neon-blue">Estilo:</strong> {selectedBooking.tattoo_type}</p>
                                        <p className="mb-2"><strong className="text-neon-blue">Local do Corpo:</strong> {selectedBooking.body_location}</p>
                                        <p className="italic opacity-80">"{selectedBooking.tattoo_description}"</p>
                                    </div>
                                </div>

                                {selectedBooking.reference_images && selectedBooking.reference_images.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-text-secondary uppercase mb-2">Referências</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedBooking.reference_images.map((img: string, i: number) => (
                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" aria-label="Ver imagem de referência" className="block aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors relative">
                                                    <Image 
                                                        src={img} 
                                                        alt="Referência" 
                                                        fill 
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
                            {selectedBooking.status !== 'CANCELLED' && (
                                <button 
                                    onClick={() => handleUpdateStatus('CANCELLED')}
                                    className="px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium transition-colors"
                                >
                                    Cancelar Pedido
                                </button>
                            )}
                            
                            {selectedBooking.status === 'PENDING' && (
                                <button 
                                    onClick={() => handleUpdateStatus('CONFIRMED')}
                                    className="px-6 py-2 rounded-xl bg-neon-green text-bg-dark font-bold hover:bg-neon-green/90 transition-colors"
                                >
                                    Confirmar Agendamento
                                </button>
                            )}

                             {selectedBooking.status === 'CONFIRMED' && (
                                <button 
                                    onClick={() => handleUpdateStatus('COMPLETED')}
                                    className="px-6 py-2 rounded-xl bg-neon-blue text-bg-dark font-bold hover:bg-neon-blue/90 transition-colors"
                                >
                                    Concluir (Realizado)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    async function handleUpdateStatus(newStatus: string) {
        if (!selectedBooking) return
        if (!confirm(`Mudar status para ${newStatus}?`)) return

        const { error } = await createClient()
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', selectedBooking.id)

        if (error) {
            alert('Erro ao atualizar status')
        } else {
            // Optimistic update or refresh
            window.location.reload() // Simple refresh to fetch new server data
        }
    }
}
