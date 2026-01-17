'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Upload, Instagram, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type Artist = {
    id: string
    name: string
    stage_name: string
    bio: string
    styles: string[] // Array in DB? Or string? schema says text[] usually
    image_url: string
    instagram: string
    city: string
    country: string
    slug: string
}

export default function ArtistsManager({ initialArtists }: { initialArtists: any[] }) {
    const [artists, setArtists] = useState<Artist[]>(initialArtists)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    // Form State
    const [formData, setFormData] = useState<Partial<Artist>>({
        name: '',
        stage_name: '',
        bio: '',
        styles: [],
        instagram: '',
        city: 'Lisboa',
        country: 'Portugal',
        slug: ''
    })

    const handleOpenModal = (artist?: Artist) => {
        if (artist) {
            setEditingArtist(artist)
            setFormData(artist)
        } else {
            setEditingArtist(null)
            setFormData({
                name: '',
                stage_name: '',
                bio: '',
                styles: [],
                instagram: '',
                city: 'Lisboa',
                country: 'Portugal',
                slug: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este artista?')) return
        
        const { error } = await supabase.from('artists').delete().eq('id', id)
        if (error) {
            alert('Erro ao excluir')
        } else {
            setArtists(prev => prev.filter(a => a.id !== id))
            router.refresh()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Basic Auto-Slug if missing
        const slugToUse = formData.slug || formData.stage_name?.toLowerCase().replace(/\s+/g, '-') || 'artist-' + Date.now()
        
        const payload = {
            ...formData,
            slug: slugToUse
        }

        if (editingArtist) {
            // Update
            const { data, error } = await supabase
                .from('artists')
                .update(payload)
                .eq('id', editingArtist.id)
                .select()
            
            if (error) {
                alert('Erro ao atualizar: ' + error.message)
            } else if (data) {
                setArtists(prev => prev.map(a => a.id === editingArtist.id ? data[0] : a))
                setIsModalOpen(false)
                router.refresh()
            }
        } else {
            // Create
            const { data, error } = await supabase
                .from('artists')
                .insert([payload])
                .select()
                
            if (error) {
                alert('Erro ao criar: ' + error.message)
            } else if (data) {
                setArtists(prev => [...prev, data[0]])
                setIsModalOpen(false)
                router.refresh()
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                    <h3 className="text-white font-bold">{artists.length} Artistas Cadastrados</h3>
                    <p className="text-sm text-text-muted">Gerencie o time Altus Ink</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-green text-bg-dark font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} /> Novo Artista
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                    <div key={artist.id} className="group relative bg-bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-neon-green/50 transition-all">
                        {/* Image */}
                        <div className="relative h-48 w-full bg-black/50">
                            {artist.image_url ? (
                                <Image 
                                    src={artist.image_url} 
                                    alt={artist.stage_name} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">Sem Foto</div>
                            )}
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(artist)} aria-label="Editar artista" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(artist.id)} aria-label="Excluir artista" className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-5">
                            <h4 className="text-xl font-bold text-white mb-1">{artist.stage_name}</h4>
                            <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                                <MapPin size={12} /> {artist.city}, {artist.country}
                            </div>
                            
                            {/* Styles Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Array.isArray(artist.styles) && artist.styles.map((style: string) => (
                                    <span key={style} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-text-secondary uppercase tracking-wide border border-white/5">
                                        {style}
                                    </span>
                                ))}
                            </div>

                            <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-neon-blue hover:underline">
                                <Instagram size={12} /> Instagram
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-bg-card border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">{editingArtist ? 'Editar Artista' : 'Novo Artista'}</h2>
                            <button onClick={() => setIsModalOpen(false)} aria-label="Fechar"><X className="text-text-muted hover:text-white" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-text-muted">Nome Real</label>
                                    <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white" 
                                        value={formData.name || ''} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        aria-label="Nome Real"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-text-muted">Nome Artístico (Stage Name)</label>
                                    <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                                        value={formData.stage_name || ''} 
                                        onChange={e => setFormData({...formData, stage_name: e.target.value})}
                                        aria-label="Nome Artístico"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm text-text-muted">Bio (Resumo)</label>
                                <textarea 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white h-24"
                                    value={formData.bio || ''} 
                                    onChange={e => setFormData({...formData, bio: e.target.value})}
                                    aria-label="Biografia"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-text-muted">Instagram (URL)</label>
                                    <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                                        value={formData.instagram || ''} 
                                        onChange={e => setFormData({...formData, instagram: e.target.value})}
                                        aria-label="Instagram URL"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-text-muted">Foto (URL)</label>
                                    <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                                        value={formData.image_url || ''} 
                                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                                        placeholder="https://..."
                                        aria-label="Foto URL"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-text-muted">Cidade</label>
                                    <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                                        value={formData.city || ''} 
                                        onChange={e => setFormData({...formData, city: e.target.value})}
                                        aria-label="Cidade"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-text-muted">País</label>
                                    <input 
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                                        value={formData.country || ''} 
                                        onChange={e => setFormData({...formData, country: e.target.value})}
                                        aria-label="País"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-text-muted">Estilos (separados por vírgula)</label>
                                <input 
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                                    value={Array.isArray(formData.styles) ? formData.styles.join(', ') : formData.styles || ''} 
                                    onChange={e => setFormData({...formData, styles: e.target.value.split(',').map(s => s.trim())})}
                                    placeholder="Realismo, Preto e Cinza, Oriental..."
                                    aria-label="Estilos de Tatuagem"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3 bg-neon-green text-bg-dark font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4"
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Artista'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
