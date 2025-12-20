'use client'

import { useState, useEffect } from 'react'
import { Check, AlertCircle, ExternalLink, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react'
import IntegrationWizard from '@/components/admin/IntegrationWizard'
import { getSystemSettings } from '@/app/actions/settings' // We can reuse this to verify connection status
import { Toaster } from 'sonner'

export default function IntegrationsPage() {
    const [wizardData, setWizardData] = useState<{ type: 'mercadopago' | 'stripe', isConnected: boolean } | null>(null)
    
    // Status State
    const [status, setStatus] = useState({
        mp: false,
        stripe: false,
        url: false
    })

    useEffect(() => {
        checkStatus()
    }, [wizardData]) // Re-check when wizard closes/updates

    async function checkStatus() {
        // We fetch settings to check for 'mp_connected' and 'stripe_connected' keys
        const data = await getSystemSettings()
        const mp = data.find(s => s.key === 'mp_connected')?.value === 'true'
        const stripe = data.find(s => s.key === 'stripe_connected')?.value === 'true'
        // Env var check for URL (still needed from server side or expose via settings?) 
        // For now let's assume URL is fine or we check client side loc.
        setStatus({ mp, stripe, url: true }) 
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold font-heading mb-2 text-white">Integrações & Pagamentos</h2>
                    <p className="text-text-muted">Conecte suas contas para automatizar o financeiro.</p>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Mercado Pago */}
                <div className={`group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 ${status.mp ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-400/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
                                <ShieldCheck size={32} />
                            </div>
                            {status.mp ? (
                                <span className="px-4 py-1.5 rounded-full bg-neon-green/20 text-neon-green text-xs font-bold border border-neon-green/30 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                                    ATIVO
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 rounded-full bg-white/10 text-text-muted text-xs font-bold border border-white/10">
                                    DESCONECTADO
                                </span>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold mb-2 text-white">Mercado Pago</h3>
                        <p className="text-text-muted mb-8 max-w-sm">
                            Pagamentos instantâneos via PIX com baixa automática e QR Code dinâmico.
                        </p>

                        <button 
                            onClick={() => setWizardData({ type: 'mercadopago', isConnected: status.mp })}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status.mp ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20'}`}
                        >
                            {status.mp ? 'Gerenciar Conexão' : 'Conectar Agora'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. Stripe */}
                <div className={`group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 ${status.stripe ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl">
                                <CreditCard size={32} />
                            </div>
                            {status.stripe ? (
                                <span className="px-4 py-1.5 rounded-full bg-neon-green/20 text-neon-green text-xs font-bold border border-neon-green/30 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                                    ATIVO
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 rounded-full bg-white/10 text-text-muted text-xs font-bold border border-white/10">
                                    DESCONECTADO
                                </span>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold mb-2 text-white">Stripe Europe</h3>
                        <p className="text-text-muted mb-8 max-w-sm">
                            Aceite cartões internacionais, Apple Pay, Google Pay e pagamentos em Euro.
                        </p>

                        <button 
                            onClick={() => setWizardData({ type: 'stripe', isConnected: status.stripe })}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${status.stripe ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20'}`}
                        >
                            {status.stripe ? 'Gerenciar Conexão' : 'Conectar Agora'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Helper Info */}
            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-full">
                    <ExternalLink size={24} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold text-white mb-1">Webhook URL</h4>
                    <p className="text-sm text-text-muted">
                        Para receber avisos automáticos de pagamento, configure esta URL nos painéis do Mercado Pago e Stripe:
                    </p>
                </div>
                <code className="bg-black/50 border border-white/10 px-4 py-3 rounded-lg text-neon-blue font-mono text-sm select-all">
                    https://altus-ink-v2.vercel.app/api/webhooks
                </code>
            </div>

            {/* Wizard Modal */}
            {wizardData && (
                <IntegrationWizard 
                    type={wizardData.type} 
                    isConnected={wizardData.isConnected} 
                    onClose={() => setWizardData(null)} 
                />
            )}

            <Toaster position="top-right" theme="dark" />
        </div>
    );
}
