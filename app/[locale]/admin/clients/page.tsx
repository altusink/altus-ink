import { createClient } from '@/lib/supabase/server'
import { Search, User } from 'lucide-react'
import ClientCard from '@/components/admin/ClientCard'
import { Toaster } from 'sonner' // Ensure toaster is present for the client components

export const dynamic = 'force-dynamic'

type Client = {
    id: string
    email: string
    name: string
    phone: string | null
    whatsapp_status: string
    tags: string[] | null
    notes: string | null
    total_spent: number
    total_bookings: number
    last_visit: string | null
    created_at: string
}

export default async function ClientsPage() {
    const supabase = await createClient()

    // Fetch from real CRM table
    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .order('last_visit', { ascending: false })

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white font-heading">Base de Clientes (CRM)</h2>
                    <p className="text-text-muted">
                        Total de <strong>{clients?.length || 0}</strong> clientes cadastrados.
                    </p>
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients?.map((client) => (
                    <ClientCard key={client.id} client={client} />
                ))}

                {(!clients || clients.length === 0) && (
                    <div className="col-span-full p-12 text-center text-text-muted border border-dashed border-white/10 rounded-3xl">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="mb-2">Nenhum cliente na base CRM.</p>
                        <p className="text-xs opacity-50">Os clientes aparecerão aqui automaticamente após agendarem.</p>
                    </div>
                )}
            </div>
            
            <Toaster position="top-right" theme="dark" />
        </div>
    )
}
