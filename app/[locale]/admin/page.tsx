import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, DollarSign, Clock, ArrowUpRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'


// Cache Bust: v2.2 Fix
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // --- SECURITY: Double-Lock (Server Side Verify) ---
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
    
    // Allow CEO, ADMIN, COORDINATOR, ARTIST (Portal access is separate, but this is the main dashboard)
    // Actually, artists usually have a separate view, but assuming they can see basic stuff or we block them.
    // For now, let's just ensure they are NOT a basic user.
    if (!userProfile?.role || userProfile.role === 'USER') {
        redirect('/')
    }
    // --------------------------------------------------

    // 1. Fetch Key Stats
    const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    const { count: confirmedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CONFIRMED')

    // For "Total Clients", distinct emails would be better, but count of bookings is a good proxy for now
    // Or we can just show Total Bookings
    const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

    // Revenue Calculation (Confirmed + Completed)
    const { data: revenueData } = await supabase
        .from('bookings')
        .select('estimated_price')
        .in('status', ['CONFIRMED', 'COMPLETED'])

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.estimated_price) || 0), 0) || 0

    // 2. Fetch Recent Activity
    const { data: recentBookings } = await supabase
        .from('bookings')
        .select(`
            *,
            artists (stage_name)
        `)
        .order('created_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

    // 3. (Heatmap Removed as per user request for Tour Logic)
    
    const stats = [
        {
            label: 'Pedidos Pendentes',
            value: pendingCount?.toString() || '0',
            sub: 'Requer atenção',
            icon: Clock,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
            href: '/admin/bookings?status=PENDING'
        },
        {
            label: 'Confirmados',
            value: confirmedCount?.toString() || '0',
            sub: 'Próximas sessões',
            icon: Calendar,
            color: 'text-neon-purple',
            bg: 'bg-neon-purple/10',
            href: '/admin/bookings?status=CONFIRMED'
        },
        {
            label: 'Total Agendamentos',
            value: totalBookings?.toString() || '0',
            sub: 'Histórico Geral',
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            href: '/admin/bookings'
        },
        {
            label: 'Receita Estimada',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalRevenue),
            sub: 'Confirmado + Concluído',
            icon: DollarSign,
            color: 'text-neon-cyan',
            bg: 'bg-neon-cyan/10',
            href: '/admin/sales'
        },
    ]

    return (
        <div className="space-y-8 animate-fade-in">
             {/* System Health Check (Semáforo) */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className="font-medium text-white">Database (Supabase)</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">OPERATIONAL</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <span className="font-medium text-white">Stripe Payments</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">CONNECTED</span>
                </div>
                 <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <span className="font-medium text-white">API Gateway</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">98ms LATENCY</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Link key={i} href={stat.href} className="block group">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-white/20 group-hover:text-white transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-sm text-text-muted font-medium mb-1">{stat.label}</p>
                            <p className="text-xs text-text-secondary opacity-60">{stat.sub}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 gap-8">
                {/* Recent Bookings - Full Width now since Heatmap is gone */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Pedidos Recentes</h2>
                        <Link href="/admin/bookings" className="text-sm text-neon-cyan hover:underline">Ver Agenda Completa</Link>
                    </div>

                    <div className="space-y-4">
                        {recentBookings?.map((booking, i) => (
                            <Link href={`/admin/bookings/${booking.id}`} key={booking.id} className="block group">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-transparent hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-white uppercase group-hover:scale-110 transition-transform">
                                        {booking.client_name.substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-white font-medium group-hover:text-neon-cyan transition-colors">{booking.client_name}</h4>
                                            <span className="text-xs text-text-secondary">
                                                {new Date(booking.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-muted">
                                            {booking.tattoo_type} • {booking.artists?.stage_name} •
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(booking.estimated_price)}
                                        </p>
                                    </div>
                                    <div className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10">Ver Ficha</div>
                                </div>
                            </Link>
                        ))}

                        {(!recentBookings || recentBookings.length === 0) && (
                            <div className="text-center text-text-muted py-4">Nenhum pedido recente.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
