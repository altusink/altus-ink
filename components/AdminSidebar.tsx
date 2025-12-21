'use client'

import React, { useState } from 'react'
import { Link, usePathname, useRouter } from '@/navigation'
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Palette, Menu, X, ShieldCheck, MapPin, Star, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: Calendar, label: 'Agendamentos', href: '/admin/bookings' },
        { icon: Users, label: 'Clientes', href: '/admin/clients' },
        { icon: Palette, label: 'Artistas', href: '/admin/artists' },
        { icon: MapPin, label: 'Tour & Datas', href: '/admin/tours' },
        { icon: MapPin, label: 'Endereços', href: '/admin/locations' },
        { icon: ShieldCheck, label: 'Guia do Guest', href: '/admin/guides' }, // Using ShieldCheck or Compass temporary
        { icon: LayoutDashboard, label: 'Vendas (CRM)', href: '/admin/sales' },
        { icon: MessageCircle, label: 'Comunicações', href: '/admin/communications' },
        { icon: Star, label: 'Portal do Artista', href: '/admin/portal' },
        { icon: ShieldCheck, label: 'Integrações', href: '/admin/integrations' },
        { icon: Settings, label: 'Configurações', href: '/admin/settings' }, // Adicionado
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed z-50 top-4 right-4 p-2 bg-black/80 border border-white/10 rounded-lg text-white backdrop-blur-md"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed md:sticky top-0 z-40 h-screen w-64 
                bg-black/95 md:bg-black/40 border-r border-white/10 
                flex flex-col backdrop-blur-xl transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="p-8 border-b border-white/10 flex items-center justify-between">
                    <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                        ALTUS <span className="text-white">ADMIN</span>
                    </h1>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-neon-green' : 'group-hover:text-white'} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
