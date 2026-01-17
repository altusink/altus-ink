'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Save, Plus, Trash2, Globe } from 'lucide-react'

// Hardcoded cities list for dropdown or free text
const TARGET_CITIES = ['Paris', 'Amsterdam', 'Berlin', 'London', 'Lisbon', 'Madrid', 'Luxemburgo', 'Bruxelas', 'Milão', 'São Paulo']

type Location = {
    id: string
    city_name: string
    address_line1: string
    address_line2: string
    maps_link: string
    instructions: string
}

export default function LocationsAdmin() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        city_name: '',
        address_line1: '',
        address_line2: '',
        maps_link: '',
        instructions: ''
    })

    const supabase = createClient()

    useEffect(() => {
        fetchLocations()
    }, [])

    async function fetchLocations() {
        setLoading(true)
        const { data } = await supabase.from('tour_locations').select('*').order('city_name')
        if (data) setLocations(data)
        setLoading(false)
    }

    async function handleSave() {
        if (!formData.city_name || !formData.address_line1) {
            alert('Cidade e Endereço são obrigatórios.')
            return
        }

        // Check if updating or inserting
        const existing = locations.find(l => l.city_name === formData.city_name)
        
        let error
        if (existing) {
             const { error: err } = await supabase
                .from('tour_locations')
                .update(formData)
                .eq('id', existing.id)
            error = err
        } else {
             const { error: err } = await supabase
                .from('tour_locations')
                .insert([formData])
            error = err
        }

        if (!error) {
            setFormData({ city_name: '', address_line1: '', address_line2: '', maps_link: '', instructions: '' })
            fetchLocations()
        } else {
            console.error(error)
            alert('Erro ao salvar.')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza?')) return
        await supabase.from('tour_locations').delete().eq('id', id)
        fetchLocations()
    }

    function handleEdit(loc: Location) {
        setFormData({
            city_name: loc.city_name,
            address_line1: loc.address_line1,
            address_line2: loc.address_line2 || '',
            maps_link: loc.maps_link || '',
            instructions: loc.instructions || ''
        })
    }

    return (
        <div className="space-y-8 animate-fade-in p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white font-heading">Endereços (Confirmação)</h2>
                    <p className="text-text-muted">Gerencie os endereços fictícios ou reais que aparecem após o pagamento.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                    <h3 className="text-xl font-bold text-white mb-6">Editar Localização</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Cidade</label>
                            <div className="relative">
                                <input 
                                    list="cities" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                    value={formData.city_name}
                                    onChange={e => setFormData({...formData, city_name: e.target.value})}
                                    placeholder="Ex: Paris"
                                />
                                <datalist id="cities">
                                    {TARGET_CITIES.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Endereço Linha 1</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                value={formData.address_line1}
                                onChange={e => setFormData({...formData, address_line1: e.target.value})}
                                placeholder="Rua, Número"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Complemento / Bairro</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                value={formData.address_line2}
                                onChange={e => setFormData({...formData, address_line2: e.target.value})}
                                placeholder="Apto 101, Centro"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Link Google Maps</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                value={formData.maps_link}
                                onChange={e => setFormData({...formData, maps_link: e.target.value})}
                                placeholder="https://maps.google.com/..."
                            />
                        </div>

                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Instruções Extras</label>
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green h-24"
                                value={formData.instructions}
                                onChange={e => setFormData({...formData, instructions: e.target.value})}
                                placeholder="Código portão, referência..."
                            />
                        </div>

                        <button 
                            onClick={handleSave}
                            className="w-full py-3 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex justify-center items-center gap-2"
                        >
                            <Save size={18} /> Salvar Localização
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 grid grid-cols-1 gap-4 content-start">
                    {locations.map(loc => (
                        <div key={loc.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-white/20 transition-all">
                            <div>
                                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MapPin className="text-neon-green w-5 h-5" /> 
                                    {loc.city_name}
                                </h4>
                                <p className="text-white/80 mt-1">{loc.address_line1}</p>
                                {loc.address_line2 && <p className="text-text-muted text-sm">{loc.address_line2}</p>}
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleEdit(loc)}
                                    className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 text-sm font-bold"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(loc.id)}
                                    className="p-2 text-text-muted hover:text-red-500 hover:bg-white/5 rounded-lg"
                                    aria-label="Excluir localização"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && locations.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl text-text-muted">
                            <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma localização cadastrada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
