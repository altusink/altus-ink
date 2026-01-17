'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Clock, MapPin, ChevronRight, Star, Image as ImageIcon, LayoutDashboard, Compass } from 'lucide-react'
import WelcomeGuide from '@/components/admin/portal/WelcomeGuide'
import BrandedContentStudio from '@/components/admin/portal/BrandedContentStudio'
import { Link } from '@/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function ArtistPortal() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'guide' | 'studio'>('dashboard')

    return (
        <div className="min-h-screen bg-bg-dark text-white pb-20 md:pb-8">
            {/* Header / Nav */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-6 overflow-x-auto custom-scrollbar">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'text-neon-cyan' : 'text-text-muted'}`}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button
                    onClick={() => setActiveTab('guide')}
                    className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'guide' ? 'text-neon-cyan' : 'text-text-muted'}`}
                >
                    <Compass size={18} /> Guia do Guest
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button
                    onClick={() => setActiveTab('studio')}
                    className={`flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'studio' ? 'text-neon-cyan' : 'text-text-muted'}`}
                >
                    <ImageIcon size={18} /> Content Studio 📸
                </button>
            </div>

            <div className="p-6 max-w-7xl mx-auto animate-fade-in">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'guide' && <WelcomeGuide />}
                {activeTab === 'studio' && <BrandedContentStudio />}
            </div>
        </div>
    )
}

// Extracted Dashboard Logic
function DashboardView() {
    const [user, setUser] = useState<{ name: string; email?: string } | null>(null)
    const [stats, setStats] = useState({
        earnings: 0,
        sessions: 0,
        nextLocation: 'Lisboa',
        hours: 0
    })
    const [nextBooking, setNextBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadDashboardData() {
            try {
                // 1. Get Auth User
                const { data: authData, error: authError } = await supabase.auth.getUser()
                if (authError || !authData?.user) {
                    console.error('Auth Error:', authError)
                    setLoading(false)
                    return
                }

                const authUser = authData.user
                
                // 2. Get User Profile (Safe Fallback)
                let userName = 'Artista'
                try {
                    const { data: userProfile } = await supabase.from('users').select('name').eq('id', authUser.id).single()
                    if (userProfile?.name) userName = userProfile.name
                } catch (e) { console.warn('User profile load fail', e) }

                setUser({ name: userName || authUser.email?.split('@')[0] || 'Artista', email: authUser.email })

                // 3. Get Artist ID
                const { data: artist, error: artistError } = await supabase.from('artists').select('id, city').eq('email', authUser.email).single()
                
                if (artist && !artistError) {
                    // 4. Get Bookings
                    const today = new Date().toISOString().split('T')[0]
                    const { data: bookings } = await supabase
                        .from('bookings')
                        .select('*')
                        .eq('artist_id', artist.id)
                        .gte('booking_date', today)
                        .order('booking_date', { ascending: true })
                        .order('booking_time', { ascending: true })

                    if (bookings && bookings.length > 0) {
                        setNextBooking(bookings[0])
                        
                        // Calculate Stats
                        const totalEarnings = bookings.reduce((acc, curr) => acc + (Number(curr.estimated_price) || 0), 0)
                        const totalHours = bookings.reduce((acc, curr) => acc + (Number(curr.duration_hours) || 0), 0)
                        
                        setStats({
                            earnings: totalEarnings,
                            sessions: bookings.length,
                            nextLocation: artist.city || 'Lisboa',
                            hours: totalHours
                        })
                    }
                }
            } catch (error) {
                console.error('Critical Dashboard Error:', error)
            } finally {
                setLoading(false)
            }
        }
        loadDashboardData()
    }, [])

    if (loading) return <div className="p-8 text-center animate-pulse text-text-muted">Carregando painel...</div>

    // Helper for safe dates
    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Data Inválida'
            const d = new Date(dateString)
            if (isNaN(d.getTime())) return 'Data Inválida'
            return d.getDate().toString()
        } catch { return '??' }
    }

    const formatMonth = (dateString: string) => {
        try {
            if (!dateString) return ''
            const d = new Date(dateString)
            if (isNaN(d.getTime())) return ''
            return d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
        } catch { return '' }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-white/10 p-8">
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-4">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                <span>Star Artist</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
                                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">{user?.name || 'Artista'}</span>
                            </h1>
                            <p className="text-text-muted max-w-md">
                                {stats.sessions > 0 
                                    ? `Você tem ${stats.sessions} sessões confirmadas nas próximas semanas.` 
                                    : 'Nenhum agendamento próximo encontrado.'}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-[2px]">
                                <div className="w-full h-full rounded-full bg-bg-dark flex items-center justify-center font-bold text-xl uppercase">
                                    {user?.name?.substring(0, 2) || 'AL'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/20 blur-[100px] pointer-events-none" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Projeção (Total)" value={`€${(stats.earnings/1000).toFixed(1)}k`} icon={<DollarSign size={18} />} trend="+100%" />
                <StatCard label="Sessões" value={stats.sessions.toString()} icon={<Calendar size={18} />} />
                <StatCard label="Base" value={stats.nextLocation} icon={<MapPin size={18} />} highlight />
                <StatCard label="Horas Estúdio" value={`${stats.hours}h`} icon={<Clock size={18} />} />
            </div>

            {/* Next Appointment (Big Card) */}
            {nextBooking ? (
                <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-neon-cyan/30 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            Próxima Sessão
                        </h2>
                        <Link href="/admin/bookings" className="text-neon-cyan text-sm hover:underline">Ver Agenda</Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-auto flex flex-col items-center bg-black/40 rounded-xl p-4 min-w-[120px] border border-white/5 group-hover:border-neon-cyan/50 transition-colors">
                            <span className="text-3xl font-bold text-white">{formatDate(nextBooking.booking_date)}</span>
                            <span className="text-sm text-text-muted uppercase">{formatMonth(nextBooking.booking_date)}</span>
                            <div className="w-full h-px bg-white/10 my-2" />
                            <span className="text-neon-green font-mono text-sm">{nextBooking.booking_time?.slice(0, 5)}</span>
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{nextBooking.client_name}</h3>
                                <p className="text-text-muted capitalize">
                                    {nextBooking.tattoo_type?.replace('-', ' ') || 'Tatuagem'} • {nextBooking.body_location || 'Local não esp.'}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Clock size={16} />
                                    <span>{nextBooking.duration_hours}h estimadas</span>
                                </div>
                                {nextBooking.estimated_price > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <DollarSign size={16} />
                                        <span className="text-neon-green font-bold">€{nextBooking.estimated_price}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <Link 
                                href={`/admin/bookings/${nextBooking.id}`} 
                                className="px-6 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                Ver Ficha <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-12 text-center">
                    <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Agenda Livre</h3>
                    <p className="text-text-muted mb-6">Você não tem sessões agendadas para os próximos dias.</p>
                    <Link href="/admin/bookings" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                        Ver Calendário Completo
                    </Link>
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value, icon, trend, highlight }: { label: string, value: string, icon: any, trend?: string, highlight?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border ${highlight ? 'bg-neon-cyan/10 border-neon-cyan/30' : 'bg-white/5 border-white/10'} flex flex-col justify-between h-28`}>
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${highlight ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-text-muted'}`}>
                    {icon}
                </div>
                {trend && <span className="text-xs text-neon-green font-mono bg-neon-green/10 px-1.5 py-0.5 rounded">{trend}</span>}
            </div>
            <div>
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">{label}</p>
                <p className={`text-2xl font-bold ${highlight ? 'text-neon-cyan' : 'text-white'}`}>{value}</p>
            </div>
        </div>
    )
}
