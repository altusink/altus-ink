import { createClient } from '@/lib/supabase/client'


// Define the Tool Structure for Gemini
export const toolsDefinition = [
    {
        name: "list_bookings",
        description: "Lista agendamentos recentes ou filtra por status. Use para saber o que tem na agenda.",
        parameters: {
            type: "object",
            properties: {
                status: { type: "string", enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], description: "Filtrar por status" },
                limit: { type: "number", description: "Limite de resultados (padrão 5)" }
            }
        }
    },
    {
        name: "get_booking_details",
        description: "Busca detalhes completos de um agendamento pelo ID ou nome do cliente.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "ID do agendamento ou Nome do Cliente" }
            },
            required: ["query"]
        }
    },
    {
        name: "check_availability",
        description: "Verifica se um artista tem horário livre em uma data específica.",
        parameters: {
            type: "object",
            properties: {
                artist_name: { type: "string", description: "Nome do artista (ex: Danilo)" },
                date: { type: "string", description: "Data no formato YYYY-MM-DD" }
            },
            required: ["artist_name", "date"]
        }
    }
];

// Implementation of the tools
export const toolsImplementation = {
    async list_bookings({ status, limit = 5 }: { status?: string, limit?: number }) {
        const supabase = createClient() // Using client because this runs in the route context
        
        let query = supabase
            .from('bookings')
            .select('id, client_name, tattoo_type, status, date, artist_id, artists(stage_name)')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        
        if (error) return `Erro ao buscar agenda: ${error.message}`
        if (!data || data.length === 0) return "Nenhum agendamento encontrado."

        return JSON.stringify(data.map(b => ({
            client: b.client_name,
            artist: (b.artists as any)?.stage_name || 'N/A',
            type: b.tattoo_type,
            status: b.status,
            date: b.date || 'Data a definir'
        })), null, 2)
    },

    async get_booking_details({ query }: { query: string }) {
        const supabase = createClient()
        
        // Try searching by UUID first
        let { data, error } = await supabase
            .from('bookings')
            .select('*, artists(stage_name)')
            .eq('id', query)
            .single()

        // If not found or invalid UUID, try searching by name (ilike)
        if (!data) {
             const search = await supabase
                .from('bookings')
                .select('*, artists(stage_name)')
                .ilike('client_name', `%${query}%`)
                .limit(1)
                .single()
            
            data = search.data
        }

        if (!data) return `Não encontrei nenhum agendamento para "${query}".`
        return JSON.stringify(data, null, 2)
    },

    async check_availability({ artist_name, date }: { artist_name: string, date: string }) {
        // Placeholder logic - In a real system, would check 'slots' table
        return `Verifiquei a agenda de ${artist_name} para ${date}. 
        Existem 3 horários livres na parte da tarde. (Simulação)`
    }
}
