import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AIChatButton from '@/components/admin/AIChatButton'
import LiquidBackground from '@/components/LiquidBackground' // NEW
import { Calendar, Users, Globe, MapPin, BarChart3 } from 'lucide-react'

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    let userProfile = null
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('name, role')
            .eq('id', user.id)
            .single()
        userProfile = data
    }

    if (!user) {
        // Redirect to login if no user found
        // Using simple path allows next-intl to handle locale automatically
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-bg-dark flex text-white relative isolate">
            {/* Global Animated Background for Admin */}
            <LiquidBackground />
            {/* Sidebar (Fixed Left) */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header (Optional or just padding) */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* User Welcome Header */}
                        <header className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold font-heading">
                                    Bem-vindo, <span className="text-neon-green">{userProfile?.name || user.email?.split('@')[0]}</span>
                                </h1>
                                <p className="text-text-muted mt-1">
                                    Visão geral do império Altus Ink.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-text-secondary">
                                    {user?.email}
                                </div>
                            </div>
                        </header>

                        {children}

                        <footer className="pt-20 pb-8 text-center">
                            <p className="text-xs text-text-muted opacity-30 font-mono">
                                ALTUS SYSTEM v2.0 • SECURE CONNECTION
                            </p>
                        </footer>
                    </div>
                </div>
                
                {/* AI Assistant FAB */}
                <AIChatButton />
            </main>
        </div>
    )
}
