'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, RefreshCcw, Mail, Check, AlertTriangle, Send } from 'lucide-react'
import { toast } from 'sonner'

type Template = {
    id: string
    type: 'welcome' | 'confirmation' | 'reminder'
    subject: string
    body: string
    active: boolean
}

export default function CommunicationsAdmin() {
    const supabase = createClient()
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedType, setSelectedType] = useState<string>('welcome')
    const [apiKey, setApiKey] = useState('') // Just for testing sending from UI

    useEffect(() => {
        fetchTemplates()
    }, [])

    async function fetchTemplates() {
        setLoading(true)
        const { data } = await supabase.from('email_templates').select('*')
        if (data) setTemplates(data as Template[])
        setLoading(false)
    }

    async function handleSave(template: Template) {
        const { error } = await supabase
            .from('email_templates')
            .update({ subject: template.subject, body: template.body, active: template.active })
            .eq('id', template.id)

        if (!error) {
            toast.success('Template salvo com sucesso!')
            fetchTemplates()
        } else {
            toast.error('Erro ao salvar template.')
        }
    }

    const currentTemplate = templates.find(t => t.type === selectedType)

    return (
        <div className="space-y-8 animate-fade-in p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-white">Comunicações</h2>
                    <p className="text-text-muted">Gerencie os templates de email automáticos do sistema.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Selector */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Templates</h3>
                    {['welcome', 'confirmation', 'reminder'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${selectedType === type
                                ? 'bg-neon-green text-bg-dark border-neon-green font-bold'
                                : 'bg-black/20 border-white/5 text-text-muted hover:bg-white/5'
                            }`}
                        >
                            <Mail size={18} />
                            <span className="capitalize">{type === 'welcome' ? 'Boas-vindas' : type === 'confirmation' ? 'Confirmação' : 'Lembrete'}</span>
                        </button>
                    ))}
                    
                    <div className="pt-8 border-t border-white/10 mt-8">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <h4 className="flex items-center gap-2 text-yellow-500 font-bold mb-2">
                                <AlertTriangle size={16} /> Configurações
                            </h4>
                            <p className="text-xs text-text-muted mb-2">
                                Para conectar o Resend, vá até a aba <b>Integrações</b>.
                            </p>
                            <a href="/admin/integrations" className="block bg-black/40 p-2 rounded text-xs text-neon-cyan hover:underline hover:text-white transition-colors">
                                Ir para Hub de Conectividade &rarr;
                            </a>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <RefreshCcw className="animate-spin text-neon-green" />
                        </div>
                    ) : currentTemplate ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white capitalize">{currentTemplate.type}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-muted">Status:</span>
                                    <button 
                                        onClick={() => handleSave({...currentTemplate, active: !currentTemplate.active})}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${currentTemplate.active ? 'bg-neon-green text-black' : 'bg-red-500/20 text-red-500'}`}
                                    >
                                        {currentTemplate.active ? 'ATIVO' : 'INATIVO'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-text-muted uppercase font-bold">Assunto</label>
                                <input
                                    aria-label="Assunto do Email"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-neon-green"
                                    value={currentTemplate.subject}
                                    onChange={e => {
                                        const newTemplates = templates.map(t => t.id === currentTemplate.id ? { ...t, subject: e.target.value } : t)
                                        setTemplates(newTemplates)
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-text-muted uppercase font-bold">Corpo do Email (HTML)</label>
                                <div className="text-xs text-text-secondary mb-2 flex gap-2">
                                    Variáveis disponíveis: <code className="bg-black/40 px-1 rounded">{'{name}'}</code> <code className="bg-black/40 px-1 rounded">{'{artist}'}</code> <code className="bg-black/40 px-1 rounded">{'{date}'}</code>
                                </div>
                                <textarea
                                    aria-label="Corpo do Email"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-neon-green h-64"
                                    value={currentTemplate.body}
                                    onChange={e => {
                                        const newTemplates = templates.map(t => t.id === currentTemplate.id ? { ...t, body: e.target.value } : t)
                                        setTemplates(newTemplates)
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => handleSave(currentTemplate)}
                                    className="px-6 py-3 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Salvar Alterações
                                </button>
                            </div>

                            {/* Preview Card */}
                            <div className="mt-8 p-6 bg-white rounded-xl text-black">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-2 border-b pb-2">PREVIEW (Simulação Visual)</p>
                                <div dangerouslySetInnerHTML={{ __html: currentTemplate.body.replace('{name}', 'Cliente Exemplo').replace('{artist}', 'Artista Exemplo').replace('{date}', '12/12/2024') }} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-text-muted py-12">Selecione um template ao lado.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
