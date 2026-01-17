

import { createClient } from '@/lib/supabase/server'
import ArtistsManager from '@/components/admin/ArtistsManager'

import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ArtistsAdminPage() {
    const supabase = await createClient()

    // --- SECURITY: Double-Lock ---
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!userProfile?.role || userProfile.role === 'USER') redirect('/')
    // -----------------------------

    const { data: artists } = await supabase.from('artists').select('*').order('created_at', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Gestão de Artistas</h2>
                    <p className="text-text-muted">Adicione ou edite os membros da equipe Altus Ink.</p>
                </div>
            </div>

            <ArtistsManager initialArtists={artists || []} />
        </div>
    )
}
