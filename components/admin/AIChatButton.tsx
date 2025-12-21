'use client'

import { useState } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import AIChat from './AIChat'

export default function AIChatButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* The Chat Window (Fixed Overlay) */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 w-96 h-[500px] z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <AIChat onClose={() => setIsOpen(false)} />
                </div>
            )}

            {/* The Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg transition-all duration-300
                    hover:scale-110 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]
                    group flex items-center justify-center
                    ${isOpen ? 'bg-bg-dark border border-neon-cyan text-neon-cyan rotate-90' : 'bg-neon-cyan text-bg-dark'}
                `}
                aria-label={isOpen ? "Fechar Assistente IA" : "Abrir Assistente IA"}
                title={isOpen ? "Fechar Assistente" : "Falar com AI CTO"}
                type="button"
            >
                {isOpen ? (
                     <Sparkles size={24} />
                ) : (
                    <Bot size={28} className="group-hover:animate-pulse" />
                )}
                
                {/* Notification Badge (Optional logic could go here) */}
                {!isOpen && (
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border border-bg-dark" />
                )}
            </button>
        </>
    )
}
