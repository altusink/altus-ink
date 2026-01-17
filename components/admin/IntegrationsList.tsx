'use client'

import { useState, useEffect } from 'react'
import { adminOS } from '@/lib/services/admin-os'
import { IntegrationService } from '@/lib/types/admin'
import { Check, X, Loader2, CreditCard, Mail, Bot, Smartphone, Settings, Calendar, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const ICONS: Record<string, any> = {
    stripe: CreditCard,
    mercadopago: CreditCard, // Added MP
    resend: Mail,
    gemini: Bot,
    chatwoot: Smartphone,
    google_calendar: Calendar,
    evolution_api: Smartphone // Reusing Smartphone or adding QrCode icon if available
}

// ... inside component ...


const SUPPORTED_SERVICES = [
    { id: 'stripe', name: 'Stripe', description: 'Processamento de pagamentos globais.' },
    { id: 'mercadopago', name: 'Mercado Pago', description: 'Pagamentos via Pix e Cartão no Brasil.' },
    { id: 'resend', name: 'Resend', description: 'Infraestrutura de e-mail transacional.' },
    { id: 'evolution_api', name: 'Evolution API', description: 'WhatsApp Automático e QR Code.' },
    { id: 'google_calendar', name: 'Google Calendar', description: 'Sincronização de agenda.' },
    { id: 'chatwoot', name: 'Chatwoot', description: 'CRM de Atendimento.' },
    { id: 'gemini', name: 'Google Gemini', description: 'Inteligência Artificial do Assistente.' }
]

export default function IntegrationsList() {
    const [services, setServices] = useState<IntegrationService[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState<string | null>(null)
    
    // For editing keys
    const [apiKey, setApiKey] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadIntegrations()
    }, [])

    async function loadIntegrations() {
        try {
            const dbServices = await adminOS.getIntegrations()
            
            // Merge DB data with Supported List
            const merged = SUPPORTED_SERVICES.map(idx => {
                const found = dbServices.find(s => s.service_id === idx.id)
                return {
                    service_id: idx.id,
                    name: idx.name,
                    is_active: found ? found.is_active : false,
                    status: found ? found.status : 'disconnected',
                    config: found ? found.config : null,
                    last_sync: found ? found.last_sync : null
                } as IntegrationService
            })
            
            setServices(merged)
        } catch (error) {
            console.error(error)
            toast.error('Erro ao carregar integrações')
        } finally {
            setLoading(false)
        }
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        // Optimistic update
        setServices(prev => prev.map(s => s.service_id === id ? { ...s, is_active: !currentStatus } : s))
        
        try {
            await adminOS.toggleIntegration(id, !currentStatus)
            toast.success('Status atualizado')
        } catch (error) {
            toast.error('Erro ao atualizar')
            // Revert
            setServices(prev => prev.map(s => s.service_id === id ? { ...s, is_active: currentStatus } : s))
        }
    }

    async function handleSaveConfig() {
        if (!selectedService) return
        setSaving(true)
        try {
            let finalConfig: any = { apiKey }
            
            // Special handling for Google (Parse JSON)
            if (selectedService === 'google_calendar' || selectedService === 'evolution_api') {
                try {
                    const json = JSON.parse(apiKey)
                    if (selectedService === 'google_calendar') {
                        finalConfig = { 
                            client_email: json.client_email,
                            private_key: json.private_key,
                            project_id: json.project_id
                        }
                    } else {
                         // Evolution API
                         finalConfig = {
                             baseUrl: json.baseUrl,
                             token: json.token,
                             instanceName: json.instanceName
                         }
                    }
                } catch (e) {
                    toast.error('JSON inválido. Cole o objeto de configuração correto.')
                    setSaving(false)
                    return
                }
            }

            await adminOS.updateIntegrationConfig(selectedService, finalConfig)
            toast.success('Configuração salva com sucesso!')
            setApiKey('')
            setSelectedService(null)
            loadIntegrations() // Reload to see 'connected' status
        } catch (error) {
            toast.error('Erro ao salvar configuração')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-neon-cyan animate-pulse">Carregando Hub de Integrações...</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white font-heading mb-6">Hub de Conectividade</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {services.map(service => {
                    const Icon = ICONS[service.service_id] || Settings
                    const isConnected = service.status === 'connected'
                    
                    return (
                        <div 
                            key={service.service_id}
                            className={`
                                relative p-6 rounded-2xl border transition-all duration-300
                                ${service.is_active ? 'bg-white/5 border-neon-green/30 shadow-[0_0_20px_-10px_rgba(0,255,157,0.3)]' : 'bg-black/40 border-white/5 opacity-70 grayscale'}
                            `}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${service.is_active ? 'bg-neon-green/10 text-neon-green' : 'bg-white/5 text-white/50'}`}>
                                        <Icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{service.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-red-500 animate-pulse'}`} />
                                            <span className="text-xs text-text-muted uppercase tracking-wider">
                                                {isConnected ? 'Conectado' : 'Desconectado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={service.is_active}
                                        onChange={() => handleToggle(service.service_id, service.is_active)}
                                        aria-label={`Ativar integração com ${service.name}`}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
                                </label>
                            </div>

                            <p className="text-sm text-text-muted mb-6 h-10">
                                {getDescription(service.service_id)}
                            </p>

                            <button 
                                onClick={() => {
                                    setSelectedService(service.service_id)
                                    setApiKey('')
                                }}
                                disabled={!service.is_active}
                                className="w-full pym-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                type="button"
                            >
                                {isConnected ? 'Gerenciar Chaves' : 'Configurar'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Config Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-bg-dark border border-white/10 rounded-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setSelectedService(null)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white"
                            aria-label="Fechar"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-2">
                           Configurar {services.find(s => s.service_id === selectedService)?.name}
                        </h3>
                        <p className="text-sm text-text-muted mb-6">
                            Insira sua chave de API (Secret Key) para conectar este serviço.
                        </p>

                                {selectedService === 'evolution_api' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">Base URL</label>
                                            <input 
                                                value={apiKey} // We might need a separate state or split the string. For simplicity: JSON.
                                                onChange={(e) => setApiKey(e.target.value)} 
                                                placeholder='{ "baseUrl": "https://api...", "token": "..." }'
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-neon-green outline-none hidden"
                                            />
                                            <div className="text-sm text-text-muted mb-2">Cole o JSON de configuração da sua Instância:</div>
                                            <textarea 
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                placeholder='{ "instanceName": "altus", "token": "xyz", "baseUrl": "https://evolution..." }'
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-neon-green outline-none h-32 resize-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                                            {selectedService === 'google_calendar' ? 'Service Account JSON' : 'API Secret Key'}
                                        </label>
                                        <textarea 
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder={selectedService === 'google_calendar' ? '{ "type": "service_account", ... }' : 'sk_live_...'}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-neon-green outline-none h-32 resize-none"
                                        />
                                    </div>
                                )}

                            <button 
                                onClick={handleSaveConfig}
                                disabled={!apiKey || saving}
                                className="w-full py-3 bg-neon-green text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin" size={18} />}
                                {saving ? 'Verificando...' : 'Conectar Serviço'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
    )
}

function getDescription(id: string) {
    switch (id) {
        case 'stripe': return 'Processamento de pagamentos globais, checkout transparente e gestão de assinaturas.'
        case 'gemini': return 'O cérebro da IA. Permite que o assistente virtual realize ações complexas no banco de dados.'
        case 'resend': return 'Infraestrutura de e-mail transacional para confirmações e notificações de alta entregabilidade.'
        case 'chatwoot': return 'CRM de WhatsApp e Omni-channel para atendimento e suporte ao cliente.'
        case 'google_calendar': return 'Sincronização automática de agendamentos com sua Agenda Google principal.'
        default: return 'Integração de serviço externo.'
    }
}
