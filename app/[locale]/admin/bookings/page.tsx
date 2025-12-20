import { createClient } from '@/lib/supabase/server'
import BookingsManager from '@/components/admin/BookingsManager'
import SmartGapFinder from '@/components/admin/coordinator/SmartGapFinder'
import SmartWaitlist from '@/components/admin/SmartWaitlist'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
    const supabase = await createClient()

    // Fetch Bookings with Artist Data
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            artists (
                stage_name
            )
        `)
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user role (Security Check)
    let userRole = 'USER'
    if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
        userRole = profile?.role?.toUpperCase() || 'USER'
    } else {
        redirect('/login')
    }

    // --- SECURITY: Double-Lock ---
    if (userRole === 'USER') {
        redirect('/')
    }
    // -----------------------------

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white font-heading">Gerenciar Agendamentos</h2>
                    <p className="text-text-muted">Acompanhe todos os pedidos de tatuagem.</p>
                </div>
            </div>

            {/* AI Intelligence: Gap Finder & Waitlist */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
                    <SmartGapFinder />
                </div>
                <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
                    <SmartWaitlist />
                </div>
            </div>

            {/* Client Component for Interaction */}
            <BookingsManager bookings={bookings || []} userRole={userRole} />
        </div>
    )
}
