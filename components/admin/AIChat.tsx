'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
    timestamp: Date
}

export default function AIChat({ onClose }: { onClose?: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            content: 'Olá! Sou o **Altus AI CTO**. Posso ajudar com análises, criar tours ou gerenciar agendamentos. Qual a ordem de hoje?',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    async function handleSend() {
        if (!input.trim() || loading) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            // Prepare context (last 5 messages)
            const context = messages.slice(-5).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                content: m.content
            }))

            const res = await fetch('/api/ai/admin-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content, context })
            })

            const data = await res.json()

            if (!data.success) throw new Error(data.error)

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: data.message,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            toast.error('Erro na IA: Verifique a chave da API no menu Integrações.')
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: '⚠️ **Erro de Conexão**: Não consegui falar com o Gemini. Verifique se a chave de API está configurada em *Admin > Integrações*.',
                timestamp: new Date()
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-bg-dark border border-neon-cyan/20 rounded-2xl overflow-hidden shadow-[0_0_50px_-20px_rgba(0,255,255,0.2)]">
            {/* Header */}
            <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm font-heading">Altus CTO</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                            <span className="text-[10px] text-neon-green font-mono uppercase tracking-wider">Online & Ready</span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="text-text-muted hover:text-white transition-colors"
                        aria-label="Fechar Chat"
                        title="Fechar"
                        type="button"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20 shrink-0 mt-1">
                                <Sparkles size={14} className="text-neon-cyan" />
                            </div>
                        )}
                        
                        <div 
                            className={`
                                max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                                ${msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white/5 border border-white/10 text-text-primary rounded-bl-none prose prose-invert prose-sm'
                                }
                            `}
                        >
                            {msg.role === 'ai' ? (
                                // Simplistic markdown render (would ideally use react-markdown)
                                <div dangerouslySetInnerHTML={{ 
                                    __html: msg.content
                                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                                        .replace(/\n/g, '<br/>') 
                                }} />
                            ) : (
                                msg.content
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                <User size={14} className="text-white" />
                            </div>
                        )}
                    </div>
                ))}
                
                {loading && (
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20 shrink-0">
                                <Loader2 size={14} className="text-neon-cyan animate-spin" />
                        </div>
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none">
                            <span className="text-xs text-text-muted animate-pulse">Pensando...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-black/40 border-t border-white/10">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative"
                >
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite um comando..."
                        className="w-full bg-black/50 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-neon-cyan outline-none transition-all placeholder:text-white/20"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 p-1.5 bg-neon-cyan hover:bg-neon-cyan/80 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Enviar mensagem"
                        title="Enviar"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    )
}
