'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Coffee, AlertTriangle } from 'lucide-react'

type GuideItem = {
    id: string
    section: 'where_to_eat' | 'emergency'
    title: string
    description: string
    contact_info?: string
    address?: string
}

export default function WelcomeGuide() {
    const [guides, setGuides] = useState<GuideItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadGuides() {
            const { data: { user } } = await supabase.auth.getUser()
            
            // Default query for guides
            let query = supabase.from('artist_guest_guides').select('*')
            
            // If user is logged in, try to filter by their artist ID if possible
            if (user) {
                const { data: artist } = await supabase.from('artists').select('id').eq('email', user.email).single()
                if (artist) {
                    query = query.eq('artist_id', artist.id)
                }
            }
            
            const { data } = await query
            if (data) setGuides(data as GuideItem[])
            setLoading(false)
        }
        loadGuides()
    }, [])

    if (loading) return <div className="p-8 text-center text-text-muted animate-pulse">Carregando guia...</div>

    const eatPlaces = guides.filter(g => g.section === 'where_to_eat')
    const emergencyContacts = guides.filter(g => g.section === 'emergency')

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-2 font-heading text-white">Digital Welcome Pack 🌍</h2>
                <p className="text-text-muted">Tudo que você precisa para sua estadia.</p>
            </div>

            <div className="space-y-8">
                {/* Where to Eat */}
                <div>
                    <h3 className="text-xl font-bold text-neon-green mb-4 flex items-center gap-2">
                        <Coffee size={20} /> Onde Comer
                    </h3>
                    <div className="space-y-3">
                        {eatPlaces.length > 0 ? eatPlaces.map(place => (
                            <div key={place.id} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-white text-lg mb-1">{place.title}</h4>
                                <p className="text-sm text-text-secondary leading-relaxed">{place.description}</p>
                                {place.address && (
                                    <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5 border-t border-white/5 pt-2">
                                        <MapPin size={12} className="text-neon-cyan" /> {place.address}
                                    </p>
                                )}
                            </div>
                        )) : (
                            <p className="text-text-muted text-sm italic p-4 border border-dashed border-white/10 rounded-xl">
                                Nenhuma recomendação cadastrada ainda.
                            </p>
                        )}
                    </div>
                </div>

                {/* Emergency */}
                <div>
                    <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Emergência
                    </h3>
                    <div className="space-y-3">
                        {emergencyContacts.length > 0 ? emergencyContacts.map(contact => (
                            <div key={contact.id} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl hover:bg-red-500/10 transition-colors">
                                <h4 className="font-bold text-white text-lg mb-1">{contact.title}</h4>
                                <p className="text-sm text-text-secondary mb-2">{contact.description}</p>
                                {contact.contact_info && (
                                    <p className="text-lg font-mono text-red-400 font-bold flex items-center gap-2 bg-black/20 p-2 rounded-lg w-fit">
                                        <Phone size={16} /> {contact.contact_info}
                                    </p>
                                )}
                            </div>
                        )) : (
                            <p className="text-text-muted text-sm italic p-4 border border-dashed border-white/10 rounded-xl">
                                Nenhum contato de emergência.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
