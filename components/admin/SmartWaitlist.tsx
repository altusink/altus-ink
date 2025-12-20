'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Clock, User, Calendar, Trash2, Smartphone, Loader2, Sparkles, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

// Mock Data (until DB is ready)
const MOCK_WAITLIST = [
    { id: 1, name: 'Juliana Paes', phone: '+351 912 345 678', artist: 'Alex Artist', notes: 'Pode qualquer terça-feira.', since: 'Há 2 dias' },
    { id: 2, name: 'Marcos Mion', phone: '+351 912 345 678', artist: 'Alex Artist', notes: 'Quer fechar o braço.', since: 'Há 5 dias', highHighValue: true },
    { id: 3, name: 'Anitta', phone: '+351 912 345 678', artist: 'Sarah Ink', notes: 'Só tem agenda pra Dezembro.', since: 'Há 1 semana' },
]

export default function SmartWaitlist() {
    const [leads, setLeads] = useState<any[]>([])
    const [notifying, setNotifying] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchWaitlist()
    }, [])

    function fetchWaitlist() {
        // Real Time Subscription could be added here
        supabase.from('waitlist').select('*').order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (data) setLeads(data)
                if (error) toast.error("Erro ao carregar Waitlist")
            })
    }

    const handleNotify = async (id: string) => {
        setNotifying(id)

        // Optimize: Call Backend API to send Email/WhatsApp
        // For now, simulate + update DB
        const { error } = await supabase.from('waitlist').update({ is_notified: true }).eq('id', id)

        if (!error) {
            toast.success('Mensagem enviada via WhatsApp!', {
                description: 'O cliente recebeu o link para agendamento prioritário.'
            })
            fetchWaitlist()
        } else {
            toast.error("Erro ao atualizar status.")
        }
        setNotifying(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
                        Smart Waitlist <Sparkles className="text-neon-cyan" size={20} />
                    </h2>
                    <p className="text-text-muted text-sm">Gerenciamento inteligente de fila de espera. Recupere receita perdida.</p>
                </div>
            </div>

            <div className="grid gap-4">
                <AnimatePresence>
                    {leads.map((lead) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className={`bg-bg-card/50 border ${lead.is_notified ? 'border-green-500/30 bg-green-500/5' : 'border-white/5'} rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 group`}
                        >
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lead.is_notified ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-text-muted'}`}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white">{lead.client_name}</h3>
                                        {lead.desired_schedule && <span className="bg-neon-cyan/10 text-neon-cyan text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">High Intent</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-text-muted mt-0.5">
                                        <span className="flex items-center gap-1"><Smartphone size={12} /> {lead.contact}</span>
                                    </div>
                                    <p className="text-xs text-text-muted mt-2 italic">"{lead.notes || 'Sem observações'}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleNotify(lead.id)}
                                    disabled={notifying === lead.id || lead.is_notified}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl font-bold transition-all disabled:opacity-50 ${lead.is_notified
                                        ? 'bg-transparent border-green-500/30 text-green-500'
                                        : 'bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border-neon-green/20'
                                        }`}
                                >
                                    {notifying === lead.id ? <Loader2 className="animate-spin" size={18} /> : (lead.is_notified ? <CheckCircle size={18} /> : <Bell size={18} />)}
                                    {lead.is_notified ? 'Notificado' : 'Notificar Vaga'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {leads.length === 0 && (
                    <div className="text-center py-12 text-text-muted border-2 border-dashed border-white/5 rounded-2xl">
                        <Clock className="mx-auto mb-3 opacity-20" size={48} />
                        <p>Ninguém na fila de espera por enquanto.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
