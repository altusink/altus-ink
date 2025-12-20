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
    const [user, setUser] = useState<{ name: string } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('users').select('name').eq('id', user.id).single()
                setUser(data || { name: user.email?.split('@')[0] || 'Artista' })
            }
        }
        getUser()
    }, [])

    return (
        <div className="space-y-8">
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
                                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">{user?.name || '...'}</span>
                            </h1>
                            <p className="text-text-muted max-w-md">Pronto para criar arte hoje? Você tem 3 sessões confirmadas esta semana.</p>
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
                <StatCard label="Ganhos (Mês)" value="€4.2k" icon={<DollarSign size={18} />} trend="+12%" />
                <StatCard label="Sessões" value="18" icon={<Calendar size={18} />} />
                <StatCard label="Próx. Tour" value="Lisboa" icon={<MapPin size={18} />} highlight />
                <StatCard label="Hours" value="42h" icon={<Clock size={18} />} />
            </div>

            {/* Next Appointment (Big Card) */}
            <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Próxima Sessão</h2>
                    <Link href="/admin/bookings" className="text-neon-cyan text-sm hover:underline">Ver Agenda</Link>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-auto flex flex-col items-center bg-black/20 rounded-xl p-4 min-w-[120px]">
                        <span className="text-3xl font-bold text-white">12</span>
                        <span className="text-sm text-text-muted uppercase">Dez</span>
                        <div className="w-full h-px bg-white/10 my-2" />
                        <span className="text-neon-green font-mono text-sm">14:00</span>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <h3 className="text-2xl font-bold text-white">Sarah Connor</h3>
                            <p className="text-text-muted">Projeto: Realismo (Braço Fechado) • Sessão 2/3</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <Clock size={16} />
                                <span>Dur. Estimada: 4h</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <DollarSign size={16} />
                                <span className="text-neon-green font-bold">€850</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Link href="/admin/bookings/123-mock-id" className="px-6 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            Ver Ficha <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
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
