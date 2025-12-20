'use client'

import { useState } from 'react'
import { Mail, Phone, MoreHorizontal, Check, X, Tag as TagIcon, MessageSquare } from 'lucide-react'
import { updateClientStatus, updateClientNotes, updateClientTags } from '@/app/actions/crm'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function ClientCard({ client }: { client: Client }) {
    // Local State for optimism
    const [status, setStatus] = useState(client.whatsapp_status || 'untouched')
    const [notes, setNotes] = useState(client.notes || '')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    
    // Status Logic
    const statuses = [
        { id: 'untouched', label: 'Novo', color: 'text-blue-400' },
        { id: 'contacted', label: 'Contatado', color: 'text-yellow-400' },
        { id: 'customer', label: 'Cliente', color: 'text-neon-green' },
        { id: 'churned', label: 'Perdido', color: 'text-red-400' }
    ]

    async function handleStatusChange(newStatus: string) {
        setStatus(newStatus) // Optimistic
        const res = await updateClientStatus(client.id, newStatus)
        if (!res.success) {
            setStatus(client.whatsapp_status) // Revert
            toast.error('Erro ao atualizar status')
        } else {
            toast.success('Status atualizado')
        }
    }

    async function handleSaveNotes() {
        setIsEditingNotes(false)
        if (notes !== client.notes) {
            const res = await updateClientNotes(client.id, notes)
            if (res.success) toast.success('Nota salva')
            else toast.error('Erro ao salvar nota')
        }
    }

    // Toggle Tag (Mock usage for now, could be a full selector)
    async function handleToggleVip() {
        const currentTags = client.tags || []
        const isVip = currentTags.includes('vip')
        const newTags = isVip ? currentTags.filter(t => t !== 'vip') : [...currentTags, 'vip']
        
        const res = await updateClientTags(client.id, newTags)
        if(res.success) toast.success(isVip ? 'Removido VIP' : 'Marcado como VIP')
    }

    return (
        <motion.div layout className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-white/20 relative flex flex-col h-full">
            
            {/* Top Row: Initials & Quick Actions */}
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl font-bold text-white border border-white/10 shadow-lg">
                    {client.name.charAt(0).toUpperCase()}
                </div>
                
                <button 
                    onClick={handleToggleVip}
                    className={`p-2 rounded-full border transition-colors ${client.tags?.includes('vip') ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-transparent border-transparent text-white/20 hover:text-white hover:bg-white/10'}`}
                    title="Marcar como VIP"
                >
                    <TagIcon size={16} />
                </button>
            </div>

            {/* Basic Info */}
            <div className="mb-4 flex-grow">
                <h3 className="text-lg font-bold text-white mb-1 truncate" title={client.name}>{client.name}</h3>
                <div className="space-y-1">
                     <div className="flex items-center gap-2 text-xs text-text-muted hover:text-white transition-colors cursor-pointer" title="Copiar Email" onClick={() => { navigator.clipboard.writeText(client.email); toast.success('Email copiado'); }}>
                        <Mail size={12} />
                        <span className="truncate max-w-[200px]">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Phone size={12} />
                        {client.phone || '-'}
                    </div>
                </div>
            </div>

            {/* Notes Section (Editable) */}
            <div className="mb-4">
                {isEditingNotes ? (
                    <div className="relative">
                        <textarea 
                            autoFocus
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={handleSaveNotes}
                            className="w-full bg-black/40 border border-neon-green/50 rounded-lg p-2 text-xs text-white min-h-[60px] outline-none resize-none"
                            placeholder="Adicione uma nota..."
                        />
                        <button onMouseDown={handleSaveNotes} className="absolute bottom-2 right-2 text-neon-green px-2 py-1 bg-black/50 rounded text-[10px] font-bold">SALVAR</button>
                    </div>
                ) : (
                    <div 
                        onClick={() => setIsEditingNotes(true)}
                        className={`group/notes p-3 rounded-lg border border-dashed transition-all cursor-text min-h-[40px] flex items-start gap-2 ${notes ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/5 border-white/10 hover:border-white/30'}`}
                    >
                        <MessageSquare size={12} className={`mt-0.5 ${notes ? 'text-yellow-500/50' : 'text-white/20'}`} />
                        <p className={`text-xs ${notes ? 'text-yellow-200/80' : 'text-white/30 italic'}`}>
                            {notes || 'Clique para adicionar nota...'}
                        </p>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 py-3 border-t border-white/10 mb-2">
                <div>
                   <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Total Gasto</p>
                   <p className="text-sm font-bold text-neon-green">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(client.total_spent || 0)}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Bookings</p>
                   <p className="text-sm font-bold text-white">{client.total_bookings}</p>
                </div>
            </div>

            {/* Status Selector */}
            <div className="relative">
                <select 
                    value={status} 
                    onChange={(e) => handleStatusChange(e.target.value)}
                    aria-label="Status do Cliente"
                    className={`w-full appearance-none bg-black/20 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs font-bold uppercase outline-none cursor-pointer hover:border-white/20 transition-colors ${statuses.find(s => s.id === status)?.color}`}
                >
                    {statuses.map(s => (
                        <option key={s.id} value={s.id} className="text-black">{s.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className={`w-2 h-2 rounded-full ${statuses.find(s => s.id === status)?.color.replace('text-', 'bg-')}`} />
                </div>
            </div>

        </motion.div>
    )
}
