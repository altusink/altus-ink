'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { connectMercadoPago, connectStripe, disconnectIntegration } from '@/app/actions/integrations'
import { toast } from 'sonner'

interface WizardProps {
    type: 'mercadopago' | 'stripe'
    isConnected: boolean
    onClose: () => void
}

export default function IntegrationWizard({ type, isConnected, onClose }: WizardProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form States
    const [mpToken, setMpToken] = useState('')
    const [stripePub, setStripePub] = useState('')
    const [stripeSecret, setStripeSecret] = useState('')

    async function handleConnect() {
        setLoading(true)
        setError(null)
        
        try {
            let result;
            if (type === 'mercadopago') {
                result = await connectMercadoPago(mpToken);
            } else {
                result = await connectStripe(stripePub, stripeSecret);
            }

            if (result.success) {
                toast.success('Conectado com Sucesso! 🚀');
                setStep(3) // Success Step
            } else {
                setError(result.error || 'Erro desconhecido');
                toast.error(result.error || 'Falha na conexão');
            }
        } catch (e) {
            setError('Erro de rede ou servidor.');
        } finally {
            setLoading(false)
        }
    }

    async function handleDisconnect() {
        if (!confirm('Tem certeza? Isso vai parar os pagamentos.')) return;
        setLoading(true);
        await disconnectIntegration(type);
        toast.info('Desconectado.');
        setLoading(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${type === 'mercadopago' ? 'blue' : 'purple'}-500/10 blur-[100px] pointer-events-none`} />

                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <X size={20} />
                </button>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-2xl ${type === 'mercadopago' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-heading">
                                {type === 'mercadopago' ? 'Conectar Mercado Pago' : 'Conectar Stripe'}
                            </h2>
                            <p className="text-text-muted">
                                {isConnected ? 'Gerenciar Conexão' : 'Configuração Segura'}
                            </p>
                        </div>
                    </div>

                    {/* Content Steps */}
                    <AnimatePresence mode="wait">
                        {/* STEP 1: INITIAL / DISCONNECT */}
                        {isConnected && step === 1 && (
                            <motion.div key="connected" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-6 text-center mb-6">
                                    <Check className="mx-auto text-neon-green mb-2" size={32} />
                                    <h3 className="text-lg font-bold text-white">Tudo Certo!</h3>
                                    <p className="text-sm text-text-muted">Sua conta está conectada e recebendo pagamentos.</p>
                                </div>
                                <button 
                                    onClick={handleDisconnect}
                                    disabled={loading}
                                    className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Desconectar Conta'}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 1: INPUT FORM (IF NOT CONNECTED) */}
                        {!isConnected && step === 1 && (
                            <motion.div key="form" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                {type === 'mercadopago' ? (
                                    <div>
                                        <label className="text-sm font-bold text-white mb-2 block">Access Token (Produção)</label>
                                        <input 
                                            type="password" 
                                            placeholder="APP_USR-..." 
                                            value={mpToken}
                                            onChange={e => setMpToken(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                                            aria-label="Access Token do Mercado Pago"
                                        />
                                        <p className="text-xs text-text-muted mt-2">
                                            Pegue em: <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Painel de Desenvolvedor</a>
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-sm font-bold text-white mb-2 block">Publishable Key</label>
                                            <input 
                                                type="text" 
                                                placeholder="pk_live_..." 
                                                value={stripePub}
                                                onChange={e => setStripePub(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors mb-4"
                                                aria-label="Chave Pública do Stripe"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-white mb-2 block">Secret Key</label>
                                            <input 
                                                type="password" 
                                                placeholder="sk_live_..." 
                                                value={stripeSecret}
                                                onChange={e => setStripeSecret(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                                                aria-label="Chave Secreta do Stripe"
                                            />
                                            <p className="text-xs text-text-muted mt-2">
                                                Pegue em: <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Stripe Dashboard</a>
                                            </p>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <button 
                                    onClick={handleConnect}
                                    disabled={loading || (type === 'mercadopago' ? !mpToken : (!stripePub || !stripeSecret))}
                                    className={`w-full py-4 text-bg-dark font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${type === 'mercadopago' ? 'bg-blue-400 hover:bg-blue-300' : 'bg-purple-400 hover:bg-purple-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Validar e Conectar'}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {!isConnected && step === 3 && (
                            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                                <div className="w-20 h-20 bg-neon-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,157,0.4)]">
                                    <Check size={40} className="text-black" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Conectado!</h3>
                                <p className="text-text-muted mb-8">O sistema já está pronto para processar pagamentos.</p>
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                                >
                                    Fechar Janela
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
