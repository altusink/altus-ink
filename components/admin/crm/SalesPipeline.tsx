'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, DollarSign, Calendar, Clock, User, Filter } from 'lucide-react'
import { getSalesGoal } from '@/app/actions/settings'

// Types
type Booking = {
    id: string
    client_name: string
    booking_date: string
    estimated_price: number | null
    crm_stage: string
    artists: { stage_name: string }[] | null
}

const STAGES = {
    new: { id: 'new', title: 'Novos Leads', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    contacted: { id: 'contacted', title: 'Em Contato', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    proposal: { id: 'proposal', title: 'Aguardando Sinal', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    won: { id: 'won', title: 'Confirmado Agendado', color: 'bg-neon-green/10 text-neon-green border-neon-green/20' },
    lost: { id: 'lost', title: 'Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
}

export default function SalesPipeline() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [columns, setColumns] = useState<any>({
        new: [], contacted: [], proposal: [], won: [], lost: []
    })
    const [monthlyGoal, setMonthlyGoal] = useState(50000)
    const supabase = createClient()

    useEffect(() => {
        fetchBookings()
        fetchGoal()
    }, [])

    async function fetchGoal() {
        const goal = await getSalesGoal()
        setMonthlyGoal(goal)
    }

    async function fetchBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                client_name,
                booking_date,
                estimated_price,
                crm_stage,
                artists ( stage_name )
            `)
            .order('created_at', { ascending: false })

        if (data) {
            setBookings(data)
            organizeColumns(data)
        }
    }

    function organizeColumns(data: Booking[]) {
        const cols: any = { new: [], contacted: [], proposal: [], won: [], lost: [] }
        data.forEach(b => {
            const stage = b.crm_stage || 'new'
            if (cols[stage]) cols[stage].push(b)
        })
        setColumns(cols)
    }

    // Handle Drag & Drop
    async function onDragEnd(result: any) {
        if (!result.destination) return

        const { source, destination, draggableId } = result
        if (source.droppableId === destination.droppableId) return

        const sourceCol = [...columns[source.droppableId]]
        const destCol = [...columns[destination.droppableId]]
        const [movedItem] = sourceCol.splice(source.index, 1)

        movedItem.crm_stage = destination.droppableId
        destCol.splice(destination.index, 0, movedItem)

        setColumns({
            ...columns,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol
        })

        const { error } = await supabase
            .from('bookings')
            .update({ crm_stage: destination.droppableId })
            .eq('id', draggableId)

        if (error) {
            console.error('Error updating stage:', error)
            fetchBookings()
        }
    }

    const wonBookings = bookings.filter(b => b.crm_stage === 'won' || b.crm_stage === 'confirmed')
    const totalSales = wonBookings.reduce((acc, curr) => acc + (Number(curr.estimated_price) || 0), 0)
    const myCommission = Math.round(totalSales * 0.02)
    const progress = Math.min((totalSales / monthlyGoal) * 100, 100)

    return (
        <div className="h-full flex flex-col p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white font-heading">Pipeline de Vendas</h2>
                    <p className="text-text-muted">Acompanhe seus leads e bata a meta.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Minha Comissão (2%)</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-neon-green">€{myCommission.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Vendas Confirmadas</span>
                        <span className="text-2xl font-bold text-white">€{totalSales.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between col-span-2 md:col-span-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Meta Mensal</span>
                            <span className="text-xs text-white font-mono">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-right text-text-muted mt-1">€{(monthlyGoal / 1000).toFixed(0)}k Alvo</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/10">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                    <div className="px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-xl text-neon-green text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Sua comissão incide sobre vendas 'Confirmadas'</span>
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {Object.entries(STAGES).map(([stageId, stageInfo]) => (
                        <div key={stageId} className="min-w-[300px] w-[300px] flex flex-col bg-bg-card/50 rounded-2xl border border-white/5 backdrop-blur-sm">
                            <div className={`p-4 border-b border-white/5 flex items-center justify-between ${stageInfo.color} bg-opacity-5 rounded-t-2xl`}>
                                <h3 className="font-bold text-sm uppercase tracking-wider">{stageInfo.title}</h3>
                                <span className="bg-black/20 text-xs px-2 py-1 rounded-full font-mono">
                                    {columns[stageId]?.length || 0}
                                </span>
                            </div>

                            <Droppable droppableId={stageId}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                                    >
                                        {columns[stageId]?.map((booking: Booking, index: number) => (
                                            <Draggable key={booking.id} draggableId={booking.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-bg-dark border border-white/10 p-4 rounded-xl shadow-lg hover:border-white/20 hover:shadow-neon-green/5 transition-all group ${snapshot.isDragging ? 'rotate-2 scale-105 z-50 ring-2 ring-neon-green/50' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-white/5 rounded-lg text-text-muted group-hover:text-white transition-colors">
                                                                    <User className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="font-bold text-white text-sm truncate max-w-[120px]">{booking.client_name}</span>
                                                            </div>
                                                            {booking.estimated_price && (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-white font-bold text-sm">€{booking.estimated_price}</span>
                                                                    <span className="text-[10px] text-neon-green font-mono bg-neon-green/10 px-1 rounded flex items-center gap-1">
                                                                        <DollarSign className="w-2 h-2" />
                                                                        +{Math.round(booking.estimated_price * 0.02)} (2%)
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                                <Calendar className="w-3 h-3" />
                                                                {booking.booking_date ? format(new Date(booking.booking_date), 'dd/MM/yyyy') : 'Data não definida'}
                                                            </div>
                                                            {booking.artists && (
                                                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                                                                    {booking.artists.map(a => a.stage_name).join(', ') || 'Artista Indefinido'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    )
}
