'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, MapPin, Plus, Trash2, Globe, Clock, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'

type TourSegment = {
    id: string
    country_name: string
    country_flag: string
    city_name: string
    start_date: string
    end_date: string
    time_slots: string[]
}

const COUNTRIES = [
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'França', flag: '🇫🇷' },
    { name: 'Holanda', flag: '🇳🇱' },
    { name: 'Itália', flag: '🇮🇹' },
    { name: 'Espanha', flag: '🇪🇸' },
    { name: 'Bélgica', flag: '🇧🇪' },
]

export default function TourManagement() {
    const [segments, setSegments] = useState<TourSegment[]>([])
    const [loading, setLoading] = useState(true)
    const [newSegment, setNewSegment] = useState({
        country_name: 'França',
        country_flag: '🇫🇷',
        city_name: '',
        start_date: '',
        end_date: '',
        time_slots: ['10:00', '14:00', '18:00'] // Now an array
    })

    // Config for adding slots
    const [tempSlot, setTempSlot] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchSegments()
    }, [])

    async function fetchSegments() {
        setLoading(true)
        const { data, error } = await supabase
            .from('tour_segments')
            .select('*')
            .order('start_date', { ascending: true })

        if (data) setSegments(data)
        setLoading(false)
    }

    // Slot Management
    function handleAddSlot(e?: React.KeyboardEvent) {
        if (e && e.key !== 'Enter') return
        e?.preventDefault()

        if (!tempSlot.trim()) return
        if (newSegment.time_slots.includes(tempSlot)) {
            setTempSlot('')
            return
        }

        setNewSegment(prev => ({
            ...prev,
            time_slots: [...prev.time_slots, tempSlot.trim()].sort()
        }))
        setTempSlot('')
    }

    function handleRemoveSlot(slotToRemove: string) {
        setNewSegment(prev => ({
            ...prev,
            time_slots: prev.time_slots.filter(s => s !== slotToRemove)
        }))
    }

    async function handleAdd() {
        if (!newSegment.city_name || !newSegment.start_date || !newSegment.end_date || newSegment.time_slots.length === 0) {
            alert('Preencha todos os campos e adicione pelo menos um horário.')
            return
        }

        const { error } = await supabase.from('tour_segments').insert([{
            country_name: newSegment.country_name,
            country_flag: newSegment.country_flag,
            city_name: newSegment.city_name,
            start_date: newSegment.start_date,
            end_date: newSegment.end_date,
            time_slots: newSegment.time_slots
        }])

        if (!error) {
            setNewSegment({
                ...newSegment,
                city_name: '',
                start_date: '',
                end_date: '',
                time_slots: ['10:00', '14:00', '18:00']
            })
            fetchSegments()
        } else {
            console.error(error)
            alert('Erro ao criar segmento. Verifique se a tabela possui a coluna time_slots.')
        }
    }

    async function handleDelete(id: string) {
        await supabase.from('tour_segments').delete().eq('id', id)
        fetchSegments()
    }

    return (
        <div className="space-y-8 animate-fade-in p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white font-heading">Gerenciar Tour & Datas</h2>
                    <p className="text-text-muted">Defina onde e quando você estará atendendo.</p>
                </div>
            </div>

            {/* Add New Segment */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                    <div className="p-2 bg-neon-green/10 rounded-lg">
                        <Plus className="w-5 h-5 text-neon-green" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Adicionar Nova Temporada</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 h-fit">
                        <div className="md:col-span-2">
                            <label className="text-xs text-text-muted mb-1.5 block font-medium uppercase tracking-wider">Localização</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white appearance-none focus:border-neon-green/50 outline-none transition-colors"
                                        value={newSegment.country_name}
                                        onChange={(e) => {
                                            const selected = COUNTRIES.find(c => c.name === e.target.value)
                                            if (selected) setNewSegment({ ...newSegment, country_name: selected.name, country_flag: selected.flag })
                                        }}
                                    >
                                        {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                                    </select>
                                    <Globe className="absolute right-3 top-3.5 w-4 h-4 text-text-muted pointer-events-none" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cidade (Ex: Paris)"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:border-neon-green/50 outline-none transition-colors"
                                    value={newSegment.city_name}
                                    onChange={e => setNewSegment({ ...newSegment, city_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs text-text-muted mb-1.5 block font-medium uppercase tracking-wider">Período</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-green/50 outline-none transition-colors"
                                    value={newSegment.start_date}
                                    onChange={e => setNewSegment({ ...newSegment, start_date: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-green/50 outline-none transition-colors"
                                    value={newSegment.end_date}
                                    onChange={e => setNewSegment({ ...newSegment, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Time Slots (The "Filling" Part) */}
                    <div className="lg:col-span-1 bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs text-text-muted font-medium uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-neon-green" />
                                Horários Disponíveis
                            </label>
                            <span className="text-[10px] text-white/30">{newSegment.time_slots.length} adicionados</span>
                        </div>

                        {/* Input */}
                        <div className="relative mb-4">
                            <input
                                type="time"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-white text-sm focus:bg-white/10 transition-all outline-none"
                                value={tempSlot}
                                onChange={e => setTempSlot(e.target.value)}
                                onKeyDown={handleAddSlot}
                            />
                            <button
                                onClick={() => handleAddSlot()}
                                disabled={!tempSlot}
                                className="absolute right-2 top-2 p-1 bg-neon-green text-black rounded-lg hover:scale-105 transition-all disabled:opacity-0 disabled:scale-90"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Grid List - Fills the empty space */}
                        <div className="flex-1 min-h-[120px]">
                            {newSegment.time_slots.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs opacity-40 border-2 border-dashed border-white/5 rounded-xl">
                                    <span>Lista Vazia</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 content-start custom-scrollbar max-h-[200px] overflow-y-auto pr-1">
                                    {newSegment.time_slots.map(slot => (
                                        <div key={slot} className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg group border border-transparent hover:border-white/10 transition-all">
                                            <span className="text-sm font-mono text-white">{slot}</span>
                                            <button
                                                onClick={() => handleRemoveSlot(slot)}
                                                className="text-white/20 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAdd}
                            className="mt-4 w-full bg-neon-green text-black font-bold p-3 rounded-xl hover:bg-neon-green/90 transition-all shadow-lg shadow-neon-green/20"
                        >
                            Confirmar & Criar
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? <p className="text-text-muted">Carregando...</p> : segments.map(seg => (
                    <div key={seg.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="text-2xl">{seg.country_flag}</div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{seg.city_name}</h4>
                                <p className="text-xs text-text-muted uppercase font-bold">{seg.country_name}</p>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
                            <div className="flex items-center gap-2 text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-lg">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {format(parseISO(seg.start_date), 'dd/MM')} até {format(parseISO(seg.end_date), 'dd/MM/yyyy')}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(seg.id)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                {!loading && segments.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl text-text-muted">
                        <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma data de tour configurada.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
