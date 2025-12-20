'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Save, MapPin, Phone, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type GuideItem = {
    id: string
    artist_id: string
    section: 'where_to_eat' | 'emergency' | 'tips'
    title: string
    description: string
    contact_info?: string
    address?: string
    image_url?: string
}

export default function GuestGuideAdmin() {
    const supabase = createClient()
    const router = useRouter()
    const [guides, setGuides] = useState<GuideItem[]>([])
    const [artists, setArtists] = useState<any[]>([])
    const [selectedArtist, setSelectedArtist] = useState<string>('')
    const [loading, setLoading] = useState(true)

    // Form State
    const [formData, setFormData] = useState<Partial<GuideItem>>({
        section: 'where_to_eat',
        title: '',
        description: '',
        contact_info: '',
        address: ''
    })
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        fetchArtists()
    }, [])

    useEffect(() => {
        if (selectedArtist) fetchGuides(selectedArtist)
    }, [selectedArtist])

    async function fetchArtists() {
        const { data } = await supabase.from('artists').select('id, stage_name')
        if (data) {
            setArtists(data)
            if (data.length > 0) setSelectedArtist(data[0].id)
        }
    }

    async function fetchGuides(artistId: string) {
        setLoading(true)
        const { data } = await supabase
            .from('artist_guest_guides')
            .select('*')
            .eq('artist_id', artistId)
            .order('created_at', { ascending: false })
        
        if (data) setGuides(data as GuideItem[])
        setLoading(false)
    }

    async function handleSave() {
        if (!selectedArtist || !formData.title || !formData.section) {
            alert('Preencha os campos obrigatórios')
            return
        }

        const payload = {
            ...formData,
            artist_id: selectedArtist
        }

        let error
        if (editingId) {
            const { error: err } = await supabase
                .from('artist_guest_guides')
                .update(payload)
                .eq('id', editingId)
            error = err
        } else {
            const { error: err } = await supabase
                .from('artist_guest_guides')
                .insert([payload])
            error = err
        }

        if (!error) {
            setFormData({ section: 'where_to_eat', title: '', description: '', contact_info: '', address: '' })
            setEditingId(null)
            fetchGuides(selectedArtist)
        } else {
            console.error(error)
            alert('Erro ao salvar')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza?')) return
        await supabase.from('artist_guest_guides').delete().eq('id', id)
        fetchGuides(selectedArtist)
    }

    function handleEdit(item: GuideItem) {
        setEditingId(item.id)
        setFormData(item)
    }

    return (
        <div className="space-y-8 animate-fade-in p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-white">Guia do Guest</h2>
                    <p className="text-text-muted">Gerencie dicas e contatos de emergência para os clientes de cada tatuador.</p>
                </div>
                
                {/* Artist Selector */}
                <select
                    aria-label="Selecione um Artista"
                    className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                    value={selectedArtist}
                    onChange={e => setSelectedArtist(e.target.value)}
                >
                    {artists.map(a => <option key={a.id} value={a.id}>{a.stage_name}</option>)}
                </select>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
                    <h3 className="text-xl font-bold text-white mb-6">
                        {editingId ? 'Editar Item' : 'Novo Item'}
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Seção</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setFormData({...formData, section: 'where_to_eat'})}
                                    className={`p-2 rounded-lg border text-sm font-bold ${formData.section === 'where_to_eat' ? 'bg-neon-green text-bg-dark border-neon-green' : 'bg-white/5 border-white/10 text-text-muted'}`}
                                >
                                    Onde Comer
                                </button>
                                <button
                                    onClick={() => setFormData({...formData, section: 'emergency'})}
                                    className={`p-2 rounded-lg border text-sm font-bold ${formData.section === 'emergency' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-white/10 text-text-muted'}`}
                                >
                                    Emergência
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Título / Nome</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="Ex: Sushi Night"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Descrição</label>
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green h-20"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Melhor sushi da cidade..."
                            />
                        </div>

                        {formData.section === 'emergency' && (
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Telefone / Contato</label>
                                <input 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                    value={formData.contact_info}
                                    onChange={e => setFormData({...formData, contact_info: e.target.value})}
                                    placeholder="+55 11..."
                                />
                            </div>
                        )}

                        {formData.section === 'where_to_eat' && (
                            <div>
                                <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Endereço (Opcional)</label>
                                <input 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    placeholder="Rua X, 123..."
                                />
                            </div>
                        )}

                        <button 
                            onClick={handleSave}
                            className="w-full py-3 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex justify-center items-center gap-2"
                        >
                            <Save size={18} /> Salvar Item
                        </button>
                        {editingId && (
                            <button 
                                onClick={() => { setEditingId(null); setFormData({ section: 'where_to_eat', title: '', description: '', contact_info: '', address: '' }); }}
                                className="w-full py-2 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Check if empty */}
                    {!loading && guides.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl text-text-muted">
                            <p>Nenhum item cadastrado para este artista.</p>
                        </div>
                    )}

                    {/* Group by Section */}
                    {['where_to_eat', 'emergency'].map(section => {
                        const items = guides.filter(g => g.section === section)
                        if (items.length === 0) return null
                        
                        return (
                            <div key={section} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${section === 'emergency' ? 'text-red-400' : 'text-neon-green'}`}>
                                    {section === 'emergency' ? <Phone size={24} /> : <MapPin size={24} />}
                                    {section === 'emergency' ? 'Emergência' : 'Onde Comer'}
                                </h3>
                                
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.id} className="bg-black/20 p-4 rounded-xl flex justify-between items-start group hover:bg-black/30 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{item.title}</h4>
                                                <p className="text-text-secondary text-sm mb-2">{item.description}</p>
                                                {item.contact_info && (
                                                    <p className="text-red-400 font-mono text-sm flex items-center gap-1">
                                                        <Phone size={12} /> {item.contact_info}
                                                    </p>
                                                )}
                                                {item.address && (
                                                    <p className="text-text-muted text-xs flex items-center gap-1">
                                                        <MapPin size={12} /> {item.address}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(item)} className="p-2 bg-white/10 rounded-lg hover:text-neon-blue" aria-label="Editar item">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/10 rounded-lg hover:text-red-500" aria-label="Excluir item">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
